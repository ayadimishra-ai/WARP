import React from "react";

interface IndianFlagIconProps {
  width?: number;
  height?: number;
  className?: string;
}

const IndianFlagIcon: React.FC<IndianFlagIconProps> = ({
  width = 24,
  height = 24,
  className = "",
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Saffron stripe (top) */}
      <rect x="0" y="0" width="24" height="8" fill="#FF9933" />

      {/* White stripe (middle) */}
      <rect x="0" y="8" width="24" height="8" fill="#FFFFFF" />

      {/* Green stripe (bottom) */}
      <rect x="0" y="16" width="24" height="8" fill="#138808" />

      {/* Ashoka Chakra (wheel) in the center */}
      <circle cx="12" cy="12" r="2" fill="#000080" />

      {/* 24 spokes of the Ashoka Chakra */}
      {Array.from({ length: 24 }, (_, i) => {
        const angle = i * 15 * (Math.PI / 180);
        const x1 = 12 + 1.5 * Math.cos(angle);
        const y1 = 12 + 1.5 * Math.sin(angle);
        const x2 = 12 + 3.5 * Math.cos(angle);
        const y2 = 12 + 3.5 * Math.sin(angle);

        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#000080"
            strokeWidth="0.3"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
};

export default IndianFlagIcon;
