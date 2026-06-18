import * as actionTypes from '../actions/actionTypes';

const initialState = {
    isEnabled: null, // null = not checked yet, true/false = checked
    lastChecked: null,
    isLoading: false
};

const chatWithSnowkapAIReducer = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.SET_CHAT_WITH_SNOWKAP_AI_STATUS:
            return {
                ...state,
                isEnabled: action.payload.isEnabled,
                lastChecked: action.payload.lastChecked,
                isLoading: false
            };
        case actionTypes.AUTH_LOGOUT:
            return initialState; // Reset to initial state on logout
        default:
            return state;
    }
};

export default chatWithSnowkapAIReducer;
