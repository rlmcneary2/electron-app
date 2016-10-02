"use strict";


const actions = require("../action/actions");
const constants = require("../../constants");


/**
 * Handles (reduces) locale actions to state.
 * @module
 */
module.exports = handler;


/**
 * A function that handles (reduces) locale actions to state.
 * @param {object} state The current local state. Defaults to an object with a tag property set to en-US. 
 * @param {object} action The action with information to process.
 */
function handler(state = { tag: constants.DefaultLocale }, action) {

    let nextState = state;
    switch (action.type) {

        case actions.types.LocaleChangedEnd: {
            nextState = Object.assign({}, state);
            nextState.tag = action.tag;
            nextState.messages = action.messages;
            break;
        }

    }

    return nextState;
}
