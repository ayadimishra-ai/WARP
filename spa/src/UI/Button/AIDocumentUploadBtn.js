import React from "react";
import Button from "../../UI/Button/MaterialButton";
import AISparkleIcon from "../../assets/img/jsIcons/AISparkleIcon";
const AIDocumentUploadBtn = ({ onClick, buttonText }) => {
  return (
    <Button className="aiGradientBtn" onClick={onClick}>
      <AISparkleIcon />&nbsp;{buttonText}
    </Button>
  );
};

export default AIDocumentUploadBtn;
