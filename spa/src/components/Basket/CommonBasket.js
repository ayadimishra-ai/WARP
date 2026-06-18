import { getServiceUrl } from '../../config';
import axios from 'axios';

export function addToCart(productGuid, SkuVariants, SkuGuid, FromCart, userId, companyGuid, languageGuid, buyingWindowGuid) {
    let skuvariants = '';
    if (FromCart) {
        skuvariants = SkuVariants
    }
    else {
        skuvariants = SkuVariants != undefined ? SkuVariants.filter(x => x.skuGuid == SkuGuid)[0].attributeValue : ''
        if (SkuVariants !== undefined) {
            for (let i = 0; i < SkuVariants.length; i++) {
                let l = i;
                skuvariants = skuvariants.replace(' | ', '|');
            }
        }
    }
    let body = {
        'ProductGuid': productGuid,
        'UserGuid': userId,
        'CompanyGuid': companyGuid,
        'LanguageGuid': languageGuid,
        'BuyingWindowGuid': buyingWindowGuid == undefined ? '00000000-0000-0000-0000-000000000000' : buyingWindowGuid,
        'SkuGuid': SkuGuid != undefined ? SkuGuid : '00000000-0000-0000-0000-000000000000',
        'SkuVariants': skuvariants,
    };
    let config = {
        headers: {
            'Authorization': 'Bearer ' + localStorage.tokenId,
            'Content-Type': 'application/json',
        }
    };
    return axios.post(getServiceUrl() + 'Basket/InsertDataBasketDetails?', body, config)
        .catch(err => err.status !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
}

export function splitOrderAddToCart(productGuid, userId, companyGuid, languageGuid, buyingWindowGuid, skuGuid) {
    let body = {
        'ProductGuid': productGuid,
        'UserGuid': userId,
        'CompanyGuid': companyGuid,
        'LanguageGuid': languageGuid,
        'BuyingWindowGuid': buyingWindowGuid,
        'SkuGuid': skuGuid
    };
    let config = {
        headers: {
            'Authorization': 'Bearer ' + localStorage.tokenId,
            'Content-Type': 'application/json',
        }
    };
    return axios.post(getServiceUrl() + 'Basket/InsertSplitOrderIntoBasket?', body, config)
        .catch(err => err.status !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
}

export function addToWishList(productGuid, userId, companyGuid, languageGuid) {

    let body = {
        'ProductGuid': productGuid,
        'UserGuid': userId,
        'CompanyGuid': companyGuid,
        'LanguageGuid': languageGuid
    };
    let config = {
        headers: {
            'Authorization': 'Bearer ' + localStorage.tokenId,
            'Content-Type': 'application/json',
        }
    };
    return axios.post(getServiceUrl() + 'WishList/InsertIntoWishListDetails?', body, config)
        .catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
}
export function removefromCart(productGuid, userId, companyGuid, languageGuid, basketGuid) {
    let body = {
        'ProductGuid': productGuid,
        'UserGuid': userId,
        'CompanyGuid': companyGuid,
        'LanguageGuid': languageGuid,
        'BasketGuid': basketGuid,
    }
    let config = {
        headers: {
            'Authorization': 'Bearer ' + localStorage.tokenId,
            'Content-Type': 'application/json'
        },
    };
    return axios.post(getServiceUrl() + 'Basket/DeleteFromBasketDetails?', body, config)
        .catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
}

export function splitOrderRemoveFromCart(productGuid, userId, companyGuid, languageGuid, basketGuid, skuGuid, buyingWindowGuid) {
    let body = {
        'ProductGuid': productGuid,
        'UserGuid': userId,
        'CompanyGuid': companyGuid,
        'LanguageGuid': languageGuid,
        'BasketGuid': basketGuid,
        'SkuGuid': skuGuid,
        'BuyingWindowGuid': buyingWindowGuid,
    }
    let config = {
        headers: {
            'Authorization': 'Bearer ' + localStorage.tokenId,
            'Content-Type': 'application/json'
        },
    };
    return axios.post(getServiceUrl() + 'Basket/DeleteSplitOrderBasketData?', body, config)
        .catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
}

export function removefromWishList(productGuid, userId, companyGuid, languageGuid, wishListGuid) {
    let body = {
        'ProductGuid': productGuid,
        'UserGuid': userId,
        'CompanyGuid': companyGuid,
        'LanguageGuid': languageGuid,
        'WishListGuid': wishListGuid,
    }
    let config = {
        headers: {
            'Authorization': 'Bearer ' + localStorage.tokenId,
            'Content-Type': 'application/json'
        },
    };
    return axios.post(getServiceUrl() + 'WishList/DeleteFromWishListDetails?', body, config)
        .catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
}
export function getProductSkuAttributeData(userId, companyGuid, languageGuid, buyingWindowGuid) {
    var config = {
        headers: {
            'Authorization': 'Bearer ' + localStorage.tokenId,
            'Content-Type': 'application/json',
            'UserGuid': userId,
            'CompanyGuid': companyGuid,
            'LanguageGuid': languageGuid,
            'BuyingWindowGuid': buyingWindowGuid
        }
    };
    return axios.get(getServiceUrl() + 'Basket/GetProductSkuAttributeData?', config)
        .catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
}

export function updateProductBasket(body) {
    var config = {
        headers: {
            'Authorization': 'Bearer ' + localStorage.tokenId,
            'Content-Type': 'application/json'
        },
    };
    return axios.post(getServiceUrl() + 'Basket/UpdateProductBasket?', body, config)
        .catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
}

export function getBasketDetails(userId, companyGuid, languageGuid) {
    // var config = {
    //     headers: {
    //         'Authorization': 'Bearer ' + localStorage.tokenId,
    //         'Content-Type': 'application/json',
    //         'UserGuid': userId,
    //         'CompanyGuid': companyGuid,
    //         'LanguageGuid': languageGuid
    //     }
    // };
    // return axios.get(getServiceUrl() + 'Basket/GetBasketDetails?', config)
    //     .catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
}

export function getWishListDetails(userId, companyGuid, languageGuid) {
    // var config = {
    //     headers: {
    //         'Authorization': 'Bearer ' + localStorage.tokenId,
    //         'Content-Type': 'application/json',
    //         'UserGuid': userId,
    //         'CompanyGuid': companyGuid,
    //         'LanguageGuid': languageGuid
    //     }
    // };
    // return axios.get(getServiceUrl() + 'WishList/GetWishListDetails?', config)
    // .catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');

    // var config = {
    //     headers: {
    //         'Authorization': 'Bearer ' + localStorage.tokenId,
    //         'Content-Type': 'application/json',
    //         'UserGuid': userId,
    //         'CompanyGuid': companyGuid,
    //         'LanguageGuid': languageGuid,
    //         'PageSize': 50,
    //         'PageNumber': 0,
    //         'SortBy': "null"
    //     }
    // };
    // return axios.get(getServiceUrl() + 'WishList/FetchWishListData?', config)
    //     .catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
}

export function fetchWishListData(userId, companyGuid, languageGuid, PageSize, PageNumber, SortBy) {
    if (SortBy === null) {
        SortBy = "null";
    }
    // var config = {
    //     headers: {
    //         'Authorization': 'Bearer ' + localStorage.tokenId,
    //         'Content-Type': 'application/json',
    //         'UserGuid': userId,
    //         'CompanyGuid': companyGuid,
    //         'LanguageGuid': languageGuid,
    //         'PageSize': PageSize,
    //         'PageNumber': PageNumber,
    //         'SortBy': SortBy
    //     }
    // };
    // return axios.get(getServiceUrl() + 'WishList/FetchWishListData?', config)
    //     .catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
}

export function getRecentlyViewedProducts(userId, companyGuid, languageGuid, productGuid) {
    var config = {
        headers: {
            "Authorization": "Bearer " + localStorage.tokenId,
            'Content-Type': 'application/json',
            'UserGuid': userId,
            'CompanyGuid': companyGuid,
            'LanguageGuid': languageGuid,
            'ProductGuid': productGuid
        },
    };
    return axios.get(getServiceUrl() + 'RecentlyViewed/GetRecentlyViewedProducts?', config)
        .catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
}

export function getRecommendedProducts(userId, companyGuid, languageGuid) {
    var config = {
        headers: {
            "Authorization": "Bearer " + localStorage.tokenId,
            'Content-Type': 'application/json',
            'UserGuid': userId,
            'CompanyGuid': companyGuid,
            'LanguageGuid': languageGuid
        },
    };
    return axios.get(getServiceUrl() + 'Product/GetRecommendedProducts?', config)
        .catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
}
export async function getProductForFrequentlyBought(ProductGuid,SupplierGuid) 
{
   var config = {
        headers: { 
             "Authorization": "Bearer " + localStorage.tokenId,
             'Content-Type': 'application/json',
             'ProductGuid': ProductGuid,
             'SupplierGuid': SupplierGuid,
           
        },
    };
  return axios.get(getServiceUrl() + 'Product/GetMappedProductForFrequentlyBought?', config)
        .catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
        
}
