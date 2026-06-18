import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import React, { Component } from "react";
import GridContainer from "../../components/Material/Grid/GridContainer";
import GridItem from "../../components/Material/Grid/GridItem.jsx";
import Spinner from '../../UI/Spinner/Spinner';
// import Work from "../../assets/img/EsgDashboard/Workplace.svg";
import Tooltip from '@material-ui/core/Tooltip';
import Info from "@material-ui/icons/Info";
import axios from "axios";
import html2canvas from 'html2canvas';
import { jsPDF } from "jspdf";
import moment from "moment";
import { Redirect } from "react-router-dom";
import { getCPanelURL, getServiceUrl, getUserPermision } from "../../config";
import * as PageKeys from "../../pagekeys";
import { BreadCrumb } from '../../utility';

const cPanelUrl = getCPanelURL(); // CPanel URL
let ShowOtherCompanyDetails = false;
class ESGReport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      responseData: "",
      colorClass: "",
      loader: true
    };
  }
  async componentDidMount() {
    if (localStorage.getItem('companyGuid') === "a10f5266-03e9-4142-9e7a-8c5f690efdc8" || localStorage.getItem('companyGuid') === "bb3fabe7-e7db-49bf-8900-18a65e05bf0d") {
      this.getEsgDashboardData();
    } else {
      let params = this.getUrlParameter("companyid");
        if(params !== undefined){
            if(params !== false){
              ShowOtherCompanyDetails = true;
                this.GetUserEmailid(params);
            }else{
              ShowOtherCompanyDetails = false;
              //await this.GetAuthToken(localStorage.emailId);
              this.getEsgDashboardDataFromCpanel();
            }
        }else{
          ShowOtherCompanyDetails = false;
          //await this.GetAuthToken(localStorage.emailId);
          this.getEsgDashboardDataFromCpanel();
        }
    }
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
        .post(getServiceUrl() + "Integration/GetUserEmailid", null,config)
        .then((json) => {
            // localStorage.setItem("VCUserEmailid", json.data);
            //this.GetAuthToken(json.data);
            this.getEsgDashboardDataFromCpanel();
        })
        .catch((err) =>
            err.response !== undefined
                ? err.response.status === 401
                    ? (window.location.pathname = "/logout")
                    : ""
                : ""
        );
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

  async getEsgDashboardData() {
    var config = {
      headers: {
        Authorization: "Bearer " + localStorage.tokenId,
        "Content-Type": "application/json"
        // SupplierCompanyGuid: localStorage.getItem('companyGuid')
      }
    };
    await axios
      .get(getServiceUrl() + "MasterData/GetEsgDiagnostics", config)
      .then(json => {
        this.setState({ loader: false })
        this.setState({ responseData: json.data }, () => {
        });
      })
      .catch(err => console.log(err));
  }

  async getEsgDashboardDataFromCpanel() {
    if (localStorage.auth !== undefined && localStorage.auth !== null) {
      var config = {
        headers: {
          Authorization: "Bearer " + localStorage.auth,
          "Content-Type": "application/json"
        }
      };
      await axios
        .get(cPanelUrl + "/v1/assessments/esg_report_data", config)
        .then(json => {

          if (Object.keys(json.data).length === 0 && json.data.constructor === Object) {
            this.setState({ Nodata: true, loader: false });
          } else {
            this.setState({ responseData: json.data, loader: false }, () => {
              console.log(json.data);
            });
          }
        })
        .catch((err) => {
          // console.log(err)
          this.setState({ Nodata: true, loader: false });
        });
    } 
    // else {
    //   await this.GetAuthToken(localStorage.emailId);
    // }
  }
  // async GetAuthToken(emailId) {
  //   var config = {
  //     headers: {
  //       Authorization: "Bearer " + localStorage.tokenId,
  //       "Content-Type": "application/json",
  //       "emailId": emailId,
  //     },
  //   };
  //   await axios
  //     .get(getServiceUrl() + "Integration/GetAuthToken", config)
  //     .then((json) => {
  //       localStorage.setItem("auth", json.data);
  //       this.getEsgDashboardDataFromCpanel();
  //     })
  //     .catch((err) =>
  //       err.response !== undefined
  //         ? err.response.status === 401
  //           ? (window.location.pathname = "/logout")
  //           : ""
  //         : ""
  //     );
  // }

  pdfDownload = e => {
    window.scrollTo(0, 0);
    setTimeout(() => {
      setTimeout(() => {
        // setLoader(true);
      }, 100);
      const divToPrint = document.getElementById('pdf-view');
      html2canvas(divToPrint).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 190;
        const pageHeight = 290;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        const doc = new jsPDF("p", "mm", "a4");
        let position = 10;
        doc.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight + 25);
        heightLeft -= pageHeight;
        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          doc.addPage();
          doc.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight + 25);
          heightLeft -= pageHeight;
        }
        doc.save('download.pdf');
        // setLoader(false);
      });
    }, 1000);

  }

  getFocusAreaName = (companyGuid, focusArea) => {
    let newFocusArea = focusArea;
    if (companyGuid === 'a10f5266-03e9-4142-9e7a-8c5f690efdc8' && focusArea === 'Environment') {
      newFocusArea = 'Environmental Risk & Impact Management';
    } else if (companyGuid === 'a10f5266-03e9-4142-9e7a-8c5f690efdc8' && focusArea === 'Workplace') {
      newFocusArea = 'Labor and Working Conditions';
    } else if (companyGuid === 'a10f5266-03e9-4142-9e7a-8c5f690efdc8' && focusArea === 'Marketplace') {
      newFocusArea = 'Data Disclosure';
    } else if (companyGuid === 'a10f5266-03e9-4142-9e7a-8c5f690efdc8' && focusArea === 'Community') {
      newFocusArea = 'Minority Shareholders';
    } else if (companyGuid === 'a10f5266-03e9-4142-9e7a-8c5f690efdc8' && focusArea === 'Purpose') {
      newFocusArea = 'Leadership & Culture';
    } else if (companyGuid === 'a10f5266-03e9-4142-9e7a-8c5f690efdc8' && focusArea === 'Governance') {
      newFocusArea = 'Structure and Functioning of Board of Directors';
    }
    return newFocusArea
  }

  render() {
    let permissions = localStorage.permissions !== undefined ? JSON.parse(localStorage.permissions) : [];
    if (permissions.length === 0) {
      return <Redirect to="/not-found" />;
    } else if (getUserPermision(permissions, PageKeys.portfolioesgreport) === null) {
      return <Redirect to="/not-found" />;
    }
    let breadCrumb = BreadCrumb([{ 'pageName': 'Dashboard', 'url': '/Home' },
    { 'pageName': 'Portfolio ESG Report', 'url': '/#' },
    ])
    let sectionHeading = [...new Set(this.state.responseData.table8 === undefined ? '' : this.state.responseData.table8.map(x => x.sectionName))]
    let sectionHeading9 = [...new Set(this.state.responseData.table9 === undefined ? '' : this.state.responseData.table9.map(x => x.sectionName))]
    let barchartCompName = [...new Set(this.state.responseData.table10 === undefined ? '' : this.state.responseData.table10.map(x => x.companyName))]
    let envTotalPoints = [], socialTotalPoint = [], governanceTotalPoint = [];
    let envAchivePoints = [], socialAchivePoint = [], governanceAchivePoint = [];

    let barchartCompNameArr = [];
    barchartCompName.map((x) => {
      if (x === 'Fireside Portfolio' && localStorage.getItem('companyGuid') === 'a10f5266-03e9-4142-9e7a-8c5f690efdc8') {
        barchartCompNameArr.push('Somerset Portfolio')
      } else {
        barchartCompNameArr.push(x);
      }
    })

    if (barchartCompName.length > 0) {
      barchartCompName.map((x) => {
        this.state.responseData.table10.filter(y => y.companyName === x && y.esgType === "Environment").map((z) => {
          envTotalPoints.push(z.maxScore)
          envAchivePoints.push(z.averageScore)
          //return null;
        })
        this.state.responseData.table10.filter(y => y.companyName === x && y.esgType === "Social").map((z) => {
          socialTotalPoint.push(z.maxScore)
          socialAchivePoint.push(z.averageScore)
        })
        this.state.responseData.table10.filter(y => y.companyName === x && y.esgType === "Governance").map((z) => {
          governanceTotalPoint.push(z.maxScore)
          governanceAchivePoint.push(z.averageScore)
        })
      })
    }
    let options = {
      chart: {
        type: 'column'
      },
      title: {
        text: "ESG PERFORMANCE",
        style: {
          color: "#FF9E1B",
          fontSize: "15px",
          fontWeight: "700",
          marginBottom: "25px"
        }
      },
      xAxis: {
        categories: barchartCompNameArr
      },
      yAxis: [{
        min: 0,
        title: {
          text: 'Environment'
        }
      }, {
        title: {
          text: 'Social'
        },
        opposite: true
      }, {
        title: {
          text: 'Governance'
        },
        opposite: true
      }],
      credits: {
        enabled: false
      },
      legend: {
        shadow: false
      },
      tooltip: {
        shared: true
      },
      plotOptions: {
        column: {
          grouping: false,
          shadow: false,
          borderWidth: 0
        }
      },
      series: [{
        name: 'Env. Max Points',
        color: 'rgba(0,133,34,0.4)',
        data: envTotalPoints,
        pointPadding: 0.3,
        pointPlacement: -0.3,
      }, {
        name: 'Env. Scores',
        color: '#008522',
        data: envAchivePoints,
        pointPadding: 0.4,
        pointPlacement: -0.3
      }, {
        name: 'Soc. Max Points',
        color: 'rgba(0,33,105,0.4)',
        data: socialTotalPoint,
        tooltip: {
          valuePrefix: '',
          valueSuffix: ''
        },
        pointPadding: 0.3,
        pointPlacement: 0,
        yAxis: 1
      }, {
        name: 'Soc. Scores',
        color: '#002169',
        data: socialAchivePoint,
        tooltip: {
          valuePrefix: '',
          valueSuffix: ''
        },
        pointPadding: 0.4,
        pointPlacement: 0,
        yAxis: 1
      }, {
        name: 'Gov. Max Points',
        color: 'rgba(255,158,27,0.4)',
        data: governanceTotalPoint,
        tooltip: {
          valuePrefix: '',
          valueSuffix: ''
        },
        pointPadding: 0.3,
        pointPlacement: 0.3,
        yAxis: 1
      }, {
        name: 'Gov. Scores',
        color: '#FF9E1B',
        data: governanceAchivePoint,
        tooltip: {
          valuePrefix: '',
          valueSuffix: ''
        },
        pointPadding: 0.4,
        pointPlacement: 0.3,
        yAxis: 1
      }]
    };

    var returndata = localStorage.getItem('companyGuid') === "a10f5266-03e9-4142-9e7a-8c5f690efdc8" || localStorage.getItem('companyGuid') === "bb3fabe7-e7db-49bf-8900-18a65e05bf0d" ?
      <div id="pdf-view">
        <React.Fragment>
        <div className="breadtitle_wrap">
              {breadCrumb}
              <div className="page_top_title">
                  <div className="page_heading">Portfolio ESG Report</div>
              </div>
          </div>
          {this.state.loader ? <Spinner /> : <div className=" esg_report_container">
            <div className="esg_report_header">
              {localStorage.getItem('companyGuid') === 'a10f5266-03e9-4142-9e7a-8c5f690efdc8' &&
                <h2>ESG REPORT - SOMERSET INDUS CAPITAL PARTNERS
                  <p>BASED ON SELF-DECLARED INFORMATION RECEIVED FROM PORTFOLIO COMPANIES USING IFC QUESTIONNAIRE</p>
                </h2>}
              {localStorage.getItem('companyGuid') === 'bb3fabe7-e7db-49bf-8900-18a65e05bf0d' &&
                <h2>ESG REPORT - FIRESIDE VENTURES
                  <p>BASED ON SELF-DECLARED INFORMATION RECEIVED FROM PORTFOLIO COMPANIES USING PWC QUESTIONNAIRE</p>
                </h2>}
              {localStorage.getItem('companyGuid') !== 'bb3fabe7-e7db-49bf-8900-18a65e05bf0d' && localStorage.getItem('companyGuid') !== 'a10f5266-03e9-4142-9e7a-8c5f690efdc8' &&
                <h2>ESG REPORT
                  <p>BASED ON SELF-DECLARED INFORMATION RECEIVED FROM PORTFOLIO COMPANIES</p>
                </h2>}
              {/* <div className="esg_header_mid">
            <p>ESG Boundaries: <span className="esg_header_mid_value">Not defined</span>  </p> <span>|</span>
            <p>Confidence: <span className="esg_header_mid_value">Low</span></p>
          </div>
          <div className="esg_header_right">
            <span>request survey</span>
            <span>export</span>
          </div> */}
              <div data-html2canvas-ignore="true" className="esg_header_right">
                {/* <span>request survey</span> */}
                <span onClick={this.pdfDownload}>Export</span>
              </div>
            </div>
            <GridContainer className="top_esg_report">
              <GridItem className="esg_report_grid grid1" md={4}>
                <div>
                  <div className="esg_header">
                    <p>{localStorage.getItem('companyGuid') === 'a10f5266-03e9-4142-9e7a-8c5f690efdc8' ? 'Somerset ' : localStorage.getItem('companyGuid') === 'bb3fabe7-e7db-49bf-8900-18a65e05bf0d' ? 'Fireside ' : ''}Portfolio</p>
                    {/* <p>Fireside portfolio</p> */}
                  </div>
                  <div className="esg_content_main">
                    <div className="esg_content_header">
                      <span>Focus Area</span>
                      <span>Avg score</span>
                    </div>
                    <div className="esg_content_data">
                      {/* {console.log(this.state.responseData.table1)} */}
                      {this.state.responseData.table1 === undefined
                        ? ""
                        : this.state.responseData.table1.map((data, i) => {
                          return (
                            <div key={i}>
                              <span>
                                {this.getFocusAreaName(localStorage.getItem('companyGuid'), data.section) === 'Structure and Functioning of Board of Directors' ?
                                  <img src={require("../../assets/img/EsgDashboard/StructureDirectors.png")} /> :
                                  this.getFocusAreaName(localStorage.getItem('companyGuid'), data.section) === 'Data Disclosure' ?
                                    <img src={require("../../assets/img/EsgDashboard/DataDisclosure.png")} /> :
                                    <img src={require("../../assets/img/EsgDashboard/" + data.section + ".svg")} />}
                                <span>{this.getFocusAreaName(localStorage.getItem('companyGuid'), data.section)}</span>
                              </span>
                              <span>{data.averageScore}/{data.maxScore}</span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </GridItem>
              <GridItem className="esg_report_grid grid2" md={4}>
                <div>
                  <div className="esg_header">

                    <p>{localStorage.getItem('companyGuid') === 'a10f5266-03e9-4142-9e7a-8c5f690efdc8' ? 'Somerset ' : localStorage.getItem('companyGuid') === 'bb3fabe7-e7db-49bf-8900-18a65e05bf0d' ? 'Fireside ' : ''}Portfolio</p>
                    <div className="esg_header_tabs">
                      <span className="active_tab">Overall </span> <span>Fund 1 </span><span> Fund 2</span> <span>Fund 3</span>
                    </div>
                  </div>
                  <div className="esg_content_main">
                    <div className="esg_content_header">
                      <span>Company Name</span>
                      <span>bracket (%) <Tooltip id={'bracket_tooltip'} title={<div className="esg_content_main bracket_tooltip">
                        <h6>Bracket Summary</h6>
                        <div className="esg_content_header">
                          <span>Range in %</span>
                          <span>Status</span>
                        </div>
                        <div className="esg_content_data">
                          <div>
                            <span>
                              <p className="best_card"></p>
                              80+
                            </span>
                            <span>Excellent</span>
                          </div>
                          <div>
                            <span>
                              <p className="avg_card"></p>
                              50-80
                            </span>
                            <span>Good</span>
                          </div>
                          <div>
                            <span>
                              <p className="worst_card"></p>
                              0-50
                            </span>
                            <span>Immediate Action Needed</span>
                          </div>
                        </div>
                      </div>}><Info /></Tooltip></span>
                      <span>Rankings</span>
                    </div>
                    <div className="esg_content_data">
                      {this.state.responseData.table2 === undefined
                        ? ""
                        : this.state.responseData.table2.map((data, i) => {
                          let colorCodeClass = "";
                          let percentRange = ""
                          if (data.totalScorePercent >= 80) {
                            colorCodeClass = 'best_card'
                            percentRange = "80+"
                          } else if (data.totalScorePercent >= 50 &&
                            data.totalScorePercent <= 80) {
                            colorCodeClass = 'avg_card'
                            percentRange = "50-80"
                          } else if (data.totalScorePercent >= 0 &&
                            data.totalScorePercent <= 50) {
                            colorCodeClass = 'worst_card'
                            percentRange = "0-50"
                          }
                          return (
                            <div key={i}>
                              <span>
                                <p className={colorCodeClass}></p>
                                {data.companyName}
                              </span>
                              <span>
                                {percentRange}
                              </span>
                              <span>{data.ranking}</span>
                            </div>
                          );
                        })}
                      <div>
                        <span>Funnel</span>
                      </div>
                      <div>
                        <span>Company 6</span>
                        <span>-</span>
                        <span>-</span>
                      </div>
                      <div>
                        <span>Company 7</span>
                        <span>-</span>
                        <span>-</span>
                      </div>
                    </div>
                  </div>
                </div>
              </GridItem>
              <GridItem className="esg_report_grid grid3" md={4}>
                {this.state.responseData.table3 === undefined
                  ? ""
                  : this.state.responseData.table3.map((data, i) => {
                    let colorCodeClass = ""
                    if (data.overallPercent >= 80) {
                      colorCodeClass = 'best_card'
                    } else if (data.overallPercent >= 50 &&
                      data.overallPercent <= 80) {
                      colorCodeClass = 'avg_card'
                    } else if (data.overallPercent >= 0 &&
                      data.overallPercent <= 50) {
                      colorCodeClass = 'worst_card'
                    }
                    return (
                      <div key={i} className={colorCodeClass}>
                        <div>
                          <p>Average Score (Overall)</p>
                        </div>
                        <div>
                          <h5>{localStorage.getItem('companyGuid') === 'a10f5266-03e9-4142-9e7a-8c5f690efdc8' ? 'Somerset ' : localStorage.getItem('companyGuid') === 'bb3fabe7-e7db-49bf-8900-18a65e05bf0d' ? 'Fireside ' : ''}Portfolio</h5>
                          <h5>
                            {data.overallAverageScoreAchieved}/
                            {data.overallTotalScore} <span className="percent">{data.overallPercent}%</span>
                          </h5>

                        </div>
                      </div>
                    );
                  })}
                {this.state.responseData.table1 === undefined
                  ? ""
                  : this.state.responseData.table1.sort(function (a, b) {
                    return a.ranking - b.ranking;
                  }).map((data, i) => {
                    let colorCodeClass = ""
                    if (data.percentScore >= 80) {
                      colorCodeClass = 'best_card'
                    } else if (data.percentScore >= 50 &&
                      data.percentScore <= 80) {
                      colorCodeClass = 'avg_card'
                    } else if (data.percentScore >= 0 &&
                      data.percentScore <= 50) {
                      colorCodeClass = 'worst_card'
                    }
                    return (
                      <React.Fragment key={i}>
                        {data.isBest === 1 && (
                          <div className={colorCodeClass}>
                            <div>
                              <p>Best Performing Focus Area</p>
                            </div>
                            <div>
                              <h5>
                                {this.getFocusAreaName(localStorage.getItem('companyGuid'), data.section) === 'Structure and Functioning of Board of Directors' ?
                                  <img src={require("../../assets/img/EsgDashboard/StructureDirectors-White.png")} /> :
                                  this.getFocusAreaName(localStorage.getItem('companyGuid'), data.section) === 'Data Disclosure' ?
                                    <img src={require("../../assets/img/EsgDashboard/DataDisclosure-White.png")} /> :
                                    <img src={require("../../assets/img/EsgDashboard/" + data.section + "-White.png")} />}
                                {this.getFocusAreaName(localStorage.getItem('companyGuid'), data.section)}
                              </h5>
                              <h5>
                                {data.averageScore}/{data.maxScore}<span className="percent">{data.percentScore}%</span>
                              </h5>
                            </div>
                          </div>
                        )}
                        {data.isWorst === 1 && (
                          <div className={colorCodeClass}>
                            <div>
                              <p>{colorCodeClass === 'worst_card' ? 'Immediate Action Needed ' : 'Least Performing Focus Area'}</p>
                            </div>
                            <div>
                              <h5>
                                {this.getFocusAreaName(localStorage.getItem('companyGuid'), data.section) === 'Structure and Functioning of Board of Directors' ?
                                  <img src={require("../../assets/img/EsgDashboard/StructureDirectors-White.png")} /> :
                                  this.getFocusAreaName(localStorage.getItem('companyGuid'), data.section) === 'Data Disclosure' ?
                                    <img src={require("../../assets/img/EsgDashboard/DataDisclosure-White.png")} /> :
                                    <img src={require("../../assets/img/EsgDashboard/" + data.section + "-White.png")} />}
                                {this.getFocusAreaName(localStorage.getItem('companyGuid'), data.section)}</h5>
                              <h5>
                                {data.averageScore}/{data.maxScore}<span className="percent">{data.percentScore}%</span>
                              </h5>
                            </div>
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
              </GridItem>
            </GridContainer>
            <GridContainer className="esg_performance_chart">
              <GridItem md={12}>
                <HighchartsReact highcharts={Highcharts} options={options} />
              </GridItem>
            </GridContainer>
            <GridContainer className="company_performance_chart">
              <GridItem md={12}>
                <div>
                  <div className="esg_header">
                    {localStorage.getItem('companyGuid') === 'a10f5266-03e9-4142-9e7a-8c5f690efdc8' && <p>IFC FOCUS AREA PERFORMANCE</p>}
                    {localStorage.getItem('companyGuid') === 'bb3fabe7-e7db-49bf-8900-18a65e05bf0d' && <p>PWC FOCUS AREA PERFORMANCE</p>}
                    {localStorage.getItem('companyGuid') !== 'bb3fabe7-e7db-49bf-8900-18a65e05bf0d' && localStorage.getItem('companyGuid') !== 'a10f5266-03e9-4142-9e7a-8c5f690efdc8' &&
                      <p>FOCUS AREA PERFORMANCE</p>
                    }
                  </div>
                  <table className="">
                    <thead>
                      {this.state.responseData.table4 === undefined
                        ? ""
                        : this.state.responseData.table4.map((data, i) => {
                          return (
                            <React.Fragment key={i}>
                              {i === 0 && <tr>
                                <th>Company</th>
                                <th>Overall <p>Out of {data.overallTotalScore}</p></th>
                                {this.state.responseData.table5 === undefined
                                  ? ""
                                  : this.state.responseData.table5.filter(
                                    x => x.companyGuid === data.companyGuid
                                  ).map(
                                    (data, i) => {
                                      return (
                                        <th key={i}>
                                          {/* {data.sectionName} */}
                                          {this.getFocusAreaName(localStorage.getItem('companyGuid'), data.sectionName)}
                                          <p>Out of {data.totalScore}</p>
                                        </th>
                                      );
                                    }
                                  )}
                              </tr>}
                            </React.Fragment>
                          );
                        })}
                    </thead>
                    <tbody>
                      {this.state.responseData.table4 === undefined
                        ? ""
                        : this.state.responseData.table4.map((data, i) => {
                          let colorCodeClass = ""
                          if (data.overallPercent >= 80) {
                            colorCodeClass = 'best_card'
                          } else if (data.overallPercent >= 50 &&
                            data.overallPercent <= 80) {
                            colorCodeClass = 'avg_card'
                          } else if (data.overallPercent >= 0 &&
                            data.overallPercent <= 50) {
                            colorCodeClass = 'worst_card'
                          }
                          return (
                            <tr key={i}>
                              <td><a href={"/pwcframework?company=" + data.companyGuid} target="_blank">{data.companyName}</a></td>
                              <td>
                                <div className={colorCodeClass}>{data.overallScoreAchieved}</div>
                              </td>
                              {this.state.responseData.table5 === undefined
                                ? ""
                                : this.state.responseData.table5
                                  .filter(
                                    x => x.companyGuid === data.companyGuid
                                  )
                                  .map((data, i) => {
                                    let colorCodeClass = ""
                                    if (data.percentScore >= 80) {
                                      colorCodeClass = 'best_card'
                                    } else if (data.percentScore >= 50 &&
                                      data.percentScore <= 80) {
                                      colorCodeClass = 'avg_card'
                                    } else if (data.percentScore >= 0 &&
                                      data.percentScore <= 50) {
                                      colorCodeClass = 'worst_card'
                                    }
                                    return (
                                      <td key={i}>
                                        <div className={colorCodeClass}>{data.scoreAchieved}</div>
                                      </td>
                                    );
                                  })}
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </GridItem>
            </GridContainer>
            <GridContainer className="esg_bottom_section">
              <GridItem md={4}>
                <div className="env_section">
                  <h3>Environment</h3>
                  <div>
                    <div className="left_icon">
                      <img src={require("../../assets/img/EsgDashboard/Co2.svg")} />
                    </div>
                    <div className="right_content">
                      {this.state.responseData.table6 === undefined
                        ? ""
                        : this.state.responseData.table6.map((data, i) => {
                          return (
                            <React.Fragment key={i}>
                              <h6>Total stated carbon footprints</h6>
                              <h3>
                                {data.totalCarbonFootprint}
                                <p>Ton Co2 Equivalent</p>
                              </h3>
                            </React.Fragment>
                          );
                        })}
                      {/* <div className="carbon_tax">
                      <p>
                        This is equal to <b>2000</b> of carbon tax in EU region
                      </p>
                    </div> */}
                      <div>
                        <div className="esg_content_main">
                          <div className="esg_content_header">
                            <p>Carbon Footprint (%)</p>
                          </div>
                          <div className="esg_content_data">
                            {this.state.responseData.table14 === undefined
                              ? ""
                              : this.state.responseData.table14.map((data, i) => {
                                return (
                                  <div>
                                    <span>
                                      {data.companyName}
                                    </span>
                                    <span>{data.carbonFootprint}</span>
                                  </div>
                                )
                              })}
                          </div>
                        </div>
                        {/* {this.state.responseData.table7 === undefined
                      ? ""
                      : this.state.responseData.table7.map((data, i) => {
                        let colorCodeClass = ""
                            if(data.percentScore >= 80) {
                              colorCodeClass = 'best_card'
                            } else if(data.percentScore >= 50 &&
                              data.percentScore <= 80){
                                colorCodeClass = 'avg_card'
                            } else if(data.percentScore >= 0 &&
                              data.percentScore <= 50){
                                colorCodeClass = 'worst_card'
                            }
                        return (
                          <React.Fragment key={i}>
                            {data.isBest === 1 && (
                              <div>
                                <span>Best Performing:</span>
                                <span>
                                  {" "}
                                  {data.companyName} ({data.averageScore}/
                                    {data.maxScore})
                                  </span>
                              </div>
                            )}
                            {data.isWorst === 1 && (
                              <div>
                                <span>{colorCodeClass === 'worst_card' ? 'Immediate Action Needed:': 'Least Performing Focus Area:'}</span>
                                <span>
                                  {" "}
                                  {data.companyName} ({data.averageScore}/
                                    {data.maxScore})
                                  </span>
                              </div>
                            )}
                          </React.Fragment>
                        );
                      })} */}
                      </div>
                    </div>
                  </div>
                </div>
              </GridItem>
              <GridItem md={4}>
                <div className="social_section">
                  <h3>Social</h3>
                  {this.state.responseData.table8 === undefined
                    ? ""
                    : sectionHeading.length > 0 && sectionHeading.map((x) => (
                      <React.Fragment key={x}>
                        <div>
                          <div className="left_icon">
                            {this.getFocusAreaName(localStorage.getItem('companyGuid'), x) === 'Structure and Functioning of Board of Directors' ?
                              <img src={require("../../assets/img/EsgDashboard/StructureDirectors.png")} /> :
                              this.getFocusAreaName(localStorage.getItem('companyGuid'), x) === 'Data Disclosure' ?
                                <img src={require("../../assets/img/EsgDashboard/DataDisclosure.png")} /> :
                                <img src={require("../../assets/img/EsgDashboard/" + x + ".svg")} />}
                          </div>
                          <div className="right_content">
                            <h6>
                              {/* {x} */}
                              {this.getFocusAreaName(localStorage.getItem('companyGuid'), x)}
                            </h6>
                            {this.state.responseData.table8.filter(y => y.sectionName === x).map((data, i) => {
                              // let colorCodeClass = ""
                              // if(data.percentScore >= 80) {
                              //   colorCodeClass = 'best_card'
                              // } else if(data.percentScore >= 50 &&
                              //   data.percentScore <= 80){
                              //     colorCodeClass = 'avg_card'
                              // } else if(data.percentScore >= 0 &&
                              //   data.percentScore <= 50){
                              //     colorCodeClass = 'worst_card'
                              // }
                              return (
                                <div>
                                  {data.isBest === 1 && (
                                    <div>
                                      <span>Best Performing:</span>
                                      <span>
                                        {" "}
                                        {data.companyName} ({data.averageScore}/
                                        {data.maxScore})
                                      </span>
                                    </div>
                                  )}
                                  {data.isWorst === 1 && (
                                    <div>
                                      <span>Least Performing: </span>
                                      <span>
                                        {" "}
                                        {data.companyName} ({data.averageScore}/
                                        {data.maxScore})
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </React.Fragment>
                    ))}
                </div>
              </GridItem>
              <GridItem md={4}>
                <div className="governance_section">
                  <h3>Governance</h3>
                  {this.state.responseData.table9 === undefined
                    ? ""
                    : sectionHeading9.length > 0 && sectionHeading9.map((x) => (
                      <React.Fragment key={x}>
                        <div>
                          <div className="left_icon">
                            {this.getFocusAreaName(localStorage.getItem('companyGuid'), x) === 'Structure and Functioning of Board of Directors' ?
                              <img src={require("../../assets/img/EsgDashboard/StructureDirectors.png")} /> :
                              this.getFocusAreaName(localStorage.getItem('companyGuid'), x) === 'Data Disclosure' ?
                                <img src={require("../../assets/img/EsgDashboard/DataDisclosure.png")} /> :
                                <img src={require("../../assets/img/EsgDashboard/" + x + ".svg")} />}
                          </div>
                          <div className="right_content">
                            <h6>
                              {/* {x} */}
                              {this.getFocusAreaName(localStorage.getItem('companyGuid'), x)}
                            </h6>
                            {this.state.responseData.table9.filter(y => y.sectionName === x).map((data, i) => {
                              // let colorCodeClass = ""
                              // if(data.percentScore >= 80) {
                              //   colorCodeClass = 'best_card'
                              // } else if(data.percentScore >= 50 &&
                              //   data.percentScore <= 80){
                              //     colorCodeClass = 'avg_card'
                              // } else if(data.percentScore >= 0 &&
                              //   data.percentScore <= 50){
                              //     colorCodeClass = 'worst_card'
                              // }
                              return (
                                <div>
                                  {data.isBest === 1 && (
                                    <div>
                                      <span>Best Performing:</span>
                                      <span>
                                        {" "}
                                        {data.companyName} ({data.averageScore}/
                                        {data.maxScore})
                                      </span>
                                    </div>
                                  )}
                                  {data.isWorst === 1 && (
                                    <div>
                                      <span>Least Performing: </span>
                                      <span>
                                        {" "}
                                        {data.companyName} ({data.averageScore}/
                                        {data.maxScore})
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </React.Fragment>
                    ))}
                </div>
              </GridItem>
            </GridContainer>
            <div className="esg_data_top">
              <h5>ESG data received from  {this.state.responseData.table11 === undefined ? "" : <React.Fragment>{this.state.responseData.table11[0].companyName} on {moment(this.state.responseData.table11[0].dateOfSubmission).format("DD-MM-YYYY")}</React.Fragment>} </h5>
              <div>
                <h6>Impact on key areas performance:</h6>
                <div className="key_areas">
                  {this.state.responseData.table12 === undefined
                    ? ""
                    : this.state.responseData.table12.map((data, i) => {
                      return (
                        <span key={i}>Overall: {data.overallPercentChanged}% {data.overallPercentChanged > 0 ? <span style={{ color: '#00B050' }}>▲</span> : <span style={{ color: '#FF0000' }}>▼</span>} </span>
                      );
                    })}
                  {this.state.responseData.table13 === undefined
                    ? ""
                    : this.state.responseData.table13.map((data, i) => {
                      return (
                        // <span key={i}>{data.section}: {data.sectionPercentChanged}% { data.sectionPercentChanged > 0 ? <UpAarrow style={{ color: '#00B050' }}/> : <span style={{ color: '#FF0000' }}>▼</span> }</span>
                        <span key={i}>{this.getFocusAreaName(localStorage.getItem('companyGuid'), data.section)}: {data.sectionPercentChanged}% {data.sectionPercentChanged > 0 ? <span style={{ color: '#00B050' }}>▲</span> : <span style={{ color: '#FF0000' }}>▼</span>}</span>
                      );
                    })}
                  {/* <span>Purpose: 4% <UpAarrow style={{ color: '#00B050' }}/></span>
                <span>Workplace: 4% <span style={{ color: '#FF0000' }}>▼</span></span>
                <span>Community: 4% <UpAarrow style={{ color: '#00B050' }}/></span>
                <span>Workplace: 4% <span style={{ color: '#FF0000' }}>▼</span></span>
                <span>Community: 4% <UpAarrow style={{ color: '#00B050' }}/></span>
                <span>Workplace: 4% <span style={{ color: '#FF0000' }}>▼</span></span> */}
                </div>
              </div>
            </div>
          </div>}</React.Fragment>
      </div>
      : <React.Fragment>

        {this.state.loader ? <Spinner /> : <div id="capture" className=" esg_report_container">
          <div id="pdf-view">
            {this.state.Nodata ? <div id="no_prod_listing_page" className="no-products-found">
              <img alt=" " src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNi4wLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DQo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB3aWR0aD0iNTAwcHgiIGhlaWdodD0iNTAwcHgiIHZpZXdCb3g9IjAgMCA1MDAgNTAwIiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCA1MDAgNTAwIiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxsaW5lYXJHcmFkaWVudCBpZD0iU1ZHSURfMV8iIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiB4MT0iLTEwMDMuMTE5NCIgeTE9IjMxNjUuMzEwNSIgeDI9Ii01OTMuNzg2NCIgeTI9IjMxNjUuMzEwNSIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCgxIDAgMCAtMSAxMDQ4Ljg1NSAzNDA5LjMzMDEpIj4NCgk8c3RvcCAgb2Zmc2V0PSIwIiBzdHlsZT0ic3RvcC1jb2xvcjojRTdFOUZGIi8+DQoJPHN0b3AgIG9mZnNldD0iMSIgc3R5bGU9InN0b3AtY29sb3I6I0QzRkRGNyIvPg0KPC9saW5lYXJHcmFkaWVudD4NCjxwYXRoIGZpbGw9InVybCgjU1ZHSURfMV8pIiBkPSJNNDUuNzM2LDMxOS4yNGMwLDE1Ljc5OSw0LjM1NSwyNC44MTMsOC45NjYsMzEuNzdjMTIuMDM5LDE4LjE3NiwyOC40NDksMjYuMjA5LDQ4LjY1OSwyNA0KCWM1LjE2LTAuNTYzLDEwLjE1LTIuNjA0LDE1LjQxNS00LjAyYzExLjM5NiwxOC4wNDksMjcuMDE3LDI5LjE0OSw0Ny4xMywzMS43NDRjMjAuMjMsMi42MDgsMzcuNDUxLTQuNTgsNTEuOTIxLTE5LjM3OQ0KCWMzMy43NzEsMzkuNTczLDg3LjMwMSw0OC40NjUsMTI4LjkwNSwxOS42MDRjMjUuOTMtMTcuOTg0LDQzLjIxNS00OS40NjksNDQuNDItODUuMDY4YzAuOTc2LTAuODE5LDIuNjI1LTEuMzMsMy43Ni0xLjE2Ng0KCWMyMi43OTYsMy4zNCw0NS4yMy05LjI4NSw1NC45MDQtMzEuNTYxYzIuNDUxLTUuNjM1LDYuODQtMTkuNTg0LDQuNjY2LTMzLjU3Yy0zLjQ5Ni0yMi40NTktMTYuMjQtMzcuMzY5LTM2LjQ0LTQ0LjYxNA0KCWMtMy40NjYtMS4yNC03LjE0LTEuODMtMTAuODgtMi40MmMtMi41MjQtMTMuODgtOC43MjUtMjcuMDQ1LTE4LjI2LTM3LjQ3NWMtNi40OTYtNy4xMDUtMTMuNzM1LTEyLjUwNS0yMS42NDktMTYuMTY1DQoJYy0xNy40NDUtMTAuMTk1LTM1Ljk1NS0xMS4wMTUtNTQuOTQ5LTQuMjg1QzI5Ni41NCw5NC40MywyNDkuMTc3LDYxLjU4NSwxOTcuNDcxLDY5LjIxYy00NS4xNzUsNi42NjUtODUuMTc1LDQ1LjcxLTg5LjcwNSwxMDIuNjMNCgljLTQxLjkyLDExLjIzNS02MS44Myw1Ny43NzUtNDguNjY1LDk2LjYyNWMxLjE0OSwzLjM5NSwyLjQ3OSw2LjYzNSwzLjk3OSw5LjcxNUM1Mi4xOTYsMjg4LjEyOSw0NS43MzEsMzAyLjk2NSw0NS43MzYsMzE5LjI0eiIvPg0KPHBhdGggZmlsbD0iI0ZERkNFRiIgZD0iTTE5MC4zNDYsMjI0LjQ1NWMtMC40OS03LjI2LTcuMzAxLTEyLjcyNS0xNS4yMS0xMi4yMDVjLTEuMDY1LDAuMDctMi4wOTYsMC4yNS0zLjA4LDAuNTINCgljLTAuNjgxLTQuODc1LTUuMzY1LTguNDU1LTEwLjc5LTguMWMtMi45NjUsMC4xOTUtNS41NDUsMS41My03LjI5LDMuNWMwLjE0OS0wLjk4NSwwLjE5NC0yLDAuMTI1LTMuMDMNCgljLTAuNTU2LTguMjk1LTguMzQtMTQuNTQtMTcuMzgtMTMuOTQzIi8+DQo8cGF0aCBmaWxsPSIjNDcyQjI5IiBkPSJNMTg5LjA5NiwyMjQuNTNjLTAuNDQtNi41NjItNi42NzUtMTEuNDk1LTEzLjg3NS0xMS4wNDVjLTAuOTUsMC4wNjktMS45LDAuMjI5LTIuODM1LDAuNDg0DQoJYy0wLjM1MSwwLjEwMi0wLjcxNiwwLjA0LTEuMDIxLTAuMTZjLTAuMy0wLjItMC41LTAuNTItMC41NS0wLjg3NWMtMC41OTUtNC4yNC00LjgtNy4yNC05LjQ3LTcuMDINCgljLTIuNTQ1LDAuMTctNC44MywxLjI2NS02LjQ0LDMuMDg1Yy0wLjM2OSwwLjQxNS0wLjk3LDAuNTQtMS40NjUsMC4zMDVjLTAuNS0wLjIzMy0wLjc5LTAuNzgtMC43MDUtMS4zMjUNCgljMC4xNDEtMC45MSwwLjE4Mi0xLjgzNSwwLjExNS0yLjc2Yy0wLjUxLTcuNi03Ljc2NS0xMy4zMzUtMTYuMDUtMTIuNzg1Yy0wLjcxLDAuMTE1LTEuMjg1LTAuNDctMS4zMy0xLjE2czAuNDc1LTEuMjg1LDEuMTY1LTEuMzMNCgljOS43OC0wLjcwNSwxOC4xMDksNi4xMzUsMTguNzEsMTUuMTA0YzAuMDA1LDAuMSwwLjAxLDAuMTksMC4wMTUsMC4yODVjMS42OTUtMS4xMSwzLjY5LTEuNzc1LDUuODE1LTEuOTENCgljNS41OC0wLjQzNSwxMC40NjUsMi45OTUsMTEuODMsNy44MzVjMC42OC0wLjEzNSwxLjM1OC0wLjIyLDIuMDQ1LTAuMjY1YzguNTc0LTAuNTcsMTYuMDEsNS40MzUsMTYuNTQsMTMuMzcNCgljMC4wNDUsMC42ODgtMC40NzcsMS4yODUtMS4xNjUsMS4zM2MtMC4wMjUsMC4wMDUtMC4wNTYsMC4wMDUtMC4wODUsMC4wMDVDMTg5LjY4NiwyMjUuNywxODkuMTQxLDIyNS4xOTUsMTg5LjA5NiwyMjQuNTN6Ii8+DQo8cGF0aCBmaWxsPSIjRkZGRkZGIiBkPSJNMTQ2LjM2NSwxMDQuNDc1YzAtMS4zOCwxLjEyLTIuNSwyLjUtMi41aDUwLjE1YzEuMzgsMCwyLjUwMSwxLjEyLDIuNTAxLDIuNWMwLDEuMzgtMS4xMjEsMi41LTIuNTAxLDIuNQ0KCWgtNTAuMTVDMTQ3LjQ4NiwxMDYuOTc1LDE0Ni4zNjUsMTA1Ljg1NSwxNDYuMzY1LDEwNC40NzV6IE0xMzEuOTYxLDEwNC40NzVjMC0xLjM4LDEuMTE5LTIuNSwyLjUtMi41aDcuMjI5DQoJYzEuMzgsMCwyLjUsMS4xMiwyLjUsMi41YzAsMS4zOC0xLjEyLDIuNS0yLjUsMi41aC03LjIyOUMxMzMuMDc0LDEwNi45NzUsMTMxLjk2MSwxMDUuODU1LDEzMS45NjEsMTA0LjQ3NXogTTExMS42ODYsMTA0LjQ3NQ0KCWMwLTEuMzgsMS4xMi0yLjUsMi41LTIuNWgxMi43MjZjMS4zODEsMCwyLjUsMS4xMiwyLjUsMi41YzAsMS4zOC0xLjExOSwyLjUtMi41LDIuNWgtMTIuNzI2DQoJQzExMi44MDYsMTA2Ljk3NSwxMTEuNjg2LDEwNS44NTUsMTExLjY4NiwxMDQuNDc1eiBNMTIxLjgxNiw4NS44M2MwLTEuMzgsMS4xMi0yLjUsMi41LTIuNWg0OC4wODVjMS4zOCwwLDIuNSwxLjEyLDIuNSwyLjUNCglzLTEuMTIsMi41LTIuNSwyLjVoLTQ4LjA4NUMxMjIuOTMxLDg4LjMzLDEyMS44MTYsODcuMjEsMTIxLjgxNiw4NS44M3ogTTE3OC41NTYsODUuODNjMC0xLjM4LDEuMTItMi41LDIuNS0yLjVoMi44OTkNCgljMS4zODEsMCwyLjUsMS4xMiwyLjUsMi41cy0xLjExOSwyLjUtMi41LDIuNWgtMi44OTlDMTc5LjY3Niw4OC4zMywxNzguNTU2LDg3LjIxLDE3OC41NTYsODUuODN6IE0xOTAuNDQxLDg1LjgzDQoJYzAtMS4zOCwxLjEyLTIuNSwyLjUtMi41aDcuMjhjMS4zOCwwLDIuNTAxLDEuMTIsMi41MDEsMi41cy0xLjEyMSwyLjUtMi41MDEsMi41aC03LjI4QzE5MS41NTYsODguMzMsMTkwLjQ0MSw4Ny4yMSwxOTAuNDQxLDg1Ljgzeg0KCSBNMTM0LjYzMSw5NS4xNWMwLTEuMzgsMS4xMTktMi41LDIuNS0yLjVoMjUuMTM1YzEuMzgsMCwyLjUsMS4xMiwyLjUsMi41YzAsMS4zOC0xLjEyLDIuNS0yLjUsMi41aC0yNS4xMzUNCglDMTM1Ljc1LDk3LjY1LDEzNC42MzEsOTYuNTMsMTM0LjYzMSw5NS4xNXoiLz4NCjxwYXRoIGZpbGw9IiNGRkZGRkYiIGQ9Ik0xMzQuNjMxLDg1LjgzYzAtMS4zOCwxLjExOS0yLjUsMi41LTIuNWg2LjI4NWMxLjM4LDAsMi41LDEuMTIsMi41LDIuNXMtMS4xMiwyLjUtMi41LDIuNWgtNi4yODUNCglDMTM1Ljc1LDg4LjMzLDEzNC42MzEsODcuMjEsMTM0LjYzMSw4NS44M3ogTTE2Ny4wNDYsOTUuMTVjMC0xLjM4LDEuMTItMi41LDIuNS0yLjVoOC43OTVjMS4zOCwwLDIuNSwxLjEyLDIuNSwyLjUNCgljMCwxLjM4LTEuMTIsMi41LTIuNSwyLjVoLTguNzk1QzE2OC4xNiw5Ny42NSwxNjcuMDQ2LDk2LjUzLDE2Ny4wNDYsOTUuMTV6Ii8+DQo8cGF0aCBmaWxsPSIjMDJBRkY3IiBkPSJNMTM4LjI5MSwzMjguNzg5VjE4MC4yMjVjMC0xOC44MywxNS40MDMtMzQuMjM1LDM0LjIzMy0zNC4yMzVIMzIxLjA5YzE4LjgzLDAsMzQuMjMzLDE1LjQwNSwzNC4yMzMsMzQuMjM1DQoJdjE0OC41NjRjMCwxOC44My0xNS40MDMsMzQuMjM2LTM0LjIzMywzNC4yMzZIMTcyLjUyNkMxNTMuNjk2LDM2My4wMjUsMTM4LjI4NSwzNDcuNjE5LDEzOC4yOTEsMzI4Ljc4OXoiLz4NCjxwYXRoIGZpbGw9IiMzQjNCM0IiIGQ9Ik0xMzQuNzg1LDMyOC43OTVWMTgwLjIzYzAtMjAuODEsMTYuOTMxLTM3Ljc0LDM3LjczOS0zNy43NEgzMjEuMDljMjAuODA1LDAsMzcuNzMzLDE2LjkzLDM3LjczMywzNy43NA0KCXYxNDguNTU5YzAsMjAuODA1LTE2LjkyNCwzNy43MzYtMzcuNzMzLDM3LjczNkgxNzIuNTI2QzE1MS43MTYsMzY2LjUyNSwxMzQuNzg1LDM0OS42LDEzNC43ODUsMzI4Ljc5NXogTTMyMS4wOTEsMTQ5LjQ5NUgxNzIuNTI2DQoJYy0xNi45NDQsMC0zMC43MzMsMTMuNzg1LTMwLjczMywzMC43MzV2MTQ4LjU1OWMwLDE2Ljk0NSwxMy43ODQsMzAuNzMsMzAuNzMzLDMwLjczaDE0OC41NjVjMTYuOTQ4LDAsMzAuNzMzLTEzLjc3OSwzMC43MzMtMzAuNzMNCglWMTgwLjIyNWMwLTE2Ljk0NS0xMy43ODUtMzAuNzM1LTMwLjczMy0zMC43MzVWMTQ5LjQ5NXoiLz4NCjxwYXRoIGZpbGw9IiNGREZDRUUiIGQ9Ik0xNTMuNzg1LDMxOS43NzlWMTg5LjIzNWMwLTE1LjI2LDEyLjQ4NC0yNy43NDUsMjcuNzQ0LTI3Ljc0NWgxMzAuNTQ1YzE1LjI2LDAsMjcuNzQ2LDEyLjQ4NSwyNy43NDYsMjcuNzQ1DQoJdjEzMC41NDRjMCwxNS4yNi0xMi40ODYsMjcuNzQ2LTI3Ljc0NiwyNy43NDZIMTgxLjUzNUMxNjYuMjc2LDM0Ny41MjUsMTUzLjc5MSwzMzUuMDM5LDE1My43ODUsMzE5Ljc3OXoiLz4NCjxwYXRoIGZpbGw9IiMzQjNCM0IiIGQ9Ik0xNTIuMDQxLDMxOS4yNTRWMjQ3LjYyYzAtMC45NywwLjc4My0xLjc1LDEuNzUtMS43NWMwLjk2NSwwLDEuNzUsMC43ODUsMS43NSwxLjc1djcxLjY0DQoJYzAsMTQuNjE5LDExLjg5NSwyNi41MjEsMjYuNTIsMjYuNTIxaDEyOS40OTFjMTQuNjI1LDAsMjYuNTItMTEuOSwyNi41Mi0yNi41MjFWMTg5Ljc3YzAtMTQuNjI1LTExLjg5OS0yNi41MjUtMjYuNTItMjYuNTI1DQoJSDE4OC4yMzZjLTAuOTY1LDAtMS43NS0wLjc4LTEuNzUtMS43NWMwLTAuOTcsMC43ODUtMS43NSwxLjc1LTEuNzVoMTIzLjMxNmMxNi41NTUsMCwzMC4wMiwxMy40NjUsMzAuMDIsMzAuMDJ2MTI5LjQ4OQ0KCWMwLDE2LjU1Ny0xMy40NjUsMzAuMDE2LTMwLjAyLDMwLjAxNkgxODIuMDYxQzE2NS41MTEsMzQ5LjI3LDE1Mi4wNDEsMzM1LjgxMSwxNTIuMDQxLDMxOS4yNTR6IE0xNTIuMDQxLDIzNy4yOFYyMjMuNQ0KCWMwLTAuOTcsMC43ODMtMS43NSwxLjc1LTEuNzVjMC45NjUsMCwxLjc1LDAuNzg1LDEuNzUsMS43NXYxMy43OGMwLDAuOTctMC43ODUsMS43NS0xLjc1LDEuNzUNCglDMTUyLjgyMSwyMzkuMDMsMTUyLjA0MSwyMzguMjUsMTUyLjA0MSwyMzcuMjh6IE0xNTIuMDQxLDIxNi42MTV2LTYuODljMC0wLjk3LDAuNzgzLTEuNzUsMS43NS0xLjc1YzAuOTY1LDAsMS43NSwwLjc4NSwxLjc1LDEuNzUNCgl2Ni44OWMwLDAuOTctMC43ODUsMS43NS0xLjc1LDEuNzVDMTUyLjgyMSwyMTguMzY1LDE1Mi4wNDEsMjE3LjU4LDE1Mi4wNDEsMjE2LjYxNXoiLz4NCjxwYXRoIGZpbGw9IiNGRkZGRkYiIGQ9Ik00MTAuOTMxLDI1MC44OTVjMC0xLjM4LDEuMTIxLTIuNSwyLjUtMi41aDUwLjE0OWMxLjM3OSwwLDIuNSwxLjExOSwyLjUsMi41cy0xLjEyMSwyLjUtMi41LDIuNWgtNTAuMTQ5DQoJQzQxMi4wNTIsMjUzLjM5NSw0MTAuOTMxLDI1Mi4yNzUsNDEwLjkzMSwyNTAuODk1eiBNMzk2LjUyNywyNTAuODk1YzAtMS4zOCwxLjExOS0yLjUsMi41LTIuNWg3LjIyOWMxLjM4MSwwLDIuNSwxLjExOSwyLjUsMi41DQoJcy0xLjExOSwyLjUtMi41LDIuNWgtNy4yMjlDMzk3LjY0MiwyNTMuMzk1LDM5Ni41MjcsMjUyLjI3NSwzOTYuNTI3LDI1MC44OTV6IE0zNzYuMjUsMjUwLjg5NWMwLTEuMzgsMS4xMTktMi41LDIuNS0yLjVoMTIuNzMNCgljMS4zNzksMCwyLjUsMS4xMTksMi41LDIuNXMtMS4xMjEsMi41LTIuNSwyLjVoLTEyLjczQzM3Ny4zNjksMjUzLjM5NSwzNzYuMjUsMjUyLjI3NSwzNzYuMjUsMjUwLjg5NXogTTM3Ni4yNSwyNjAuMjI1DQoJYzAtMS4zODEsMS4xMTktMi41LDIuNS0yLjVoNDguMDhjMS4zNzksMCwyLjUsMS4xMTksMi41LDIuNXMtMS4xMjEsMi41LTIuNSwyLjVoLTQ4LjA4DQoJQzM3Ny4zNjksMjYyLjcyNSwzNzYuMjUsMjYxLjYwNSwzNzYuMjUsMjYwLjIyNXogTTQzMi45OSwyNjAuMjI1YzAtMS4zODEsMS4xMTktMi41LDIuNS0yLjVoMi45YzEuMzc5LDAsMi41LDEuMTE5LDIuNSwyLjUNCglzLTEuMTIxLDIuNS0yLjUsMi41aC0yLjlDNDM0LjExMSwyNjIuNzI1LDQzMi45OSwyNjEuNjA1LDQzMi45OSwyNjAuMjI1eiBNNDQ0Ljg3NSwyNjAuMjI1YzAtMS4zODEsMS4xMTktMi41LDIuNS0yLjVoNy4yNzkNCgljMS4zODEsMCwyLjUsMS4xMTksMi41LDIuNXMtMS4xMTksMi41LTIuNSwyLjVoLTcuMjc5QzQ0NS45OSwyNjIuNzI1LDQ0NC44NzUsMjYxLjYwNSw0NDQuODc1LDI2MC4yMjV6IE0zOTkuMTk3LDI0MS41NzUNCgljMC0xLjM3OSwxLjExOS0yLjUsMi41LTIuNWgyNS4xMzZjMS4zNzksMCwyLjUsMS4xMiwyLjUsMi41YzAsMS4zODEtMS4xMjEsMi41LTIuNSwyLjVoLTI1LjEzNg0KCUM0MDAuMzEyLDI0NC4wNzUsMzk5LjE5NywyNDIuOTU2LDM5OS4xOTcsMjQxLjU3NXogTTM5OS4xOTcsMjMyLjI1YzAtMS4zOCwxLjExOS0yLjUsMi41LTIuNWg2LjI4NWMxLjM3OSwwLDIuNSwxLjEyLDIuNSwyLjUNCglzLTEuMTIxLDIuNS0yLjUsMi41aC02LjI4NUM0MDAuMzEyLDIzNC43NSwzOTkuMTk3LDIzMy42MywzOTkuMTk3LDIzMi4yNXogTTQxNS41MzksMjY5LjU0NWMwLTEuMzgxLDEuMTIxLTIuNSwyLjUtMi41aDguNzkxDQoJYzEuMzc5LDAsMi41LDEuMTE5LDIuNSwyLjVjMCwxLjM3OS0xLjEyMSwyLjUtMi41LDIuNWgtOC43OTFDNDE2LjY1NiwyNzIuMDQ1LDQxNS41MzksMjcwLjkyNCw0MTUuNTM5LDI2OS41NDV6Ii8+DQo8Zz4NCgk8cGF0aCBmaWxsPSIjM0IzQjNCIiBkPSJNMjcxLjE2NSwyODAuMDQxbC0xMS42NTgtMTEuNjY0Yy0xLjIwMy0xLjIwMS0xLjIwMy0zLjE1NiwwLTQuMzYxYzEuMjAzLTEuMjAxLDMuMTU4LTEuMjAxLDQuMzYxLDANCgkJbDExLjY1NywxMS42NjRjMS4yMDEsMS4yMDMsMS4yMDEsMy4xNTgsMCw0LjM2MWMtMC42MDQsMC41OTgtMS4zOTYsMC45LTIuMTg2LDAuOQ0KCQlDMjcyLjU1NCwyODAuOTQxLDI3MS43NjMsMjgwLjYzOSwyNzEuMTY1LDI4MC4wNDF6Ii8+DQoJPHBhdGggZmlsbD0iI0Q4OEYxMyIgZD0iTTMwNi42NTQsMzI3LjgyMmwtMzMuMzEzLTMzLjMxMmMtNC41ODItNC41ODQtNC41ODItMTIuMDc3LDAtMTYuNjU5bDAsMGM0LjU4NC00LjU4NCwxMi4wNzgtNC41ODQsMTYuNjYsMA0KCQlsMzMuMzEzLDMzLjMxM2M0LjU4Miw0LjU4Miw0LjU4MiwxMi4wNzYsMCwxNi42NThsMCwwQzMxOC43MywzMzIuNCwzMTEuMjM2LDMzMi40LDMwNi42NTQsMzI3LjgyMnoiLz4NCgk8cGF0aCBmaWxsPSIjM0IzQjNCIiBkPSJNMzA0LjkxNCwzMjkuNTY4bC0zMy4zMTMtMzMuMzEzYy0yLjY4NC0yLjY4OC00LjE1OC02LjI2OC00LjE1OC0xMC4wNzhjMC0zLjgxMywxLjQ3Ni03LjM4OSw0LjE1OC0xMC4wNzENCgkJYzUuMzY3LTUuMzU5LDE0Ljc4NS01LjM1OSwyMC4xNDYsMGwzMy4zMTEsMzMuMzA3YzUuNTUzLDUuNTYzLDUuNTUzLDE0LjU5OCwwLDIwLjE1NmwwLDBjLTIuNzc1LDIuNzc0LTYuNDI2LDQuMTY0LTEwLjA3LDQuMTY0DQoJCUMzMTEuMzM0LDMzMy43MzIsMzA3LjY5MSwzMzIuMzQ0LDMwNC45MTQsMzI5LjU2OHogTTMyMS41NjgsMzI2LjA3OGMzLjYyNy0zLjYzNSwzLjYyNy05LjU0MywwLTEzLjE2MmwtMzMuMzEzLTMzLjMwNw0KCQljLTMuNDk2LTMuNTEtOS42NjQtMy41MS0xMy4xNjgsMGMtMS43NTIsMS43NDQtMi43MTMsNC4wODItMi43MTMsNi41NzRjMCwyLjQ5MSwwLjk2MSw0LjgzNiwyLjcxMyw2LjU3OWwzMy4zMTMsMzMuMzE0DQoJCUMzMTIuMDMxLDMyOS43MTUsMzE3LjkzNSwzMjkuNzE1LDMyMS41NjgsMzI2LjA3OEwzMjEuNTY4LDMyNi4wNzh6Ii8+DQoJPHBhdGggZmlsbD0iIzAyQUZGNyIgZD0iTTI3NC4wMjEsMjkyLjU0M2wwLjY0OCwwLjY0OGwxMi42NDctMTIuNjVsMS40MDYtMS40MDhsLTAuNjQ2LTAuNjQ2Yy0zLjU2Mi0zLjU2LTkuNjMtMy4zMDYtMTMuNDk2LDAuNTYzDQoJCUMyNzAuNzE0LDI4Mi45MDgsMjcwLjQ2MiwyODguOTg0LDI3NC4wMjEsMjkyLjU0M3oiLz4NCgk8cGF0aCBmaWxsPSIjM0IzQjNCIiBkPSJNMjczLjAwOSwyOTYuNTE2Yy0wLjktMC44OTktMC45LTIuMzc1LDAtMy4yNzRsMTQuOTg4LTE0Ljk4OGMwLjg5OS0wLjkxMiwyLjM2Ni0wLjkwNiwzLjI3LTAuMDA2DQoJCWMwLjg5OCwwLjg5OSwwLjg5OCwyLjM2NywwLDMuMjcxbC0xNC45ODgsMTVjLTAuNDUsMC40NDItMS4wNDMsMC42NzItMS42MzUsMC42NzINCgkJQzI3NC4wNDYsMjk3LjE4OCwyNzMuNDU4LDI5Ni45NjUsMjczLjAwOSwyOTYuNTE2eiIvPg0KCTxwYXRoIGZpbGw9IiNFMUUwRDgiIGQ9Ik0xODguNCwyNjYuMTg4YzIwLjIzNiwyMC4yMzYsNTMuMDQ5LDIwLjIzNiw3My4yODUsMGMyMC4yMzYtMjAuMjM1LDIwLjIzNi01My4wNDksMC03My4yODQNCgkJYy0yMC4yMzYtMjAuMjM3LTUzLjA0OS0yMC4yMzctNzMuMjg1LDBDMTY4LjE1NiwyMTMuMTQ1LDE2OC4xNTYsMjQ1Ljk1OCwxODguNCwyNjYuMTg4eiIvPg0KCTxwYXRoIGZpbGw9IiMzQjNCM0IiIGQ9Ik0xODYuNjU0LDI2Ny45MzljLTIxLjE2OC0yMS4xNjctMjEuMTY4LTU1LjYwOCwwLTc2Ljc4MmMyMS4xNjItMjEuMTY4LDU1LjYwOS0yMS4xNjIsNzYuNzc3LDANCgkJYzIxLjE2OCwyMS4xNjcsMjEuMTY4LDU1LjYwOSwwLDc2Ljc4MmMtMTAuNTg0LDEwLjU4NC0yNC40ODYsMTUuODY5LTM4LjM4OSwxNS44NjkNCgkJQzIxMS4xMzksMjgzLjgwOSwxOTcuMjM4LDI3OC41MjMsMTg2LjY1NCwyNjcuOTM5eiBNMTkwLjEzOCwxOTQuNjU0Yy0xOS4yNDMsMTkuMjQyLTE5LjI0Myw1MC41NTEsMCw2OS43OTUNCgkJYzE5LjIzOCwxOS4yNDgsNTAuNTUzLDE5LjI1Niw2OS44MDEsMGMxOS4yNDQtMTkuMjQ0LDE5LjI0NC01MC41NTMsMC02OS43OTVjLTkuNjIxLTkuNjI4LTIyLjI2LTE0LjQzOS0zNC44OTYtMTQuNDM5DQoJCUMyMTIuNDA0LDE4MC4yMTUsMTk5Ljc2NywxODUuMDI2LDE5MC4xMzgsMTk0LjY1NHogTTMxNy4zNTUsMzMxLjgzOGMtMC40MDYtMC4xMjktMC42MjktMC41NjYtMC40OTgtMC45NjlsNS43NjctMTcuOTE4DQoJCWMwLjEyOS0wLjQsMC41NjctMC42MjksMC45NjktMC40OThjMC40MDgsMC4xMjksMC42MjksMC41NjYsMC41LDAuOTY5bC01Ljc2OSwxNy45MTZjLTAuMTA0LDAuMzI2LTAuNDA1LDAuNTM3LTAuNzMzLDAuNTM3DQoJCUMzMTcuNTA5LDMzMS44NzUsMzE3LjQzNSwzMzEuODYxLDMxNy4zNTUsMzMxLjgzOHogTTMxMy43MjQsMzMwLjU5OGMtMC40MDgtMC4xMTUtMC42NDQtMC41NTUtMC41MjEtMC45NjFsNi41MzktMjEuOTU3DQoJCWMwLjExNS0wLjQwMSwwLjU0MS0wLjYxLDAuOTU1LTAuNTJjMC40MDYsMC4xMTcsMC42NDIsMC41NTcsMC41MTksMC45NjNsLTYuNTM3LDIxLjk1N2MtMC4xMDEsMC4zMzItMC40MDgsMC41NDktMC43NCwwLjU0OQ0KCQlDMzEzLjg2NSwzMzAuNjI5LDMxMy43ODksMzMwLjYxNywzMTMuNzI0LDMzMC41OTh6IE0zMTEuNTIxLDMyMi44ODNjLTAuNDA2LTAuMTE3LTAuNjQ0LTAuNTU1LTAuNTE5LTAuOTYzbDUuNDcyLTE4LjM3NQ0KCQljMC4xMTUtMC4zOTgsMC41NDMtMC42MDksMC45NTUtMC41MThjMC40MDcsMC4xMTksMC42NDEsMC41NTcsMC41MiwwLjk2M2wtNS40NzMsMTguMzc1Yy0wLjA5OSwwLjMzMi0wLjQwNiwwLjU0Ny0wLjc0LDAuNTQ3DQoJCUMzMTEuNjYyLDMyMi45MTIsMzExLjU4OSwzMjIuOSwzMTEuNTIxLDMyMi44ODN6IE0zMDkuMjg3LDMxNC44MzRjLTAuNDA3LTAuMTIzLTAuNjQzLTAuNTU3LTAuNTItMC45NjNsMy44NTUtMTIuOTU5DQoJCWMwLjExNi0wLjM5NSwwLjU0OS0wLjYxNywwLjk1Ny0wLjUxOGMwLjQwNSwwLjExNiwwLjY0MSwwLjU1NSwwLjUxOCwwLjk2M2wtMy44NTUsMTIuOTU3Yy0wLjA5OCwwLjMzNC0wLjQwNSwwLjU1MS0wLjczNywwLjU1MQ0KCQlDMzA5LjQzNSwzMTQuODY1LDMwOS4zNjMsMzE0Ljg1MiwzMDkuMjg3LDMxNC44MzR6Ii8+DQoJPHBhdGggZmlsbD0iI0YwNTc0MyIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2Utd2lkdGg9IjMiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgZD0iTTE5NS45MDIsMjAwLjQwNw0KCQljLTE2LjA5OCwxNi4wOTYtMTYuMSw0Mi4xOTUtMC4wMDIsNTguMjkyYzE2LjA5OSwxNi4wOTYsNDIuMTk1LDE2LjA5OCw1OC4yOTMsMGMxNi4wOTktMTYuMDk1LDE2LjA5OS00Mi4xOTUsMC01OC4yOTINCgkJQzIzOC4wOTcsMTg0LjMxLDIxMS45OTcsMTg0LjMwOSwxOTUuOTAyLDIwMC40MDd6Ii8+DQoJPHBhdGggZmlsbD0iIzNCM0IzQiIgZD0iTTE5NC40NzUsMjYwLjEwNUwxOTQuNDc1LDI2MC4xMDVMMTk0LjQ3NSwyNjAuMTA1Yy04LjE2Ny04LjE1OC0xMi42NjMtMTkuMDE2LTEyLjY2My0zMC41NjINCgkJczQuNDk2LTIyLjQwMSwxMi42NjMtMzAuNTYxYzguMTY1LTguMTczLDE5LjAyMi0xMi42NjksMzAuNTY3LTEyLjY2OWMxMS41NTMsMCwyMi4zOTksNC41MDIsMzAuNTY3LDEyLjY2OQ0KCQljOC4xNiw4LjE2LDEyLjY1NCwxOS4wMTUsMTIuNjU0LDMwLjU2MXMtNC40OTQsMjIuNDAyLTEyLjY1NCwzMC41NjJjLTguMTY4LDguMTc0LTE5LjAxNiwxMi42Ny0zMC41NjcsMTIuNjcNCgkJQzIxMy40OTcsMjcyLjc3NSwyMDIuNjQsMjY4LjI3OSwxOTQuNDc1LDI2MC4xMDV6IE0xOTcuMzEyLDIwMS44MTVjLTcuNDA3LDcuNDA4LTExLjQ5MSwxNy4yNTctMTEuNDkxLDI3LjczDQoJCWMwLDEwLjQ3Myw0LjA4NCwyMC4zMjMsMTEuNDkxLDI3LjczbDAsMGM3LjQwOCw3LjQwOCwxNy4yNTgsMTEuNDgzLDI3LjczLDExLjQ4M2MxMC40NzksMCwyMC4zMjEtNC4wNzUsMjcuNzI5LTExLjQ4Mw0KCQlzMTEuNDg0LTE3LjI1OCwxMS40ODQtMjcuNzNjMC0xMC40NzItNC4wNzYtMjAuMzIyLTExLjQ4NC0yNy43M3MtMTcuMjUyLTExLjQ4NS0yNy43MjktMTEuNDg1DQoJCUMyMTQuNTYyLDE5MC4zMywyMDQuNzIsMTk0LjQwNywxOTcuMzEyLDIwMS44MTV6Ii8+DQo8L2c+DQo8Zz4NCgk8cGF0aCBmaWxsPSIjRkZGRkZGIiBzdHJva2U9IiMzQjNCM0IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBkPSJNMjMyLjMxLDIwMC43MjRsLTIuOTIyLDQ0LjQ0NQ0KCQljMCwxLjYwNS0xLjMxMSwyLjkxMi0yLjkyLDIuOTEyYy0xLjYwNywwLTIuOTEyLTEuMzA3LTIuOTEyLTIuOTEybC0yLjkyOC00NC40NDVjMC0yLjkxOCw0LjIzMS0yLjkxOCw1LjgzOC0yLjkxOA0KCQlDMjI4LjA3MiwxOTcuODA2LDIzMi4zMSwxOTcuODEsMjMyLjMxLDIwMC43MjR6Ii8+DQoJPHBhdGggZmlsbD0iI0ZGRkZGRiIgc3Ryb2tlPSIjM0IzQjNCIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgZD0iTTIzMS4xMzgsMjU1Ljc5MXYxLjk5DQoJCWMwLDEuODg5LTMuMzEzLDMuNDMtNC42NjYsMy40M2MtMS4zNSwwLTQuNjY0LTEuNTQxLTQuNjY0LTMuNDN2LTEuOTljMC0xLjg5MywzLjMxNC0zLjQyOCw0LjY2NC0zLjQyOA0KCQlDMjI3LjgyNCwyNTIuMzYzLDIzMS4xMzgsMjUzLjg5OCwyMzEuMTM4LDI1NS43OTF6Ii8+DQo8L2c+DQo8L3N2Zz4NCg==                
"/>
              <h5>Oops! there is no data.</h5>
              {/* <Button orangeSubmit><Link to="listing-page">SHOP</Link></Button> */}
            </div> :
              <React.Fragment>
                <div className="esg_report_header">
                  {localStorage.getItem('companyGuid') === 'a10f5266-03e9-4142-9e7a-8c5f690efdc8' &&
                    <h2>ESG REPORT - SOMERSET INDUS CAPITAL PARTNERS
                      <p>BASED ON SELF-DECLARED INFORMATION RECEIVED FROM PORTFOLIO COMPANIES USING IFC QUESTIONNAIRE</p>
                    </h2>}
                  {localStorage.getItem('companyGuid') === 'bb3fabe7-e7db-49bf-8900-18a65e05bf0d' &&
                    <h2>ESG REPORT - FIRESIDE VENTURES
                      <p>BASED ON SELF-DECLARED INFORMATION RECEIVED FROM PORTFOLIO COMPANIES USING PWC QUESTIONNAIRE</p>
                    </h2>}
                  {localStorage.getItem('companyGuid') !== 'bb3fabe7-e7db-49bf-8900-18a65e05bf0d' && localStorage.getItem('companyGuid') !== 'a10f5266-03e9-4142-9e7a-8c5f690efdc8' &&
                    <h2>ESG REPORT
                      <p>BASED ON SELF-DECLARED INFORMATION RECEIVED FROM PORTFOLIO COMPANIES</p>
                    </h2>}
                  {/* <div className="esg_header_mid">
    <p>ESG Boundaries: <span className="esg_header_mid_value">Not defined</span>  </p> <span>|</span>
    <p>Confidence: <span className="esg_header_mid_value">Low</span></p>
      </div> */}
                  <div data-html2canvas-ignore="true" className="esg_header_right">
                    {/* <span>request survey</span> */}
                    <span onClick={this.pdfDownload}>Export</span>
                  </div>
                </div>
                <GridContainer className="top_esg_report">
                  <GridItem className="esg_report_grid grid1" md={4}>
                    <div>
                      <div className="esg_header">
                        <p>{localStorage.getItem('companyGuid') === 'a10f5266-03e9-4142-9e7a-8c5f690efdc8' ? 'Somerset ' : localStorage.getItem('companyGuid') === 'bb3fabe7-e7db-49bf-8900-18a65e05bf0d' ? 'Fireside ' : ''}Portfolio</p>
                        {/* <p>Fireside portfolio</p> */}
                      </div>
                      <div className="esg_content_main">
                        <div className="esg_content_header">
                          <span>Focus Area</span>
                          <span>{JSON.parse(localStorage.getItem('userType')) === 'BUYER' ? 'Score' : 'Avg score'}</span>
                        </div>
                        <div className="esg_content_data">
                          {this.state.responseData.table1 === undefined
                            ? ""
                            : this.state.responseData.table1.map((data, i) => {
                              return (
                                <div key={i}>
                                  <span>
                                    <img src={require("../../assets/img/EsgDashboard/" + data.section + ".svg")} />
                                    <span>{data.section}</span>
                                  </span>
                                  <span>{data.averageScore}/{data.maxScore}</span>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    </div>
                  </GridItem>
                  <GridItem className="esg_report_grid grid2" md={4}>
                    <div>
                      <div className="esg_header">
                        <p>Portfolio</p>
                      </div>
                      <div className="esg_content_main">
                        <div className="esg_content_header">
                          <span>Company Name</span>
                          <span>bracket (%) <Tooltip id={'bracket_tooltip'} title={<div className="esg_content_main bracket_tooltip">
                            <h6>Bracket Summary</h6>
                            <div className="esg_content_header">
                              <span>Range in %</span>
                              <span>Status</span>
                            </div>
                            <div className="esg_content_data">
                              <div>
                                <span>
                                  <p className="best_card"></p>
                                  80+
                                </span>
                                <span>Excellent</span>
                              </div>
                              <div>
                                <span>
                                  <p className="avg_card"></p>
                                  50-80
                                </span>
                                <span>Good</span>
                              </div>
                              <div>
                                <span>
                                  <p className="worst_card"></p>
                                  0-50
                                </span>
                                <span>Immediate Action Needed</span>
                              </div>
                            </div>
                          </div>}><Info /></Tooltip></span>
                          <span>Rankings</span>
                        </div>
                        <div className="esg_content_data">
                          {this.state.responseData.table2 === undefined
                            ? ""
                            : this.state.responseData.table2.map((data, i) => {
                              let colorCodeClass = "";
                              let percentRange = ""
                              if (data.totalScorePercent >= 80) {
                                colorCodeClass = 'best_card'
                                percentRange = "80+"
                              } else if (data.totalScorePercent >= 50 &&
                                data.totalScorePercent <= 80) {
                                colorCodeClass = 'avg_card'
                                percentRange = "50-80"
                              } else if (data.totalScorePercent >= 0 &&
                                data.totalScorePercent <= 50) {
                                colorCodeClass = 'worst_card'
                                percentRange = "0-50"
                              }
                              return (
                                <div key={i}>
                                  <span>
                                    <p className={colorCodeClass}></p>
                                    {data.companyName}
                                  </span>
                                  <span>
                                    {percentRange}
                                  </span>
                                  <span>{data.ranking}</span>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    </div>
                  </GridItem>
                  <GridItem className="esg_report_grid grid3" md={4}>
                    {this.state.responseData.table3 === undefined
                      ? ""
                      : this.state.responseData.table3.map((data, i) => {
                        let colorCodeClass = ""
                        if (data.overallPercent >= 80) {
                          colorCodeClass = 'best_card'
                        } else if (data.overallPercent >= 50 &&
                          data.overallPercent <= 80) {
                          colorCodeClass = 'avg_card'
                        } else if (data.overallPercent >= 0 &&
                          data.overallPercent <= 50) {
                          colorCodeClass = 'worst_card'
                        }
                        return (
                          <div key={i} className={colorCodeClass}>
                            <div>
                              <p>{JSON.parse(localStorage.getItem('userType')) === 'BUYER' ? 'Overall Scroe' : 'Average Score'}</p>
                            </div>
                            <div>
                              <h5>Portfolio</h5>
                              <h5>
                                {data.overallAverageScoreAchieved}/
                                {data.overallTotalScore} <span className="percent">{data.overallPercent}%</span>
                              </h5>

                            </div>
                          </div>
                        );
                      })}
                    {this.state.responseData.table1 === undefined
                      ? ""
                      : this.state.responseData.table1.sort(function (a, b) {
                        return a.ranking - b.ranking;
                      }).map((data, i) => {
                        let colorCodeClass = ""
                        if (data.percentScore >= 80) {
                          colorCodeClass = 'best_card'
                        } else if (data.percentScore >= 50 &&
                          data.percentScore <= 80) {
                          colorCodeClass = 'avg_card'
                        } else if (data.percentScore >= 0 &&
                          data.percentScore <= 50) {
                          colorCodeClass = 'worst_card'
                        }
                        return (
                          <React.Fragment key={i}>
                            {data.isBest === 1 && (
                              <div className={colorCodeClass}>
                                <div>
                                  <p>Best Performing Focus Area</p>
                                </div>
                                <div>
                                  <h5>
                                    <img src={require("../../assets/img/EsgDashboard/" + data.section + "-White.png")} />
                                    {data.section}
                                  </h5>
                                  <h5>
                                    {data.averageScore}/{data.maxScore}<span className="percent">{data.percentScore}%</span>
                                  </h5>
                                </div>
                              </div>
                            )}
                            {data.isWorst === 1 && (
                              <div className={colorCodeClass}>
                                <div>
                                  <p>{colorCodeClass === 'worst_card' ? 'Immediate Action Needed ' : 'Least Performing Focus Area'}</p>
                                </div>
                                <div>
                                  <h5>
                                    <img src={require("../../assets/img/EsgDashboard/" + data.section + "-White.png")} />
                                    {data.section}
                                  </h5>
                                  <h5>
                                    {data.averageScore}/{data.maxScore}<span className="percent">{data.percentScore}%</span>
                                  </h5>
                                </div>
                              </div>
                            )}
                          </React.Fragment>
                        );
                      })}
                  </GridItem>
                </GridContainer>
                <GridContainer className="esg_performance_chart">
                  <GridItem md={12}>
                    <HighchartsReact highcharts={Highcharts} options={options} />
                  </GridItem>
                </GridContainer>
                <GridContainer className="company_performance_chart">
                  <GridItem md={12}>
                    <div>
                      <div className="esg_header">
                        <p>FOCUS AREA PERFORMANCE</p>
                      </div>
                      <table className="">
                        <thead>
                          {this.state.responseData.table4 === undefined
                            ? ""
                            : this.state.responseData.table4.map((data, i) => {
                              return (
                                <React.Fragment key={i}>
                                  {i === 0 && <tr>
                                    <th>Company</th>
                                    <th>Overall <p>Out of {data.overallTotalScore}</p></th>
                                    {this.state.responseData.table5 === undefined
                                      ? ""
                                      : this.state.responseData.table5.filter(
                                        x => x.companyName === data.companyName
                                      ).map(
                                        (data, i) => {
                                          return (
                                            <th key={i}>
                                              {data.sectionName}
                                              <p>Out of {data.totalScore}</p>
                                            </th>
                                          );
                                        }
                                      )}
                                  </tr>}
                                </React.Fragment>
                              );
                            })}
                        </thead>
                        <tbody>
                          {this.state.responseData.table4 === undefined
                            ? ""
                            : this.state.responseData.table4.map((data, i) => {
                              let colorCodeClass = ""
                              if (data.overallPercent >= 80) {
                                colorCodeClass = 'best_card'
                              } else if (data.overallPercent >= 50 &&
                                data.overallPercent <= 80) {
                                colorCodeClass = 'avg_card'
                              } else if (data.overallPercent >= 0 &&
                                data.overallPercent <= 50) {
                                colorCodeClass = 'worst_card'
                              }
                              return (
                                <tr key={i}>
                                  {/* <td><a href={"/pwcframework?company=" + data.companyGuid} target="_blank">{data.companyName}</a></td> */}
                                  <td>{data.companyName}</td>
                                  <td>
                                    <div className={colorCodeClass}>{data.overallScoreAchieved}</div>
                                  </td>
                                  {this.state.responseData.table5 === undefined
                                    ? ""
                                    : this.state.responseData.table5
                                      .filter(
                                        x => x.companyName === data.companyName
                                      )
                                      .map((data, i) => {
                                        let colorCodeClass = ""
                                        if (data.percentScore >= 80) {
                                          colorCodeClass = 'best_card'
                                        } else if (data.percentScore >= 50 &&
                                          data.percentScore <= 80) {
                                          colorCodeClass = 'avg_card'
                                        } else if (data.percentScore >= 0 &&
                                          data.percentScore <= 50) {
                                          colorCodeClass = 'worst_card'
                                        }
                                        return (
                                          <td key={i}>
                                            <div className={colorCodeClass}>{data.scoreAchieved}</div>
                                          </td>
                                        );
                                      })}
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </GridItem>
                </GridContainer>
                {JSON.parse(localStorage.getItem('userType')) === 'VENTURECAPITALIST' && ShowOtherCompanyDetails === false ? <React.Fragment>
                  <GridContainer className="esg_bottom_section">
                    <GridItem md={4}>
                      <div className="env_section">
                        <h3>Environment</h3>
                        <div className="right_content">
                          <div>
                            {this.state.responseData.table7 === undefined
                              ? ""
                              : this.state.responseData.table7.map((data, i) => {
                                let colorCodeClass = ""
                                if (data.percentScore >= 80) {
                                  colorCodeClass = 'best_card'
                                } else if (data.percentScore >= 50 &&
                                  data.percentScore <= 80) {
                                  colorCodeClass = 'avg_card'
                                } else if (data.percentScore >= 0 &&
                                  data.percentScore <= 50) {
                                  colorCodeClass = 'worst_card'
                                }
                                return (
                                  <React.Fragment key={i}>
                                    {data.isBest === 1 && (
                                      <div>
                                        <span>Best Performing:</span>
                                        <span>
                                          {" "}
                                          {data.companyName} ({data.averageScore}/
                                          {data.maxScore})
                                        </span>
                                      </div>
                                    )}
                                    {data.isWorst === 1 && (
                                      <div>
                                        {/* <span>{colorCodeClass === 'worst_card' ? 'Immediate Action Needed:': 'Least Performing Focus Area:'}</span> */}
                                        <span>Least Performing</span>
                                        <span>
                                          {" "}
                                          {data.companyName} ({data.averageScore}/
                                          {data.maxScore})
                                        </span>
                                      </div>
                                    )}
                                  </React.Fragment>
                                );
                              })}
                          </div>
                        </div>
                        <div>
                          <div className="left_icon">
                            <img src={require("../../assets/img/EsgDashboard/Co2.svg")} />
                          </div>
                          <div className="right_content">
                            {this.state.responseData.table6 === undefined
                              ? ""
                              : this.state.responseData.table6.map((data, i) => {
                                return (
                                  <React.Fragment key={i}>
                                    <h6>Total stated carbon footprints</h6>
                                    <h3>
                                      {data.totalCarbonFootprint}
                                      <p>Ton Co2 Equivalent</p>
                                    </h3>
                                  </React.Fragment>
                                );
                              })}
                            {/* <div className="carbon_tax">
              <p>
                This is equal to <b>2000</b> of carbon tax in EU region
              </p>
            </div> */}
                            <div>
                              <div className="esg_content_main">
                                <div className="esg_content_header">
                                  <p>Carbon Footprint (%)</p>
                                </div>
                                <div className="esg_content_data">
                                  {this.state.responseData.table14 === undefined
                                    ? ""
                                    : this.state.responseData.table14.map((data, i) => {
                                      return (
                                        <div>
                                          <span>
                                            {data.companyName}
                                          </span>
                                          <span>{data.carbonFootprint}</span>
                                        </div>
                                      )
                                    })}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </GridItem>
                    <GridItem md={4}>
                      <div className="social_section">
                        <h3>Social</h3>
                        <div className="right_content">
                          <div>
                            {this.state.responseData.table8 === undefined
                              ? ""
                              : this.state.responseData.table8.map((data, i) => {
                                // let colorCodeClass = ""
                                // if(data.percentScore >= 80) {
                                //   colorCodeClass = 'best_card'
                                // } else if(data.percentScore >= 50 &&
                                //   data.percentScore <= 80){
                                //     colorCodeClass = 'avg_card'
                                // } else if(data.percentScore >= 0 &&
                                //   data.percentScore <= 50){
                                //     colorCodeClass = 'worst_card'
                                // }
                                return (
                                  <div>
                                    {data.isBest === 1 && (
                                      <div>
                                        <span>Best Performing:</span>
                                        <span>
                                          {" "}
                                          {data.companyName} ({data.averageScore}/
                                          {data.maxScore})
                                        </span>
                                      </div>
                                    )}
                                    {data.isWorst === 1 && (
                                      <div>
                                        <span>Least Performing: </span>
                                        <span>
                                          {" "}
                                          {data.companyName} ({data.averageScore}/
                                          {data.maxScore})
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                )
                              })
                            }
                          </div>
                        </div>
                      </div>
                    </GridItem>
                    <GridItem md={4}>
                      <div className="governance_section">
                        <h3>Governance</h3>
                        <div className="right_content">
                          <div>
                            {this.state.responseData.table9 === undefined
                              ? ""
                              :
                              this.state.responseData.table9.map((data, i) => {
                                // let colorCodeClass = ""
                                // if(data.percentScore >= 80) {
                                //   colorCodeClass = 'best_card'
                                // } else if(data.percentScore >= 50 &&
                                //   data.percentScore <= 80){
                                //     colorCodeClass = 'avg_card'
                                // } else if(data.percentScore >= 0 &&
                                //   data.percentScore <= 50){
                                //     colorCodeClass = 'worst_card'
                                // }
                                return (
                                  <div>
                                    {data.isBest === 1 && (
                                      <div>
                                        <span>Best Performing:</span>
                                        <span>
                                          {" "}
                                          {data.companyName} ({data.averageScore}/
                                          {data.maxScore})
                                        </span>
                                      </div>
                                    )}
                                    {data.isWorst === 1 && (
                                      <div>
                                        <span>Least Performing: </span>
                                        <span>
                                          {" "}
                                          {data.companyName} ({data.averageScore}/
                                          {data.maxScore})
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                )
                              })
                            }
                          </div>
                        </div>
                      </div>
                    </GridItem>
                  </GridContainer>
                  <div className="esg_data_top">
                    <h5>ESG data received from {this.state.responseData.table11 === undefined ? "" : <React.Fragment>{this.state.responseData.table11.companyName} on {moment(this.state.responseData.table11.dateOfSubmission).format("DD-MM-YYYY")}</React.Fragment>} </h5>
                    <div>
                      
                      <h6>Impact on key areas performance: </h6>
                      <div className="key_areas">
                        {this.state.responseData.table12 === undefined
                          ? ""
                          : <span key={0}>Overall: {this.state.responseData.table12.overallPercentChanged}% {this.state.responseData.table12.overallPercentChanged > 0 ? <span style={{ color: '#00B050' }}>▲</span> : <span style={{ color: '#FF0000' }}>▼</span>} </span>}
                        {this.state.responseData.table13 === undefined
                          ? ""
                          : this.state.responseData.table13.map((data, i) => {
                            return (
                              // <span key={i}>{data.section}: {data.sectionPercentChanged}% { data.sectionPercentChanged > 0 ? <UpAarrow style={{ color: '#00B050' }}/> : <span style={{ color: '#FF0000' }}>▼</span> }</span>
                              // <span key={i}>{this.getFocusAreaName(localStorage.getItem('companyGuid'), data.section)}: {data.sectionPercentChanged}% {data.sectionPercentChanged > 0 ? <span style={{ color: '#00B050' }}>▲</span> : <span style={{ color: '#FF0000' }}>▼</span>}</span>
                              <span key={i}>{data.section}: {data.sectionPercentChanged}% {data.sectionPercentChanged > 0 ? <span style={{ color: '#00B050' }}>▲</span> : <span style={{ color: '#FF0000' }}>▼</span>}</span>
                            );
                          })}
                        {/* <span>Purpose: 4% <UpAarrow style={{ color: '#00B050' }}/></span>
        <span>Workplace: 4% <span style={{ color: '#FF0000' }}>▼</span></span>
        <span>Community: 4% <UpAarrow style={{ color: '#00B050' }}/></span>
        <span>Workplace: 4% <span style={{ color: '#FF0000' }}>▼</span></span>
        <span>Community: 4% <UpAarrow style={{ color: '#00B050' }}/></span>
        <span>Workplace: 4% <span style={{ color: '#FF0000' }}>▼</span></span> */}
                      </div>
                    </div>
                  </div></React.Fragment> : ''}
              </React.Fragment>}
          </div>
        </div>}</React.Fragment>;

    return returndata

  }
}
export default ESGReport;
