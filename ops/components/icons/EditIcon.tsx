interface SvgProps {
  color?: string;
  size?: number;
  className?: string;
}

const EditIcon: React.FC<SvgProps> = ({
  color = "#003B52",
  size = 24,
  className,
}) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M11 5.00114H6C5.46957 5.00114 4.96086 5.21185 4.58579 5.58693C4.21071 5.962 4 6.47071 4 7.00114V18.0011C4 18.5316 4.21071 19.0403 4.58579 19.4154C4.96086 19.7904 5.46957 20.0011 6 20.0011H17C17.5304 20.0011 18.0391 19.7904 18.4142 19.4154C18.7893 19.0403 19 18.5316 19 18.0011V13.0011M17.586 3.58714C17.7705 3.39612 17.9912 3.24375 18.2352 3.13894C18.4792 3.03412 18.7416 2.97895 19.0072 2.97664C19.2728 2.97433 19.5361 3.02493 19.7819 3.1255C20.0277 3.22606 20.251 3.37456 20.4388 3.56235C20.6266 3.75013 20.7751 3.97344 20.8756 4.21923C20.9762 4.46502 21.0268 4.72838 21.0245 4.99394C21.0222 5.2595 20.967 5.52194 20.8622 5.76595C20.7574 6.00996 20.605 6.23065 20.414 6.41514L11.828 15.0011H9V12.1731L17.586 3.58714Z"
      stroke="#003B52"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
  // <svg
  //   width={size}
  //   height={size}
  //   viewBox="0 0 24 24"
  //   fill="none"
  //   xmlns="http://www.w3.org/2000/svg"
  // >
  //   <g transform="translate(3,3)">
  //     {" "}
  //     {/* Moves content from 0 0 19x18 → centered in 24x24 */}
  //     <path
  //       d="M16.9025 9.30117V17H1V1.10193H9.1367"
  //       stroke={color}
  //       strokeWidth="2"
  //       strokeLinecap="round"
  //       strokeLinejoin="round"
  //       className={className}
  //     />
  //     <path
  //       d="M9.53085 11.6068L6.06348 11.8749L6.59967 8.67561L13.664 1.6068C14.0528 1.21826 14.5799 1 15.1296 1C15.6792 1 16.2064 1.21826 16.5952 1.6068V1.6068C16.984 1.99634 17.2024 2.52424 17.2024 3.07463C17.2024 3.62501 16.984 4.15293 16.5952 4.54247L9.53085 11.6068Z"
  //       stroke={color}
  //       strokeWidth="2"
  //       strokeLinecap="round"
  //       strokeLinejoin="round"
  //       className={className}
  //     />
  //   </g>
  // </svg>
);

export default EditIcon;
