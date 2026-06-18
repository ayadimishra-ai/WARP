import React, { useState } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import LinearProgress from "@material-ui/core/LinearProgress";
import InfoOutlined from "@material-ui/icons/InfoOutlined";
import Popover from "@material-ui/core/Popover";
import Typography from "@material-ui/core/Typography";
import { Tooltip } from "@material-ui/core";

const styles = {
  root: {
    flexGrow: 1,
    display: "flex",
    alignItems: "center",
  },
  infoIcon: {
    marginLeft: 6,
    cursor: "pointer",
    color: "#fff",
    width: "20px",
  },
  popover: {
    padding: 10,
  },
  gradientProgressRoot: {
    width: "44px",
    height: "6px",
    borderRadius: "20px",
    background: "#fff",
  },
  gradientProgress: {
    background:
      "linear-gradient(90deg, #84D8D2 0%, #1C9689 100%)",
  },
  popoverMain: {
    pointerEvents: "none",
  },
};

const LinearDeterminate = ({ classes, completed, assessmentName, fyYear }) => {
  // const [anchorEl, setAnchorEl] = useState(null);

  // const handlePopoverOpen = (event) => {
  //   setAnchorEl(event.currentTarget);
  // };

  // const handlePopoverClose = () => {
  //   setAnchorEl(null);
  // };

  // const open = Boolean(anchorEl);

  return (
    <div className={classes.root}>
      <LinearProgress
        classes={{
          bar: classes.gradientProgress,
          root: classes.gradientProgressRoot,
        }}
        variant="determinate"
        value={completed}
      />
      <Tooltip placement="bottom-start" title={<>Indicates the percentage of the {assessmentName} completed for the
      specified {fyYear} period.</>}>
        <InfoOutlined
          color="inherit"
          className={classes.infoIcon}
          // aria-owns={open ? "mouse-over-popover" : undefined}
          // aria-haspopup="true"
          // onMouseEnter={handlePopoverOpen}
          // onMouseLeave={handlePopoverClose}
        />
      </Tooltip>
      {/* <Popover
        id="mouse-over-popover"
        className={classes.popoverMain}
        open={open}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        disableRestoreFocus
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        PaperProps={{
          style: {
            width: "300px",
          },
        }}
      >
        
      </Popover> */}
    </div>
  );
};

LinearDeterminate.propTypes = {
  classes: PropTypes.object.isRequired,
  completed: PropTypes.number.isRequired,
  assessmentName: PropTypes.string.isRequired,
  fyYear: PropTypes.string.isRequired,
};

export default withStyles(styles)(LinearDeterminate);
