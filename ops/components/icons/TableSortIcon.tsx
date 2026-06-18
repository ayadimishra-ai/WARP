const SvgComponent = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={9}
    height={12}
    fill="none"
    {...props}
  >
    <path
      fill="#666"
      d="M4.5 0a.498.498 0 0 0-.353.146l-4 4A.5.5 0 0 0 .5 5h8a.5.5 0 0 0 .354-.854l-4-4A.498.498 0 0 0 4.5 0Zm-4 7a.5.5 0 0 0-.353.854l4 4a.499.499 0 0 0 .707 0l4-4A.5.5 0 0 0 8.5 7h-8Z"
    />
  </svg>
);
export default SvgComponent;
