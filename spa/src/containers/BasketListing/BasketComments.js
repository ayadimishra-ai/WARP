import React, { Component } from 'react';
import { connect } from 'react-redux';
import GridContainer from "../../components/Material/Grid/GridContainer";
import GridItem from '../../components/Material/Grid/GridItem';
import basicsStyle from "../../assets/jss/material-kit-pro-react/views/componentsSections/basicsStyle.jsx";
import withStyles from "@material-ui/core/styles/withStyles";
import Input from '../../UI/Input/MaterialInput';

const initialState = {
    commentForm: {
        commentField: {
            elementType: 'input',
            elementConfig: {
                type: 'textarea',
                placeholder: 'Add your comments here',
                multiline:true,
            },
            value: '',
            validation: {
                required: false,
            },
            valid: false,
            touched: false,
        }
    },
    formIsValid: false
}

class BasketComments extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ...initialState
        };
    }
    checkValidity(updatedFormElement) {
        let isValid = true;
        if (!updatedFormElement.validation) {
            isValid = true;
        }
        if (updatedFormElement.value.trim() === '' || updatedFormElement.value.trim() === 0) {
            isValid = false && isValid;
        }
        updatedFormElement.valid = isValid;
        updatedFormElement.touched = true;
        return updatedFormElement;
    }
    commentsChangeHandler = (event, inputIdentifier) => {
        const updatedCommentForm = {
            ...this.state.commentForm
        };
        const updatedFormElement = {
            ...updatedCommentForm[inputIdentifier]
        };
        updatedFormElement.value = event.target.value;
        updatedCommentForm[inputIdentifier] = this.checkValidity(updatedFormElement);

        let formIsValid = true;

        for (let inputIndentifiers in updatedCommentForm) {
            formIsValid = updatedCommentForm[inputIndentifiers].valid && formIsValid;
        }
        //this.props.onChangetext(event.target.value);
        this.setState({
            commentForm: updatedCommentForm,
            formIsValid: formIsValid
        });
    }
    onBlurHandler= (event) => {
        this.props.onChangetext(event.target.value,this.props.BasketGuid);
    }
    render() {
        let formElementsArray = [];
        for (let key in this.state.commentForm) {
            formElementsArray.push({
                id: key,
                config: this.state.commentForm[key]
            });

        }
        return (
            <React.Fragment>
                <GridContainer className="add_new_comment">
                    <GridItem className="newThemeInput">
                        {formElementsArray.map(formElement => (
                            <div key={formElement.id} onBlur={(event) => this.onBlurHandler(event)}>
                                <Input
                                    elementType={formElement.config.elementType}
                                    elementConfig={formElement.config.elementConfig}
                                    invalid={!formElement.config.valid}
                                    shouldValidate={formElement.config.validation}
                                    touched={formElement.config.touched}
                                    errorMessage={formElement.config.errorMessage}
                                    value={formElement.config.value}
                                    class="newInput"
                                    changed={(event) => this.commentsChangeHandler(event, formElement.id)}                                    
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

export default connect(mapStateToProps)(withStyles(basicsStyle)(BasketComments));