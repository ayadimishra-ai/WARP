import * as actionTypes from '../actions/actionTypes';
import { updateObject } from '../utility';

const initialState = {
    cartCounter: localStorage.getItem('cartCounter')
}

const getCartCounter = (state, action) => {
    return updateObject(state, {
        cartCounter: action.cartCounter,
    });
}

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.GET_CART_COUNTER:
            return getCartCounter(state, action);
        default:
            return state;
    }
};
export default reducer;