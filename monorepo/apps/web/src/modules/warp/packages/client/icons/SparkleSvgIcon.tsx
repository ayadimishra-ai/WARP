interface IconProps {
  color?: string;
  className?: string;
  width?: number;
  height?: number;
}
const SparkleSvgIcon: React.FC<IconProps> = ({
  color = "#666666",
  className = "SparkleSvgIcon",
  width = 21,
  height = 20,
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 21 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M10.7649 12.6485L10.3773 12.7697L10.2669 13.1606L9.08785 17.3367L7.81137 13.1458L7.69762 12.7724L7.32647 12.6513L2.95176 11.2245L7.31244 9.89631L7.6976 9.779L7.81264 9.39316L9.08781 5.11641L10.2658 9.37865L10.3772 9.78161L10.7785 9.89879L15.319 11.2246L10.7649 12.6485Z"
        stroke={color}
        strokeWidth="1.5"
      />
      <path
        d="M16.6469 5.03376L16.2593 5.15496L16.149 5.5458L15.861 6.56574L15.5459 5.53106L15.4321 5.15761L15.0609 5.03655L13.8424 4.63912L15.0469 4.27223L15.4321 4.15492L15.5471 3.76907L15.861 2.71651L16.1479 3.75457L16.2592 4.15753L16.6605 4.27471L17.9088 4.63921L16.6469 5.03376Z"
        stroke={color}
        strokeWidth="1.5"
      />
    </svg>
  );
};

export default SparkleSvgIcon;
