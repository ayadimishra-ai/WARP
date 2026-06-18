import Drawer from '@material-ui/core/Drawer';
import CheckCircleIcon from '@material-ui/icons//CheckCircle';
import Close from '@material-ui/icons/Close';
import Delete from '@material-ui/icons/Delete';
import Edit from '@material-ui/icons/Edit';
import Place from '@material-ui/icons/PlaceOutlined';
import axios from 'axios';
import queryString from "query-string";
import React, { Component } from "react";
import { confirmAlert } from 'react-confirm-alert';
import onboarding3 from '../../assets/img/Signuponboarding/onboarding3.png';
import CommentsLog from "../../components/AccountOnboarding/CommentsLog";
import UserAddress from "../../components/AccountOnboarding/UserAddress";
import { getServiceUrl, getWebsiteGUID } from '../../config';
import * as RoleCodes from "../../rolecodes";
import Spinner from '../../UI/Spinner/Spinner';
import GridContainer from "../Material/Grid/GridContainer";
import GridItem from "../Material/Grid/GridItem.jsx";

const initialState = {
    FacilityAddressDetails: {
        AddressType: {
            elementType: 'select',
            class: "newInput",
            elementConfig: {
                options: [],
                disabled: false
            },
            value: '0',
            validation: {
                required: true,
            },
            requiredclass: 'required',
            newThemeError: '',
            valid: false,
            touched: false,
            label: "Address type *",
        },
        AddressTitle: {
            elementType: "input",
            class: "newInput",
            newThemeError: "",
            elementConfig: { placeholder: 'For e.g. Branch Office Mumbai' },
            value: "",
            validation: {
                required: true,
                alphaNumericOnlySpace: true,
                maxLength: 150,
            },
            requiredclass: "required",
            label: "Address title *",
            valid: false,
            touched: false
        },
        Address: {
            elementType: "input",
            class: "newInput",
            newThemeError: "",
            elementConfig: { placeholder: 'Enter plot no., street name' },
            value: "",
            validation: {
                required: true,
                maxLength: 150,
            },
            requiredclass: "required",
            label: "Address *",
            valid: false,
            touched: false
        },
        Landmark: {
            elementType: "input",
            class: "newInput",
            newThemeError: "",
            elementConfig: { placeholder: 'Enter landmark, nearby areas etc.' },
            value: "",
            validation: {
                required: false,
                maxLength: 150,
            },
            requiredclass: "required",
            label: "Landmark",
            valid: false,
            touched: false
        },
        Country: {
            elementType: 'select',
            class: "newInput",
            elementConfig: {
                options: [],
                disabled: false
            },
            value: '0',
            validation: {
                required: true,
            },
            requiredclass: 'required',
            newThemeError: '',
            valid: false,
            touched: false,
            label: "Country *",
        },
        State: {
            elementType: 'select',
            class: "newInput",
            elementConfig: {
                options: [],
                disabled: false
            },
            value: '0',
            validation: {
                required: true,
            },
            requiredclass: 'required',
            newThemeError: '',
            valid: false,
            touched: false,
            label: "State *",
        },
        City: {
            elementType: "select",
            class: "newInput",
            elementConfig: {
                options: [],
                disabled: false
            },
            newThemeError: "",
            //elementConfig: { placeholder: 'Enter city' },
            value: "",
            validation: {
                required: true,
                // alphaNumericOnly: true,
                // maxLength: 50,
            },
            requiredclass: "required",
            label: "City *",
            valid: false,
            touched: false
        },
        Pincode: {
            elementType: "input",
            class: "newInput",
            newThemeError: "",
            elementConfig: { placeholder: 'Enter zipcode' },
            value: "",
            validation: {
                required: true,
                alphaNumericOnly: true,
                maxLength: 6,
                zipcodeFormat: true,
            },
            requiredclass: "required",
            label: "Zipcode *",
            valid: false,
            touched: false
        }
    },
    OwnerTypeDetails: {        
        OwnerType: {
            elementType: 'select_2',
            class: "newInput_2",
            elementConfig: {
                options: [],
                disabled: false
            },
            value: '0',
            validation: {
                required: true,
            },
            requiredclass: 'required',
            newThemeError: 'OwnerType is required.',
            valid: true,
            touched: true,
            label: "OwnerType *",
        }
    }
}
class FacilityInfo extends Component {
    constructor(props) {
        super(props);
        this.userAddress = React.createRef();
        this.state = {
            ...initialState,
            loading: false,
            right: false,
            facilityExistAddressList: [],
            facilityAddressList: [],
            addressTypeText: null,
            countryText: null,
            stateText: null,
            showReset: false,
            showSave: false,
            currentAddressGuid: null,
            isEditAddress: false,
            TargetRegionData: [],
            tcountryText: [],
            tstateText: [],
            currentIndex: 0,
            successAddres: '',
            existingFacilityAddressDetails: [],
            existingAddressLength: 0,
            CommentLog: [],
            CommentLogDetails: [],
            commentError: null,
            IsSRMUser: false,
            RegisterOfficeId: null,
            AddreyTypeDetails: [],
            EditAddresList: [],
            commentDrawer: false,
            companyGuid: "00000000-0000-0000-0000-000000000000",
            UserGuid: "00000000-0000-0000-0000-000000000000",
            selectedProductedType: [],
            selectedProductTypeTextValue: [],
            GeneralDetailsData: [],
            deleteaddress: false,
            ManufacturingDetails:''
        }
    }
    toggleDrawer = (side, open) => () => {
        this.setState({
            [side]: open,
        });
    };
    toggleCommentDrawer = (side, open) => () => {
        this.setState({
            [side]: open,
        });
        if (this.state.viewcmnt) {
            this.setState({ viewcmnt: false })
        } else {
            this.setState({ viewcmnt: true })
        }
    };
    async componentDidMount() {
        // localStorage.setItem('deleteaddress', 'false')
        if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIERRELATIONSHIPMANAGER) {
            this.setState({ IsSRMUser: true });
        }
        if (JSON.parse(localStorage.userType) === RoleCodes.BUYER) {
            this.setState({ SetUserType: JSON.parse(localStorage.userType) });
        }
        else if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIER) {
            this.setState({ SetUserType: JSON.parse(localStorage.userType) });
        } else if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIERRELATIONSHIPMANAGER) {
            let params = queryString.parse(window.location.search);
            if (params.Rolename.toUpperCase() === RoleCodes.BUYER) {
                this.setState({ SetUserType: params.Rolename.toUpperCase() });
            }
            if (params.Rolename.toUpperCase() === RoleCodes.SUPPLIER) {
                this.setState({ SetUserType: params.Rolename.toUpperCase() });
            }
        }
        else if (JSON.parse(localStorage.userType) === RoleCodes.VENTURECAPITALIST) {
            this.setState({ SetUserType: JSON.parse(localStorage.userType) });
        }
        else if (JSON.parse(localStorage.userType) === RoleCodes.ORGANIZATIONADMIN) {
            this.setState({ SetUserType: JSON.parse(localStorage.userType) });
        }

        if (this.props.GetselectedProductedType !== undefined && this.props.GetselectedProductedType !== null) {
            this.setState({ selectedProductedType: this.props.GetselectedProductedType });
        }
        else {
            this.setState({ selectedProductedType: this.state.selectedProductedType });
        }

        await this.getGetAccountDetails();
        await this.GetProductTypedetails();
        this.getLocationList();

    }
    GetProductTypedetails() {
        this.setState({ loading: true });
        this.setState({ ProductTypedetails: [], ProductTypes: [] });
        let Rolename = "";
        let checkUserGuid = "00000000-0000-0000-0000-000000000000";
        if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIERRELATIONSHIPMANAGER) {
            let params = queryString.parse(window.location.search);
            Rolename = params.Rolename;
            checkUserGuid = params.UserGuid;
        }
        else if (JSON.parse(localStorage.userType) == RoleCodes.SUPPLIER) {
            Rolename = localStorage.userType !== null ? String(localStorage.userType).indexOf("\"") > -1 ? JSON.parse(localStorage.userType) : localStorage.userType : "";
            checkUserGuid = localStorage.userId;
        }
        else if (JSON.parse(localStorage.userType) == RoleCodes.BUYER) {
            Rolename = localStorage.userType !== null ? String(localStorage.userType).indexOf("\"") > -1 ? JSON.parse(localStorage.userType) : localStorage.userType : "";
            checkUserGuid = localStorage.userId;
        } 
        else if (JSON.parse(localStorage.userType) === RoleCodes.VENTURECAPITALIST) {
            Rolename = localStorage.userType !== null ? String(localStorage.userType).indexOf("\"") > -1 ? JSON.parse(localStorage.userType) : localStorage.userType : "";
            checkUserGuid = localStorage.userId;
        }
        else if (JSON.parse(localStorage.userType) === RoleCodes.ORGANIZATIONADMIN) {
            Rolename = localStorage.userType !== null ? String(localStorage.userType).indexOf("\"") > -1 ? JSON.parse(localStorage.userType) : localStorage.userType : "";
            checkUserGuid = localStorage.userId;
        }
        var config = {
            headers: {
                "Authorization": "Bearer " + localStorage.tokenId,
                "CompanyName": this.state.GeneralDetailsData.companyName,
                "UserGuid": checkUserGuid,
                "CRNNumber": this.state.GeneralDetailsData.CINCRN,
                "PanCardNo": this.state.GeneralDetailsData.PAN,
                "RoleName": Rolename
            }
        };

        axios.get(getServiceUrl() + 'Users/GetCategoryProductTypeDetails', config)
            .then((response) => {
                if (response.data.status200OK) {
                    let arrayData1 = [];
                    let selectedProductTypeTextValue = [];
                    let selectedProductTypeValue = [];
                    let arrayData = response.data.productTypeDetails.comodityDetails;
                    if (arrayData !== null) {
                        arrayData.map((itemCommodity) => {
                            let IsCategorySelected = itemCommodity.categoryDetails.map((itemCategory) => {
                                let IsSubCategorySelected = itemCategory.subCategoryDetails.map((itemSubCategory) => {
                                    let ProductTotalCount = itemSubCategory.productTypeDetail.length;
                                    let ProductSelectedCount = itemSubCategory.productTypeDetail.filter(x => x.isSelected === true).length;

                                    itemSubCategory.productTypeDetail.map((item) => {
                                        if (item.isSelected) {
                                            arrayData1.push(item.productGuid);
                                            selectedProductTypeTextValue.push({
                                                productClassificationName: itemCommodity.productClassificationName,
                                                categoryName: itemCategory.categoryName,
                                                subCategoryName: itemSubCategory.subCategoryName,
                                                productName: item.productName,
                                                commodityGuid: itemCommodity.productClassificationGuid,
                                                categoryGuid: itemCategory.categoryGuid,
                                                subCategoryGuid: itemSubCategory.subCategoryGuid,
                                                productTypeGuid: item.productGuid,
                                            });
                                        }
                                        return null;
                                    });

                                    if (ProductTotalCount === ProductSelectedCount) {
                                        itemSubCategory.isSelected = true;
                                        return true;
                                    } else {
                                        itemSubCategory.isSelected = false;
                                        return false;
                                    }
                                });

                                let TotalSubCategoryDetails = itemCategory.subCategoryDetails.length;
                                let SelectedSubCategoryDetails = IsSubCategorySelected.filter(x => x === true).length;

                                if (TotalSubCategoryDetails === SelectedSubCategoryDetails) {
                                    itemCategory.isSelected = true;
                                    return true;
                                } else {
                                    itemCategory.isSelected = false;
                                    return false;
                                }
                            });
                            let TotalCategoryDetails = itemCommodity.categoryDetails.length;
                            let SelectedCategoryDetails = IsCategorySelected.filter(x => x === true).length;
                            if (TotalCategoryDetails === SelectedCategoryDetails) {
                                itemCommodity.isSelected = true;
                            } else {
                                itemCommodity.isSelected = false;
                            }
                            return null;
                        });
                        this.setState({ ProductTypedetails: response.data.productTypeDetails.comodityDetails, ProductTypes: arrayData1, loading: false, selectedProductTypeTextValue: selectedProductTypeTextValue, selectedProductTypeValue: selectedProductTypeValue, ExistingSelectedProductTypeValue: selectedProductTypeValue });
                    } else {
                        this.setState({ ProductTypedetails: response.data.productTypeDetails.comodityDetails, ProductTypes: arrayData1, loading: false });
                    }
                }
            });
    }
    async getGetAccountDetails() {
        let companyGuid = "", Rolename = "", StatusName = "", UserGuid = "00000000-0000-0000-0000-000000000000";
        if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIERRELATIONSHIPMANAGER) {
            let params = queryString.parse(window.location.search);
            companyGuid = params.Companyguid;
            Rolename = params.Rolename;
            StatusName = params.StatusName;
            UserGuid = params.UserGuid;
        }
        else if (JSON.parse(localStorage.userType) == RoleCodes.SUPPLIER) {
            companyGuid = localStorage.companyGuid;
            Rolename = localStorage.userType !== null ? String(localStorage.userType).indexOf("\"") > -1 ? JSON.parse(localStorage.userType) : localStorage.userType : "";
            StatusName = localStorage.userStatus;
            UserGuid = localStorage.userId;
        }
        else if (JSON.parse(localStorage.userType) == RoleCodes.BUYER) {
            companyGuid = localStorage.companyGuid;
            Rolename = localStorage.userType !== null ? String(localStorage.userType).indexOf("\"") > -1 ? JSON.parse(localStorage.userType) : localStorage.userType : "";
            StatusName = localStorage.userStatus;
            UserGuid = localStorage.userId;
        }
        else if (JSON.parse(localStorage.userType) === RoleCodes.VENTURECAPITALIST) {
            companyGuid = localStorage.companyGuid;
            Rolename = localStorage.userType !== null ? String(localStorage.userType).indexOf("\"") > -1 ? JSON.parse(localStorage.userType) : localStorage.userType : "";
            StatusName = localStorage.userStatus;
            UserGuid = localStorage.userId;
        }
        else if (JSON.parse(localStorage.userType) === RoleCodes.ORGANIZATIONADMIN) {
            companyGuid = localStorage.companyGuid;
            Rolename = localStorage.userType !== null ? String(localStorage.userType).indexOf("\"") > -1 ? JSON.parse(localStorage.userType) : localStorage.userType : "";
            StatusName = localStorage.userStatus;
            UserGuid = localStorage.userId;
        }
        this.setState({ companyGuid: companyGuid, UserGuid: UserGuid });
        var config = {
            headers: {
                'Authorization': 'Bearer ' + localStorage.tokenId,
                'Content-Type': 'application/json',
                CompanyGuid: companyGuid,
                RoleName: Rolename,
                CompanyStatusName: StatusName,
                UserGuid: UserGuid
            },
        };
        await axios.get(getServiceUrl() + 'Onboarding/GetAccountDetails', config)
            .then((response) => {
                this.setState({ loading: false });
                if (response.status === 200) {
                    if (response.data.table1.length > 0) {
                        let GeneralDetailsData = {};
                        GeneralDetailsData = {
                            'companyName': response.data.table1[0].companyName.trim(), 'LegalStructure': response.data.table1[0].legalStructureGuid !== null && response.data.table1[0].legalStructureGuid !== "" ? response.data.table1[0].legalStructureGuid : "",
                            'CINCRN': response.data.table1[0].companyRegistrationNumber !== null && response.data.table1[0].companyRegistrationNumber !== "" ? response.data.table1[0].companyRegistrationNumber : "",
                            'PAN': response.data.table1[0].panCardNumber !== null && response.data.table1[0].panCardNumber !== "" ? response.data.table1[0].panCardNumber : "",
                        };
                        let ManufacturingDetails = response.data.table1[0].isManufacturing !== null && response.data.table1[0].isManufacturing !== "" ? response.data.table1[0].isManufacturing : "";
                        this.setState({ GeneralDetailsData: GeneralDetailsData,ManufacturingDetails:ManufacturingDetails });
                    }
                    if (response.data.table3.length > 0) {
                        let CommentLogData = {};
                        CommentLogData = response.data.table3;
                        this.setState({ CommentLogDetails: CommentLogData });
                    }
                }
            }).catch(err => {
                this.setState({ loading: false });
            });
    }
    async getLocationList() {

        let Address = [];
        this.setState({ loading: true });
        var config = {
            headers: {
                Authorization: "Bearer " + localStorage.tokenId,
                "Content-Type": "application/json",
                "Userguid": this.state.UserGuid,
                "UserType": JSON.parse(localStorage.userType),
                "Companyguid": this.state.companyGuid,
                "IsDelete": false
            },
        };
        let body = {
            'Address': Address, 'SrmGuid': localStorage.userId, 'issubmit': false,
            'sendmail': false
        };
        await axios.post(getServiceUrl() + 'Users/AddMultipleAddress', body, config)
            .then((response) => {
                this.setState({ facilityAddressList: response.data, loading: false });
                if (response.data.length > 0) {

                    this.editaddress(response.data[0].addressGuid, true);
                }
            }).catch((err) => {
                
          console.log("FacilityInfo2");
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

    closeSuccess = () => {
        this.setState({ successAddres: "" })
    }
    bindCommentLog = (Data) => {
        this.setState({ CommentLog: Data, commentError: null });
    }
    deleteCurrentAddressalert(addressGuid) {
        confirmAlert({
            message: "Are you sure want to delete this address?",
            buttons: [
                {
                    label: 'Yes',
                    onClick: () => {
                        this.deleteCurrentAddress(addressGuid);
                    }
                },
                {
                    label: 'Cancel',
                    onClick: () => {

                    }
                }
            ]
        });
    }
    async deleteCurrentAddress(addressguid) {
        let Address = [];
        this.setState({ loading: true });
        var config = {
            headers: {
                Authorization: "Bearer " + localStorage.tokenId,
                "Content-Type": "application/json",
                "Userguid": this.state.UserGuid,
                "Companyguid": this.state.companyGuid,
                "IsDelete": true,
                "UserType": JSON.parse(localStorage.userType),
                "WebsiteGuid": getWebsiteGUID(),
            },
        };

        Address.push({
            addressGuid: addressguid
        });
        let body = {
            'Address': Address, 'SrmGuid': localStorage.userId, 'issubmit': false,
            'sendmail': false
        };
        await axios.post(getServiceUrl() + 'Users/AddMultipleAddress', body, config)
            .then((response) => {
                this.setState({ facilityAddressList: response.data, loading: false });
                if (response.data.length > 0) {
                    this.editaddress(response.data[0].addressGuid, true);
                    if (JSON.parse(localStorage.userType) === RoleCodes.BUYER) {
                        if (!response.data[0].isdeleted) {
                            confirmAlert({
                                message: "This address can not be deleted as it is already is in use",
                                buttons: [
                                    {
                                        label: 'OK',
                                        onClick: () => {
                                            this.setState({ loading: false });
                                        }
                                    }
                                ]
                            });
                        }
                    }
                }
                else {
                    // this.userAddress.current.resetCurrentAddress(true, false)
                    this.setState({ deleteaddress: true });
                }
            }).catch((err) => {
                console.log("FacilityInfo1");
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
    async editaddress(addressguid, isEdit) {
        let addressdetail = this.state.facilityAddressList.filter(item => item.addressGuid == addressguid)[0];
        let Address = [];
        Address.push({
            addressGuid: addressguid,
            AddressLine1: addressdetail.addressLine1,
            CountryGuid: addressdetail.countryGuid,
            StateGuid: addressdetail.stateGuid,
            //City: addressdetail.city,
            CityGuid: addressdetail.cityGuid,
            ZipCode: addressdetail.zipcode,
            AddressTypeLists: addressdetail.addressTypeLists,
            AddressProductTypeMapping: addressdetail.addressProductOfferingMappings,
            OwnershipType:addressdetail.ownershipType,
            Location: addressdetail.location,
        });
        if (isEdit) {
            this.setState({ EditAddresList: Address, showReset: true, showSave: true });
        }
        else {
            this.setState({ EditAddresList: Address, showReset: false, showSave: false });
        }
        
        this.userAddress.current.updateformbody(Address, isEdit);
    }
    updatefacilityaddress(list) {
        this.setState({ facilityAddressList: list });
    }
    opendrawer(open) {
        this.setState({ commentDrawer: open });
    }
    render() {
        if (this.state.facilityAddressList === undefined && this.state.facilityAddressList === null) {

            if (localStorage.DocumentInfoPending === 'DocumentInfoPending') {
                this.onTrigger('DocumentInfoPending')
            }
            else {
            }
        }

        const formElementsArray = [];
        let Landmark = "";
        for (let key in this.state.FacilityAddressDetails) {
            formElementsArray.push({
                id: key,
                config: this.state.FacilityAddressDetails[key]
            });
        }
        let addressesSort = this.state.facilityAddressList !== undefined && this.state.facilityAddressList !== null ? this.state.facilityAddressList.sort((a, b) => a.createdDate > b.createdDate ? -1 : 1) : [];
        let userType = null;
        if (JSON.parse(localStorage.userType) === RoleCodes.BUYER) {
            userType = JSON.parse(localStorage.userType);
        }
        else if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIERRELATIONSHIPMANAGER) {
            let params = queryString.parse(window.location.search);
            if (params.Rolename.toUpperCase() === RoleCodes.BUYER) {
                userType = params.Rolename.toUpperCase();
            }
        }
        else if (JSON.parse(localStorage.userType) === RoleCodes.VENTURECAPITALIST) {
            userType = JSON.parse(localStorage.userType);
        }
        else if (JSON.parse(localStorage.userType) === RoleCodes.ORGANIZATIONADMIN) {
            userType = JSON.parse(localStorage.userType);
        }
        if (this.state.loading) {
            return <Spinner />
        } else {
            return (
                <React.Fragment>
                    <div className="basic_info_form">
                        <div className="subTitle_header"><p>Awesome! just couple of steps more</p>
                            <span>{userType === RoleCodes.BUYER ? "Address for registered office only can be added here. As of now, the shipping addresses can be added while raising an RFQ or punch-out to place the request." : "Add your facility addresses"} </span>
                        </div>
                        {this.state.successAddres && <div className="form_success_msg">
                            <div>
                                <CheckCircleIcon />
                                <span> {this.state.successAddres}</span>
                            </div>
                            <Close style={{ 'cursor': 'pointer' }} onClick={this.closeSuccess} />
                        </div>}
                        <UserAddress next={this.bindCommentLog} ref={this.userAddress} CommentLogs={this.state.CommentLog} commentlength={this.state.CommentLogDetails.length} pagetype="Onboarding" addresslist={this.state.facilityAddressList} opencommentdrawer={(open) => this.opendrawer(open)} toggleCommentDraw={() => this.toggleCommentDrawer('commentDrawer', true)} toggleDrawer={() => this.toggleDrawer('right', true)} showReset={this.state.showReset} showSave={this.state.showSave} updatelist={(list) => this.updatefacilityaddress(list)} stepNexts={(data, datatype) => this.props.stepNext(data, datatype)} stepBacks={(data, datatype) => this.props.stepBack(data, datatype)} companyGuid={this.state.companyGuid} userId={this.state.UserGuid} SetUserType={this.state.SetUserType} selectedProductTypeTextValue={this.state.selectedProductTypeTextValue} deleteaddress={this.state.deleteaddress} ManufacturingDetails={this.state.ManufacturingDetails} />
                        <Drawer className="address_drawer" anchor="right" open={this.state.right} onClose={this.toggleDrawer('right', false)}>
                            <div tabIndex={0} role="button" onClick={this.toggleDrawer('right', false)} onKeyDown={this.toggleDrawer('right', false)}>
                                <div className="address_drawer_head">
                                    <div>
                                        <h4 style={{ color: '#FF9E1B' }}>List of Addresses</h4>
                                        <Close style={{ cursor: 'pointer' }} />
                                    </div>
                                    <div>
                                        <span>{this.state.facilityAddressList.length} Facilities Added</span>
                                        {/* <span>Add address</span> */}
                                    </div>
                                </div>
                                <div className="address_drawer_list">
                                    <GridContainer>
                                        <GridItem md={12}>
                                            {addressesSort.length > 0 ?
                                                addressesSort.map((item, i) => (
                                                    <div style={{ display: 'flex' }} className="list">
                                                        <div style={{ marginRight: '10px' }}>
                                                            <Place />
                                                        </div>
                                                        <div style={{ flex: 1 }}>
                                                            {/* <p className="factory_loc">
                                                                {item.AddressTitle}
                                                            </p> */}
                                                            <p className="factory_full_address">
                                                                {item.addressTypeLists.map(item => item.addressType).join(", ") + ": " + item.deliveryLocationName}
                                                            </p>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                                            <Edit style={{ margin: '0 3px', cursor: 'pointer', color: '#666' }} onClick={() => this.editaddress(item.addressGuid, true)} />
                                                            <Delete style={{ margin: '0 3px', cursor: 'pointer', color: '#666' }} onClick={() => this.deleteCurrentAddressalert(item.addressGuid)} />
                                                        </div>
                                                    </div>)
                                                ) : ""}
                                        </GridItem>
                                    </GridContainer>
                                    {/* <GridContainer>
                                <GridItem md={12}>
                                    <GridContainer className="list">
                                        <GridItem md={2}>
                                            <Place />
                                        </GridItem>
                                        <GridItem md={10}>
                                            <p className="factory_loc">
                                                Factory: Thane - Ghodbunder Road
                                            </p>
                                            <p className="factory_full_address">
                                                300, Gala # 220, Sunteck Industrial Estate, G. B. Road, Thane, Mumbai - 400073. India
                                            </p>
                                            <Button className="outline_btn_new">Edit</Button>
                                            <Button className="solid_btn_new">Delete</Button>
                                        </GridItem>
                                    </GridContainer>
                                    <GridContainer className="list">
                                        <GridItem md={2}>
                                            <Place />
                                        </GridItem>
                                        <GridItem md={10}>
                                            <p className="factory_loc">
                                                Factory: Thane - Ghodbunder Road
                                            </p>
                                            <p className="factory_full_address">
                                                300, Gala # 220, Sunteck Industrial Estate, G. B. Road, Thane, Mumbai - 400073. India
                                            </p>
                                        </GridItem>
                                    </GridContainer>
                                </GridItem>
                            </GridContainer> */}
                                </div>
                                <div className="address_drawer_action">
                                    {/* <Button orangeSubmit>Add more address</Button> */}
                                </div>
                            </div>
                        </Drawer>
                    </div>
                    <div style={{ paddingLeft: '0px' }}>
                        <img style={{ width: '100%' }} src={onboarding3} />
                    </div>
                    <Drawer className="comment_drawer address_drawer" anchor="right" open={this.state.commentDrawer} onClose={this.toggleCommentDrawer('commentDrawer', false)}>
                        <div>
                            {<CommentsLog CommentLogData={this.state.CommentLogDetails} next={this.bindCommentLog} getcommentError={this.state.commentError} />}
                        </div>
                    </Drawer>
                    {/*{this.state.viewcomment ? <div>*/}
                    {/*    {<CommentsLog CommentLogData={this.state.CommentLogDetails} next={this.bindCommentLog} getcommentError={this.state.commentError} />}*/}
                    {/*</div> : ""*/}
                    {/*}*/}
                </React.Fragment>
            )
        }
    }
}
export default (FacilityInfo);