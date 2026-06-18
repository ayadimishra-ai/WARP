import React, { Component } from "react";
import {
  IconButton,
  Popover,
  Select,
  InputLabel,
  MenuItem,
  FormControl,
  Button,
} from "@material-ui/core";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Poll from "@material-ui/icons/Poll";
import ArrowLeft from "@material-ui/icons/KeyboardArrowLeft";
import ArrowRight from "@material-ui/icons/KeyboardArrowRight";
import { orderBy } from "lodash";
import ChatHeadingSubHeading from "./ChatHeadingSubHeading";
import { MoreVert } from "@material-ui/icons";

class KeyDataPointsTab extends Component {
  constructor(props) {
    super(props);
    this.state = {
      anchorEl: null,
      checkedA: true,
      List: [],
      currentPage: 1,
      itemsPerPage: 10,
      sortBy: "",
    };
  }

  componentDidMount() {
    // const axios = require('axios');
    // let data = JSON.stringify({
    //   query: `query MyQuery {
    //       getesgriskandfactors(args: {parentcompanyid: "ce6c5fee-10ef-4cf7-af5b-1a6d6d83645b"}) {
    //           LeadershipPosition
    //           Womeninleadershipposition
    //           ofRevenuespentinCSR
    //           company_name
    //           Totalemployees
    //           Totalfemaleemployees
    //           Totalpermanentemployees
    //           Totalfemaleinpermanentemployees
    //           Totalcontractualemployeess
    //       }
    //   }`,
    //   variables: {},
    // });

    // let config = {
    //   method: 'post',
    //   maxBodyLength: Infinity,
    //   url: 'https://gh8s9aggxt.us-west-2.awsapprunner.com/v1/graphql',
    //   headers: {
    //     'X-Hasura-Admin-Secret':
    //       'C910KI42lZKXGQ7vO1L/qIidgWi2ucNNyA4MQJGdXr05mSi+MIy31iUm0ClIWWUPC9a/L3zl6xKfds7OWqXfJuxHaGZBgGkdHaBcP6BGTkx8+lY2uRuf/RUJJv8Lu/MKGg4Vds5YNJfb8lU060B9UCiYYonYS/25ZB+chNRpJc+7DOIPy9WuH2/WjoJAu8/ZjuMGDkpffMzURo89Wb1HiPII/6sbgAnAHpFI3w==',
    //     'Content-Type': 'application/json',
    //   },
    //   data: data,
    // };

    // axios
    //   .request(config)
    //   .then((response) => {
    //     let chartData = response.data.data.getesgriskandfactors;
    //     const aggregatedData = {};

    //     chartData.forEach((dataPoint) => {
    //       const {
    //         LeadershipPosition,
    //         Womeninleadershipposition,
    //         ofRevenuespentinCSR,
    //         company_name,
    //         Totalemployees,
    //         Totalfemaleemployees,
    //         Totalpermanentemployees,
    //         Totalfemaleinpermanentemployees,
    //         Totalcontractualemployeess,
    //       } = dataPoint;

    //       if (!aggregatedData[company_name]) {
    //         aggregatedData[company_name] = {
    //           LeadershipPosition: 0,
    //           Womeninleadershipposition: 0,
    //           ofRevenuespentinCSR: 0,
    //           Totalemployees: 0,
    //           Totalfemaleemployees: 0,
    //           Totalpermanentemployees: 0,
    //           Totalfemaleinpermanentemployees: 0,
    //           Totalcontractualemployeess: 0,
    //         };
    //       }

    //       aggregatedData[company_name].LeadershipPosition += LeadershipPosition;
    //       aggregatedData[company_name].Womeninleadershipposition +=
    //         Womeninleadershipposition;
    //       aggregatedData[company_name].ofRevenuespentinCSR += ofRevenuespentinCSR;
    //       aggregatedData[company_name].Totalemployees += Totalemployees;
    //       aggregatedData[company_name].Totalfemaleemployees += Totalfemaleemployees;
    //       aggregatedData[company_name].Totalpermanentemployees +=
    //         Totalpermanentemployees;
    //       aggregatedData[company_name].Totalfemaleinpermanentemployees +=
    //         Totalfemaleinpermanentemployees;
    //       aggregatedData[company_name].Totalcontractualemployeess +=
    //         Totalcontractualemployeess;
    //     });

    //     const newArray = Object.keys(aggregatedData).map((company_name) => ({
    //       company_name,
    //       LeadershipPosition: aggregatedData[company_name].LeadershipPosition,
    //       Womeninleadershipposition:
    //         aggregatedData[company_name].Womeninleadershipposition,
    //       ofRevenuespentinCSR: aggregatedData[company_name].ofRevenuespentinCSR,
    //       Totalemployees: aggregatedData[company_name].Totalemployees,
    //       Totalfemaleemployees: aggregatedData[company_name].Totalfemaleemployees,
    //       Totalpermanentemployees:
    //         aggregatedData[company_name].Totalpermanentemployees,
    //       Totalfemaleinpermanentemployees:
    //         aggregatedData[company_name].Totalfemaleinpermanentemployees,
    //       Totalcontractualemployeess:
    //         aggregatedData[company_name].Totalcontractualemployeess,
    //     }));

    //     this.setState({ List: newArray });
    //New
    const aggregatedData = {};

    this.props.ESGRiskandFactorsData.forEach((dataPoint) => {
      const {
        LeadershipPosition,
        Womeninleadershipposition,
        ofRevenuespentinCSR,
        company_name,
        Totalemployees,
        Totalfemaleemployees,
        Totalpermanentemployees,
        Totalfemaleinpermanentemployees,
        Totalcontractualemployeess,
        Totalfemaleincontractualemployees,
        Totalsuppliers,
        Totalwarehousesowned,
        Totalwarehousesownedleased,
        Totalfactoriesownedoutsourced,
        Totalfactoriesowned,
        employeelefttheorginlastfinancialyear,
        employeesthataredifferenltyabled,
      } = dataPoint;

      if (!aggregatedData[company_name]) {
        aggregatedData[company_name] = {
          LeadershipPosition: 0,
          Womeninleadershipposition: 0,
          ofRevenuespentinCSR: 0,
          Totalemployees: 0,
          Totalfemaleemployees: 0,
          Totalpermanentemployees: 0,
          Totalfemaleinpermanentemployees: 0,
          Totalcontractualemployeess: 0,
          Totalfemaleincontractualemployees: 0,
          Totalsuppliers: 0,
          Totalwarehousesowned: 0,
          Totalwarehousesownedleased: 0,
          Totalfactoriesownedoutsourced: 0,
          Totalfactoriesowned: 0,
          employeelefttheorginlastfinancialyear: 0,
          employeesthataredifferenltyabled: 0,
        };
      }

      aggregatedData[company_name].LeadershipPosition += LeadershipPosition;
      aggregatedData[
        company_name
      ].Womeninleadershipposition += Womeninleadershipposition;
      aggregatedData[company_name].ofRevenuespentinCSR += ofRevenuespentinCSR;
      aggregatedData[company_name].Totalemployees += Totalemployees;
      aggregatedData[company_name].Totalfemaleemployees += Totalfemaleemployees;
      aggregatedData[
        company_name
      ].Totalpermanentemployees += Totalpermanentemployees;
      aggregatedData[
        company_name
      ].Totalfemaleinpermanentemployees += Totalfemaleinpermanentemployees;
      aggregatedData[
        company_name
      ].Totalcontractualemployeess += Totalcontractualemployeess;
      aggregatedData[
        company_name
      ].Totalfemaleincontractualemployees += Totalfemaleincontractualemployees;
      aggregatedData[company_name].Totalsuppliers += Totalsuppliers;
      aggregatedData[company_name].Totalwarehousesowned += Totalwarehousesowned;
      aggregatedData[
        company_name
      ].Totalwarehousesownedleased += Totalwarehousesownedleased;
      aggregatedData[
        company_name
      ].Totalfactoriesownedoutsourced += Totalfactoriesownedoutsourced;
      aggregatedData[company_name].Totalfactoriesowned += Totalfactoriesowned;
      aggregatedData[
        company_name
      ].employeelefttheorginlastfinancialyear += employeelefttheorginlastfinancialyear;
      aggregatedData[
        company_name
      ].employeesthataredifferenltyabled += employeesthataredifferenltyabled;
    });

    let newArray = Object.keys(aggregatedData).map((company_name) => ({
      company_name,
      LeadershipPosition: aggregatedData[company_name].LeadershipPosition,
      Womeninleadershipposition:
        aggregatedData[company_name].Womeninleadershipposition,
      ofRevenuespentinCSR: aggregatedData[company_name].ofRevenuespentinCSR,
      Totalemployees: aggregatedData[company_name].Totalemployees,
      Totalfemaleemployees: aggregatedData[company_name].Totalfemaleemployees,
      Totalpermanentemployees:
        aggregatedData[company_name].Totalpermanentemployees,
      Totalfemaleinpermanentemployees:
        aggregatedData[company_name].Totalfemaleinpermanentemployees,
      Totalcontractualemployeess:
        aggregatedData[company_name].Totalcontractualemployeess,
      Totalfemaleincontractualemployees:
        aggregatedData[company_name].Totalfemaleincontractualemployees,
      Totalsuppliers: aggregatedData[company_name].Totalsuppliers,
      Totalwarehousesowned: aggregatedData[company_name].Totalwarehousesowned,
      Totalwarehousesownedleased:
        aggregatedData[company_name].Totalwarehousesownedleased,
      Totalfactoriesownedoutsourced:
        aggregatedData[company_name].Totalfactoriesownedoutsourced,
      Totalfactoriesowned: aggregatedData[company_name].Totalfactoriesowned,
      employeelefttheorginlastfinancialyear:
        aggregatedData[company_name].employeelefttheorginlastfinancialyear,
      employeesthataredifferenltyabled:
        aggregatedData[company_name].employeesthataredifferenltyabled,
    }));

    newArray = orderBy(newArray, ["company_name"], ["asc"]);
    this.setState({ List: newArray });

    //   })
    //   .catch((error) => {
    //     console.log(error);
    //   });
  }

  handleChange = (name) => (event) => {
    this.setState({ [name]: event.target.checked });
  };

  handleClick = (event) => {
    this.setState({
      anchorEl: event.currentTarget,
    });
  };

  handleClose = () => {
    this.setState({
      anchorEl: null,
    });
  };

  handlePageChange = (action) => {
    const { currentPage, itemsPerPage, List } = this.state;
    const totalPages = Math.ceil(List.length / itemsPerPage);

    if (action === "prev" && currentPage > 1) {
      this.setState({ currentPage: currentPage - 1 });
    } else if (action === "next" && currentPage < totalPages) {
      this.setState({ currentPage: currentPage + 1 });
    }
  };

  // New method for handling sorting change
  handleSortChange = (event) => {
    const sortBy = event.target.value;
    this.setState({ sortBy });
  };

  // New method to sort data based on the selected option
  sortData = (data) => {
    const { sortBy } = this.state;

    if (sortBy) {
      data.sort((a, b) => a[sortBy] - b[sortBy]);
    }

    return data;
  };

  render() {
    const { anchorEl, currentPage, itemsPerPage } = this.state;
    const open = Boolean(anchorEl);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = this.sortData(
      this.state.List.slice(indexOfFirstItem, indexOfLastItem)
    );

    return (
      <div className="chart_table">
        <ChatHeadingSubHeading title="Key Data Points">
          {/* <div className="chart_table_filters">
            <IconButton
              aria-owns={open ? "simple-popper" : undefined}
              aria-haspopup="true"
              variant="contained"
              onClick={this.handleClick}
            >
              <Poll />
            </IconButton>
            <Popover
              id="simple-popper"
              open={open}
              anchorEl={anchorEl}
              onClose={this.handleClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
            >
              <FormGroup>
                <FormControlLabel
                  
                  control={
                    <Checkbox
                      checked={this.state.checkedA}
                      onChange={this.handleChange("checkedA")}
                      value="checkedA"
                      size="small"
                      style={{padding: 5}}
                    />
                  }
                  label="LeadershipPosition"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={this.state.checkedA}
                      onChange={this.handleChange("checkedA")}
                      value="checkedA"
                      size="small"
                      style={{padding: 5}}
                    />
                  }
                  label="Womeninleadershipposition"
                />
              </FormGroup>
            </Popover>
            <FormControl className="custom_dropdown" style={{ minWidth: 120 }}>
              <Select
                open={this.state.open}
                onClose={this.handleClose}
                onOpen={this.handleOpen}
                value={this.state.sortBy}
                onChange={this.handleSortChange}
                displayEmpty
                inputProps={{
                  name: "SortBy",
                  id: "demo-controlled-open-select",
                  "aria-label": "sort by",
                }}
              >
                <MenuItem value="">
                  <em>Sort By</em>
                </MenuItem>
                <MenuItem value="LeadershipPosition">
                  Leadership Position
                </MenuItem>
                <MenuItem value="Womeninleadershipposition">
                  Women in leadership position
                </MenuItem>
                <MenuItem value="ofRevenuespentinCSR">
                  of Revenue spent in CSR
                </MenuItem>
                <MenuItem value="Totalemployees">Total employees</MenuItem>
                <MenuItem value="Totalfemaleemployees">
                  Total female employees
                </MenuItem>
                <MenuItem value="Totalpermanentemployees">
                  Total permanent employees
                </MenuItem>
                <MenuItem value="Totalfemaleinpermanentemployees">
                  Total female in permanent employees
                </MenuItem>
                <MenuItem value="Totalcontractualemployeess">
                  Total contractual employeess
                </MenuItem>
              </Select>
            </FormControl>
            <Button className="export" style={{ padding: 0, minWidth: 24 }}>
              <MoreVert className="vertical_dots" />
            </Button>
          </div> */}
        </ChatHeadingSubHeading>

        <div style={{ overflow: "auto", }}>
          <table>
            <thead>
              <tr>
                <th>Portfolio</th>
                <th>Leadership Position</th>
                <th>Women in leadership position</th>
                <th>of Revenue spent in CSR</th>
                <th>Total employees</th>
                <th>Total female employees</th>
                <th>Total permanent employees</th>
                <th>Total female in permanent employees</th>
                <th>Total contractual employeess</th>

                <th>Total Female In Contractual Employees</th>
                <th>Total Suppliers</th>
                <th>Total Warehouses (owned)</th>
                <th>Total Warehouses (owned+leased)</th>
                <th>Total Factories (owned+outsourced)</th>
                <th>Total Factories(owned)</th>
                <th># Employee Left The Org In Last Financial Year</th>
                <th># Employees That Are Differenlty Abled</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={17} style={{ textAlign: "center" }}>
                    Data not found
                  </td>
                </tr>
              ) : (
                currentItems.map((item, index) => {
                  return (
                    <tr key={index}>
                      <td>{item.company_name}</td>
                      <td>{item.LeadershipPosition}</td>
                      <td>{item.Womeninleadershipposition}</td>
                      <td>{item.ofRevenuespentinCSR}</td>
                      <td>{item.Totalemployees}</td>
                      <td>{item.Totalfemaleemployees}</td>
                      <td>{item.Totalpermanentemployees}</td>
                      <td>{item.Totalfemaleinpermanentemployees}</td>
                      <td>{item.Totalcontractualemployeess}</td>
                      <td>{item.Totalfemaleincontractualemployees}</td>
                      <td>{item.Totalsuppliers}</td>
                      <td>{item.Totalwarehousesowned}</td>
                      <td>{item.Totalwarehousesownedleased}</td>
                      <td>{item.Totalfactoriesownedoutsourced}</td>
                      <td>{item.Totalfactoriesowned}</td>
                      <td>{item.employeelefttheorginlastfinancialyear}</td>
                      <td>{item.employeesthataredifferenltyabled}</td>
                    </tr>
                  );
                })
              )}
              <tr className="pagination">
                <td colSpan={17}>
                  {`Showing ${indexOfFirstItem + 1} - ${indexOfLastItem} of ${
                    this.state.List.length
                  }`}
                  <IconButton onClick={() => this.handlePageChange("prev")}>
                    <ArrowLeft />
                  </IconButton>
                  <IconButton onClick={() => this.handlePageChange("next")}>
                    <ArrowRight />
                  </IconButton>
                </td>
              </tr>
            </tbody>
          </table>
          {currentItems.length > 0}
        </div>
      </div>
    );
  }
}

export default KeyDataPointsTab;
