import {
  container,
  whiteColor,
  title,
  mlAuto,
  mrAuto
} from "../../../material-kit-pro-react.jsx";
import customCheckboxRadioSwitch from "../../../material-kit-pro-react/customCheckboxRadioSwitchStyle";
import customSelectStyle from "../../../material-kit-pro-react/customSelectStyle";

const basicsStyle = {
  mlAuto,
  mrAuto,
  container,
  ...customSelectStyle,
  ...customCheckboxRadioSwitch,
  sections: {
    padding: "70px 0"
  },
  title: {
    ...title,
    marginTop: "30px",
    minHeight: "32px",
    textDecoration: "none"
  },
  space50: {
    height: "50px",
    display: "block"
  },
  space70: {
    height: "70px",
    display: "block"
  },
  icons: {
    width: "17px",
    height: "17px",
    color: whiteColor
  },
  Invalid: {
    border: "1px solid red",
    background: "#FDA49A"
  },
ValidationError: {
    color: "red",
    margin: "5px 0",
    fontSize: "13px"
}
};

export default basicsStyle;
