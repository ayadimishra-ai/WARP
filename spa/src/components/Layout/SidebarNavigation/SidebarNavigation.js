import React, { useEffect, useRef, useState, useMemo } from "react";
import styles from "./SidebarNavigation.css";
import { ClickAwayListener, IconButton, Tooltip } from "@material-ui/core";
import {
    Assignment, Ballot, Category, Description, Edit, ExpandLess, Gavel, HowToVote,
    LibraryBooks, ListAlt, NotificationImportant, Receipt, ShoppingCart, Storage, SupervisorAccount,
    VerifiedUser, Widgets
} from "@material-ui/icons";
import ReactDOM from 'react-dom';
import { Link } from 'react-router-dom';
import SideBarIcon from "../SideBarIcon";
import * as RoleCodes from "../../../rolecodes";
import { setLastNavigation } from "../../../utility";
import { FormTypesPage } from "../../../warp/warp.constant";
import { getWebsiteUrl } from "../../../config";

const awsUrl = getWebsiteUrl();

const SidebarNavigation = ({ SideMenu }) => {
    const [isIconMenuOpen, setisIconMenuOpen] = useState(false);
    const [hoveredItem, setHoveredItem] = useState(-1);
    const [activeMenu, setActiveMenu] = useState(-1);
    const [childActiveMenu, setChildActiveMenu] = useState(-1);
    const childMenuRef = useRef([]);
    const userType = useMemo(() => {
        const _userType = localStorage.getItem("userType");
        return _userType ? JSON.parse(_userType) : null;
    }, [localStorage.getItem("userType")]);

    useEffect(() => {
        if (userType && userType === RoleCodes.BUYER && SideMenu.length > 3) {
            setActiveMenu(4)
        } else {
            let url = window.location.href;
            const pageURL=url.split('/')[3]
            const hasCompanyId = pageURL.includes("companyid=");
            const hasFormInvitationId = pageURL.includes("&formInvitationId=");
            const hasAssessmentDetails = pageURL.includes("assessmentDetails");
            const hasAssessmentIntroDetails = pageURL.includes("AssessmentIntroDetails");
            if (hasCompanyId && hasFormInvitationId) {
                setActiveMenu(2)
            }
            else if (hasAssessmentDetails || hasAssessmentIntroDetails) {
                setActiveMenu(2)
            }else{
                setActiveMenu(1)
            }
        }
    }, [userType, SideMenu])

    const filterParentMenuWithChildren = (menuData) => {
        if (menuData && menuData.length > 0) {
            const parentMenus = menuData.filter(item => item.isParentMenu === 1);
            const result = parentMenus.map(parent => {
                const children = menuData.filter(child => {
                    if (child.parentPageGuid === parent.pageguid) {
                        if (child.url === FormTypesPage.Assessments) {
                            child.url = FormTypesPage.Assessments;
                        }
                        return true;
                    }
                    return false;
                });

                return {
                    ...parent, children
                };
            });
            return result;
        }
        return []
    }
    const SideMenuItems = [
        {
            "menuType": "Icon",
            "menuDisplayOrder": 1,
            "iconName": "Menu",
            "priority": 3,
            "pageKey": "buyingwindow",
            "url": "",
            "resourceValue": "Menu",
            "roleName": "BUYER",
            "rn": 1,
            "isParentMenu": 1,
            "hasChild": 0,
            "parentPageGuid": null,
            "children": []
        },
        ...filterParentMenuWithChildren(SideMenu)]


    const handleMouseEnter = (index) => {
        setHoveredItem(index);
    };

    const handleMouseLeave = () => {
        setHoveredItem(-1);
    };
    const handleClickAway = () => {
        if (isIconMenuOpen) {
            setisIconMenuOpen(false);
        }
    };
    const renderBackdropDiv = () => {
        if (isIconMenuOpen) {
            return ReactDOM.createPortal(
                <div
                    id="backdrop_sidebarMenu"
                    onClick={handleClickAway}
                    style={{
                        position: 'fixed',
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        top: 0,
                        left: 0
                    }}
                >
                </div>,
                document.getElementsByClassName('Header-container')[0] // You can render it anywhere in the DOM, here it will be added to the body
            );
        }
        return null;
    };

    const navActiveMenuHandler = (index, childMenuLength) => {
        if (isIconMenuOpen && childMenuLength !== 0) {
            setisIconMenuOpen(false)
        };

        setActiveMenu(index !== 0 ? index : activeMenu);
        setHoveredItem(index);
        setisIconMenuOpen(index === 0 ? (prevState) => !prevState : false);

        if (childMenuRef.current[index]) {
            childMenuRef.current[index].style.display = "none"; // Hide the div directly
        }
    };


    let path = window.location.href.replace(window.location.origin + "/", "");

    SideMenuItems.map((item, index) => {
        if (path === item.url) {
            if (activeMenu !== index) {
                setActiveMenu(index);
            }

        }
        item.children.map((child, i) => {
            if (path === child.url) {
                if (childActiveMenu !== i || activeMenu !== index) {
                    setActiveMenu(index);
                    setChildActiveMenu(i);
                }
            }
            return null;
        })
        return null;
    })

    const handleChildItemClick = (index, i) => {
        navActiveMenuHandler(i);
        setisIconMenuOpen(false)
        if (childMenuRef.current[index]) {
            childMenuRef.current[index].style.display = "none"; // Hide the div directly
            setTimeout(() => {
                childMenuRef.current[index].style.display = "";
            }, [10])
        }
    }


    return (
        <div
            className={`${isIconMenuOpen ? styles.new_sidebar_opened : styles.new_sidebar_closed} ${styles.new_sidebar}`}
        >
            {renderBackdropDiv()}
            <div className={styles.mini_sidebar_icon}>
                <div className={styles.logo}>
                    <Link onClick={() => setisIconMenuOpen(false)} to="/home">
                        {isIconMenuOpen ? (
                            <img src={awsUrl + "CompanyLogo.svg"} alt="Logo" />
                        ) : (
                            <img
                                src={awsUrl + "CompanySymbol.svg"}
                                alt="Logo"
                                border="0"
                            />
                        )}
                    </Link>
                </div>
                <ul className={`${isIconMenuOpen ? styles.slidebaropen : styles.slidebarclose}`}>
                    {
                        SideMenuItems.length > 0 ?
                            SideMenuItems.map((item, index) => {
                                const isChatAI = item.iconName === "ChatWithSnowkapAI";
                                const chatClass = isChatAI ? styles.chatWithSnowkapAI : "";
                                return (
                                <li
                                    key={index}
                                    className={`${index === 0 ? "nonActiveList" : "activeList"}`}
                                    onMouseEnter={() => {
                                        setHoveredItem(index);
                                        if (childMenuRef.current[index]) {
                                            childMenuRef.current[index].style.display = "block"; // Hide the div directly
                                            childMenuRef.current[index].style.height = "100%"; // Hide the div directly
                                        }
                                    }}
                                    onMouseLeave={() => {
                                        setHoveredItem(-1)
                                        if (childMenuRef.current[index]) {
                                            childMenuRef.current[index].style.display = "none"; // Hide the div directly
                                        }
                                    }}
                                >
                                    <div
                                        onClick={(e) => navActiveMenuHandler(index, item.children.length, e)}
                                        className={`${activeMenu === index && activeMenu !== 0 ? styles.activeMenu : styles.nonActiveMenu} ${chatClass}`}>
                                        {
                                            item.children.length === 0 ?
                                                <>
                                                    <div className={styles.tooltipContainer}>
                                                        <Link
                                                        onClick={(e) => {
                                                            if (index === 0) e.preventDefault();
                                                            setLastNavigation('menu', window.location.pathname);
                                                        }}
                                                        className={styles.menuActiveLink}
                                                        to={`/${item.url || ""}`}
                                                        >
                                                        <IconButton disableRipple>
                                                            <SideBarIcon
                                                            icon={item.iconName}
                                                            isActive={hoveredItem === index || activeMenu === index}
                                                            />
                                                        </IconButton>
                                                        </Link>
                                                        {!isIconMenuOpen && hoveredItem === index && (
                                                            <div className={`${styles.customTooltip} ${chatClass}`}>
                                                                {item.resourceValue}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <Link onClick={(e) => index === 0 && e.preventDefault()} className={styles.menuLink} to={`/${item.url ? item.url : ""}`} >
                                                        <div className={styles.childMenuParent}>
                                                            <span className={styles.menu_Text}>
                                                                {item.resourceValue}
                                                            </span>
                                                        </div>
                                                    </Link>
                                                </>
                                                :
                                                <>
                                                    <Link className={styles.menuActiveLink} to={`/${item.children[0].url}`} >
                                                        <IconButton disableRipple>
                                                            <SideBarIcon icon={item.iconName} isActive={hoveredItem === index || activeMenu === index} />
                                                        </IconButton>
                                                        {/* Tooltip for closed sidebar */}
                                                        {!isIconMenuOpen && hoveredItem === index && (
                                                            <div className={styles.childMenuParent}>
                                                                <span className={styles.menu_Text}>
                                                                    {item.resourceValue}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </Link>
                                                    <div className={styles.childMenuParent}>
                                                        <Link className={styles.menuActiveLink} to={`/${item.children[0].url}`} >
                                                            <span className={styles.menu_Text}>
                                                                {item.resourceValue}
                                                                <ExpandLess />
                                                            </span>
                                                        </Link>
                                                        <div ref={(el) => (childMenuRef.current[index] = el)} className={styles.child_menu}>
                                                            {item.children.map((child, i) => (
                                                                <Link className={childActiveMenu === i && activeMenu === index ? styles.childActiveMenu : ''} onClick={() => handleChildItemClick(index, i)} to={`/${child.url}`} color="inherit" key={i}>
                                                                    {child.resourceValue}
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </>
                                        }
                                    </div>
                                </li>
                                );
                            })
                            : ""
                    }
                </ul>
            </div>
        </div>
    );
};

export default SidebarNavigation;
