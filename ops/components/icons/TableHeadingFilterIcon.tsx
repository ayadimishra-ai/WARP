const SvgComponent = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={13}
    height={12}
    fill="none"
    {...props}
  >
    <path
      stroke="#666"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M1.943 1.646A.5.5 0 0 0 1.797 2v1.293a.5.5 0 0 0 .146.353L5.15 6.854a.5.5 0 0 1 .147.353V10.5l2-2V7.207a.5.5 0 0 1 .146-.353l3.207-3.208a.5.5 0 0 0 .147-.353V2a.5.5 0 0 0-.5-.5h-8a.5.5 0 0 0-.354.146Z"
    />
  </svg>
);
export default SvgComponent;
