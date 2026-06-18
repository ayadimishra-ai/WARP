import React, { Component } from "react";
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import axios from "axios";
import { getServiceUrl } from "../../config";

const styles = {
    root: {
        background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
        borderRadius: 3,
        border: 0,
        color: 'white',
        height: 48,
        padding: '0 30px',
        boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
    },
    label: {
        textTransform: 'capitalize',
    },
};
class OrganisationStructure extends Component {
    constructor(props) {
        super(props)
        this.state = {
            organizationData:[],
        }
    }

    componentDidMount = async () => {
        await this.getOrganizationHierarchyData();
    }

    async getOrganizationHierarchyData () {
        var config = {
          headers: {
            Authorization: "Bearer " + localStorage.tokenId,
            "Content-Type": "application/json",
            CompanyGuid: localStorage.companyGuid,
          },
        };
        await axios
      .get(getServiceUrl() + "Users/GetOrganizationHierarchyData", config)
      .then((json) => { 
        if (json.status === 200) {
          if (json.data !== undefined) {
            this.setState({ organizationData: json.data });
          }
        }
      })
      .catch((err) =>
        err.response !== undefined
          ? err.response.status === 401
            ? (window.location.pathname = "/")
            : ""
          : ""
      );
    }

    render() {
       // console.log("organizationData", this.state.organizationData)
        // const { classes } = this.props;
        return (
            <>
                <div>
                    <h6>Organization Hierarchy</h6>
                    {this.state.organizationData !== null && this.state.organizationData !== undefined  ?
                    <ExpansionPanel className="mainPannel">
                        <ExpansionPanelSummary classes={{ expanded: 'expanded_heading' }} className="panelHeading" expandIcon={<ExpandMoreIcon />}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <g clip-path="url(#clip0_8196_22240)">
                                    <path d="M6.53346 12.5333H17.4668V14.5866H18.5335V11.4666H12.5335V9.33325H11.4668V11.4666H5.4668V14.5866H6.53346V12.5333Z" fill="#454545" />
                                    <path d="M9.33301 15.3333H2.66634C2.31272 15.3333 1.97358 15.4737 1.72353 15.7238C1.47348 15.9738 1.33301 16.313 1.33301 16.6666V20.6666C1.33301 21.0202 1.47348 21.3593 1.72353 21.6094C1.97358 21.8594 2.31272 21.9999 2.66634 21.9999H9.33301C9.68663 21.9999 10.0258 21.8594 10.2758 21.6094C10.5259 21.3593 10.6663 21.0202 10.6663 20.6666V16.6666C10.6663 16.313 10.5259 15.9738 10.2758 15.7238C10.0258 15.4737 9.68663 15.3333 9.33301 15.3333ZM2.66634 20.6666V16.6666H9.33301V20.6666H2.66634Z" fill="#454545" />
                                    <path d="M21.333 15.3333H14.6663C14.3127 15.3333 13.9736 15.4737 13.7235 15.7238C13.4735 15.9738 13.333 16.313 13.333 16.6666V20.6666C13.333 21.0202 13.4735 21.3593 13.7235 21.6094C13.9736 21.8594 14.3127 21.9999 14.6663 21.9999H21.333C21.6866 21.9999 22.0258 21.8594 22.2758 21.6094C22.5259 21.3593 22.6663 21.0202 22.6663 20.6666V16.6666C22.6663 16.313 22.5259 15.9738 22.2758 15.7238C22.0258 15.4737 21.6866 15.3333 21.333 15.3333ZM14.6663 20.6666V16.6666H21.333V20.6666H14.6663Z" fill="#454545" />
                                    <path d="M8.66634 8.66667H15.333C15.6866 8.66667 16.0258 8.52619 16.2758 8.27614C16.5259 8.02609 16.6663 7.68695 16.6663 7.33333V3.33333C16.6663 2.97971 16.5259 2.64057 16.2758 2.39052C16.0258 2.14048 15.6866 2 15.333 2H8.66634C8.31272 2 7.97358 2.14048 7.72353 2.39052C7.47348 2.64057 7.33301 2.97971 7.33301 3.33333V7.33333C7.33301 7.68695 7.47348 8.02609 7.72353 8.27614C7.97358 8.52619 8.31272 8.66667 8.66634 8.66667ZM8.66634 3.33333H15.333V7.33333H8.66634V3.33333Z" fill="#454545" />
                                </g>
                                <defs>
                                    <clipPath id="clip0_8196_22240">
                                        <rect width="24" height="24" fill="white" />
                                    </clipPath>
                                </defs>
                            </svg>
                            <Typography>
                                {this.state.organizationData.table1 !== null && this.state.organizationData.table1 !== undefined && this.state.organizationData.table1.length > 0 
                                ? this.state.organizationData.table1[0].companyName : ""}
                            </Typography>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails className="panelDetails">
                            <ExpansionPanel className="mainPannel">
                                <ExpansionPanelSummary classes={{ expanded: 'expanded_heading' }} className="panelHeading" expandIcon={<ExpandMoreIcon />}>
                                    <Typography >{this.state.organizationData.table1 !== null && this.state.organizationData.table1 !== undefined && this.state.organizationData.table1.length > 0 ? this.state.organizationData.table1[0].userName +' ( '+this.state.organizationData.table1[0].roleName +' )':""}</Typography>
                                </ExpansionPanelSummary>
                                {this.state.organizationData.table3 !== null && this.state.organizationData.table3 !== undefined && this.state.organizationData.table3.length > 0 ?
                                this.state.organizationData.table3.map((itemLocation)=>(
                                <ExpansionPanelDetails className="panelDetails">
                                    <ExpansionPanel className="mainPannel">
                                        <ExpansionPanelSummary classes={{ expanded: 'expanded_heading' }} className="panelHeading" expandIcon={<ExpandMoreIcon />}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                <path d="M22.4172 21.4125L19.4172 15.4125C19.3549 15.2889 19.2595 15.1849 19.1417 15.112C19.0239 15.0392 18.8882 15.0005 18.7497 15H12.7497V11.94C14.0634 11.7504 15.2565 11.0703 16.0889 10.0364C16.9213 9.00259 17.3313 7.69183 17.2362 6.36793C17.1412 5.04403 16.5482 3.80528 15.5766 2.90096C14.605 1.99664 13.327 1.4939 11.9997 1.4939C10.6724 1.4939 9.39434 1.99664 8.42277 2.90096C7.45119 3.80528 6.85821 5.04403 6.76316 6.36793C6.66811 7.69183 7.07804 9.00259 7.91046 10.0364C8.74288 11.0703 9.93599 11.7504 11.2497 11.94V15H5.24968C5.11118 15.0005 4.9755 15.0392 4.85768 15.112C4.73987 15.1849 4.64451 15.2889 4.58218 15.4125L1.58218 21.4125C1.52465 21.5267 1.49726 21.6537 1.50261 21.7814C1.50796 21.9092 1.54588 22.0334 1.61276 22.1424C1.67964 22.2513 1.77326 22.3414 1.88473 22.404C1.99621 22.4666 2.12184 22.4997 2.24968 22.5H21.7497C21.8775 22.4997 22.0032 22.4666 22.1146 22.404C22.2261 22.3414 22.3197 22.2513 22.3866 22.1424C22.4535 22.0334 22.4914 21.9092 22.4968 21.7814C22.5021 21.6537 22.4747 21.5267 22.4172 21.4125ZM8.24968 6.75005C8.24968 6.00837 8.46962 5.28335 8.88167 4.66666C9.29373 4.04998 9.8794 3.56933 10.5646 3.2855C11.2498 3.00167 12.0038 2.92741 12.7313 3.0721C13.4587 3.2168 14.1269 3.57395 14.6513 4.0984C15.1758 4.62285 15.5329 5.29103 15.6776 6.01846C15.8223 6.74589 15.7481 7.49989 15.4642 8.18511C15.1804 8.87033 14.6998 9.456 14.0831 9.86806C13.4664 10.2801 12.7414 10.5 11.9997 10.5C11.0051 10.5 10.0513 10.105 9.34803 9.4017C8.64477 8.69844 8.24968 7.74461 8.24968 6.75005ZM3.46468 21L5.71468 16.5H11.2497V18.75C11.2497 18.949 11.3287 19.1397 11.4694 19.2804C11.61 19.421 11.8008 19.5 11.9997 19.5C12.1986 19.5 12.3894 19.421 12.53 19.2804C12.6707 19.1397 12.7497 18.949 12.7497 18.75V16.5H18.2847L20.5347 21H3.46468Z" fill="#454545" />
                                            </svg><Typography >{itemLocation.location}</Typography>
                                        </ExpansionPanelSummary>
                                        {this.state.organizationData.table4 !== null && this.state.organizationData.table4 !== undefined && this.state.organizationData.table4.length > 0 ?
                                        this.state.organizationData.table4.filter(x=> x.addressGuid === itemLocation.addressGuid && x.roleName === 'LOCATIONADMIN').map((item)=>(
                                        <ExpansionPanelDetails className="panelDetails">
                                            <ExpansionPanel className="mainPannel">
                                                <ExpansionPanelSummary classes={{ expanded: 'expanded_heading' }} className="panelHeading" expandIcon={<ExpandMoreIcon />}>
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M12 10C14.2091 10 16 8.20914 16 6C16 3.79086 14.2091 2 12 2C9.79086 2 8 3.79086 8 6C8 8.20914 9.79086 10 12 10Z" stroke="#454545" stroke-width="1.5" />
                                                        <path d="M19.9975 18C20 17.8358 20 17.669 20 17.5C20 15.0147 16.4183 13 12 13C7.58172 13 4 15.0147 4 17.5C4 19.9853 4 22 12 22C14.231 22 15.8398 21.8433 17 21.5634" stroke="#454545" stroke-width="1.5" stroke-linecap="round" />
                                                    </svg>
                                                    <Typography >
                                                        {/* Mahesh Jha (Location Admin)  */}
                                                        {item.userName +' ( '+item.roleName +' )'}
                                                    </Typography>
                                                </ExpansionPanelSummary>
                                                {this.state.organizationData.table4.filter(x=> x.addressGuid === itemLocation.addressGuid && x.roleName === 'LOCATIONEXECUTIVE').map((itemData)=>(
                                                <ExpansionPanelDetails className="panelDetails">
                                                    <ExpansionPanel className="mainPannel">
                                                        <ExpansionPanelSummary classes={{ expanded: 'expanded_heading' }} className="panelHeading" expandIcon={<ExpandMoreIcon />}>
                                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M12 10C14.2091 10 16 8.20914 16 6C16 3.79086 14.2091 2 12 2C9.79086 2 8 3.79086 8 6C8 8.20914 9.79086 10 12 10Z" stroke="#454545" stroke-width="1.5" />
                                                                <path d="M19.9975 18C20 17.8358 20 17.669 20 17.5C20 15.0147 16.4183 13 12 13C7.58172 13 4 15.0147 4 17.5C4 19.9853 4 22 12 22C14.231 22 15.8398 21.8433 17 21.5634" stroke="#454545" stroke-width="1.5" stroke-linecap="round" />
                                                            </svg>
                                                            <Typography >
                                                                {/* Vinayak Zade (Location Executive) - Transport, Material, Energy, Waste  */}
                                                                {itemData.userName +' ( '+itemData.roleName +' )'+ itemData.activityName}
                                                            </Typography>
                                                        </ExpansionPanelSummary>
                                                    </ExpansionPanel>
                                                </ExpansionPanelDetails>))}
                                            </ExpansionPanel>
                                        </ExpansionPanelDetails>)):""}
                                    </ExpansionPanel>
                                </ExpansionPanelDetails>
                                ))
                                :""}
                                {/* <ExpansionPanelDetails className="panelDetails">
                                    <ExpansionPanel className="mainPannel">
                                        <ExpansionPanelSummary classes={{ expanded: 'expanded_heading' }} className="panelHeading" expandIcon={<ExpandMoreIcon />}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                <path d="M22.4172 21.4125L19.4172 15.4125C19.3549 15.2889 19.2595 15.1849 19.1417 15.112C19.0239 15.0392 18.8882 15.0005 18.7497 15H12.7497V11.94C14.0634 11.7504 15.2565 11.0703 16.0889 10.0364C16.9213 9.00259 17.3313 7.69183 17.2362 6.36793C17.1412 5.04403 16.5482 3.80528 15.5766 2.90096C14.605 1.99664 13.327 1.4939 11.9997 1.4939C10.6724 1.4939 9.39434 1.99664 8.42277 2.90096C7.45119 3.80528 6.85821 5.04403 6.76316 6.36793C6.66811 7.69183 7.07804 9.00259 7.91046 10.0364C8.74288 11.0703 9.93599 11.7504 11.2497 11.94V15H5.24968C5.11118 15.0005 4.9755 15.0392 4.85768 15.112C4.73987 15.1849 4.64451 15.2889 4.58218 15.4125L1.58218 21.4125C1.52465 21.5267 1.49726 21.6537 1.50261 21.7814C1.50796 21.9092 1.54588 22.0334 1.61276 22.1424C1.67964 22.2513 1.77326 22.3414 1.88473 22.404C1.99621 22.4666 2.12184 22.4997 2.24968 22.5H21.7497C21.8775 22.4997 22.0032 22.4666 22.1146 22.404C22.2261 22.3414 22.3197 22.2513 22.3866 22.1424C22.4535 22.0334 22.4914 21.9092 22.4968 21.7814C22.5021 21.6537 22.4747 21.5267 22.4172 21.4125ZM8.24968 6.75005C8.24968 6.00837 8.46962 5.28335 8.88167 4.66666C9.29373 4.04998 9.8794 3.56933 10.5646 3.2855C11.2498 3.00167 12.0038 2.92741 12.7313 3.0721C13.4587 3.2168 14.1269 3.57395 14.6513 4.0984C15.1758 4.62285 15.5329 5.29103 15.6776 6.01846C15.8223 6.74589 15.7481 7.49989 15.4642 8.18511C15.1804 8.87033 14.6998 9.456 14.0831 9.86806C13.4664 10.2801 12.7414 10.5 11.9997 10.5C11.0051 10.5 10.0513 10.105 9.34803 9.4017C8.64477 8.69844 8.24968 7.74461 8.24968 6.75005ZM3.46468 21L5.71468 16.5H11.2497V18.75C11.2497 18.949 11.3287 19.1397 11.4694 19.2804C11.61 19.421 11.8008 19.5 11.9997 19.5C12.1986 19.5 12.3894 19.421 12.53 19.2804C12.6707 19.1397 12.7497 18.949 12.7497 18.75V16.5H18.2847L20.5347 21H3.46468Z" fill="#454545" />
                                            </svg><Typography >Pune</Typography>
                                        </ExpansionPanelSummary>
                                        <ExpansionPanelDetails className="panelDetails">
                                            <ExpansionPanel className="mainPannel">
                                                <ExpansionPanelSummary classes={{ expanded: 'expanded_heading' }} className="panelHeading" expandIcon={<ExpandMoreIcon />}>
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M12 10C14.2091 10 16 8.20914 16 6C16 3.79086 14.2091 2 12 2C9.79086 2 8 3.79086 8 6C8 8.20914 9.79086 10 12 10Z" stroke="#454545" stroke-width="1.5" />
                                                        <path d="M19.9975 18C20 17.8358 20 17.669 20 17.5C20 15.0147 16.4183 13 12 13C7.58172 13 4 15.0147 4 17.5C4 19.9853 4 22 12 22C14.231 22 15.8398 21.8433 17 21.5634" stroke="#454545" stroke-width="1.5" stroke-linecap="round" />
                                                    </svg>
                                                    <Typography >
                                                        Anup Gokhale (Location Admin) </Typography>
                                                </ExpansionPanelSummary>
                                                <ExpansionPanelDetails className="panelDetails">
                                                    <ExpansionPanel className="mainPannel">
                                                        <ExpansionPanelSummary classes={{ expanded: 'expanded_heading' }} className="panelHeading" expandIcon={<ExpandMoreIcon />}>
                                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M12 10C14.2091 10 16 8.20914 16 6C16 3.79086 14.2091 2 12 2C9.79086 2 8 3.79086 8 6C8 8.20914 9.79086 10 12 10Z" stroke="#454545" stroke-width="1.5" />
                                                                <path d="M19.9975 18C20 17.8358 20 17.669 20 17.5C20 15.0147 16.4183 13 12 13C7.58172 13 4 15.0147 4 17.5C4 19.9853 4 22 12 22C14.231 22 15.8398 21.8433 17 21.5634" stroke="#454545" stroke-width="1.5" stroke-linecap="round" />
                                                            </svg>
                                                            <Typography >
                                                                Prachi Bajpai (Location Executive) - Transport, Material </Typography>
                                                        </ExpansionPanelSummary>
                                                    </ExpansionPanel>
                                                </ExpansionPanelDetails>
                                                <ExpansionPanelDetails className="panelDetails">
                                                    <ExpansionPanel className="mainPannel">
                                                        <ExpansionPanelSummary classes={{ expanded: 'expanded_heading' }} className="panelHeading" expandIcon={<ExpandMoreIcon />}>
                                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M12 10C14.2091 10 16 8.20914 16 6C16 3.79086 14.2091 2 12 2C9.79086 2 8 3.79086 8 6C8 8.20914 9.79086 10 12 10Z" stroke="#454545" stroke-width="1.5" />
                                                                <path d="M19.9975 18C20 17.8358 20 17.669 20 17.5C20 15.0147 16.4183 13 12 13C7.58172 13 4 15.0147 4 17.5C4 19.9853 4 22 12 22C14.231 22 15.8398 21.8433 17 21.5634" stroke="#454545" stroke-width="1.5" stroke-linecap="round" />
                                                            </svg>
                                                            <Typography >
                                                                Sagar Kodte (Location Executive) - Energy, Waste </Typography>
                                                        </ExpansionPanelSummary>
                                                    </ExpansionPanel>
                                                </ExpansionPanelDetails>
                                            </ExpansionPanel>
                                        </ExpansionPanelDetails>
                                    </ExpansionPanel>
                                </ExpansionPanelDetails> */}
                            </ExpansionPanel>
                        </ExpansionPanelDetails>
                    </ExpansionPanel>
                    :""}
                </div>
                <div></div>
            </>
        )
    }

}
export default withStyles(styles)(OrganisationStructure)