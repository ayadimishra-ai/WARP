import * as actionTypes from './actionTypes';

export const viewRecommendationsOpen = (value) => ({
    type: actionTypes.VIEW_RECOMMENDATIONS_BUTTON_OPEN,
    payload: value, 
});

export const viewRecommendationsClose = (value) => ({
    type: actionTypes.VIEW_RECOMMENDATIONS_BUTTON_CLOSE,
    payload: value, 
});

export const viewRecommendationsUrl = (value) => ({
    type: actionTypes.VIEW_RECOMMENDATIONS_BUTTON_URL,
    payload: value, 
});