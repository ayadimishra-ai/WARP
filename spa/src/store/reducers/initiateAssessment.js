// reducer.js
import { ISOPEN, ISCLOSE } from '../actions/actionTypes';

const initialState = {
    open: false,
};

const drawerReducer = (state = initialState, action) => {
    switch (action.type) {
        case ISOPEN:
            return { ...state, open: action.payload };
        case ISCLOSE:
            return { ...state, open: action.payload };
        default:
            return state; // If the action is unknown, return the current state
    }
};

export default drawerReducer;