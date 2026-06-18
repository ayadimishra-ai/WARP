const SvgComponent = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    {...props}
  >
    <path
      stroke="#666"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2Z"
    />
    <path
      stroke="#666"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 9.8C9.353 8.751 10.306 8 11.427 8 12.848 8 14 9.209 14 10.7c0 1.26-.822 2.318-1.934 2.616-.349.094-.64.486-.64.984m0 2.7h.007"
    />
  </svg>
);
export default SvgComponent;
