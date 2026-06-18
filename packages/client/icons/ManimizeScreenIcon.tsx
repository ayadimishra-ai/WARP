interface IconProps {
  color?: string;
  className?: string;
  width?: number;
  height?: number;
}
const ManimizeScreenIcon: React.FC<IconProps> = ({
  color = "#000000",
  className = "minimize-screen-icon",
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
        d="M14 6V10M14 10H18M14 10L19 5"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 6V10M10 10H6M10 10L5 5"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 18V14M10 14H6M10 14L5 19"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 14L19 19M14 14V18M14 14H18"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default ManimizeScreenIcon;
