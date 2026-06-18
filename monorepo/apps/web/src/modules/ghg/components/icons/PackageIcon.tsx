const SvgComponent = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={36}
    height={36}
    fill="none"
    {...props}
  >
    <g
      stroke="#651B0E"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      clipPath="url(#a)"
    >
      <path d="M31.5 24.933V11.067a1.139 1.139 0 0 0-.577-.984L18.548 3.122a1.097 1.097 0 0 0-1.096 0l-12.375 6.96a1.14 1.14 0 0 0-.577.985v13.866a1.14 1.14 0 0 0 .577.984l12.375 6.961a1.097 1.097 0 0 0 1.096 0l12.375-6.96a1.139 1.139 0 0 0 .577-.985Z" />
      <path d="M24.89 21.445v-7.312L11.25 6.609" />
      <path d="M31.345 10.49 18.127 18 4.655 10.49M18.127 18 18 33.019" />
    </g>
    <defs>
      <clipPath id="a">
        <path fill="#fff" d="M0 0h36v36H0z" />
      </clipPath>
    </defs>
  </svg>
);
export default SvgComponent;
