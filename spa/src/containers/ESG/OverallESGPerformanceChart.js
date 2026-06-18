import React, { Component } from "react";
import ESGScore from "../../components/Charts/ESGScore";
import FundScore from "../../components/Charts/FundScore";
import FundTheme from "../../components/Charts/FundTheme";
import {
  Select,
  MenuItem,
  Button,
  Checkbox,
  ListItemText,
  ListItemIcon,
} from "@material-ui/core";
import html2canvas from "html2canvas";
import MoreVert from "@material-ui/icons/MoreVert";
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 200,
    },
    id: "fund-type",
  },
};
let isAllSelected = false;
class OverallESGPerformanceChart extends Component {
  constructor(props) {
    super(props);
    this.OverallESGPerformanceExportRef = React.createRef();
    this.state = {
      selectedFund: [],
      fundDetail: [],
      filterSectorWiseESGData: [],
      filterPredealGraphReportData: [],
      selectedKey: "",
    };
  }
  componentDidMount() {
    this.setState({
      filterSectorWiseESGData: this.props.SectorWiseESGData,
      filterPredealGraphReportData: this.props.PredealGraphReportData,
      fundDetail: this.props.FundTypeData,
      selectedKey: "all",
    });
  }
  handleChange = (event, rowNumber) => {
    const value = event.target.value;
    if (value[value.length - 1] === "all") {
      this.setState({
        selectedFund:
          this.state.selectedFund.length === this.state.fundDetail.length
            ? []
            : this.state.fundDetail,
        filterSectorWiseESGData: this.props.SectorWiseESGData,
        filterPredealGraphReportData: this.props.PredealGraphReportData,
      });
      return;
    }
    if (event.target.value.length === 0) {
      this.setState({
        filterSectorWiseESGData: this.props.SectorWiseESGData,
        filterPredealGraphReportData: this.props.PredealGraphReportData,
        selectedFund: value,
      });
    } else {
      let getFilterdSectorData = this.props.SectorWiseESGData.filter((item) =>
        event.target.value.includes(item.fund_Name)
      ).map((filtereditem) => filtereditem);
      let getFilterdPredealData = this.props.PredealGraphReportData.filter(
        (item) => event.target.value.includes(item.fund_Name)
      ).map((filtereditem) => filtereditem);
      this.setState({
        filterSectorWiseESGData: getFilterdSectorData,
        filterPredealGraphReportData: getFilterdPredealData,
        selectedFund: value,
      });
    }
  };
  pdfDownload = async (e, chartNo) => {
    this.exportAsImage(e, chartNo);
    // window.print();
  };

  exportAsImage = async (element, imageFileName) => {
    const html = document.getElementsByTagName("html")[0];
    const body = document.getElementsByTagName("body")[0];
    let htmlWidth = html.clientWidth;
    let bodyWidth = body.clientWidth;
    const newWidth = element.scrollWidth - element.clientWidth;
    if (newWidth > element.clientWidth) {
      htmlWidth += newWidth;
      bodyWidth += newWidth;
    }
    html.style.width = htmlWidth + "px";
    body.style.width = bodyWidth + "px";
    const canvas = await html2canvas(element);
    const image = canvas.toDataURL("image/png", 1.0);
    this.downloadImage(image, imageFileName);
    html.style.width = null;
    body.style.width = null;
  };

  downloadImage = (blob, fileName) => {
    const fakeLink = window.document.createElement("a");
    fakeLink.style = "display:none;";
    fakeLink.download = fileName;

    fakeLink.href = blob;

    document.body.appendChild(fakeLink);
    fakeLink.click();
    document.body.removeChild(fakeLink);

    fakeLink.remove();
  };

  render() {
    isAllSelected =
      this.props.FundTypeData.length > 0 &&
      this.state.selectedFund.length === this.props.FundTypeData.length;
    return this.state.selectedFund !== "" ? (
      <div className=" finalChart">
        <div className="heading_select_wrapper">
          <div className="heading_subheading">
            <h6>Predeal ESG Report</h6>
            <div
              style={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <span style={{color:'#1A1A1A'}}>To download the KPIs please click on</span>
              <MoreVert className="vertical_dots" />
            </div>
          </div>
          <div className="actions">
            <span id="mutiple-select-label">Fund Type</span>
            <Select
              multiple
              value={this.state.selectedFund}
              onChange={(event) => this.handleChange(event)}
              renderValue={(selected) => {
                if (selected.length === 0) {
                  return (
                    <ListItemText
                      className="dropdown_text"
                      primary="Select Fund Type"
                    />
                  );
                }
                return selected.join(", ");
              }}
              MenuProps={MenuProps}
              style={{ width: 190 }}
              displayEmpty
              className="header_select"
            >
              <MenuItem value="all" className="dropdown_item">
                <ListItemIcon className="dropdown_icon">
                  <Checkbox
                    size="small"
                    classes={{checked:'checkedColor'}}
                      style={{ padding: 5}}
                    checked={isAllSelected}
                    indeterminate={
                      this.state.selectedFund.length > 0 &&
                      this.state.selectedFund.length <
                        this.state.fundDetail.length
                    }
                  />
                </ListItemIcon>
                <ListItemText className="dropdown_text" primary="Select All" />
              </MenuItem>
              {this.state.fundDetail.map((option) => (
                <MenuItem key={option} value={option} className="dropdown_item">
                  <ListItemIcon className="dropdown_icon">
                    <Checkbox
                      size="small"
                      classes={{checked:'checkedColor'}}
                      style={{ padding: 5}}
                      checked={this.state.selectedFund.indexOf(option) > -1}
                    />
                  </ListItemIcon>
                  <ListItemText primary={option} className="dropdown_text" />
                </MenuItem>
              ))}
            </Select>
            <div data-html2canvas-ignore="true" className="esg_header_right">
              <Button
                className="export_all_btn"
                onClick={() => {
                  this.pdfDownload(
                    this.OverallESGPerformanceExportRef.current,
                    "Overall ESG Performance"
                  );
                }}
              >
                Export All
              </Button>
            </div>
          </div>
        </div>

        <div id="OverallESGPerformanceExportRef" ref={this.OverallESGPerformanceExportRef}>
          <div style={{ display: "flex", gap: 30, flexWrap: "wrap" }}>
            <div style={{ flex: "0 0 calc(50% - 15px)" }}>
              {this.state.filterSectorWiseESGData !== undefined && (
                <ESGScore
                  key={this.state.selectedFund + this.state.selectedKey}
                  SectorWiseESGData={this.state.filterSectorWiseESGData}
                />
              )}
            </div>
            <div style={{ flex: "0 0 calc(50% - 15px)" }}>
              {this.state.filterPredealGraphReportData !== undefined && (
                <FundScore
                  key={this.state.selectedFund + this.state.selectedKey}
                  PredealGraphReportData={
                    this.state.filterPredealGraphReportData
                  }
                />
              )}
            </div>
            <div style={{ flex: "0 0 100%" }}>
              {this.state.filterPredealGraphReportData !== undefined && (
                <FundTheme
                  key={this.state.selectedFund + this.state.selectedKey}
                  PredealGraphReportData={
                    this.state.filterPredealGraphReportData
                  }
                />
              )}
            </div>
          </div>
        </div>
      </div>
    ) : (
      ""
    );
  }
}

export default OverallESGPerformanceChart;
