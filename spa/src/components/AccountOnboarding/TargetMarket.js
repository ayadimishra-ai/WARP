import axios from 'axios';
import queryString from "query-string";
import React, { Component } from "react";
import { confirmAlert } from 'react-confirm-alert';
import CommentsLog from "../../components/AccountOnboarding/CommentsLog";
import { getRegionCountryElasticIndex, getServiceUrl } from '../../config';
import * as RoleCodes from "../../rolecodes";
import Spinner from "../../UI/Spinner/Spinner";
import { getElasticData } from '../../utility';
import SelectTargetMarket from "./SelectTargetMarket";
class TargetMarket extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeStep: 0,
            TargetRegionData: [],
            RegionCountryData: [],
            showTargetRegion: true,
            showRegionCountry: false,
            selectedTargetRegion: [],
            selectedRegionCountry: [],
            Commoditydetails: [],
            ExistingCountryGuid: [],
            CommentLog: [],
            CommentLogDetails: [],
            commentError: null,
            IsSRMUser: false
        }
    }
    async componentDidMount() {
        if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIERRELATIONSHIPMANAGER) {
            this.setState({ IsSRMUser: true });
        }
        if (this.props.GetTargetRegionDetails !== undefined && this.props.GetTargetRegionDetails !== null) {
            const selectedTargetRegion = [];
            const selectedCountry = [];
            const countryGuid = [];
            let data = this.props.GetTargetRegionDetails;

            data.map((item) => {
                selectedTargetRegion.push(item.regionguid);
                selectedCountry.push(item.countryguid);
                countryGuid.push(item.countryguid);
            });

            this.setState({ selectedTargetRegion: selectedTargetRegion, selectedRegionCountry: selectedCountry, ExistingCountryGuid: countryGuid });
            //await this.setState({ selectedTargetRegion: selectedTargetRegion, selectedRegionCountry: selectedCountry });

        }
        if (this.props.GetProductInfoDetails !== undefined && this.props.GetProductInfoDetails !== null) {
            await this.setState({ Commoditydetails: this.props.GetProductInfoDetails });
        }
        else {
            await this.setState({ Commoditydetails: this.state.Commoditydetails });
        }
        if (this.props.getCommentLogDetail !== undefined && this.props.getCommentLogDetail !== null) {
            await this.setState({ CommentLogDetails: this.props.getCommentLogDetail });
        }
        await this.GetTargetRegions();
    }
    async GetTargetRegions() {
        this.setState({ loading: true });
        let url = getRegionCountryElasticIndex();
        let splitURL = [];
        splitURL = url.replace("https://", "").replace("http://").split("/");
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
                commonquery = '"query": {"bool": {"must": [';

                for (let j = 0; j < splitdata.length; j++) {
                    if (splitdata[j].indexOf(":") > -1) {
                        let data = splitdata[j].split(":");
                        commonquery = commonquery + '{"match": {"' + data[0] + '": "' + data[1] + '"}}';
                    }
                }
                commonquery = commonquery + ']}}';
            }
        }

        if (commonquery !== "") {
            commonquery = JSON.parse("{" + commonquery + "}");
        } else {
            commonquery = "";
        }

        await getElasticData(index, commonquery, 0, 1000, "").then(response => {
            if (response !== null) {
                let array1 = [];
                let todos = [];
                for (let count = 0; count < response.hits.hits.length; count++) {
                    if (response.hits.hits[count]._source.regionGuid !== "00000000-0000-0000-0000-000000000000") {
                        todos.push(response.hits.hits[count]._source)
                    }
                }
                array1 = todos.map(item => {
                    let countries = item.listCountry.map(country => {
                        let data = {
                            isSelected: false,
                            countryguid: country.countryGuid,
                            countryName: country.countryName,
                            countryCode: country.countryCode
                        }
                        return data;
                    });
                    let data = {
                        isSelected: false,
                        regionguid: item.regionGuid,
                        regionName: item.regionName,
                        image: item.image,
                        listCountry: countries
                    }
                    return data;
                });


                let selectedTargetRegionList = this.state.selectedTargetRegion;
                if (selectedTargetRegionList.length > 0) {
                    var UpdatedTargetRegionData = array1.map((item) => {
                        if (selectedTargetRegionList.includes(item.regionguid)) {
                            item.isSelected = true;
                        }
                        return item;
                    });
                }

                this.setState({ TargetRegionData: array1, loading: false });

            }
        }).catch((err) => {
            this.setState({ loading: false });
            console.error(err)
        });

    }
    showRegionCountry = (Data) => {
         
        if (Data.length > 0) {
            let getRegionData = this.state.TargetRegionData;
            let regionCountrydata = getRegionData.filter(item => Data.includes(item.regionguid)).map(filtereditem => (filtereditem))

            let selectedRegionCountryList = this.state.selectedRegionCountry;
            if (selectedRegionCountryList.length > 0) {
                var UpdatedRegionCountryData = regionCountrydata.map(x => {
                    let subcate = x.listCountry.map(subitem => {
                        if (selectedRegionCountryList.includes(subitem.countryguid)) {
                            subitem.isSelected = true;
                        }
                        return subitem;
                    });
                    x.listCountry = subcate;
                    return x;
                });
            }
            this.setState({ showTargetRegion: false, showRegionCountry: true, RegionCountryData: regionCountrydata, selectedTargetRegion: Data });
        }
        else {
            const { stepNext = f => f } = this.props;

            stepNext(Data, "Facilities");
        }
    }
    showTargetRegionPrev = (value) => {
        
        this.setState({ showTargetRegion: true, showRegionCountry: false, TargetRegionData: this.state.TargetRegionData });
    }
    showProductInfoPrev = (event) => {
        const { stepBack = f => f } = this.props;
        let getRegionData = this.state.TargetRegionData;
        let temporaryholdinginfo = this.props.GetTargetRegionDetails;
        let temporaryContries = [];
        if (temporaryholdinginfo.length > 0) {
            let getSelectedRegion = getRegionData.filter(item => item.isSelected).map(filtereditem => (filtereditem.regionguid));
            if (getSelectedRegion.length > 0) {
                temporaryholdinginfo = temporaryholdinginfo.filter(item => (getSelectedRegion.includes(item.regionguid)))
            }
            getRegionData.map(x => {
                if (x.isSelected) {
                    x.listCountry.map(subitem => {
                        if (subitem.isSelected) {
                            temporaryContries.push(subitem.countryguid);
                        }
                    });
                }
            });
            if (temporaryContries.length > 0) {
                temporaryholdinginfo = temporaryholdinginfo.filter(item => (temporaryContries.includes(item.countryguid)))
            }
        }
        var UpdatedRegionCountryData = getRegionData.map(x => {
            if (x.isSelected) {
                let subcate = x.listCountry.map(subitem => {
                    if (subitem.isSelected) {
                        let isexist = temporaryholdinginfo.filter(y => y.regionguid === x.regionguid && y.countryguid === subitem.countryguid).length;
                        if (isexist === 0) {
                            temporaryholdinginfo.push({
                                regionguid: x.regionguid,
                                countryguid: subitem.countryguid,
                            })
                        }
                    }
                    return subitem;
                });
                x.listCountry = subcate;
                let isexist = temporaryholdinginfo.filter(y => y.regionguid === x.regionguid).length;
                if (isexist === 0) {
                    temporaryholdinginfo.push({
                        regionguid: x.regionguid,
                        countryguid: null,
                    })
                }
            }
            return x;
        });
        if (temporaryholdinginfo.length > 0) {
            let selectedData = temporaryholdinginfo.filter(item => item.countryguid != null);
            let existData = this.state.ExistingCountryGuid;
            let existNew = selectedData.map(filtereditem => (filtereditem.countryguid));
            let isUpdateExisting = existNew.filter(item => (!existData.includes(item)));
            let isUpdateNew = existData.filter(item => (!existNew.includes(item)));
            let IsValid = true;
            let Iscomment = false
            
            if (localStorage.SRMcomment !== undefined && localStorage.SRMcomment !== "" && localStorage.SRMcomment === "false") {
                Iscomment = false;
            }
            else {
                Iscomment = true;
            }

            
            if (isUpdateExisting.length > 0 || isUpdateNew.length > 0) {
                let companyGuid = "", Rolename = "", QueryUserGuid = "00000000-0000-0000-0000-000000000000";
                if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIERRELATIONSHIPMANAGER) {
                    let params = queryString.parse(window.location.search);
                    companyGuid = params.Companyguid;
                    Rolename = params.Rolename;
                    QueryUserGuid = params.UserGuid;
                    let commentLog = this.state.CommentLog;
                    if (commentLog.length == 0 || Iscomment===false) {
                        IsValid = false;
                        this.setState({ loading: false, commentError: 'Comments field is blank. Please enter detail in comments.' });
                    }
                }
                else if (JSON.parse(localStorage.userType) == RoleCodes.SUPPLIER) {
                    companyGuid = localStorage.companyGuid;
                    Rolename = localStorage.userType !== null ? String(localStorage.userType).indexOf("\"") > -1 ? JSON.parse(localStorage.userType) : localStorage.userType : "";
                    QueryUserGuid = localStorage.userId;
                }
                else if (JSON.parse(localStorage.userType) == RoleCodes.BUYER) {
                    companyGuid = localStorage.companyGuid;
                    Rolename = localStorage.userType !== null ? String(localStorage.userType).indexOf("\"") > -1 ? JSON.parse(localStorage.userType) : localStorage.userType : "";
                    QueryUserGuid = localStorage.userId;
                }
                if (IsValid) {
                    this.setState({ loading: true });
                    var body = {
                        'CompanyGuid': companyGuid,
                        'RoleName': Rolename,
                        'UserGuid': QueryUserGuid,
                        'SrmGuid': localStorage.userId,
                        'issubmit': false,
                        'TargetMarket': selectedData
                    };
                    var config = {
                        headers: {
                            'Authorization': 'Bearer ' + localStorage.tokenId,
                            'Content-Type': 'application/json'
                        },
                    };
                    axios.post(getServiceUrl() + 'Onboarding/UpdateAccountDetails?', body, config)
                        .then((response) => {
                            if (response.status === 200) {
                                this.setState({ loading: false });
                                let main = {
                                    ProductInfoDetails: this.state.Commoditydetails,
                                    TargetRegionData: selectedData
                                }
                                window.scrollTo({
                                    top: 0,
                                    behavior: "smooth"
                                });
                                stepBack(null, main, "Product Info");
                            }
                        }).catch((err) => {
                            confirmAlert({
                                message: "Something went wrong. Please try again.",
                                buttons: [
                                    {
                                        label: 'OK',
                                        onClick: () => {
                                            this.setState({ loading: false });
                                        }
                                    }
                                ]
                            });
                        });

                }
            }
            else {
                let main = {
                    ProductInfoDetails: this.state.Commoditydetails,
                    TargetRegionData: selectedData
                }
                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });
                stepBack(null, main, "Product Info");
            }
        }
        else {
            let main = {
                ProductInfoDetails: this.state.Commoditydetails,
                TargetRegionData: temporaryholdinginfo
            }
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
            stepBack(null, main, "Product Info");
        }

    }
    showFacilities = (Data, event) => {
        
        const { stepNext = f => f } = this.props;
        let selectedRegionCountry = this.state.RegionCountryData;
        let temporaryholdinginfo = [];
        selectedRegionCountry.map(x => {
            if (x.isSelected) {
                let subcate = x.listCountry.map(subitem => {
                    if (subitem.isSelected) {
                        temporaryholdinginfo.push({
                            regionguid: x.regionguid,
                            countryguid: subitem.countryguid,
                        })
                    }
                    return subitem;
                });
                x.listCountry = subcate;

            }
            return x;
        });
        if (temporaryholdinginfo.length > 0) {
            let existData = this.state.ExistingCountryGuid;
            let existNew = temporaryholdinginfo.map(filtereditem => (filtereditem.countryguid));
            let isUpdateExisting = existNew.filter(item => (!existData.includes(item)));
            let isUpdateNew = existData.filter(item => (!existNew.includes(item)));
            let IsValid = true
            let Iscomment = false
            
            if (localStorage.SRMcomment !== undefined && localStorage.SRMcomment !== "" && localStorage.SRMcomment === "false") {
                Iscomment = false;
            }
            else {
                Iscomment = true;
            }

            if (isUpdateExisting.length > 0 || isUpdateNew.length > 0) {
                let companyGuid = "", Rolename = "", QueryUserGuid = "00000000-0000-0000-0000-000000000000";
                if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIERRELATIONSHIPMANAGER) {
                    let params = queryString.parse(window.location.search);
                    companyGuid = params.Companyguid;
                    Rolename = params.Rolename;
                    QueryUserGuid = params.UserGuid;
                    let commentLog = this.state.CommentLog;
                    if (commentLog.length == 0 || Iscomment ===false) {
                        IsValid = false;
                        this.setState({ loading: false, commentError: 'Comments field is blank. Please enter detail in comments.' });
                    }
                }
                else if (JSON.parse(localStorage.userType) == RoleCodes.SUPPLIER) {
                    companyGuid = localStorage.companyGuid;
                    Rolename = localStorage.userType !== null ? String(localStorage.userType).indexOf("\"") > -1 ? JSON.parse(localStorage.userType) : localStorage.userType : "";
                    QueryUserGuid = localStorage.userId;
                }
                else if (JSON.parse(localStorage.userType) == RoleCodes.BUYER) {
                    companyGuid = localStorage.companyGuid;
                    Rolename = localStorage.userType !== null ? String(localStorage.userType).indexOf("\"") > -1 ? JSON.parse(localStorage.userType) : localStorage.userType : "";
                    QueryUserGuid = localStorage.userId;
                }
                if (IsValid) {
                    this.setState({ loading: true });
                    var body = {
                        'CompanyGuid': companyGuid,
                        'RoleName': Rolename,
                        'UserGuid': QueryUserGuid,
                        'SrmGuid': localStorage.userId,
                        'issubmit': false,
                        'TargetMarket': temporaryholdinginfo
                    };
                    var config = {
                        headers: {
                            'Authorization': 'Bearer ' + localStorage.tokenId,
                            'Content-Type': 'application/json'
                        },
                    };
                    axios.post(getServiceUrl() + 'Onboarding/UpdateAccountDetails?', body, config)
                        .then((response) => {
                            if (response.status === 200) {
                                this.setState({ loading: false });
                                window.scrollTo({
                                    top: 0,
                                    behavior: "smooth"
                                });
                                stepNext(temporaryholdinginfo, "Facilities");
                            }
                        }).catch((err) => {
                            confirmAlert({
                                message: "Something went wrong. Please try again.",
                                buttons: [
                                    {
                                        label: 'OK',
                                        onClick: () => {
                                            this.setState({ loading: false });
                                        }
                                    }
                                ]
                            });
                        });


                }
            }
            else {
                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });
                stepNext(temporaryholdinginfo, "Facilities");
            }
        }
        else {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
            stepNext(temporaryholdinginfo, "Facilities");
        }
    }
    bindCommentLog = (Data) => {
        
        
        this.setState({ CommentLog: Data, commentError: null });
    }
    render() {
        
        let temp = this.state.ExistingCountryGuid;
        if (this.state.loading) {
            return <Spinner />
        } else {
            return (
                <React.Fragment>
                    <div>
                        {this.state.TargetRegionData.length > 0 && this.state.showTargetRegion && <SelectTargetMarket targetRegionData={this.state.TargetRegionData} selectedTargetRegion={this.state.selectedTargetRegion} back={this.showProductInfoPrev} next={this.showRegionCountry} name={'targetregion'} />}
                        {this.state.showRegionCountry && <SelectTargetMarket RegionCountryData={this.state.RegionCountryData} selectedRegionCountry={this.state.selectedRegionCountry} next={this.showFacilities} back={this.showTargetRegionPrev} name={'regioncountry'} />}
                    </div>
                    {this.state.CommentLogDetails.length > 0 || this.state.IsSRMUser ? <CommentsLog CommentLogData={this.state.CommentLogDetails} next={this.bindCommentLog} getcommentError={this.state.commentError} /> : ""}
                </React.Fragment>
            )
        }
    }
}
export default (TargetMarket);