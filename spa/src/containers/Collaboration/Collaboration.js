import Close from "@material-ui/icons/Close";
import KeyboardArrowLeft from "@material-ui/icons/KeyboardArrowLeft";
import axios from 'axios';
import React, { Component } from 'react';
import { connect } from "react-redux";
import Collabrate_icon from '../../assets/img/collaborate.svg';
import * as BWStatusCode from '../../BWStatusCodes';
import CollaborateChat from "../../components/Collaboration/CollaborateChat";
import CollaborationProductCard from "../../components/Collaboration/CollaborationProductCard";
import {
    getElasticIndexNew, getElasticSearchCredentials, getFirestoreCollectionName, getFirestoreProductGroupCollectionName,
    getFirestoreUserDataCollectionName, getLanguageResourceElasticIndex, getServiceUrl, getWebsiteLanguageGuid
} from '../../config';
import firebase from '../../config/fbconfig';
import Spinner from '../../UI/Spinner/Spinner';
import { getElasticData, getPageResource } from "../../utility";

let NewListRateCard = [];
class Collaboration extends Component {
    constructor(props) {
        super(props)
        this.state = {
            openChat: false,
            showParticipant: false,
            onlyOpenChat: false,
            ProductList: false,
            selectedProductSupplierGuid: '',
            selectedProductImageName: '',
            selectedProductName: '',
            selectedProductRatings: 0,
            selectedProductCompanyName: '',
            selectedProductmoq: '',
            selectedProductCurrencySymbol: '',
            selectedProductMinPrice: '',
            selectedProductGuid: '',
            selectedProductGroupId: '',
            selectedProductUserCommitments: '',
            productData: [],
            productExitStatusList: [],
            loading: false,
            showEmptyMsg: false,
            ListRateCard: [],
            result: [],
            resources: [],
            show_resources: false,
            ListVariant: [],
            NewListRateCard: [],
            productGroupListData: '',
            productBuyerPreferenceData: []

        }
    }
    openCollaborate = () => {
        let chatWindowStatus = false;
        if (this.props.openChatWindowCallback !== undefined) {
            this.props.openChatWindowCallback(chatWindowStatus);
        }
    }
    openChat = (SortProductList, productGuid, productGroupExitStatusList) => {
        if (this.state.productGroupListData !== undefined) {
            var activeProduct = this.state.productGroupListData.filter(x => x.IsProductExpired === false && x.ProductGuid === productGuid)[0]
            if (activeProduct !== undefined) {
                this.getProductGroup(SortProductList, productGuid, productGroupExitStatusList);
                var config = {
                    headers: {
                        'Authorization': 'Basic ' + btoa(getElasticSearchCredentials())
                    }
                };

                let url = getElasticIndexNew(this.props.userType,this.props.userId,localStorage.languageId,localStorage.companyGuid.toLocaleLowerCase());

                let splitURL = url.replace("https://", "").replace("http://").split("/");
                let urlNew = "";
                let index = "";
                let search = "";
                let commonquery = "";
    
                if (splitURL.length === 3) {
                    urlNew = splitURL[0];
                    index = splitURL[1];
                    search = splitURL[2];
                } else {
                    for (let i = 0; i < splitURL.length; i++) {
                        if (i === 0) {
                            urlNew = splitURL[i];
                        }
    
                        if (i === 1) {
                            index = splitURL[i];
                        }
                        if (i === (splitURL.length - 1)) {
                            search = splitURL[i];
                        }
                    }
                }
    
                // if (search.indexOf('q=') > -1) {
                //     let splitdata = search.replace("_search", "").replace("?", "").replace("&", "");
                //     if (splitdata.indexOf("q=") > -1) {
                //         splitdata = splitdata.split("q=");
                //         let datakey = [];
                //         let datavalue = [];
                //         commonquery = '"query": {"bool": {"filter": [';
    
                //         for (let j = 0; j < splitdata.length; j++) {
                //             if (splitdata[j].indexOf(":") > -1) {
                //                 let data = splitdata[j].split(":");
                //                 commonquery = commonquery + '{"match": {"' + data[0] + '": "' + data[1] + '"}}';
                //             }
                //         }
                //         commonquery = commonquery + '{"match": {"productname_raw.raw": "A6 6 pages leaflet Z fold"}}';
                //         commonquery = commonquery + ']}}';
                //     }
                // } else {
                //     commonquery = '"query": {"bool": {"filter": [';
                //     commonquery = commonquery + '{"match": {"productname_raw.raw": "A6 6 pages leaflet Z fold"}}';
                //     commonquery = commonquery + ']}}';
                // }
    
                commonquery = JSON.stringify({
                    "query": {
                        "bool": {
                            "filter": [
                                {
                                    "match": {
                                        "productGuid": "" + productGuid + ""
                                    }
                                }
                            ]
                        }
                    }
                });
    
                getElasticData(index, commonquery, 0, 0, "").then(json => {
                    
                    if (json !== null) {
                        
                        this.setState({
                            NewListRateCard: json.hits.hits[0]._source.listRateCardVM
                        })
                    } 
                }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');

                // axios.
                //     get(
                //         getElasticIndexNew(
                //             this.props.userType,
                //             this.props.userId,
                //             localStorage.languageId,
                //             localStorage.companyGuid.toLocaleLowerCase()
                //         ) + productGuid, config
                //     )
                //     .then(json => {
                //         if (json.status === 200) {
                //             if (json.data._source !== undefined) {
                //                 this.setState({
                //                     NewListRateCard: json.data._source.listRateCardVM
                //                 })
                //             }
                //         }
                //     })
                //     .catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
            }
        }
    }
    showParticipant = () => {
        this.setState({ showParticipant: true })
    }
    onlyOpenChat = () => {
        this.setState({ onlyOpenChat: true, showParticipant: false })
    }

    openProductList = () => {
        this.setState({ openChat: false, showParticipant: false, onlyOpenChat: false })
    }

    componentWillReceiveProps(nextProps) {
        this.getProductDataOrderBy(this.state.productGroupListData);
    }

    componentDidMount() {
        //let productGuidList = [];
        // let currentDate = moment(new Date()).format("DD MMMM YYYY") + ' 00:00:00';
        // firebase.firestore().collection(getFirestoreCreateBWNotificationCollectionName())
        //     .where("UserGuid", "==", localStorage.userId.toLowerCase())
        //     .onSnapshot(snapshot => {
        //         if (snapshot.docs.length > 0) {
        //             snapshot.docs.forEach(docs => {
        //                 if (docs.data().BWEndDate >= currentDate) {
        //                     if (this.state.createdBuyingWindowGuid !== '') {
        //                         let list = { ProductGuid: docs.data().ProductGuid }
        //                         productGuidList.push(list)
        //                     }
        //                 }
        //             })

        //             if (productGuidList.length > 0) {
        //                 var config = {
        //                     headers: {
        //                         'Authorization': 'Bearer ' + localStorage.tokenId,
        //                         'Content-Type': 'application/json',
        //                         'List': productGuidList.map(x => x.ProductGuid),
        //                         'UserGuid': localStorage.userId
        //                     },
        //                 };
        //                 axios.get(getServiceUrl() + 'BuyingWindow/GetProductGroupCardData', config)
        //                     .then((response) => {
        //                         this.setState({ productExitStatusList: response.data.productGroupExitStatusList });
        //                     }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
        //             }
        //         }
        //     });

        let groupdb = firebase.firestore().collection(getFirestoreProductGroupCollectionName());
        firebase.firestore().collection(getFirestoreUserDataCollectionName())
            .where('UserGuid', '==', localStorage.userId.toLowerCase())
            .where('LeftGroup', '==', false)
            .onSnapshot((snapshot) => {
                let productGroupList = [], productGroupCount = 0;
                if (snapshot.docs.length === 0) {
                    this.setState({ productData: productGroupList, showEmptyMsg: true });
                }
                else {
                    snapshot.docs.map(doc => {
                        groupdb.where('CollaborationStatus', 'in', [BWStatusCode.IN_PROGRESS, BWStatusCode.FAILED]).get().then(groupsnapshot => {
                            productGroupCount = productGroupCount + 1;
                            groupsnapshot.docs.forEach(grpdata => {
                                if (grpdata.id === doc.data().CollaborationGroupGuid) {
                                    var Productgroup = { ...grpdata.data(), 'CollaborationGroupId': grpdata.id }
                                    productGroupList.push(Productgroup)
                                }
                            })
                            return productGroupList
                        }).then(list => {
                            if (productGroupCount === snapshot.docs.length) {
                                if (list.length > 0) {
                                    this.setState({ productGroupListData: list });
                                    this.getProductDataOrderBy(list);
                                }
                                else {
                                    this.setState({ productData: productGroupList, showEmptyMsg: true });
                                }
                            }
                        })
                    })
                }
            });

        firebase.firestore().collection(getFirestoreProductGroupCollectionName())
            .where('CollaborationStatus', 'in', [BWStatusCode.IN_PROGRESS, BWStatusCode.FAILED])
            .orderBy('ModifiedDate', 'desc')
            .onSnapshot((snapshot) => {
                if (this.state.productData.length > 0) {
                    let productDataList = [], snapshotCount = 0;
                    snapshot.docs.map(doc => {
                        snapshotCount = snapshotCount + 1;
                        let productData = JSON.parse(JSON.stringify(this.state.productData)).filter(x => x.productGuid === doc.data().ProductGuid)[0];
                        if (productData !== undefined) {
                            productDataList.push(productData);
                        }
                        if (snapshot.docs.length === snapshotCount) {
                            this.setState({ productData: productDataList });
                        }
                    })
                }
            })

        firebase.firestore().collection(getFirestoreCollectionName())
            .onSnapshot(snapshot => {
                let newProductData = [];
                let newItem;
                let TotalCommitmentQty = 0, productData = this.state.productData;
                productData.map((item) => {
                    snapshot.docs.map(doc => {
                        if (item.buyingWindowGuid !== null && item.buyingWindowGuid !== undefined && doc.data().BuyingWindowGuid === item.buyingWindowGuid) {
                            TotalCommitmentQty = doc.data().Quantity;
                            item.totalQuantity = TotalCommitmentQty;
                        }
                    })
                    newProductData.push(item);
                })
                this.setState({ productData: newProductData });
            });
        getPageResource(
            getLanguageResourceElasticIndex(
                getWebsiteLanguageGuid(),
                "productdetail"
            ) + "&size=10000"
        )
            .then(json => {
                this.setState({ resources: json, show_resources: true });
            })
            .catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }

    getProductDataOrderBy = (list) => {
        this.setState({ loading: true });
        var formData = list.map(x => ({ ProductGuid: x.ProductGuid, CollaborationGroupGuid: x.CollaborationGroupId, BuyingWindowGuid: x.BuyingWindowGuid, IsProductExpired: x.IsProductExpired, UserGuid: localStorage.userId }))
        var config = {
            headers: {
                'Authorization': 'Bearer ' + localStorage.tokenId,
                'Content-Type': 'application/json',
                //'List': allProductList,
                //'UserGuid': localStorage.userId
            },
        };
        axios.post(getServiceUrl() + 'BuyingWindow/GetProductGroupCardData', formData, config)
            .then((response) => {
                this.setState({ loading: false });
                var SortResponseList = []
                list.sort(function (a, b) { return b.ModifiedDate.toDate() - a.ModifiedDate.toDate() }).map(x => {
                    if (response.data.result.table1.filter(y => y.productGuid === x.ProductGuid)[0] !== undefined) {
                        var ProductCollaborationData = { ...response.data.result.table1.filter(y => y.productGuid === x.ProductGuid)[0], 'CollaborationGroupId': x.CollaborationGroupId, 'IsProductExpired': x.IsProductExpired }
                        SortResponseList.push(ProductCollaborationData)
                    }
                })                
                if (this.props.ProductGuid === undefined) {
                    this.call(SortResponseList);            
                    this.setState({ productData: SortResponseList, productExitStatusList: response.data.productGroupExitStatusList, loading: false, productBuyerPreferenceData : response.data.result.table2 });
                    //this.forceUpdate();
                }
                else {
                    this.call(SortResponseList);
                    this.openChat(SortResponseList, this.props.ProductGuid, response.data.productGroupExitStatusList)
                    this.setState({ loading: false })
                }
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');

    }

    call = (productData) => {

        let countriesGuid = [];
        if (localStorage.userCountries !== "undefined") {
            JSON.parse(localStorage.userCountries).map(item => {
                countriesGuid.push(item.countryGuid);
            })
        }

        let RateCard = [];

        var config = {
            headers: {
                'Authorization': 'Basic ' + btoa(getElasticSearchCredentials())
            }
        };

        productData.map((item) => {


            let url = getElasticIndexNew(this.props.userType, this.props.userId, localStorage.languageId, localStorage.companyGuid.toLocaleLowerCase());

            let splitURL = url.replace("https://", "").replace("http://").split("/");
            let urlNew = "";
            let index = "";
            let search = "";
            let commonquery = "";

            if (splitURL.length === 3) {
                urlNew = splitURL[0];
                index = splitURL[1];
                search = splitURL[2];
            } else {
                for (let i = 0; i < splitURL.length; i++) {
                    if (i === 0) {
                        urlNew = splitURL[i];
                    }

                    if (i === 1) {
                        index = splitURL[i];
                    }
                    if (i === (splitURL.length - 1)) {
                        search = splitURL[i];
                    }
                }
            }

            if (search.indexOf('q=') > -1) {
                let splitdata = search.replace("_search", "").replace("?", "").replace("&", "");
                if (splitdata.indexOf("q=") > -1) {
                    splitdata = splitdata.split("q=");
                    let datakey = [];
                    let datavalue = [];
                    commonquery = '"query": {"bool": {"filter": [';

                    for (let j = 0; j < splitdata.length; j++) {
                        if (splitdata[j].indexOf(":") > -1) {
                            let data = splitdata[j].split(":");
                            commonquery = commonquery + '{"match": {"' + data[0] + '": "' + data[1] + '"}}';
                        }
                    }
                    commonquery = commonquery + '{"match": {"productname_raw.raw": "A6 6 pages leaflet Z fold"}}';
                    commonquery = commonquery + ']}}';
                }
            } else {
                commonquery = '"query": {"bool": {"filter": [';
                commonquery = commonquery + '{"match": {"productname_raw.raw": "A6 6 pages leaflet Z fold"}}';
                commonquery = commonquery + ']}}';
            }

            commonquery = JSON.stringify({
                "query": {
                    "bool": {
                        "filter": [
                            {
                                "match": {
                                    "productGuid": "" + item.productGuid + ""
                                }
                            }
                        ]
                    }
                }
            });

            getElasticData(index, commonquery, 0, 0, "").then(json => {
                if (json !== null) {
                    if (json._source.listRateCardVM[0] !== undefined) {
                        RateCard.push(json._source.listRateCardVM.filter(y => y.skuGuid === item.skuGuid && y.countryGuid === countriesGuid[0])[0])
                    }
                    if (productData.length === RateCard.length) {
                        this.setState({ ListRateCard: RateCard, ListVariant: json._source.listProductVariantsVM })
                    }
                    NewListRateCard.push(json._source.listRateCardVM);
                } else {
                    this.setState({ loading: false, notfound: true })
                }
            }).catch(err => err.response !== undefined ? (err.response.status === 404 ? this.setState({ loading: false, notfound: true }) : '') : '');



            // axios.
            //     get(
            //         // getElasticIndexNew(
            //         //     this.props.userType,
            //         //     this.props.userId,
            //         //     localStorage.languageId,
            //         //     localStorage.companyGuid.toLocaleLowerCase()
            //         // ) + item.productGuid, config
            //         getElasticIndexNew(
            //             this.props.userType,
            //             this.props.userId,
            //             localStorage.languageId,
            //             localStorage.companyGuid.toLocaleLowerCase()
            //         ) + item.productGuid
            //     )
            //     .then(json => {
            //         if (json.status === 200) {
            //             if (json.data._source.listRateCardVM[0] !== undefined) {
            //                 RateCard.push(json.data._source.listRateCardVM.filter(y => y.skuGuid === item.skuGuid && y.countryGuid === countriesGuid[0])[0])
            //             }
            //             if (productData.length === RateCard.length) {
            //                 this.setState({ ListRateCard: RateCard, ListVariant: json.data._source.listProductVariantsVM })
            //             }
            //             NewListRateCard.push(json.data._source.listRateCardVM);
            //         }
            //     })
            //     .catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
        })
    }

    getProductGroup = (SortProductList, productGuid, productGroupExitStatusList) => {
        let editId = null;
        let db = firebase.firestore().collection(getFirestoreProductGroupCollectionName())
        let qry = db.where('CollaborationStatus', '==', BWStatusCode.IN_PROGRESS).where('ProductGuid', '==', productGuid)
        qry.get().then((snapshot) => {
            snapshot.docs.map(doc => {
                editId = doc.id;
                return editId
            })
            if (editId != null) {
                ;
                if (this.props.ProductGuid !== undefined && productGroupExitStatusList !== null && SortProductList !== null) {
                    let participateProductList = SortProductList.filter(x => x.productGuid === productGuid);
                    if (participateProductList.length > 0) {
                        this.setState({
                            openChat: true, onlyOpenChat: true, selectedProductGroupId: editId, productData: SortProductList, selectedProductGuid: participateProductList[0].productGuid,
                            selectedProductSupplierGuid: participateProductList[0].supplierGuid, selectedProductImageName: participateProductList[0].imageName,
                            selectedProductName: participateProductList[0].productName, selectedProductRatings: participateProductList[0].ratings,
                            selectedProductCompanyName: participateProductList[0].companyName, selectedProductmoq: participateProductList[0].moq,
                            selectedProductCurrencySymbol: participateProductList[0].currencySymbol, selectedProductMinPrice: participateProductList[0].minPrice,
                            selectedProductTotalCommitment: participateProductList[0].totalQuantity,
                            selectedProductskuGuid: participateProductList[0].skuGuid,
                            selectedProductBWGuid: participateProductList[0].buyingWindowGuid,
                            selectedProductBWEndDate: participateProductList[0].buyingWindowEndDate,
                            selectedProductUserCommitments: participateProductList[0].userCommitments,
                            productExitStatusList: productGroupExitStatusList,
                        })
                    }
                }
                else {
                    let selectedProductList = this.state.productData.filter(x => x.productGuid === productGuid);
                    if (selectedProductList.length > 0) {
                        this.setState({
                            openChat: true, onlyOpenChat: true, selectedProductGroupId: editId, selectedProductGuid: productGuid,
                            selectedProductSupplierGuid: selectedProductList[0].supplierGuid, selectedProductImageName: selectedProductList[0].imageName,
                            selectedProductName: selectedProductList[0].productName, selectedProductRatings: selectedProductList[0].ratings,
                            selectedProductCompanyName: selectedProductList[0].companyName, selectedProductmoq: selectedProductList[0].moq,
                            selectedProductTotalCommitment: selectedProductList[0].totalQuantity,
                            selectedProductskuGuid: selectedProductList[0].skuGuid,
                            selectedProductBWGuid: selectedProductList[0].buyingWindowGuid,
                            selectedProductBWEndDate: selectedProductList[0].buyingWindowEndDate,
                            selectedProductUserCommitments: selectedProductList[0].userCommitments,
                            selectedProductCurrencySymbol: selectedProductList[0].currencySymbol, selectedProductMinPrice: selectedProductList[0].minPrice
                        })
                    }
                }
            }
        });
    }

    GetUserProductExitStatusOnBW = (ProductGuid) => {
        let productGuidList = [];
        productGuidList.push(ProductGuid)
        var config = {
            headers: {
                'Authorization': 'Bearer ' + localStorage.tokenId,
                'Content-Type': 'application/json',
                'List': productGuidList,
                'UserGuid': localStorage.userId
            },
        };
        axios.get(getServiceUrl() + 'BuyingWindow/GetProductGroupCardData', config)
            .then((response) => {
                this.setState({ productExitStatusList: response.data.productGroupExitStatusList });
            })
    }
    render() {
        return (
            <React.Fragment>
                <div className="collaborate_tab">
                    <span>Collaborate</span>
                    <img alt=" " src={Collabrate_icon} />
                    <div className="collaborate_tab_right">
                        {/* {this.state.openChat && this.state.showParticipant === false ? <Group onClick={this.showParticipant} /> : ''}
                        {this.state.showParticipant ? <Chat onClick={this.onlyOpenChat} /> : ''} */}
                        {<Close onClick={this.props.hideColl} />}
                    </div>
                </div>
                <div className="collaborate_main">
                    <div style={({ display: this.state.loading ? 'none' : 'block' })}>
                        {this.state.productData.length === 0 && this.state.showEmptyMsg ?
                            <div style={{ padding: '100px' }}>No Product Group Found</div> :
                            <CollaborationProductCard
                                ProductList={this.state.productData}
                                openChatProps={this.openChat}
                                openChatState={this.state.openChat}
                                productExitStatusList={this.state.productExitStatusList}
                                ListRateCard={this.state.ListRateCard}
                                productBuyerPreferenceList={this.state.productBuyerPreferenceData} />}
                        {this.state.onlyOpenChat ?
                            <div className={this.state.openChat === true || this.onlyOpenChat === true ? "CollaborateChat_main" : 'CollaborateChat_main_hide'}>
                                {this.state.openChat ? <KeyboardArrowLeft className="collab_back_btn" onClick={this.openProductList} /> : ''}
                                <CollaborateChat
                                    supplierGuid={this.state.selectedProductSupplierGuid}
                                    imageName={this.state.selectedProductImageName}
                                    productName={this.state.selectedProductName}
                                    ratings={this.state.selectedProductRatings}
                                    companyName={this.state.selectedProductCompanyName}
                                    moq={this.state.selectedProductmoq}
                                    currencySymbol={this.state.selectedProductCurrencySymbol}
                                    minPrice={this.state.selectedProductMinPrice}
                                    showParticipant={this.state.showParticipant}
                                    productGuid={this.state.selectedProductGuid}
                                    totalCommitment={this.state.selectedProductTotalCommitment}
                                    skuGuid={this.state.selectedProductskuGuid}
                                    buyingWindowEndDate={this.state.selectedProductBWEndDate}
                                    productGroupId={this.state.selectedProductGroupId}
                                    ListRateCard={this.state.ListRateCard}
                                    UserCommitments={this.state.selectedProductUserCommitments}
                                    LanguageResources={this.state.resources}
                                    BuyingWindowGuid={this.state.selectedProductBWGuid}
                                    ListProductVariant={this.state.ListVariant}
                                    NewListRateCard={this.state.NewListRateCard}
                                    getUserProductExitStatusOnBWCreation={this.GetUserProductExitStatusOnBW}
                                    isUpdated={this.state.productData.filter(x => x.productGuid === this.state.selectedProductGuid)[0].isUpdated}
                                    productUpdatedDate={this.state.productData.filter(x => x.productGuid === this.state.selectedProductGuid)[0].productModifiedDate}
                                />
                            </div> : null}
                    </div>
                    <div style={({ display: this.state.loading ? 'block' : 'none' })}>
                        <Spinner />
                    </div>
                </div>

            </React.Fragment>
        )
    }
}
const mapStateToProps = state => {
    return {
        userId: state.login.userId,
        languageId: state.login.languageId,
        userType: state.login.userType,
        permissions: state.login.permissions
    };
};

export default connect(mapStateToProps)(Collaboration);
