import Done from "@material-ui/icons/Done";
import queryString from "query-string";
import React, { Component } from "react";
import { getAWSUrl } from '../../config';
import * as RoleCodes from "../../rolecodes";
import Button from "../../UI/Button/MaterialButton";
import GridContainer from "../Material/Grid/GridContainer";
import GridItem from "../Material/Grid/GridItem.jsx";
const temporaryholdinginfo = [];
class SelectTargetMarket extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeStep: 0,
            TargetRegionData: [],
            RegionCountryData: [],
            selectedTargetRegion: [],
            selectedRegionCountry: [],
            finalTargetMarketDetail: [],
            nextToErrorMsg: ''
        }
    }
    async componentDidMount() {
        if (this.props.targetRegionData !== undefined) {
            this.setState({ TargetRegionData: this.props.targetRegionData });
        }
        if (this.props.RegionCountryData !== undefined) {
            this.setState({ RegionCountryData: this.props.RegionCountryData });
        }
        if (this.props.selectedTargetRegion !== undefined) {
            if (this.props.selectedTargetRegion.length !== 0) {
                this.setState({ selectedTargetRegion: this.props.selectedTargetRegion });
            }
        }
        if (this.props.selectedRegionCountry !== undefined) {
            if (this.props.selectedRegionCountry.length !== 0) {
                this.setState({ selectedRegionCountry: this.props.selectedRegionCountry });
            }
        }
    }
    regionclicknext = (event) => {
        const { next = f => f } = this.props;
        var data = this.state.selectedTargetRegion;
        //if (data.length > 0) {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
        next(data);
        // }
        // else {
        //     this.setState({ nextToErrorMsg: 'Select atleast one region' })
        // }
    }
    countryclicknext = (event) => {
        const { next = f => f } = this.props;
        var data = this.state.selectedRegionCountry;
        // const regionCountrydata = [];
        // for (let i = 0; i < data.length; i++) {
        //     this.state.finalTargetMarketDetail.filter(items => items.countryguid == data[i]).map(newitem => {
        //         regionCountrydata.push(newitem);
        //     })
        // };
        let anySelected = false;
        let contrySelectedData = this.state.RegionCountryData;
        contrySelectedData.map(x => {
            x.listCountry.map(subitem => {
                if (subitem.isSelected) {
                    anySelected = true;
                }
            });
        });
        if (anySelected) {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
            next(data);

        }
        else {
            this.setState({ nextToErrorMsg: 'Select atleast one country' })
        }

    }
    regionclickprev = (event) => {
        const { back = f => f } = this.props;
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
        back();
    }
    countryclickprev = (commodityGuid, commodityName) => {
        const { back = f => f } = this.props;
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
        back();
    }
    selectTargetRegion = (event, regionguid) => {
        var data = this.state.TargetRegionData;
        var selecteddata = this.state.selectedTargetRegion;
        var UpdatedTargetRegionData = data.map((item) => {
            if (item.regionguid === regionguid) {
                if (item.isSelected) {
                    item.isSelected = false;
                    let arr = selecteddata.filter(function (item) {
                        return item !== regionguid
                    })
                    selecteddata = arr;
                } else {
                    item.isSelected = true;
                    selecteddata.push(regionguid)

                }
            }
            return item;
        });
        this.setState({ TargetRegionData: UpdatedTargetRegionData, selectedTargetRegion: selecteddata, nextToErrorMsg: '' });
        localStorage.setItem('SRMcomment', 'false')
    }
    selectRegionCountry = (event, regionguid, countryguid) => {
        var data = this.state.RegionCountryData;
        var selecteddata = this.state.selectedRegionCountry;
        var UpdatedRegionCountryData = data.map(x => {
            if (x.regionguid === regionguid) {
                let subcate = x.listCountry.map(subitem => {
                    if (subitem.countryguid === countryguid) {
                        if (subitem.isSelected) {
                            subitem.isSelected = false;
                            let arr = selecteddata.filter(function (item) {
                                return item !== countryguid
                            })
                            selecteddata = arr;
                        } else {
                            subitem.isSelected = true;
                            selecteddata.push(countryguid)
                            let indexofcountryGuid = temporaryholdinginfo.filter(item => item.countryguid == countryguid).length;
                            if (indexofcountryGuid == 0) {
                                temporaryholdinginfo.push({
                                    regionguid: regionguid,
                                    countryguid: countryguid,
                                }
                                )
                            }
                            this.setState({ finalTargetMarketDetail: temporaryholdinginfo, });
                        }
                    }
                    return subitem;
                });
                x.listCountry = subcate;

            }
            return x;
        });
        this.setState({ RegionCountryData: UpdatedRegionCountryData, selectedRegionCountry: selecteddata, nextToErrorMsg: '' });
        localStorage.setItem('SRMcomment', 'false')
    }
    regionWiseSelectAll = (event, regionguid, status) => {
        var data = this.state.RegionCountryData;
        var selecteddata = this.state.selectedRegionCountry;
        var UpdatedRegionCountryData = data.map(x => {
            if (x.regionguid === regionguid) {
                let subcate = x.listCountry.map(subitem => {
                    subitem.isSelected = status;
                    return subitem;
                });
                x.listCountry = subcate;
            }
            return x;
        });
        this.setState({ RegionCountryData: UpdatedRegionCountryData, selectedRegionCountry: selecteddata, nextToErrorMsg: '' });
        localStorage.setItem('SRMcomment','false')
    }

    render() {
        let awsURL = getAWSUrl();
        let userType = null;
        if (JSON.parse(localStorage.userType) === RoleCodes.BUYER) {
            userType= JSON.parse(localStorage.userType);
        }
        else if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIER) {
            userType= JSON.parse(localStorage.userType);
        } else if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIERRELATIONSHIPMANAGER) {
            let params = queryString.parse(window.location.search);
            if (params.Rolename.toUpperCase() === RoleCodes.BUYER) {
                userType=  params.Rolename.toUpperCase();
            }
            if (params.Rolename.toUpperCase() === RoleCodes.SUPPLIER) {
                userType=  params.Rolename.toUpperCase();
            }
        }
        return (
            <div className="product_info_form">
                <div>
                <div className="subTitle_header"><p>
                {this.props.name == "targetregion" && userType === RoleCodes.BUYER && "We have more than 500 sustainable suppliers to fulfill your requirements, lets understand your target market"}
                {this.props.name == "targetregion" && userType === RoleCodes.SUPPLIER && "You got a good portfolio of products, lets understand your target market"}
                {this.props.name == "regioncountry" && "Thats great, lets understand the list of countries you served"}</p>
                    <span>Select your target regions that you served </span>
                    </div>
                    <GridContainer>
                        {this.state.TargetRegionData.length > 0 ?
                            this.state.TargetRegionData.map(item => (
                                <GridItem md={2} sm={3} xs={4}>
                                    <div onClick={(event) => this.selectTargetRegion(event, item.regionguid)} className="prod_info_list_blocks country_blocks region_blocks">
                                        {/* <span>{item.regionName}</span>
                                            {item.isSelected ? <Done /> : ""} */}
                                        {/* <div className="icons_list_block">
                                            <div>
                                                {item.image === null ? '' : <img src={awsURL + "RegionIcons/" + item.image} />}
                                                <p>{item.regionName}</p>
                                            </div>
                                            <div>
                                                {item.isSelected ? <Done /> : ""}
                                            </div>
                                        </div> */}
                                        {item.image === null ? '' : <img src={awsURL + "RegionIcons/" + item.image} />}
                                        <div>
                                            <span style={{ textAlign: item.isSelected ? 'left' : 'center' }}>{item.regionName}</span>
                                            {item.isSelected ? <Done /> : ""}
                                        </div>
                                    </div>

                                </GridItem>
                            ))
                            : ""}
                        {this.state.RegionCountryData.length > 0 ?
                            this.state.RegionCountryData.map((item, index) => (
                                <>
                                    <GridItem md={12}>
                                        <div className="product_info_top"><h6>{item.regionName} - {item.listCountry.length} countries </h6>
                                            {item.listCountry.length == (item.listCountry.filter(item => item.isSelected == true).length) ?
                                                <Button onClick={(event) => this.regionWiseSelectAll(event, item.regionguid, false)} orangeSubmit>Deselect All</Button>
                                                :
                                                <Button onClick={(event) => this.regionWiseSelectAll(event, item.regionguid, true)} orangeSubmit>Select All</Button>
                                            }
                                        </div>

                                    </GridItem>

                                    {item.listCountry.map(subitem => (

                                        <GridItem md={3} lg={2} sm={3} xs={4}>

                                            <div onClick={(event) => this.selectRegionCountry(event, item.regionguid, subitem.countryguid)} className="prod_info_list_blocks country_blocks">
                                                {/* <span>{subitem.countryName}</span> */}
                                                {subitem.countryCode === null ? '' : <img src={awsURL + "FlagIcons/" + subitem.countryCode + ".svg"} />}
                                                <div>
                                                    <span style={{ textAlign: subitem.isSelected ? 'left' : 'center' }}>{subitem.countryName}</span>
                                                    {subitem.isSelected ? <Done /> : ""}
                                                </div>

                                            </div>

                                        </GridItem>
                                    ))
                                    }
                                </>
                            ))
                            : ""}
                        <GridItem md={12}>
                            <div className="supp_onboarding_action_btn">
                                {this.props.name == "targetregion" && <Button onClick={this.regionclickprev} className="outline_btn_new">Prev</Button>}
                                {this.props.name == "targetregion" && <Button onClick={this.regionclicknext} className="solid_btn_new">Next</Button>}
                                {this.props.name == "regioncountry" && <Button onClick={this.countryclickprev} className="outline_btn_new">Prev</Button>}
                                {this.props.name == "regioncountry" && <Button onClick={this.countryclicknext} className="solid_btn_new">Next</Button>}
                                {this.state.nextToErrorMsg && <div class="newThemeError nextBtnError"><p>{this.state.nextToErrorMsg}</p></div>}
                            </div>
                        </GridItem>
                    </GridContainer>
                </div>
            </div>

        )
    }
}
export default (SelectTargetMarket);