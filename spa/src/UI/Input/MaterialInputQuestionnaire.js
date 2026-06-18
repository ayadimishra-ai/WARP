import React, { Component } from 'react'
import CustomInput from "../../components/Material/CustomInput/CustomInput.jsx";
import withStyles from "@material-ui/core/styles/withStyles";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import Checkbox from "@material-ui/core/Checkbox";
import Check from "@material-ui/icons/Check";
import ExpandMore from "@material-ui/icons/ExpandMore";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import InputLabel from "@material-ui/core/InputLabel";
import { getWebsiteUrl } from '../../config';
import basicsStyle from "../../assets/jss/material-kit-pro-react/views/componentsSections/basicsStyle.jsx";
import { Creatable } from 'react-select'
import CloudUpload from "@material-ui/icons/CloudUpload";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import CustomSearchMultiSelectDropdown from '../../components/SupplierOnBoarding/CustomSearchMultiSelectdropdown'
import RegionCountry from './RegionCountry';
const awsUrl = getWebsiteUrl();


class Input extends Component {
  constructor(props) {

    super(props);
    this.state = {
      shrink: false,
    }
  }

  labelShrink = () => {
    this.setState({ shrink: true })
  }

  render() {
    const { classes } = this.props;
    let inputElement = null;
    const inputClasses = [classes.InputElement];
    let validationError = null;

    if (this.props.invalid && this.props.shouldValidate && this.props.touched) {
      inputClasses.push(classes.Invalid);

      if (this.props.newThemeError !== undefined && this.props.newThemeError !== "") {
        validationError = <div className="newThemeError"><p>{this.props.newThemeError}</p></div>
      } else {
        validationError = <p className={classes.ValidationError}>{this.props.errorMessage}</p>
      }

    }
    switch (this.props.elementType) {
      case ('Text'):
        inputElement = <CustomInput
          // labelText="hifssdfsdg"
          class={this.props.class}
          onChange={this.props.changed}
          formControlProps={this.props.formControlProps}
          inputProps={{ ...this.props }}
          value={this.props.valueTextBox}
          onKeyPress={this.props.onKeyPress}
          onKeyUp={this.props.onKeyUp}
          id={this.props.id}
          onPaste={this.props.onPaste}
          error={this.props.error}
          success={this.props.success}
          disabled={this.props !== undefined ? this.props.disabled !== undefined ? this.props.disabled : false : false}
        />;
        break;
      case ('RelatedText'):
        inputElement = <CustomInput
          // labelText="hifssdfsdg"
          class={this.props.class}
          onChange={this.props.changed}
          formControlProps={this.props.formControlProps}
          inputProps={{ ...this.props }}
          value={this.props.valueTextBox}
          onKeyPress={this.props.onKeyPress}
          onKeyUp={this.props.onKeyUp}
          id={this.props.id}
          onPaste={this.props.onPaste}
          error={this.props.error}
          success={this.props.success}
          disabled={this.props !== undefined ? this.props.disabled !== undefined ? this.props.disabled : false : false}
        />;
        break;
      case ('Select'):
        if (this.props.options.length > 0) {
          inputElement = <RegionCountry
            disabled={this.props.disabled}
            changed={this.props.changed}
            answerGuid={this.props.answerGuid}
            options={this.props.options}
          />
        }
        break;
      case ('Check'):
        inputElement = (
          <FormControlLabel
            value={this.props.valueGuid}
            disabled={this.props.disabled}
            control={
              <Checkbox
                id={this.props.key}
                tabIndex={-1} //done
                onChange={(e) => { this.props.changed(e) }}    //done           
                checked={this.props.checked}
                checkedIcon={<Check className={classes.checkedIcon} />}
                icon={<Check className={classes.uncheckedIcon} />}
                classes={{
                  checked: classes.checked,
                  root: classes.checkRoot
                }}
              />
            }
            classes={{ label: classes.label }}
            label={this.props.label} //done
            className={this.props.class}
          />

        )
        break;
      case ('Radio'):
        inputElement = (
          <FormControlLabel
            disabled={this.props.disabled}
            value={this.props.value}
            label={this.props.label}
            onChange={this.props.changed}
            checked={this.props.isSelected}
            control={<Radio color="primary" />}
          />
        )
        break;
      default:
        inputElement = <input
          className={classes.InputElement}
          {...this.props}
          value={this.props.valueText}
          onChange={this.props.changed} />;
    }
    let returnBox = <div className="input_parent_div">
      <label className="input_label">{this.props.label}</label>
      {inputElement}
      {validationError}
      {this.props.passwordError && <div className="passwordError"><p>{this.props.passwordError}</p></div>}
    </div>
    if (this.props.elementType !== 'Text') {
      returnBox = <div className="input_parent_div">
        {inputElement}
        {validationError}
        {this.props.passwordError && <div className="passwordError"><p>{this.props.passwordError}</p></div>}
      </div>

    }

    return returnBox
  }
}

export default withStyles(basicsStyle)(Input);
