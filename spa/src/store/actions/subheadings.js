import * as actionTypes from './actionTypes';


export const set_sub_heading = (value) => {
    return {
        type: actionTypes.SET_SUB_HEADING,
        payload: value, 
    };
}