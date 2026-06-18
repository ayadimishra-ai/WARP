import React, { Component } from 'react';
import { orderBy } from 'lodash';
import ChatHeadingSubHeading from './ChatHeadingSubHeading';
import {
  Button,
} from '@material-ui/core'
var FileSaver = require('file-saver');
class ESGRiskTab extends Component {
  constructor(props) {
    super(props);
    this.state = {
      anchorEl: null,
      List: [],
      aggregatedData: [],
    };
  }

  componentDidMount() {
    // let data = JSON.stringify({
    //   query: "query MyQuery{gettotalsectoresg(args:{parentcompanyid:\"ce6c5fee-10ef-4cf7-af5b-1a6d6d83645b\"}){company_name sector score weightage section_name}}",
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
    //     const chartData = response.data.data.gettotalsectoresg;
    //     this.setState({ List: chartData }, () => {
    //       this.aggregateData();
    //     });
    //   })
    //   .catch((error) => {
    //     console.error('Error fetching data:', error);
    //   });
    const chartData = this.props.TotalSectorESGData;
    let sorted_data = orderBy(chartData, ['risk'], ['desc']);
    this.setState({ List: sorted_data }, () => {
      this.aggregateData();
    });
  }

  aggregateData() {
    const { List } = this.state;
    let aggregatedData = [];
    const filteredData1 = List.filter(
      (item) =>
        ["Environment", "Social", "Governance"].includes(item.section_name) &&
        item.is_esg_section === true
    );
    var unique_section_name = [
      ...new Map(
        filteredData1.map((item) => [item["company_name"], item])
      ).values(),
    ];

    aggregatedData = unique_section_name.map((itemdata) => {
      try {
        let envScore = filteredData1
          .filter((x) => x.company_name === itemdata.company_name && x.sector === itemdata.sector && x.esg_section_name === "Environment")
          .map((y) => y.score)
          .reduce((sum, current) => sum + current);
        let envWeightage = filteredData1
          .filter((x) => x.company_name === itemdata.company_name && x.sector === itemdata.sector && x.esg_section_name === "Environment")
          .map((y) => y.weightage)
          .reduce((sum, current) => sum + current);

        let socialScore = filteredData1
          .filter((x) => x.company_name === itemdata.company_name && x.sector === itemdata.sector && x.esg_section_name === "Social")
          .map((y) => y.score)
          .reduce((sum, current) => sum + current);
        let socialWeightage = filteredData1
          .filter((x) => x.company_name === itemdata.company_name && x.sector === itemdata.sector && x.esg_section_name === "Social")
          .map((y) => y.weightage)
          .reduce((sum, current) => sum + current);

        let govScore = filteredData1
          .filter((x) => x.company_name === itemdata.company_name && x.sector === itemdata.sector && x.esg_section_name === "Governance")
          .map((y) => y.score)
          .reduce((sum, current) => sum + current);
        let govWeightage = filteredData1
          .filter((x) => x.company_name === itemdata.company_name && x.sector === itemdata.sector && x.esg_section_name === "Governance")
          .map((y) => y.weightage)
          .reduce((sum, current) => sum + current);

        return {
          company_name: itemdata.company_name,
          sector: itemdata.sector,
          environment: this.renderRiskLevel((envScore / envWeightage) * 100),
          social: this.renderRiskLevel((socialScore / socialWeightage) * 100),
          governance: this.renderRiskLevel((govScore / govWeightage) * 100),
        };
      } catch (error) {
        return {
          section_name: itemdata.section_name,
          score: 0,
        };
      }
    });

    // Creating a map to aggregate scores based on company name and sector
    // const scoreMap = new Map();

    // List.filter(item =>
    //   ["Environment", "Social", "Governance"].includes(item.section_name) && item.is_esg_section === true
    // ).forEach((item) => {
    //   const key = `${item.company_name}_${item.sector}`;
    //   if (scoreMap.has(key)) {
    //     scoreMap.set(key, scoreMap.get(key) + item.score);
    //   } else {
    //     scoreMap.set(key, item.score);
    //     aggregatedData.push({
    //       company_name: item.company_name,
    //       sector: item.sector,
    //       risk: item.risk
    //     });
    //   }
    // });

    // Converting the map to an array
    // scoreMap.forEach((value, key) => {
    //   const [company_name, sector] = key.split('_');
    //   aggregatedData.push({
    //     company_name,
    //     sector,
    //     score: value, // Use the aggregated score
    //     weightage: value, // Use the aggregated score for weightage
    //   });
    // });

    // Sorting the aggregated data by score in descending order
    // aggregatedData.sort((a, b) => b.score - a.score);
    aggregatedData = orderBy(aggregatedData, ['company_name'], ['asc']);
    // Update the component state with the aggregated data
    this.setState({ aggregatedData });
  }

  renderRiskLevel = (percentage) => {
    // if (weightage === 0) {
    //   return 'NA';
    // }

    //const percentage = (score / weightage) * 100;

    if (percentage >= 0 && percentage <= 33) {
      return 'High';
    } else if (percentage > 33 && percentage <= 60) {
      return 'Medium';
    } else if (percentage > 60 && percentage <= 100) {
      return 'Low';
    } else {
      return 'Low'; // Default to 'Low' if none of the conditions are met
    }
  };
  excelExportCsv = () => {
    const csvData = this.convertJSONToCSV(this.state.aggregatedData);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8' });
    FileSaver(blob, 'ESG Risk.csv');
  };
  convertJSONToCSV = (jsonData) => {
    const headerData = ["Portfolio", "Sector", "Environment", "Social", "Governance"];
    const header = headerData.join(',') + '\n';
    // Extract specific fields from each object
    const extractedFields = jsonData.map(({ company_name, sector, environment, social, governance }) => ({ company_name, sector, environment, social, governance }));
    const rows = extractedFields.map(obj => Object.values(obj).join(',')).join('\n');
    return header + rows;
  };
  excelExportXLS = () => {
    const csvData = this.convertJSONToXLS(this.state.aggregatedData);
    const blob = new Blob([csvData], { type: 'application/vnd.ms-excel;charset=utf-8' });
    FileSaver(blob, 'ESG Risk.xls');
  };
  convertJSONToXLS = (jsonData) => {
    const headerData = ["Portfolio", "Sector", "Environment", "Social", "Governance"];
    const header = headerData.join('\t') + '\n';
    // Extract specific fields from each object
    const extractedFields = jsonData.map(({ company_name, sector, environment, social, governance }) => ({ company_name, sector, environment, social, governance }));
    const rows = extractedFields.map(obj => Object.values(obj).join('\t')).join('\n');
    return header + rows;
  };

  render() {
    const { aggregatedData } = this.state;

    return (
      <div className='chart_table'>
        <ChatHeadingSubHeading  title="ESG Risk">
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
              <th>Portfolio</th>
              <th>Sector</th>
              <th>Environment</th>
              <th>Social</th>
              <th>Governance</th>
            </tr>
          </thead>
          <tbody>
            {aggregatedData.length === 0 ?
              <tr>
                <td colSpan={3} style={{ textAlign: "center" }}>
                  Data not found
                </td>
              </tr>
              :
              aggregatedData.map((item, index) => (
                <tr key={index}>
                  <td>{item.company_name}</td>
                  <td>{item.sector}</td>
                  <td style={({ background: item.environment === "Low" ? '#E7F8DD' : item.environment === "Medium" ? '#FFECD5' : '#FFDBDB' })}>{item.environment}</td>
                  <td style={({ background: item.social === "Low" ? '#E7F8DD' : item.social === "Medium" ? '#FFECD5' : '#FFDBDB' })}>{item.social}</td>
                  <td style={({ background: item.governance === "Low" ? '#E7F8DD' : item.governance === "Medium" ? '#FFECD5' : '#FFDBDB' })}>{item.governance}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    );
  }
}

export default ESGRiskTab;
