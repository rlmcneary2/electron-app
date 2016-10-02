"use strict";


module.exports = isProduction => {
    return {
        devTools: !isProduction
    };
};