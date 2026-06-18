import { fetchWishListData } from '../../components/Basket/CommonBasket';
import * as actionTypes from './actionTypes';


export const getwishlistCounter = (wishlistCounter) => {
    return {
        type: actionTypes.GET_WISHLIST_COUNTER,
        wishlistCounter: wishlistCounter,
    };
}

export const wishlistCounter = (userId, languageId) => {
    if (userId !== undefined) {
        return dispatch => {
            // getWishListDetails(userId, localStorage.companyGuid, languageId)
            //     .then(json => {
            //         localStorage.setItem(
            //             "wishlistCounter", json.data.length === 0 ? 0 : json.data.length)
            //         dispatch(getwishlistCounter(json.data.length));
            //     }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname='/' : '' : '');
            fetchWishListData(userId, localStorage.companyGuid, languageId, 50, 0, null)
                .then(json => {
                    if (json.data !== undefined && json.data.table2 !== undefined)
                    {
                        if (json.data.table2.length > 0) {
                            localStorage.setItem(
                                "wishlistCounter", json.data.table2[0].column1 === 0 ? 0 : json.data.table2[0].column1)
                                dispatch(getwishlistCounter(json.data.table2[0].column1));
                        } else {
                            localStorage.setItem(
                                "wishlistCounter", 0)
                                dispatch(getwishlistCounter(0));
                        }
                    }
                }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');


        }
    }
    else {
        return dispatch => {
            localStorage.setItem("wishlistCounter", 0);
            dispatch(getwishlistCounter(0));
        }
    }
}
