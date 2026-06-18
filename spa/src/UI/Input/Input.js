import React from 'react'
import classes from './Input.css';

const input = (props) => {
  let inputElement = null;
  const inputClasses = [classes.InputElement];
  let validationError = null;

  if (props.invalid && props.shouldValidate && props.touched) {
    inputClasses.push(classes.Invalid);
    validationError = <p className={classes.ValidationError}>{props.errorMessage}</p>
  }

  switch (props.elementType) {
    case ('input'):
      inputElement = <input
        className={inputClasses.join(' ')}
        {...props.elementConfig}
        value={props.value}
        onChange={props.changed} />;
      break;
    case ('textarea'):
      inputElement = <textarea
        className={inputClasses}
        {...props.elementConfig}
        value={props.value}
        onChange={props.changed} />;
      break;
      case ('select'):
      inputElement = (<select
        className={inputClasses.join(' ')}
        value={props.value}
        onChange={props.SelectChange}>
        <option value="0" key="0">-- Select --</option>
        {props.elementConfig.options.map(
          option => (
            <option value={option.Id} key={option.Id}>{option.Value}</option>
          )
        )}
      </select>
      );
      break;
    default:
      inputElement = <input
        className={classes.InputElement}
        {...props.elementConfig}
        value={props.value}
        onChange={props.changed} />;
  }

  return (
    <div className={classes.Input}>
      <label className={classes.Label}>{props.elementConfig.label}</label>
      {inputElement}
      {validationError}
    </div>
  );
};
export default input;