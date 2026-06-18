import React, { Component } from "react";
import QuetionAns from '../../components/Questions/questions'
import { Redirect } from "react-router-dom";
import * as PageKeys from "../../pagekeys";
import { getUserPermision } from "../../config";

class Quetionair extends Component {
    render() {
        let permissions = localStorage.permissions !== undefined ? JSON.parse(localStorage.permissions) : [];
        if (permissions.length === 0) {
            return <Redirect to="/not-found" />;
        } else if (getUserPermision(permissions, PageKeys.pwcframework) === null) {
            return <Redirect to="/not-found" />;
        }
        return (
            <QuetionAns />
        )
    }
}
export default Quetionair