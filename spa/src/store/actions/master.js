import * as actionTypes from './actionTypes';
import { getServiceUrl } from '../../config';
import axios from 'axios';

export const getLaguageId = (languageId) => {
    return {
        type: actionTypes.GET_LANGUAGE_ID,
        languageId: languageId,
    };
}

export const getLanguageList = (languageList, languageId) => {
    return {
        type: actionTypes.GET_LANGUAGE_LIST,
        languageList: languageList,
        languageId: languageId,
    };
}

export const changeLanguage = (userId, languageId) => {
    return dispatch => {
        var body = JSON.stringify([userId, languageId]);
        var config = {
            headers: {
                'Authorization': 'Bearer ' + localStorage.tokenId,
                'Content-Type': 'application/json'
            }
        };
        axios.post(getServiceUrl() + 'Users/UpdateDefaultLanguage', body, config)
            .then(json => {
                localStorage.setItem("languageId", languageId)
                dispatch(getLaguageId(languageId));
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname='/' : '' : '');
    }
}
export const languageList = () => {
    return dispatch => {

        var config = {
            headers: {
                'Authorization': 'Bearer ' + localStorage.tokenId,
                'Content-Type': 'application/json'
            }
        };
        axios.post(getServiceUrl() + 'Users/UpdateDefaultLanguage', config)
            .then(json => {
                var newJson = json.data.map(item => ({
                    Id: item.languageGuid,
                    Value: item.languageName
                }));
                localStorage.languageList = JSON.stringify(newJson);
                dispatch(getLanguageList(newJson, localStorage.languageId));
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname='/' : '' : '');
    }
}