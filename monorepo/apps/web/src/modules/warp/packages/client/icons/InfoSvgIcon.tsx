const SvgComponent = (props: any) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={16}
        height={16}
        fill="none"
        {...props}
    >
        <path
            stroke="#2C9E92"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.667 10.667H8V8h-.667M8 5.333h.007M14 8A6 6 0 1 1 1.999 8 6 6 0 0 1 14 8Z"
        />
    </svg>
)
export default SvgComponent
