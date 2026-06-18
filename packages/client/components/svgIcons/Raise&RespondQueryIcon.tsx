const SvgComponent = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    {...props}
  >
    <g
      stroke="#000"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      opacity={0.5}
      className="raiseRespondQuery"
    >
      <path d="M5 17.625h4L12 21l3-3.375h4c.53 0 1.04-.237 1.414-.659A2.4 2.4 0 0 0 21 15.375V5.25a2.4 2.4 0 0 0-.586-1.591A1.894 1.894 0 0 0 19 3H5c-.53 0-1.04.237-1.414.659A2.4 2.4 0 0 0 3 5.25v10.125a2.4 2.4 0 0 0 .586 1.591c.375.422.884.659 1.414.659Z" />
      <path d="M10 8.6c.34-.932 1.254-1.6 2.33-1.6 1.364 0 2.47 1.074 2.47 2.4 0 1.12-.79 2.06-1.857 2.326-.334.083-.613.432-.613.874m0 2.4h.006" />
    </g>
  </svg>
);
export default SvgComponent;
