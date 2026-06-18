import React, { Component } from "react";
import { orderBy } from "lodash";
import { Select, MenuItem } from "@material-ui/core";
import ChatHeadingSubHeading from "./ChatHeadingSubHeading";
class ThemewiseRiskRatingSectorsTab extends Component {
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
    //   query: "query MyQuery{gettotalsectoresg(args:{parentcompanyid:\"ce6c5fee-10ef-4cf7-af5b-1a6d6d83645b\"}){sector score weightage section_name}}",
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
    //const chartData = this.props.TotalSectorESGData;
    //let sorted_data = orderBy(chartData, ['risk'], ['desc']);
    this.setState({ List: this.props.TotalSectorESGData }, async () => {
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
    var unique_section_name = [
      ...new Map(
        List.map((item) => [item["sector"], item])
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
        let filterData = List.filter((x) => x.sector === itemdata.sector);
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
    // var unique_section_name = [
    //   ...new Map(List.map((item) => [item["sector"], item])).values(),
    // ];
    // aggregatedData = unique_section_name.map((itemdata) => {
    //   try {
    //     let sumvalue = List.filter((x) => x.sector === itemdata.sector)
    //       .map((y) => y.total_ESG_weighted_score)
    //       .reduce((sum, current) => sum + current);
    //     let length = List.filter((x) => x.sector === itemdata.sector).length;
    //     let average = sumvalue / length;

    //     return {
    //       sector: itemdata.sector,
    //       risk: this.getRiskLevel(average),
    //     };
    //   } catch (error) {
    //     return {
    //       section_name: itemdata.section_name,
    //       score: 0,
    //     };
    //   }
    // });
    // Creating a map to aggregate scores based on company name and sector
    // const scoreMap = new Map();

    // List.forEach((item) => {
    //   const key = `${item.sector}`;
    //   if (scoreMap.has(key)) {
    //     scoreMap.set(key, scoreMap.get(key) + item.score);
    //   } else {
    //     scoreMap.set(key, item.score);
    //     let sumvalue = List.filter(x => x.sector === item.sector).map(y => y.score).reduce((sum, current) => sum + current);
    //     let length = List.filter(x => x.sector === item.sector).length;
    //     let average = sumvalue / length;
    //     aggregatedData.push({
    //       sector: item.sector,
    //       risk: this.getRiskLevel(average)
    //     });
    //   }
    // });

    // Converting the map to an array
    // scoreMap.forEach((value, key) => {
    //   const [company_name, sector] = key.split('_');
    //   const section_name = List.length > 0 ? List[0].section_name : '';
    //   aggregatedData.push({
    //     sector,
    //     section_name,
    //     weightage: value,
    //   });
    // });

    // Updating the aggregated data with scores
    // List.forEach((item) => {
    //   const key = `${item.company_name}_${item.sector}`;
    //   const aggregatedItem = aggregatedData.find((data) => key === `${data.company_name}_${data.sector}`);
    //   if (aggregatedItem) {
    //     aggregatedItem.score += item.score;
    //   }
    // });

    // Sorting the aggregated data by score in descending order
    //aggregatedData.sort((a, b) => b.weightage - a.weightage);
    aggregatedData = orderBy(aggregatedData, ["sector"], ["asc"]);
    // Update the component state with the aggregated data
    this.setState({ aggregatedData });
  }

  getRiskLevel = (percentage) => {
    //const percentage = (total_esg_weighted_score / weightage) * 100;
    // if (percentage === 0) {
    //   return "NA";
    // }
    // case when AVG(total_esg_weighted_score) >= 0 and AVG(total_esg_weighted_score) <= 33
    // then 'High'
    // when AVG(total_esg_weighted_score) > 33 and AVG(total_esg_weighted_score) <= 60
    // then 'Medium'
    // when AVG(total_esg_weighted_score) > 60 and AVG(total_esg_weighted_score) <= 100
    // then 'Low'
    // else 'NA' end
    //const percentage = (score / weightage) * 100;
    if (percentage >= 0 && percentage <= 33) {
      return "High";
    } else if (percentage > 33 && percentage <= 60) {
      return "Medium";
    } else if (percentage > 60 && percentage <= 100) {
      return "Low";
    } else {
      return "Low";
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
        <ChatHeadingSubHeading title="Theme wise Risk Rating Sectors">
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
                <th>Sector</th>
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
                    <td>{item.sector}</td>
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

export default ThemewiseRiskRatingSectorsTab;
