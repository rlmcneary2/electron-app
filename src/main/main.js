"use strict";


// This file will be executed in the main process (the Node.js environment). It
// constructs the UI portion of the application that will be displayed using
// Chromium (the renderer process).


const app = require("electron").app;
const BrowserWindow = require("electron").BrowserWindow;
const path = require("path");
const rendererEvents = require("./rendererEvents");


const _MAIN_CONFIG_OUTPUT_FILE = "mainConfig.json";
const _RENDER_CONFIG_OUTPUT_FILE = "renderConfig.json";


process.env.ELECTRON_HIDE_INTERNAL_MODULES = "true";


const _args = {};
process.argv.forEach(arg => {
    if (arg[0] !== "-" || arg.startsWith("--")) {
        return;
    }

    const equalsIndex = arg.indexOf("=");
    if (1 < equalsIndex) {
        _args[arg.substring(1, equalsIndex)] = arg.substring(equalsIndex + 1);
    } else if (equalsIndex < 0) {
        _args[arg.substring(1)] = undefined;
    }
});


let window;
app
    .on("ready", () => {
        let mainConfig;
        try {
            mainConfig = require(`./${_MAIN_CONFIG_OUTPUT_FILE}`);
        } catch (err) {
            console.log(`W-- main config file: ${err.message || JSON.stringify(err)}`);
            mainConfig = {};
        }

        createMainWindow(mainConfig);
        rendererEvents.connect();
    })
    .on("window-all-closed", () => {
        app.quit();
    });


function createMainWindow(mainConfig) {
    const options = {
        autoHideMenuBar: true,
        fullscreenable: true,
        useContentSize: true,
        webPreferences: {
            textAreasAreResizable: true
        }
    };

    window = new BrowserWindow(options);
    window.on("closed", () => {
        window = null;
    });

    initDevTools(window, mainConfig);

    const query = createRenderQuery();
    const url = `file://${path.join(__dirname, "index.html")}${query}`;
    console.log(`d-- loading URL: ${url}`);
    window.loadURL(url);
}

function createRenderQuery() {
    let renderConfig;
    try {
        renderConfig = require(`./${_RENDER_CONFIG_OUTPUT_FILE}`);
    } catch (err) {
        console.log(`W-- render config file: ${err.message || JSON.stringify(err)}`);
        renderConfig = {};
    }

    let query = "";
    const rconfigKeys = Object.keys(renderConfig);
    if (0 < rconfigKeys.length) {
        query = "?" + rconfigKeys
            .map(key => {
                return `${fixedEncodeURIComponent(key)}=${fixedEncodeURIComponent(renderConfig[key])}`;
            })
            .join("&");
    }

    return query;
}

function fixedEncodeURIComponent(value) {
    return encodeURIComponent(value).replace(/[!'()*]/g, c => {
        return "%" + c.charCodeAt(0).toString(16);
    });
}

function initDevTools(window, mainConfig) {
    if (!_args.hasOwnProperty("dev-tools")) {
        return;
    }

    let showDevTools = true;
    if (mainConfig.hasOwnProperty("devTools") && !mainConfig.devTools) {
        showDevTools = false;
    }

    if (showDevTools) {
        window.toggleDevTools();
    }
}
