import * as actionTypes from './actionTypes';

export const refreshIframe = (data, callback) => ({
    type: actionTypes.REFRESH_IFRAME,
    payload:  data ,
});

export const UploadActivityCode=(data)=>({
    type: actionTypes.UPLOAD_ACTIVITY_CODE,
    payload:  data ,
})

export const UploadAIActivityCode=(data)=>({
    type: actionTypes.UPLOAD_AI_ACTIVITY_CODE,
    payload:  data ,
})