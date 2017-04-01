"use strict";


const constants = require("./buildConstants");
const fs = require("fs");
const gulp = require("gulp");
const gutil = require("gulp-util");
const mkdirp = require("mkdirp");
const packager = require("electron-packager");
const path = require("path");
const rimraf = require("rimraf");
const webpack = require("webpack");
const webpackConfig = require("./webpack.config.js");


const _MAIN_CONFIG_REQUIRE_FILE = "mainConfig.example.js";
const _MAIN_CONFIG_OUTPUT_FILE = "mainConfig.json";
const _RENDER_CONFIG_REQUIRE_FILE = "renderConfig.example.js";
const _RENDER_CONFIG_OUTPUT_FILE = "renderConfig.json";


let _electronPackagerOptions;
let _isProduction = false;


gulp.task("build-application", gulp.parallel(buildAppJavascript, () => copyHtml(constants.srcRender, constants.distApp)));

gulp.task("build-electron", gulp.parallel(
    () => copyFiles(constants.srcMain, constants.distApp, "js"),
    () => copyFiles(constants.srcMain, constants.distApp, "json")
));

gulp.task("clean", () => {
    return new Promise((resolve, reject) => {
        rimraf(constants.dist, err => {
            if (err) {
                gutil.log("[rimraf]", `error - ${err}`);
                reject(gutil.PluginError("rimraf", err));
                return;
            }

            resolve();
        });
    });
});

gulp.task("create-config", () => {
    return Promise.all([
        createConfig(`./${_MAIN_CONFIG_REQUIRE_FILE}`, _MAIN_CONFIG_OUTPUT_FILE),
        createConfig(`./${_RENDER_CONFIG_REQUIRE_FILE}`, _RENDER_CONFIG_OUTPUT_FILE),
    ]);
});

gulp.task("set-debug", callback => {
    process.env.NODE_ENV = "\"debug\""; // Yes, this must be defined as a string with quotes.
    callback();
});

// All the tasks required by this task must be defined above it.
gulp.task("debug", gulp.series("set-debug", "create-config", gulp.parallel("build-application", "build-electron")), callback => {
    callback();
});

gulp.task("set-release", callback => {
    _isProduction = true;
    process.env.NODE_ENV = "\"production\""; // Yes, this must be defined as a string with quotes.
    callback();
});

// All the tasks required by this task must be defined above it.
gulp.task("release", gulp.series("set-release", "clean", "create-config", gulp.parallel("build-application", "build-electron")), callback => {
    callback();
});

gulp.task("package-task", () => {
    const options = Object.assign({
        arch: "x64"
    }, _electronPackagerOptions);

    return electronPackager(options);
});

gulp.task("package-only-debug", gulp.series("set-debug", "package-task"), callback => {
    callback();
});

gulp.task("package-debug", gulp.series("clean", "debug", "package-task"), callback => {
    callback();
});

gulp.task("package-only-release", gulp.series("set-release", "package-task"), callback => {
    callback();
});

gulp.task("package-release", gulp.series("clean", "release", callback => { _electronPackagerOptions = { platform: gutil.env.platform }; callback(); }, "package-task"), callback => {
    callback();
});


function buildAppJavascript() {
    return new Promise((resolve, reject) => {
        const config = webpackConfig;
        config.plugins = config.plugins || [];

        if (_isProduction) {
            config.devtool = "cheap-module-source-maps";
            config.plugins.push(new webpack.optimize.UglifyJsPlugin({ minimize: true }));
        } else {
            config.plugins.push(new webpack.LoaderOptionsPlugin({ debug: true }));
        }

        webpack(config, (err, stats) => {
            if (err) {
                gutil.log("[webpack]", `error - ${err}`);
                reject(gutil.PluginError("webpack", err));
                return;
            }

            gutil.log("[webpack]", stats.toString());
            resolve();
        });
    });
}

function copyFiles(sourceDir, destinationDir, ext) {
    return gulp.src([`${sourceDir}/*.${ext}`, `${sourceDir}/**/*.${ext}`])
        .pipe(gulp.dest(`${constants.dist}/${destinationDir}/`));
}

function copyHtml(sourceDir, destinationDir) {
    return gulp.src([`${sourceDir}/*.html`, `${sourceDir}/**/*.html`])
        .pipe(gulp.dest(`${constants.dist}/${destinationDir}/`));
}

function createConfig(sourceJsFilePath, destinationJsonFileName) {
    return new Promise((resolve, reject) => {
        let config = {};
        try {
            // The URL params javascript file is a module that exports a
            // function. The exported function takes a single boolean argument,
            // if true a production build is being compiled, if false it is not
            // a production build. The exported function returns an object
            // whose keys and values will become URL parameters. 
            const configFunc = require(sourceJsFilePath);

            config = typeof configFunc === "function" ? configFunc(_isProduction) : configFunc;

            writeFile(`${constants.dist}/${constants.distApp}/${destinationJsonFileName}`, JSON.stringify(config, null, _isProduction ? 0 : 4))
                .then(() => {
                    resolve();
                })
                .catch(err => {
                    reject(err);
                });
        } catch (err) {
            console.log(`createConfig - error: ${err.message || JSON.stringify(err)}`); // eslint-disable-line no-console
            resolve();
        }
    });
}

function createDirectory(directoryPath) {
    return new Promise(resolve => {
        mkdirp(directoryPath, null, err => {
            resolve(err);
        });
    });
}

function electronPackager(options) {
    return new Promise((resolve, reject) => {
        const packagerOptions = Object.assign({
            asar: _isProduction,
            dir: `./${constants.dist}/${constants.distApp}`,
            name: "electron-app",
            arch: "x64",
            out: `./${constants.dist}/${constants.distPackage}/`,
            overwrite: true
        }, options);

        packager(packagerOptions, err => {
            if (!err) {
                resolve();
            } else {
                reject(new gutil.PluginError("electron-packager", err));
            }
        });
    });
}

function writeFile(name, contents) {
    return new Promise((resolve, reject) => {
        const dir = path.dirname(name);
        createDirectory(dir)
            .then(errDir => {
                if (errDir) {
                    console.log(`writeFile - error creating directory: ${errDir.message || JSON.stringify(errDir)}`); // eslint-disable-line no-console
                    reject(`error creating directory: ${errDir.message || JSON.stringify(errDir)}`);
                    return;
                }

                fs.writeFile(name, contents, errWrite => {
                    if (errWrite) {
                        console.log(`writeFile - error writing file: ${errWrite.message || JSON.stringify(errWrite)}`); // eslint-disable-line no-console
                        reject(`error writing file: ${errDir.message || JSON.stringify(errDir)}`);
                        return;
                    }

                    resolve();
                });
            });
    });
}
