import axios from 'axios';
import moment from 'moment';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { getServiceUrl, getToken } from '../../config';
import Spinner from '../../UI/Spinner/Spinner';

class Verification extends Component {
    constructor(props) {
        super(props);

        this.state = {
            response: '',
            loading: false,
        }
    }
    async componentDidMount() {
        const params = new URLSearchParams(this.props.location.search);
        let values = params.get('user');
        if (values === undefined) {
            this.setState({ response: 'Invalid User' });
        }
        else {
            this.setState({ loading: true });
            var config = {
                headers: {
                    "Authorization": "Bearer " + localStorage.tokenId,
                    'Content-Type': 'application/json',
                    'userEmailId': values,
                },
            };
            await axios.get(getServiceUrl() + 'Users/VerifyUser', config)
                .then((response) => {
                    this.setState({ loading: false });
                    this.setState({ response: response.data.saveresult });
                }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
        }
    }

    render() {
        let IsAthenticated = false;
        if (localStorage.getItem("IsAuthentic") === 'true' || localStorage.getItem("IsAuthentic") === true) {
            // return <Redirect to="/home" />
            IsAthenticated = true;
        }
        return (
            <div style={({ 'text-align': 'center', padding: "50px" })}>
                <div style={({ display: this.state.loading ? 'none' : 'block' })}>
                    <h3>{this.state.response}</h3>
                    {IsAthenticated === true ?
                        <Link blackBtnSimple to="/home">Go to Home</Link>
                        :
                        <div>
                            <Link blackBtnSimple to="/supplierlogin">Go to Supplier Login</Link>
                            <span> OR </span>
                            <Link blackBtnSimple to="/login">Go to Buyer Login</Link>
                        </div>
                    }

                </div>
                <div style={({ display: this.state.loading ? 'block' : 'none' })}>
                    <Spinner />
                </div>
            </div>
        )
    }
}

export default (Verification);