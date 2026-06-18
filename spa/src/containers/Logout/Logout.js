import React,{Component} from 'react';
import * as actionCreators from '../../store/actions/index';
import {Redirect} from 'react-router-dom';
import {connect} from 'react-redux';

class Logout extends Component{
    componentDidMount(){
        this.props.onAuthLogout();
    }
    render(){
        return<Redirect to="/"/>;
    }
}

const mapDispatchToProps = dispatch=>{
    return{
        onAuthLogout:()=>dispatch(actionCreators.logout())
    };
};

export default connect(null,mapDispatchToProps)(Logout);