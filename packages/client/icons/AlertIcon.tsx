interface IconProps {
  color?: string;
  className?: string;
  width?: number;
  height?: number;
  strokeWidth?: number;
}
const AlertIcon: React.FC<IconProps> = ({
  color = "#FFA93C",
  className = "alert_icon",
  width = 150,
  height = 150,
  strokeWidth = 8,
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 150 150"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g opacity="0.15">
        <path
          d="M74.9999 56.2484V68.7484M74.9999 93.7484H75.0624M31.6999 118.748H118.3C127.925 118.748 133.937 108.33 129.125 99.9984L85.8249 24.9984C81.0124 16.6672 68.9874 16.6672 64.1749 24.9984L20.8749 99.9984C16.0624 108.33 22.0749 118.748 31.6999 118.748Z"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
};

export default AlertIcon;
