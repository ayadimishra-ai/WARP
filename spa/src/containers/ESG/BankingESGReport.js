import Popover from '@material-ui/core/Popover';
//import { ShowAnalytic } from '@yagnitechdev/analytic';
import axios from "axios";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import html2canvas from 'html2canvas';
import { jsPDF } from "jspdf";
import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import Export from "../../assets/img/export.png";
import predealEnvironment from "../../assets/img/predealEnv.png";
import predealGovernance from "../../assets/img/predealGovernance.png";
import predealSocial from "../../assets/img/predealSocial.png";
import GridContainer from "../../components/Material/Grid/GridContainer";
import GridItem from "../../components/Material/Grid/GridItem.jsx";
import { getCPanelURL, getServiceUrl, getUserPermision } from "../../config";
import * as PageKeys from "../../pagekeys";
import * as RoleCodes from "../../rolecodes";
import Spinner from '../../UI/Spinner/Spinner';
import { BreadCrumb } from '../../utility';

const cPanelUrl = getCPanelURL();
let IsVCUser = false;
let ShowOtherCompanyDetails = false;
class BankingESGReport extends Component {
    constructor(props) {
        super(props)
        this.state = {
            loader: true,
            graphData: { ThemeName: [], data: [], overAllGraphData: {} },
            preDealData: null,
            // preDealData: {
            //     "ThemeWiseScoresXAxis": {
            //         "ThemeList": [
            //             {
            //                 "ThemeName": "Code of conduct",
            //                 "CompanyList": [
            //                     {
            //                         "CompanyName": "10 club (Boxseat Ventures Pvt. Ltd.)",
            //                         "Score": 68
            //                     },
            //                     {
            //                         "CompanyName": "Welbring nutrition",
            //                         "Score": 69
            //                     },
            //                     {
            //                         "CompanyName": "Heavenly screate",
            //                         "Score": 21
            //                     },
            //                     {
            //                         "CompanyName": "Surfboat Solution Pvt Ltd",
            //                         "Score": 2
            //                     },
            //                     {
            //                         "CompanyName": "The Comfort Grid Technologies Pvt Ltd",
            //                         "Score": 75
            //                     },
            //                     {
            //                         "CompanyName": "Tatvartha Health Pvt. Ltd",
            //                         "Score": 5
            //                     }
            //                 ]
            //             },
            //             {
            //                 "ThemeName": "Supplier code of conduct",
            //                 "CompanyList": [
            //                     {
            //                         "CompanyName": "10 club (Boxseat Ventures Pvt. Ltd.)",
            //                         "Score": 42
            //                     },
            //                     {
            //                         "CompanyName": "Welbring nutrition",
            //                         "Score": 15
            //                     },
            //                     {
            //                         "CompanyName": "Heavenly screate",
            //                         "Score": 5
            //                     },
            //                     {
            //                         "CompanyName": "Surfboat Solution Pvt Ltd",
            //                         "Score": 18
            //                     },
            //                     {
            //                         "CompanyName": "The Comfort Grid Technologies Pvt Ltd",
            //                         "Score": 62
            //                     },
            //                     {
            //                         "CompanyName": "Tatvartha Health Pvt. Ltd",
            //                         "Score": 15
            //                     }
            //                 ]
            //             },
            //             {
            //                 "ThemeName": "certification",
            //                 "CompanyList": [
            //                     {
            //                         "CompanyName": "10 club (Boxseat Ventures Pvt. Ltd.)",
            //                         "Score": 0
            //                     },
            //                     {
            //                         "CompanyName": "Welbring nutrition",
            //                         "Score": 20
            //                     },
            //                     {
            //                         "CompanyName": "Heavenly screate",
            //                         "Score": 0
            //                     },
            //                     {
            //                         "CompanyName": "Surfboat Solution Pvt Ltd",
            //                         "Score": 100
            //                     },
            //                     {
            //                         "CompanyName": "The Comfort Grid Technologies Pvt Ltd",
            //                         "Score": 0
            //                     },
            //                     {
            //                         "CompanyName": "Tatvartha Health Pvt. Ltd",
            //                         "Score": 20
            //                     }
            //                 ]
            //             },
            //             {
            //                 "ThemeName": "Graviance Redressal Machanism",
            //                 "CompanyList": [
            //                     {
            //                         "CompanyName": "10 club (Boxseat Ventures Pvt. Ltd.)",
            //                         "Score": 65
            //                     },
            //                     {
            //                         "CompanyName": "Welbring nutrition",
            //                         "Score": 0
            //                     },
            //                     {
            //                         "CompanyName": "Heavenly screate",
            //                         "Score": 0
            //                     },
            //                     {
            //                         "CompanyName": "Surfboat Solution Pvt Ltd",
            //                         "Score": 0
            //                     },
            //                     {
            //                         "CompanyName": "The Comfort Grid Technologies Pvt Ltd",
            //                         "Score": 62
            //                     },
            //                     {
            //                         "CompanyName": "Tatvartha Health Pvt. Ltd",
            //                         "Score": 1
            //                     }
            //                 ]
            //             },
            //             {
            //                 "ThemeName": "Data privacy and cyber security",
            //                 "CompanyList": [
            //                     {
            //                         "CompanyName": "10 club (Boxseat Ventures Pvt. Ltd.)",
            //                         "Score": 19
            //                     },
            //                     {
            //                         "CompanyName": "Welbring nutrition",
            //                         "Score": 19
            //                     },
            //                     {
            //                         "CompanyName": "Heavenly screate",
            //                         "Score": 0
            //                     },
            //                     {
            //                         "CompanyName": "Surfboat Solution Pvt Ltd",
            //                         "Score": 42
            //                     },
            //                     {
            //                         "CompanyName": "The Comfort Grid Technologies Pvt Ltd",
            //                         "Score": 30
            //                     },
            //                     {
            //                         "CompanyName": "Tatvartha Health Pvt. Ltd",
            //                         "Score": 100
            //                     }
            //                 ]
            //             },
            //             {
            //                 "ThemeName": "Environmental policy and KPIs",
            //                 "CompanyList": [
            //                     {
            //                         "CompanyName": "10 club (Boxseat Ventures Pvt. Ltd.)",
            //                         "Score": 20
            //                     },
            //                     {
            //                         "CompanyName": "Welbring nutrition",
            //                         "Score": 0
            //                     },
            //                     {
            //                         "CompanyName": "Heavenly screate",
            //                         "Score": 0
            //                     },
            //                     {
            //                         "CompanyName": "Surfboat Solution Pvt Ltd",
            //                         "Score": 0
            //                     },
            //                     {
            //                         "CompanyName": "The Comfort Grid Technologies Pvt Ltd",
            //                         "Score": 59
            //                     },
            //                     {
            //                         "CompanyName": "Tatvartha Health Pvt. Ltd",
            //                         "Score": 10
            //                     }
            //                 ]
            //             },
            //             {
            //                 "ThemeName": "Water",
            //                 "CompanyList": [
            //                     {
            //                         "CompanyName": "10 club (Boxseat Ventures Pvt. Ltd.)",
            //                         "Score": 0
            //                     },
            //                     {
            //                         "CompanyName": "Welbring nutrition",
            //                         "Score": 0
            //                     },
            //                     {
            //                         "CompanyName": "Heavenly screate",
            //                         "Score": 0
            //                     },
            //                     {
            //                         "CompanyName": "Surfboat Solution Pvt Ltd",
            //                         "Score": 0
            //                     },
            //                     {
            //                         "CompanyName": "The Comfort Grid Technologies Pvt Ltd",
            //                         "Score": 0
            //                     },
            //                     {
            //                         "CompanyName": "Tatvartha Health Pvt. Ltd",
            //                         "Score": 0
            //                     }
            //                 ]
            //             },
            //             {
            //                 "ThemeName": "Waste",
            //                 "CompanyList": [
            //                     {
            //                         "CompanyName": "10 club (Boxseat Ventures Pvt. Ltd.)",
            //                         "Score": 0
            //                     },
            //                     {
            //                         "CompanyName": "Welbring nutrition",
            //                         "Score": 0
            //                     },
            //                     {
            //                         "CompanyName": "Heavenly screate",
            //                         "Score": 0
            //                     },
            //                     {
            //                         "CompanyName": "Surfboat Solution Pvt Ltd",
            //                         "Score": 0
            //                     },
            //                     {
            //                         "CompanyName": "The Comfort Grid Technologies Pvt Ltd",
            //                         "Score": 0
            //                     },
            //                     {
            //                         "CompanyName": "Tatvartha Health Pvt. Ltd",
            //                         "Score": 0
            //                     }
            //                 ]
            //             },
            //             {
            //                 "ThemeName": "Diversity and inclusion",
            //                 "CompanyList": [
            //                     {
            //                         "CompanyName": "10 club (Boxseat Ventures Pvt. Ltd.)",
            //                         "Score": 60
            //                     },
            //                     {
            //                         "CompanyName": "Welbring nutrition",
            //                         "Score": 58
            //                     },
            //                     {
            //                         "CompanyName": "Heavenly screate",
            //                         "Score": 19
            //                     },
            //                     {
            //                         "CompanyName": "Surfboat Solution Pvt Ltd",
            //                         "Score": 19
            //                     },
            //                     {
            //                         "CompanyName": "The Comfort Grid Technologies Pvt Ltd",
            //                         "Score": 27
            //                     },
            //                     {
            //                         "CompanyName": "Tatvartha Health Pvt. Ltd",
            //                         "Score": 0
            //                     }
            //                 ]
            //             },
            //             {
            //                 "ThemeName": "HR Policy",
            //                 "CompanyList": [
            //                     {
            //                         "CompanyName": "10 club (Boxseat Ventures Pvt. Ltd.)",
            //                         "Score": 18
            //                     },
            //                     {
            //                         "CompanyName": "Welbring nutrition",
            //                         "Score": 30
            //                     },
            //                     {
            //                         "CompanyName": "Heavenly screate",
            //                         "Score": 30
            //                     },
            //                     {
            //                         "CompanyName": "Surfboat Solution Pvt Ltd",
            //                         "Score": 30
            //                     },
            //                     {
            //                         "CompanyName": "The Comfort Grid Technologies Pvt Ltd",
            //                         "Score": 25
            //                     },
            //                     {
            //                         "CompanyName": "Tatvartha Health Pvt. Ltd",
            //                         "Score": 0
            //                     }
            //                 ]
            //             },
            //             {
            //                 "ThemeName": "POSH",
            //                 "CompanyList": [
            //                     {
            //                         "CompanyName": "10 club (Boxseat Ventures Pvt. Ltd.)",
            //                         "Score": 20
            //                     },
            //                     {
            //                         "CompanyName": "Welbring nutrition",
            //                         "Score": 38
            //                     },
            //                     {
            //                         "CompanyName": "Heavenly screate",
            //                         "Score": 38
            //                     },
            //                     {
            //                         "CompanyName": "Surfboat Solution Pvt Ltd",
            //                         "Score": 82
            //                     },
            //                     {
            //                         "CompanyName": "The Comfort Grid Technologies Pvt Ltd",
            //                         "Score": 27
            //                     },
            //                     {
            //                         "CompanyName": "Tatvartha Health Pvt. Ltd",
            //                         "Score": 0
            //                     }
            //                 ]
            //             },
            //             {
            //                 "ThemeName": "Social compliance",
            //                 "CompanyList": [
            //                     {
            //                         "CompanyName": "10 club (Boxseat Ventures Pvt. Ltd.)",
            //                         "Score": 100
            //                     },
            //                     {
            //                         "CompanyName": "Welbring nutrition",
            //                         "Score": 100
            //                     },
            //                     {
            //                         "CompanyName": "Heavenly screate",
            //                         "Score": 100
            //                     },
            //                     {
            //                         "CompanyName": "Surfboat Solution Pvt Ltd",
            //                         "Score": 100
            //                     },
            //                     {
            //                         "CompanyName": "The Comfort Grid Technologies Pvt Ltd",
            //                         "Score": 100
            //                     },
            //                     {
            //                         "CompanyName": "Tatvartha Health Pvt. Ltd",
            //                         "Score": 100
            //                     }
            //                 ]
            //             },
            //             {
            //                 "ThemeName": "H&S",
            //                 "CompanyList": [
            //                     {
            //                         "CompanyName": "10 club (Boxseat Ventures Pvt. Ltd.)",
            //                         "Score": 20
            //                     },
            //                     {
            //                         "CompanyName": "Welbring nutrition",
            //                         "Score": 20
            //                     },
            //                     {
            //                         "CompanyName": "Heavenly screate",
            //                         "Score": 0
            //                     },
            //                     {
            //                         "CompanyName": "Surfboat Solution Pvt Ltd",
            //                         "Score": 0
            //                     },
            //                     {
            //                         "CompanyName": "The Comfort Grid Technologies Pvt Ltd",
            //                         "Score": 19
            //                     },
            //                     {
            //                         "CompanyName": "Tatvartha Health Pvt. Ltd",
            //                         "Score": 0
            //                     }
            //                 ]
            //             }
            //         ]
            //     },
            //     "ESGMaturity": {
            //         "PortfolioList": [
            //             {
            //                 "Portfolio": "Environment",
            //                 "CompanyList": [
            //                     {
            //                         "CompanyName": "10 club (Boxseat Ventures Pvt. Ltd.)",
            //                         "Risk": "High",
            //                         "ThemeNames": [
            //                             "",
            //                             "",
            //                             ""
            //                         ]
            //                     },
            //                     {
            //                         "CompanyName": "Welbring nutrition",
            //                         "Risk": "Medium",
            //                         "ThemeNames": [
            //                             "",
            //                             "",
            //                             ""
            //                         ]
            //                     },
            //                     {
            //                         "CompanyName": "Heavenly screate",
            //                         "Risk": "High",
            //                         "ThemeNames": [
            //                             "",
            //                             "",
            //                             ""
            //                         ]
            //                     },
            //                     {
            //                         "CompanyName": "Surfboat Solution Pvt Ltd",
            //                         "Risk": "Low",
            //                         "ThemeNames": [
            //                             "",
            //                             "",
            //                             ""
            //                         ]
            //                     },
            //                     {
            //                         "CompanyName": "The Comfort Grid Technologies Pvt Ltd",
            //                         "Risk": "High",
            //                         "ThemeNames": [
            //                             "",
            //                             "",
            //                             ""
            //                         ]
            //                     },
            //                     {
            //                         "CompanyName": "Tatvartha Health Pvt. Ltd",
            //                         "Risk": "High",
            //                         "ThemeNames": [
            //                             "",
            //                             "",
            //                             ""
            //                         ]
            //                     }
            //                 ]
            //             },
            //             {
            //                 "Portfolio": "Governance",
            //                 "CompanyList": [
            //                     {
            //                         "CompanyName": "10 club (Boxseat Ventures Pvt. Ltd.)",
            //                         "Risk": "High",
            //                         "ThemeNames": [
            //                             "",
            //                             "",
            //                             ""
            //                         ]
            //                     },
            //                     {
            //                         "CompanyName": "Welbring nutrition",
            //                         "Risk": "Medium",
            //                         "ThemeNames": [
            //                             "",
            //                             "",
            //                             ""
            //                         ]
            //                     },
            //                     {
            //                         "CompanyName": "Heavenly screate",
            //                         "Risk": "High",
            //                         "ThemeNames": [
            //                             "",
            //                             "",
            //                             ""
            //                         ]
            //                     },
            //                     {
            //                         "CompanyName": "Surfboat Solution Pvt Ltd",
            //                         "Risk": "Medium",
            //                         "ThemeNames": [
            //                             "",
            //                             "",
            //                             ""
            //                         ]
            //                     },
            //                     {
            //                         "CompanyName": "The Comfort Grid Technologies Pvt Ltd",
            //                         "Risk": "High",
            //                         "ThemeNames": [
            //                             "",
            //                             "",
            //                             ""
            //                         ]
            //                     },
            //                     {
            //                         "CompanyName": "Tatvartha Health Pvt. Ltd",
            //                         "Risk": "High",
            //                         "ThemeNames": [
            //                             "",
            //                             "",
            //                             ""
            //                         ]
            //                     }
            //                 ]
            //             },
            //             {
            //                 "Portfolio": "Social",
            //                 "CompanyList": [
            //                     {
            //                         "CompanyName": "10 club (Boxseat Ventures Pvt. Ltd.)",
            //                         "Risk": "High",
            //                         "ThemeNames": [
            //                             "",
            //                             "",
            //                             ""
            //                         ]
            //                     },
            //                     {
            //                         "CompanyName": "Welbring nutrition",
            //                         "Risk": "Medium",
            //                         "ThemeNames": [
            //                             "",
            //                             "",
            //                             ""
            //                         ]
            //                     },
            //                     {
            //                         "CompanyName": "Heavenly screate",
            //                         "Risk": "High",
            //                         "ThemeNames": [
            //                             "",
            //                             "",
            //                             ""
            //                         ]
            //                     },
            //                     {
            //                         "CompanyName": "Surfboat Solution Pvt Ltd",
            //                         "Risk": "Low",
            //                         "ThemeNames": []
            //                     },
            //                     {
            //                         "CompanyName": "The Comfort Grid Technologies Pvt Ltd",
            //                         "Risk": "High",
            //                         "ThemeNames": [
            //                             "",
            //                             "",
            //                             ""
            //                         ]
            //                     },
            //                     {
            //                         "CompanyName": "Tatvartha Health Pvt. Ltd",
            //                         "Risk": "Low",
            //                         "ThemeNames": []
            //                     }
            //                 ]
            //             }
            //         ]
            //     },
            //     "ThemeWiseRiskRating": {
            //         "ThemeList": [
            //             {
            //                 "ThemeName": "Code of conduct",
            //                 "CompanyList": [
            //                     {
            //                         "CompanyName": "10 club (Boxseat Ventures Pvt. Ltd.)",
            //                         "Risk": "High"
            //                     },
            //                     {
            //                         "CompanyName": "Welbring nutrition",
            //                         "Risk": "Medium"
            //                     },
            //                     {
            //                         "CompanyName": "Heavenly screate",
            //                         "Risk": "High"
            //                     },
            //                     {
            //                         "CompanyName": "Surfboat Solution Pvt Ltd",
            //                         "Risk": "Low"
            //                     },
            //                     {
            //                         "CompanyName": "The Comfort Grid Technologies Pvt Ltd",
            //                         "Risk": "High"
            //                     },
            //                     {
            //                         "CompanyName": "Tatvartha Health Pvt. Ltd",
            //                         "Risk": "High"
            //                     }
            //                 ]
            //             },
            //             {
            //                 "ThemeName": "certification",
            //                 "CompanyList": [
            //                     {
            //                         "CompanyName": "10 club (Boxseat Ventures Pvt. Ltd.)",
            //                         "Risk": "High"
            //                     },
            //                     {
            //                         "CompanyName": "Welbring nutrition",
            //                         "Risk": "Medium"
            //                     },
            //                     {
            //                         "CompanyName": "Heavenly screate",
            //                         "Risk": "High"
            //                     },
            //                     {
            //                         "CompanyName": "Surfboat Solution Pvt Ltd",
            //                         "Risk": "Medium"
            //                     },
            //                     {
            //                         "CompanyName": "The Comfort Grid Technologies Pvt Ltd",
            //                         "Risk": "High"
            //                     },
            //                     {
            //                         "CompanyName": "Tatvartha Health Pvt. Ltd",
            //                         "Risk": "High"
            //                     }
            //                 ]
            //             },
            //             {
            //                 "ThemeName": "Graviance Redressal Machanism",
            //                 "CompanyList": [
            //                     {
            //                         "CompanyName": "10 club (Boxseat Ventures Pvt. Ltd.)",
            //                         "Risk": "High"
            //                     },
            //                     {
            //                         "CompanyName": "Welbring nutrition",
            //                         "Risk": "Medium"
            //                     },
            //                     {
            //                         "CompanyName": "Heavenly screate",
            //                         "Risk": "High"
            //                     },
            //                     {
            //                         "CompanyName": "Surfboat Solution Pvt Ltd",
            //                         "Risk": "Low"
            //                     },
            //                     {
            //                         "CompanyName": "The Comfort Grid Technologies Pvt Ltd",
            //                         "Risk": "High"
            //                     },
            //                     {
            //                         "CompanyName": "Tatvartha Health Pvt. Ltd",
            //                         "Risk": "Low"
            //                     }
            //                 ]
            //             },
            //             {
            //                 "ThemeName": "Data privacy and cyber security",
            //                 "CompanyList": [
            //                     {
            //                         "CompanyName": "10 club (Boxseat Ventures Pvt. Ltd.)",
            //                         "Risk": "High"
            //                     },
            //                     {
            //                         "CompanyName": "Welbring nutrition",
            //                         "Risk": "Medium"
            //                     },
            //                     {
            //                         "CompanyName": "Heavenly screate",
            //                         "Risk": "High"
            //                     },
            //                     {
            //                         "CompanyName": "Surfboat Solution Pvt Ltd",
            //                         "Risk": "Low"
            //                     },
            //                     {
            //                         "CompanyName": "The Comfort Grid Technologies Pvt Ltd",
            //                         "Risk": "High"
            //                     },
            //                     {
            //                         "CompanyName": "Tatvartha Health Pvt. Ltd",
            //                         "Risk": "Low"
            //                     }
            //                 ]
            //             },
            //             {
            //                 "ThemeName": "Data privacy and cyber security",
            //                 "CompanyList": [
            //                     {
            //                         "CompanyName": "10 club (Boxseat Ventures Pvt. Ltd.)",
            //                         "Risk": "High"
            //                     },
            //                     {
            //                         "CompanyName": "Welbring nutrition",
            //                         "Risk": "Medium"
            //                     },
            //                     {
            //                         "CompanyName": "Heavenly screate",
            //                         "Risk": "High"
            //                     },
            //                     {
            //                         "CompanyName": "Surfboat Solution Pvt Ltd",
            //                         "Risk": "Low"
            //                     },
            //                     {
            //                         "CompanyName": "The Comfort Grid Technologies Pvt Ltd",
            //                         "Risk": "High"
            //                     },
            //                     {
            //                         "CompanyName": "Tatvartha Health Pvt. Ltd",
            //                         "Risk": "Low"
            //                     }
            //                 ]
            //             },
            //             {
            //                 "ThemeName": "Environmental policy and KPIs",
            //                 "CompanyList": [
            //                     {
            //                         "CompanyName": "10 club (Boxseat Ventures Pvt. Ltd.)",
            //                         "Risk": "High"
            //                     },
            //                     {
            //                         "CompanyName": "Welbring nutrition",
            //                         "Risk": "Medium"
            //                     },
            //                     {
            //                         "CompanyName": "Heavenly screate",
            //                         "Risk": "High"
            //                     },
            //                     {
            //                         "CompanyName": "Surfboat Solution Pvt Ltd",
            //                         "Risk": "Low"
            //                     },
            //                     {
            //                         "CompanyName": "The Comfort Grid Technologies Pvt Ltd",
            //                         "Risk": "High"
            //                     },
            //                     {
            //                         "CompanyName": "Tatvartha Health Pvt. Ltd",
            //                         "Risk": "Low"
            //                     }
            //                 ]
            //             },
            //             {
            //                 "ThemeName": "Water",
            //                 "CompanyList": [
            //                     {
            //                         "CompanyName": "10 club (Boxseat Ventures Pvt. Ltd.)",
            //                         "Risk": "High"
            //                     },
            //                     {
            //                         "CompanyName": "Welbring nutrition",
            //                         "Risk": "Medium"
            //                     },
            //                     {
            //                         "CompanyName": "Heavenly screate",
            //                         "Risk": "High"
            //                     },
            //                     {
            //                         "CompanyName": "Surfboat Solution Pvt Ltd",
            //                         "Risk": "Low"
            //                     },
            //                     {
            //                         "CompanyName": "The Comfort Grid Technologies Pvt Ltd",
            //                         "Risk": "High"
            //                     },
            //                     {
            //                         "CompanyName": "Tatvartha Health Pvt. Ltd",
            //                         "Risk": "Low"
            //                     }
            //                 ]
            //             },
            //             {
            //                 "ThemeName": "Waste",
            //                 "CompanyList": [
            //                     {
            //                         "CompanyName": "10 club (Boxseat Ventures Pvt. Ltd.)",
            //                         "Risk": "High"
            //                     },
            //                     {
            //                         "CompanyName": "Welbring nutrition",
            //                         "Risk": "Medium"
            //                     },
            //                     {
            //                         "CompanyName": "Heavenly screate",
            //                         "Risk": "High"
            //                     },
            //                     {
            //                         "CompanyName": "Surfboat Solution Pvt Ltd",
            //                         "Risk": "Low"
            //                     },
            //                     {
            //                         "CompanyName": "The Comfort Grid Technologies Pvt Ltd",
            //                         "Risk": "High"
            //                     },
            //                     {
            //                         "CompanyName": "Tatvartha Health Pvt. Ltd",
            //                         "Risk": "Low"
            //                     }
            //                 ]
            //             },
            //             {
            //                 "ThemeName": "Diversity and inclusion",
            //                 "CompanyList": [
            //                     {
            //                         "CompanyName": "10 club (Boxseat Ventures Pvt. Ltd.)",
            //                         "Risk": "High"
            //                     },
            //                     {
            //                         "CompanyName": "Welbring nutrition",
            //                         "Risk": "Medium"
            //                     },
            //                     {
            //                         "CompanyName": "Heavenly screate",
            //                         "Risk": "High"
            //                     },
            //                     {
            //                         "CompanyName": "Surfboat Solution Pvt Ltd",
            //                         "Risk": "Low"
            //                     },
            //                     {
            //                         "CompanyName": "The Comfort Grid Technologies Pvt Ltd",
            //                         "Risk": "High"
            //                     },
            //                     {
            //                         "CompanyName": "Tatvartha Health Pvt. Ltd",
            //                         "Risk": "Low"
            //                     }
            //                 ]
            //             },
            //             {
            //                 "ThemeName": "HR Policy",
            //                 "CompanyList": [
            //                     {
            //                         "CompanyName": "10 club (Boxseat Ventures Pvt. Ltd.)",
            //                         "Risk": "High"
            //                     },
            //                     {
            //                         "CompanyName": "Welbring nutrition",
            //                         "Risk": "Medium"
            //                     },
            //                     {
            //                         "CompanyName": "Heavenly screate",
            //                         "Risk": "High"
            //                     },
            //                     {
            //                         "CompanyName": "Surfboat Solution Pvt Ltd",
            //                         "Risk": "Low"
            //                     },
            //                     {
            //                         "CompanyName": "The Comfort Grid Technologies Pvt Ltd",
            //                         "Risk": "High"
            //                     },
            //                     {
            //                         "CompanyName": "Tatvartha Health Pvt. Ltd",
            //                         "Risk": "Low"
            //                     }
            //                 ]
            //             },
            //             {
            //                 "ThemeName": "POSH",
            //                 "CompanyList": [
            //                     {
            //                         "CompanyName": "10 club (Boxseat Ventures Pvt. Ltd.)",
            //                         "Risk": "High"
            //                     },
            //                     {
            //                         "CompanyName": "Welbring nutrition",
            //                         "Risk": "Medium"
            //                     },
            //                     {
            //                         "CompanyName": "Heavenly screate",
            //                         "Risk": "High"
            //                     },
            //                     {
            //                         "CompanyName": "Surfboat Solution Pvt Ltd",
            //                         "Risk": "Low"
            //                     },
            //                     {
            //                         "CompanyName": "The Comfort Grid Technologies Pvt Ltd",
            //                         "Risk": "High"
            //                     },
            //                     {
            //                         "CompanyName": "Tatvartha Health Pvt. Ltd",
            //                         "Risk": "Low"
            //                     }
            //                 ]
            //             },
            //             {
            //                 "ThemeName": "Social compliance",
            //                 "CompanyList": [
            //                     {
            //                         "CompanyName": "10 club (Boxseat Ventures Pvt. Ltd.)",
            //                         "Risk": "High"
            //                     },
            //                     {
            //                         "CompanyName": "Welbring nutrition",
            //                         "Risk": "Medium"
            //                     },
            //                     {
            //                         "CompanyName": "Heavenly screate",
            //                         "Risk": "High"
            //                     },
            //                     {
            //                         "CompanyName": "Surfboat Solution Pvt Ltd",
            //                         "Risk": "Low"
            //                     },
            //                     {
            //                         "CompanyName": "The Comfort Grid Technologies Pvt Ltd",
            //                         "Risk": "High"
            //                     },
            //                     {
            //                         "CompanyName": "Tatvartha Health Pvt. Ltd",
            //                         "Risk": "Low"
            //                     }
            //                 ]
            //             },
            //             {
            //                 "ThemeName": "H&S",
            //                 "CompanyList": [
            //                     {
            //                         "CompanyName": "10 club (Boxseat Ventures Pvt. Ltd.)",
            //                         "Risk": "High"
            //                     },
            //                     {
            //                         "CompanyName": "Welbring nutrition",
            //                         "Risk": "Medium"
            //                     },
            //                     {
            //                         "CompanyName": "Heavenly screate",
            //                         "Risk": "High"
            //                     },
            //                     {
            //                         "CompanyName": "Surfboat Solution Pvt Ltd",
            //                         "Risk": "Low"
            //                     },
            //                     {
            //                         "CompanyName": "The Comfort Grid Technologies Pvt Ltd",
            //                         "Risk": "High"
            //                     },
            //                     {
            //                         "CompanyName": "Tatvartha Health Pvt. Ltd",
            //                         "Risk": "Low"
            //                     }
            //                 ]
            //             }
            //         ]
            //     },
            //     "PerformanceOnKPIs": {
            //         "Parameters": [
            //             {
            //                 "Parameter": "% Female employee (Permanent)",
            //                 "CompanyList": [
            //                     {
            //                         "CompanyName": "10 club (Boxseat Ventures Pvt. Ltd.)",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Welbring nutrition",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Heavenly screate",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Surfboat Solution Pvt Ltd",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "The Comfort Grid Technologies Pvt Ltd",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Tatvartha Health Pvt. Ltd",
            //                         "Value": "34"
            //                     }
            //                 ]
            //             },
            //             {
            //                 "Parameter": "% Female employee (Contratual)",
            //                 "CompanyList": [
            //                     {
            //                         "CompanyName": "10 club (Boxseat Ventures Pvt. Ltd.)",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Welbring nutrition",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Heavenly screate",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Surfboat Solution Pvt Ltd",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "The Comfort Grid Technologies Pvt Ltd",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Tatvartha Health Pvt. Ltd",
            //                         "Value": "34"
            //                     }
            //                 ]
            //             },
            //             {
            //                 "Parameter": "% Female employee (Total)",
            //                 "CompanyList": [
            //                     {
            //                         "CompanyName": "10 club (Boxseat Ventures Pvt. Ltd.)",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Welbring nutrition",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Heavenly screate",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Surfboat Solution Pvt Ltd",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "The Comfort Grid Technologies Pvt Ltd",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Tatvartha Health Pvt. Ltd",
            //                         "Value": "34"
            //                     }
            //                 ]
            //             },
            //             {
            //                 "Parameter": "% Female in leadership position",
            //                 "CompanyList": [
            //                     {
            //                         "CompanyName": "10 club (Boxseat Ventures Pvt. Ltd.)",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Welbring nutrition",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Heavenly screate",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Surfboat Solution Pvt Ltd",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "The Comfort Grid Technologies Pvt Ltd",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Tatvartha Health Pvt. Ltd",
            //                         "Value": "42.86"
            //                     }
            //                 ]
            //             },
            //             {
            //                 "Parameter": "% Female in turnover/Attrition",
            //                 "CompanyList": [
            //                     {
            //                         "CompanyName": "10 club (Boxseat Ventures Pvt. Ltd.)",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Welbring nutrition",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Heavenly screate",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Surfboat Solution Pvt Ltd",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "The Comfort Grid Technologies Pvt Ltd",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Tatvartha Health Pvt. Ltd",
            //                         "Value": "63.8"
            //                     }
            //                 ]
            //             }
            //         ]
            //     },
            //     "KeyDataPoints": {
            //         "Parameters": [
            //             {
            //                 "Parameter": "Leadership Position",
            //                 "CompanyList": [
            //                     {
            //                         "CompanyName": "10 club (Boxseat Ventures Pvt. Ltd.)",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Welbring nutrition",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Heavenly screate",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Surfboat Solution Pvt Ltd",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "The Comfort Grid Technologies Pvt Ltd",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Tatvartha Health Pvt. Ltd",
            //                         "Value": "7"
            //                     }
            //                 ]
            //             },
            //             {
            //                 "Parameter": "# Women in leadership position",
            //                 "CompanyList": [
            //                     {
            //                         "CompanyName": "10 club (Boxseat Ventures Pvt. Ltd.)",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Welbring nutrition",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Heavenly screate",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Surfboat Solution Pvt Ltd",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "The Comfort Grid Technologies Pvt Ltd",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Tatvartha Health Pvt. Ltd",
            //                         "Value": "3"
            //                     }
            //                 ]
            //             },
            //             {
            //                 "Parameter": "% of Revenue spent in CSR",
            //                 "CompanyList": [
            //                     {
            //                         "CompanyName": "10 club (Boxseat Ventures Pvt. Ltd.)",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Welbring nutrition",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Heavenly screate",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Surfboat Solution Pvt Ltd",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "The Comfort Grid Technologies Pvt Ltd",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Tatvartha Health Pvt. Ltd",
            //                         "Value": "0"
            //                     }
            //                 ]
            //             },
            //             {
            //                 "Parameter": "Total employees",
            //                 "CompanyList": [
            //                     {
            //                         "CompanyName": "10 club (Boxseat Ventures Pvt. Ltd.)",
            //                         "Value": "1-10"
            //                     },
            //                     {
            //                         "CompanyName": "Welbring nutrition",
            //                         "Value": "11-50"
            //                     },
            //                     {
            //                         "CompanyName": "Heavenly screate",
            //                         "Value": "11-50"
            //                     },
            //                     {
            //                         "CompanyName": "Surfboat Solution Pvt Ltd",
            //                         "Value": "51-100"
            //                     },
            //                     {
            //                         "CompanyName": "The Comfort Grid Technologies Pvt Ltd",
            //                         "Value": "51-100"
            //                     },
            //                     {
            //                         "CompanyName": "Tatvartha Health Pvt. Ltd",
            //                         "Value": "47"
            //                     }
            //                 ]
            //             },
            //             {
            //                 "Parameter": "Total female employees",
            //                 "CompanyList": [
            //                     {
            //                         "CompanyName": "10 club (Boxseat Ventures Pvt. Ltd.)",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Welbring nutrition",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Heavenly screate",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Surfboat Solution Pvt Ltd",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "The Comfort Grid Technologies Pvt Ltd",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Tatvartha Health Pvt. Ltd",
            //                         "Value": "16"
            //                     }
            //                 ]
            //             },
            //             {
            //                 "Parameter": "Total permanent employees",
            //                 "CompanyList": [
            //                     {
            //                         "CompanyName": "10 club (Boxseat Ventures Pvt. Ltd.)",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Welbring nutrition",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Heavenly screate",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Surfboat Solution Pvt Ltd",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "The Comfort Grid Technologies Pvt Ltd",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Tatvartha Health Pvt. Ltd",
            //                         "Value": "47"
            //                     }
            //                 ]
            //             },
            //             {
            //                 "Parameter": "Total female in permanent employees",
            //                 "CompanyList": [
            //                     {
            //                         "CompanyName": "10 club (Boxseat Ventures Pvt. Ltd.)",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Welbring nutrition",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Heavenly screate",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Surfboat Solution Pvt Ltd",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "The Comfort Grid Technologies Pvt Ltd",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Tatvartha Health Pvt. Ltd",
            //                         "Value": "16"
            //                     }
            //                 ]
            //             },
            //             {
            //                 "Parameter": "Total contratual employees",
            //                 "CompanyList": [
            //                     {
            //                         "CompanyName": "10 club (Boxseat Ventures Pvt. Ltd.)",
            //                         "Value": "1-10"
            //                     },
            //                     {
            //                         "CompanyName": "Welbring nutrition",
            //                         "Value": "1-10"
            //                     },
            //                     {
            //                         "CompanyName": "Heavenly screate",
            //                         "Value": "1-10"
            //                     },
            //                     {
            //                         "CompanyName": "Surfboat Solution Pvt Ltd",
            //                         "Value": "51-100"
            //                     },
            //                     {
            //                         "CompanyName": "The Comfort Grid Technologies Pvt Ltd",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Tatvartha Health Pvt. Ltd",
            //                         "Value": "0"
            //                     }
            //                 ]
            //             },
            //             {
            //                 "Parameter": "Total female in contratual employees",
            //                 "CompanyList": [
            //                     {
            //                         "CompanyName": "10 club (Boxseat Ventures Pvt. Ltd.)",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Welbring nutrition",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Heavenly screate",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Surfboat Solution Pvt Ltd",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "The Comfort Grid Technologies Pvt Ltd",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Tatvartha Health Pvt. Ltd",
            //                         "Value": "0"
            //                     }
            //                 ]
            //             },
            //             {
            //                 "Parameter": "Total women employees",
            //                 "CompanyList": [
            //                     {
            //                         "CompanyName": "10 club (Boxseat Ventures Pvt. Ltd.)",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Welbring nutrition",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Heavenly screate",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Surfboat Solution Pvt Ltd",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "The Comfort Grid Technologies Pvt Ltd",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Tatvartha Health Pvt. Ltd",
            //                         "Value": "16"
            //                     }
            //                 ]
            //             },
            //             {
            //                 "Parameter": "Total suppliers",
            //                 "CompanyList": [
            //                     {
            //                         "CompanyName": "10 club (Boxseat Ventures Pvt. Ltd.)",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Welbring nutrition",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Heavenly screate",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Surfboat Solution Pvt Ltd",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "The Comfort Grid Technologies Pvt Ltd",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Tatvartha Health Pvt. Ltd",
            //                         "Value": "3"
            //                     }
            //                 ]
            //             },
            //             {
            //                 "Parameter": "Total warehouses(owned)",
            //                 "CompanyList": [
            //                     {
            //                         "CompanyName": "10 club (Boxseat Ventures Pvt. Ltd.)",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Welbring nutrition",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Heavenly screate",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Surfboat Solution Pvt Ltd",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "The Comfort Grid Technologies Pvt Ltd",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Tatvartha Health Pvt. Ltd",
            //                         "Value": "1"
            //                     }
            //                 ]
            //             },
            //             {
            //                 "Parameter": "Total warehouses(owned+leased)",
            //                 "CompanyList": [
            //                     {
            //                         "CompanyName": "10 club (Boxseat Ventures Pvt. Ltd.)",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Welbring nutrition",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Heavenly screate",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Surfboat Solution Pvt Ltd",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "The Comfort Grid Technologies Pvt Ltd",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Tatvartha Health Pvt. Ltd",
            //                         "Value": "1"
            //                     }
            //                 ]
            //             },
            //             {
            //                 "Parameter": "Total factories(owned+outsourced)",
            //                 "CompanyList": [
            //                     {
            //                         "CompanyName": "10 club (Boxseat Ventures Pvt. Ltd.)",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Welbring nutrition",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Heavenly screate",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Surfboat Solution Pvt Ltd",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "The Comfort Grid Technologies Pvt Ltd",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Tatvartha Health Pvt. Ltd",
            //                         "Value": "3"
            //                     }
            //                 ]
            //             },
            //             {
            //                 "Parameter": "Total factories(owned)",
            //                 "CompanyList": [
            //                     {
            //                         "CompanyName": "10 club (Boxseat Ventures Pvt. Ltd.)",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Welbring nutrition",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Heavenly screate",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Surfboat Solution Pvt Ltd",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "The Comfort Grid Technologies Pvt Ltd",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Tatvartha Health Pvt. Ltd",
            //                         "Value": "0"
            //                     }
            //                 ]
            //             },
            //             {
            //                 "Parameter": "# employee left the org in last financial year",
            //                 "CompanyList": [
            //                     {
            //                         "CompanyName": "10 club (Boxseat Ventures Pvt. Ltd.)",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Welbring nutrition",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Heavenly screate",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Surfboat Solution Pvt Ltd",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "The Comfort Grid Technologies Pvt Ltd",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Tatvartha Health Pvt. Ltd",
            //                         "Value": "30"
            //                     }
            //                 ]
            //             },
            //             {
            //                 "Parameter": "# employee hired in last financial year",
            //                 "CompanyList": [
            //                     {
            //                         "CompanyName": "10 club (Boxseat Ventures Pvt. Ltd.)",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Welbring nutrition",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Heavenly screate",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Surfboat Solution Pvt Ltd",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "The Comfort Grid Technologies Pvt Ltd",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Tatvartha Health Pvt. Ltd",
            //                         "Value": "45"
            //                     }
            //                 ]
            //             },
            //             {
            //                 "Parameter": "# employees that are differenlty abled",
            //                 "CompanyList": [
            //                     {
            //                         "CompanyName": "10 club (Boxseat Ventures Pvt. Ltd.)",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Welbring nutrition",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Heavenly screate",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Surfboat Solution Pvt Ltd",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "The Comfort Grid Technologies Pvt Ltd",
            //                         "Value": "0"
            //                     },
            //                     {
            //                         "CompanyName": "Tatvartha Health Pvt. Ltd",
            //                         "Value": "0"
            //                     }
            //                 ]
            //             }
            //         ]
            //     },
            //     "PolicySummary": {
            //         "Parameters": [
            //             {
            //                 "Parameter": "Total polices",
            //                 "CompanyList": [
            //                     {
            //                         "CompanyName": "10 club (Boxseat Ventures Pvt. Ltd.)",
            //                         "Value": "9"
            //                     },
            //                     {
            //                         "CompanyName": "Welbring nutrition",
            //                         "Value": "9"
            //                     },
            //                     {
            //                         "CompanyName": "Heavenly screate",
            //                         "Value": "9"
            //                     },
            //                     {
            //                         "CompanyName": "Surfboat Solution Pvt Ltd",
            //                         "Value": "9"
            //                     },
            //                     {
            //                         "CompanyName": "The Comfort Grid Technologies Pvt Ltd",
            //                         "Value": "9"
            //                     },
            //                     {
            //                         "CompanyName": "Tatvartha Health Pvt. Ltd",
            //                         "Value": "9"
            //                     }
            //                 ]
            //             },
            //             {
            //                 "Parameter": "Existing polices",
            //                 "CompanyList": [
            //                     {
            //                         "CompanyName": "10 club (Boxseat Ventures Pvt. Ltd.)",
            //                         "Value": "1"
            //                     },
            //                     {
            //                         "CompanyName": "Welbring nutrition",
            //                         "Value": "4"
            //                     },
            //                     {
            //                         "CompanyName": "Heavenly screate",
            //                         "Value": "2"
            //                     },
            //                     {
            //                         "CompanyName": "Surfboat Solution Pvt Ltd",
            //                         "Value": "2"
            //                     },
            //                     {
            //                         "CompanyName": "The Comfort Grid Technologies Pvt Ltd",
            //                         "Value": "7"
            //                     },
            //                     {
            //                         "CompanyName": "Tatvartha Health Pvt. Ltd",
            //                         "Value": "0"
            //                     }
            //                 ]
            //             },
            //             {
            //                 "Parameter": "Policy WIP",
            //                 "CompanyList": [
            //                     {
            //                         "CompanyName": "10 club (Boxseat Ventures Pvt. Ltd.)",
            //                         "Value": "7"
            //                     },
            //                     {
            //                         "CompanyName": "Welbring nutrition",
            //                         "Value": "3"
            //                     },
            //                     {
            //                         "CompanyName": "Heavenly screate",
            //                         "Value": "1"
            //                     },
            //                     {
            //                         "CompanyName": "Surfboat Solution Pvt Ltd",
            //                         "Value": "3"
            //                     },
            //                     {
            //                         "CompanyName": "The Comfort Grid Technologies Pvt Ltd",
            //                         "Value": "1"
            //                     },
            //                     {
            //                         "CompanyName": "Tatvartha Health Pvt. Ltd",
            //                         "Value": "4"
            //                     }
            //                 ]
            //             }
            //         ]
            //     },
            //     "RecommendationList": [
            //         {
            //             "ThemeName": "Code of conduct",
            //             "CompanyName": "10 club (Boxseat Ventures Pvt. Ltd.)",
            //             "Recommendations": [
            //                 "Company should develop Code of Conduct within three months",
            //                 "Include Non-discrimination and anti-harassment policy in Code of Conduct",
            //                 "Incude Anti-bribery and Anti-corruption policy in Code of Conduct",
            //                 "Institute a whistleblowing mechanism/hotline",
            //                 "Include diversity and equal opportunit policy",
            //                 "Include anti-trust and anti-competititive practices",
            //                 "Include money laundering and insider trading policy",
            //                 "Include no child labour",
            //                 "Include data security and privacy policy",
            //                 "Include human rights aspect",
            //                 "Include EHS",
            //                 "Assign responsibility to senior leadership for implementing the Code of Conduct",
            //                 "Provide training on the Code of Conduct � Review the Code of Conduct annually",
            //                 "Wemeasure and monitor the implementation of the Code of Conduct"
            //             ]
            //         },
            //         {
            //             "ThemeName": "Code of conduct",
            //             "CompanyName": "Welbring nutrition",
            //             "Recommendations": [
            //                 "",
            //                 "",
            //                 ""
            //             ]
            //         },
            //         {
            //             "ThemeName": "Code of conduct",
            //             "CompanyName": "The Comfort Grid Technologies Pvt Ltd",
            //             "Recommendations": [
            //                 "",
            //                 "",
            //                 ""
            //             ]
            //         }
            //     ],
            //     "CurrentPractices": {
            //         "Parameters": [
            //             {
            //                 "Parameter": "Environment",
            //                 "CompanyList": [
            //                     {
            //                         "CompanyName": "10 club (Boxseat Ventures Pvt. Ltd.)",
            //                         "Value": [
            //                             "Company is in process of developing Environmental policy"
            //                         ]
            //                     },
            //                     {
            //                         "CompanyName": "Welbring nutrition",
            //                         "Value": []
            //                     },
            //                     {
            //                         "CompanyName": "Heavenly screate",
            //                         "Value": []
            //                     },
            //                     {
            //                         "CompanyName": "Surfboat Solution Pvt Ltd",
            //                         "Value": []
            //                     },
            //                     {
            //                         "CompanyName": "The Comfort Grid Technologies Pvt Ltd",
            //                         "Value": [
            //                             "Company has an Environmental policy"
            //                         ]
            //                     },
            //                     {
            //                         "CompanyName": "Tatvartha Health Pvt. Ltd",
            //                         "Value": []
            //                     }
            //                 ]
            //             },
            //             {
            //                 "Parameter": "Social",
            //                 "CompanyList": [
            //                     {
            //                         "CompanyName": "10 club (Boxseat Ventures Pvt. Ltd.)",
            //                         "Value": [
            //                             "Company has a Diversity and Inclusion policy.",
            //                             "Company is in process of developing a POSH policy.",
            //                             "Complying with Contract Labour (Regulation and Abolition), 1970.",
            //                             "Complying with minimum wages (Central) Rules, 1950.",
            //                             "Complying with Employees State Insurance Act, 1948.",
            //                             "Company is in process of developing a health and safety policy."
            //                         ]
            //                     },
            //                     {
            //                         "CompanyName": "Welbring nutrition",
            //                         "Value": [
            //                             "Company has a Diversity and Inclusion policy",
            //                             "Company has a HR policy",
            //                             "Company has a POSH policy",
            //                             "Complying with Contract Labout (Regulation and Aboition), 1970",
            //                             "Company is in process of developing a helath and safety policy."
            //                         ]
            //                     },
            //                     {
            //                         "CompanyName": "Heavenly screate",
            //                         "Value": [
            //                             "Company has a HR policy",
            //                             "Company has a POSH policy",
            //                             "Complying with Minimum Wages (Central) Rules. 1950",
            //                             "Complying with Employees State Insurance Act, 1948"
            //                         ]
            //                     },
            //                     {
            //                         "CompanyName": "Surfboat Solution Pvt Ltd",
            //                         "Value": [
            //                             "Company has a POSH policy",
            //                             "Complying with Employees State Insurance ACL 1948"
            //                         ]
            //                     },
            //                     {
            //                         "CompanyName": "The Comfort Grid Technologies Pvt Ltd",
            //                         "Value": [
            //                             "Company has a HR policy.",
            //                             "Company is in process of developing a POSH policy.",
            //                             "Complying with Contract Labour (Regulation and Abolition), 1970.",
            //                             "Complying with Minimum wages (Central) Rules, 1950.",
            //                             "Complying with Employees State Insurance Act, 1948."
            //                         ]
            //                     },
            //                     {
            //                         "CompanyName": "Tatvartha Health Pvt. Ltd",
            //                         "Value": [
            //                             "Company is in process of developing a Health and Safety policy.",
            //                             "Company is in process of developing a POSH policy.",
            //                             "Complying with Minimum wages (Central) Rules. 1950.",
            //                             "Complying with Employees State Insurance Act. 1948."
            //                         ]
            //                     }
            //                 ]
            //             },
            //             {
            //                 "Parameter": "Governance",
            //                 "CompanyList": [
            //                     {
            //                         "CompanyName": "10 club (Boxseat Ventures Pvt. Ltd.)",
            //                         "Value": [
            //                             "Company is in process of developing a code of conduct.",
            //                             "Company is in process of developing a Grievance Redressal Mechanism.",
            //                             "Company is in a process of developing a Data Protection policy.",
            //                             "Company is in process of developing a Supplier Code of Conduct."
            //                         ]
            //                     },
            //                     {
            //                         "CompanyName": "Welbring nutrition",
            //                         "Value": [
            //                             "Company has a code of conduct",
            //                             "Company is FSSAI (Packaging and Labelling) regulated",
            //                             "Company is in a process of developing a Data Protection policy.",
            //                             "Company is in process of developing a Supplier Code of Conduct"
            //                         ]
            //                     },
            //                     {
            //                         "CompanyName": "Heavenly screate",
            //                         "Value": [
            //                             "Company is in process of developing a code of conduct"
            //                         ]
            //                     },
            //                     {
            //                         "CompanyName": "Surfboat Solution Pvt Ltd",
            //                         "Value": [
            //                             "Company has a code of conduct",
            //                             "Company is FSSAI (Packaging and Labelling) regulated",
            //                             "Company is In process of developing a Grievance Redressal Mechanism",
            //                             "Company is in a process of developing a Data Protection policy.",
            //                             "Company is in process of developing a Supplier"
            //                         ]
            //                     },
            //                     {
            //                         "CompanyName": "The Comfort Grid Technologies Pvt Ltd",
            //                         "Value": [
            //                             "Company has a code of conduct",
            //                             "Company is in process of developing a Grievance Redressal Mechanism",
            //                             "Company is in a process of developing a Data Protection policy.",
            //                             "Company is in process of developing a Supplier Code of Conduct"
            //                         ]
            //                     },
            //                     {
            //                         "CompanyName": "Tatvartha Health Pvt. Ltd",
            //                         "Value": [
            //                             "Company is in process of developing a code of conduct",
            //                             "Company is FSSAI (Packaging and Labelling) regulated.",
            //                             "Company is in process of developing a Grievance Redressal Mechanism",
            //                             "Company is in a process of developing a Data Protection policy."
            //                         ]
            //                     }
            //                 ]
            //             }
            //         ]
            //     }
            // },
            riskPopover: null,
            compName: '',
            themeName: '',
            ListName: "",
            FemaleEmployeesdata: null,
            EmployeeAttrition: null,
            WomenInLeadershipPosition: null

        }
    }

    componentDidMount = async () => {
        let params = this.getUrlParameter("companyid");
        if (params !== undefined) {
            if (params !== false) {
                if (JSON.parse(localStorage.userType) === RoleCodes.VENTURECAPITALIST) {
                    ShowOtherCompanyDetails = true;
                    this.GetUserEmailid(params);
                } else {
                    ShowOtherCompanyDetails = false;
                    //await this.GetAuthToken(localStorage.emailId);
                    this.getThemeScoredata();
                }
            } else {
                ShowOtherCompanyDetails = false;
                //await this.GetAuthToken(localStorage.emailId);
                this.getThemeScoredata();
            }
        } else {
            ShowOtherCompanyDetails = false;
            //await this.GetAuthToken(localStorage.emailId);
            this.getThemeScoredata();
        }
    }

    getUrlParameter = (sParam) => {
        var sPageURL = window.location.search.substring(1),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;

        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');

            if (sParameterName[0] === sParam) {
                return typeof sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
            }
        }
        return false;
    }

    async GetUserEmailid(CPanelCompanyId) {
        var config = {
            headers: {
                Authorization: "Bearer " + localStorage.tokenId,
                "Content-Type": "application/json",
                "CPanelCompanyId": CPanelCompanyId,
            },
        };
        await axios
            .post(getServiceUrl() + "Integration/GetUserEmailid", null, config)
            .then((json) => {
                // localStorage.setItem("VCUserEmailid", json.data);
                //this.GetAuthToken(json.data);
                this.getThemeScoredata();
            })
            .catch((err) =>
                err.response !== undefined
                    ? err.response.status === 401
                        ? (window.location.pathname = "/logout")
                        : ""
                    : ""
            );
    }

    // async GetAuthToken(emailId) {
    //     var config = {
    //         headers: {
    //             Authorization: "Bearer " + localStorage.tokenId,
    //             "Content-Type": "application/json",
    //             "emailId": emailId,
    //         },
    //     };
    //     await axios
    //         .get(getServiceUrl() + "Integration/GetAuthToken", config)
    //         .then((json) => {
    //             localStorage.setItem("auth", json.data);
    //             this.getThemeScoredata();
    //         })
    //         .catch((err) =>
    //             err.response !== undefined
    //                 ? err.response.status === 401
    //                     ? (window.location.pathname = "/logout")
    //                     : ""
    //                 : ""
    //         );
    // }

    async getThemeScoredata() {
        var ThemeName = [];
        var companyData = {};
        var config = {
            headers: {
                Authorization: "Bearer " + localStorage.auth,
                "Content-Type": "application/json"
            },
        };

        if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIER || JSON.parse(localStorage.userType) === RoleCodes.BUYER || ShowOtherCompanyDetails === true) {
            IsVCUser = false;
            await axios.get(cPanelUrl + "/v1/assessments/portfolio_kpi_data?measure=banking_questionnaire", config).then(async (json) => {

                let ESGMaturity = json.data.ESGMaturity;
                let ESGScore = json.data.ESGScore;
                let KeyDataPoints = json.data.KeyDataPoints;
                let RecommendationList = json.data.RecommendationList;

                let existingData = {
                    "ESGMaturity": ESGMaturity,
                    "ESGScore": ESGScore,
                    "KeyDataPoints": KeyDataPoints,
                    "RecommendationList": RecommendationList
                };
                await this.setState({ preDealData: existingData });

                let ressponseData = this.state.preDealData.ESGScore;
                var Environment = [];
                var Governance = [];
                var Social = [];
                Environment.push(parseInt(ressponseData.Environment));
                Governance.push(parseInt(ressponseData.Governance));
                Social.push(parseInt(ressponseData.Social));

                var data = [];
                ThemeName.push("Environment");
                ThemeName.push("Governance");
                ThemeName.push("Social");

                data.push({
                    name: "Environment", data: [{
                        name: "Environment",
                        y: parseInt(ressponseData.Environment)
                    }]
                });
                data.push({
                    name: "Governance", data: [{
                        name: "Governance",
                        y: parseInt(ressponseData.Governance)
                    },]
                });
                data.push({
                    name: "Social", data: [{
                        name: "Social",
                        y: parseInt(ressponseData.Social)
                    },]
                });

                this.setState({ graphData: { ThemeName, data }, loader: false });


            }).catch((err) => {
                this.setState({ loader: false });
                console.log(err);
            });
        } else {
            IsVCUser = true;
            await axios.get(cPanelUrl + "/v1/assessments/esg_kpi_data?measure=banking_questionnaire", config).then(async (json) => {
                let ThemeWiseScoresXAxis = json.data.ThemeWiseScoresXAxis;
                let ThemeWiseRiskRating = json.data.ThemeWiseRiskRating;
                let RecommendationList = json.data.RecommendationList;
                let PolicySummary = json.data.PolicySummary;
                let PerformanceOnKPIs = json.data.PerformanceOnKPIs;
                let KeyDataPoints = json.data.KeyDataPoints;
                let ESGMaturity = json.data.ESGMaturity;
                let CurrentPractices = json.data.CurrentPracticesWithTag;


                // For FemaleEmployees
                let colorsdata = ['#012169', '#008522', '#ffc16c', '#ab6302', '#b3b3b3', '#007c20']
                let FemaleEmployeesdata = [{
                    name: 'Female Employees',
                    y: json.data.FemaleEmployees.TotalFemaleEmployees,
                    sliced: true,
                    selected: false
                }, {
                    name: 'Male Employees',
                    y: json.data.FemaleEmployees.TotalMaleEmployees,
                    sliced: true,
                    selected: false
                }];
                let slicedOffset = 5;
                let FemaleEmployeesdata1 = this.generatePieChartOption('Female Employees', colorsdata, FemaleEmployeesdata, slicedOffset);

                colorsdata = ['#012169', '#ff9e1b', '#b3b3b3', '#007c20', '#5388fd', '#00d637']
                let EmployeeAttritiondata = [{
                    name: 'Employee Attrition',
                    y: json.data.EmployeeAttrition.EmployeeAttrition,
                    sliced: true,
                    selected: false
                }, {
                    name: 'Employee Retaintion',
                    y: json.data.EmployeeAttrition.EmployeeRetaintion,
                    sliced: true,
                    selected: false
                }];
                slicedOffset = 5;
                let EmployeeAttrition = this.generatePieChartOption('Employee Attrition', colorsdata, EmployeeAttritiondata, slicedOffset);

                colorsdata = ['#ff9e1b', '#008522', '#5388fd', '#00d637', '#ffc16c', '#ab6302']
                let WomenInLeadershipPositiondata = [{
                    name: 'Female Employees',
                    y: json.data.WomenInLeadershipPosition.TotalFemaleEmployees,
                    sliced: true,
                    selected: false
                }, {
                    name: 'Male Employees',
                    y: json.data.WomenInLeadershipPosition.TotalMaleEmployees,
                    sliced: true,
                    selected: false
                }];
                slicedOffset = 5;
                let WomenInLeadershipPosition = this.generatePieChartOption('Women In Leadership Position', colorsdata, WomenInLeadershipPositiondata, slicedOffset);


                ThemeWiseRiskRating.ThemeList = ThemeWiseRiskRating.ThemeList.sort(function (a, b) {
                    if (a.ThemeName.toLowerCase() < b.ThemeName.toLowerCase()) return -1;
                    if (a.ThemeName.toLowerCase() > b.ThemeName.toLowerCase()) return 1;
                    return 0;
                });
                let existingData = {
                    "ThemeWiseScoresXAxis": ThemeWiseScoresXAxis,
                    "ThemeWiseRiskRating": ThemeWiseRiskRating,
                    "RecommendationList": RecommendationList,
                    "PolicySummary": PolicySummary,
                    "PerformanceOnKPIs": PerformanceOnKPIs,
                    "KeyDataPoints": KeyDataPoints,
                    "ESGMaturity": ESGMaturity,
                    "CurrentPractices": CurrentPractices
                };
                await this.setState({ preDealData: existingData, FemaleEmployeesdata: FemaleEmployeesdata1, EmployeeAttrition: EmployeeAttrition, WomenInLeadershipPosition: WomenInLeadershipPosition });
                let ressponseData = this.state.preDealData.ThemeWiseScoresXAxis;
                Object.keys(ressponseData.ThemeList).forEach((i, index) => {
                    ThemeName.push(ressponseData.ThemeList[i]["ThemeName"]);
                    ressponseData.ThemeList[i]["CompanyList"].forEach((j) => {
                        if (companyData[j["CompanyName"]] == undefined) companyData[j["CompanyName"]] = [];
                        companyData[j["CompanyName"]].push(j["Score"]);
                    });
                });
                var data = [];
                Object.keys(companyData).forEach((i) => {
                    data.push({ name: i, data: companyData[i] });
                });
                this.setState({ graphData: { ThemeName, data }, loader: false });
            }).catch((err) => {
                this.setState({ loader: false });
                console.log(err);
            });
        }

    }

    toCamelCase = (str) => {
        var arr = str.match(/[a-z]+|\d+/gi);
        return arr.map((m, i) => {
            let low = m.toLowerCase();
            low = low.split('').map((s, k) => k == 0 ? s.toUpperCase() : s).join('')
            return low;
        }).join(' ');
    }

    pdfDownload = e => {
        window.scrollTo(0, 0);
        setTimeout(() => {
            setTimeout(() => {
                // setLoader(true);
            }, 100);
            const divToPrint = document.getElementById('pdf-view');
            html2canvas(divToPrint).then(canvas => {
                // const imgData = canvas.toDataURL('image/png');
                // const imgWidth = 190;
                // const pageHeight = 290;
                // const imgHeight = (canvas.height * imgWidth) / canvas.width;
                // let heightLeft = imgHeight;
                // const doc = new jsPDF("p", "mm", "a4");
                // let position = 10;
                // doc.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight + 25);
                // heightLeft -= pageHeight;
                // while (heightLeft >= 0) {
                //     position = heightLeft - imgHeight;
                //     doc.addPage();
                //     doc.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight + 25);
                //     heightLeft -= pageHeight;
                // }
                let width = canvas.width;
                let height = canvas.height;
                //set the orientation
                let pdf
                if (width > height) {
                    pdf = new jsPDF('l', 'px', [width, height]);
                }
                else {
                    pdf = new jsPDF('p', 'px', [height, width]);
                }
                //then we get the dimensions from the 'pdf' file itself
                width = pdf.internal.pageSize.getWidth();
                height = pdf.internal.pageSize.getHeight();
                pdf.addImage(canvas, 'PNG', 0, 0, width, height);
                pdf.save("download.pdf");
                // setLoader(false);
            });
        }, 1000);

    }
    handlePopoverOpen = (event, val1, val2, ListName) => {
        this.setState({ riskPopover: event.currentTarget, compName: val1, themeName: val2, ListName: ListName });
    };

    handlePopoverClose = () => {
        this.setState({ riskPopover: null });
    };

    getImageName = (ImageName, IsImage, IsStyle) => {
        switch (ImageName) {
            case "Environment":
                if (IsImage) {
                    return predealEnvironment;
                }

                if (IsStyle) {
                    return { color: '#008522', margin: '0 0 0 10px' }
                }

                break;

            case "Social":
                if (IsImage) {
                    return predealSocial;
                }

                if (IsStyle) {
                    return { color: '#FF9E1B', margin: '0 0 0 10px' }
                }

                break;

            case "Governance":
                if (IsImage) {
                    return predealGovernance;
                }

                if (IsStyle) {
                    return { color: '#012169', margin: '0 0 0 10px' }
                }
                break;
            default:
                break;
        }
    }

    generatePieChartOption = (Title, colorsdata, data, slicedOffset) => {
        let piechartoptions = {
            credits: {
                enabled: false
            },
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                type: 'pie',
                backgroundColor: '#f8f8f8'
            },
            colors: colorsdata,
            title: {
                text: Title,
                align: 'left',
                style: { "color": "#012169", "fontWeight": "700", "fontSize": "16px" },
                x: -10,
                y: 15
            },
            tooltip: {
                // pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                pointFormat: '{series.name}: <b>{point.y} ({point.percentage:.1f}%)</b>'
            },
            accessibility: {
                point: {
                    valueSuffix: '%'
                }
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    slicedOffset: slicedOffset,
                    dataLabels: {
                        enabled: true,
                        // format: '<b>{point.name}</b>: {point.percentage:.1f} %'
                        // format: '<b>{point.name}</b>: {point.y}'
                        format: '<b>{point.name}</b>: {point.percentage:.1f}%'

                    }
                }
            },
            series: [{
                name: 'Total',
                colorByPoint: true,
                data: data
            }]
        }

        return piechartoptions;
    }

    render() {
        let permissions = localStorage.permissions !== undefined ? JSON.parse(localStorage.permissions) : [];
        if (permissions.length === 0) {
            return <Redirect to="/not-found" />;
        } else if (getUserPermision(permissions, PageKeys.BankingESGReport) === null) {
            return <Redirect to="/not-found" />;
        }

        const { riskPopover } = this.state;
        const openShop = Boolean(riskPopover);
        let finaldata = [];
        let finaldatahtml = [];
        let Objectdata = null;
        let breadCrumb = BreadCrumb([{ 'pageName': 'Dashboard', 'url': '/Home' },
        { 'pageName': 'Banking ESG Report', 'url': '/#' },
        ])

        let xAxisdetails = {
            crosshair: false,
            type: 'category'
        }

        let Isshared = false;

        let plotOptions = {
            column: {
                pointPadding: 0.1,
                borderWidth: 0
            }
        }

        let ChartText = "ESG Score (out of 100)"

        let colorsdata = ['#008522', '#012169', '#ff9e1b']
        if (IsVCUser) {
            xAxisdetails = {
                categories: this.state.graphData.ThemeName,
                crosshair: false
            }

            Isshared = true;

            plotOptions = {
                column: {
                    pointPadding: 0,
                    borderWidth: 0
                }
            }

            ChartText = 'Themewise Scores (in %)';

            colorsdata = ['#5388fd', '#00d637', '#ffc16c', '#ab6302', '#b3b3b3', '#007c20']

        }



        let options = {
            credits: {
                enabled: false
            },
            chart: {
                type: 'column',
                backgroundColor: '#f8f8f8'
            },
            colors: colorsdata,
            title: {
                text: ChartText,
                align: 'left',
                style: { "color": "#012169", "fontWeight": "700", "fontSize": "16px" },
                x: -10,
                y: 15
            },
            xAxis: xAxisdetails,
            yAxis: {
                min: 0,
                title: {
                    text: ''
                }
            },
            tooltip: {
                headerFormat: '<span style="font-size:14px;color:#fff">{point.key}</span><table>',
                pointFormat: '<tr><td style="font-size:14px;padding:0;color:#fff"><span style="margin-right:7px;display:inline-block;width:10px;height:10px;border-radius:100%;background:{series.color}"></span>{series.name}: </td>' +
                    '<td style="padding:0;font-size:14px;color:#fff"><b>{point.y:.1f} %</b></td></tr>',
                footerFormat: '</table>',
                shared: Isshared,
                useHTML: true,
                backgroundColor: '#000',
                borderRadius: 10,
                borderWidth: 0,
                style: { opacity: 0.7 }
            },
            plotOptions: plotOptions,
            legend: {
                align: 'center',
                verticalAlign: 'top',
                y: 0,
                itemMarginBottom: 25,
                symbolRadius: 3,
                symbolWidth: 50
            },
            series: this.state.graphData.data,
            responsive: {
                rules: [{
                    condition: {
                        maxWidth: 670
                    },
                    // Make the labels less space demanding on mobile
                    chartOptions: {
                        chart: {
                            inverted: false,
                            height: 400
                        },
                        legend: {
                            itemMarginBottom: 0,
                        },
                        xAxis: {
                            labels: {
                                style: {
                                    fontSize: 7
                                }
                            }
                        },
                        yAxis: {
                            labels: {
                                align: 'right',
                                x: 0,
                                y: -2
                            },
                            title: {
                                text: ''
                            }
                        }
                    }
                }]
            }
        };



        try {
            let permissions = JSON.parse(localStorage.permissions);
            permissions.filter(x => x.pageKey == "PredealESGReport");
            if (permissions.length === 0) {
                return <Redirect to="/home" />;
            }
        } catch (error) {

        }

        return (
            <div id="pdf-view">
                <React.Fragment>
                    <div className='breadtitle_wrap'>
                        {breadCrumb}
                        <div className="page_top_title">
                            <div className="page_heading">
                            Banking ESG Report
                            </div>
                        </div>
                    </div>
                    {this.state.loader ? <Spinner /> : this.state.preDealData == null ?
                        <div className=" esg_report_container">
                            <GridContainer className="top_esg_report">
                                <GridItem md={12}>
                                    <p className="no_data">No Data Found</p>
                                </GridItem>
                            </GridContainer>
                        </div>
                        :
                        <div className=" esg_report_container">
                            <div className="esg_report_header">
                                <h6>Portfolio View</h6>
                                <div data-html2canvas-ignore="true" className="esg_header_right">
                                    {/* <span>request survey</span> */}
                                    <span></span>
                                    <span onClick={this.pdfDownload}>
                                        <img style={{ marginRight: '3px' }} src={Export} />
                                        Export
                                    </span>


                                </div>
                            </div>
                            {JSON.parse(localStorage.userType) === RoleCodes.SUPPLIER || JSON.parse(localStorage.userType) === RoleCodes.BUYER || ShowOtherCompanyDetails === true ?
                                <GridContainer className="top_esg_report">
                                    {/* {this.state.preDealData.KeyDataPoints.Parameters.length > 0 ?
                                        <GridItem md={6}>
                                            <div className="preDeal_esg portfolio_Predeal">
                                                <h5>Key data points</h5>
                                                <div>
                                                    <div className="keydata_boxes">
                                                        {this.state.preDealData.KeyDataPoints.Parameters.slice(0, 3).map((data, i) => {
                                                            return (
                                                                data.CompanyList.map((data2, i) => {
                                                                    return (
                                                                        <div>
                                                                            <h1>{data2.Value}%</h1>
                                                                            <p>{this.toCamelCase(data.Parameter)}</p>
                                                                        </div>
                                                                    )
                                                                })
                                                            )
                                                        })}
                                                    </div>
                                                    <h5 style={{ margin: '25px 0 15px' }}>Employee Summary</h5>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                                                        {this.state.preDealData.KeyDataPoints.Parameters.slice(3, this.state.preDealData.KeyDataPoints.Parameters.length).map((data, i) => {
                                                            return (
                                                                data.CompanyList.map((data2, i) => {
                                                                    return (
                                                                        <div style={{ display: 'flex', flex: '0 0 50%', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                                                            <h6 style={{ fontSize: '12px', paddingRight: '18px' }}>{this.toCamelCase(data.Parameter)}</h6>
                                                                            <p style={{ fontSize: '12px', textAlign: 'right', paddingRight: '20px' }}>{data2.Value}</p>
                                                                        </div>
                                                                    )
                                                                })
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        </GridItem>
                                        : ""} */}
                                    <GridItem md={12}>
                                        <div className="preDeal_esg">
                                            <HighchartsReact highcharts={Highcharts} options={options} />
                                        </div>
                                    </GridItem>
                                    {this.state.preDealData.ESGMaturity.PortfolioList.length > 0 ?
                                        <GridItem md={12}>
                                            <div className="preDeal_esg portfolio_Predeal">
                                                <h5>Risk Rating</h5>
                                                <div style={{ margin: '20px -20px -25px' }}>
                                                    <table className="preDeal_tables riskRating">
                                                        <tbody>
                                                            {this.state.preDealData.ESGMaturity.PortfolioList.map((data, i) => {
                                                                return (
                                                                    data.CompanyList.map((data2, i) => {

                                                                        return (
                                                                            <tr className={data.Portfolio}>
                                                                                <td>
                                                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                                        <img alt={data.Portfolio} src={this.getImageName(data.Portfolio, true, false)} />
                                                                                        <p style={this.getImageName(data.Portfolio, false, true)}>{data.Portfolio}</p>
                                                                                    </div>
                                                                                </td>
                                                                                <td>
                                                                                    <div><span style={{ width: 'auto' }} className={"risk" + data2.Risk}>{data2.Risk}</span></div>
                                                                                    <ul className="capsule_tab" style={{ alignItems: 'left' }}>
                                                                                        {data2.ThemeNames.map((data3, i) => {
                                                                                            if (data3 !== "") {
                                                                                                return (
                                                                                                    <li style={{ pointerEvents: 'none' }} key={i} onClick={(e) => this.handlePopoverOpen(e, data3, data3, 'RiskRating')}>{data3}</li>
                                                                                                )
                                                                                            }
                                                                                        })}
                                                                                    </ul>
                                                                                </td>
                                                                            </tr>
                                                                        )
                                                                    })
                                                                )
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </GridItem>
                                        : ""}
                                </GridContainer>
                                :
                                JSON.parse(localStorage.userType) === RoleCodes.VENTURECAPITALIST ?
                                    <GridContainer className="top_esg_report">
                                        <GridItem md={12}>
                                            <div className="preDeal_esg first_class">
                                                {/* <ShowAnalytic apiUrl={cPanelUrl} id={"overall_fund_peformance_banking"} style={{ height: '450px', width: '100%', border: 'none', padding: 0, display: "inline-flex" }}></ShowAnalytic> */}
                                            </div>
                                        </GridItem>
                                        <GridItem md={12}>
                                            <div className="preDeal_esg first_class">
                                                {/* <ShowAnalytic apiUrl={cPanelUrl} id={"cyber_security_training_hours"} style={{ height: '450px', width: '100%', border: 'none', padding: 0, display: "inline-flex" }}></ShowAnalytic> */}
                                            </div>
                                        </GridItem>
                                        <GridItem md={12}>
                                            <div className="preDeal_esg">
                                                {/* <ShowAnalytic apiUrl={cPanelUrl} id={"esg_ategory_score_banking"} style={{ height: '300px', width: '100%', border: 'none', padding: 0, display: "inline-flex" }}></ShowAnalytic> */}
                                            </div>
                                        </GridItem>
                                        <GridItem md={12}>
                                            <div className="preDeal_esg">
                                                {/* <ShowAnalytic apiUrl={cPanelUrl} id={"themewise_score_banking"} style={{ height: '300px', width: '100%', border: 'none', padding: 0, display: "inline-flex" }}></ShowAnalytic> */}
                                            </div>
                                        </GridItem>
                                        {/* <GridItem md={12}>
                                            <div className="preDeal_esg">
                                                <ShowAnalytic apiUrl={cPanelUrl} id={"esg_score"} style={{ height: '300px', width: '100%', border: 'none', padding: 0, display: "inline-flex" }}></ShowAnalytic>
                                            </div>
                                        </GridItem> */}
                                        {this.state.preDealData.ESGMaturity.PortfolioList.length > 0 ?
                                            <GridItem md={12}>
                                                <div className="preDeal_esg">
                                                    <h5>ESG Risk</h5>
                                                    <div style={{ overflowX: 'auto' }}>
                                                        <table className="preDeal_tables">
                                                            <thead>
                                                                <tr>
                                                                    <th>Portfolio</th>
                                                                    {this.state.preDealData.ESGMaturity.PortfolioList.map((data, i) => {
                                                                        return (
                                                                            <th key={data.Portfolio}>{data.Portfolio}</th>
                                                                        )
                                                                    })}
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {this.state.preDealData.ESGMaturity.PortfolioList.map((data, i) => {
                                                                    let portfolio = data.Portfolio;
                                                                    data.CompanyList.map((compdata, j) => {
                                                                        if (compdata !== undefined) {
                                                                            if (i === 0) {
                                                                                finaldata[j] = this.toCamelCase(compdata.CompanyName);
                                                                                finaldata[j] = finaldata[j] + "," + compdata.Risk + "|" + portfolio;
                                                                            } else {
                                                                                finaldata[j] = finaldata[j] + "," + compdata.Risk + "|" + portfolio;
                                                                            }
                                                                        }
                                                                    })
                                                                })}
                                                                {finaldata.map((data, i) => {
                                                                    let details = data.split(",")
                                                                    return <tr key={i}>{details.map((finallp, j) => {
                                                                        return (
                                                                            finallp.split("|")[0] ?
                                                                                <td key={j} style={{ cursor: (finallp.split("|")[0].toLowerCase() == "high" || finallp.split("|")[0].toLowerCase() == "medium") ? 'pointer' : 'default' }} title={(finallp.split("|")[0].toLowerCase() == "high" || finallp.split("|")[0].toLowerCase() == "medium") && "Click to view detail"} onClick={(e) => { (finallp.split("|")[0].toLowerCase() == "high" || finallp.split("|")[0].toLowerCase() == "medium") && this.handlePopoverOpen(e, details[0], finallp.split("|")[1], "esgMaturity") }} >
                                                                                    <span style={{ whiteSpace: 'nowrap' }} className={finallp.split("|")[0].toLowerCase()}>{finallp.split("|")[0]}</span>
                                                                                </td> :
                                                                                <td><span style={{ visibility: 'hidden' }}>NA</span></td>
                                                                        )

                                                                    })}</tr>
                                                                })
                                                                }
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </GridItem>
                                            : ""}
                                        {this.state.preDealData.ThemeWiseRiskRating.ThemeList.length > 0 ?
                                            <GridItem md={12}>
                                                <div className="preDeal_esg">
                                                    <h5>Themewise Risk Rating Of The Companies (Based on response and process materiality)</h5>
                                                    <div style={{ overflowX: 'auto' }}>
                                                        <table className="preDeal_tables">
                                                            <thead>
                                                                <tr>
                                                                    <th>Theme</th>
                                                                    {this.state.preDealData.ThemeWiseRiskRating.ThemeList.slice(0, 1).map((data, i) => {
                                                                        return (
                                                                            data.CompanyList.map((data2, i) => {
                                                                                return (
                                                                                    <th>{this.toCamelCase(data2.CompanyName)}</th>
                                                                                )
                                                                            })
                                                                        )
                                                                    })}
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {this.state.preDealData.ThemeWiseRiskRating.ThemeList.map((data, i) => {
                                                                    return (
                                                                        <tr><td><span style={{ whiteSpace: 'nowrap' }}>{data.ThemeName}</span></td>{
                                                                            data.CompanyList.map((data2, i) => {
                                                                                return (
                                                                                    data2.Risk ?
                                                                                        <td style={{ cursor: (data2.Risk.toLowerCase() == "high" || data2.Risk.toLowerCase() == "medium") ? 'pointer' : 'default' }} title={(data2.Risk.toLowerCase() == "high" || data2.Risk.toLowerCase() == "medium") && "Click to view detail"} onClick={(e) => { (data2.Risk.toLowerCase() == "high" || data2.Risk.toLowerCase() == "medium") && this.handlePopoverOpen(e, data2.CompanyName, data.ThemeName, "ThemewiseRiskRating") }} >
                                                                                            <span className={data2.Risk.toLowerCase()}>
                                                                                                {data2.Risk}
                                                                                            </span>
                                                                                        </td>
                                                                                        : <td><span style={{ visibility: 'hidden' }}>NA</span></td>
                                                                                )
                                                                            })
                                                                        }</tr>
                                                                    )
                                                                })}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </GridItem>
                                            : ""}
                                    </GridContainer> : ""
                            }


                        </div>
                    }
                </React.Fragment>
                <Popover
                    id="mouse-over-popover"
                    className={'shop_popper'}
                    classes={{
                        paper: '',
                    }}
                    open={openShop}
                    anchorEl={riskPopover}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                    PaperProps={{
                        style: { padding: '20px' },
                    }}
                    onClose={this.handlePopoverClose}
                    disableRestoreFocus>
                    {this.state.ListName === "esgMaturity" ?
                        this.state.preDealData.ESGMaturity.PortfolioList.filter((v) => {
                            return v.Portfolio == this.state.themeName
                        }).map((data, i) => {
                            let compName = this.state.compName
                            if (data.CompanyList !== undefined) {
                                return data.CompanyList.filter((w) => {
                                    return this.toCamelCase(w.CompanyName) == compName
                                }).map((data1, i) => {
                                    return data1.ThemeNames.map((data2, i) => {
                                        return (
                                            <div className="riskReason_popup" key={i}>
                                                <ul style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
                                                    <li>{data2}</li>
                                                </ul>
                                            </div>
                                        )
                                    })
                                })
                            } else {
                                return null;
                            }

                        }) : ""
                    }
                    {
                        this.state.ListName === "ThemewiseRiskRating" ?
                            this.state.preDealData.RecommendationList.filter((v) => {
                                return v.CompanyName == this.state.compName && v.ThemeName == this.state.themeName
                            }).map((data, i) => {
                                return (
                                    <div className="riskReason_popup" key={i}>
                                        <div>

                                            <h6><span></span>{this.toCamelCase(data.CompanyName)}</h6>
                                            <span>{data.ThemeName}</span>
                                        </div>
                                        <div>
                                            {data.Recommendations.map((v, i) => {
                                                return (
                                                    <ul style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
                                                        <li>{v}</li>
                                                    </ul>
                                                )
                                                // return <p style={{ fontWeight: i === 0 && '700' }}> {i !== 0 ? <ul><li>{v}</li></ul> : v}</p>
                                            })}
                                        </div>
                                    </div>
                                )
                            }) : ""
                    }
                    {this.state.ListName === "RiskRating" &&
                        <>
                            {this.state.preDealData.RecommendationList.filter((v) => {
                                return v.ThemeName == this.state.themeName
                            }).map((data, i) => {
                                return (
                                    <div className="riskRating_popup" key={i}>
                                        <div>
                                            <h6>Recomendation</h6>
                                        </div>
                                        <div>
                                            <ul style={{ listStyleType: 'none' }}>
                                                {data.Recommendations.length > 0 ? data.Recommendations.map((v, i) => {
                                                    return (
                                                        <li>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                                                                <path d="M6.5 4.5L8 6M8 6L6.5 7.5M8 6H4M10.5 6C10.5 6.59095 10.3836 7.17611 10.1575 7.72208C9.93131 8.26804 9.59984 8.76412 9.18198 9.18198C8.76412 9.59984 8.26804 9.93131 7.72208 10.1575C7.17611 10.3836 6.59095 10.5 6 10.5C5.40905 10.5 4.82389 10.3836 4.27792 10.1575C3.73196 9.93131 3.23588 9.59984 2.81802 9.18198C2.40016 8.76412 2.06869 8.26804 1.84254 7.72208C1.6164 7.17611 1.5 6.59095 1.5 6C1.5 4.80653 1.97411 3.66193 2.81802 2.81802C3.66193 1.97411 4.80653 1.5 6 1.5C7.19347 1.5 8.33807 1.97411 9.18198 2.81802C10.0259 3.66193 10.5 4.80653 10.5 6Z" stroke="#72D0C6" stroke-linecap="round" stroke-linejoin="round" />
                                                            </svg>
                                                            {v}
                                                        </li>
                                                    )
                                                }) : <li>No Recomendation</li>}
                                            </ul>
                                        </div>
                                    </div>
                                )
                            })}
                        </>
                    }
                </Popover>
            </div >
        )
    }
}
export default BankingESGReport