"use strict";


const App = require("./App.jsx");
const IntlProvider = require("react-intl").IntlProvider;
const React = require("react");
const redux = require("react-redux");
const Provider = redux.Provider;


const ReactContent = props => {
    if (!props.locale){
        return null;
    }

    const providerProps = {
        store: props.store
    };

    const locale = props.locale;
    const intlProps = {
        key: locale,
        locale,
        messages: props.messages
    };

    return (
        <Provider {...providerProps}>
            <IntlProvider {...intlProps}>
                <App />
            </IntlProvider>
        </Provider>
    );
};

ReactContent.propTypes = {
    locale: React.PropTypes.string, // The locale of messages and numbers to display. Defaults to en-US.
    messages: React.PropTypes.object, // The ICU messages for display. Defaults to an empty object.
    store: React.PropTypes.object.isRequired // The redux store.
};


module.exports = redux.connect(mapStateToProps)(ReactContent);

function mapStateToProps(state) {
    const props = {};
    if (state.locale) {
        props.locale = state.locale.tag;
        props.messages = state.locale.messages;
    }

    return props;
}