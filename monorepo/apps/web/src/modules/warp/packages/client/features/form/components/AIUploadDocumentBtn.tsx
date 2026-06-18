import { Button, MantineSize } from "@mantine/core";
import React from "react";
import AISparkleIcon from "../../../components/icons/AISparkleIcon";

interface AIUploadDocumentBtnProps {
  onClick: () => void;
  label?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
  className?: string;
  h?: number | string;
  radius?: MantineSize;
}

const AIUploadDocumentBtn: React.FC<AIUploadDocumentBtnProps> = ({
  onClick,
  label,
  disabled = false,
  style,
  className,
  h,
  radius,
}) => {
  return (
    <Button
      color="aiGradientBtn"
      onClick={onClick}
      leftSection={<AISparkleIcon />}
      disabled={disabled}
      style={style}
      className={className}
      styles={{
        root: {
          height: h,
          borderRadius: radius,
        },
      }}
    >
      {label}
    </Button>
  );
};
export default AIUploadDocumentBtn;
