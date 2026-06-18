const SvgComponent = (props: { color?: string; size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={props.size || "14"}
    height={props.size || "14"}
    viewBox="0 0 14 14"
    fill="none"
  >
    <path
      opacity="0.5"
      d="M7 9.4V7M7 4.6H7.006M13 7C13 10.3137 10.3137 13 7 13C3.68629 13 1 10.3137 1 7C1 3.68629 3.68629 1 7 1C10.3137 1 13 3.68629 13 7Z"
      stroke={props.color || "#777777"}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
export default SvgComponent;
