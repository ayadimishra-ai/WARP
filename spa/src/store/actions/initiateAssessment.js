import * as actionTypes from './actionTypes';


// Action creators
export const isOpen = (value) => ({
    type: actionTypes.ISOPEN,
    payload: value, // Optional data you want to pass
});

export const isClose = (value) => ({
    type: actionTypes.ISCLOSE,
    payload: value,
});
