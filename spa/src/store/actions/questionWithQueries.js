import * as actionTypes from './actionTypes';

export const questionWithQuery = (value) => ({
    type: actionTypes.QUESTION_WITH_QUERY,
    payload: value, 
});

export const updateCount = (value) => ({
    type: actionTypes.QUESTION_WITH_QUERY_COUNT,
    payload: value, 
});

export const updateIframe = (value) => ({
    type: actionTypes.QUESTION_WITH_QUERY_IFRAME,
    payload: value, 
});

export const updateTitle = (value) => ({
    type: actionTypes.QUESTION_WITH_QUERY_TITLE,
    payload: value, 
});

export const QueryButtonShow = (value) => ({
    type: actionTypes.QUESTION_WITH_QUERY_SHOW,
    payload: value, 
});

export const QueryButtonQwcLoader = (value) => ({
    type: actionTypes.QUESTION_WITH_QUERY_QwcLoader,
    payload: value, 
});

export const QueryButtonQwcOpen = (value) => ({
    type: actionTypes.QUESTION_WITH_QUERY_QwcOpen,
    payload: value, 
});

export const UpdateQuestionsWithComments = (value) => ({
    type: actionTypes.QUESTION_WITH_QUERY_Comments,
    payload: value, 
});
