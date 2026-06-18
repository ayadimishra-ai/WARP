import React from "react";

interface IconProps {
  color?: string;
  className?: string;
}

const IntroArrow: React.FC<IconProps> = ({ color, className }) => {
  return (
    <svg
      width="30"
      height="12"
      viewBox="0 0 30 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className || "longRightArrow"}
    >
      <path
        d="M29.5303 6.53033C29.8232 6.23744 29.8232 5.76257 29.5303 5.46967L24.7574 0.696701C24.4645 0.403808 23.9896 0.403808 23.6967 0.696701C23.4038 0.989595 23.4038 1.46447 23.6967 1.75736L27.9393 6L23.6967 10.2426C23.4038 10.5355 23.4038 11.0104 23.6967 11.3033C23.9896 11.5962 24.4645 11.5962 24.7574 11.3033L29.5303 6.53033ZM-6.55671e-08 6.75L29 6.75L29 5.25L6.55671e-08 5.25L-6.55671e-08 6.75Z"
        fill={color || "#444444"}
      />
    </svg>
  );
};

export default IntroArrow;
