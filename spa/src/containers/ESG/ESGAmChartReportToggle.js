import React, { Component } from "react";
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import axios from 'axios';
import { getNextJSServiceUrl, getServiceUrl } from '../../config';
import { withStyles } from '@material-ui/core/styles';
import OverallESGPerformanceChart from "./OverallESGPerformanceChart";
import SectorWiseESGPerformance from "./SectorWiseESGPerformance";
import ESGRisk from "./ESGRisk";
import TopandWorstESGPerformers from "./TopandWorstESGPerformers";
import PerformanceinCriticalESGFactors from "./PerformanceinCriticalESGFactors";
import { uniqBy } from 'lodash';
import { Button } from "@material-ui/core";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import Spinner from '../../UI/Spinner/Spinner';


const styles = theme => ({
    root: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.paper,
    },
    tabsRoot: {
        padding: '0',
        marginTop: '25px'
    },
    tabsIndicator: {
        backgroundColor: '#FFA93C',
    },
    tabRoot: {
        textTransform: 'initial',
        minWidth: "max-content",
        fontWeight: theme.typography.fontWeightMedium,
        marginRight: theme.spacing.unit * 2,
        opacity: 1,
        background: '#EBEBEB',
        color: '#4D4D4F',
        borderRadius: '5px 5px 0px 0px',
        maxHeight: 40,
        minHeight: 40,
        fontSize: 14,
        '&$tabSelected': {
            color: '#fff',
            fontWeight: theme.typography.fontWeightMedium,
            background: '#FFA93C'
        }
    },
    tabRootLabel: {
        padding: "12px 20px"
    },
    tabSelected: {},
    typography: {
        padding: theme.spacing.unit * 3,
    },
});
class ESGAmChartReportToggle extends Component {
    constructor(props) {
        super(props)
        this.state = {
            loader: false,
            value: 0,
            pagePermissions: [],
            chartarray: [],
            predealGraphReport: [],
            totalSectorESG: [],
            esgRiskandFactors: [],
            topandWorstESG: [],
            fundDetail: [],
            esgRiskThemeData: [],
            eSGTopBottomSelectData: [],
            themeTopBottomSelectData: [],
            visibleAll: false,
            exportAll: "exportAll",
            loading: false,
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
        await this.getFundTypeDetail();
        await this.getSectorWiseESG();
        await this.getPredealGraphReport();
        await this.getTotalSectorESG();
        await this.getESGRiskandFactors();
        await this.getTopandWorstESG();
    }
    async getFundTypeDetail() {
        const axios = require('axios');
        let data = JSON.stringify({
            query: `query GetFunType {  CompanyFormFundtype(where: {_and: [{vcCompanyId: {_eq: "ce6c5fee-10ef-4cf7-af5b-1a6d6d83645b"}},  {fundType: {_neq: {}}}]}, distinct_on: fundType) {    fundType  }}`,
            variables: {}
        });

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://gh8s9aggxt.us-west-2.awsapprunner.com/v1/graphql',
            headers: {
                'X-Hasura-Admin-Secret': 'C910KI42lZKXGQ7vO1L/qIidgWi2ucNNyA4MQJGdXr05mSi+MIy31iUm0ClIWWUPC9a/L3zl6xKfds7OWqXfJuxHaGZBgGkdHaBcP6BGTkx8+lY2uRuf/RUJJv8Lu/MKGg4Vds5YNJfb8lU060B9UCiYYonYS/25ZB+chNRpJc+7DOIPy9WuH2/WjoJAu8/ZjuMGDkpffMzURo89Wb1HiPII/6sbgAnAHpFI3w==',
                'Content-Type': 'application/json'
            },
            data: data
        };
        axios.request(config)
            .then((response) => {
                let fundData = [];
                //fundData.push("All");
                response.data.data.CompanyFormFundtype.map((data) => {
                    fundData.push(data.fundType.fundType)
                });
                this.setState({
                    fundDetail: fundData
                });
            })
            .catch((error) => {
                console.log(error);
            });
    }
    async getSectorWiseESG() {
        const axios = require('axios');
        let data = JSON.stringify({
            query: `query MyQuery {
      getsectorwiseesg(args: {parentcompanyid: "ce6c5fee-10ef-4cf7-af5b-1a6d6d83645b"}) {
        company_id
        company_name
        duration
        fund_Name
        is_esg_section
        is_theme_section
        parentCompanyId
        questionId
        score
        sectionId
        section_name
        submissionId
        weightage
        total_ESG_weighted_score
        esg_section_name
        tags_cs_cp
        risk
      }
    }`,
            variables: {}
        });

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://gh8s9aggxt.us-west-2.awsapprunner.com/v1/graphql',
            headers: {
                'X-Hasura-Admin-Secret': 'C910KI42lZKXGQ7vO1L/qIidgWi2ucNNyA4MQJGdXr05mSi+MIy31iUm0ClIWWUPC9a/L3zl6xKfds7OWqXfJuxHaGZBgGkdHaBcP6BGTkx8+lY2uRuf/RUJJv8Lu/MKGg4Vds5YNJfb8lU060B9UCiYYonYS/25ZB+chNRpJc+7DOIPy9WuH2/WjoJAu8/ZjuMGDkpffMzURo89Wb1HiPII/6sbgAnAHpFI3w==',
                'Content-Type': 'application/json'
            },
            data: data
        };
        this.setState({ loader: true })
        await axios.request(config)
            .then((response) => {
                this.setState({ chartarray: response.data.data.getsectorwiseesg, loader: false })
            })
            .catch((error) => {
                console.log(error);
            });
    }
    async getPredealGraphReport() {
        const axios = require('axios');
        let data = JSON.stringify({
            query: `query MyQuery {
              getpredealgraphreport(args: {parentcompanyid: "ce6c5fee-10ef-4cf7-af5b-1a6d6d83645b"}) {
              company_id
              company_name
              duration
              fund_Name
              is_esg_section
              is_theme_section
              parentCompanyId
              questionId
              score
              sectionId
              section_name
              submissionId
              weightage
              sector
              total_ESG_weighted_score
              esg_section_name
              tags_cs_cp
              risk
            }
          }`,
            variables: {}
        });
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://gh8s9aggxt.us-west-2.awsapprunner.com/v1/graphql',
            headers: {
                'X-Hasura-Admin-Secret': 'C910KI42lZKXGQ7vO1L/qIidgWi2ucNNyA4MQJGdXr05mSi+MIy31iUm0ClIWWUPC9a/L3zl6xKfds7OWqXfJuxHaGZBgGkdHaBcP6BGTkx8+lY2uRuf/RUJJv8Lu/MKGg4Vds5YNJfb8lU060B9UCiYYonYS/25ZB+chNRpJc+7DOIPy9WuH2/WjoJAu8/ZjuMGDkpffMzURo89Wb1HiPII/6sbgAnAHpFI3w==',
                'Content-Type': 'application/json'
            },
            data: data
        };
        this.setState({ loader: true })
        await axios.request(config)
            .then((response) => {
                this.setState({ predealGraphReport: response.data.data.getpredealgraphreport, loader: false });
            })
            .catch((error) => {
                console.log(error);
            });
    }
    async getTotalSectorESG() {
        const axios = require('axios');
        let data = JSON.stringify({
            query: `query MyQuery {
              gettotalsectoresg(args: {parentcompanyid: "ce6c5fee-10ef-4cf7-af5b-1a6d6d83645b"}) {
                sector
                score
                section_name
                company_name
                weightage
                fund_Name
                total_ESG_weighted_score
                is_esg_section
                is_theme_section
                esg_section_name
                tags_cs_cp
                risk
              }
            }`,
            variables: {}
        });

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://gh8s9aggxt.us-west-2.awsapprunner.com/v1/graphql',
            headers: {
                'X-Hasura-Admin-Secret': 'C910KI42lZKXGQ7vO1L/qIidgWi2ucNNyA4MQJGdXr05mSi+MIy31iUm0ClIWWUPC9a/L3zl6xKfds7OWqXfJuxHaGZBgGkdHaBcP6BGTkx8+lY2uRuf/RUJJv8Lu/MKGg4Vds5YNJfb8lU060B9UCiYYonYS/25ZB+chNRpJc+7DOIPy9WuH2/WjoJAu8/ZjuMGDkpffMzURo89Wb1HiPII/6sbgAnAHpFI3w==',
                'Content-Type': 'application/json'
            },
            data: data
        };
        this.setState({ loader: true })
        axios.request(config)
            .then((response) => {
                let eSGRiskDropdown = uniqBy(response.data.data.gettotalsectoresg.filter(x => x.tags_cs_cp !== null), "tags_cs_cp");
                let esgRiskData = [];
                esgRiskData.push("All");
                eSGRiskDropdown.map((data) => {
                    esgRiskData.push(data.tags_cs_cp)
                });

                let eSGTopBottomDropdown = uniqBy(response.data.data.gettotalsectoresg.filter(x => x.esg_section_name !== null), "esg_section_name");
                let esgTopBottomData = [];
                esgTopBottomData.push("All");
                eSGTopBottomDropdown.map((data) => {
                    esgTopBottomData.push(data.esg_section_name)
                });

                let themeTopBottomDropdown = uniqBy(response.data.data.gettotalsectoresg.filter(x => x.section_name !== null), "section_name");
                let themeTopBottomData = [];
                themeTopBottomData.push("All");
                themeTopBottomDropdown.map((data) => {
                    themeTopBottomData.push(data.section_name)
                });

                this.setState({ totalSectorESG: response.data.data.gettotalsectoresg, loader: false, esgRiskThemeData: esgRiskData, eSGTopBottomSelectData: esgTopBottomData, themeTopBottomSelectData: themeTopBottomData });
            })

            .catch((error) => {
                console.log(error);
            });
    }
    async getESGRiskandFactors() {
        const axios = require('axios');
        let data = JSON.stringify({
            query: `query MyQuery {
              getesgriskandfactors(args: {parentcompanyid: "ce6c5fee-10ef-4cf7-af5b-1a6d6d83645b"}) {
                  Totalfemaleemployees
                  Totalfemaleincontractualemployees
                  Totalfemaleinpermanentemployees
                  company_name
                  performace_on_kpi_Employee_turnover_Attrition
                  Womeninleadershipposition
                  Totalemployees
                  LeadershipPosition
                  ofRevenuespentinCSR
                  Totalpermanentemployees
                  Totalcontractualemployeess
                  fund_Name
                  performace_on_kpi_Female_employee_Permanent
                  performace_on_kpi_Female_employee_Contractual
                  employeelefttheorginlastfinancialyear
                  Totalsuppliers
                  Totalwarehousesowned
                  Totalwarehousesownedleased
                  Totalfactoriesownedoutsourced
                  Totalfactoriesowned
                  employeesthataredifferenltyabled
              }
          }`,
            variables: {}
        });

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://gh8s9aggxt.us-west-2.awsapprunner.com/v1/graphql',
            headers: {
                'X-Hasura-Admin-Secret': 'C910KI42lZKXGQ7vO1L/qIidgWi2ucNNyA4MQJGdXr05mSi+MIy31iUm0ClIWWUPC9a/L3zl6xKfds7OWqXfJuxHaGZBgGkdHaBcP6BGTkx8+lY2uRuf/RUJJv8Lu/MKGg4Vds5YNJfb8lU060B9UCiYYonYS/25ZB+chNRpJc+7DOIPy9WuH2/WjoJAu8/ZjuMGDkpffMzURo89Wb1HiPII/6sbgAnAHpFI3w==',
                'Content-Type': 'application/json'
            },
            data: data
        };
        this.setState({ loader: true })
        axios.request(config)
            .then((response) => {
                this.setState({ esgRiskandFactors: response.data.data.getesgriskandfactors, loader: false });
            })
            .catch((error) => {
                console.log(error);
            });
    }
    async getTopandWorstESG() {
        const axios = require('axios');
        let data = JSON.stringify({
            query:
                'query MyQuery{gettopandworstesg(args:{parentcompanyid:"ce6c5fee-10ef-4cf7-af5b-1a6d6d83645b"}){Totalpolicies Existingpolicies PolicyWIP Nopolicies company_name fund_Name}}',
            variables: {},
        });

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://gh8s9aggxt.us-west-2.awsapprunner.com/v1/graphql',
            headers: {
                'X-Hasura-Admin-Secret':
                    'C910KI42lZKXGQ7vO1L/qIidgWi2ucNNyA4MQJGdXr05mSi+MIy31iUm0ClIWWUPC9a/L3zl6xKfds7OWqXfJuxHaGZBgGkdHaBcP6BGTkx8+lY2uRuf/RUJJv8Lu/MKGg4Vds5YNJfb8lU060B9UCiYYonYS/25ZB+chNRpJc+7DOIPy9WuH2/WjoJAu8/ZjuMGDkpffMzURo89Wb1HiPII/6sbgAnAHpFI3w==',
                'Content-Type': 'application/json',
            },
            data: data,
        };
        this.setState({ loader: true })
        axios
            .request(config)
            .then((response) => {
                this.setState({ topandWorstESG: response.data.data.gettopandworstesg, loader: false });
            })
            .catch((error) => {
                console.log(error);
            });
    }
    handleChange = async (event, value) => {
        this.setState({ value });
    };
    pdfDownload = async () => {
        document.body.style.overflow = "hidden";
        this.setState({ visibleAll: true }, async () => {
            window.scrollTo(0, 0);
            if (this.state.visibleAll === true) {
                await setTimeout(async () => {
                    const divToOverall = document.getElementById('OverallESGPerformanceExportRef');
                    const divToSector = document.getElementById('SectorWiseESGPerformanceExportRef');
                    const divToPrint = document.getElementById('ESGRiskExportRef');
                    const divTopWorst = document.getElementById('TopandWorstESGPerformerExportRef');
                    const divPerformane = document.getElementById('PerformanceInCriticalESGFactorExportRef');

                    divToOverall.append(divToSector, divToPrint, divTopWorst, divPerformane);
                    await setTimeout(async () => {
                        await this.setState({ visibleAll: false, exportAll: this.state.exportAll + "false" });
                        document.body.style.overflow = "auto";
                    }, 3000);
                    await this.html2canvascreation(divToOverall);
                }, 5000);
            }
        });

    };


    html2canvascreation = async (divToPrint) => {
        return html2canvas(divToPrint).then(canvas => {
            let pdf;
            let width = canvas.width;
            let height = canvas.height;
            //set the orientation
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
            pdf.save("Predeal_ESG_Report.pdf");
            // setLoader(false);
            return pdf;
        });
    }

    render() {
        const { value } = this.state;
        const { classes } = this.props;
        let permissions = JSON.parse(localStorage.permissions);
        return permissions.filter(x => x.pageKey === "ESGAmChartReport") ?
            <>
            
            <div >
                <div style={{pointerEvents: this.state.visibleAll === true ? "none" : "all"}}>
                <Tabs  value={value} classes={{ root: classes.tabsRoot, indicator: classes.tabsIndicator }} onChange={this.handleChange}>
                    <Tab classes={{ root: classes.tabRoot, selected: classes.tabSelected, labelContainer: classes.tabRootLabel }} label="Overall ESG Performance" />
                    <Tab classes={{ root: classes.tabRoot, selected: classes.tabSelected, labelContainer: classes.tabRootLabel }} label="Sector Wise ESG Performance" />
                    <Tab classes={{ root: classes.tabRoot, selected: classes.tabSelected, labelContainer: classes.tabRootLabel }} label="ESG Risk" />
                    <Tab classes={{ root: classes.tabRoot, selected: classes.tabSelected, labelContainer: classes.tabRootLabel }} label="Top and Worst ESG Performers" />
                    <Tab classes={{ root: classes.tabRoot, selected: classes.tabSelected, labelContainer: classes.tabRootLabel }} label="Performance in Critical ESG Factors" />
                </Tabs>
                </div>
                {this.state.visibleAll === true ? 
                    <Spinner/>
                    : ""}
                <div className={this.state.visibleAll === true ? "hideCharts" : ""}>
                    <div className=" finalChart">
                        <Button
                            className="export_all_btn"
                            onClick={() => {
                                this.pdfDownload();
                            }}
                        >
                            Download page as PDF
                        </Button>
                    </div>
                    <div>
                    {this.state.chartarray.length > 0 && this.state.predealGraphReport.length > 0 && (value === 0 || this.state.visibleAll === true) && <div><OverallESGPerformanceChart key={this.state.exportAll} FundTypeData={this.state.fundDetail} SectorWiseESGData={this.state.chartarray} PredealGraphReportData={this.state.predealGraphReport} /></div>}
                    {this.state.totalSectorESG.length > 0 && (value === 1 || this.state.visibleAll === true) && <div><SectorWiseESGPerformance key={this.state.exportAll} FundTypeData={this.state.fundDetail} TotalSectorESGData={this.state.totalSectorESG} /></div>}
                    {this.state.totalSectorESG.length > 0 && (value === 2 || this.state.visibleAll === true) && <div><ESGRisk key={this.state.exportAll} FundTypeData={this.state.fundDetail} TotalSectorESGData={this.state.totalSectorESG} EsgRiskThemeData={this.state.esgRiskThemeData} /></div>}
                    {this.state.totalSectorESG.length > 0 && (value === 3 || this.state.visibleAll === true) && <div><TopandWorstESGPerformers key={this.state.exportAll} FundTypeData={this.state.fundDetail} TotalSectorESGData={this.state.totalSectorESG} SelectTopBottomESGData={this.state.eSGTopBottomSelectData} SelectTopBottomThemeData={this.state.themeTopBottomSelectData} /></div>}
                    {this.state.esgRiskandFactors.length > 0 && this.state.topandWorstESG.length > 0 && (value === 4 || this.state.visibleAll === true) && <div><PerformanceinCriticalESGFactors key={this.state.exportAll} FundTypeData={this.state.fundDetail} ESGRiskandFactorsData={this.state.esgRiskandFactors} TopandWorstESGData={this.state.topandWorstESG} /></div>}
                    </div>
                </div>
            </div>
            </>
            : ""
    }
}
export default withStyles(styles)(ESGAmChartReportToggle);
