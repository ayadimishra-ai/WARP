import React, { Component } from 'react';
import ListAlt from '@material-ui/icons/ListAlt';

class AddtoOrderbook extends Component {
    constructor(props) {
        super(props)

    }
    render() {
        return (
            <React.Fragment>
                <span><ListAlt/></span>
            </React.Fragment>
        )
    }
}
export default (AddtoOrderbook);