import React from "react";

const ChatHeadingSubHeading = ({ title, subtitle, children }) => {
  
  return (
    <div
      className="chart_heading-wrapper"
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 5,
        alignItems: "flex-start",
        minHeight:34
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 0,
          position: "relative",
        }}
      >
        <div
          style={{ fontSize: 14, color: "#323232", fontWeight: 600 }}
          className="chart_main_heading s"
        >
          {title}
        </div>
        {!!subtitle && (
          <div
            style={{ fontSize: 12, color: "#666666" }}
            className="chart_sub_heading"
          >
            {subtitle}
          </div>
        )}
      </div>
      {children}
    </div>
  );
};

export default ChatHeadingSubHeading;
