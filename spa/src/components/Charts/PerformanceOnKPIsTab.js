import React, { Component } from 'react';
import {
  IconButton,
  Popover,
  Select,
  InputLabel,
  MenuItem,
  FormControl,
  Button,
  Grid
} from '@material-ui/core'
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Poll from "@material-ui/icons/Poll";
import ArrowLeft from "@material-ui/icons/KeyboardArrowLeft";
import ArrowRight from "@material-ui/icons/KeyboardArrowRight";
import { orderBy } from 'lodash';
import ChatHeadingSubHeading from './ChatHeadingSubHeading';
import { MoreVert } from '@material-ui/icons';
import SwapVertIcon from '@material-ui/icons/SwapVert';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
var FileSaver = require('file-saver');
class PerformanceOnKPIsTab extends Component {
  constructor(props) {
    super(props);
    this.state = {
      anchorEl: null,
      checkedA: true,
      List: [],
      currentPage: 1,
      itemsPerPage: 10,
      sortBy: "",
      portfolio: 'desc',
      fPermenent: 'asc',
      fContractual: 'asc',
      fTotal: 'asc',
      fPosition: 'asc',
      eTurnover: 'asc',
    };
  }

  componentDidMount() {
    // let chartData = [];
    // let newArray = [];

    // const axios = require('axios');
    // let data = JSON.stringify({
    //   query: `query MyQuery {
    //       getesgriskandfactors(args: {parentcompanyid: "ce6c5fee-10ef-4cf7-af5b-1a6d6d83645b"}) {
    //           Totalfemaleemployees
    //           Totalfemaleincontractualemployees
    //           Totalfemaleinpermanentemployees
    //           company_name
    //           performace_on_kpi_Employee_turnover_Attrition
    //           Womeninleadershipposition
    //           Totalemployees
    //       }
    //   }`,
    //   variables: {}
    // });

    // let config = {
    //   method: 'post',
    //   maxBodyLength: Infinity,
    //   url: 'https://gh8s9aggxt.us-west-2.awsapprunner.com/v1/graphql',
    //   headers: {
    //     'X-Hasura-Admin-Secret': 'C910KI42lZKXGQ7vO1L/qIidgWi2ucNNyA4MQJGdXr05mSi+MIy31iUm0ClIWWUPC9a/L3zl6xKfds7OWqXfJuxHaGZBgGkdHaBcP6BGTkx8+lY2uRuf/RUJJv8Lu/MKGg4Vds5YNJfb8lU060B9UCiYYonYS/25ZB+chNRpJc+7DOIPy9WuH2/WjoJAu8/ZjuMGDkpffMzURo89Wb1HiPII/6sbgAnAHpFI3w==',
    //     'Content-Type': 'application/json'
    //   },
    //   data: data
    // };

    // axios.request(config)
    //   .then((response) => {
    //     chartData = response.data.data.getesgriskandfactors;
    //     const aggregatedData = {};

    //     chartData.forEach((dataPoint) => {
    //       const {
    //         Totalfemaleemployees,
    //         Totalfemaleincontractualemployees,
    //         Totalfemaleinpermanentemployees,
    //         company_name,
    //         performace_on_kpi_Employee_turnover_Attrition,
    //         Womeninleadershipposition,
    //         Totalemployees
    //       } = dataPoint;

    //       if (!aggregatedData[company_name]) {
    //         aggregatedData[company_name] = {
    //           Totalfemaleemployees: 0,
    //           Totalfemaleincontractualemployees: 0,
    //           Totalfemaleinpermanentemployees: 0,
    //           performace_on_kpi_Employee_turnover_Attrition: 0,
    //           Womeninleadershipposition: 0,
    //           Totalemployees: 0
    //         };
    //       }

    //       aggregatedData[company_name].Totalfemaleemployees += Totalfemaleemployees;
    //       aggregatedData[company_name].Totalfemaleincontractualemployees += Totalfemaleincontractualemployees;
    //       aggregatedData[company_name].Totalfemaleinpermanentemployees += Totalfemaleinpermanentemployees;
    //       aggregatedData[company_name].performace_on_kpi_Employee_turnover_Attrition += performace_on_kpi_Employee_turnover_Attrition;
    //       aggregatedData[company_name].Womeninleadershipposition += Womeninleadershipposition;
    //       aggregatedData[company_name].Totalemployees += Totalemployees;
    //     });

    //     newArray = Object.keys(aggregatedData).map((company_name) => ({
    //       company_name,
    //       Totalfemaleemployees: aggregatedData[company_name].Totalfemaleemployees,
    //       Totalfemaleincontractualemployees: aggregatedData[company_name].Totalfemaleincontractualemployees,
    //       Totalfemaleinpermanentemployees: aggregatedData[company_name].Totalfemaleinpermanentemployees,
    //       performace_on_kpi_Employee_turnover_Attrition: aggregatedData[company_name].performace_on_kpi_Employee_turnover_Attrition,
    //       Womeninleadershipposition: aggregatedData[company_name].Womeninleadershipposition,
    //       Totalemployees: aggregatedData[company_name].Totalemployees,
    //     }));

    //     this.setState({ List: newArray })

    //New 
    let newArray = [];
    const aggregatedData = {};
    this.props.ESGRiskandFactorsData.forEach((dataPoint) => {
      const {
        performace_on_kpi_Female_employee_Permanent,
        performace_on_kpi_Female_employee_Contractual,
        LeadershipPosition,
        employeelefttheorginlastfinancialyear,
        Totalpermanentemployees,
        Totalfemaleemployees,
        Totalfemaleincontractualemployees,
        Totalfemaleinpermanentemployees,
        company_name,
        performace_on_kpi_Employee_turnover_Attrition,
        Womeninleadershipposition,
        Totalemployees
      } = dataPoint;

      if (!aggregatedData[company_name]) {
        aggregatedData[company_name] = {
          performace_on_kpi_Female_employee_Permanent: 0,
          performace_on_kpi_Female_employee_Contractual: 0,
          LeadershipPosition: 0,
          employeelefttheorginlastfinancialyear: 0,
          Totalpermanentemployees: 0,
          Totalfemaleemployees: 0,
          Totalfemaleincontractualemployees: 0,
          Totalfemaleinpermanentemployees: 0,
          performace_on_kpi_Employee_turnover_Attrition: 0,
          Womeninleadershipposition: 0,
          Totalemployees: 0
        };
      }
      aggregatedData[company_name].performace_on_kpi_Female_employee_Permanent += performace_on_kpi_Female_employee_Permanent;
      aggregatedData[company_name].performace_on_kpi_Female_employee_Contractual += performace_on_kpi_Female_employee_Contractual;
      aggregatedData[company_name].LeadershipPosition += LeadershipPosition;
      aggregatedData[company_name].employeelefttheorginlastfinancialyear += employeelefttheorginlastfinancialyear;
      aggregatedData[company_name].Totalpermanentemployees += Totalpermanentemployees;
      aggregatedData[company_name].Totalfemaleemployees += Totalfemaleemployees;
      aggregatedData[company_name].Totalfemaleincontractualemployees += Totalfemaleincontractualemployees;
      aggregatedData[company_name].Totalfemaleinpermanentemployees += Totalfemaleinpermanentemployees;
      aggregatedData[company_name].performace_on_kpi_Employee_turnover_Attrition += performace_on_kpi_Employee_turnover_Attrition;
      aggregatedData[company_name].Womeninleadershipposition += Womeninleadershipposition;
      aggregatedData[company_name].Totalemployees += Totalemployees;
    });

    newArray = Object.keys(aggregatedData).map((company_name) => ({
      company_name,
      performace_on_kpi_Female_employee_Permanent: aggregatedData[company_name].performace_on_kpi_Female_employee_Permanent,
      performace_on_kpi_Female_employee_Contractual: aggregatedData[company_name].performace_on_kpi_Female_employee_Contractual,
      //LeadershipPosition: aggregatedData[company_name].LeadershipPosition,
      //Totalpermanentemployees: aggregatedData[company_name].Totalpermanentemployees,
      employeelefttheorginlastfinancialyear: ((aggregatedData[company_name].employeelefttheorginlastfinancialyear / (aggregatedData[company_name].Totalpermanentemployees || 1)) * 100),
      Totalfemaleemployees: ((aggregatedData[company_name].Totalfemaleemployees / (aggregatedData[company_name].Totalemployees || 1)) * 100),
      Totalfemaleincontractualemployees: aggregatedData[company_name].Totalfemaleincontractualemployees,
      Totalfemaleinpermanentemployees: aggregatedData[company_name].Totalfemaleinpermanentemployees,
      performace_on_kpi_Employee_turnover_Attrition: aggregatedData[company_name].performace_on_kpi_Employee_turnover_Attrition,
      Womeninleadershipposition: ((aggregatedData[company_name].Womeninleadershipposition / (aggregatedData[company_name].LeadershipPosition || 1)) * 100),
      //Totalemployees: aggregatedData[company_name].Totalemployees,
    }));
    // <td>{`${((item.Totalfemaleemployees / totalEmployees) * 100).toFixed(1)}`}</td>
    // <td>{`${((item.Womeninleadershipposition / totalLeadershipPosition) * 100).toFixed(1)}`}</td>
    // <td>{`${((item.employeelefttheorginlastfinancialyear / totalpermanentemployees) * 100).toFixed(1)}`}</td>
    newArray = orderBy(newArray, ['company_name'], ['desc']);
    this.setState({ List: newArray })
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

    if (action === 'prev' && currentPage > 1) {
      this.setState({ currentPage: currentPage - 1 });
    } else if (action === 'next' && currentPage < totalPages) {
      this.setState({ currentPage: currentPage + 1 });
    }
  };

  handleSortChange = (event) => {
    const sortBy = event.target.value;

    let sortedList = [...this.state.List];

    switch (sortBy) {
      case 'Totalfemaleemployees':
        sortedList.sort((a, b) => a.Totalfemaleemployees - b.Totalfemaleemployees);
        break;
      case 'Totalfemaleincontractualemployees':
        sortedList.sort((a, b) => a.Totalfemaleincontractualemployees - b.Totalfemaleincontractualemployees);
        break;
      case 'Totalfemaleinpermanentemployees':
        sortedList.sort((a, b) => a.Totalfemaleinpermanentemployees - b.Totalfemaleinpermanentemployees);
        break;
      case 'performace_on_kpi_Employee_turnover_Attrition':
        sortedList.sort((a, b) => a.performace_on_kpi_Employee_turnover_Attrition - b.performace_on_kpi_Employee_turnover_Attrition);
        break;
      case 'Womeninleadershipposition':
        sortedList.sort((a, b) => a.Womeninleadershipposition - b.Womeninleadershipposition);
        break;
      case 'allData':
        // No sorting, show all data
        break;
      default:
        // Default case, no sorting
        break;
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
            fPermenent: 'asc',
            fContractual: 'asc',
            fTotal: 'asc',
            fPosition: 'asc',
            eTurnover: 'asc',
          })
        }
        else {
          newSortedList = orderBy(sortedList, ['company_name'], ['asc']);
          this.setState({
            portfolio: 'asc',
            fPermenent: 'asc',
            fContractual: 'asc',
            fTotal: 'asc',
            fPosition: 'asc',
            eTurnover: 'asc',
          })
        }
        break;
      case "fPermenent":
        if (sortby === 'asc') {
          newSortedList = orderBy(sortedList, ['performace_on_kpi_Female_employee_Permanent'], ['asc']);
          this.setState({
            portfolio: 'asc',
            fPermenent: 'desc',
            fContractual: 'asc',
            fTotal: 'asc',
            fPosition: 'asc',
            eTurnover: 'asc',
          })
        }
        else {
          newSortedList = orderBy(sortedList, ['performace_on_kpi_Female_employee_Permanent'], ['desc']);
          this.setState({
            portfolio: 'asc',
            fPermenent: 'asc',
            fContractual: 'asc',
            fTotal: 'asc',
            fPosition: 'asc',
            eTurnover: 'asc',
          })
        }
        break;
      case "fContractual":
        if (sortby === 'asc') {
          newSortedList = orderBy(sortedList, ['performace_on_kpi_Female_employee_Contractual'], ['asc']);
          this.setState({
            portfolio: 'asc',
            fPermenent: 'asc',
            fContractual: 'desc',
            fTotal: 'asc',
            fPosition: 'asc',
            eTurnover: 'asc',
          })
        }
        else {
          newSortedList = orderBy(sortedList, ['performace_on_kpi_Female_employee_Contractual'], ['desc']);
          this.setState({
            portfolio: 'asc',
            fPermenent: 'asc',
            fContractual: 'asc',
            fTotal: 'asc',
            fPosition: 'asc',
            eTurnover: 'asc',
          })
        }
        break;
      case "fTotal":
        if (sortby === 'asc') {
          newSortedList = orderBy(sortedList, ['Totalfemaleemployees'], ['asc']);
          this.setState({
            portfolio: 'asc',
            fPermenent: 'asc',
            fContractual: 'asc',
            fTotal: 'desc',
            fPosition: 'asc',
            eTurnover: 'asc',
          })
        }
        else {
          newSortedList = orderBy(sortedList, ['Totalfemaleemployees'], ['desc']);
          this.setState({
            portfolio: 'asc',
            fPermenent: 'asc',
            fContractual: 'asc',
            fTotal: 'asc',
            fPosition: 'asc',
            eTurnover: 'asc',
          })
        }
        break;
      case "fPosition":
        if (sortby === 'asc') {
          newSortedList = orderBy(sortedList, ['Womeninleadershipposition'], ['asc']);
          this.setState({
            portfolio: 'asc',
            fPermenent: 'asc',
            fContractual: 'asc',
            fTotal: 'asc',
            fPosition: 'desc',
            eTurnover: 'asc',
          })
        }
        else {
          newSortedList = orderBy(sortedList, ['Womeninleadershipposition'], ['desc']);
          this.setState({
            portfolio: 'asc',
            fPermenent: 'asc',
            fContractual: 'asc',
            fTotal: 'asc',
            fPosition: 'asc',
            eTurnover: 'asc',
          })
        }
        break;
      case "eTurnover":
        if (sortby === 'asc') {
          newSortedList = orderBy(sortedList, ['employeelefttheorginlastfinancialyear'], ['asc']);
          this.setState({
            portfolio: 'asc',
            fPermenent: 'asc',
            fContractual: 'asc',
            fTotal: 'asc',
            fPosition: 'asc',
            eTurnover: 'desc',
          })
        }
        else {
          newSortedList = orderBy(sortedList, ['employeelefttheorginlastfinancialyear'], ['desc']);
          this.setState({
            portfolio: 'asc',
            fPermenent: 'asc',
            fContractual: 'asc',
            fTotal: 'asc',
            fPosition: 'asc',
            eTurnover: 'asc',
          })
        }
        break;
      default:
        // Default case, no sorting
        break;
    }
    this.setState({ List: newSortedList });
  }
  excelExportCsv = () => {
    const csvData = this.convertJSONToCSV(this.state.List);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8' });
    FileSaver(blob, 'Performance On KPIs.csv');
  };
  convertJSONToCSV = (jsonData) => {
    const headerData = ["Portfolio", "% Female Employee (Permanent)", "% Female Employee (Contractual)", "% Female Employee (Total)", "% Female In Leadership Positiion", "% Employee Turnover / Attrition"];
    const header = headerData.join(',') + '\n';
    // Extract specific fields from each object
    const extractedFields = jsonData.map(({ company_name, performace_on_kpi_Female_employee_Permanent, performace_on_kpi_Female_employee_Contractual, Totalfemaleemployees, Womeninleadershipposition, employeelefttheorginlastfinancialyear }) => ({ company_name, performace_on_kpi_Female_employee_Permanent, performace_on_kpi_Female_employee_Contractual, Totalfemaleemployees, Womeninleadershipposition, employeelefttheorginlastfinancialyear }));
    const rows = extractedFields.map(obj => Object.values(obj).join(',')).join('\n');
    return header + rows;
  };
  excelExportXLS = () => {
    const csvData = this.convertJSONToXLS(this.state.List);
    const blob = new Blob([csvData], { type: 'application/vnd.ms-excel;charset=utf-8' });
    FileSaver(blob, 'Performance On KPIs.xls');
  };
  convertJSONToXLS = (jsonData) => {
    const headerData = ["Portfolio", "% Female Employee (Permanent)", "% Female Employee (Contractual)", "% Female Employee (Total)", "% Female In Leadership Positiion", "% Employee Turnover / Attrition"];
    const header = headerData.join('\t') + '\n';
    // Extract specific fields from each object
    const extractedFields = jsonData.map(({ company_name, performace_on_kpi_Female_employee_Permanent, performace_on_kpi_Female_employee_Contractual, Totalfemaleemployees, Womeninleadershipposition, employeelefttheorginlastfinancialyear }) => ({ company_name, performace_on_kpi_Female_employee_Permanent, performace_on_kpi_Female_employee_Contractual, Totalfemaleemployees, Womeninleadershipposition, employeelefttheorginlastfinancialyear }));
    const rows = extractedFields.map(obj => Object.values(obj).join('\t')).join('\n');
    return header + rows;
  };


  render() {
    const { anchorEl, currentPage, itemsPerPage } = this.state;
    const open = Boolean(anchorEl);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = this.state.List.slice(indexOfFirstItem, indexOfLastItem);

    return (
      <div className='chart_table'>
        <ChatHeadingSubHeading title="Performance On KPIs">
          <div className='chart_table_filters'>
            {/* <IconButton
              aria-owns={open ? "simple-popper" : undefined}
              aria-haspopup="true"
              variant="contained"
              onClick={this.handleClick}
            >
              <Poll />
            </IconButton> */}
            {/* <Popover
              id='simple-popper'
              open={open}
              anchorEl={anchorEl}
              onClose={this.handleClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              styles={{ paper: { padding: '0 10px' } }}
            >
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={this.state.checkedA}
                      onChange={this.handleChange('checkedA')}
                      value='checkedA'
                      size="small"
                      style={{ padding: 5 }}
                    />
                  }
                  label='% Female Employee (Permanent)'
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={this.state.checkedA}
                      onChange={this.handleChange('checkedA')}
                      value='checkedA'
                      size="small"
                      style={{ padding: 5 }}
                    />
                  }
                  label='% Female Employee (Contractual)'
                />
              </FormGroup>
            </Popover> */}
            {/* <FormControl className="custom_dropdown" style={{ minWidth: 120 }}>

              <Select
                autoWidth
                open={this.state.open}
                onClose={this.handleClose}
                onOpen={this.handleOpen}
                value={this.state.age}
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
                <MenuItem value='Totalfemaleemployees'>% Female Employee (Permanent)</MenuItem>
                <MenuItem value='Totalfemaleincontractualemployees'>% Female Employee (Contractual)</MenuItem>
                <MenuItem value='Totalfemaleinpermanentemployees'>% Female Employee (Total)</MenuItem>
                <MenuItem value='performace_on_kpi_Employee_turnover_Attrition'>Employee Turnover / Attrition</MenuItem>
                <MenuItem value='Womeninleadershipposition'>% Female In Leadership Position</MenuItem>
                <MenuItem value='allData'>All Data</MenuItem>
              </Select>
            </FormControl> */}
            {/* <Button className='export' style={{ padding: 0, minWidth: 24 }}>
              <MoreVert className='vertical_dots' />
            </Button> */}
          </div>
          <div data-html2canvas-ignore="true" style={{ display: 'flex', gap: 10 }}>
            <Button
              className="export_all_btn"
              onClick={() => {
                this.excelExportCsv();
              }}
            >
              Export to CSV
            </Button>
            <Button
              className="export_all_btn"
              onClick={() => {
                this.excelExportXLS();
              }}
            >
              Export to XLS
            </Button>
          </div>
        </ChatHeadingSubHeading>

        <table>
          <thead>
            <tr>
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
              <th onClick={() => { this.sorttablebycolumn('fPermenent', this.state.fPermenent) }} style={{ 'cursor': 'pointer' }}>
                <Grid
                  container
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center">
                  <span>% Female Employee (Permanent)</span>
                  <IconButton disableRipple aria-label="Sort" style={{ color: '#fff', padding: 1 }}>
                    {this.state.fPermenent === "asc" ? <ArrowUpwardIcon style={{ fontSize: 20 }} /> : <ArrowDownwardIcon style={{ fontSize: 20 }} />}
                  </IconButton>
                </Grid>
              </th>
              <th onClick={() => { this.sorttablebycolumn('fContractual', this.state.fContractual) }} style={{ 'cursor': 'pointer' }}>
                <Grid
                  container
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center">
                  <span>% Female Employee (Contractual)</span>
                  <IconButton disableRipple aria-label="Sort" style={{ color: '#fff', padding: 1 }}>
                    {this.state.fContractual === "asc" ? <ArrowUpwardIcon style={{ fontSize: 20 }} /> : <ArrowDownwardIcon style={{ fontSize: 20 }} />}
                  </IconButton>
                </Grid>
              </th>
              <th onClick={() => { this.sorttablebycolumn('fTotal', this.state.fTotal) }} style={{ 'cursor': 'pointer' }}>
                <Grid
                  container
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center">
                  <span>% Female Employee (Total)</span>
                  <IconButton disableRipple aria-label="Sort" style={{ color: '#fff', padding: 1 }}>
                    {this.state.fTotal === "asc" ? <ArrowUpwardIcon style={{ fontSize: 20 }} /> : <ArrowDownwardIcon style={{ fontSize: 20 }} />}
                  </IconButton>
                </Grid>
              </th>
              <th onClick={() => { this.sorttablebycolumn('fPosition', this.state.fPosition) }} style={{ 'cursor': 'pointer' }}>
                <Grid
                  container
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center">
                  <span>% Female In Leadership Positiion</span>
                  <IconButton disableRipple aria-label="Sort" style={{ color: '#fff', padding: 1 }}>
                    {this.state.fPosition === "asc" ? <ArrowUpwardIcon style={{ fontSize: 20 }} /> : <ArrowDownwardIcon style={{ fontSize: 20 }} />}
                  </IconButton>
                </Grid>
              </th>
              <th onClick={() => { this.sorttablebycolumn('eTurnover', this.state.eTurnover) }} style={{ 'cursor': 'pointer' }}>
                <Grid
                  container
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center">
                  <span>% Employee Turnover / Attrition</span>
                  <IconButton disableRipple aria-label="Sort" style={{ color: '#fff', padding: 1 }}>
                    {this.state.eTurnover === "asc" ? <ArrowUpwardIcon style={{ fontSize: 20 }} /> : <ArrowDownwardIcon style={{ fontSize: 20 }} />}
                  </IconButton>
                </Grid>
              </th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length === 0 ?
              <tr>
                <td colSpan={6} style={{ textAlign: "center" }}>
                  Data not found
                </td>
              </tr>
              :
              currentItems.map((item, index) => {
                // const totalEmployees = item.Totalemployees || 1; // Avoid division by zero
                // const totalLeadershipPosition = item.LeadershipPosition || 1; // Avoid division by zero
                // const totalpermanentemployees = item.Totalpermanentemployees || 1; // Avoid division by zero

                return (
                  <tr key={index}>
                    <td>{item.company_name}</td>
                    <td>{item.performace_on_kpi_Female_employee_Permanent}</td>
                    <td>{item.performace_on_kpi_Female_employee_Contractual}</td>
                    <td>{item.Totalfemaleemployees.toFixed(1)}</td>
                    <td>{item.Womeninleadershipposition.toFixed(1)}</td>
                    <td>{item.employeelefttheorginlastfinancialyear.toFixed(1)}</td>
                    {/* <td>{`${((item.Totalfemaleemployees / totalEmployees) * 100).toFixed(1)}`}</td>
                    <td>{`${((item.Womeninleadershipposition / totalLeadershipPosition) * 100).toFixed(1)}`}</td>
                    <td>{`${((item.employeelefttheorginlastfinancialyear / totalpermanentemployees) * 100).toFixed(1)}`}</td> */}
                    {/* <td>{`${((item.Totalfemaleinpermanentemployees / totalEmployees) * 100).toFixed(2)}`}</td>
                  <td>{`${((item.Totalfemaleincontractualemployees / totalEmployees) * 100).toFixed(2)}`}</td>
                  <td>{`${((item.Totalfemaleemployees / totalEmployees) * 100).toFixed(2)}`}</td>
                  <td>{`${((item.Womeninleadershipposition / totalEmployees) * 100).toFixed(2)}`}</td>
                  <td>{item.performace_on_kpi_Employee_turnover_Attrition}</td> */}
                  </tr>
                );
              })}
            <tr className='pagination'>
              <td colSpan={6}>
                {`Showing ${indexOfFirstItem + 1} - ${indexOfLastItem} of ${this.state.List.length}`}
                <IconButton onClick={() => this.handlePageChange('prev')}>
                  <ArrowLeft />
                </IconButton>
                <IconButton onClick={() => this.handlePageChange('next')}>
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

export default PerformanceOnKPIsTab;