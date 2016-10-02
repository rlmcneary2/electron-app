"use strict";


const ipcRenderer = require("electron").ipcRenderer;
const ipcShared = require("../ipcShared");


let _asyncResponseConnected = false;
const _requests = new Map();
let _requestId = 0;


module.exports = {

    log: (message, messageType = "   ") => {
        const r = createRequest("log", { message, type: messageType });
        sendRequest(r);
    },

    readTextFile: (name, callback) => {
        const request = createRequest("read-text-file", { name });

        const chunks = [];
        return new Promise((resolve, reject) => {
            // This function will be passed to the request and used to
            // resolve the request when the entire file has been read.
            const resolver = () => {
                // If the caller of readTextFile provided a callback that means
                // as chunks were read they were passed back to the caller, all
                // we need to do in this case is resolve.
                if (callback) {
                    resolve();
                } else {
                    // No callback was provided, resolve and return the entire
                    // file at once.
                    resolve(chunks.join(""));
                }
            };

            const callbacker = args => {
                if (callback) {
                    callback(args.chunk);
                } else {
                    chunks.push(args.chunk);
                }

                // Return false when all the file contents have been read (i.e.
                // args does not have a chunk property).
                return !args.chunk;
            };

            _requests.set(request.id, { resolve: resolver, reject, callback: callbacker });
            sendRequest(request);
        });

    }

};


function createRequest(type, data) {
    const request = { id: _requestId++, type };
    if (data) {
        request.data = data;
    }

    return request;
}

function onAsyncResponse(evt, args) {
    if (!_requests.has(args.id)) {
        return;
    }

    // Requests that have an async response must provide "resolve" and "reject"
    // properties each with a function value that will be invoked when the
    // request is finished. The event args will be passed to the function and
    // if rejecting an error property with the error.
    const request = _requests.get(args.id);

    // If there is a request callback and it returns false the request is not
    // finished yet. This might happen in a case where the request reads data
    // in chunks.
    if (request.callback && !request.callback(args)) {
        return;
    }

    _requests.delete(args.requestId);

    if (args.error) {
        request.reject({ args, error: args.error, message: args.error.message });
    } else {
        request.resolve(args);
    }
}

function sendRequest(request) {
    if (!_asyncResponseConnected) {
        _asyncResponseConnected = true;
        ipcRenderer.on("async-event-response", onAsyncResponse);
    }

    ipcRenderer.send(ipcShared.asyncRequestChannelName, request);
}
