"use strict";


const constants = require("./buildConstants");
const path = require("path");
const webpack = require("webpack");


module.exports = {
    devtool: "source-maps",
    entry: `.${path.sep}${path.join(constants.srcRender, constants.appEntryFile)}`,
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /(node_modules|bower_components)/,
                use: [
                    {
                        loader: "babel-loader",
                        options: {
                            presets: ["es2015", "stage-2", "react"],
                            retainLines: true,
                        }
                    },
                    {
                        loader: "ts-loader",
                        options: {
                            entryFileIsJs: true
                        }
                    }
                ]
            },
            {
                test: /\.jsx?$/,
                include: [
                    path.resolve(__dirname, constants.srcRender)
                ],
                use: [
                    {
                        loader: "babel-loader",
                        options: {
                            plugins: ["transform-async-to-generator"],
                            presets: ["es2015", "stage-2", "react"]
                        }
                    }
                ]
            }
        ]
    },
    output: {
        filename: constants.appOutputFile,
        path: path.join(constants.dist, constants.distApp),
    },
    plugins: [
        new webpack.DefinePlugin({ "process.env": { NODE_ENV: process.env.NODE_ENV } })
    ],
    resolve: {
        extensions: [".js", ".ts", ".tsx"]
    },
    target: "electron-renderer"
};
