"use strict";


const addLocaleData = require("react-intl").addLocaleData;


module.exports = {

    types: Object.freeze({
        LocaleChanged: "locale-changed",
        LocaleChangedEnd: "locale-changed-end"
    }),

    actions: {
        localeChanged(locale) {
            return dispatch => {

                const allMessages = {};
                let messages;
                if (locale) {
                    // Three things to do here:
                    // - Require the locale-data modules your application requires (see: "Locale Data as Modules" https://github.com/yahoo/react-intl/issues/162)
                    // - Get an object that contains the localized strings. That could be done by requiring the JSON files, downloading them from a server, or reading them from a file using IPC.
                    // - Return the object (messages) from the JSON file that matches the requested locale.

                    let language;
                    if (locale) {
                        language = locale.split(/(-|_)/)[0];
                    }

                    const localeData = {
                        en: require("react-intl/locale-data/en"),
                        es: require("react-intl/locale-data/es")
                        // Require the locale-data modules the application needs (see: "Locale Data as Modules" https://github.com/yahoo/react-intl/issues/162)
                    };

                    if (language) {
                        addLocaleData(localeData[language]);
                    }

                    // Get an object that contains the localized strings. That could be done by requiring the JSON files, downloading them from a server, or reading them from a file using IPC.                    
                    allMessages["en-US"] = require("../../locale/en-US.json");
                    allMessages["es-ES"] = require("../../locale/es-ES.json");
                    // Require other localized strings the application needs.

                    // Return the object (messages) from the JSON file that matches the requested locale.
                    messages = allMessages[locale];
                }

                dispatch(this.localeChangedEnd(locale, messages));
            };
        },

        localeChangedEnd(locale, messages) {
            const action = { messages, tag: locale, type: this.types.LocaleChangedEnd };

            if (messages) {
                action.messages = messages;
            }

            return action;
        }
    }
};
