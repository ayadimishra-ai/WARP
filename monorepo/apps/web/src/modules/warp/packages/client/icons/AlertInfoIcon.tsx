interface IconProps {
  color?: string;
  className?: string;
  width?: number;
  height?: number;
  strokeWidth?: number;
}
const AlertInfoIcon: React.FC<IconProps> = ({
  color = "#FFA93C",
  className = "alert_info_icon",
  width = 24,
  height = 24,
  strokeWidth = 1.5,
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M12.0004 8.99975V10.9998M12.0004 14.9998H12.0104M5.07241 18.9998H18.9284C20.4684 18.9998 21.4304 17.3328 20.6604 15.9998L13.7324 3.99975C12.9624 2.66675 11.0384 2.66675 10.2684 3.99975L3.34041 15.9998C2.57041 17.3328 3.53241 18.9998 5.07241 18.9998Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default AlertInfoIcon;
