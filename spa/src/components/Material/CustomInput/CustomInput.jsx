import React from "react";
// nodejs library to set properties for components
import PropTypes from "prop-types";
// nodejs library that concatenates classes
import classNames from "classnames";

// @material-ui/core components
import withStyles from "@material-ui/core/styles/withStyles";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Input from "@material-ui/core/Input";
// @material-ui/icons
import Clear from "@material-ui/icons/Clear";
import Check from "@material-ui/icons/Check";
import InputAdornment from '@material-ui/core/InputAdornment';
// core components

import customInputStyle from "../../../assets/jss/material-kit-pro-react/components/customInputStyle.jsx";


function CustomInput({ ...props }) {
  const {
    classes,
    formControlProps,
    labelText,
    id,
    value,
    labelProps,
    inputProps,
    error,
    white,
    inputRootCustomClasses,
    success
  } = props;

  const labelClasses = classNames({
    [" " + classes.labelRootError]: error,
    [" " + classes.labelRootSuccess]: success && !error
  });
  const underlineClasses = classNames({
    [classes.underlineError]: error,
    [classes.underlineSuccess]: success && !error,
    [classes.underline]: true,
    [classes.whiteUnderline]: white
  });
  const marginTop = classNames({
    [inputRootCustomClasses]: inputRootCustomClasses !== undefined
  });
  const inputClasses = classNames({
    [classes.input]: true,
    [classes.whiteInput]: white
  });
  var formControlClasses;
  if (formControlProps !== undefined) {
    formControlClasses = classNames(
      formControlProps.className,
      classes.formControl
    );
  } else {
    formControlClasses = classes.formControl;
  }
  return (
    <FormControl variant={props.variant} fullWidth {...formControlProps} className={formControlClasses+' '+props.mainClass}>
      {labelText !== undefined ? (
        <InputLabel
          className={classes.labelRoot + " " + labelClasses}
          htmlFor={id}
          {...labelProps}
        >
          {labelText}
        </InputLabel>
      ) : null}
      <Input
        classes={{
          input: inputClasses + ' ' + props.class,
          root: marginTop,
          disabled: classes.disabled,
          underline: underlineClasses
        }}
        onFocus={props.onFocus}
        onBlur={props.onBlur}
        onPaste={props.onPaste}
        onChange={props.onChange}
        id={id}
        value={value}
        {...inputProps}
        onKeyPress={props.onKeyPress}
        onKeyUp={props.onKeyUp}
        fullWidth
        // rows={15}
        rows={5}
        rowsMax={Infinity}
        startAdornment={props.startIcon ? <InputAdornment className="input_start_icon" position="start">{props.startIcon}</InputAdornment>: null}
        endAdornment={props.endIcon ? <InputAdornment className="input_end_icon" position="end">{props.endIcon}</InputAdornment>: null}
      />
      {error ? (
        <Clear style={{right:'45px'}} className={classes.feedback + " " + classes.labelRootError} />
      ) : success ? (
        <Check style={{right:'45px'}} className={classes.feedback + " " + classes.labelRootSuccess} />
      ) : null}
    </FormControl>
  );
}

CustomInput.propTypes = {
  classes: PropTypes.object.isRequired,
  labelText: PropTypes.node,
  labelProps: PropTypes.object,
  id: PropTypes.string,
  inputProps: PropTypes.object,
  formControlProps: PropTypes.object,
  inputRootCustomClasses: PropTypes.string,
  error: PropTypes.bool,
  success: PropTypes.bool,
  white: PropTypes.bool
};

export default withStyles(customInputStyle)(CustomInput);
