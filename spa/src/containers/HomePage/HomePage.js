import React from "react";
import withStyles from "@material-ui/core/styles/withStyles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import { Link } from "react-router-dom";

// @material-ui/icons
import Search from "@material-ui/icons/Search";
import Header from "../../components/Below2/Header.jsx"
import GridContainer from "../../components/Material/Grid/GridContainer.jsx";
import GridItem from "../../components/Material/Grid/GridItem.jsx";
import Button from "../../UI/Button/MaterialButton";
import Card from "../../components/Material/Card/Card.jsx";
import CardBody from "../../components/Material/Card/CardBody.jsx";
import CustomInput from "../../components/Material/CustomInput/CustomInput.jsx";
import office2 from "../../assets/img/homepage_bg.jpg"
import headersStyle from "../../assets/jss/material-kit-pro-react/views/sectionsSections/headersStyle.jsx";
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import below2_logo from '../../assets/img/whiteLogo.png'
import tabsStyle from "../../assets/jss/material-kit-pro-react/views/componentsSections/tabsStyle.jsx";
import CustomDropdown from "../../components/Material/CustomDropdown/CustomDropdown";
import shop_fees from "../../assets/img/shop_fees.png"
import discount from "../../assets/img/discount.png"
import verified_supp from "../../assets/img/verified_supp.png"
import world from "../../assets/img/world.png"
import history from "../../history";
import * as actionCreators from "../../store/actions/index";
import { connect } from "react-redux";
import * as RoleCodes from "../../rolecodes";
import Spinner from '../../UI/Spinner/Spinner';
class HomePage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            Svalue: '',
            name: 'hai',
            labelWidth: 0,
            tab1: true,
            tab2: false,
            checkRoute: false,
        }
        this.logoutHandler = this.logoutHandler.bind(this);

    }
    componentDidMount() {
        if (localStorage.userType == 'null') {
            this.setState({ checkRoute: true })
        }
        if (localStorage.userType == 'autolog') {
            this.setState({ checkRoute: false })
        }
        else {
            if( localStorage.getItem("userType") !== null ) {
                if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIER) {
                    this.props.history.push("/edit-profile")
                }
                else if (JSON.parse(localStorage.userType) === RoleCodes.STRATEGICUSER || this.props.userType === "APPROVER~STRATEGICUSER~BUYER" || this.props.userType === "APPROVER~BUYER") {
                    this.props.history.push("/home")
                } else if (JSON.parse(localStorage.userType) === RoleCodes.BUYER) {
                    this.props.history.push("/shop")
                } else if (JSON.parse(localStorage.userType) === RoleCodes.ADMIN || JSON.parse(localStorage.userType) === RoleCodes.APPROVER) {
                    this.props.history.push("/listing-page")
                } else if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIERRELATIONSHIPMANAGER || JSON.parse(localStorage.userType) === RoleCodes.SUPPLIERSUPPORTPERSON) {
                    this.props.history.push("/SupplierOnBoardManagement#/add_supplier_form/listing")
                }
            }
            else {
                this.setState({ checkRoute: true })
            }
        }
    }
    handleChange = event => {
        this.setState({ [event.target.name]: event.target.value });
    };
    tabClick1 = () => {
        this.setState({ tab1: true })
        this.setState({ tab2: false })
    }
    tabClick2 = () => {
        this.setState({ tab1: false })
        this.setState({ tab2: true })
    }

    logoutHandler() {
        this.props.onAuthLogout();
        history.push("/");
    }

    render() {
        const { classes, ...rest } = this.props;
        if (this.state.checkRoute) {
            return (
                <React.Fragment>
                    <div className="below2_homepage">
                        <Header
                            brand=""
                            fixed
                            color="transparent"
                            changeColorOnScroll={{
                                height: 70,
                                color: "below2"
                            }}
                            links={
                                <div className={classes.collapse + ' ' + 'header_bar'}>
                                    <List className={classes.list + " " + ''}>
                                        <ListItem className={classes.listItem}>
                                            <Button
                                                href="#pablo"
                                                className={classes.navLink}
                                                onClick={e => e.preventDefault()}
                                                color="transparent"
                                            >
                                                Discover
                                    </Button>
                                        </ListItem>
                                        <ListItem className={classes.listItem}>
                                            <Button
                                                href="#pablo"
                                                className={classes.navLink}
                                                onClick={e => e.preventDefault()}
                                                color="transparent"
                                            >
                                                Insights
                                    </Button>
                                        </ListItem>
                                        <ListItem className={classes.listItem}>
                                            <Button
                                                href="#pablo"
                                                className={classes.navLink}
                                                onClick={e => e.preventDefault()}
                                                color="transparent"
                                            >
                                                Marketing Tool
                                    </Button>
                                        </ListItem>
                                    </List>
                                    <List className={classes.list + ' ' + 'center_nav'}>
                                        <ListItem className={classes.listItem}>
                                            <p>Deliver to</p>
                                            <FormControl className={''}>
                                                <Select
                                                    value={this.state.Svalue}
                                                    onChange={this.handleChange}
                                                    displayEmpty
                                                    name="age"
                                                    className={'header_select'}
                                                >
                                                    <MenuItem className="" value="">
                                                        USA
                                            </MenuItem>
                                                    <MenuItem value={20}>INDIA</MenuItem>
                                                    <MenuItem value={30}>CANADA</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </ListItem>
                                        <ListItem className={classes.listItem}>
                                            <p>Currency</p>
                                            <FormControl className={''}>
                                                <Select
                                                    value={this.state.Svalue}
                                                    onChange={this.handleChange}
                                                    displayEmpty
                                                    name="age"
                                                    className={'header_select'}
                                                >
                                                    <MenuItem className="" value="">
                                                        USD
                                            </MenuItem>
                                                    {/* <MenuItem value={20}>$</MenuItem>
                                                <MenuItem value={30}>POUND</MenuItem> */}
                                                </Select>
                                            </FormControl>
                                        </ListItem>
                                    </List>
                                    <List className={classes.list}>
                                        <ListItem className={classes.listItem}>
                                            <Button
                                                color="transparent"
                                                href=""
                                                target="_blank"
                                                className={`${classes.navLink} ${classes.navLinkJustIcon}`}
                                            >
                                                About
                                    </Button>
                                        </ListItem>
                                        <ListItem className={classes.listItem}>
                                            <Button
                                                color="transparent"
                                                href=""
                                                target="_blank"
                                                className={`${classes.navLink} ${classes.navLinkJustIcon}`}
                                            >
                                                Resources
                                    </Button>
                                        </ListItem>
                                        <ListItem className={classes.listItem}>
                                            <Button
                                                color="transparent"
                                                href=""
                                                target="_blank"
                                                className={`${classes.navLink} ${classes.navLinkJustIcon}`}
                                            >
                                                Sell
                                    </Button>
                                        </ListItem>
                                        <ListItem className={classes.listItem}>
                                            <Button
                                                color="transparent"
                                                href=""
                                                target="_blank"
                                                className={`${classes.navLink} ${classes.navLinkJustIcon}`}
                                            >
                                                Contact
                                    </Button>
                                        </ListItem>
                                        <ListItem id="loginas" className={classes.listItem}>
                                            {localStorage.userId === undefined || localStorage.userId === null || localStorage.userId === 'null' ? <React.Fragment><CustomDropdown
                                                noLiPadding
                                                hoverColor="dark"
                                                buttonText={
                                                    'Sign In'
                                                }
                                                buttonProps={{
                                                    className:
                                                        classes.navLink + ' login_dropdown',
                                                    color: "transparent"
                                                }}
                                                dropdownList={[
                                                    <Link to="/supplierlogin" className={classes.dropdownLink}>
                                                        As Supplier
                                                </Link>,
                                                    <Link
                                                        to="/login"
                                                        className={classes.dropdownLink}
                                                    >
                                                        As Buyer
                                                </Link>,
                                                    <Link to="/snowkapteamlogin" className={classes.dropdownLink}>
                                                        As Support
                                                </Link>,
                                                ]}
                                            />
                                            </React.Fragment>
                                                : <React.Fragment>
                                                    <Button
                                                        color="transparent"
                                                        href=""
                                                        target="_blank"
                                                        className={`${classes.navLink} ${classes.navLinkJustIcon}`}
                                                        onClick={this.logoutHandler}
                                                    >
                                                        Sign Out</Button>
                                                </React.Fragment>}
                                        </ListItem>
                                    </List>
                                </div>
                            }
                        />
                        <div
                            className={classes.pageHeader + ' ' + 'banner_container'}
                            style={{ backgroundImage: `url("${office2}")` }}
                        >
                            <div className={classes.conatinerHeader2 + ' ' + 'banner_text_content'}>
                                <GridContainer>
                                    <GridItem
                                        xs={11}
                                        sm={12}
                                        md={8}
                                        className={'banner_text'}
                                    >
                                        <img alt=" " src={below2_logo} />
                                        <p>Enabling businesses to grow sustainably</p>
                                        <h4>Marketplace for Sustainable B2B Commerce. <br />Find Buyers, Suppliers, Products and Collaborate. </h4>
                                    </GridItem>
                                    <GridItem
                                        xs={11}
                                        sm={11}
                                        md={7}
                                        className={'search_form'}
                                    >
                                        <Card raised className={classes.card}>
                                            <CardBody formHorizontal>
                                                <form>
                                                    <ul>
                                                        <li>
                                                            <FormControl className={''}>
                                                                <Select
                                                                    value={this.state.Svalue}
                                                                    onChange={this.handleChange}
                                                                    displayEmpty
                                                                    name="age"
                                                                    className={'search_select'}
                                                                >
                                                                    <MenuItem className="" value="">
                                                                        Bags
                                                            </MenuItem>
                                                                    <MenuItem value={20}> Clothing & Apparel</MenuItem>
                                                                    <MenuItem value={30}>Furniture</MenuItem>
                                                                    <MenuItem value={40}>Packaging</MenuItem>
                                                                    <MenuItem value={50}>Office Essentials</MenuItem>
                                                                </Select>
                                                            </FormControl>
                                                        </li>
                                                        <li>
                                                            <FormControl className={''}>
                                                                <Select
                                                                    value={this.state.Svalue}
                                                                    onChange={this.handleChange}
                                                                    displayEmpty
                                                                    name="age"
                                                                    className={'search_select'}
                                                                >
                                                                    <MenuItem className="" value="">
                                                                        GOTS
                                                            </MenuItem>
                                                                    <MenuItem value={20}>OCS</MenuItem>
                                                                    <MenuItem value={30}>ISOT</MenuItem>
                                                                    <MenuItem value={40}>FSC</MenuItem>
                                                                    <MenuItem value={50}>PEFC</MenuItem>
                                                                    <MenuItem value={60}>Fairtrade International</MenuItem>
                                                                    <MenuItem value={70}>OEKO-TEX Standard 100</MenuItem>
                                                                    <MenuItem value={80}>GRS</MenuItem>
                                                                    <MenuItem value={90}>ISO 14001</MenuItem>
                                                                    <MenuItem value={100}> ISO 50001</MenuItem>
                                                                    <MenuItem value={110}> ISO 45001</MenuItem>
                                                                    <MenuItem value={120}> ISO 9001</MenuItem>
                                                                </Select>
                                                            </FormControl>
                                                        </li>
                                                        <li>
                                                            <div>
                                                                <CustomInput
                                                                    inputProps={{
                                                                        placeholder: "Brand, Company, Product"
                                                                    }}
                                                                    formControlProps={{
                                                                        fullWidth: true,
                                                                        className: 'search_input'
                                                                    }}
                                                                />
                                                                <span className="search_submit"><Search /></span>
                                                            </div>
                                                        </li>
                                                    </ul>
                                                </form>
                                                <p className="sign_up">New to Snowkap? <Link to="/login">Join Free for Full Access</Link></p>
                                            </CardBody>
                                        </Card>
                                    </GridItem>
                                </GridContainer>
                            </div>
                        </div>
                        <div className="welcome_container">
                            <GridContainer>
                                <GridItem className="welcome_cont_items" sm={6} md={4}>
                                    <div>
                                        <h2>
                                            Welcome to <span>Snowkap.</span> Cleaning up the <br />Planet one bag <br />at a time.
                                </h2>
                                    </div>
                                </GridItem>
                                <GridItem className="welcome_cont_items" sm={6} md={4}>
                                    <div>
                                        <h3>Why <span>Snowkap?</span></h3>
                                        <p>Our planet already has excellent sources of clean energy. After years of engineering, we have figured out a way to use them in harmony with nature and communities. We can power up the entire world with unlimited and affordable green energy. We know how to make an impact that matters.</p>
                                        <p>Learn More</p>
                                    </div>
                                </GridItem>
                                <GridItem className="welcome_cont_items" sm={12} md={4}>
                                    <div>
                                        <h3>Discover <span>Snowkap?</span></h3>
                                        <ul className="discover_below2">
                                            <li><img alt=" " src={discount} /><p>Deals & Promotion</p></li>
                                            <li><img alt=" " src={world} /><p>Shop in 60 countries</p></li>
                                            <li><img alt=" " src={shop_fees} /><p>Estimated Import Fees</p></li>
                                            <li><img alt=" " src={verified_supp} /><p>Verified Sustainable Suppliers</p></li>
                                        </ul>
                                    </div>
                                </GridItem>
                            </GridContainer>
                        </div>
                        <div className="features_container">
                            <GridContainer>
                                <GridItem className="features_container_items" sm={6} md={3}>
                                    <div className="">
                                        <h6>Sign in for your best Experience
                            <Button>Get Started</Button>
                                        </h6>
                                        <h6>Find out <br /> where you stannd</h6>
                                    </div>
                                </GridItem>
                                <GridItem className="features_container_items" sm={6} md={3}>
                                    <div className="">
                                        <h5>Bags</h5>
                                        <h5>214 Certified Sellers</h5>
                                        <p>Premium Quality Products Made for Snowkap</p>
                                    </div>
                                </GridItem>
                                <GridItem className="features_container_items" sm={6} md={3}>
                                    <div className="">
                                        <h5>Packaging</h5>
                                        <h5>175 Certified Sellers</h5>
                                        <p>Premium Quality Products Made for Snowkap</p>
                                    </div>
                                </GridItem>
                                <GridItem className="features_container_items" sm={6} md={3}>
                                    <div className="">
                                        <h5>Apparel</h5>
                                        <h5>163 Certified Sellers</h5>
                                        <p>Premium Quality Products Made for Snowkap</p>
                                    </div>
                                </GridItem>
                            </GridContainer>
                        </div>
                        <div className="info_container">
                            <GridContainer>
                                <GridItem md={6}>
                                    <div className="info_div buyers">
                                        <h5>For Buyers</h5>
                                        <p>For Procurement, CSR, EHS and Sustainability leaders in enterprises looking to monitor CSR in the Sustainable Procurement.</p>
                                        <p>Solve high program costs, get reliable indicators, and scale up globally.</p>
                                        <Button>Learn More</Button>
                                    </div>
                                </GridItem>
                                <GridItem md={6}>
                                    <div className="info_div sellers">
                                        <h5>For Suppliers</h5>
                                        <p> Answering to a CSR assessment request. Benchmark and build your sustainability story and differentiate your company.</p>
                                        <p> Avoid redundant questionnaires, get a shareable scorecard with benchmarks & feedback to improve.</p>
                                        <Button>Learn More</Button>
                                    </div>
                                </GridItem>
                            </GridContainer>
                        </div>
                        {/* <div className="sustainable_info">
                        <div className="sustainable_tabs">
                            <div className="sustainable_heading">
                                <span className={this.state.tab1 ? 'selected_tab' : ''} onClick={this.tabClick1}>Sustainable Sellers</span>
                                <span className={this.state.tab2 ? 'selected_tab' : ''} onClick={this.tabClick2}>Sustainable Products</span>
                            </div>
                            <div className="sustainable_content">
                                {this.state.tab1 ? <div className="tab1">
                                    <GridContainer>
                                        <GridItem md={3}>
                                            <h5>Apparel</h5>
                                            <p>Apparel Aquarelle India Pvt Ltd.</p> <p>Bimba Textile Studio.</p> <p>Bombay Rayon Pvt. Ltd.</p> <p>Creative Wear Pvt. Ltd.</p> <p>Hema Silks Pvt Ltd.</p> <p>view all 205 certified companies</p>
                                        </GridItem>
                                        <GridItem md={3}>
                                            <h5>Apparel</h5>
                                            <p>Apparel Aquarelle India Pvt Ltd.</p> <p>Bimba Textile Studio.</p> <p>Bombay Rayon Pvt. Ltd.</p> <p>Creative Wear Pvt. Ltd.</p> <p>Hema Silks Pvt Ltd.</p> <p>view all 205 certified companies</p>
                                        </GridItem>
                                        <GridItem md={3}>
                                            <h5>Apparel</h5>
                                            <p>Apparel Aquarelle India Pvt Ltd.</p> <p>Bimba Textile Studio.</p> <p>Bombay Rayon Pvt. Ltd.</p> <p>Creative Wear Pvt. Ltd.</p> <p>Hema Silks Pvt Ltd.</p> <p>view all 205 certified companies</p>
                                        </GridItem>
                                        <GridItem md={3}>
                                            <h5>Apparel</h5>
                                            <p>Apparel Aquarelle India Pvt Ltd.</p> <p>Bimba Textile Studio.</p> <p>Bombay Rayon Pvt. Ltd.</p> <p>Creative Wear Pvt. Ltd.</p> <p>Hema Silks Pvt Ltd.</p> <p>view all 205 certified companies</p>
                                        </GridItem>
                                    </GridContainer>
                                </div> : ''}
                                {this.state.tab2 ? <div className="tab2">
                                    <GridContainer>
                                        <GridItem md={3}>
                                            <h5>Apparel tab2</h5>
                                            <p>Apparel Aquarelle India Pvt Ltd.</p> <p>Bimba Textile Studio.</p> <p>Bombay Rayon Pvt. Ltd.</p> <p>Creative Wear Pvt. Ltd.</p> <p>Hema Silks Pvt Ltd.</p> <p>view all 205 certified companies</p>
                                        </GridItem>
                                    </GridContainer>
                                </div> : ''}
                            </div>
                        </div>
                    </div> */}
                        <div className="newsletter_container">
                            <div className="">
                                <span><img alt=" " src={below2_logo} /></span>
                                <span>Stay up to date on industry news and trends,<br /> product announcements and the latest innovations.</span>
                                <span>
                                    <CustomInput
                                        inputProps={{
                                            placeholder: "Email"
                                        }}
                                        formControlProps={{
                                            fullWidth: false,
                                            className: 'search_input'
                                        }}
                                    />
                                    <Button>SUBSCRIBE</Button>
                                </span>
                            </div>
                        </div>
                    </div>
                </React.Fragment>
            )
        }
        else {
            return  <Spinner />
        }
    }
}
const mapStateToProps = state => {
    return {
        userId: state.login.userId,
        userType: state.login.userType,
        permissions: state.login.permissions,
        cartCounter: state.basket.cartCounter,
        emailId: state.login.emailId,
        firstName: state.login.firstName,
        lastName: state.login.lastName,
        languageId: state.login.languageId,
        userInitial: state.login.userInitial,
        wishlistCounter: state.wishlist.wishlistCounter,
        buyingWindowCounter: state.buyingWindow.buyingWindowCounter
    };
};
const mapDispatchToProps = dispatch => {
    return {
        onAuthLogout: () => dispatch(actionCreators.logout())
    };
};

export default connect(
    mapStateToProps, mapDispatchToProps
)(withStyles(headersStyle, tabsStyle)(HomePage));
//export default withStyles(headersStyle, tabsStyle)(HomePage)