const SvgComponent = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={26}
    height={25}
    fill="none"
    {...props}
  >
    <path
      stroke="#000"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M10.946 11.96v6m4.056-6v6m-10.14-10h16.224m-1.014 0-.88 12.143a1.99 1.99 0 0 1-.64 1.321c-.375.345-.87.537-1.382.537H8.778a2.044 2.044 0 0 1-1.383-.537 1.989 1.989 0 0 1-.64-1.321L5.875 7.96h14.197Zm-4.056 0v-3a.993.993 0 0 0-.297-.706 1.021 1.021 0 0 0-.717-.293h-4.056c-.27 0-.527.105-.717.293a.993.993 0 0 0-.297.707v3h6.084Z"
      opacity={0.3}
    />
  </svg>
);
export default SvgComponent;
