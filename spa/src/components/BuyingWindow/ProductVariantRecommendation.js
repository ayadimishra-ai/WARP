import React, { Component } from 'react';
import withStyles from "@material-ui/core/styles/withStyles";
import javascriptStyles from "../../assets/jss/material-kit-pro-react/views/componentsSections/javascriptStyles";
import Button from "../../UI/Button/MaterialButton"
import Input from '../../UI/Input/MaterialInput';

const initialState = {
    recommendation: {
        variantType: {
            elementType: 'select',
            elementConfig: {
                options: [],
                label: '-- Variant --'
            },
            value: '',
            validation: {
                required: true,
            },
            errorMessage: 'Variant Type is required',
            valid: false,
            touched: false
        }
    },
    formIsValid: false
}
class BuyingWindowCurrentScenario extends Component {
    constructor(props) {
        super(props);
        this.state = {
            totalCommitment: 0,
            ...initialState,
        }
    }

    componentDidMount() {
        const updatedRecommendation = {
            ...this.state.recommendation
        };
        updatedRecommendation.variantType.elementConfig.options = this.props.VariantData;
        this.setState({ recommendation: updatedRecommendation });
    }

    actionableNotiCallback = (event) => {
        const formData = {};
        for (let formElementIdentifier in this.state.recommendation) {
            formData[formElementIdentifier] = this.state.recommendation[formElementIdentifier].value;
        }
        this.props.GetCommitments(formData.variantType, event.currentTarget.id,this.props.NextRangeCommitment);
    }
    checkValidity(value, rules) {
        let isValid = true;
        if (rules.required) {
            isValid = value.trim() !== "" && isValid;
        }
        return isValid;
    }
    variantTypeChangedHandler(event, inputIdentifier) {
        const updatedRecommendation = {
            ...this.state.recommendation
        };
        const updatedFormElement = {
            ...updatedRecommendation[inputIdentifier]
        };
        updatedFormElement.value = event.target.value;
        updatedFormElement.valid = this.checkValidity(
            updatedFormElement.value,
            updatedFormElement.validation
        );
        updatedFormElement.touched = true;
        updatedRecommendation[inputIdentifier] = updatedFormElement;

        let formIsValid = true;
        for (let inputIndentifiers in updatedRecommendation) {
            formIsValid = updatedRecommendation[inputIndentifiers].valid && formIsValid;
        }
        this.setState({
            recommendation: updatedRecommendation,
            formIsValid: formIsValid
        });
    }

    render() {
        let variantTypeArray = [];
        for (let key in this.state.recommendation) {
            variantTypeArray.push({
                id: key,
                config: this.state.recommendation[key]
            });
        }
        return (
            <React.Fragment>
                <div className={this.props.showDropDown ? "Bw_currentScenario_drop_down_open Bw_currentScenario_drop_down" : "Bw_currentScenario_drop_down"}>
                    {variantTypeArray.map(formElement => (
                        <Input
                            //class={formElement.config.requiredclass}
                            key={formElement.id}
                            elementType={formElement.config.elementType}
                            elementConfig={formElement.config.elementConfig}
                            //label={formElement.config.label}
                            invalid={!formElement.config.valid}
                            shouldValidate={formElement.config.validation}
                            touched={formElement.config.touched}
                            errorMessage={formElement.config.errorMessage}
                            value={formElement.config.value}
                            SelectChange={(event) => this.variantTypeChangedHandler(event, formElement.id)}
                        />
                    ))}
                    <Button id={this.props.RecommName} onClick={(event) => this.actionableNotiCallback(event)} simple>Done</Button>
                </div>
            </React.Fragment >

        )
    }
}

export default withStyles(javascriptStyles)(BuyingWindowCurrentScenario);