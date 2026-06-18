interface IconProps {
  className?: string;
  width?: number;
  height?: number;
  color?: string;
}
const DocumentRepoIcon: React.FC<IconProps> = ({
  className = "DocumentRepoIcon",
  width = 24,
  height = 24,
  color = "#99A7AD",
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <g clip-path="url(#clip0_5748_44469)">
      <rect width="24" height="24" fill="white" />
      <path
        d="M17.3227 21.4185H4.45772C3.9385 21.4185 3.44055 21.2339 3.0734 20.9054C2.70626 20.5769 2.5 20.1313 2.5 19.6667V3.90026C2.5 3.43565 2.70626 2.99007 3.0734 2.66154C3.44055 2.333 3.9385 2.14844 4.45772 2.14844H17.3227C17.8419 2.14844 18.3399 2.333 18.707 2.66154C19.0742 2.99007 19.2804 3.43565 19.2804 3.90026V19.6667C19.2804 20.1313 19.0742 20.5769 18.707 20.9054C18.3399 21.2339 17.8419 21.4185 17.3227 21.4185Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.1055 14.668C18.5261 14.668 20.5447 16.3268 21.2188 18.5674C21.2611 18.7083 21.2611 18.8591 21.2188 19C20.5447 21.2406 18.5261 22.8994 16.1055 22.8994C13.6855 22.8994 11.6673 21.2405 10.9932 19C10.9508 18.8591 10.9508 18.7083 10.9932 18.5674C11.6672 16.3269 13.6854 14.668 16.1055 14.668Z"
        fill="white"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.1055 16.0176C17.8206 16.0176 19.3011 17.157 19.8662 18.7832C19.3013 20.4098 17.8208 21.5488 16.1055 21.5488C14.3905 21.5488 12.9096 20.4098 12.3447 18.7832C12.9098 17.157 14.3908 16.0176 16.1055 16.0176Z"
        fill="white"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.1045 17.8438C16.3312 17.8438 16.5536 17.9378 16.7207 18.1123C16.8884 18.2875 16.9863 18.5296 16.9863 18.7861C16.9863 19.0427 16.8883 19.2847 16.7207 19.46C16.5536 19.6344 16.3312 19.7285 16.1045 19.7285C15.8778 19.7285 15.6554 19.6345 15.4883 19.46C15.3205 19.2847 15.2227 19.0427 15.2227 18.7861C15.2227 18.5295 15.3205 18.2875 15.4883 18.1123C15.6554 17.9378 15.8778 17.8438 16.1045 17.8438Z"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.17578 5.70312H15.6059"
        stroke={color}
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.17578 8.27344H11.3195"
        stroke={color}
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.17578 12.5625H15.6059"
        stroke={color}
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.17578 15.1328H11.3195"
        stroke={color}
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_5748_44469">
        <rect width="24" height="24" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

export default DocumentRepoIcon;
