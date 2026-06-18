import * as actionTypes from '../actions/actionTypes';
import { updateObject } from '../utility';

const initialState = {
    languageId: localStorage.getItem('languageId'),
    languageList: JSON.stringify(localStorage.languageList),
}

const getLanguageId = (state, action) => {
    return updateObject(state, {
        languageId: action.languageId,
    });
}

const getLanguageList = (state, action) => {
    return updateObject(state, {
        languageList: action.languageList,
        languageId: action.languageId,
    });
}
const reducer = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.GET_LANGUAGE_ID:
            return getLanguageId(state, action);
        case actionTypes.GET_LANGUAGE_LIST:
            return getLanguageList(state, action);
        default:
            return state;
    }
};
export default reducer;