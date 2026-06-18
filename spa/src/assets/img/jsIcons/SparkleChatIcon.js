import React, { Component } from "react";

class SparkleChatIcon extends Component {
  render() {
    const { className="chat-sparkle-icon", width="30", height="30" } = this.props;
    return (
      <svg
        width={width}
        height={height}
        viewBox="0 0 30 30"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <rect
          width="29.8507"
          height="29.8507"
          rx="14.9253"
          fill="url(#paint0_linear_2940_49371)"
        />
        <path
          d="M14.9961 14.541L15.1074 14.9443L15.5088 15.0615L18.6582 15.9824L15.4951 16.9746L15.1074 17.0957L14.9971 17.4863L14.1953 20.3301L13.3271 17.4717L13.2139 17.0986L12.8428 16.9775L9.7998 15.9824L12.8291 15.0586L13.2139 14.9414L13.3291 14.5557L14.1953 11.6406L14.9961 14.541Z"
          stroke="url(#paint1_linear_2940_49371)"
          strokeWidth="1.5"
        />
        <path
          d="M19.6919 10.043L19.8032 10.4463L20.2036 10.5635L20.7251 10.7158L20.1899 10.8838L19.8032 11.0059L19.6929 11.3965L19.6021 11.7148L19.5015 11.3818L19.3882 11.0088L19.0171 10.8867L18.4956 10.7158L19.0034 10.5615L19.3882 10.4434L19.5034 10.0576L19.603 9.72168L19.6919 10.043Z"
          stroke="url(#paint2_linear_2940_49371)"
          strokeWidth="1.5"
        />
        <defs>
          <linearGradient
            id="paint0_linear_2940_49371"
            x1="0.547262"
            y1="3.73133"
            x2="29.5643"
            y2="27.7096"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#F9DAFF" />
            <stop offset="1" stopColor="#DAF1FF" />
          </linearGradient>
          <linearGradient
            id="paint1_linear_2940_49371"
            x1="21.2449"
            y1="22.3594"
            x2="7.21538"
            y2="22.252"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#00A7E3" />
            <stop offset="1" stopColor="#AE41F6" />
          </linearGradient>
          <linearGradient
            id="paint2_linear_2940_49371"
            x1="23.3123"
            y1="14.0485"
            x2="15.9554"
            y2="13.9921"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#00A7E3" />
            <stop offset="1" stopColor="#AE41F6" />
          </linearGradient>
        </defs>
      </svg>
    );
  }
}

export default SparkleChatIcon;
