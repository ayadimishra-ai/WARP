import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import withStyles from "@material-ui/core/styles/withStyles";
import React, { Component } from "react";
import { Link } from "react-router-dom";
// @material-ui/icons
// import Search from "@material-ui/icons/Search";
// import Email from "@material-ui/icons/Email";
// import Face from "@material-ui/icons/Face";
// import Settings from "@material-ui/icons/Settings";
// import AccountCircle from "@material-ui/icons/AccountCircle";
// import Explore from "@material-ui/icons/Explore";
// core components

import { getWebsiteUrl } from "../../config";
import Button from "../../UI/Button/MaterialButton";
import Header from "../Material/Header/Header";

import headersStyle from "../../assets/jss/material-kit-pro-react/views/sectionsSections/headersStyle.jsx";
const awsUrl = getWebsiteUrl();


class NavigationNonLogin extends Component {
    constructor(props){
        super(props);
        this.state = {
            activeClass:'nonScroll'
        }
    }
    componentDidMount(){
        window.addEventListener('scroll', () => {
           let activeClass = 'scrolled';
           if(window.scrollY === 0){
               activeClass = 'nonScroll';
           }
           this.setState({ activeClass });
        });
    }
    render(){
        const { classes } = this.props;
        return(
            <Header
            class={"nonLogin"+' '+this.state.activeClass}
            fixed
            links={
                <React.Fragment>
                <div className={classes.collapse + ' ' + 'header_bar'}>
                <List className={classes.list + ' left_header'}>
                  {/* <ListItem className="header_logo">
                    <Link tabIndex="-1" to={"/"}>
                      <Button disableRipple color="transparent" className={classes.navLink + ' ' + 'headerLogo'}>
                        <img
                          // src={below2_logo}
                          src={this.state.activeClass === 'scrolled' ? awsUrl + "CompanySymbol.svg" : awsUrl + "CompanySymbol.svg"}
                        />
                      </Button>
                    </Link>
                  </ListItem> */}
                </List>
              {/* <List className={classes.list + " right_header " + classes.mlAuto}>
                <ListItem className={classes.listItem}>
                  <Button
                    href="https://snowkap.com/"
                    className={classes.navLink}
                    color="transparent"
                    disableRipple
                  >
                    Home
                  </Button>
                </ListItem>
                <ListItem className={classes.listItem}>
                  <Button
                    href="https://snowkap.com/suppliers/"
                    className={classes.navLink}
                    color="transparent"
                    disableRipple
                  >
                    Supplier Services
                  </Button>
                </ListItem>
                <ListItem className={classes.listItem}>
                  <Button
                    href="https://snowkap.com/features/"
                    className={classes.navLink}
                    color="transparent"
                    disableRipple
                  >
                    Buyer Services
                  </Button>
                </ListItem>
                <ListItem className={classes.listItem}>
                  <Button
                    href="https://snowkap.com/pages/about-us/"
                    className={classes.navLink}
                    color="transparent"
                    disableRipple
                  >
                    About us
                  </Button>
                </ListItem>
                <ListItem className={classes.listItem}>
                  <Button
                    href="https://snowkap.com/resources/"
                    className={classes.navLink}
                    color="transparent"
                    disableRipple
                  >
                    Resources
                  </Button>
                </ListItem>
                <ListItem className={classes.listItem}>
                  <Button
                    href="http://twitter.com/"
                    className={classes.navLink}
                    color="transparent"
                    disableRipple
                  >
                   <svg viewBox="0 0 18.469 15" xmlns="http://www.w3.org/2000/svg">
                    <path transform="translate(0 -3.381)" d="M16.57,7.119c.012.164.012.328.012.492a10.7,10.7,0,0,1-10.77,10.77A10.7,10.7,0,0,1,0,16.682a7.83,7.83,0,0,0,.914.047,7.581,7.581,0,0,0,4.7-1.617,3.792,3.792,0,0,1-3.539-2.625,4.773,4.773,0,0,0,.715.059,4,4,0,0,0,1-.129A3.786,3.786,0,0,1,.75,8.7V8.654a3.812,3.812,0,0,0,1.711.48A3.791,3.791,0,0,1,1.289,4.072a10.759,10.759,0,0,0,7.8,3.961A4.273,4.273,0,0,1,9,7.166a3.789,3.789,0,0,1,6.551-2.59,7.452,7.452,0,0,0,2.4-.914,3.775,3.775,0,0,1-1.664,2.086,7.588,7.588,0,0,0,2.18-.586,8.137,8.137,0,0,1-1.9,1.957Z"  data-name="Icon awesome-twitter"/>
                    </svg>
                  </Button>
                </ListItem>
                <ListItem className={classes.listItem}>
                  <Button
                    href="https://www.linkedin.com/company/snowkap/"
                    className={classes.navLink}
                    color="transparent"
                    disableRipple
                  >
                    <svg viewBox="0 0 18.836 18" xmlns="http://www.w3.org/2000/svg">
                    <path transform="translate(.18 -.216)" d="M-.18,2.307A1.958,1.958,0,0,1,.456.807,2.335,2.335,0,0,1,2.111.216,2.265,2.265,0,0,1,3.729.8a2.051,2.051,0,0,1,.636,1.564,1.915,1.915,0,0,1-.618,1.455,2.339,2.339,0,0,1-1.673.6H2.056a2.225,2.225,0,0,1-1.618-.6A2.015,2.015,0,0,1-.18,2.307ZM.056,18.216V6.071H4.093V18.216H.056Zm6.273,0h4.036V11.434a2.617,2.617,0,0,1,.145-.982,2.637,2.637,0,0,1,.773-1.045,1.975,1.975,0,0,1,1.3-.427q2.036,0,2.036,2.745v6.491h4.036V11.252a5.852,5.852,0,0,0-1.273-4.082A4.342,4.342,0,0,0,14.02,5.78,4.126,4.126,0,0,0,10.365,7.8v.036h-.018l.018-.036V6.071H6.329q.036.582.036,3.618t-.036,8.527Z" data-name="Icon zocial-linkedin"/>
                    </svg>
                  </Button>
                </ListItem>
                <ListItem className={classes.listItem}>
                  <Button
                    href="https://snowkap.com/"
                    className={classes.navLink}
                    color="transparent"
                    disableRipple
                  >
                    <Search/>
                  </Button>
                </ListItem>
              </List> */}
              </div>
              </React.Fragment>
            }
          />
        )
    }
}

export default withStyles(headersStyle)(NavigationNonLogin);