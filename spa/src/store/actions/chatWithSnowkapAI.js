import * as actionTypes from './actionTypes';

export const setChatWithSnowkapAIStatus = (isEnabled, timestamp) => {
    return {
        type: actionTypes.SET_CHAT_WITH_SNOWKAP_AI_STATUS,
        payload: {
            isEnabled: isEnabled,
            lastChecked: timestamp || Date.now()
        }
    };
};
