const SvgComponent = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    {...props}
    className="fillIcon"
  >
    <path
      fill="#666"
      d="M20.571 19.143H3.43A1.43 1.43 0 0 1 2 17.714V13.43A1.43 1.43 0 0 1 3.429 12H20.57A1.43 1.43 0 0 1 22 13.429v4.285a1.43 1.43 0 0 1-1.429 1.429ZM3.43 13.429v4.285H20.57V13.43H3.43Z"
    />
    <path
      fill="#666"
      d="M13 15H5v1.43h8V15ZM20.571 11.143H3.43A1.43 1.43 0 0 1 2 9.714V5.43A1.43 1.43 0 0 1 3.429 4H20.57A1.43 1.43 0 0 1 22 5.429v4.285a1.43 1.43 0 0 1-1.429 1.429ZM3.43 5.429v4.285H20.57V5.43H3.43Z"
    />
    <path fill="#666" d="M16.857 6.857h-12v1.429h12V6.857Z" />
  </svg>
);
export default SvgComponent;
