interface SvgProps {
  color?: string;
  size?: number;
  className?: string;
}

const PendingVerificationIcon: React.FC<SvgProps> = ({
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
    <rect
      x="11.2216"
      y="3"
      width="8.04857"
      height="16.2701"
      rx="1"
      stroke="#003B52"
      strokeWidth="2"
    />
    <rect
      x="3"
      y="3"
      width="8.04857"
      height="16.2701"
      rx="1"
      stroke="#003B52"
      strokeWidth="2"
    />
    <path
      d="M13.9421 6.64062C18.0633 6.64062 21.4041 9.9816 21.4041 14.1025C21.4038 18.2233 18.0631 21.5635 13.9421 21.5635C9.82127 21.5634 6.48048 18.2232 6.48022 14.1025C6.48022 9.98167 9.82112 6.64074 13.9421 6.64062Z"
      fill="#F1F3F6"
      stroke="#F1F3F6"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M21.8365 22.0007L18.9645 19.1289"
      stroke="#F1F3F6"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13.9425 20.391C17.5115 20.391 20.4047 17.4983 20.4047 13.9299C20.4047 10.3615 17.5115 7.46875 13.9425 7.46875C10.3735 7.46875 7.48022 10.3615 7.48022 13.9299C7.48022 17.4983 10.3735 20.391 13.9425 20.391Z"
      fill="white"
      stroke="#003B52"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10.8987 14.3571L12.2455 15.7039L15.9221 12.0273"
      stroke="#003B52"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M21.8365 21.8286L18.9644 18.957"
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
  //   <rect
  //     x="11.2216"
  //     y="3"
  //     width="8.04857"
  //     height="16.2701"
  //     rx="1"
  //     stroke={color}
  //     stroke-width="2"
  //     className={className}
  //   />
  //   <rect
  //     x="3"
  //     y="3"
  //     width="8.04857"
  //     height="16.2701"
  //     rx="1"
  //     stroke={color}
  //     stroke-width="2"
  //     className={className}
  //   />
  //   <path
  //     d="M13.9421 6.64062C18.0633 6.64062 21.4041 9.9816 21.4041 14.1025C21.4038 18.2233 18.0631 21.5635 13.9421 21.5635C9.82127 21.5634 6.48048 18.2232 6.48022 14.1025C6.48022 9.98167 9.82112 6.64074 13.9421 6.64062Z"
  //     fill="#F1F3F6"
  //     stroke="#F1F3F6"
  //     stroke-width="2"
  //     stroke-linecap="round"
  //     stroke-linejoin="round"
  //     className={className}
  //   />
  //   <path
  //     d="M21.8365 22.0007L18.9645 19.1289"
  //     stroke="#F1F3F6"
  //     stroke-width="2"
  //     stroke-linecap="round"
  //     stroke-linejoin="round"
  //     className={className}
  //   />
  //   <path
  //     d="M13.9425 20.391C17.5115 20.391 20.4047 17.4983 20.4047 13.9299C20.4047 10.3615 17.5115 7.46875 13.9425 7.46875C10.3735 7.46875 7.48022 10.3615 7.48022 13.9299C7.48022 17.4983 10.3735 20.391 13.9425 20.391Z"
  //     fill="white"
  //     stroke={color}
  //     stroke-width="2"
  //     stroke-linecap="round"
  //     stroke-linejoin="round"
  //     className={className}
  //   />
  //   <path
  //     d="M10.8987 14.3571L12.2455 15.7039L15.9221 12.0273"
  //     stroke={color}
  //     stroke-width="2"
  //     stroke-linecap="round"
  //     className={className}
  //   />
  //   <path
  //     d="M21.8365 21.8286L18.9644 18.957"
  //     stroke={color}
  //     stroke-width="2"
  //     stroke-linecap="round"
  //     stroke-linejoin="round"
  //     className={className}
  //   />
  // </svg>
  // <svg
  //   width={size}
  //   height={size}
  //   viewBox="0 0 24 24"
  //   fill="none"
  //   xmlns="http://www.w3.org/2000/svg"
  // >
  //   <rect
  //     x="10"
  //     y="1"
  //     width="9"
  //     height="18"
  //     rx="1"
  //     stroke={color}
  //     strokeWidth="2"
  //     className={className}
  //   />
  //   <rect
  //     x="1"
  //     y="1"
  //     width="9"
  //     height="18"
  //     rx="1"
  //     stroke={color}
  //     strokeWidth="2"
  //     className={className}
  //   />
  //   <path
  //     d="M13.0732 5.17743C17.5322 5.17756 21.1475 8.79193 21.1475 13.2507C21.1475 17.7094 17.5322 21.3238 13.0732 21.3239C8.61421 21.3239 4.99903 17.7095 4.99902 13.2507C4.99902 8.79185 8.6142 5.17743 13.0732 5.17743Z"
  //     fill="#F1F3F6"
  //     stroke="#F1F3F6"
  //     strokeWidth="2"
  //     strokeLinecap="round"
  //     strokeLinejoin="round"
  //   />
  //   <path
  //     d="M21.7143 21.8957L18.5703 18.752"
  //     stroke="#F1F3F6"
  //     strokeWidth="2"
  //     strokeLinecap="round"
  //     strokeLinejoin="round"
  //     className={className}
  //   />
  //   <path
  //     d="M13.0732 20.1335C16.9801 20.1335 20.1473 16.9669 20.1473 13.0606C20.1473 9.15437 16.9801 5.98773 13.0732 5.98773C9.16622 5.98773 5.99902 9.15437 5.99902 13.0606C5.99902 16.9669 9.16622 20.1335 13.0732 20.1335Z"
  //     fill="white"
  //     stroke={color}
  //     strokeWidth="2"
  //     strokeLinecap="round"
  //     strokeLinejoin="round"
  //     className={className}
  //   />
  //   <path
  //     d="M9.74119 13.5277L11.2155 15.002L15.2402 10.9774"
  //     stroke={color}
  //     strokeWidth="2"
  //     strokeLinecap="round"
  //     className={className}
  //   />
  //   <path
  //     d="M21.7144 21.7052L18.5703 18.5617"
  //     stroke={color}
  //     strokeWidth="2"
  //     strokeLinecap="round"
  //     strokeLinejoin="round"
  //     className={className}
  //   />
  // </svg>
);

export default PendingVerificationIcon;
