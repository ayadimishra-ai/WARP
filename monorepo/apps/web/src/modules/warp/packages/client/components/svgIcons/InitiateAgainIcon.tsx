const InitiateAgainIcon = ({
  color = "#003B52",
  ...props
}: {
  color?: string;
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    {...props}
  >
    <path
      d="M19 8C17.6227 5.58615 14.9781 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15 8L19 8V4"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
export default InitiateAgainIcon;
