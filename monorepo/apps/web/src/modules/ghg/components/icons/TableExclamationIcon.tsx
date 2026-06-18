type SvgProps = {
  color?: string;
  size?: number | string;
  hoverColor?: string;
  className?: string;
} & React.SVGProps<SVGSVGElement>;

const SvgComponent = ({
  color = "#003b52",
  hoverColor = "#003b52",
  size = 24,
  className = "",
  ...props
}: SvgProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    xmlns="http://www.w3.org/2000/svg"
    style={{
      transition: "stroke 0.2s ease",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.stroke = hoverColor;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.stroke = color;
    }}
    {...props}
  >
    <path
      d="M12.0014 8.99975V10.9998M12.0014 14.9998H12.0114M5.07339 18.9998H18.9294C20.4694 18.9998 21.4314 17.3328 20.6614 15.9998L13.7334 3.99975C12.9634 2.66675 11.0394 2.66675 10.2694 3.99975L3.34139 15.9998C2.57139 17.3328 3.53339 18.9998 5.07339 18.9998Z"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    />
  </svg>
);

export default SvgComponent;
