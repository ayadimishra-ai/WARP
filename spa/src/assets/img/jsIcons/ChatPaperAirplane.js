import React, { Component } from "react";

class ChatPaperAirplane extends Component {
  render() {
    const {
      className = "chat-paper-airplane-icon",
      width = "24",
      height = "24",
      color = "#ffffff",
      stroke=1.5,
    } = this.props;
    return (
      <svg  
        width={width}
        height={height}
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M5 12L3 21L21 12L3 3L5 12ZM5 12L13 12"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
}

export default ChatPaperAirplane;
