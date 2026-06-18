import axios from 'axios';
import React, { Component } from 'react';
import { getServiceUrl } from '../../config';

let result = "";
class dbMonitoring extends Component {
    constructor(props) {
        super(props);
        // this.submitButton = React.createRef();
        // this.searchText = React.createRef();
        this.state = {
            result: "Verifying DB connection"
        };
    }
    componentDidMount(){
        this.setState({result: "DB Verification in progress"});
        var config = {
            headers: {
                "Authorization": "Bearer " + localStorage.tokenId,
                'Content-Type': 'application/json'
            },
        };
        axios.get(getServiceUrl() + 'Category/DBMornitoring', config)
        .then(async (response) => {
                result = response.data.result;
                this.setState({result: result});
        }).catch(err => {
            result = "DB Connection failed";
            console.log(err);
        });

    }

    render () {
        return (
        <div className="no-products-found">
            {this.state.result}
        </div>)
    }

}
export default dbMonitoring