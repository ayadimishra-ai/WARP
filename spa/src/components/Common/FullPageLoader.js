import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  progress: {
    color: theme.palette.primary.main,
  }
});

const FullPageLoader = ({ classes, show }) => {
  if (!show) return null;
  
  return (
    <div className={classes.overlay}>
      <CircularProgress 
        size={60} 
        thickness={4}
        className={classes.progress}
      />
    </div>
  );
};

export default withStyles(styles)(FullPageLoader);