const SvgComponent = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={25}
    height={25}
    fill="none"
    {...props}
  >
    <path
      stroke="#000"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M9.62 12.96h6.083m-6.084 4h6.084m2.029 5H7.591c-.539 0-1.055-.21-1.435-.585a1.986 1.986 0 0 1-.594-1.414v-14c0-.53.214-1.04.594-1.414.38-.375.896-.586 1.434-.586h5.664c.27 0 .527.105.717.293l5.49 5.414c.19.187.297.442.297.707v9.586c0 .53-.213 1.04-.593 1.414-.38.375-.897.586-1.434.586Z"
      opacity={0.3}
    />
  </svg>
);
export default SvgComponent;
