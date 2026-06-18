import React, { Component } from 'react';
import { connect } from 'react-redux';
import GridContainer from "../../components/Material/Grid/GridContainer";
import GridItem from '../../components/Material/Grid/GridItem';
import basicsStyle from "../../assets/jss/material-kit-pro-react/views/componentsSections/basicsStyle.jsx";
import withStyles from "@material-ui/core/styles/withStyles";
import Input from '../../UI/Input/MaterialInput'

const initialState = {
    declarationForm: {
        defaultDeclaration: {
            elementType: 'checkbox',
            elementConfig: {
                options: []
            },
            validation: {
                required: false
            },
            label: "I have reviewed the location and artwork for all the items."
        }
    },
    formIsValid: false
}

class BasketDeclarationCheck extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ...initialState
        };

    }
    handleCheckChange = event => {
        this.props.handleDeclareCheck(event);
    };
    checkBox = (ev) => {
        ev.stopPropagation();
    }
    render() {
        let formElementsArray = [];
        for (let key in this.state.declarationForm) {
            formElementsArray.push({
                id: key,
                config: this.state.declarationForm[key]
            });

        }
        return (
            <React.Fragment>
                <GridContainer>
                    <GridItem>
                        {formElementsArray.map(formElement => (
                            <div key={formElement.id}>
                                <Input
                                    elementType={formElement.config.elementType}
                                    elementConfig={formElement.config.elementConfig}
                                    checked={this.state.checked}
                                    checkBoxLabel={formElement.config.label}
                                    onClickd={this.checkBox}
                                    changed={(event) => this.handleCheckChange(event)}
                                />
                            </div>
                        ))}
                    </GridItem>
                </GridContainer>
            </React.Fragment>
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

export default connect(mapStateToProps)(withStyles(basicsStyle)(BasketDeclarationCheck));