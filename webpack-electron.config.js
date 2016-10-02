"use strict";


const config = require("./webpack.config.js");
const webpackTargetElectronRenderer = require("webpack-target-electron-renderer");


config.target = webpackTargetElectronRenderer(config);
module.exports = config;
