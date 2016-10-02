# electron-app
A starter project to create a basic [Electron](http://electron.atom.io/) application using [React](https://facebook.github.io/react/), [Redux](http://redux.js.org/), and [webpack](https://webpack.github.io/). Electron applications are cross platform applications that run on Windows, OSX, and Linux.

## Prerequisites
- [Node.js](https://nodejs.org) version 6 or later.

## Get the source code
Clone this repository using git. The source files will be copied into a subdirectory named **electron-app** of the current working directory. Once all the files are downloaded move into the **electron-app** directory
```
git clone -b master --single-branch -o electron-app https://github.com/rlmcneary2/electron-app.git
cd electron-app
```

## Install required packages
A variety of packages are required to build, debug, and run the application; install them using npm.
```
npm install
```
## Run and debug
Launch the application from the command line by running the **prebuilt** script in the **package.json** file.
```
npm run prebuilt
```
If you are using [Visual Studio Code](https://code.visualstudio.com/) the application can be launched from the debug panel using the launch configuration named **Electron**. One advantage of debugging in VS Code is that breakpoints can be set in the application's main process which runs in a Node.js environment. *Note that Electron will actually be executing the code located in the dist/app directory, breakpoints must be set in the javascript files that are created in that location. It might be simpler to add a `debugger;` statement in the source code to stop execution.*

## Creating an application
There are several places to begin adding code for a new application.

### Configuration
There are two optional configuration files that can be used to control how the application operates at run time. The configuration files are defined at build time by javascript code files. These code files contain a module that exports a single function which takes one parameter. If the parameter is true a production release is being built, otherwise it is not a production release.

The configuration of the main process is defined by creating a file in the root directory of this project named **mainConfig.js**. During the build process this file will be executed to produce a plain object which will be written to a JSON file named **mainConfig.json** in the **dist/app** directory. The properties of this plain object may contain any type of object that can be represented in JSON. There is an example **mainConfig.js** in the **src/example** directory.

The configuration of the render process is defined by creating a file in the root directory of this project named **renderConfig.js**. During the build process this file will be executed to produce a plain object which will be written to a JSON file named **renderConfig.json** in the **dist/app** directory. The properties of this object will be converted to URL parameters to be passed to the render process. There is an example **renderConfig.js** in the **src/example** directory.

Command line parameters can also be used to control the behavior of the application. Currently the Dev Tools for debugging the render proces in Chromium can be displayed by including `-dev-tools` in the command line.

### Localization
It's simple to localize text, numbers, dates, times and currency. The application already includes the [React Intl](https://github.com/yahoo/react-intl) package. React Intl uses [ICU message](http://userguide.icu-project.org/formatparse/messages) syntax. To take full advantage of the formatting options available you'll want familiarize yourself with it. 

Creating strings for display is done by adding JSON files to the **src/locale** directory. Files are named with the locale that they are associated with, for example English language strings for display in the United States should be placed into a file named **en-US.json**. Each key of the single JSON object in each file is an ID that will be assigned to an associated React Intl component. The value will be an ICU formatted string. There are trivial example files located in the **src/example** directory.

The language displayed by the application can be changed while the application is running by dispatching a `LocaleChanged` action that includes the locale to use. The example **src/example/App.jsx** file illustrates this.
```
dispatch(actions.localeChanged(locale));
```

### Application code
Code that is executed in the main process resides in **src/main**. This code is primarily responsible for creating the render process and interacting with the operating system.

The UI is driven by code in the **src/render** directory. There are three places where new code will be added: action, reducer, and view. In **action** the **actions.js** file has hints for where to add your code; the same goes for **reducer/reducers.js**. The actions and reducers are processed by a Redux store, add them as needed. The [redux thunk](https://github.com/gaearon/redux-thunk) middleware is already included so it's possible to create both synchronous and asynchronous actions.

The **view** directory contains presentational and container components. To get Started add an **App.jsx** file and it will become the root of your application components. There is an example App.jsx file in **src/example/App.jsx**.

## Package
The application can be packaged and run as a native application.
