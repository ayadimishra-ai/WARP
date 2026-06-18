import React, { Component } from "react";
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import axios from 'axios';
import { getNextJSServiceUrl, getServiceUrl } from '../../config';
import PredealESGReport from "./PredealESGReport";
import PostdealESGReport from "./PostdealESGReport";
import { withStyles } from '@material-ui/core/styles';
import { getUserPermision } from '../../config';
import * as PageKeys from "../../pagekeys";
import { MoreVert } from "@material-ui/icons";
import { BreadCrumb } from "../../utility";
const styles = theme => ({
    root: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.paper,
    },
    tabsRoot: {
       
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
        await axios.get(getNextJSServiceUrl() + "home-page/GetMappedPagesDetail", config)
            .then((json) => {
                this.setState({ pagePermissions: json.data })
            }).catch((err) => {

            });
    }
    handleChange = (event, value) => {
        this.setState({ value });
    };
    render() {
        // let preAndPostDealPermission = this.state.pagePermissions.filter(x => x.pageName == 'PredealESGReport' || x.pageName == 'PostdealESGReport');
        // let permissionPage = '';
        // if (preAndPostDealPermission.length == 1) {
        //     permissionPage = preAndPostDealPermission[0].pageName;
        // }
        const { value } = this.state;
        const { classes } = this.props;
        // return preAndPostDealPermission.length == 2 ?
        //     // <div className="">
        //         <div>
        //             <Tabs value={value} classes={{ root: classes.tabsRoot, indicator: classes.tabsIndicator }} onChange={this.handleChange}>
        //                 <Tab classes={{ root: classes.tabRoot, selected: classes.tabSelected }} label="Post Deal ESG Report" />
        //                 <Tab classes={{ root: classes.tabRoot, selected: classes.tabSelected }} label="Pre Deal ESG Report" />
        //             </Tabs>
        //             {value === 0 && <div><PostdealESGReport /></div>}
        //             {value === 1 && <div><PredealESGReport /></div>}
        //         {/* </div> */}
        //     </div> : permissionPage == 'PredealESGReport' ? <div><PredealESGReport /></div> : <div><PostdealESGReport /></div>
        
        let permissions = JSON.parse(localStorage.permissions);
        let breadCrumb = BreadCrumb([
            { pageName: "Dashboard", url: "/Home" },
            { pageName: "ESG Report", url: "/#" },
          ]);
        return permissions.filter(x => x.pageKey === "PredealESGReport" || x.pageKey === "PostdealESGReport").length === 2 ?
            <div>
                <div className="breadtitle_wrap">
                    {breadCrumb}
                    <div className="page_top_title">
                        <div className="page_heading">ESG Report</div>
                    </div>
                </div>
                <div>
                <h6>ESG Report</h6>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "10px",
                  }}
                >
                  <span>To download the KPIs as PDF please right click on</span>
                  <MoreVert />
                </div>
                </div>
                <Tabs value={value} classes={{ root: classes.tabsRoot, indicator: classes.tabsIndicator }} onChange={this.handleChange}>
                    <Tab classes={{ root: classes.tabRoot, selected: classes.tabSelected }} label="Postdeal" />
                    <Tab classes={{ root: classes.tabRoot, selected: classes.tabSelected }} label="Predeal" />
                </Tabs>
                {value === 0 && <div><PostdealESGReport /></div>}
                {value === 1 && <div><PredealESGReport  /></div>}
            </div>
        :
        (getUserPermision(JSON.parse(localStorage.permissions), PageKeys.PredealESGReport) !== null) ?
            <PredealESGReport />
        :(getUserPermision(JSON.parse(localStorage.permissions), PageKeys.PostdealESGReport) !== null) ?
            <PostdealESGReport /> : ""
    }
}
export default withStyles(styles)(ESGReportToggle);
