import React, { Component } from "react";
import ESGRiskTab from "../../components/Charts/ESGRiskTab";
import ThemewiseRiskRatingCompaniesTab from "../../components/Charts/ThemewiseRiskRatingCompaniesTab";
import ThemewiseRiskRatingSectorsTab from "../../components/Charts/ThemewiseRiskRatingSectorsTab";
import {
  Select,
  MenuItem,
  InputLabel,
  Checkbox,
  ListItemText,
  ListItemIcon,
  Button,
} from "@material-ui/core";
import MoreVert from "@material-ui/icons/MoreVert";
import html2canvas from "html2canvas";

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
class ESGRisk extends Component {
  constructor(props) {
    super(props);
    this.ESGRiskExportRef = React.createRef();
    this.state = {
      selectedFund: [],
      fundDetail: [],
      filterTotalSectorESGData: [],
      selectedKey: "",
    };
  }
  componentDidMount() {
    this.setState({
      filterTotalSectorESGData: this.props.TotalSectorESGData,
      fundDetail: this.props.FundTypeData,
      selectedFund: [],
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
        filterTotalSectorESGData: this.props.TotalSectorESGData,
      });
      return;
    }
    if (event.target.value.length === 0) {
      this.setState({
        filterTotalSectorESGData: this.props.TotalSectorESGData,
        selectedFund: value,
      });
    } else {
      let getFilterdSectorData = this.props.TotalSectorESGData.filter((item) =>
        event.target.value.includes(item.fund_Name)
      ).map((filtereditem) => filtereditem);
      this.setState({
        filterTotalSectorESGData: getFilterdSectorData,
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
    const canvas = await html2canvas(element, { scale: 0.8 });
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
    return (
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
              labelId="mutiple-select-label"
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
                <ListItemText primary="Select All" className="dropdown_text" />
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
                  this.pdfDownload(this.ESGRiskExportRef.current, "ESG Risk");
                }}
              >
                Export All
              </Button>
            </div>
          </div>
        </div>
        {/* <div style={{ display: 'flex', gap: 10 }} >
                    <div style={{ width: '40%' }}>
                        <ESGRiskTab />
                    </div>
                    <div style={{ width: '60%' }}>
                        <ThemewiseRiskRatingCompaniesTab />
                    </div>                   
                </div> */}
        <div id="ESGRiskExportRef" ref={this.ESGRiskExportRef}>
          <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
            <div style={{ width: "100%" }}>
              {this.state.filterTotalSectorESGData !== undefined && (
                <ESGRiskTab
                  key={this.state.selectedFund + this.state.selectedKey}
                  TotalSectorESGData={this.state.filterTotalSectorESGData}
                />
              )}
            </div>
            <div style={{ width: "100%" }}>
              {this.state.filterTotalSectorESGData !== undefined && (
                <ThemewiseRiskRatingCompaniesTab
                  key={this.state.selectedFund + this.state.selectedKey}
                  TotalSectorESGData={this.state.filterTotalSectorESGData}
                  EsgRiskThemeData={this.props.EsgRiskThemeData}
                />
              )}
            </div>
            <div style={{ width: "100%" }}>
              {this.state.filterTotalSectorESGData !== undefined && (
                <ThemewiseRiskRatingSectorsTab
                  key={this.state.selectedFund + this.state.selectedKey}
                  TotalSectorESGData={this.state.filterTotalSectorESGData}
                  EsgRiskThemeData={this.props.EsgRiskThemeData}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ESGRisk;
