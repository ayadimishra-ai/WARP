import React, { Component } from 'react';
import Share from '@material-ui/icons/Share';

class ShareProduct extends Component {
    constructor(props) {
        super(props)

    }
    render() {
        return (
            <React.Fragment>
                <span><Share/></span>
            </React.Fragment>
        )
    }
}
export default (ShareProduct);