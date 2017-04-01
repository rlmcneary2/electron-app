"use strict";


const constants = require("./constants");
const fs = require("fs");
const ipc = require("electron").ipcMain;


module.exports = {

    connect: () => {
        ipc.on(constants.AsyncRequestChannelName, (evt, args) => {
            switch (args.type) {
                case "log": {
                    log(evt, args);
                    break;
                }

                case "read-text-file": {
                    readTextFile(evt, args);
                    break;
                }

                default:
                    console.log(`rendererEvents - no handler for type '${args.type}'.`); // eslint-disable-line no-console
                    break;
            }
        });
    }

};


function log(evt, args) {
    if (args && args.data) {
        console.log(`${args.data.type} ${args.data.message}`); // eslint-disable-line no-console
    }
}

function readTextFile(evt, args) {
    // args = { data:{ name:"file.name" }, id:1, type:"read-file" }

    return new Promise((resolve, reject) => {
        if (!args || !args.data || !args.data.name) {
            throw "No file name to read.";
        }

        const name = args.data.name;
        fs.createReadStream(name, { encoding: "utf-8" })
            .on("data", (chunk) => {
                evt.sender.send(constants.AsyncResponseChannelName, { id: args.id, chunk });
            })
            .on("end", () => {
                resolve();
            })
            .on("error", (err) => {
                reject(err);
            });
    })
        .then(() => {
            evt.sender.send(constants.AsyncResponseChannelName, Object.assign({}, args));
        })
        .catch(err => {
            evt.sender.send(constants.AsyncResponseChannelName, Object.assign({ error: err }, args));
        });
}
