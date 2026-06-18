import { getServiceUrl } from '../config';
import axios from 'axios';
export const updateObject = (oldObject, updatedValues) => {
    return {
        ...oldObject,
        ...updatedValues
    }
};

export function getPROrderData(userId, companyGuid, languageGuid, PRNumber, OrderID) {    
    if (OrderID === "") {
        OrderID = 0;
    }
    var config = {
        headers: {
            'Authorization': 'Bearer ' + localStorage.tokenId,
            'Content-Type': 'application/json',
            'UserGuid': userId,
            'CompanyGuid': companyGuid,
            'LanguageGuid': languageGuid,
            'PRNumber': PRNumber,
            'OrderID': OrderID
        }
    };
    return axios.get(getServiceUrl() + 'Order/GetPROrderData?OrderID=' + parseInt(OrderID) + '&PRNumber=' + PRNumber, config).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
}