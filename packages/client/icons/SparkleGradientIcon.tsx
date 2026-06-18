interface IconProps {
  className?: string;
  width?: number;
  height?: number;
}
const SparkleGradientIcon: React.FC<IconProps> = ({
  className = "GradientSparkleSvgIcon",
  width = 20,
  height = 20,
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M9.78516 9.37695L9.89648 9.78027L10.2979 9.89746L14.8291 11.2227L10.2842 12.6475L9.89648 12.7686L9.78613 13.1592L8.61133 17.3291L7.33984 13.1445L7.22559 12.7715L6.85449 12.6504L2.48828 11.2227L6.84082 9.89453L7.22559 9.77734L7.34082 9.3916L8.61133 5.11914L9.78516 9.37695Z"
        stroke="url(#paint0_linear_3817_35813)"
        strokeWidth="1.5"
      />
      <path
        d="M15.6543 3.75391L15.7656 4.15723L16.167 4.27441L17.4131 4.63867L16.1533 5.03418L15.7656 5.15527L15.6553 5.5459L15.3691 6.55859L15.0576 5.53125L14.9434 5.1582L14.5723 5.03711L13.3555 4.63867L14.5586 4.27246L14.9434 4.1543L15.0586 3.76855L15.3691 2.72168L15.6543 3.75391Z"
        stroke="url(#paint1_linear_3817_35813)"
        strokeWidth="1.5"
      />
      <defs>
        <linearGradient
          id="paint0_linear_3817_35813"
          x1="17.4157"
          y1="19.1992"
          x2="-0.121406"
          y2="19.0649"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00A7E3" />
          <stop offset="1" stopColor="#AE41F6" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_3817_35813"
          x1="19.9997"
          y1="8.81005"
          x2="10.8035"
          y2="8.73963"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00A7E3" />
          <stop offset="1" stopColor="#AE41F6" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default SparkleGradientIcon;
