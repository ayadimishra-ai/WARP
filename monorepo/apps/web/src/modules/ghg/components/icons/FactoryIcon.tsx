const SvgComponent = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={40}
    height={40}
    fill="none"
    {...props}
  >
    <g
      stroke="#1C9689"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      clipPath="url(#a)"
    >
      <path d="M12.5 27.5h4.375M23.125 27.5H27.5M33.75 33.75v-12.5h-7.5l-10-7.5v7.5l-10-7.5v20M2.5 33.75h35" />
      <path d="M33.75 21.25 31.406 4.828a1.25 1.25 0 0 0-1.234-1.078h-2.844a1.25 1.25 0 0 0-1.234 1.078l-2.11 14.735" />
    </g>
    <defs>
      <clipPath id="a">
        <path fill="#fff" d="M0 0h40v40H0z" />
      </clipPath>
    </defs>
  </svg>
);
export default SvgComponent;
