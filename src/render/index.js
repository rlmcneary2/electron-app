"use strict";


// This file will be the first code executed in the renderer process (Chromium
// V8 environment). It creates the root React component.


const actions = require("./action/actions");
const constants = require("../constants");
const ipc = require("../main/renderer/ipc");
const React = require("react");
const ReactContent = require("./view/ReactContent.jsx");
const ReactDOM = require("react-dom");
const reducers = require("./reducer/reducers");
const redux = require("redux");
const reduxThunk = require("redux-thunk").default;
const url = require("url");


const _query = url.parse(window.location.href, true).query;
const _startupDelayMs = _query["app-startup-delay"] ? _query["app-startup-delay"] : 0;


setTimeout(() => {
    ipc.log("index.js - started.", "iii");

    const thunk = redux.applyMiddleware(reduxThunk);
    const store = redux.createStore(reducers, thunk);

    // Loading language information early is a good idea.
    store.dispatch(actions.localeChanged(_query["current-locale"] || constants.DefaultLocale));

    // Use the query to configure the application after updateLocale resolves.

    const content = React.createElement(ReactContent, { store });
    ReactDOM.render(content, document.getElementById("react-content"));
}, _startupDelayMs);
