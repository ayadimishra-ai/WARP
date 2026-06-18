import * as actionTypes from './actionTypes';


export const getbuyingWindowCounter = (buyingWindowCounter) => {
    return {
        type: actionTypes.GET_BUYINGWINDOW_COUNTER,
        buyingWindowCounter: buyingWindowCounter,
    };
}

export const buyingWindowCounter = (userId, languageId) => {

    let  userRole = localStorage.userType.slice(1,-1)
    
    if (localStorage.userType.slice(1,-1).includes('APPROVER') && localStorage.userType.slice(1,-1).includes('BUYER')) {
        userRole = 'BUYER' //userRole = 'BUYERAPPROVER'
    }
    if(localStorage.userType.slice(1,-1).includes('APPROVER') && localStorage.userType.slice(1,-1).includes('STRATEGICUSER') && !localStorage.userType.slice(1,-1).includes('BUYER')) {
        userRole = 'APPROVER' 
    }
    if(localStorage.userType.slice(1,-1).includes('BUYER') && localStorage.userType.slice(1,-1).includes('STRATEGICUSER')) {
        userRole = 'BUYER' 
    }

    if (userId !== undefined) {
        return dispatch => {
            // var config = {
            //     headers: {
            //         'Authorization': 'Bearer ' + localStorage.tokenId,
            //         'Content-Type': 'application/json',
            //         'UserGuid': userId,
            //         'CompanyGuid': localStorage.companyGuid,
            //         'LanguageGuid': languageId
            //     }
            // };
            // axios.get(getServiceUrl() + 'BuyingWindow/GetBuyingWindowData', config)
            //     .then(json => {
            //         localStorage.setItem(
            //             "buyingWindowCounter", json.data.table3 !== undefined ? json.data.table3[0].bwCount === 0 ? 0 : json.data.table3[0].bwCount : 0)
            //         dispatch(getbuyingWindowCounter(json.data.table3[0].bwCount));
            //     }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname='/' : '' : '');
                // var config = {
                //     headers: {
                //         'Authorization': 'Bearer ' + localStorage.tokenId,
                //         'Content-Type': 'application/json',
                //         'UserGuid': userId,
                //         'CompanyGuid': localStorage.companyGuid,
                //         'LanguageGuid': localStorage.languageId,
                //         'UserRole':  userRole,
                //         'BWStatus': 'In Progress',
                //         'PageSize': 5,
                //         'PageNumber': 1,
                //     }
                // };
                // axios.get(getServiceUrl() + 'BuyingWindow/GetAllBuyingWindow', config)
                // .then(json => {
                //     localStorage.setItem(
                //         "buyingWindowCounter", json.data.table3 !== undefined ? json.data.table3[0].bwCount === 0 ? 0 : json.data.table3[0].bwCount : 0)
                //     dispatch(getbuyingWindowCounter(json.data.table3[0].bwCount));
                // }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname='/' : '' : '');
        }
    }
    else {
        return dispatch => {
            localStorage.setItem("buyingWindowCounter", 0);
            dispatch(getbuyingWindowCounter(0));
        }
    }
}
