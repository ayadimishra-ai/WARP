import { Link } from "@material-ui/core";
import React from "react";
import { Lock } from "@material-ui/icons";
import { showLockUpPopup } from "../../UI/Popups/lockUpPopUp";

const hoverBackgroundColor = "rgba(212, 241, 238, 0.5)";

const itemStyle = {
  padding: "12px 32px",
  fontWeight: 400,
  fontSize: "14px",
  cursor: "pointer",
  color: "#003B52",
  textDecoration: "none",
  textAlign: "left",
  border: "none",
  background: "transparent",
  width: "100%",
  transition: "background-color 0.2s ease",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "8px",
};

const activeItemStyle = {
  ...itemStyle,
  backgroundColor: "#d4f1ee",
  color: "#002f44",
  fontWeight: 700,
};

const DataLogSidebar = ({ activePage, onPageChange, items = [] }) => {
  const [hoveredPage, setHoveredPage] = React.useState(null);

  const getItemStyle = (pageKey) => {
    if (activePage === pageKey) {
      return activeItemStyle;
    }

    if (hoveredPage === pageKey) {
      return {
        ...itemStyle,
        backgroundColor: hoverBackgroundColor,
        cursor: "pointer",
      };
    }

    return itemStyle;
  };

  const handleItemClick = (item) => {
    if (item.isLocked) {
      showLockUpPopup({
        type: item.lockType || "upload",
        activity: item.label,
      });
      return;
    }

    onPageChange(item.key);
  };

  return (
    <aside className="sideNavBlock">
      {items.map((item) => (
        <React.Fragment key={item.key}>
          <Link
            component="button"
            style={{
              ...getItemStyle(item.key),
              opacity: item.isLocked ? 0.8 : 1,
              filter: item.isLocked ? "grayscale(100%)" : "none",
            }}
            onClick={() => handleItemClick(item)}
            onMouseEnter={() => setHoveredPage(item.key)}
            onMouseLeave={() => setHoveredPage(null)}
            data-locked={item.isLocked ? "true" : "false"}
          >
            <span>{item.label}</span>
            {item.isLocked ? <Lock style={{ fontSize: 16 }} /> : null}
          </Link>
          {item.showDividerAfter ? <hr className="divider" /> : null}
        </React.Fragment>
      ))}
    </aside>
  );
};

export default DataLogSidebar;
