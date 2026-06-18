import React, { Component } from 'react';
import Compare from '@material-ui/icons/Compare';

class AddtoCompare extends Component {
    constructor(props) {
        super(props)

    }
    render() {
        return (
            <React.Fragment>
                <span><Compare/></span>
            </React.Fragment>
        )
    }
}
export default (AddtoCompare);