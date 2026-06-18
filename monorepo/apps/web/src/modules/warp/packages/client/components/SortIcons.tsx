import { IconCaretDownFilled, IconCaretUpFilled } from "@tabler/icons-react";

interface SortIconsProps {
  sortState: string | false;
  color?: string;
  size?: number;
  mrtTable?: boolean;
}

const SortIcons = ({
  sortState,
  color = "#ffffff",
  size = 16,
  mrtTable = false,
}: SortIconsProps) => {
  const containerStyle = {
    position: "relative" as const,
    display: "inline-flex",
    flexDirection: "column" as const,
    alignItems: "center",
    height: "18px",
    padding: mrtTable ? "0px 0px 0 5px" : "0px 5px",
  };

  const baseIconStyle = {
    position: "absolute" as const,
    color: color,
  };

  if (sortState === "asc") {
    return (
      <div style={containerStyle}>
        <IconCaretUpFilled
          size={size}
          style={{
            ...baseIconStyle,
            top: "-2px",
            opacity: 1,
          }}
        />
        <IconCaretDownFilled
          size={size}
          style={{
            ...baseIconStyle,
            bottom: "-2px",
            opacity: 0.4,
          }}
        />
      </div>
    );
  }

  if (sortState === "desc") {
    return (
      <div style={containerStyle}>
        <IconCaretUpFilled
          size={size}
          style={{
            ...baseIconStyle,
            top: "-2px",
            opacity: 0.4,
          }}
        />
        <IconCaretDownFilled
          size={size}
          style={{
            ...baseIconStyle,
            bottom: "-2px",
            opacity: 1,
          }}
        />
      </div>
    );
  }

  // Default unsorted state
  return (
    <div style={containerStyle}>
      <IconCaretUpFilled
        size={size}
        style={{
          ...baseIconStyle,
          top: "-2px",
          opacity: 1,
        }}
      />
      <IconCaretDownFilled
        size={size}
        style={{
          ...baseIconStyle,
          bottom: "-2px",
          opacity: 1,
        }}
      />
    </div>
  );
};

export default SortIcons;
