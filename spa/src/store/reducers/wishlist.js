import * as actionTypes from '../actions/actionTypes';
import { updateObject } from '../utility';

const initialState = {
    wishlistCounter: localStorage.getItem('wishlistCounter')
}

const getwishlistCounter = (state, action) => {
    return updateObject(state, {
        wishlistCounter: action.wishlistCounter,
    });
}

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.GET_WISHLIST_COUNTER:
            return getwishlistCounter(state, action);
        default:
            return state;
    }
};
export default reducer;