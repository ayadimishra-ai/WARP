import React, { Component } from "react";

class SparkleIcon extends Component {
  render() {
    const { className, color="#ffffff" } = this.props;
    return (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <path
          d="M9.78516 9.37801L9.89648 9.78133L10.2979 9.89852L14.8291 11.2237L10.2842 12.6485L9.89648 12.7696L9.78613 13.1602L8.61133 17.3302L7.33984 13.1456L7.22559 12.7725L6.85449 12.6515L2.48828 11.2237L6.84082 9.89559L7.22559 9.7784L7.34082 9.39266L8.61133 5.1202L9.78516 9.37801Z"
          stroke={color}
          strokeWidth="1.5"
        />
        <path
          d="M15.6545 3.75391L15.7659 4.15723L16.1672 4.27441L17.4133 4.63867L16.1536 5.03418L15.7659 5.15527L15.6555 5.5459L15.3694 6.55859L15.0579 5.53125L14.9436 5.1582L14.5725 5.03711L13.3557 4.63867L14.5588 4.27246L14.9436 4.1543L15.0588 3.76855L15.3694 2.72168L15.6545 3.75391Z"
          stroke={color}
          strokeWidth="1.5"
        />
      </svg>
    );
  }
}

export default SparkleIcon;
