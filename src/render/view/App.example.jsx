"use strict";


const actions = require("../action/actions");
const FormattedMessage = require("react-intl").FormattedMessage;
const React = require("react"); // Invoked after being transpiled to javascript. 
const redux = require("react-redux");


module.exports = redux.connect(mapStateToProps, mapDispatchToProps)(props => {
    return (
        <div>
            <FormattedMessage id="hello-world" />
            <button onClick={() => props.changeLocale("en-US") }>en-US</button>
            <button onClick={() => props.changeLocale("es-ES") }>es-ES</button>
        </div>
    );
});


function mapDispatchToProps(dispatch) {
    return {

        changeLocale(locale) {
            dispatch(actions.localeChanged(locale));
        }

    };
}

function mapStateToProps(/*state*//* The state parameter would normally be converted into props. */) {
    return {};
}