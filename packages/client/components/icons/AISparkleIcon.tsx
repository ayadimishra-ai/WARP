import React from "react";

interface AISparkleIconProps {
  className?: string;
  width?: number;
  height?: number;
}

const AISparkleIcon: React.FC<AISparkleIconProps> = ({ className, width = 21, height = 20 }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 21 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M10.2852 9.37793L10.3965 9.78125L10.7979 9.89844L15.3291 11.2236L10.7842 12.6484L10.3965 12.7695L10.2861 13.1602L9.11133 17.3301L7.83984 13.1455L7.72559 12.7725L7.35449 12.6514L2.98828 11.2236L7.34082 9.89551L7.72559 9.77832L7.84082 9.39258L9.11133 5.12012L10.2852 9.37793Z"
        stroke="url(#paint0_linear_5788_34808)"
        stroke-width="1.5"
      />
      <path
        d="M16.1543 3.75391L16.2656 4.15723L16.667 4.27441L17.9131 4.63867L16.6533 5.03418L16.2656 5.15527L16.1553 5.5459L15.8691 6.55859L15.5576 5.53125L15.4434 5.1582L15.0723 5.03711L13.8555 4.63867L15.0586 4.27246L15.4434 4.1543L15.5586 3.76855L15.8691 2.72168L16.1543 3.75391Z"
        stroke="url(#paint1_linear_5788_34808)"
        stroke-width="1.5"
      />
      <defs>
        <linearGradient
          id="paint0_linear_5788_34808"
          x1="17.9157"
          y1="19.2002"
          x2="0.378594"
          y2="19.0659"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#00A7E3" />
          <stop offset="1" stop-color="#AE41F6" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_5788_34808"
          x1="20.4997"
          y1="8.81005"
          x2="11.3035"
          y2="8.73963"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#00A7E3" />
          <stop offset="1" stop-color="#AE41F6" />
        </linearGradient>
      </defs>
    </svg>
  );
};
export default AISparkleIcon;
