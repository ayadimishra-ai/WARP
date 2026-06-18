import React, { Component } from 'react';
import { connect } from 'react-redux';
import GridContainer from "../../components/Material/Grid/GridContainer";
import GridItem from '../../components/Material/Grid/GridItem';
import withStyles from "@material-ui/core/styles/withStyles";
import Input from '../../UI/Input/MaterialInput';
import { getLabelText } from '../../config'

let initialState = {
    freightForm: {
        defaultFreight: {
            elementType: 'select',
            elementConfig: {
                options: [],
                selectCaption: '-- Select Freight --'
            },
            value: '',
            validation: {
                required: true
            },
            errorMessage: 'Freight is required',
            valid: false,
            touched: false,
            checked: false,
            formControlClass: 'cart_select_main',
            selectTag: 'cart_select_tag',
            selectInputlabel: 'cart_select_label'
        }
    },
}
let freightFormArray = [];
class BasketFreight extends Component {
    state = {
        ...initialState,
        showData: false
    }
    InitialLoaderComponent = props => (
        <div className="freight-loading-div">
            <img
                alt="loader"
                src="https://cdnjs.cloudflare.com/ajax/libs/galleriffic/2.0.1/css/loader.gif"
            />
        </div>
    );
    freightChangeHandler = (event, basketGuid, FreightData) => {   
        const updatedFreightForm = {
            ...this.state.freightForm
        };
        if (FreightData !== null) {

            let result = JSON.parse(JSON.stringify(FreightData)).map(item => ({
                Id: item.freightCode + " " + item.freightType,
                Value: item.currencyCode + " " + item.monetaryValue + " " + item.freightType,
            }))
            // result.push({ Id: 0, Value: 'Select Freight', });
            // var ReverseArray = [];
            // var length = result.length;
            // for (var i = length - 1; i > 0; i--) {
            //     ReverseArray.push(result[i]);
            // }
            updatedFreightForm.defaultFreight.elementConfig.options = result;

            updatedFreightForm.defaultFreight.value = event.target.value;
            this.setState({ freightForm: updatedFreightForm })
        }
        this.props.OnSelectChange(event, basketGuid)
    }
    getFreightList(FreightData) {
        const updatedFreightForm = {
            ...this.state.freightForm
        };

        freightFormArray.push(this.state.freightForm)
        if (FreightData !== null) {
            let list1, result = null;
            list1 = JSON.stringify(FreightData)
            result = JSON.parse(list1).map(item => ({
                Id: item.freightCode + " " + item.freightType,
                Value: item.currencyCode + " " + item.monetaryValue + " " + item.freightType,
            }))
            updatedFreightForm.defaultFreight.elementConfig.options = result;
            updatedFreightForm.defaultFreight.value = 0;
            this.setState({ freightForm: updatedFreightForm, showData: true })
        }
        else {
            initialState.freightForm.defaultFreight.elementConfig.options = [];
        }
    }
    componentWillMount() {
        var that = this;
        setTimeout(function () {
            that.getFreightList(that.props.FreightData);
        }, that.props.wait);
    }

    render() {
        let freightElementsArray = [];
        for (let key in initialState) {
            freightElementsArray.push({
                id: key,
                config: initialState[key]
            });
        }
        return (
            <div>
                <GridContainer>
                    <GridItem classes="select_freight_cartpage">
                        {this.props.CountryCode.toLowerCase() === "us" ?
                            this.state.showData === true ?
                                freightElementsArray.map(formElement => (
                                    <div key={formElement.id}>
                                        <Input
                                            FormControlClass={formElement.config.defaultFreight.formControlClass}
                                            selectTag={formElement.config.defaultFreight.selectTag}
                                            selectInputlabel={formElement.config.defaultFreight.selectInputlabel}
                                            key={formElement.id}
                                            elementType={formElement.config.defaultFreight.elementType}
                                            elementConfig={formElement.config.defaultFreight.elementConfig}
                                            label={formElement.config.defaultFreight.label}
                                            invalid={!formElement.config.defaultFreight.valid}
                                            shouldValidate={formElement.config.defaultFreight.validation}
                                            touched={formElement.config.defaultFreight.touched}
                                            errorMessage={formElement.config.defaultFreight.errorMessage}
                                            SelectChange={(event) => this.freightChangeHandler(event, this.props.BasketGuid, this.props.FreightData)}//{(event) => this.freightChangeHandler(event, formElement.id)}
                                            value={formElement.config.defaultFreight.value} />
                                    </div>
                                )) : this.InitialLoaderComponent() : getLabelText(this.props.Resources.filter(x => { return x.resourceKey === "notprovide"; })[0], "Not Provided")}

                    </GridItem>
                </GridContainer>
            </div>
        )
    }
}
const mapStateToProps = state => {
    return {
        userId: state.login.userId,
        userType: state.login.userType,
        languageId: state.master.languageId,
        emailId: state.login.emailId,
        IsAuthentic: state.login.IsAuthentic,
        languageList: state.master.languageList,
        tokenId: state.login.tokenId,
        tokenStart: state.login.tokenStart,
        tokenEnd: state.login.tokenEnd,
        cartCounter: state.basket.cartCounter
    };
}

export default connect(mapStateToProps)(withStyles({ withTheme: true })(BasketFreight));