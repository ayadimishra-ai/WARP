import React, { Component } from "react";
import { orderBy } from "lodash";
import { Select, MenuItem } from "@material-ui/core";
import ChatHeadingSubHeading from "./ChatHeadingSubHeading";
class ThemewiseRiskRatingCompaniesTab extends Component {
  constructor(props) {
    super(props);
    this.state = {
      anchorEl: null,
      List: [],
      aggregatedData: [],
      selectedEsgRiskTheme: "",
      esgRiskThemeDetail: [],
    };
  }

  async componentDidMount() {
    this.setState({
      esgRiskThemeDetail: this.props.EsgRiskThemeData,
      selectedEsgRiskTheme: this.props.EsgRiskThemeData[0],
    });
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
    this.setState({ List: chartData }, async () => {
      await this.aggregateData();
    });
  }
  selectChangeTags = async (event, rowNumber) => {
    if (event.target.value !== "All") {
      let getFilterdSectorData = this.props.TotalSectorESGData.filter(
        (x) => x.tags_cs_cp === event.target.value
      );
      this.setState(
        {
          List: getFilterdSectorData,
          selectedEsgRiskTheme: event.target.value,
        },
        async () => {
          await this.aggregateData();
        }
      );
    } else {
      this.setState(
        {
          List: this.props.TotalSectorESGData,
          selectedEsgRiskTheme: event.target.value,
        },
        async () => {
          await this.aggregateData();
        }
      );
    }
  };
  async aggregateData() {
    const { List } = this.state;
    let aggregatedData = [];
    // const filteredData1 = List.filter(
    //   (item) =>
    //     ["Environment", "Social", "Governance"].includes(item.section_name) &&
    //     item.is_esg_section === true
    // );
    var unique_section_name = [
      ...new Map(
        List.map((item) => [item["company_name"], item])
      ).values(),
    ];
    const riskCategories = [
      'CSR',
      'HR Policy',
      'Grievance Redressal',
      'Diversity and Inclusion',
      'Health and Safety',
      'PoSH',
      'Social Compliance',
      'Certifications',
      'Code of Conduct',
      'Data Privacy & Cybersecurity',
      'Supplier Code of Conduct',
      'Environmental Policy',
      'Environmental KPIs',
      'Waste',
    ];
    aggregatedData = await Promise.all(unique_section_name.map(async (itemdata) => {
      try {
        let filterData = List.filter((x) => x.company_name === itemdata.company_name);
        let companyTheme = [];
        await riskCategories.map(async (themeData) => {
          let themeScore = filterData
            .filter((x) => x.section_name === themeData)
            .map((y) => y.score)
            .reduce((sum, current) => sum + current, 0);
          let themeWeightage = filterData
            .filter((x) => x.section_name === themeData)
            .map((y) => y.weightage)
            .reduce((sum, current) => sum + current, 0);
          let themeRisk = this.getRiskLevel((themeScore / themeWeightage) * 100);
          companyTheme.push(themeRisk);
        });
        return {
          company_name: itemdata.company_name,
          sector: itemdata.sector,
          themeRisk: companyTheme,
        };
      } catch (error) {
        return {
          section_name: itemdata.section_name,
          score: 0,
        };
      }
    }));


    // let sorted_data = orderBy(List, ["risk"], ["desc"]);
    // // Creating a map to aggregate scores based on company name
    // const scoreMap = new Map();

    // sorted_data.forEach((item) => {
    //   const key = item.company_name;
    //   if (scoreMap.has(key)) {
    //     scoreMap.set(key, scoreMap.get(key) + item.score);
    //   } else {
    //     scoreMap.set(key, item.score);
    //     aggregatedData.push({
    //       company_name: item.company_name,
    //       risk: item.risk,
    //     });
    //   }
    // });

    // Converting the map to an array
    // scoreMap.forEach((value, key) => {
    //   const section_name = List.length > 0 ? List[0].section_name : '';
    //   aggregatedData.push({
    //     company_name: key,
    //     section_name,
    //     weightage: value,
    //   });
    // });

    // Updating the aggregated data with scores
    // List.forEach((item) => {
    //   const key = item.company_name;
    //   const aggregatedItem = aggregatedData.find((data) => key === data.company_name);
    //   if (aggregatedItem) {
    //     aggregatedItem.score += item.score;
    //   }
    // });

    // Sorting the aggregated data by score in descending order
    // aggregatedData.sort((a, b) => b.weightage - a.weightage);

    // Update the component state with the aggregated data
    aggregatedData = orderBy(aggregatedData, ['company_name'], ['asc']);
    this.setState({ aggregatedData });
  }

  getRiskLevel = (percentage) => {
    // if (weightage === 0) {
    //   return 'NA';
    // }

    // const percentage = (score / weightage) * 100;

    if (percentage >= 0 && percentage <= 33) {
      return 'High';
    } else if (percentage > 33 && percentage <= 60) {
      return 'Medium';
    } else if (percentage > 60 && percentage <= 100) {
      return 'Low';
    } else {
      return 'Low';
    }
  };
  render() {
    const { aggregatedData } = this.state;
    // Define an array of risk categories
    const riskCategories = [
      'CSR',
      'HR Policy',
      'Grievance Redressal',
      'Diversity and Inclusion',
      'Health and Safety',
      'PoSH',
      'Social Compliance',
      'Certifications',
      'Code of Conduct',
      'Data Privacy & Cybersecurity',
      'Supplier Code of Conduct',
      'Environmental Policy',
      'Environmental KPIs',
      'Waste',
    ];

    return (
      <div className="chart_table">
        <ChatHeadingSubHeading title="Theme wise Risk Rating Companies">
          <div>
            <span>Tags: </span>
            <Select
              value={this.state.selectedEsgRiskTheme}
              onChange={(event) => this.selectChangeTags(event)}
              displayEmpty
              name="ESGRiskTheme"
              className={"header_select"}
            >
              {this.state.esgRiskThemeDetail.map((option) => (
                <MenuItem value={option} key={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </div>
        </ChatHeadingSubHeading>
        <div style={{ overflow: "auto", }}>
          <table>
            <thead>
              <tr>
                <th>Portfolio</th>
                {/* <th>Risk</th> */}
                {riskCategories.map((category) => (
                  <th key={category}>{category}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {aggregatedData.length === 0 ? (
                <tr>
                  <td colSpan={2} style={{ textAlign: "center" }}>
                    Data not found
                  </td>
                </tr>
              ) : (
                aggregatedData.map((item, index) => (
                  <tr key={index}>
                    <td>{item.company_name}</td>
                    {/* <td
                    style={{
                      background:
                        item.risk === "Low"
                          ? "#E7F8DD"
                          : item.risk === "Medium"
                            ? "#FFECD5"
                            : "#FFDBDB",
                    }}
                  >
                    {item.risk}
                  </td> */}
                    {item.themeRisk.map((category) => (
                      <td style={{ background: category === "Low" ? "#E7F8DD" : category === "Medium" ? "#FFECD5" : "#FFDBDB", }}>
                        {category}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default ThemewiseRiskRatingCompaniesTab;
