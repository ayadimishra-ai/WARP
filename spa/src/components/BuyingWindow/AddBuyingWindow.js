import FormControl from "@material-ui/core/FormControl";
import axios from 'axios';
import moment from "moment";
import React, { Component } from "react";
import { confirmAlert } from 'react-confirm-alert';
import Datetime from "react-datetime";
import { connect } from 'react-redux';
import * as BWStatusCode from '../../BWStatusCodes';
import CustomInput from "../../components/Material/CustomInput/CustomInput.jsx";
import GridContainer from "../../components/Material/Grid/GridContainer";
import GridItem from "../../components/Material/Grid/GridItem.jsx";
import { getFirestoreCollectionName, getFirestoreProductGroupCollectionName, getServiceUrl } from '../../config';
import firebase from '../../config/fbconfig';
import * as actionCreators from '../../store/actions/index';
import Button from '../../UI/Button/MaterialButton';
import { formatDate } from '../../utility';

class AddBuyingWindow extends Component {
    constructor(props) {
        super(props);
        this.state = {
            openBw: false,
            buyingwindowName: '',
            buyingwindowEndDate: '',
            fields: {},
            errors: {},
            HideBW: false,
            cDate: null,
            cancelBtn: false,
            ButtonText: 'DONE',
            IsButtonDisabled: false,
        }
    }
    openBw = () => {
        this.setState({ openBw: true, cancelBtn: true })
    }
    closeBw = () => {
        this.setState({ openBw: false })
        this.setState({ cancelBtn: false })
        // this.state.errors["txtbuyingwindowName"] = '';
        // this.state.errors["txtEndDate"] = '';
        // this.state.buyingwindowName = '';
        // this.state.buyingwindowEndDate = '';
        this.setState({errors:[this.state.errors["txtbuyingwindowName"],'']});
        this.setState({errors:[this.state.errors["txtEndDate"],'']});
        this.setState({buyingwindowName:''})
        this.setState({buyingwindowEndDate:''})
    }

    handleValidation() {
        let errors = {};
        let formIsValid = true;

        if (this.state.buyingwindowName === '') {
            formIsValid = false;
            errors["txtbuyingwindowName"] = "Name is required";
        }
        if (this.state.buyingwindowEndDate === '') {
            formIsValid = false;
            errors["txtEndDate"] = "End Date is required";
        }
      
        if (this.state.buyingwindowEndDate !== '') {
            if (this.state.buyingwindowEndDate <= moment(new Date()).format("YYYY-MM-DD")) {
                formIsValid = false;
                errors["txtEndDate"] = "End Date should be greater than current date";
            }
        }

        this.setState({ errors: errors });
        return formIsValid;
    }

    CreateBuyingWindow = (event) => {
        event.preventDefault();
        const formData = {
            "BuyingWindowName": this.state.buyingwindowName,
            "BuyingWindowEndDate": this.state.buyingwindowEndDate,
            "ProductGuid": this.props.ProductGuid,
            "CreatedBy": this.props.UserId,
            "CompanyGuid": this.props.CompanyGuid,
        }
        var config = {
            headers: {
                'Authorization': 'Bearer ' + localStorage.tokenId,
                'Content-Type': 'application/json',
            },
        };
        if (this.handleValidation()) {
            this.setState({ ButtonText: 'Creating Buying Window..', IsButtonDisabled: true });
            axios.post(getServiceUrl() + 'BuyingWindow/CreateBuyingWindow?', formData, config)
            .then((response) => {
                if (response.data.result === "Success") {
                    this.setState({ ButtonText: 'DONE', IsButtonDisabled: false },function(){
                    });
                    setTimeout(function(){
                        document.documentElement.scrollTop = document.documentElement.scrollTop = 0;
                    },500)
                         this.AddBWCommitmentFirestore(response.data.bwguid);
                   
                        if (this.props.createdBWGuid !== undefined) {
                            this.props.createdBWGuid(response.data.bwguid, true);
                        }
                        this.setState({ HideBW: true, openBw: false, buyingwindowName: '', buyingwindowEndDate: '', cancelBtn: false });
                        this.updateBuyingWindowGuidFireStore(response.data.bwguid);
                      
                        if (this.props.updateProductExitStatusOnBWCreate !== undefined) {
                            this.props.updateProductExitStatusOnBWCreate(this.props.ProductGuid);
                        }
                        this.props.onGetBuyingWindowCounter(this.props.userId, this.props.languageId);

                        var configIntegration = {
                            headers: {
                                Authorization: "Bearer " + localStorage.tokenId,
                                "Content-Type": "application/json",
                                "ProductGuid": formData.ProductGuid
                            },
                        };
                        
                        axios.post(getServiceUrl() + "Integration/SaveProductBasic?", formData, configIntegration)
                            .then((response) => {
                                //console.log(response);
                            });
                    }
                    else {
                        confirmAlert({
                            message: response.data.result,
                            buttons: [
                                {
                                    label: 'OK',
                                }
                            ]
                        });
                    }
                }).catch(err => err.response !== undefined ?  err.response.status === 401 ? window.location.pathname='/' : '' : '');
        }
        else {

        }
    }

    AddBWCommitmentFirestore(buyingwindowGuid) {
        let collectionName = getFirestoreCollectionName();

        firebase.firestore().collection(collectionName).add({
            BuyingWindowGuid: buyingwindowGuid.toLowerCase(),
            Quantity: '0',
            ProductGuid: this.props.ProductGuid
        })
    }

    updateBuyingWindowGuidFireStore(buyingwindowGuid) {
        let docId = null
        let qry = firebase.firestore().collection(getFirestoreProductGroupCollectionName())
            .where('ProductGuid', '==', this.props.ProductGuid.toLowerCase()).where('CollaborationStatus', '==', BWStatusCode.IN_PROGRESS)
        qry.get().then(snapshot => {
            snapshot.docs.map(doc => {
                docId = doc.id;
            })
            return docId
        }).then(docId => {
            if(docId !== null){
                firebase.firestore().collection(getFirestoreProductGroupCollectionName()).doc(docId).update({
                    BuyingWindowGuid: buyingwindowGuid.toLowerCase()
                })
            }
        })
    }

    componentDidMount() {
        if (this.props.MOQ === 1) {
            const priceList = this.props.ListRateCard.filter(x => x.skuGuid === this.props.DefaultSkuGuid);
            priceList.map((item) => {
                if (item.price2 === null || item.price2 === 0) {
                    this.setState({ HideBW: true });
                } else {
                    this.setState({ HideBW: false });
                }
            })
        }
        const tempDate = new Date();
        const dd = tempDate.getFullYear() + '-' + (tempDate.getMonth() + 1) + '-' + tempDate.getDate();
        this.setState({ cDate: formatDate(dd) });

        let BWGuid = null
        firebase.firestore().collection(getFirestoreProductGroupCollectionName())
            .where('ProductGuid', '==', this.props.ProductGuid.toLowerCase()).where('CollaborationStatus', '==', BWStatusCode.IN_PROGRESS)
            .onSnapshot((snapshot) => {
                snapshot.docs.map(doc => {
                    BWGuid = doc.data().BuyingWindowGuid
                })
                if (BWGuid !== null && BWGuid !== '00000000-0000-0000-0000-000000000000') {
                    this.setState({ HideBW: true });
                    if (this.props.createdBWGuid !== undefined) {
                        this.props.createdBWGuid(BWGuid, true);
                    }
                }
            })
    }

    render() {
        return (
            <React.Fragment>
                <div className="createBW">
                    <div style={{ display: this.state.IsButtonDisabled ? 'none' : 'block' }} className="addBW_actions">
                        {this.state.HideBW === true ? "" :
                            <Button onClick={this.openBw} simple>CREATE BUYING WINDOW</Button>
                        }
                        {this.state.cancelBtn === true ? <Button onClick={this.closeBw} simple>CANCEL</Button> : ""}
                    </div>
                    <GridContainer className={this.state.openBw ? 'createBw_box createBw_box_open' : 'createBw_box'}>
                        <GridItem md="4">
                            <CustomInput
                                disabled={true}
                                id="txtbuyingwindowName"
                                name="txtbuyingwindowName"
                                inputProps={{
                                    placeholder: "Buying Window Name..",
                                    disabled: this.state.IsButtonDisabled
                                }}
                                onChange={(event) => this.setState({ buyingwindowName: event.target.value })}
                                value={this.state.buyingwindowName}
                            />
                            <span className="bw_error">{this.state.errors["txtbuyingwindowName"]}</span>
                        </GridItem>
                        <GridItem md="4">
                            <FormControl fullWidth>
                                <div className="BWdate_picker">
                                    <Datetime
                                        closeOnSelect={true}
                                        timeFormat={false}
                                        inputProps={{ placeholder: "Select End Date..", disabled: this.state.IsButtonDisabled }}
                                        onChange={(event) => this.setState({ buyingwindowEndDate: formatDate(event._d) })}
                                        id="txtEndDate"
                                        name="txtEndDate"
                                        value={this.state.buyingwindowEndDate}
                                    />
                                </div>
                                <span className="bw_error">{this.state.errors["txtEndDate"]}</span>
                            </FormControl>
                        </GridItem>
                        <GridItem md="4">
                            <Button greenSubmit orangeSubmit disabled={this.state.IsButtonDisabled} onClick={(event) => this.CreateBuyingWindow(event)} >{
                                this.state.ButtonText
                            }</Button>
                        </GridItem>
                    </GridContainer>
                </div>
            </React.Fragment>
        )
    }
}
const mapStateToProps = state => {
    return {
        IsAuthorized: state.login.IsAuthorized,
        userId: state.login.userId,
        languageId: state.login.languageId,
        userType: state.login.userType,
        tokenId: state.login.tokenId
    };
}
const mapDispatchToProps = dispatch => {
    return {
       onGetBuyingWindowCounter: (userId, languageId) => dispatch(actionCreators.buyingWindowCounter(userId, languageId))
    }
};
export default connect(mapStateToProps, mapDispatchToProps)(AddBuyingWindow);