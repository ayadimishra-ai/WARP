const SvgComponent = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={36}
    height={36}
    fill="none"
    {...props}
  >
    <path
      stroke="#FF9907"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="m13.6 33 2.2-11.071L7 18.607 22.4 2l-2.2 11.071 8.8 3.322L13.6 33Z"
    />
  </svg>
);
export default SvgComponent;
