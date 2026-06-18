import React, { Component } from "react";
import ihc_logo from '../../assets/img/ihc_logo.png'
import MenuList from '@material-ui/core/MenuList';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import { withStyles } from '@material-ui/core/styles';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import DraftsIcon from '@material-ui/icons/Drafts';
import SendIcon from '@material-ui/icons/Send';
import { Dashboard, ExitToApp, Group, Home, List, LocalActivity, Lock, Place, Report } from "@material-ui/icons";
import { Button, Fab } from "@material-ui/core";
import CarbonExchange from '../../assets/img/carbonExchange.png'
const styles = theme => ({
    menuItem: {
        height: 36,
        paddingLeft: 10,
        backgroundColor: '#fff',
        '&:not(:focus)':{
            '&:hover': {
                backgroundColor: '#fff',
            }
        },
        '&:focus': {
            backgroundColor: '#B48B39',
            borderRadius: 5,
            '& $primary, & $icon': {
                color: theme.palette.common.white,
            },
            '&:hover': {
                color:'#7f7f7f'
            }
        },
        '&:hover': {
            //backgroundColor: '#fff',
            borderRadius: 5,
        }
    },
    primary: { fontSize: 12, textTransform: 'capitalize', color: '#7f7f7f' },
    icon: { fontSize: 16, marginRight: 0, width: 20, color: '#8f8f8f' },
    topIcon: {
        fontSize: 16, marginRight: 0, position: 'absolute',
        right: 20,
        top: 20
    },
    sidebar: {
        position: 'sticky',
        left: 0,
        zIndex: 999,
        borderRight: '1px solid #ccc',
        height: '100vh',
        textAlign: 'center',
        width: 225,
        top: 0,
        float: 'left'
    },
    logo: {
        marginTop: 80,
        marginBottom: 10,
    },
    menuContainer: {
        padding: 15
    },
    logout: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 15
    }
});
const IhcSidebar = (props) => {
    const { classes } = props;
    return (
        <div className={classes.sidebar}>
            <ListItemIcon className={classes.topIcon} >
                <svg className={classes.icon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M7 10.0288C7.47142 10 8.05259 10 8.8 10H15.2C15.9474 10 16.5286 10 17 10.0288M7 10.0288C6.41168 10.0647 5.99429 10.1455 5.63803 10.327C5.07354 10.6146 4.6146 11.0735 4.32698 11.638C4 12.2798 4 13.1198 4 14.8V16.2C4 17.8802 4 18.7202 4.32698 19.362C4.6146 19.9265 5.07354 20.3854 5.63803 20.673C6.27976 21 7.11984 21 8.8 21H15.2C16.8802 21 17.7202 21 18.362 20.673C18.9265 20.3854 19.3854 19.9265 19.673 19.362C20 18.7202 20 17.8802 20 16.2V14.8C20 13.1198 20 12.2798 19.673 11.638C19.3854 11.0735 18.9265 10.6146 18.362 10.327C18.0057 10.1455 17.5883 10.0647 17 10.0288M7 10.0288V8C7 5.23858 9.23858 3 12 3C14.7614 3 17 5.23858 17 8V10.0288" stroke="#8f8f8f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
            </ListItemIcon>
            <img className={classes.logo} src={ihc_logo} />
            <MenuList className={classes.menuContainer}>
                <MenuItem className={classes.menuItem}>
                    <svg className={classes.icon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#f7f7f7"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M9 16C9.85038 16.6303 10.8846 17 12 17C13.1154 17 14.1496 16.6303 15 16" stroke="#616161" stroke-width="1.5" stroke-linecap="round"></path> <path d="M22 12.2039V13.725C22 17.6258 22 19.5763 20.8284 20.7881C19.6569 22 17.7712 22 14 22H10C6.22876 22 4.34315 22 3.17157 20.7881C2 19.5763 2 17.6258 2 13.725V12.2039C2 9.91549 2 8.77128 2.5192 7.82274C3.0384 6.87421 3.98695 6.28551 5.88403 5.10813L7.88403 3.86687C9.88939 2.62229 10.8921 2 12 2C13.1079 2 14.1106 2.62229 16.116 3.86687L18.116 5.10812C20.0131 6.28551 20.9616 6.87421 21.4808 7.82274" stroke="#8f8f8f" stroke-width="1.5" stroke-linecap="round"></path> </g></svg>
                    <ListItemText classes={{ primary: classes.primary }} inset primary="Home" />
                </MenuItem>
                <MenuItem className={classes.menuItem}>
                    <svg className={classes.icon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g id="Edit / List_Checklist"> <path id="Vector" d="M11 17H20M8 15L5.5 18L4 17M11 12H20M8 10L5.5 13L4 12M11 7H20M8 5L5.5 8L4 7" stroke="#616161" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g> </g></svg>
                    <ListItemText classes={{ primary: classes.primary }} inset primary="ESG Assessments" />
                </MenuItem>
                <MenuItem className={classes.menuItem}>
                    <svg className={classes.icon} xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 256 256" {...props}><path fill="currentColor" stroke="#8f8f8f" d="M27.2 126.4a8 8 0 0 0 11.2-1.6a52 52 0 0 1 83.2 0a8 8 0 0 0 11.2 1.59a7.7 7.7 0 0 0 1.59-1.59a52 52 0 0 1 83.2 0a8 8 0 0 0 12.8-9.61A67.85 67.85 0 0 0 203 93.51a40 40 0 1 0-53.94 0a67.3 67.3 0 0 0-21 14.31a67.3 67.3 0 0 0-21-14.31a40 40 0 1 0-53.94 0A67.9 67.9 0 0 0 25.6 115.2a8 8 0 0 0 1.6 11.2M176 40a24 24 0 1 1-24 24a24 24 0 0 1 24-24m-96 0a24 24 0 1 1-24 24a24 24 0 0 1 24-24m123 157.51a40 40 0 1 0-53.94 0a67.3 67.3 0 0 0-21 14.31a67.3 67.3 0 0 0-21-14.31a40 40 0 1 0-53.94 0A67.9 67.9 0 0 0 25.6 219.2a8 8 0 1 0 12.8 9.6a52 52 0 0 1 83.2 0a8 8 0 0 0 11.2 1.59a7.7 7.7 0 0 0 1.59-1.59a52 52 0 0 1 83.2 0a8 8 0 0 0 12.8-9.61A67.85 67.85 0 0 0 203 197.51M80 144a24 24 0 1 1-24 24a24 24 0 0 1 24-24m96 0a24 24 0 1 1-24 24a24 24 0 0 1 24-24"></path></svg>
                    <ListItemText classes={{ primary: classes.primary }} inset primary="Carbon Exchanges" />
                </MenuItem>
                <MenuItem className={classes.menuItem}>
                    <svg className={classes.icon} xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path fill="currentColor" d="m16 30l-8.436-9.949a35 35 0 0 1-.348-.451A10.9 10.9 0 0 1 5 13a11 11 0 0 1 22 0a10.9 10.9 0 0 1-2.215 6.597l-.001.003s-.3.394-.345.447ZM8.813 18.395s.233.308.286.374L16 26.908l6.91-8.15c.044-.055.278-.365.279-.366A8.9 8.9 0 0 0 25 13a9 9 0 0 0-18 0a8.9 8.9 0 0 0 1.813 5.395" /><path fill="currentColor" d="M21 18h-2v-8h-6v8h-2v-8a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2Z" /><path fill="currentColor" d="M15 16h2v2h-2zm0-4h2v2h-2z" /></svg>
                    <ListItemText classes={{ primary: classes.primary }} inset primary="Company Registration" />
                </MenuItem>
                <MenuItem className={classes.menuItem}>
                    <svg className={classes.icon} width="32" height="32" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2" /></svg>
                    <ListItemText classes={{ primary: classes.primary }} inset primary="GHG Report" />
                </MenuItem>
            </MenuList>
            <div className={classes.logout}>
                <Button
                    className={classes.menuItem}
                >
                    <svg className={classes.icon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M15 12L2 12M2 12L5.5 9M2 12L5.5 15" stroke="#8f8f8f" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M9.00195 7C9.01406 4.82497 9.11051 3.64706 9.87889 2.87868C10.7576 2 12.1718 2 15.0002 2L16.0002 2C18.8286 2 20.2429 2 21.1215 2.87868C22.0002 3.75736 22.0002 5.17157 22.0002 8L22.0002 16C22.0002 18.8284 22.0002 20.2426 21.1215 21.1213C20.3531 21.8897 19.1752 21.9862 17 21.9983M9.00195 17C9.01406 19.175 9.11051 20.3529 9.87889 21.1213C10.5202 21.7626 11.4467 21.9359 13 21.9827" stroke="#8f8f8f" stroke-width="1.5" stroke-linecap="round"></path> </g></svg>
                    <ListItemText classes={{ primary: classes.primary }} inset primary="Logout" />
                </Button>
            </div>
        </div>
    )
}
export default withStyles(styles)(IhcSidebar)