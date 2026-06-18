import {
  warningCardHeader,
  successCardHeader,
  dangerCardHeader,
  infoCardHeader,
  primaryCardHeader,
  roseCardHeader,
  blackColor,
  hexToRgb
} from "../../../jss/material-kit-pro-react.jsx";

const cardHeaderStyle = {
  cardHeader: {
    borderRadius: "3px",
    padding: "35px 10px",
    marginLeft: "10px",
    marginRight: "10px",
    marginTop: "-15px",
    border: "0",
    marginBottom: "0",
    background:'#2cc1e1',
    borderRadius:'10px'
  },
  cardHeaderPlain: {
    marginLeft: "0px",
    marginRight: "0px",
    "&$cardHeaderImage": {
      margin: "0 !important"
    }
  },
  cardHeaderImage: {
    position: "relative",
    padding: "0",
    zIndex: "1",
    marginLeft: "15px",
    marginRight: "15px",
    marginTop: "-30px",
    borderRadius: "6px",
    "& img": {
      width: "100%",
      borderRadius: "6px",
      pointerEvents: "none",
      boxShadow:
        "0 5px 15px -8px rgba(" +
        hexToRgb(blackColor) +
        ", 0.24), 0 8px 10px -5px rgba(" +
        hexToRgb(blackColor) +
        ", 0.2)"
    },
    "& a": {
      display: "block"
    }
  },
  noShadow: {
    "& img": {
      boxShadow: "none !important"
    }
  },
  cardHeaderContact: {
    margin: "0 15px",
    marginTop: "-20px"
  },
  cardHeaderSignup: {
    borderRadius: "3px",
    padding: "35px 10px",
    marginLeft: "10px",
    marginRight: "10px",
    marginTop: "-15px",
    border: "0",
    marginBottom: "0",
    background:'#2cc1e1',
    borderRadius:'10px'
  },
  warningCardHeader,
  successCardHeader,
  dangerCardHeader,
  infoCardHeader,
  primaryCardHeader,
  roseCardHeader
};

export default cardHeaderStyle;
