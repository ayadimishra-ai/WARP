import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import axios from 'axios';
import { getServiceUrl } from '../../config';
import { getRegistrationFieldList } from '../../utility';
import GridItem from "../../components/Material/Grid/GridItem.jsx";
import GridContainer from "../../components/Material/Grid/GridContainer";
import Input from '../../UI/Input/MaterialInput';
import Button from '../../UI/Button/MaterialButton';
import { confirmAlert } from 'react-confirm-alert';
import toaster from 'toasted-notes';
import { toasterAlert } from '../../utility';
import PropTypes from 'prop-types'
import { getCountries, getCountryCallingCode } from 'react-phone-number-input/input'
import en from 'react-phone-number-input/locale/en.json'
import phoneLogo from '../../assets/img/world.png'; // with import
import RegClass from './Registrationclass.css';


let list = null;
let FieldsConfiguration = [];
let FieldDataMasterValidation = [];
// let listItems;
let imageArray = [];

class Registration extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            countryList: [],
            listItems: [],
            registartionForm: {},
            userInfoValid: false,
            loading: true,
            phone: "",
            FlagImage: []
        }
    }


    inputChangedHandler = (event, inputIdentifier) => {

        const updatedRegistrationForm = {
            ...this.state.registartionForm
        };
        let updatedFormElement = {
            ...updatedRegistrationForm[inputIdentifier]
        };
        updatedFormElement.value = event.target.value;
        updatedRegistrationForm[inputIdentifier] = this.checkValidity(updatedFormElement)

        let formIsValid = true;
        for (let inputIdentifiers in updatedRegistrationForm) {
            formIsValid = updatedRegistrationForm[inputIdentifiers].valid && formIsValid
        }
        this.setState({ registartionForm: updatedRegistrationForm, userInfoValid: formIsValid });
    }

    inputChangedHandler = (event, inputIdentifier) => {

        const updatedRegistrationForm = {
            ...this.state.registartionForm
        };

        const updatedFormElement = {
            ...updatedRegistrationForm[inputIdentifier]
        };

        updatedFormElement.value = event.target.value;
        updatedRegistrationForm[inputIdentifier] = this.checkValidity(updatedFormElement)

        if (inputIdentifier === updatedFormElement.label) {
            // this.onCountryChanged(updatedFormElement.label, event.target.value);
        }
        let formIsValid = true;
        for (let inputIdentifiers in updatedRegistrationForm) {
            formIsValid = updatedRegistrationForm[inputIdentifiers].valid && formIsValid
        }
        this.setState({ registartionForm: updatedRegistrationForm, userInfoValid: formIsValid });
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
        if (updatedFormElement.validation.alphabatesOnly && updatedFormElement.value.trim() !== '') {
            var re = /^[a-zA-Z\s]+$/;
            if (!re.test(updatedFormElement.value)) {
                isValid = false && isValid;
                updatedFormElement.errorMessage = 'Invalid Value. special characters and numbers are not alllowed.';
            }
        }
        if (updatedFormElement.validation.phoneNumber && updatedFormElement.value.trim() !== '') {
            var rePhone = /^[0-9\+\-\(\)\s]*$/;
            if (!rePhone.test(updatedFormElement.value)) {
                isValid = false && isValid;
                updatedFormElement.errorMessage = 'Invalid Value. Only numbers are alllowed.';
            }
        }
        if (updatedFormElement.validation.alphaNumericOnly && updatedFormElement.value.trim() !== '') {
            var reAlphaNumeric = /^[a-z0-9]+$/i;

            if (!reAlphaNumeric.test(updatedFormElement.value) || !isNaN(updatedFormElement.value)) {
                isValid = false && isValid;
                updatedFormElement.errorMessage = 'Invalid Value. only special characters and numbers are not alllowed.';
            }
        }

        if (updatedFormElement.validation.emailFormat && isValid) {
            var reEmailFormat = /^(([\w-]+\.)+[\w-]+|([a-zA-Z]{1}|[\w-]{2,}))@([\da-zA-Z-]{1,}\.){1,}[\da-zA-Z-]{2,}$/;
            if (!reEmailFormat.test(updatedFormElement.value)) {
                isValid = false && isValid;
            }
            if (!isValid) {
                updatedFormElement.errorMessage = 'Email not valid';                        //updating value                              
            }
        }
        if (updatedFormElement.validation.matchPassword && isValid) {
            const regitrationForm = { ...this.state.registartionForm };
            if (regitrationForm.password.value !== updatedFormElement.value) {
                isValid = false;
                updatedFormElement.errorMessage = 'Passwords must match';
            }
        }

        if (updatedFormElement.validation.passwordFormat && isValid) {
            if (updatedFormElement.value.length < 8) {
                isValid = false && isValid;
            }
            var rePasswordFormat = /[0-9]/;
            if (!rePasswordFormat.test(updatedFormElement.value)) {
                isValid = false && isValid;
            }
            rePasswordFormat = /[a-z]/;
            if (!rePasswordFormat.test(updatedFormElement.value)) {
                isValid = false && isValid;
            }
            rePasswordFormat = /[A-Z]/;
            if (!rePasswordFormat.test(updatedFormElement.value)) {
                isValid = false && isValid;
            }
            rePasswordFormat = /[!@#$%^&*(),.?":{}|<>]/;
            if (!rePasswordFormat.test(updatedFormElement.value)) {
                isValid = false && isValid;
            }
            if (!isValid) {
                updatedFormElement.errorMessage = "Password must contain: minimum 8 characters, at least 1 upper case alphabet, at least 1 lower case alphabet, at least 1 number and at least 1 special character."
            }
        }
        if (updatedFormElement.validation.maxLength && isValid) {
            isValid = updatedFormElement.value.length <= updatedFormElement.validation.maxLength;
            if (!isValid) {
                updatedFormElement.errorMessage = updatedFormElement.label + ' length is exceeded'
            }
        }

        if (updatedFormElement.validation.minLength && isValid) {
            isValid = updatedFormElement.value.length >= updatedFormElement.validation.minLength;
            if (!isValid) {
                updatedFormElement.errorMessage = updatedFormElement.label + ' Invalid'
            }
        }

        updatedFormElement.valid = isValid;
        updatedFormElement.touched = true;
        return updatedFormElement;
    }

    registrationHandler = (event) => {
        event.preventDefault();
        const formData = {};
        let formArray = [];
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

        for (let formElementIdentifier in this.state.registartionForm) {
            // formData[formElementIdentifier] = this.state.registartionForm[formElementIdentifier].value;
            var dataForm = { Id: formElementIdentifier, Value: this.state.registartionForm[formElementIdentifier].value }
            formArray.push(dataForm);
        }

        if (this.state.userInfoValid) {
            this.setState({ loading: true });
            let data = { details: formArray };
            var config = {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.tokenId,
                    'Content-Type': 'application/json',
                }
            };
            const FormDetails = data;
            axios.post(getServiceUrl() + 'RegistrationField/SaveRegistrationDetails?', FormDetails, config)
                .then((response) => {
                    this.setState({ loading: false });
                    if (response.data.saveresult === "success") {
                        confirmAlert({
                            message: 'Registered successfully',
                            buttons: [
                                {
                                    label: 'OK',
                                    onClick: () => {
                                        // this.context.router.history.push('/');
                                        //this.setState({ loading: false });
                                    }
                                }
                            ]
                        });
                    }
                    else {
                        //alert(response.data.saveresult);
                        toaster.notify(toasterAlert('WARNING', response.data.saveresult), {
                            duration: null
                        }
                        )
                    }
                })
            this.setState({ loading: false });
            confirmAlert({
                message: 'Registered successfully',
                buttons: [
                    {
                        label: 'OK',
                        onClick: () => {
                            // this.context.router.history.push('/');
                            //this.setState({ loading: false });
                        }
                    }
                ]
            });
        } else {
            const updatedRegistrationForm = { ...this.state.registartionForm }
            for (let inputIndentifiers in updatedRegistrationForm) {
                updatedRegistrationForm[inputIndentifiers].touched = !updatedRegistrationForm[inputIndentifiers].valid;
            }
            this.setState({
                registrationForm: updatedRegistrationForm,
            });
        }

    }

    getRegistrationFieldDetails() {
        // ;
        getRegistrationFieldList().then((List) => {
            this.setState({ loading: false });
            // console.log(List);
            this.setState({ registartionForm: List[0] })

        }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }

    checkMobileNumber = (formElement) => {
        if (formElement.toLowerCase().indexOf('phone') > -1 || formElement.toLowerCase().indexOf('mobile') > -1) {
            return true;
        } else {
            return false;
        }
    }

    CountrySelectHandler = (countrydata, inputIdentifier, index) => {

        if (countrydata !== undefined && countrydata !== "") {
            let data = countrydata.split('-');
            let CallingCode = data[0];
            let FlagCode = data[1];
            this.setState({ phone: countrydata });

            const updatedFlagImage = {
                ...this.state.FlagImage
            };

            let updateFlagImage = {
                ...updatedFlagImage[index]
            };

            const graphImage = require('../../assets/img/flag-icons/' + FlagCode + '.svg');
            updateFlagImage = graphImage;
            updatedFlagImage[index] = updateFlagImage;
            this.setState({ FlagImage: updatedFlagImage });
            // document.getElementById(inputIdentifier).value = CallingCode;

            const updatedRegistrationForm = {
                ...this.state.registartionForm
            };
            let updatedFormElement = {
                ...updatedRegistrationForm[inputIdentifier]
            };
            updatedFormElement.value = "+" + CallingCode;
            updatedRegistrationForm[inputIdentifier] = this.checkValidity(updatedFormElement)

            let formIsValid = true;
            for (let inputIdentifiers in updatedRegistrationForm) {
                formIsValid = updatedRegistrationForm[inputIdentifiers].valid && formIsValid
            }
            this.setState({ registartionForm: updatedRegistrationForm, userInfoValid: formIsValid });

        } else {
            const updatedFlagImage = {
                ...this.state.FlagImage
            };

            let updateFlagImage = {
                ...updatedFlagImage[index]
            };

            updateFlagImage = phoneLogo;
            updatedFlagImage[index] = updateFlagImage;
            this.setState({ FlagImage: updatedFlagImage });
        }
    }


    async componentDidMount() {
        // if ((localStorage.tokenId === undefined) || (localStorage.tokenId === 'null' || localStorage.tokenId === null) || moment.utc().diff(localStorage.tokenStart, 'seconds') > localStorage.tokenEnd) {
        //     await getToken().then((json) => {
        //         localStorage.setItem('tokenId', json.data.tokenId);
        //         localStorage.setItem('tokenStart', moment.utc());
        //         localStorage.setItem('tokenEnd', json.data.expires_in);

        //     }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
        // }

        this.getRegistrationFieldDetails();
        this.setState({ FlagImage: imageArray });

    }

    render() {
        if (localStorage.getItem("IsAuthentic") === 'true' || localStorage.getItem("IsAuthentic") === true) {
            return <Redirect to="/home" />
        }

        const CountrySelect = ({ index, value, onChange, labels, ...rest }) => (
            <div className={RegClass.maindivision}>

                <img alt=" " src={this.state.FlagImage[index]} className={RegClass.inputImage}></img>
                <select
                    {...rest}
                    value={value}
                    onChange={event => onChange(event.target.value || undefined)}>
                    <option value={this.state.phone}>
                        {labels['ZZ']}
                    </option>
                    {getCountries().map((country) => (
                        <option key={country} value={getCountryCallingCode(country) + '-' + country}>
                            {labels[country]} +{getCountryCallingCode(country)}
                        </option>
                    ))}
                </select>
            </div>

        )

        CountrySelect.propTypes = {
            index: PropTypes.number,
            value: PropTypes.string,
            onChange: PropTypes.func.isRequired,
            labels: PropTypes.objectOf(PropTypes.string).isRequired
        }

        let formDetails;
        const formElementsArray = []
        if (this.state.registartionForm != {}) {
            for (let key in this.state.registartionForm) {
                if (this.checkMobileNumber(key)) {
                    imageArray.push(phoneLogo);
                } else {
                    imageArray.push("");
                }

                formElementsArray.push({
                    id: key,
                    config: this.state.registartionForm[key]
                });
            }

            formDetails = (
                formElementsArray.map((formElement, index) => (

                    <GridItem md={3} lg={3} sm={4} xs={6}>
                        { this.checkMobileNumber(formElement.id) ?
                            <div>
                                <CountrySelect
                                    index={index}
                                    className={RegClass.selectclass}
                                    labels={en}
                                    value={this.state.phone}
                                    onChange={phone => this.CountrySelectHandler(phone, formElement.id, index)} />

                                <Input
                                    class={formElement.config.requiredclass + ' ' + RegClass.inputindent}
                                    key={formElement.id}
                                    elementType={formElement.config.elementType}
                                    elementConfig={formElement.config.elementConfig}
                                    label={formElement.config.label}
                                    invalid={!formElement.config.valid}
                                    shouldValidate={formElement.config.validation}
                                    touched={formElement.config.touched}
                                    errorMessage={formElement.config.errorMessage}
                                    changed={(event) => this.inputChangedHandler(event, formElement.id)}
                                    SelectChange={(event) => this.inputChangedHandler(event, formElement.id)}
                                    value={formElement.config.value} />
                            </div>


                            :
                            <Input
                                class={formElement.config.requiredclass}
                                key={formElement.id}
                                elementType={formElement.config.elementType}
                                elementConfig={formElement.config.elementConfig}
                                label={formElement.config.label}
                                invalid={!formElement.config.valid}
                                shouldValidate={formElement.config.validation}
                                touched={formElement.config.touched}
                                errorMessage={formElement.config.errorMessage}
                                changed={(event) => this.inputChangedHandler(event, formElement.id)}
                                SelectChange={(event) => this.inputChangedHandler(event, formElement.id)}
                                value={formElement.config.value} />
                        }

                    </GridItem>
                )
                )

            )
        }

        // console.log(formDetails);
        return (
            <div>
                <form onSubmit={this.registrationHandler} className='registration_part'>
                    <div className='regi_header'>
                        Registration
                </div>
                    <div className="Register_grid">
                        <GridContainer>
                            {this.state.registartionForm !== {} ? formDetails : ""}
                        </GridContainer>
                    </div>
                    <div className="">
                        <div className="regi_submit">
                            <Button greenSubmit
                                btnType="btnDefault"
                                onClick={this.registrationHandler}
                            >Submit</Button>
                        </div>
                    </div>

                </form>




            </div>


        );
    }

}
export default (Registration);
