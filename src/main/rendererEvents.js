"use strict";


const fs = require("fs");
const ipc = require("electron").ipcMain;
const ipcShared = require("./ipcShared");

module.exports = {

    asyncRequestChannelName: "async-renderer-event",

    connect: () => {
        ipc.on(ipcShared.asyncRequestChannelName, (evt, args) => {
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
                    console.log(`rendererEvents - no handler for type '${args.type}'.`);
                    break;
            }
        });
    }

};


function log(evt, args) {
    if (args && args.data) {
        console.log(`${args.data.type} ${args.data.message}`);
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
                evt.sender.send(ipcShared.asyncResponseChannelName, { id: args.id, chunk });
            })
            .on("end", () => {
                resolve();
            })
            .on("error", (err) => {
                reject(err);
            });
    })
        .then(() => {
            evt.sender.send(ipcShared.asyncResponseChannelName, Object.assign({}, args));
        })
        .catch(err => {
            evt.sender.send(ipcShared.asyncResponseChannelName, Object.assign({ error: err }, args));
        });
}
