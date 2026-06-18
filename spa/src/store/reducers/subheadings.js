import * as actionTypes from '../actions/actionTypes';

const initialState = {
    sub_heading: ""
}

const set_sub_heading = (state, action) => {
    return {
        sub_heading:action.payload
    }
}

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.SET_SUB_HEADING:
            return set_sub_heading(state, action);
        default:
            return state;
    }
};
export default reducer;