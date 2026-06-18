import React, { Component } from "react";
import {
  IconButton, Grid
} from "@material-ui/core";
import ArrowLeft from "@material-ui/icons/KeyboardArrowLeft";
import ArrowRight from "@material-ui/icons/KeyboardArrowRight";
import { orderBy } from "lodash";
import ChatHeadingSubHeading from "./ChatHeadingSubHeading";
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';

class PolicySummaryTab extends Component {
  constructor(props) {
    super(props);
    this.state = {
      anchorEl: null,
      checkedA: true,
      List: [],
      currentPage: 1,
      itemsPerPage: 10,
      sortOption: "",
      sortBy: "",
      portfolio: 'asc',
      totalpolicies: 'asc',
      existingpolicies: 'asc',
      policyWIP: 'asc',
      nopolicies: 'asc',
    };
  }

  componentDidMount() {
    // let chartData = [];
    // let newArray = [];

    // const axios = require('axios');
    // let data = JSON.stringify({
    //   query:
    //     'query MyQuery{gettopandworstesg(args:{parentcompanyid:"ce6c5fee-10ef-4cf7-af5b-1a6d6d83645b"}){Totalpolicies Existingpolicies PolicyWIP Nopolicies company_name}}',
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
    //     console.log('Policy', response.data.data.gettopandworstesg);
    //     chartData = response.data.data.gettopandworstesg;
    //     const aggregatedData = {};

    //     chartData.forEach((dataPoint) => {
    //       const {
    //         Totalpolicies,
    //         Existingpolicies,
    //         PolicyWIP,
    //         Nopolicies,
    //         company_name,
    //       } = dataPoint;

    //       if (!aggregatedData[company_name]) {
    //         aggregatedData[company_name] = {
    //           Totalpolicies: 0,
    //           Existingpolicies: 0,
    //           PolicyWIP: 0,
    //           Nopolicies: 0,
    //         };
    //       }

    //       aggregatedData[company_name].Totalpolicies += Totalpolicies;
    //       aggregatedData[company_name].Existingpolicies += Existingpolicies;
    //       aggregatedData[company_name].PolicyWIP += PolicyWIP;
    //       aggregatedData[company_name].Nopolicies += Nopolicies;
    //     });

    //     newArray = Object.keys(aggregatedData).map((company_name) => ({
    //       company_name,
    //       Totalpolicies: aggregatedData[company_name].Totalpolicies,
    //       Existingpolicies: aggregatedData[company_name].Existingpolicies,
    //       PolicyWIP: aggregatedData[company_name].PolicyWIP,
    //       Nopolicies: aggregatedData[company_name].Nopolicies,
    //     }));

    //     this.setState({ List: newArray });
    //New
    let newArray = [];
    const aggregatedData = {};

    this.props.TopandWorstESGData.forEach((dataPoint) => {
      const {
        Totalpolicies,
        Existingpolicies,
        PolicyWIP,
        Nopolicies,
        company_name,
      } = dataPoint;

      if (!aggregatedData[company_name]) {
        aggregatedData[company_name] = {
          Totalpolicies: 0,
          Existingpolicies: 0,
          PolicyWIP: 0,
          Nopolicies: 0,
        };
      }

      aggregatedData[company_name].Totalpolicies += Totalpolicies;
      aggregatedData[company_name].Existingpolicies += Existingpolicies;
      aggregatedData[company_name].PolicyWIP += PolicyWIP;
      aggregatedData[company_name].Nopolicies += Nopolicies;
    });

    newArray = Object.keys(aggregatedData).map((company_name) => ({
      company_name,
      Totalpolicies: aggregatedData[company_name].Totalpolicies,
      Existingpolicies: aggregatedData[company_name].Existingpolicies,
      PolicyWIP: aggregatedData[company_name].PolicyWIP,
      Nopolicies: aggregatedData[company_name].Nopolicies,
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

  handleSortChange = (event) => {
    const sortOption = event.target.value;
    this.setState({ sortOption }, () => {
      this.sortList();
    });
  };

  sortList = () => {
    const { sortOption, List } = this.state;
    let sortedList = [...List];

    switch (sortOption) {
      case "1":
        sortedList.sort((a, b) => a.Totalpolicies - b.Totalpolicies);
        break;
      case "2":
        sortedList.sort((a, b) => a.Existingpolicies - b.Existingpolicies);
        break;
      case "3":
        sortedList.sort((a, b) => a.PolicyWIP - b.PolicyWIP);
        break;
      case "4":
        sortedList.sort((a, b) => a.Nopolicies - b.Nopolicies);
        break;
      default:
      // No sorting
    }

    this.setState({ List: sortedList });
  };

  sorttablebycolumn(column, sortby) {
    let sortedList = [...this.state.List];
    let newSortedList = [];
    switch (column) {
      case "portfolio":
        if (sortby === 'asc') {
          newSortedList = orderBy(sortedList, ['company_name'], ['desc']);
          this.setState({
            portfolio: 'desc',
            totalpolicies: 'asc',
            existingpolicies: 'asc',
            policyWIP: 'asc',
            nopolicies: 'asc',
          })
        }
        else {
          newSortedList = orderBy(sortedList, ['company_name'], ['asc']);
          this.setState({
            portfolio: 'asc',
            totalpolicies: 'asc',
            existingpolicies: 'asc',
            policyWIP: 'asc',
            nopolicies: 'asc',
          })
        }
        break;
      case "totalpolicies":
        if (sortby === 'asc') {
          newSortedList = orderBy(sortedList, ['Totalpolicies'], ['asc']);
          this.setState({
            portfolio: 'asc',
            totalpolicies: 'desc',
            existingpolicies: 'asc',
            policyWIP: 'asc',
            nopolicies: 'asc',
          })
        }
        else {
          newSortedList = orderBy(sortedList, ['Totalpolicies'], ['desc']);
          this.setState({
            portfolio: 'asc',
            totalpolicies: 'asc',
            existingpolicies: 'asc',
            policyWIP: 'asc',
            nopolicies: 'asc',
          })
        }
        break;  
      case "existingpolicies":
        if (sortby === 'asc') {
          newSortedList = orderBy(sortedList, ['Existingpolicies'], ['asc']);
          this.setState({
            portfolio: 'asc',
            totalpolicies: 'asc',
            existingpolicies: 'desc',
            policyWIP: 'asc',
            nopolicies: 'asc',
          })
        }
        else {
          newSortedList = orderBy(sortedList, ['Existingpolicies'], ['desc']);
          this.setState({
            portfolio: 'asc',
            totalpolicies: 'asc',
            existingpolicies: 'asc',
            policyWIP: 'asc',
            nopolicies: 'asc',
          })
        }
        break;
      case "policyWIP":
        if (sortby === 'asc') {
          newSortedList = orderBy(sortedList, ['PolicyWIP'], ['asc']);
          this.setState({
            portfolio: 'asc',
            totalpolicies: 'asc',
            existingpolicies: 'asc',
            policyWIP: 'desc',
            nopolicies: 'asc',
          })
        }
        else {
          newSortedList = orderBy(sortedList, ['PolicyWIP'], ['desc']);
          this.setState({
            portfolio: 'asc',
            totalpolicies: 'asc',
            existingpolicies: 'asc',
            policyWIP: 'asc',
            nopolicies: 'asc',
          })
        }
        break;
      case "nopolicies":
        if (sortby === 'asc') {
          newSortedList = orderBy(sortedList, ['Nopolicies'], ['asc']);
          this.setState({
            portfolio: 'asc',
            totalpolicies: 'asc',
            existingpolicies: 'asc',
            policyWIP: 'asc',
            nopolicies: 'desc',
          })
        }
        else {
          newSortedList = orderBy(sortedList, ['Nopolicies'], ['desc']);
          this.setState({
            portfolio: 'asc',
            totalpolicies: 'asc',
            existingpolicies: 'asc',
            policyWIP: 'asc',
            nopolicies: 'asc',
          })
        }
        break;
     default:
        // Default case, no sorting
        break;
    }
    this.setState({ List: newSortedList });
  }

  render() {
    const { anchorEl, currentPage, itemsPerPage } = this.state;
    const open = Boolean(anchorEl);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = this.state.List.slice(
      indexOfFirstItem,
      indexOfLastItem
    );

    return (
      <div className="chart_table">
        <ChatHeadingSubHeading title="Policy Summary">
        </ChatHeadingSubHeading>

        <table>
          <thead>
            <tr>
              {/* <th>Portfolio</th>
              <th>Totalpolicies</th>
              <th>Existingpolicies</th>
              <th>PolicyWIP</th>
              <th>Nopolicies</th>
              */}

              <th onClick={() => { this.sorttablebycolumn('portfolio', this.state.portfolio) }} style={{ 'cursor': 'pointer' }}>
                <Grid
                  container
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center">
                  <span>Portfolio</span>
                  <IconButton disableRipple aria-label="Sort" style={{ color: '#fff', padding: 1 }}>
                    {this.state.portfolio === "asc" ? <ArrowUpwardIcon style={{ fontSize: 20 }} /> : <ArrowDownwardIcon style={{ fontSize: 20 }} />}
                  </IconButton>

                </Grid>
              </th>
              <th onClick={() => { this.sorttablebycolumn('totalpolicies', this.state.totalpolicies) }} style={{ 'cursor': 'pointer' }}>
                <Grid
                  container
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center">
                  <span>Totalpolicies</span>
                  <IconButton disableRipple aria-label="Sort" style={{ color: '#fff', padding: 1 }}>
                    {this.state.totalpolicies === "asc" ? <ArrowUpwardIcon style={{ fontSize: 20 }} /> : <ArrowDownwardIcon style={{ fontSize: 20 }} />}
                  </IconButton>
                </Grid>
              </th>
              <th onClick={() => { this.sorttablebycolumn('existingpolicies', this.state.existingpolicies) }} style={{ 'cursor': 'pointer' }}>
                <Grid
                  container
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center">
                  <span>Existingpolicies</span>
                  <IconButton disableRipple aria-label="Sort" style={{ color: '#fff', padding: 1 }}>
                    {this.state.existingpolicies === "asc" ? <ArrowUpwardIcon style={{ fontSize: 20 }} /> : <ArrowDownwardIcon style={{ fontSize: 20 }} />}
                  </IconButton>
                </Grid>
              </th>
              <th onClick={() => { this.sorttablebycolumn('policyWIP', this.state.policyWIP) }} style={{ 'cursor': 'pointer' }}>
                <Grid
                  container
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center">
                  <span>PolicyWIP</span>
                  <IconButton disableRipple aria-label="Sort" style={{ color: '#fff', padding: 1 }}>
                    {this.state.policyWIP === "asc" ? <ArrowUpwardIcon style={{ fontSize: 20 }} /> : <ArrowDownwardIcon style={{ fontSize: 20 }} />}
                  </IconButton>
                </Grid>
              </th>
              <th onClick={() => { this.sorttablebycolumn('nopolicies', this.state.nopolicies) }} style={{ 'cursor': 'pointer' }}>
                <Grid
                  container
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center">
                  <span>Nopolicies</span>
                  <IconButton disableRipple aria-label="Sort" style={{ color: '#fff', padding: 1 }}>
                    {this.state.nopolicies === "asc" ? <ArrowUpwardIcon style={{ fontSize: 20 }} /> : <ArrowDownwardIcon style={{ fontSize: 20 }} />}
                  </IconButton>
                </Grid>
              </th>


            </tr>
          </thead>
          <tbody>
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center" }}>
                  Data not found
                </td>
              </tr>
            ) : (
              currentItems.map((item, index) => {
                return (
                  <tr key={index}>
                    <td>{item.company_name}</td>
                    <td>{item.Totalpolicies}</td>
                    <td>{item.Existingpolicies}</td>
                    <td>{item.PolicyWIP}</td>
                    <td>{item.Nopolicies}</td>
                  </tr>
                );
              })
            )}
            <tr className="pagination">
              <td colSpan={6}>
                {`Showing ${indexOfFirstItem + 1} - ${indexOfLastItem} of ${this.state.List.length
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
      </div>
    );
  }
}

export default PolicySummaryTab;
