import * as actionTypes from './actionTypes';
import { getBasketDetails } from '../../components/Basket/CommonBasket';


export const getCartCounter = (cartCounter) => {
    return {
        type: actionTypes.GET_CART_COUNTER,
        cartCounter: cartCounter,
    };
}

export const cartCounter = (userId, languageId) => {
    if (userId !== undefined) {
        return dispatch => {
            getBasketDetails(userId, localStorage.companyGuid, languageId)
                .then(json => {

                    localStorage.setItem(
                        "cartCounter", json.data.length === 0 ? 0 : json.data.length)
                    dispatch(getCartCounter(json.data.length));
                }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
        }
    }
    else {
        return dispatch => {
            localStorage.setItem("cartCounter", 0);
            dispatch(getCartCounter(0));
        }
    }
}
