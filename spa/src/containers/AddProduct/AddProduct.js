
import React, { Component } from 'react';
import Aux from '../../hoc/Auxx';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import * as PageKeys from '../../pagekeys';
import { getUserPermision } from '../../config';
class AddProduct extends Component {

    render() {
        if (getUserPermision(this.props.permissions, PageKeys.addnewproduct) === null) {
            return <Redirect to="/home" />
        }
        return <Aux>
            <div className="">Welcome to Add new product!</div>
        </Aux>
    }
}

const mapStateToProps = state => {
    return {
        permissions: state.login.permissions
    };
}
export default connect(mapStateToProps)(AddProduct);