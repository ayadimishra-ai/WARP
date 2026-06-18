const SvgComponent = ({ color = "#45545", ...props }: { color?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    {...props}
  >
    <path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 5v14m6-14v14M3 7.206v9.588c0 1.006 0 1.508.199 1.741a.83.83 0 0 0 .696.289c.305-.024.66-.38 1.372-1.091l4.794-4.794c.329-.329.493-.493.555-.682a.831.831 0 0 0 0-.514c-.062-.189-.226-.353-.555-.682L5.267 6.267C4.556 5.556 4.2 5.2 3.895 5.177a.83.83 0 0 0-.696.288C3 5.698 3 6.2 3 7.206Z"
    />
  </svg>
);
export default SvgComponent;
