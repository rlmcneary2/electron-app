"use strict";


const locale = require("./locale");


// Combine types and actions properties of modules to compose the complete actions module.
module.exports = Object.assign({

    types: Object.freeze(Object.assign({},
        locale.types
        // Add additional action type definitions here.
    )),

},
    locale.actions
    // Add additional actions here.
);
