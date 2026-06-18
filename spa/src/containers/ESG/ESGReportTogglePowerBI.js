import React, { Component } from "react";
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import axios from 'axios';
import { getNextJSServiceUrl, getServiceUrl } from '../../config';
import PredealESGReport from "./PredealESGReportPowerBI";
import PostdealESGReport from "./PostdealESGReportPowerBI";
import { withStyles } from '@material-ui/core/styles';
import { getUserPermision } from '../../config';
import * as PageKeys from "../../pagekeys";

const styles = theme => ({
    root: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.paper,
    },
    tabsRoot: {
        padding:'0 80px',
        marginTop:'25px'
    },
    tabsIndicator: {
        backgroundColor: '#FFA93C',
    },
    tabRoot: {
        textTransform: 'initial',
        minWidth: 72,
        fontWeight: theme.typography.fontWeightRegular,
        marginRight: theme.spacing.unit * 2,
        opacity:1,
        background:'#EBEBEB',
        color:'#4D4D4F',
        borderRadius: '5px 5px 0px 0px',
        '&$tabSelected': {
            color: '#fff',
            fontWeight: theme.typography.fontWeightMedium,
            background:'#FFA93C'
        },
    },
    tabSelected: {},
    typography: {
        padding: theme.spacing.unit * 3,
    },
});
class ESGReportToggle extends Component {
    constructor(props) {
        super(props)
        this.state = {
            loader: true,
            value: 0,
            pagePermissions: []
        }
    }

    async componentDidMount() {
        var config = {
            headers: {
                'Authorization': 'Bearer ' + localStorage.tokenId,
                'Content-Type': 'application/json',
                'UserGuid': localStorage.userId,
            },
        };
        await axios.get(getNextJSServiceUrl() + 'Users/GetMappedPagesDetail', config)
            .then((json) => {
                this.setState({ pagePermissions: json.data })
            }).catch((err) => {

            });
    }
    handleChange = (event, value) => {
        this.setState({ value });
    };
    render() {
        const { value } = this.state;
        const { classes } = this.props;
        let permissions = JSON.parse(localStorage.permissions);
        console.log("permissions", permissions, permissions.filter(x => x.pageKey === "PredealESGReportPowerBI" || x.pageKey === "PostdealESGReportPowerBI"))
        return permissions.filter(x => x.pageKey === "PredealESGReportPowerBI" || x.pageKey === "PostdealESGReportPowerBI").length === 2 ?
            <div>
                <div>
                    <h6>ESG Report</h6>
                </div>
                <Tabs value={value} classes={{ indicator: classes.tabsIndicator }} onChange={this.handleChange}>
                    <Tab classes={{ root: classes.tabRoot, selected: classes.tabSelected }} label="Postdeal" />
                    <Tab classes={{ root: classes.tabRoot, selected: classes.tabSelected }} label="Predeal" />
                </Tabs>
                {value === 0 && <div><PostdealESGReport /></div>}
                {value === 1 && <div><PredealESGReport  /></div>}
            </div>
        :
        (getUserPermision(JSON.parse(localStorage.permissions), PageKeys.PredealESGReportPowerBI) !== null) ?
            <PredealESGReport />
        :(getUserPermision(JSON.parse(localStorage.permissions), PageKeys.PostdealESGReportPowerBI) !== null) ?
            <PostdealESGReport /> : ""
    }
}
export default withStyles(styles)(ESGReportToggle);
