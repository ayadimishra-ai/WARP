interface SvgProps {
  color?: string;
  size?: number;
  className?: string;
}

const SvgComponent: React.FC<SvgProps> = ({
  color = "#003B52",
  size = 24,
  className,
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    fill="none"
  >
    <path
      d="M4 16V17C4 17.7956 4.31607 18.5587 4.87868 19.1213C5.44129 19.6839 6.20435 20 7 20H17C17.7956 20 18.5587 19.6839 19.1213 19.1213C19.6839 18.5587 20 17.7956 20 17V16M16 12L12 16M12 16L8 12M12 16V4"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    />
  </svg>
);
export default SvgComponent;
