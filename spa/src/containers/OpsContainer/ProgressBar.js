import React, { Component } from 'react';
import LinearProgress from '@material-ui/core/LinearProgress';

class YourComponent extends Component {
    getColorBasedOnProgress = (progress) => {
        // Example: Set a custom color based on the progress value
        return progress < 50 ? 'success' : 'secondary';
    };

    render() {
        const { uploadProgress } = this.props;
        const progressBarColor = this.getColorBasedOnProgress(uploadProgress);

        return (
            <LinearProgress
                variant="determinate"
                value={uploadProgress}
                color={"#00FF00"}
                style={{
                    width: '100%',
                    backgroundColor: '#E0E0E0',
                }}
            />
        );
    }
}

export default YourComponent;