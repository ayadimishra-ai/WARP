interface IconProps {
  color?: string;
  className?: string;
  width?: number;
  height?: number;
}
const MaximizeScreenIcon: React.FC<IconProps> = ({
  color = "#000000",
  className = "maximize-screen-icon",
  width = 24,
  height = 24,
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
        d="M20 20H16M4 8V4V8ZM4 4H8H4ZM4 4L9 9L4 4ZM20 8V4V8ZM20 4H16H20ZM20 4L15 9L20 4ZM4 16V20V16ZM4 20H8H4ZM4 20L9 15L4 20ZM20 20L15 15L20 20ZM20 20V16V20Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default MaximizeScreenIcon;
