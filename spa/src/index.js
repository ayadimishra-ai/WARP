import 'react-app-polyfill/ie9';
import 'react-app-polyfill/ie11';
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import * as serviceWorker from './serviceWorker';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import subheadingsReducer from './store/reducers/subheadings'
import loginReducer from './store/reducers/login'
import masterReducer from './store/reducers/master'
import basketReducer from './store/reducers/basket'
import wishlistReducer from './store/reducers/wishlist'
import buyingWindowReducer from './store/reducers/buyingWindow'
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { IntlProvider } from 'react-intl';
import drawerReducer from './store/reducers/initiateAssessment';
import questionWithQueriesReducer from './store/reducers/questionWithQueries';
import viewRecommendationsReducer from './store/reducers/viewRecommendations';
import BulkUploadReducer from './store/reducers/monthlyActivityData';
import chatWithSnowkapAIReducer from './store/reducers/chatWithSnowkapAI';
import { MuiThemeProvider } from '@material-ui/core/styles';
import theme from './theme'
import ReCaptchaProvider from "../src/google-invisible-recaptcha/RecaptchaProvider";


const app = (
    <MuiThemeProvider theme={theme}>
        <BrowserRouter>
        <ReCaptchaProvider >
            <App />
            </ReCaptchaProvider >
        </BrowserRouter>
    </MuiThemeProvider>
);
const rootReducer = combineReducers({
    login: loginReducer,
    master: masterReducer,
    basket: basketReducer,
    wishlist: wishlistReducer,
    buyingWindow: buyingWindowReducer,
    subHeadings: subheadingsReducer,
    drawer: drawerReducer,
    questionWithQueries: questionWithQueriesReducer,
    viewRecommendations: viewRecommendationsReducer,
    BulkUploadStore: BulkUploadReducer,
    chatWithSnowkapAI: chatWithSnowkapAIReducer

});
const logger = (store) => {
    return next => {
        return action => {
            const result = next(action);
            return result;
        }
    }
};
const store = createStore(rootReducer, applyMiddleware(logger, thunk));
ReactDOM.render(<IntlProvider locale="en"><Provider store={store}>{app}</Provider></IntlProvider>, document.getElementById('root'));
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();