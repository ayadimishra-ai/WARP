import FormControl from '@material-ui/core/FormControl';
import MatInput from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import ExpandMore from "@material-ui/icons/ExpandMore";
import React, { Component } from "react";
import Input from "../../UI/Input/MaterialInput";
import { getAWSUrl, getGlobalSettings } from '../../config';

var IsGeneralDetails = false;

// var countryIndia = "";
// const globalCountries = () => {
//     getGlobalSettings("COUNTRYNAME").then(function (result) {
//         if (result !== undefined) {
//             countryIndia = result.data.hits.hits[0]._source.settingsValue;
//         }
//     });
// };
class CountrySelect extends Component {
    constructor(props) {
        super(props);
        this.state = {
            mobileCode: '',
            isValid: true,
            CountryCount: 0,
            isdisabled: false,
            onFocusClass:'',
        };
    }
    keypress = (event) => {
        var keyCode = event.keyCode || event.which;
        var regex = /^[0-9\b]+$/;
        var isValid = regex.test(String.fromCharCode(keyCode));
        this.setState({ isValid: isValid });

    }
    onChange = (event) => {
        if (event.target.value.length < 20 && this.state.isValid) {
            this.props.supplierNumberChange(event)
            if(this.props.verifyOtpInchange !== undefined){
            this.props.verifyOtpInchange(event)
            }
        }
        else {
            this.setState({ isValid: true });
        }
    }

    handleChange = event => {
        this.setState({
            mobileCode: event.target.value,
        });
        this.props.handleCountryChange(event.target.value)
    };
    componentDidMount() {
        //globalCountries();
        let IsDisabled = false;
        if (this.props.IsDisabled != undefined) {
            if (this.props.IsDisabled === true) {
                IsDisabled = true;
            }
        }
        if (this.props.countryList.length > 0) {
            this.setState({
                mobileCode: this.props.countryList.filter(x => x.CountryName === "India")[0].MobileCode,
                isdisabled: IsDisabled
            })
            this.props.handleCountryChange(this.props.countryList.filter(x => x.CountryName === "India")[0].MobileCode)
        }
        if (this.props.IsGeneralDetails != undefined) {
            IsGeneralDetails = this.props.IsGeneralDetails;
        } else {
            IsGeneralDetails = false;
        }
    }

    componentDidUpdate() {
        let IsDisabled = false;
        if (this.props.IsDisabled != undefined) {
            if (this.props.IsDisabled === true) {
                IsDisabled = true;
                if (this.state.isdisabled === false) {
                    this.setState({
                        isdisabled: IsDisabled
                    })
                }
            }
        }
        if (this.props.countryList.length > 0 && this.props.countryList.length !== this.state.CountryCount) {
            this.setState({
                mobileCode: this.props.countryList.filter(x => x.CountryName === "India")[0].MobileCode,
                CountryCount: this.props.countryList.length
            })
            this.props.handleCountryChange(this.props.countryList.filter(x => x.CountryName === "India")[0].MobileCode)
        }

        if (this.props.IsGeneralDetails != undefined) {
            IsGeneralDetails = this.props.IsGeneralDetails;
        } else {
            IsGeneralDetails = false;
        }
    }

    render() {
        // code to be removed
        let newDesign = ""
        let newDesign1 = ""
        if (window.location.href.indexOf('/abc') === -1) {
            newDesign = "mob_input_main2"
            newDesign1 = "mob_input2"
        } else {
            newDesign = "mob_input_main"
            newDesign1 = "mob_input"
        }
        // code to be removed
        return (
            <div className={newDesign + " " + this.state.onFocusClass}>
                <div>
                <div className={this.props.emailData === true ? 'disabledTextfield input_parent_div' : 'input_parent_div'}>
                        {newDesign === "mob_input_main" && <label className="input_label">{IsGeneralDetails === true ? "Mobile *" : "Mobile"} </label>}
                        {this.props.countryList.length === 1 ? '' : <FormControl className={this.props.invalid && this.props.shouldValidate && this.props.touched ? 'input_2_main country_select_droddown error_input' : 'input_2_main country_select_droddown'}>
                            <InputLabel shrink htmlFor="countryFlag-label-placeholder"></InputLabel>
                            <Select
                                value={this.state.mobileCode}
                                IconComponent={ExpandMore}
                                onChange={this.handleChange}
                                input={<MatInput name="countryFlag" id="countryFlag-label-placeholder" />}
                                displayEmpty
                                name="countryFlag"
                                className={'material_select'}
                                inputProps={{
                                    className: "selectmate" + ' ' + 'newInput_2',
                                }}
                                disabled={this.props.emailData === true ? true :false}
                            >
                                {this.props.countryList.map(country => {
                                    return <MenuItem value={country.MobileCode}>
                                        <img alt=" " src={getAWSUrl() + "FlagIcons/" + country.Image} />
                                        <span>{country.CountryName}</span></MenuItem>
                                })}
                            </Select>
                        </FormControl>}
                    </div>
                </div>
                <div className={this.props.countryList.length === 1 ? 'borderRadRight' : newDesign1}>
                    {this.props.countryList.length === 1 ? '' : <span style={{ 'color': '#666' }} className="selectCode">{this.state.mobileCode}</span>}
                    <Input
                        onKeyPress={(e) => this.keypress(e)}
                        changed={(event) => this.onChange(event)}
                        elementConfig={{ placeholder: '', disabled: this.props.emailData === true ? true :this.state.isdisabled }}
                        elementType="input_2"
                        value={this.props.supplierNumber}
                        class="newInput_2"
                        label={newDesign === "mob_input_main2" ? "Mobile" : ''}
                        newThemeError={this.props.newError}
                        touched={this.props.touched}
                        valid={this.props.valid}
                        invalid={this.props.invalid}
                        shouldValidate={this.props.shouldValidate}
                        onFocus={()=> this.setState({onFocusClass:'onFocusClass'})}
                        onBlur={()=> this.setState({onFocusClass:''})}
                    />
                </div>
            </div>
        )
    }
}

export default CountrySelect