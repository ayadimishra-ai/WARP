import withStyles from "@material-ui/core/styles/withStyles";
import axios from 'axios';
import PropTypes from "prop-types";
import React, { Component } from "react";
import { confirmAlert } from 'react-confirm-alert';
import Slider from "react-slick";
import image from "../../assets/img/login-bg.png";
import headerLinksStyle from "../../assets/jss/material-kit-pro-react/components/headerLinksStyle.jsx";
import loginPageStyle from "../../assets/jss/material-kit-pro-react/views/loginPageStyle";
import GridContainer from "../../components/Material/Grid/GridContainer";
import GridItem from "../../components/Material/Grid/GridItem.jsx";
import { getLabelText, getLanguageResourceElasticIndex, getServiceUrl, getWebsiteLanguageGuid } from '../../config';
import Button from "../../UI/Button/MaterialButton";
import Input from "../../UI/Input/MaterialInput";
import { getPageResource } from '../../utility';


const initialState = {
    SignUpDetails: {
        emailId: {
            elementType: 'input',
            class: "newInput",
            elementConfig: {
                placeholder: 'e.g john@john.com',
            },
            value: '',
            validation: {
                required: true,
                emailFormat: true,
                maxLength: 50,
            },
            requiredclass: 'required',
            errorMessage: '',
            newThemeError: "",
            passwordError: "Enter your email id which you received invites",
            valid: false,
            touched: false,
            label: 'Email',
            SignUpDetailsInfoValid: false
        }
    }
}

class SupplierSignUp extends Component {
    static contextTypes = {
        router: PropTypes.object
    }

    constructor(props, context) {
        super(props, context);
        this.state = {
            ...initialState,
            resources: [],
            loading: false
        }
    }

    componentDidMount() {
        this.getLanguageResource();
    }

    getLanguageResource() {
        getPageResource(getLanguageResourceElasticIndex(getWebsiteLanguageGuid(), 'supplierOnBoarding'))
            .then(json => {
                this.setState({ resources: json });
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }

    checkValidity(updatedFormElement) {
        let isValid = true;
        if (!updatedFormElement.validation) {
            isValid = true;
        }
        if (updatedFormElement.validation.emailFormat && isValid) {
            var reEmailFormat = /^(([\w-]+\.)+[\w-]+|([a-zA-Z]{1}|[\w-]{2,}))@([\da-zA-Z-]{1,}\.){1,}[\da-zA-Z-]{2,}$/;
            if (!reEmailFormat.test(updatedFormElement.value)) {
                isValid = false && isValid;
            }
            if (!isValid) {
                updatedFormElement.errorMessage = 'Email not valid';                        //updating value                              
                updatedFormElement.newThemeError = 'Email not valid';                        //updating value                              
                updatedFormElement.passwordError = 'Email not valid';                       //updating value                              
            }
            else {
                updatedFormElement.errorMessage = '';                        //updating value                              
                updatedFormElement.newThemeError = '';                        //updating value                              
                updatedFormElement.passwordError = '';
            }
        }
        let ErrorMessage = "";

        if (updatedFormElement.validation.maxLength && isValid) {
            isValid = updatedFormElement.value.length <= updatedFormElement.validation.maxLength;
            if (!isValid) {
                updatedFormElement.errorMessage = updatedFormElement.label + ' length is exceeded. Maximum length allowed is ' + updatedFormElement.validation.maxLength + '.'
                updatedFormElement.passwordError = updatedFormElement.label + ' length is exceeded. Maximum length allowed is ' + updatedFormElement.validation.maxLength + '.'
            }
        }

        if (updatedFormElement.validation.minLength && isValid) {
            isValid = updatedFormElement.value.length >= updatedFormElement.validation.minLength;
            if (!isValid) {
                updatedFormElement.errorMessage = updatedFormElement.label + ' Invalid'
                updatedFormElement.passwordError = updatedFormElement.label + ' Invalid'
            }
        }

        updatedFormElement.valid = isValid;
        updatedFormElement.touched = true;
        return updatedFormElement;
    }

    inputChangedHandler = (event, inputIdentifier) => {
        const updatedSignUpDetailsInfo = {
            ...this.state.SignUpDetails
        };
        let updatedFormElement = {
            ...updatedSignUpDetailsInfo[inputIdentifier]
        };
        updatedFormElement.value = event.target.value;
        updatedSignUpDetailsInfo[inputIdentifier] = this.checkValidity(updatedFormElement)

        let formIsValid = true;
        for (let inputIdentifiers in updatedSignUpDetailsInfo) {
            formIsValid = updatedSignUpDetailsInfo[inputIdentifiers].valid && formIsValid
        }
        this.setState({ SignUpDetails: updatedSignUpDetailsInfo, SignUpDetailsInfoValid: formIsValid });
    }

    PreviousPageHandler = (event) => {
        this.context.router.history.push('/');
    }


    registrationHandler = (event) => {
        const { onNextPage = f => f } = this.props;
        var inputs, index;
        inputs = document.getElementsByClassName('required');


        for (index = 0; index < inputs.length; ++index) {
            inputs[index].id = index;
            if (inputs[index].value === '') {
                //alert(33)
                inputs[index].focus();
                var elmnt = document.getElementById(index);
                var height = '10px'
                elmnt.scrollIntoView(true);
                var scrolledY = window.scrollY;
                if (scrolledY) {
                    window.scroll(0, scrolledY - height);
                }
                ; break
            }
        }


        event.preventDefault();
        const formData = {};

        const updatedSignUpDetailsInfo = {
            ...this.state.SignUpDetails
        };
        let updatedFormElement = {
            ...updatedSignUpDetailsInfo['emailId']
        };
        updatedSignUpDetailsInfo['emailId'] = this.checkValidity(updatedFormElement)

        let formIsValid = true;
        for (let inputIdentifiers in updatedSignUpDetailsInfo) {
            formIsValid = updatedSignUpDetailsInfo[inputIdentifiers].valid && formIsValid
        }
        this.setState({ SignUpDetails: updatedSignUpDetailsInfo, SignUpDetailsInfoValid: formIsValid });

        for (let formElementIdentifier in this.state.SignUpDetails) {
            formData[formElementIdentifier] = this.state.SignUpDetails[formElementIdentifier].value;
        }
        if (updatedSignUpDetailsInfo['emailId'].value != null && updatedSignUpDetailsInfo['emailId'].value != "" && updatedSignUpDetailsInfo['emailId'].value != undefined && updatedSignUpDetailsInfo['emailId'].value != "NaN") {
            if (formIsValid) {
                this.setState({ loading: true });
                var config = {
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.tokenId,
                        'Content-Type': 'application/json',
                        EmailId: formData['emailId'],
                    },
                };

                axios.get(getServiceUrl() + 'Users/CheckExistingEmail', config)
                    .then((response) => {
                        this.setState({ loading: false });
                        if (response.data.status200OK) {
                            if (response.data.isExist === "false") {
                                const MainPageData = {
                                    isCreated: response.data.isCreated,
                                    registerDetails: response.data.registerDetails,
                                    SignUpEmail: this.state.SignUpDetails.emailId.value
                                }
                                onNextPage(MainPageData);
                            } else if (response.data.isExist === "true" && response.data.isBuyer === "true") {
                                const MainPageData = {
                                    isCreated: response.data.isCreated,
                                    isBuyer: response.data.isBuyer,
                                    registerDetails: response.data.registerDetails,
                                    SignUpEmail: this.state.SignUpDetails.emailId.value
                                }
                                onNextPage(MainPageData);
                                // confirmAlert({
                                //     message: response.data.result,
                                //     buttons: [
                                //         {
                                //             label: 'CONTINUE',
                                //             onClick: () => {
                                //                 const MainPageData = {
                                //                     isCreated: response.data.isCreated,
                                //                     isBuyer: response.data.isBuyer,
                                //                     registerDetails: response.data.registerDetails,
                                //                     SignUpEmail: this.state.SignUpDetails.emailId.value
                                //                 }
                                //                 onNextPage(MainPageData);
                                //             }
                                //         },
                                //         {
                                //             label: 'CANCEL',
                                //             onClick: () => {

                                //             }
                                //         }
                                //     ]
                                // });
                            } else if (response.data.isExist === "true" && response.data.isCreated === "true") {
                                const MainPageData = {
                                    isCreated: response.data.isCreated,
                                    isBuyer: response.data.isBuyer,
                                    registerDetails: response.data.registerDetails,
                                    SignUpEmail: this.state.SignUpDetails.emailId.value
                                }
                                onNextPage(MainPageData);
                                // confirmAlert({
                                //     message: response.data.result,
                                //     buttons: [
                                //         {
                                //             label: 'CONTINUE',
                                //             onClick: () => {
                                //                 const MainPageData = {
                                //                     isCreated: response.data.isCreated,
                                //                     isBuyer: response.data.isBuyer,
                                //                     registerDetails: response.data.registerDetails,
                                //                     SignUpEmail: this.state.SignUpDetails.emailId.value
                                //                 }
                                //                 onNextPage(MainPageData);
                                //             }
                                //         },
                                //         {
                                //             label: 'CANCEL',
                                //             onClick: () => {

                                //             }
                                //         }
                                //     ]
                                // });
                            } else if (response.data.isExist === "true" && response.data.isCreated === "false") {
                                confirmAlert({
                                    message: response.data.result,
                                    buttons: [
                                        {
                                            label: 'SIGN IN',
                                            onClick: () => {
                                                this.context.router.history.push('/');
                                            }
                                        },
                                        {
                                            label: 'CANCEL',
                                            onClick: () => {

                                            }
                                        }
                                    ]
                                });
                            } else {
                                confirmAlert({
                                    message: response.data.result,
                                    buttons: [
                                        {
                                            label: 'YES',
                                            onClick: () => {
                                                const MainPageData = {
                                                    isCreated: response.data.isCreated,
                                                    isBuyer: response.data.isBuyer,
                                                    registerDetails: response.data.registerDetails,
                                                    SignUpEmail: this.state.SignUpDetails.emailId.value
                                                }
                                                onNextPage(MainPageData);
                                            }
                                        },
                                        {
                                            label: 'CANCEL',
                                            onClick: () => {

                                            }
                                        }
                                    ]
                                });
                            }
                        } else {
                            alert("something went worng.please try again");
                        }


                    }).catch(err => {
                        this.setState({ loading: false });
                    });

            }
        }
        else {
            updatedFormElement.errorMessage = 'Enter Email';                        //updating value                              
            updatedFormElement.newThemeError = 'Enter Email';                        //updating value                              
            updatedFormElement.passwordError = 'Enter Email';                       //updating value                              
        }
    }

    enterkey = event => {
        if (event.key === "Enter") {
            this.registrationHandler(event);
        }
    };

    render() {
        const formElementsArray = [];
        const { classes } = this.props;

        for (let key in this.state.SignUpDetails) {
            formElementsArray.push({
                id: key,
                config: this.state.SignUpDetails[key]
            });
        }
        const settings = {
            dots: true,
            infinite: true,
            speed: 500,
            slidesToShow: 1,
            slidesToScroll: 1,
            arrows: false
        };
        const { resources } = this.state;

        return (
            <div
                id="supplier_signup"
                className={classes.pageHeader}
                style={{
                    backgroundImage: "url(" + image + ")",
                    backgroundSize: "cover",
                    backgroundPosition: "top center"
                }}
            >
                <div className={classes.container}>

                    <GridContainer className="login_form_parent" justify="flex-start">
                        <GridItem className="login_form" md={4}>
                            <GridContainer>
                                <GridItem className="login_left" xs={12} md={12} sm={12}>
                                    {/* <Link to="/">
                        <img
                          alt={awsUrl + "CompanyLogo.svg"}
                          src={awsUrl + "CompanyLogo.svg"}
                          onError={e => {
                            e.target.onerror = null;
                            e.target.src = '';
                          }}
                        />
                      </Link> */}
                                    <div className="login_text">
                                        <div>
                                            <h5>Sign up to Snowkap</h5>
                                            <p>The <b>world's first</b> networked marketplace for sustainability focused businesses.</p>
                                        </div>
                                        {/* <div>
                          <h5>Hi Mahesh</h5>
                          <p>Welcome back to <b>Snowkap!</b></p>
                          <p>Enter your account password to continue..</p>
                        </div> */}
                                    </div>
                                </GridItem>
                                <GridItem className="login_right" md={12} sm={12}>
                                    <form className={classes.form}>
                                        <div id="">
                                            <div className="login_page_tabs">
                                                {formElementsArray.map(formElement => (
                                                    <div className="newThemeInput">
                                                        <Input
                                                            class={formElement.config.class}
                                                            label={formElement.config.label}
                                                            key={formElement.id}
                                                            elementType={formElement.config.elementType}
                                                            elementConfig={formElement.config.elementConfig}
                                                            invalid={!formElement.config.valid}
                                                            shouldValidate={formElement.config.validation}
                                                            touched={formElement.config.touched}
                                                            newThemeError=""
                                                            changed={event => this.inputChangedHandler(event, formElement.id)}
                                                            onKeyPress={this.enterkey}
                                                            value={formElement.config.value}
                                                            passwordError={formElement.config.passwordError}
                                                            success={formElement.config.success}
                                                            error={formElement.config.error}
                                                        />
                                                    </div>
                                                ))}
                                                <div className="form_actions" >
                                                    <Button className="prev" blackBtnSimple onClick={this.PreviousPageHandler}>
                                                        {getLabelText(resources.filter((x) => { return x.resourceKey === 'registrationCancelbutton' })[0], "CANCEL")}
                                                    </Button>
                                                    <Button className="next" orangeSubmit onClick={this.registrationHandler}>
                                                        {getLabelText(resources.filter((x) => { return x.resourceKey === 'registrationNextbutton' })[0], "Proceed")}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </GridItem>
                            </GridContainer>
                        </GridItem>
                        <GridItem className="login_form_slider" md={8}>
                            < Slider {...settings}>
                                <div>Welcome to the world's first  <span className="orangeBg">Networked Marketplace</span> for sustainability focussed businesses</div>
                            </ Slider>
                        </GridItem>
                    </GridContainer>
                </div>
            </div>

        )
    }

}
export default (withStyles(loginPageStyle, headerLinksStyle)(SupplierSignUp))