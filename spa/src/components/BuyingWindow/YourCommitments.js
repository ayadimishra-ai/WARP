import React, { Component } from "react";
import withStyles from "@material-ui/core/styles/withStyles";
import basicsStyle from "../../assets/jss/material-kit-pro-react/views/componentsSections/basicsStyle.jsx";
import Delete from "@material-ui/icons/Delete";
import Add from "@material-ui/icons/Add";
import Button from "../../UI/Button/MaterialButton";
import Input from '../../UI/Input/MaterialInput';
import { getServiceUrl, getLabelText, getFirestoreCollectionName, getFirestoreUserDataCollectionName, getFirestoreProductGroupCollectionName } from '../../config';
import axios from 'axios';
import { confirmAlert } from 'react-confirm-alert';
import toaster from 'toasted-notes';
import { toasterAlert } from '../../utility';
import Spinner from '../../UI/Spinner/Spinner';
import NavigationPrompt from "react-router-navigation-prompt";
import QueryBuilder from '@material-ui/icons/QueryBuilder';
import firebase from '../../config/fbconfig'
import { CalculateSaving } from '../../components/BuyingWindow/CommonBuyingWindow'

const initialState = {
    Commitments: {
        variantType: {
            elementType: 'select',
            elementConfig: {
                options: [],
                label: '-- Variant --',
                display: 'true'
            },
            value: '',
            validation: {
                required: true,
            },
            class: 'variant_type',
            errorMessage: 'Variant Type is required',
            valid: false,
            touched: false,
            label: 'Variant Type',
        },
        variantTypeLabel: {
            elementType: 'input',
            elementConfig: {
                type: 'string',
                display: 'false'
            },
            value: '',
            validation: {
                required: false,
            },
            class: 'disabled mob_savingsperunit saving_highlight',
            errorMessage: 'Variant Type is required',
            valid: true,
            touched: false,
            label: 'Variant Type',
        },
        attributes: {
            elementType: 'select',
            elementConfig: {
                options: [],
                label: '-- Attribute --',
                display: 'false'
            },
            value: '',
            validation: {
                required: true,
            },
            class: 'variant_type attribute',
            errorMessage: 'Attribute is required',
            valid: false,
            touched: false,
            label: 'Attribute',
        },
        quantity: {
            elementType: 'input',
            elementConfig: {
                type: 'number',
                placeholder: 'Quantity *',
                display: 'true'
            },
            value: '',
            validation: {
                required: true,
                maxLength: 10,
            },
            class: 'qty_td_total_commit',
            errorMessage: 'Quantity is required',
            valid: false,
            touched: false,
            label: 'Quantity',
        },
        savingsperunit: {
            elementType: 'input',
            elementConfig: {
                type: 'number',
                placeholder: 'Savings per unit',
                display: 'true'
            },
            value: '',
            validation: {
                required: false,
                maxLength: 10,
            },
            class: 'disabled mob_savingsperunit saving_highlight',
            valid: true,
            touched: false,
            label: 'Savings per unit',
        },
        savings: {
            elementType: 'input',
            elementConfig: {
                type: 'number',
                placeholder: 'Savings',
                display: 'true'
            },
            value: '',
            validation: {
                required: false,
                maxLength: 10,
            },
            class: 'disabled saving_highlight',
            valid: true,
            touched: false,
            label: 'Savings',
        },
        isDeleted: {
            elementType: 'input',
            elementConfig: {
                type: 'number',
                display: 'false'
            },
            //value: '',
            value: false,
            validation: {
                required: false,
            },
            class: 'disabled saving_highlight',
            valid: true,
            touched: false,
            label: 'IsDeleted',
        },

    },
}

class YourCommitments extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ...initialState,
            simpleSelect: "",
            commitmentList: [initialState],
            orderTotal: 0,
            loading: false,
            CommitmentsValid: false,
            shouldBlockNavigation: false,
            commitmentQty: 0,
            attributeList: [],
            variantList: [],
            commitmentFooter: false,
            savingsPerUnit: 0.0,
            totalCommitmentSavings: 0.0,
            hideEndingDate: false,
            countriesGuid: [],
            variantListAll: [],
        }
    }

    componentDidMount() {
        let countriesGuidArr = [];
        if (localStorage.userCountries !== "undefined") {
            JSON.parse(localStorage.userCountries).map(item => {
                countriesGuidArr.push(item.countryGuid);
            })

            this.setState({ countriesGuid: countriesGuidArr })
        }

        this.getVariantTypeList();
    }

    getVariantTypeList() {
        // var config = {
        //     headers: {
        //         "Authorization": "Bearer " + localStorage.tokenId,
        //         'Content-Type': 'application/json',
        //         'productGuid': this.props.ProductGuid,
        //     },
        // };
        // axios.get(getServiceUrl() + 'Product/GetVariantTypeList', config)
        //     .then((response) => {
        //         var newJson = response.data.map(item => ({
        //             Id: item,
        //             Value: item
        //         }));
        //         const updatedCommitments = {
        //             ...this.state.Commitments
        //         };
        //         updatedCommitments.variantType.elementConfig.options = newJson;
        //         this.setState({ Commitments: updatedCommitments, variantList: newJson });
        //         this.checkAttributesAvailable();
        //     }).catch(err => err.resetHandler !== undefined ?  err.response.status === 401 ? window.location.pathname='/' : '' : '');;
        let countriesGuid = [];
        if (localStorage.userCountries !== "undefined") {
            JSON.parse(localStorage.userCountries).map(item => {
                countriesGuid.push(item.countryGuid);
            })
        }
        let VariantList = this.props.ListRateCard.filter(x => x.countryGuid === countriesGuid[0])
        //this.setState({ variantListAll: this.props.ListProductVariant });        
        var newJson = VariantList.filter(x => x.isSupplierCountryActive === true
            && x.isPriceExpired === false
            && x.isActive === true).map(item => ({
                Id: item.variantName,
                Value: item.variantName,
                SkuGuid: item.skuGuid,
            }));
        newJson = newJson.map(ar => JSON.stringify(ar)).filter((item, index, arr) => arr.indexOf(item) === index).map(str => JSON.parse(str));

        const updatedCommitments = { ...this.state.Commitments };
        updatedCommitments.variantType.elementConfig.options = newJson;
        this.setState({ Commitments: updatedCommitments, variantList: newJson });
        this.checkAttributesAvailable();
    }

    checkAttributesAvailable() {
        var config = {
            headers: {
                "Authorization": "Bearer " + localStorage.tokenId,
                'Content-Type': 'application/json',
                'productGuid': this.props.ProductGuid,
            },
        };
        axios.get(getServiceUrl() + 'Product/checkAttributeAvailable', config)
            .then((response) => {
                const updatedCommitments = {
                    ...this.state.Commitments
                };
                updatedCommitments.attributes.elementConfig.display = response.data;
                this.setState({ Commitments: updatedCommitments });
                this.getCommitmentData();
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');;
    }
    getSavingsperunit(SavingsMsg) {
        let SavingPerUnit = 0.00, Savings;
        if (SavingsMsg !== undefined && SavingsMsg !== null) {
            let SplittedSavings = SavingsMsg.split("|");
            let arraySplittedSavings = SplittedSavings[1].split(":");

            if (arraySplittedSavings !== undefined) {
                Savings = arraySplittedSavings[1].trim();
                let arraySaving = Savings.split('/');
                Savings = arraySaving[0].trim();
                for (let count = 0; count <= 3; count++) {
                    if (isNaN(Savings[count]) && Savings[count] !== '.') {
                        SavingPerUnit = Savings.split(Savings[count])[1]
                    }
                }
            }
        }
        return SavingPerUnit;
    }
    getCommitmentData() {
        const formData = {
            "BuyingWindowGuid": this.props.BuyingWindowGuid,
            "UserGuid": this.props.UserId,
        }
        //const priceArray = this.props.ListRateCard.filter(x => x.skuGuid === this.props.DefaultSkuGuid);
        const priceArray = this.props.ListRateCard.filter(x => x.skuGuid === this.props.DefaultSkuGuid && x.countryGuid === this.state.countriesGuid[0]);
        var TotalCommitmentQty = this.state.commitmentQty === 0 ? this.props.BWCommitmentQtyCount : this.state.commitmentQty;

        // let Msg = CalculateSaving(priceArray, TotalCommitmentQty)
        // let SavingsPerUnit = this.getSavingsperunit(Msg);
        let OverallSavingsPerUnit = 0.0;
        let SavingsSingleRecord = []
        var config = {
            headers: {
                'Authorization': 'Bearer ' + localStorage.tokenId,
                'Content-Type': 'application/json',
            },
        };
        axios.post(getServiceUrl() + 'BuyingWindow/GetBuyingWindowCommitmentsData?', formData, config)
            .then((response) => {
                if (response.data.length > 0) {

                    let InitialArray = [...Array(response.data.length).fill(initialState),];
                    let CommitmentArray = JSON.parse(JSON.stringify(InitialArray));
                    var OrderTotal = 0;
                    var TotalCommitmentSavings = 0;
                    for (let i = 0; i < response.data.length; i++) {
                        let Msg = CalculateSaving(this.props.ListRateCard.filter(x => x.skuGuid === response.data[i].skuguid && x.countryGuid === this.state.countriesGuid[0]),
                            TotalCommitmentQty);
                        let SavingsPerUnit = this.getSavingsperunit(Msg);


                        CommitmentArray[i].Commitments.variantType.value = response.data[i].variantType;
                        CommitmentArray[i].Commitments.variantType.valid = true;
                        CommitmentArray[i].Commitments.variantType.touched = true;
                        CommitmentArray[i].Commitments.attributes.value = this.state.Commitments.attributes.elementConfig.display ? response.data[i].skuguid : '';
                        CommitmentArray[i].Commitments.attributes.valid = true;
                        CommitmentArray[i].Commitments.attributes.touched = true;
                        CommitmentArray[i].Commitments.quantity.value = response.data[i].quantity;
                        CommitmentArray[i].Commitments.quantity.valid = true;
                        CommitmentArray[i].Commitments.quantity.touched = true;
                        CommitmentArray[i].Commitments.savingsperunit.value = SavingsPerUnit;
                        CommitmentArray[i].Commitments.savingsperunit.valid = true;
                        CommitmentArray[i].Commitments.savingsperunit.touched = true;
                        CommitmentArray[i].Commitments.savings.value = Number(Math.round(SavingsPerUnit * response.data[i].quantity + "e2") + "e-2").toFixed(this.props.DecimalPrecision);
                        CommitmentArray[i].Commitments.savings.valid = true;
                        CommitmentArray[i].Commitments.savings.touched = true;
                        CommitmentArray[i].Commitments.isDeleted.value = response.data[i].isDeleted;

                        CommitmentArray[i].Commitments.variantTypeLabel.value = response.data[i].variantType
                        CommitmentArray[i].Commitments.variantTypeLabel.valid = true;
                        CommitmentArray[i].Commitments.variantTypeLabel.touched = true;

                        if (this.state.variantList.filter(x => x.Value === response.data[i].variantType).length === 0) {
                            CommitmentArray[i].Commitments.variantType.elementConfig.display = 'false';
                            CommitmentArray[i].Commitments.variantTypeLabel.elementConfig.display = 'true';
                            CommitmentArray[i].Commitments.quantity.elementConfig.class = 'disabled mob_savingsperunit saving_highlight';
                        }

                        if (response.data[i].isDeleted === false || response.data[i].isDeleted === "") {
                            OrderTotal = OrderTotal + response.data[i].quantity;

                            TotalCommitmentSavings = parseFloat(TotalCommitmentSavings) +
                                parseFloat(Number(Math.round(SavingsPerUnit * response.data[i].quantity + "e2") + "e-2").toFixed(this.props.DecimalPrecision))
                        }
                        // console.log(SavingsPerUnit)
                        //SavingsSingleRecord.push(parseFloat(SavingsPerUnit));
                    }
                    // let total = 0;
                    // for (let i = 0; i < SavingsSingleRecord.length; i++) {
                    //     total += SavingsSingleRecord[i];
                    // }

                    // console.log(TotalCommitmentSavings)
                    OverallSavingsPerUnit = Number(Math.round(TotalCommitmentSavings / OrderTotal + "e2") + "e-2").toFixed(this.props.DecimalPrecision)
                    // console.log(OverallSavingsPerUnit)
                    // console.log('OverallSavingsPerUnit')
                    this.setState({
                        commitmentList: CommitmentArray,
                        CommitmentsValid: true,
                        orderTotal: OrderTotal,
                        savingsPerUnit: OverallSavingsPerUnit,
                        totalCommitmentSavings: TotalCommitmentSavings
                    });
                    this.props.GetYourCommitments(OrderTotal, this.props.QuantityRangeArray, "");
                    for (let i = 0; i < this.state.commitmentList.length; i++) {
                        this.onVariantTypeChanged(this.state.commitmentList[i].Commitments.variantType.value, i);
                    }
                }
                else {
                    // console.log(OverallSavingsPerUnit)
                    // console.log('OverallSavingsPerUnit else')
                    var List = [];
                    List.push(initialState);
                    OrderTotal = 0;
                    this.setState({
                        commitmentList: List,
                        CommitmentsValid: false,
                        orderTotal: OrderTotal,
                        savingsPerUnit: OverallSavingsPerUnit
                    });
                }

                this.setState({ commitmentFooter: true })

                // if (document.querySelectorAll('.commitment_footer')[0]) {
                //     document.querySelectorAll('.commitment_footer')[0].style.display = 'table-row';
                // }
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }

    inputChangedHandler = (event, inputIdentifier, rowNumber) => {
        const updatedCommitments = {
            ...this.state.commitmentList[rowNumber].Commitments
        };
        const updatedFormElement = {
            ...updatedCommitments[inputIdentifier]
        };
        updatedFormElement.value = event.target.value;
        updatedCommitments[inputIdentifier] = this.checkValidity(updatedFormElement)

        if (inputIdentifier === 'variantType') {
            if (!this.state.Commitments.attributes.elementConfig.display) {
                updatedCommitments["attributes"].valid = true;
            }
            else {
                updatedCommitments["attributes"].valid = false;
            }
            this.onVariantTypeChanged(event.target.value, rowNumber);
        }

        let CommitmentArray = JSON.parse(JSON.stringify(this.state.commitmentList))
        CommitmentArray[rowNumber].Commitments = updatedCommitments
        this.setState({ commitmentList: CommitmentArray, shouldBlockNavigation: true });
        this.checkFormValid(CommitmentArray);
    }

    checkValidity(updatedFormElement) {
        let isValid = true;
        if (!updatedFormElement.validation) {
            isValid = true;
        }
        if (updatedFormElement.validation.required) {
            isValid = updatedFormElement.value.trim() !== '' && updatedFormElement.value !== '0' && isValid;
            updatedFormElement.errorMessage = updatedFormElement.label + ' is required.'
        }
        if (updatedFormElement.label === "Attribute" && this.state.Commitments.attributes.elementConfig.display) {
            if (updatedFormElement.value === '0' || updatedFormElement.value === ' ') {
                isValid = false && isValid;
                updatedFormElement.errorMessage = getLabelText(this.props.Resources.filter((x) => { return x.resourceKey === 'attributerequired' })[0], 'Attribute is required.');
            }
        }
        updatedFormElement.valid = isValid;
        updatedFormElement.touched = true;
        return updatedFormElement;
    }

    checkFormValid(CommitmentArray) {
        let formIsValid = true;
        for (let i = 0; i < CommitmentArray.length; i++) {
            for (let inputIdentifiers in CommitmentArray[i].Commitments) {
                formIsValid = CommitmentArray[i].Commitments[inputIdentifiers].valid && formIsValid
            }
        }
        this.setState({
            CommitmentsValid: formIsValid
        });
    }

    onVariantTypeChanged = (value, rowNumber) => {
        //if (value !== '' && value !== '0' && this.state.Commitments.attributes.elementConfig.display) {
        if (value !== '' && value !== '0') {
            var config = {
                headers: {
                    "Authorization": "Bearer " + localStorage.tokenId,
                    'Content-Type': 'application/json',
                    'productGuid': this.props.ProductGuid,
                    'variantName': value,
                    'UserGuid': localStorage.userId
                },
            };
            axios.get(getServiceUrl() + 'Product/GetVariantAttributes', config)
                .then((response) => {
                    var newJson = response.data.map(item => ({
                        Id: item.skuGuid,
                        Value: item.attributeValue
                    }));

                    let CommitmentArray = JSON.parse(JSON.stringify(this.state.commitmentList))
                    CommitmentArray[rowNumber].Commitments.attributes.elementConfig.options = newJson;
                    this.setState({
                        commitmentList: CommitmentArray, attributeList: newJson
                    });
                }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
        }
        else {
            const updatedCommitments = {
                ...this.state.commitmentList[rowNumber].Commitments
            };
            updatedCommitments.attributes.elementConfig.options = [];
            let CommitmentArray = JSON.parse(JSON.stringify(this.state.commitmentList))
            CommitmentArray[rowNumber].Commitments = updatedCommitments
            this.setState({
                commitmentList: CommitmentArray
            });
        }
    }

    AddCommitmentHandler = () => {
        var List = this.state.commitmentList;
        List.push(initialState);
        this.setState({ commitmentList: List, CommitmentsValid: false });
    }

    removeCommitmentHandler = (event, rowNumber) => {
        var List = [...this.state.commitmentList];
        if (List.length === 1) {
            if (List[0].Commitments.variantType.value !== '' && List[0].Commitments.quantity.value !== 0) {
                this.setState({ commitmentFooter: false })
                List.splice(rowNumber, 1);
                this.setState({ commitmentList: List, shouldBlockNavigation: true });
            }
        }
        else {
            List.splice(rowNumber, 1);
            this.setState({ commitmentList: List, shouldBlockNavigation: true });
        }
        this.checkFormValid(List);
        let TotalCommitmentQty = this.state.commitmentQty === 0 ? this.props.BWCommitmentQtyCount : this.state.commitmentQty;
        let List1 = JSON.parse(JSON.stringify(List))
        let UserCommitments = List1.reduce((x, y) => x + parseInt(y.Commitments.quantity.value !== "" ? y.Commitments.quantity.value : 0, 10), 0);
        this.props.OverAllTotalCommitments('', parseInt(TotalCommitmentQty) - (this.props.UserCommitments === null ? 0 : parseInt(this.props.UserCommitments)) + parseInt(UserCommitments))
    }

    onBlurHandler = (event, inputIdentifier) => {
        if (inputIdentifier === "quantity") {
            let commitmentsValid = true && this.state.CommitmentsValid;
            // let TotalCommitmentQty = this.state.commitmentQty === 0 ? this.props.BWCommitmentQtyCount : this.state.commitmentQty;
            // //let List = [...this.state.commitmentList];
            // let TotalCommitmentSavings = 0;
            // let List = JSON.parse(JSON.stringify(this.state.commitmentList))
            // let UserCommitments = List.reduce((x, y) => x + parseInt(y.Commitments.quantity.value !== "" ? y.Commitments.quantity.value : 0, 10), 0);
            // // let Msg = CalculateSaving(this.props.ListRateCard.filter(x => x.skuGuid === this.props.DefaultSkuGuid),
            // let Msg = CalculateSaving(this.props.ListRateCard.filter(x => x.skuGuid === this.props.DefaultSkuGuid && x.countryGuid === this.state.countriesGuid[0]),
            //     parseInt(TotalCommitmentQty) - (this.props.UserCommitments === null ? parseInt(0) : parseInt(this.props.UserCommitments)) + parseInt(UserCommitments))
            // let SavingsPerUnit = this.getSavingsperunit(Msg);
            // for (let i = 0; i < this.state.commitmentList.length; i++) {
            //     // Total = parseInt(Total) + parseInt(this.state.commitmentList[i].Commitments.quantity.value === '' ? 0 : this.state.commitmentList[i].Commitments.quantity.value)
            //     List[i].Commitments.savingsperunit.value = SavingsPerUnit
            //     List[i].Commitments.savings.value = Number(Math.round(SavingsPerUnit * parseInt(this.state.commitmentList[i].Commitments.quantity.value) + "e2") + "e-2").toFixed(this.props.DecimalPrecision)
            // }
            // TotalCommitmentSavings = parseFloat(TotalCommitmentSavings) +
            //     parseFloat(Number(Math.round(SavingsPerUnit * UserCommitments + "e2") + "e-2").toFixed(this.props.DecimalPrecision))
            // this.setState({ orderTotal: UserCommitments, commitmentList: List, CommitmentsValid: true, savingsPerUnit: SavingsPerUnit, totalCommitmentSavings: TotalCommitmentSavings });
            // this.props.OverAllTotalCommitments('', parseInt(TotalCommitmentQty) - (this.props.UserCommitments === null ? 0 : parseInt(this.props.UserCommitments)) + parseInt(UserCommitments))

            let TotalCommitmentQty = this.state.commitmentQty === 0 ? this.props.BWCommitmentQtyCount : this.state.commitmentQty;
            let TotalCommitmentSavings = 0.0;
            let OverallSavingsPerUnit = 0.0;
            let SavingsSingleRecord = []
            let List = JSON.parse(JSON.stringify(this.state.commitmentList))
            let UserCommitments = List.filter(x => x.Commitments.isDeleted.value === false || x.Commitments.isDeleted.value === "").reduce((x, y) => x + parseInt(y.Commitments.quantity.value !== "" ? y.Commitments.quantity.value : 0, 10), 0);
            // let Msg = CalculateSaving(this.props.ListRateCard.filter(x => x.skuGuid === this.props.DefaultSkuGuid && x.countryGuid === this.state.countriesGuid[0]),
            //     parseInt(TotalCommitmentQty) - (this.props.UserCommitments === null ? parseInt(0) : parseInt(this.props.UserCommitments)) + parseInt(UserCommitments))
            // let SavingsPerUnit = this.getSavingsperunit(Msg);
            for (let i = 0; i < this.state.commitmentList.length; i++) {
                let SkuGuid = List[i].Commitments.variantType.elementConfig.options.filter(x => x.Value === List[i].Commitments.variantType.value)[0].SkuGuid;
                let Msg = CalculateSaving(this.props.ListRateCard.filter(x => x.skuGuid === SkuGuid && x.countryGuid === this.state.countriesGuid[0]),
                    parseInt(TotalCommitmentQty) - (this.props.UserCommitments === null ? parseInt(0) : parseInt(this.props.UserCommitments)) + parseInt(UserCommitments))
                let SavingsPerUnit = this.getSavingsperunit(Msg);


                List[i].Commitments.savingsperunit.value = SavingsPerUnit
                List[i].Commitments.savings.value = Number(Math.round(SavingsPerUnit * parseInt(this.state.commitmentList[i].Commitments.quantity.value) + "e2") + "e-2").toFixed(this.props.DecimalPrecision)
                TotalCommitmentSavings = parseFloat(TotalCommitmentSavings) + parseFloat(List[i].Commitments.savings.value);
                //parseFloat(Number(Math.round(SavingsPerUnit * UserCommitments + "e2") + "e-2").toFixed(this.props.DecimalPrecision))
                //SavingsSingleRecord.push(parseFloat(SavingsPerUnit));
            }
            // let total = 0;
            // for (let i = 0; i < SavingsSingleRecord.length; i++) {
            //     total += SavingsSingleRecord[i];
            // }
            OverallSavingsPerUnit = Number(Math.round(TotalCommitmentSavings / UserCommitments + "e2") + "e-2").toFixed(this.props.DecimalPrecision)
            // console.log(OverallSavingsPerUnit)
            // console.log('547')
            this.setState({
                orderTotal: UserCommitments,
                commitmentList: List,
                CommitmentsValid: commitmentsValid,
                savingsPerUnit: OverallSavingsPerUnit,
                totalCommitmentSavings: TotalCommitmentSavings.toFixed(this.props.DecimalPrecision)
            });
            this.props.OverAllTotalCommitments('', parseInt(TotalCommitmentQty) - (this.props.UserCommitments === null ? 0 : parseInt(this.props.UserCommitments)) + parseInt(UserCommitments))
        }
    }

    submitHandler = (event) => {
        this.setState({ shouldBlockNavigation: false });
        if (this.state.CommitmentsValid) {
            this.setState({ loading: true });
            var IsDuplicate = false;
            let TotalCommitmentQty = this.state.commitmentQty === 0 ? this.props.BWCommitmentQtyCount : this.state.commitmentQty;
            let CommitmentArray = JSON.parse(JSON.stringify(this.state.commitmentList))
            let OverallSavingsPerUnit = 0.0;
            let SavingsSingleRecord = []
            //let CommitmentArray = JSON.parse(JSON.stringify(this.state.commitmentList.filter(x=> x.Commitments.isDeleted.value === false)))
            //let UserCommitments = CommitmentArray.reduce((x, y) => x + parseInt(y.Commitments.quantity.value !== "" ? y.Commitments.quantity.value : 0, 10), 0);
            let UserCommitments = CommitmentArray.filter(x => x.Commitments.isDeleted.value === false || x.Commitments.isDeleted.value === "").reduce((x, y) => x + parseInt(y.Commitments.quantity.value !== "" ? y.Commitments.quantity.value : 0, 10), 0);
            //let Msg = CalculateSaving(this.props.ListRateCard.filter(x => x.skuGuid === this.props.DefaultSkuGuid),


            for (let i = 0; i < CommitmentArray.length - 1; i++) {
                for (let j = i + 1; j <= CommitmentArray.length - 1; j++) {
                    if (CommitmentArray[i].Commitments.variantType.value === CommitmentArray[j].Commitments.variantType.value && CommitmentArray[i].Commitments.attributes.value === CommitmentArray[j].Commitments.attributes.value) {
                        CommitmentArray[j].Commitments.variantType.errorMessage = getLabelText(this.props.Resources.filter((x) => { return x.resourceKey === 'duplicateentry' })[0], "Duplicate Entry");
                        CommitmentArray[j].Commitments.variantType.valid = false;
                        CommitmentArray[j].Commitments.variantType.touched = true;
                        IsDuplicate = true;
                    }
                }
            }
            if (!IsDuplicate) {
                let formDataArray = [], Ordertotal = 0, TotalCommitmentSavings = 0.0, IsDeleteAll = false;
                //let CommitmentArray = JSON.parse(JSON.stringify(this.state.commitmentList))
                for (let i = 0; i < this.state.commitmentList.length; i++) {
                    let SkuGuid = CommitmentArray[i].Commitments.variantType.elementConfig.options.filter(x => x.Value === CommitmentArray[i].Commitments.variantType.value)[0].SkuGuid;
                    let Msg = CalculateSaving(this.props.ListRateCard.filter(x => x.skuGuid === SkuGuid && x.countryGuid === this.state.countriesGuid[0]),
                        parseInt(TotalCommitmentQty) - (this.props.UserCommitments === null ? parseInt(0) : parseInt(this.props.UserCommitments)) + parseInt(UserCommitments))
                    let SavingsPerUnit = this.getSavingsperunit(Msg);
                    let formData = { variantType: '', skuguid: '', quantity: 0, buyingWindowGuid: '', productGuid: '', savingsPerUnit: '', savings: '', companyGuid: '' };
                    formData.variantType = this.state.commitmentList[i].Commitments.variantType.value;
                    formData.skuguid = SkuGuid;//this.state.commitmentList[i].Commitments.attributes.value === '' ? '00000000-0000-0000-0000-000000000000' : this.state.commitmentList[i].Commitments.attributes.value;
                    formData.quantity = this.state.commitmentList[i].Commitments.quantity.value;
                    formData.buyingWindowGuid = this.props.BuyingWindowGuid;
                    formData.productGuid = this.props.ProductGuid;
                    formData.userGuid = this.props.UserId;
                    formData.savingsPerUnit = SavingsPerUnit;
                    formData.companyGuid = localStorage.companyGuid;
                    //formData.savings = this.state.commitmentList[i].Commitments.savings.value;
                    formDataArray.push(formData);

                    CommitmentArray[i].Commitments.savingsperunit.value = SavingsPerUnit;
                    CommitmentArray[i].Commitments.savings.value = SavingsPerUnit * this.state.commitmentList[i].Commitments.quantity.value;

                    if (this.state.commitmentList[i].Commitments.isDeleted.value === false) {
                        Ordertotal = Ordertotal + parseInt(this.state.commitmentList[i].Commitments.quantity.value);
                        TotalCommitmentSavings = parseFloat(TotalCommitmentSavings) +
                            parseFloat(Number(Math.round(SavingsPerUnit * this.state.commitmentList[i].Commitments.quantity.value + "e2") + "e-2").toFixed(this.props.DecimalPrecision))
                    }
                    //SavingsSingleRecord.push(parseFloat(SavingsPerUnit));

                }
                // let total = 0;
                // for (let i = 0; i < SavingsSingleRecord.length; i++) {
                //     total += SavingsSingleRecord[i];
                // }
                OverallSavingsPerUnit = Number(Math.round(TotalCommitmentSavings / Ordertotal + "e2") + "e-2").toFixed(this.props.DecimalPrecision)
                if (this.state.commitmentList.length === 0) {
                    let formData = { variantType: '', skuguid: '', quantity: 0, buyingWindowGuid: '', productGuid: '', savingsPerUnit: '', savings: '', companyGuid: '' };
                    formData.skuguid = '00000000-0000-0000-0000-000000000000';
                    formData.buyingWindowGuid = this.props.BuyingWindowGuid;
                    formData.productGuid = this.props.ProductGuid;
                    formData.userGuid = this.props.UserId;
                    formData.savingsPerUnit = 0.0;
                    formData.companyGuid = localStorage.companyGuid;
                    //formData.savings = 0.0;
                    formDataArray.push(formData);
                    IsDeleteAll = true;
                }
                var config = {
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.tokenId,
                        'Content-Type': 'application/json',
                    },
                };
                axios.post(getServiceUrl() + 'BuyingWindow/UpdateBuyingWindowCommitments', formDataArray, config)
                    .then((response) => {
                        this.setState({ loading: false });
                        if (response.data.status200OK) {
                            if (response.data.errorMsg === "") {
                                // console.log(OverallSavingsPerUnit)
                                // console.log('UpdateBuyingWindowCommitments')
                                this.setState({
                                    commitmentList: CommitmentArray,
                                    orderTotal: Ordertotal,
                                    savingsPerUnit: CommitmentArray.length === 0 ? 0.0 : OverallSavingsPerUnit,
                                    totalCommitmentSavings: TotalCommitmentSavings
                                });
                                this.props.commitmentQtyCallback(response.data.commitmentQty);
                                if (IsDeleteAll) {
                                    var List = this.state.commitmentList;
                                    List.push(initialState);
                                    this.setState({ commitmentList: List, CommitmentsValid: false });
                                }
                                this.props.GetYourCommitments(Ordertotal, this.props.QuantityRangeArray, response.data.commitmentQty);
                                confirmAlert({
                                    message: getLabelText(this.props.Resources.filter((x) => { return x.resourceKey === 'commitmentupdated' })[0], 'Buying Window commitments updated successfully.'),
                                    buttons: [
                                        {
                                            label: 'OK',
                                        }
                                    ]
                                });
                                this.AddBWCommitmentFirestore(response.data.commitmentQty, Ordertotal)
                            }
                            else {
                                toaster.notify(toasterAlert('WARNING', response.data.errorMsg), {
                                    duration: null
                                }
                                )
                            }
                        }
                        else {
                            toaster.notify(toasterAlert('WARNING', getLabelText(this.props.Resources.filter((x) => { return x.resourceKey === 'errormsg' })[0], "Error Occured")), {
                                duration: null
                            }
                            )
                        }
                    }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
            }
            else {
                this.setState({
                    commitmentList: CommitmentArray, loading: false
                });
            }
        }
        else {
            let CommitmentArray = JSON.parse(JSON.stringify(this.state.commitmentList))
            for (let i = 0; i < this.state.commitmentList.length; i++) {
                const updatedCommitments = CommitmentArray[i].Commitments;
                for (let inputIndentifiers in updatedCommitments) {
                    updatedCommitments[inputIndentifiers].touched = !updatedCommitments[inputIndentifiers].valid;
                }
                CommitmentArray[i].Commitments = updatedCommitments
            }
            this.setState({
                commitmentList: CommitmentArray
            });
        }
        this.setState({ commitmentFooter: true })
        // if (document.querySelectorAll('.commitment_footer')[0]) {
        //     document.querySelectorAll('.commitment_footer')[0].style.display = 'table-row';
        // }
    }

    resetHandler = (event) => {
        this.setState({ shouldBlockNavigation: false });
        this.getCommitmentData();
    }

    inputKeyPressHandler = (event, inputIdentifier) => {
        if (inputIdentifier === "quantity") {
            let re = /^[0-9\b]+$/
            if (!re.test(event.key)) {
                event.preventDefault();
            }
        }
    }
    getShortFallUnitsMsg(TotalCommitmentQty) {
        let shortFallUnits = 0, shortFallUnitsMsg = '', resourceValue = '';
        //const priceArray = this.props.ListRateCard.filter(x => x.skuGuid === this.props.DefaultSkuGuid)[0];
        const priceArray = this.props.ListRateCard.filter(x => x.skuGuid === this.props.DefaultSkuGuid && x.countryGuid === this.state.countriesGuid[0]);
        if (TotalCommitmentQty < this.props.MOQ) {
            shortFallUnits = parseInt(this.props.MOQ) - parseInt(TotalCommitmentQty);
            resourceValue = this.props.Resources.filter((x) => { return x.resourceKey === 'moqshortfallmsg' })[0];
            resourceValue = resourceValue !== undefined ? resourceValue.replace("@shortFallUnits", shortFallUnits) : resourceValue;
            shortFallUnitsMsg = getLabelText(resourceValue, " (shortfall of " + shortFallUnits + " units to reach MOQ)");
        }
        else if (priceArray.quantity1 > 0 && TotalCommitmentQty < priceArray.quantity1) {
            shortFallUnits = parseInt(priceArray.quantity1) - parseInt(TotalCommitmentQty)
        }
        else if (priceArray.quantity2 > 0 && TotalCommitmentQty < priceArray.quantity2) {
            shortFallUnits = parseInt(priceArray.quantity2) - parseInt(TotalCommitmentQty)
        }
        else if (priceArray.quantity3 > 0 && TotalCommitmentQty < priceArray.quantity3) {
            shortFallUnits = parseInt(priceArray.quantity3) - parseInt(TotalCommitmentQty)
        }
        else if (priceArray.quantity4 > 0 && TotalCommitmentQty < priceArray.quantity4) {
            shortFallUnits = parseInt(priceArray.quantity4) - parseInt(TotalCommitmentQty)
        }
        else if (priceArray.quantity5 > 0 && TotalCommitmentQty < priceArray.quantity5) {
            shortFallUnits = parseInt(priceArray.quantity5) - parseInt(TotalCommitmentQty)
        }
        else if (priceArray.quantity6 > 0 && TotalCommitmentQty < priceArray.quantity6) {
            shortFallUnits = parseInt(priceArray.quantity6) - parseInt(TotalCommitmentQty)
        }
        else if (priceArray.quantity7 > 0 && TotalCommitmentQty < priceArray.quantity7) {
            shortFallUnits = parseInt(priceArray.quantity7) - parseInt(TotalCommitmentQty)
        }
        else if (priceArray.quantity8 > 0 && TotalCommitmentQty < priceArray.quantity8) {
            shortFallUnits = parseInt(priceArray.quantity8) - parseInt(TotalCommitmentQty)
        }
        else if (priceArray.quantity9 > 0 && TotalCommitmentQty < priceArray.quantity9) {
            shortFallUnits = parseInt(priceArray.quantity9) - parseInt(TotalCommitmentQty)
        }
        else if (priceArray.quantity10 > 0 && TotalCommitmentQty < priceArray.quantity10) {
            shortFallUnits = parseInt(priceArray.quantity10) - parseInt(TotalCommitmentQty)
        }
        if (shortFallUnitsMsg !== " ") {
            resourceValue = this.props.Resources.filter((x) => { return x.resourceKey === 'nextpriceshortfallmsg' })[0];
            resourceValue = resourceValue !== undefined ? resourceValue.replace("@shortFallUnits", shortFallUnits) : resourceValue;
            shortFallUnitsMsg = shortFallUnits !== 0 ? getLabelText(resourceValue, " (Add " + shortFallUnits + " units to reach next price range)") : "";
        }
        return shortFallUnitsMsg;
    }

    AddBWCommitmentFirestore(commitmentQty, userCommitment) {
        let collectionName = getFirestoreCollectionName();

        let editId = null;
        let db = firebase.firestore().collection(collectionName);
        let qry = db.where('BuyingWindowGuid', '==', this.props.BuyingWindowGuid.toLowerCase());
        qry.get().then(snapshot => {
            snapshot.docs.map(doc => {
                editId = doc.id;
                return editId
            })
            if (editId !== null) {
                firebase.firestore().collection(collectionName).doc(editId).update({ Quantity: commitmentQty })
            }
            else {
                firebase.firestore().collection(collectionName).add({
                    BuyingWindowGuid: this.props.BuyingWindowGuid.toLowerCase(),
                    Quantity: commitmentQty,
                    ProductGuid: this.props.ProductGuid
                })
            }
        })

        firebase.firestore().collection(getFirestoreProductGroupCollectionName())
            .where('BuyingWindowGuid', '==', this.props.BuyingWindowGuid.toLowerCase())
            .get().then(snapshot => {
                snapshot.docs.map(doc => {
                    let userDataEditId = null;
                    firebase.firestore().collection(getFirestoreUserDataCollectionName())
                        .where('UserGuid', '==', localStorage.userId.toLowerCase())
                        .where('CollaborationGroupGuid', '==', doc.id)
                        .get().then(userSnapshot => {
                            userSnapshot.docs.map(doc => {
                                userDataEditId = doc.id;
                                return userDataEditId
                            })

                            if (userDataEditId !== null) {
                                firebase.firestore().collection(getFirestoreUserDataCollectionName()).doc(userDataEditId).update({ CommitmentQty: userCommitment })
                            }
                        })
                })
            });

    }
    getRemaindays() {
        // const date1 = new Date();
        // const date2 = new Date(this.props.BWEndDate);
        // const diffTime = Math.abs(date2.getTime() - date1.getTime());
        // const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        // let days = 0;
        // if (isNaN(diffDays)) {
        //     days = 0;
        // }
        // else {
        //     days = diffDays;
        // }
        // return days;

        const date1 = new Date();
        const date2 = new Date(this.props.BWEndDate);
        let days = 0;
        if (date1 >= date2) {
            //days = 0;
            //this.setState({ hideEndingDate: true })
            days = getLabelText(this.props.Resources.filter((x) => { return x.resourceKey === 'endingsoon' })[0], "Ending soon");
        }
        else {
            const diffTime = Math.abs(date2.getTime() - date1.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (isNaN(diffDays)) {
                days = getLabelText(this.props.Resources.filter((x) => { return x.resourceKey === 'endingsoon' })[0], "Ending soon");
                // days = 'Ending soon';
            }
            else {
                days = getLabelText(this.props.Resources.filter((x) => { return x.resourceKey === 'endingin' })[0], "Ending in ") + ' ' + diffDays + ' ' +
                    getLabelText(this.props.Resources.filter((x) => { return x.resourceKey === 'days' })[0], " Days");
            }
        }
        return days;
    }
    componentWillReceiveProps(nextprops, prevState) {
        if (nextprops.ActionableNotiVariantType !== this.props.ActionableNotiVariantType && nextprops.ActionableNotiVariantType !== null) {
            var insideLoop = 0;
            let quantity = 0;
            var List = JSON.parse(JSON.stringify(this.state.commitmentList))
            let TotalCommitmentQty = this.state.commitmentQty === 0 ? nextprops.BWCommitmentQtyCount : this.state.commitmentQty;
            //let UserCommitments = List.reduce((x, y) => x + parseInt(y.Commitments.quantity.value !== "" ? y.Commitments.quantity.value : 0, 10), 0);
            if (List.length === 1 && List[0].Commitments.variantType.value === '' && List[0].Commitments.quantity.value === '') {
                List[0].Commitments.variantType.value = nextprops.ActionableNotiVariantType;
                List[0].Commitments.variantType.valid = true;
                List[0].Commitments.variantType.touched = true;
                if (nextprops.NextRangeCommitment === undefined) {
                    List[0].Commitments.quantity.value = (nextprops.MOQ - (nextprops.UserCommitments === null ? 0 : nextprops.UserCommitments));
                    List[0].Commitments.quantity.value = List[0].Commitments.quantity.value - parseInt(nextprops.BWCommitmentQtyCount)
                }
                else {
                    List[0].Commitments.quantity.value = nextprops.NextRangeCommitment;
                }
                List[0].Commitments.quantity.valid = true;
                List[0].Commitments.quantity.touched = true;
                List[0].Commitments.attributes.valid = true;
                List[0].Commitments.attributes.touched = true;
                List[0].Commitments.savings.valid = true;
                List[0].Commitments.savings.touched = true;
                List[0].Commitments.savingsperunit.valid = true;
                List[0].Commitments.savingsperunit.touched = true;
                this.props.OverAllTotalCommitments('', parseInt(TotalCommitmentQty) - (nextprops.UserCommitments === null ? 0 : parseInt(nextprops.UserCommitments)) + parseInt(List[0].Commitments.quantity.value))
                this.setState({ commitmentList: List, CommitmentsValid: true, shouldBlockNavigation: true });
            }
            else {
                List.filter(function (data, key) {
                    if (data.Commitments.variantType.value === nextprops.ActionableNotiVariantType) {
                        if (nextprops.MOQ >= parseInt(nextprops.BWCommitmentQtyCount)) {
                            // data.Commitments.quantity.value = parseInt(nextprops.MOQ - ((nextprops.UserCommitments === null ? 0 : nextprops.UserCommitments))
                            //     + parseInt(data.Commitments.quantity.value));
                            data.Commitments.quantity.value = (parseInt(nextprops.MOQ) - parseInt(nextprops.BWCommitmentQtyCount)) + parseInt(data.Commitments.quantity.value);
                        }
                        else {
                            data.Commitments.quantity.value = parseInt(data.Commitments.quantity.value) + parseInt(nextprops.NextRangeCommitment)
                        }
                        insideLoop = 1;
                    }
                    quantity = parseInt(quantity) + parseInt(data.Commitments.quantity.value);
                })
                if (insideLoop === 1) {
                    this.props.OverAllTotalCommitments('', quantity);
                }
                if (insideLoop === 0) {
                    List.push(initialState);
                    const updatedCommitments = List[this.state.commitmentList.length];

                    updatedCommitments.Commitments.variantType.value = nextprops.ActionableNotiVariantType;
                    updatedCommitments.Commitments.variantType.valid = true;
                    updatedCommitments.Commitments.variantType.touched = true;
                    if (nextprops.NextRangeCommitment === undefined) {
                        updatedCommitments.Commitments.quantity.value = (nextprops.MOQ - parseInt(TotalCommitmentQty));//(nextprops.UserCommitments === null ? 0 : nextprops.UserCommitments));
                    }
                    else {
                        updatedCommitments.Commitments.quantity.value = nextprops.NextRangeCommitment;
                    }
                    updatedCommitments.Commitments.quantity.valid = true;
                    updatedCommitments.Commitments.quantity.touched = true;
                    updatedCommitments.Commitments.attributes.valid = true;
                    updatedCommitments.Commitments.attributes.touched = true;
                    updatedCommitments.Commitments.savings.valid = true;
                    updatedCommitments.Commitments.savings.touched = true;
                    updatedCommitments.Commitments.savingsperunit.valid = true;
                    updatedCommitments.Commitments.savingsperunit.touched = true;
                    this.props.OverAllTotalCommitments('', parseInt(TotalCommitmentQty) + parseInt(updatedCommitments.Commitments.quantity.value))
                }
                this.setState({ commitmentList: List, CommitmentsValid: true, shouldBlockNavigation: true });
            }
        }
    }
    render() {
        var trData = [];
        for (let i = 0; i < this.state.commitmentList.length; i++) {
            const formElementsArray = [];
            for (let key in this.state.commitmentList[i].Commitments) {
                formElementsArray.push({
                    id: key,
                    config: this.state.commitmentList[i].Commitments[key]
                });
            }
            var tempItem = (
                <tr id={i}>
                    {formElementsArray.map(formElement => (
                        formElement.config.elementConfig.display === 'true' || formElement.config.elementConfig.display === true ?
                            // <td className={formElement.id === 'variantTypeLabel' ? 'disabled mob_savingsperunit saving_highlight' : formElement.config.class}>
                            <td className={formElement.config.class}>
                                <div id={formElement.id + i} onBlur={(event) => this.onBlurHandler(event, formElement.id)}>
                                    <Input
                                        key={formElement.id}
                                        elementType={formElement.config.elementType}
                                        elementConfig={formElement.config.elementConfig}
                                        invalid={!formElement.config.valid}
                                        shouldValidate={formElement.config.validation}
                                        touched={formElement.config.touched}
                                        errorMessage={formElement.config.errorMessage}
                                        changed={(event) => this.inputChangedHandler(event, formElement.id, i)}
                                        SelectChange={(event) => this.inputChangedHandler(event, formElement.id, i)}
                                        onKeyPress={(event) => this.inputKeyPressHandler(event, formElement.id)}
                                        value={formElement.config.value}
                                    />
                                </div>
                            </td> : null))}
                    <td className="commitment_action">
                        <Delete onClick={(event) => this.removeCommitmentHandler(event, i)} />
                        {this.state.variantList.length > 1 && i === this.state.commitmentList.length - 1 ? <Add onClick={this.AddCommitmentHandler} />
                            : this.state.attributeList.length > 1 ? <Add onClick={this.AddCommitmentHandler} /> : ""}
                    </td>
                </tr>
            );
            trData[i] = (tempItem);
        }
        var TotalCommitmentQty = this.state.commitmentQty === 0 ? this.props.BWCommitmentQtyCount : this.state.commitmentQty;
        //var shortFallUnitsMsg = this.getShortFallUnitsMsg(TotalCommitmentQty);
        return (
            <React.Fragment>
                <div>
                    <NavigationPrompt disableNative={true} when={this.state.shouldBlockNavigation}>
                        {({ onConfirm, onCancel }) => (
                            <div when={true} onCancel={onCancel} onConfirm={onConfirm}>
                                {confirmAlert({
                                    message: getLabelText(this.props.Resources.filter((x) => { return x.resourceKey === 'unsavedchangesprompt' })[0], 'You have unsaved changes, are you sure you want to leave?'),
                                    buttons: [
                                        {
                                            label: 'Yes',
                                            onClick: () => onConfirm()
                                        },
                                        {
                                            label: 'No',
                                            onClick: () => onCancel()
                                        }
                                    ]
                                })
                                }
                            </div>
                        )}
                    </NavigationPrompt>
                    <div className="commitments" style={({ display: this.state.loading ? 'none' : 'block' })}>
                        <h3> {getLabelText(this.props.Resources.filter((x) => { return x.resourceKey === 'commitmentlabel' })[0], 'Your Commitments:')}
                            {/* <span>{shortFallUnitsMsg}</span> */}
                            {/* <span className="BW_ending"><QueryBuilder />Ending in {this.getRemaindays()} days</span> */}
                            {!this.state.hideEndingDate ? <span className="BW_ending"><QueryBuilder />{this.getRemaindays()}</span> : ''}
                        </h3>
                        <table>
                            <thead>
                                <tr>
                                    <th className="commitments_variant">{getLabelText(this.props.Resources.filter((x) => { return x.resourceKey === 'varianttype' })[0], 'Variant Type')}</th>
                                    {this.state.Commitments.attributes.elementConfig.display === 'true' || this.state.Commitments.attributes.elementConfig.display === true ?
                                        <th>{getLabelText(this.props.Resources.filter((x) => { return x.resourceKey === 'attribute' })[0], 'Attribute')}</th> : null}
                                    <th>{getLabelText(this.props.Resources.filter((x) => { return x.resourceKey === 'qunatity' })[0], 'Qty')}</th>
                                    <th className="mob_savingsperunit saving_highlight">{getLabelText(this.props.Resources.filter((x) => { return x.resourceKey === 'savingsperunit' })[0], 'Savings/Unit')}</th>
                                    <th className="saving_highlight">{getLabelText(this.props.Resources.filter((x) => { return x.resourceKey === 'savings' })[0], 'Savings')}</th>
                                    <th>{getLabelText(this.props.Resources.filter((x) => { return x.resourceKey === 'action' })[0], 'Action')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {trData}
                                <tr style={{ display: this.state.commitmentFooter ? 'table-row' : 'none' }} className="commitment_footer">
                                    <td>{getLabelText(this.props.Resources.filter((x) => { return x.resourceKey === 'totallabel' })[0], 'Total:')}</td>
                                    {this.state.Commitments.attributes.elementConfig.display === 'true' || this.state.Commitments.attributes.elementConfig.display === true ?
                                        <td></td> : null}
                                    <td>{this.state.orderTotal}</td>
                                    <td className="mob_savingsperunit saving_highlight">{this.state.savingsPerUnit !== null && <span className="currencySymbolFont">{this.props.CurrencySymbol}</span>} {this.state.savingsPerUnit !== null && this.state.savingsPerUnit} </td>
                                    <td className="saving_highlight"><span className="currencySymbolFont">{this.props.CurrencySymbol}</span> {parseFloat(Number(Math.round(this.state.totalCommitmentSavings + "e2") + "e-2").toFixed(this.props.DecimalPrecision))}</td>
                                    <td></td>
                                </tr>
                            </tbody>
                        </table>
                        <div className="commitment_update">
                            <Button greenSubmit onClick={(event) => this.submitHandler(event)}>{getLabelText(this.props.Resources.filter((x) => { return x.resourceKey === 'updatebtn' })[0], 'UPDATE')}</Button>
                            <Button simple className="commitment_cancel" onClick={(event) => this.resetHandler(event)}>{getLabelText(this.props.Resources.filter((x) => { return x.resourceKey === 'cancelbtn' })[0], 'CANCEL')}</Button>
                        </div>
                    </div>
                    {this.state.shouldBlockNavigation ?
                        <div className="commitment_save_error" onClick={(event) => this.submitHandler(event)}>
                            {getLabelText(this.props.Resources.filter((x) => { return x.resourceKey === 'unsavedcommitmentmsg' })[0], 'You have unsaved commitments on your page. click here to save your commitments')}
                        </div> : ''
                    }
                    <div style={({ display: this.state.loading ? 'block' : 'none' })}>
                        <Spinner />
                    </div>
                </div>
            </React.Fragment>
        )
    }
}
export default (withStyles(basicsStyle)(YourCommitments));