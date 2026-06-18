import React, { Component } from "react";
import { Select, MenuItem } from "@material-ui/core";
import ChatHeadingSubHeading from "./ChatHeadingSubHeading";
class Top5CompaniesTheme extends Component {
  constructor(props) {
    super(props);
    this.state = {
      anchorEl: null,
      List: [],
      aggregatedData: [],
      selectedTheme: "",
      themeSelectData: [],
    };
  }

  componentDidMount() {
    this.setState({
      themeSelectData: this.props.SelectTopBottomThemeData,
      selectedTheme: this.props.SelectTopBottomThemeData[0],
    });
    // const axios = require('axios');
    // let data = JSON.stringify({
    //   query: `query MyQuery {
    //   gettotalsectoresg(args: {parentcompanyid: "ce6c5fee-10ef-4cf7-af5b-1a6d6d83645b"}, order_by: {sector: desc}) {
    //     sector
    //     score
    //     section_name
    //     company_name
    //   }
    // }`,
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
    //   data : data
    // };

    // axios.request(config)
    // .then((response) => {
    //  // console.log(JSON.stringify(response.data));
    //   const chartData = response.data.data.gettotalsectoresg;
    //   this.setState({ List: chartData }, () => {
    //     this.aggregateData();
    //   });
    // })
    // .catch((error) => {
    //   console.log(error);
    // });
    const chartData = this.props.TotalSectorESGData;
    //let sorted_data = orderBy(chartData, ['sector'], ['desc']);
    this.setState({ List: chartData }, () => {
      this.aggregateData();
    });
  }
  selectChangeTheme = (event, rowNumber) => {
    if (event.target.value !== "All") {
      let getSelectThemeData = this.props.TotalSectorESGData.filter(
        (x) => x.section_name === event.target.value
      );
      this.setState(
        { List: getSelectThemeData, selectedTheme: event.target.value },
        () => {
          this.aggregateData();
        }
      );
    } else {
      this.setState(
        {
          List: this.props.TotalSectorESGData,
          selectedTheme: event.target.value,
        },
        () => {
          this.aggregateData();
        }
      );
    }
  };
  aggregateData() {
    const { List } = this.state;
    let aggregatedData = [];

    const filteredData1 = List.filter(
      (item) =>
        ["Environment", "Social", "Governance"].includes(
          item.esg_section_name
        ) && item.is_theme_section === true
    );
    var unique_section_name = [
      ...new Map(
        filteredData1.map((item) => [item["company_name"], item])
      ).values(),
    ];
    aggregatedData = unique_section_name.map((itemdata) => {
      try {
        let sumvalue = filteredData1
          .filter((x) => x.company_name === itemdata.company_name)
          .map((y) => y.total_ESG_weighted_score)
          .reduce((sum, current) => sum + current);
        let length = filteredData1.filter(
          (x) => x.company_name === itemdata.company_name
        ).length;
        let average = sumvalue / length;
        return {
          company_name: itemdata.company_name,
          sector: itemdata.sector,
          score: average,
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

    // List.forEach((item) => {
    //   const key = `${item.company_name}_${item.sector}`;
    //   if (scoreMap.has(key)) {
    //     scoreMap.set(key, scoreMap.get(key) + item.score);
    //   } else {
    //     scoreMap.set(key, item.score);
    //   }
    // });

    // // Converting the map to an array
    // scoreMap.forEach((value, key) => {
    //   const [company_name, sector] = key.split('_');
    //   aggregatedData.push({
    //     company_name,
    //     sector,
    //     score: value,
    //   });
    // });

    // Sorting the aggregated data by score in descending order
    aggregatedData.sort((a, b) => b.score - a.score);

    // Update the component state with the aggregated data
    this.setState({ aggregatedData });
  }

  render() {
    const { aggregatedData } = this.state;

    // Assuming you want to display only the top 5 aggregated companies
    const top5AggregatedCompanies = aggregatedData.slice(0, 5);

    return (
      <div className="chart_table">
        <ChatHeadingSubHeading title="Top 5 Companies(Themes)">
          <div>
            <span>Theme: </span>
            <Select
              value={this.state.selectedTheme}
              onChange={(event) => this.selectChangeTheme(event)}
              displayEmpty
              name="theme"
              className={"header_select"}
            >
              {this.state.themeSelectData.map((option) => (
                <MenuItem value={option} key={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </div>
        </ChatHeadingSubHeading>
        <table>
          <thead>
            <tr>
              <th>Company</th>
              <th>Sector</th>
              <th>Score %</th>
            </tr>
          </thead>
          <tbody>
            {top5AggregatedCompanies.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ textAlign: "center" }}>
                  Data not found
                </td>
              </tr>
            ) : (
              top5AggregatedCompanies.map((item, index) => (
                <tr key={index}>
                  <td>{item.company_name}</td>
                  <td>{item.sector}</td>
                  <td>{item.score.toFixed(1)}</td>{" "}
                  {/* Format the score to 2 decimal places */}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  }
}

export default Top5CompaniesTheme;
