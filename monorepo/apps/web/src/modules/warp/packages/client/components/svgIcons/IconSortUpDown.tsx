const IconSortUpDown = ({
  color = "#fff",
  ...props
}: {
  color?: string;
  [key: string]: any;
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={10}
    height={12}
    fill="none"
    {...props}
  >
    <path
      fill={color}
      d="M5.207 0a.542.542 0 0 0-.374.146l-4.227 4a.48.48 0 0 0-.115.545A.529.529 0 0 0 .979 5h8.455a.529.529 0 0 0 .488-.309.48.48 0 0 0-.114-.545l-4.228-4A.542.542 0 0 0 5.207 0ZM.979 7a.529.529 0 0 0-.488.309.48.48 0 0 0 .115.545l4.227 4a.543.543 0 0 0 .374.146c.135 0 .27-.049.373-.146l4.228-4a.48.48 0 0 0 .114-.545A.529.529 0 0 0 9.434 7H.979Z"
    />
  </svg>
);

export default IconSortUpDown;
