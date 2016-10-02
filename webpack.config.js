"use strict";


const constants = require("./buildConstants");
const path = require("path");
const webpack = require("webpack");


module.exports = {
    debug: true,
    devtool: "source-maps",
    entry: `.${path.sep}${path.join(constants.srcRender, constants.appEntryFile)}`,
    module: {
        loaders: [
            {
                include: [
                    path.resolve(__dirname, constants.srcRender),
                    path.resolve(__dirname, path.join(constants.srcMain, "renderer/ipc.js"))
                ],
                loader: "babel",
                query: {
                    plugins: ["transform-runtime"],
                    presets: ["es2015", "stage-0", "react"],
                    retainLines: true,
                },
                test: /\.jsx?$/
            },
            {
                include: [
                    path.resolve(__dirname, constants.srcLocale),
                    path.resolve(__dirname, constants.srcRender)
                ],
                loader: "json-loader",
                test: /\.json$/
            }
        ]
    },
    output: {
        filename: constants.appOutputFile,
        path: path.join(constants.dist, constants.distApp),
    },
    plugins: [
        new webpack.DefinePlugin({ "process.env": { NODE_ENV: process.env.NODE_ENV } }),
        new webpack.optimize.DedupePlugin()
    ]
};
