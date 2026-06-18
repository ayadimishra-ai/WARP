interface IconProps {
  className?: string;
  width?: number;
  height?: number;
}
const SparkleSvgIcon: React.FC<IconProps> = ({
  className = "DropzoneSparkleSvgIcon",
  width = 150,
  height = 150,
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 150 150"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g opacity="0.1">
        <path
          d="M75.9189 69.6338L76.3643 71.2461L77.9688 71.7158L120.269 84.0938L77.9141 97.3662L76.3643 97.8516L75.9238 99.416L64.6797 139.324L52.5332 99.3564L52.0791 97.8623L50.5947 97.3779L9.9541 84.0938L50.5391 71.7061L52.0791 71.2354L52.5381 69.6924L64.6797 28.8799L75.9189 69.6338Z"
          stroke="url(#paint0_linear_3714_34295)"
          strokeWidth="6"
        />
        <path
          d="M119.942 27.459L120.387 29.0713L121.992 29.541L139.653 34.709L121.938 40.2607L120.387 40.7471L119.946 42.3105L115.372 58.5459L110.42 42.251L109.966 40.7568L108.481 40.2725L91.4609 34.709L108.425 29.5312L109.966 29.0605L110.425 27.5176L115.372 10.8877L119.942 27.459Z"
          stroke="url(#paint1_linear_3714_34295)"
          strokeWidth="6"
        />
      </g>
      <defs>
        <linearGradient
          id="paint0_linear_3714_34295"
          x1="130.616"
          y1="144.003"
          x2="-0.910537"
          y2="142.996"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00A7E3" />
          <stop offset="1" stopColor="#AE41F6" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_3714_34295"
          x1="150"
          y1="66.0781"
          x2="81.0294"
          y2="65.5499"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00A7E3" />
          <stop offset="1" stopColor="#AE41F6" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default SparkleSvgIcon;
