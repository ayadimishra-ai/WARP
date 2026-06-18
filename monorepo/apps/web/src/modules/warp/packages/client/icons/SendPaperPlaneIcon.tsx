interface IconProps {
  className?: string;
  width?: number;
  height?: number;
  disabled?: boolean;
}
const SendPaperPlaneIcon: React.FC<IconProps> = ({
  className = "SendPaperPlaneIcon",
  width = 40,
  height = 40,
  disabled = false,
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M0 20C0 8.9543 8.95431 0 20 0C31.0457 0 40 8.9543 40 20C40 31.0457 31.0457 40 20 40C8.95431 40 0 31.0457 0 20Z"
      fill="url(#paint0_linear_10_11942)"
    />
    <path
      d="M13 20L11 29L29 20L11 11L13 20ZM13 20H21"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <defs>
      <linearGradient
        id="paint0_linear_10_11942"
        x1="-2.38564e-08"
        y1="2.96296"
        x2="40.6352"
        y2="6.34735"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor={disabled ? "#c2d0d7" : "#005C81"} />
        <stop offset="1" stopColor={disabled ? "#c2d0d7" : "#122F47"} />
      </linearGradient>
    </defs>
  </svg>
);

export default SendPaperPlaneIcon;
