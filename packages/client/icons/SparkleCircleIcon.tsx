interface IconProps {
  className?: string;
  width?: number;
  height?: number;
}
const SparkleCircleIcon: React.FC<IconProps> = ({
  className = "SparkleCircleIcon",
  width = 30,
  height = 30,
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 30 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect
        width="29.8507"
        height="29.8507"
        rx="14.9253"
        fill="url(#paint0_linear_2978_45717)"
      />
      <path
        d="M14.9961 14.541L15.1074 14.9443L15.5088 15.0615L18.6582 15.9824L15.4951 16.9746L15.1074 17.0957L14.9971 17.4863L14.1953 20.3301L13.3271 17.4717L13.2139 17.0986L12.8428 16.9775L9.7998 15.9824L12.8291 15.0586L13.2139 14.9414L13.3291 14.5557L14.1953 11.6406L14.9961 14.541Z"
        stroke="white"
        strokeWidth="1.5"
      />
      <path
        d="M19.6921 10.043L19.8035 10.4463L20.2039 10.5635L20.7253 10.7158L20.1902 10.8838L19.8035 11.0059L19.6931 11.3965L19.6023 11.7148L19.5017 11.3818L19.3884 11.0088L19.0173 10.8867L18.4958 10.7158L19.0037 10.5615L19.3884 10.4434L19.5037 10.0576L19.6033 9.72168L19.6921 10.043Z"
        stroke="white"
        strokeWidth="1.5"
      />
      <defs>
        <linearGradient
          id="paint0_linear_2978_45717"
          x1="29.8507"
          y1="28.4945"
          x2="-0.208055"
          y2="28.2619"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00A7E3" />
          <stop offset="1" stopColor="#AE41F6" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default SparkleCircleIcon;
