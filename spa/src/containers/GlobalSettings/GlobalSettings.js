import React, { Component } from 'react';
import GlobalSettingsListing from './GlobalSettingsListing';
import { Redirect } from "react-router-dom";
import * as PageKeys from "../../pagekeys";
import { getUserPermision } from "../../config";

class GlobalSettings extends Component {
    render() {
        let permissions = localStorage.permissions !== undefined ? JSON.parse(localStorage.permissions) : [];
        if (permissions.length === 0) {
            return <Redirect to="/not-found" />;
        } else if (getUserPermision(permissions, PageKeys.globalsettings) === null) {
            return <Redirect to="/not-found" />;
        }
        return (
            <GlobalSettingsListing />
        )
    }
}
export default GlobalSettings;