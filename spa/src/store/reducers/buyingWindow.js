import * as actionTypes from '../actions/actionTypes';
import { updateObject } from '../utility';

const initialState = {
    buyingWindowCounter: localStorage.getItem('buyingWindowCounter')
}

const getbuyingWindowCounter = (state, action) => {
    return updateObject(state, {
        buyingWindowCounter: action.buyingWindowCounter,
    });
}

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.GET_BUYINGWINDOW_COUNTER:
            return getbuyingWindowCounter(state, action);
        default:
            return state;
    }
};
export default reducer;