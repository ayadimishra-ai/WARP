import { withStyles } from "@material-ui/core/styles";
import React, { Component } from 'react';
import navbarsStyle from "../../assets/jss/material-kit-pro-react/views/componentsSections/navbarsStyle";
import { getElasticIndexNew, getLabelText, getLanguageResourceElasticIndex, getWebsiteLanguageGuid } from "../../config";
// import {
//   SearchkitManager, InitialLoader, SearchkitProvider, TermQuery, TermsQuery, BoolMust, HierarchicalMenuFilter
// } from "searchkit";
import PropTypes from 'prop-types';
import { Link } from "react-router-dom";
import { getElasticData, getPageResource } from "../../utility";

const InitialLoaderComponent = (props) => (
  <div className="loading_Shop_cate">
    Loading categories...
  </div>
)
let CategoryData, updatecount = 0;

class ShopCategories extends Component {
  static contextTypes = {
    router: PropTypes.object
  }

  constructor(props, context) {
    super(props, context);
    this.state = {
      categoryList: [],
      loading: false,
      loadingText:'Loading..',
      shoplanguageresource : [],
    }
  };



  HierarchicalOptions = props => (
    <div
      className={props.bemBlocks
        .option()
        .state({ selected: props.selected })
        .mix(props.bemBlocks.container("item"))}
      onClick={() => this.onCategoryClick(props)}
    >
      <div className={props.bemBlocks.option("text")}>{props.label}</div>
    </div>
  );

  onCategoryClick = (props) => {
    // this.context.router.history.push("./listing-page?categories[0][0]=" + props.label);
    this.context.router.history.push("./listing-page?categories[0][0]=" + props);
  }

  componentDidUpdate() {
    if (this.props.buyerCategory.length > 0 && updatecount === 0) {
      updatecount = 1;
      this.getIndexData();
    }

    if (this.props.buyerCategory.length === 0 && updatecount === 1) {
      updatecount = 0;
    }
  }

  getIndexData = () => {
    this.setState({ loading: true })
    let url = getElasticIndexNew(localStorage.userType, null, null, localStorage.companyGuid);

    let splitURL = url.replace("https://", "").replace("http://").split("/");
    let urlNew = "";
    let index = "";
    let search = "";
    let commonquery = "";

    if (splitURL.length === 3) {
      urlNew = splitURL[0];
      index = splitURL[1];
      search = splitURL[2];
    } else {
      for (let i = 0; i < splitURL.length; i++) {
        if (i === 0) {
          urlNew = splitURL[i];
        }

        if (i === 1) {
          index = splitURL[i];
        }
        if (i === (splitURL.length - 1)) {
          search = splitURL[i];
        }
      }
    }

    if (search.indexOf('q=') > -1) {
      let splitdata = search.replace("_search", "").replace("?", "").replace("&", "");
      if (splitdata.indexOf("q=") > -1) {
        splitdata = splitdata.split("q=");
        let datakey = [];
        let datavalue = [];
        commonquery = '"query": {"bool": {"must": [';

        for (let j = 0; j < splitdata.length; j++) {
          if (splitdata[j].indexOf(":") > -1) {
            let data = splitdata[j].split(":");
            commonquery = commonquery + '{"match": {"' + data[0] + '": "' + data[1] + '"}}';
          }
        }
        commonquery = commonquery + '{"match": {"productname_raw.raw.keyword": "A6 6 pages leaflet Z fold"}}';
        commonquery = commonquery + ']}}';
      }
    }
    commonquery = '{"size": 0,"aggs": {"categoryname": {"terms": {"field": "listProductSubCategory.categoryname.raw.keyword"}}},"query": {"bool": {"must": [{"match": {"languageGuid": "' + localStorage.languageId + '"}},{"term": {"status_raw.raw.keyword": "Approved"}}, {"term": {"isActive": "true"}}, {"term": {"isSupplierActive": "true"}}';

    if (localStorage.gradeLevel !== undefined) {
      let data = JSON.parse(localStorage.gradeLevel);
      if (JSON.parse(localStorage.gradeLevel).length > 0) {
        let gradeLevel = '';
        data.map((item) => {
          gradeLevel = gradeLevel + '"' + item.gradeLevel + '",';
        })
        gradeLevel = gradeLevel.slice(0, -1);
        commonquery = commonquery + ',{"terms": {"listproductgradelevel.raw.keyword": [' + gradeLevel + ']}}';
      }
    }

    if (localStorage.commodityName !== "undefined") {
      let dataCommodity = JSON.parse(localStorage.commodityName);
      let commodityName = '';
      dataCommodity.map((item) => {
        commodityName = commodityName + '"' + item.commodityName + '",';
      })
      commodityName = commodityName.slice(0, -1);
      commonquery = commonquery + ',{"terms": {"commodity.raw.keyword": [' + commodityName + ']}}';

    }
    if (localStorage.userCountries !== "undefined") {
      let datacountryName = JSON.parse(localStorage.userCountries);
      let countryName = '';
      datacountryName.map((item) => {
        countryName = countryName + '"' + item.countryGuid + '",';
      })
      countryName = countryName.slice(0, -1);
      commonquery = commonquery + ', {"terms": {"listRateCardVM.CountryGuid.raw.keyword": [' + countryName + ']}}';
    }
    if (this.props.buyerCategory !== "") {
      commonquery = commonquery + ', {"terms": {"listProductSubCategory.categoryname.raw.keyword": [' + this.props.buyerCategory + ']}}';
    }
    if (this.props.buyerBusinessType !== "") {
      commonquery = commonquery + ', {"terms": {"supplierbusinesstype.raw.keyword": [' + this.props.buyerBusinessType + ']}}';
    }
    if (this.props.buyerProductLevelCertificates !== "") {
      commonquery = commonquery + ', {"terms": {"listproductcertifications.raw.keyword": [' + this.props.buyerProductLevelCertificates + ']}}';
    }
    let count = 0, Previouscount = 0;
    // if (this.props.buyerSupplierLevelMandatoryCertificates !== "") {
    //   Previouscount = 1;
    //   count = 1;
    //   commonquery = commonquery + ', {"bool": {"should": [{"terms": {"listSupplierMandatoryCertificates.documentguid.raw": [' + this.props.buyerSupplierLevelMandatoryCertificates + ']}}';
    //   // commonquery = commonquery + ', {"terms": {"listSupplierMandatoryCertificates.documentguid.raw": [' + this.props.buyerSupplierLevelMandatoryCertificates + ']}}';
    //   commonquery = commonquery + ', {"bool": {"must_not": [{ "exists": { "field": "listproductgradelevel.raw" } }]}}';
    // }
    // if (this.props.buyerSupplierLevelAdditionalCertificates !== "") {
    //   if (Previouscount > 0) {
    //     commonquery = commonquery + ', {"terms": {"listSupplierAdditionalCertificates.documenttitle.raw": [' + this.props.buyerSupplierLevelAdditionalCertificates + ']}}';
    //   } else {
    //     commonquery = commonquery + ', {"bool": {"should": [{"terms": {"listSupplierAdditionalCertificates.documenttitle.raw": [' + this.props.buyerSupplierLevelAdditionalCertificates + ']}}';
    //     commonquery = commonquery + ', {"bool": {"must_not": [{ "exists": { "field": "listproductgradelevel.raw" } }]}}';
    //   }
    //   count = 1;
    // }

    if (count === 1) {
      commonquery = commonquery + ']}}';
    }

    commonquery = commonquery + ']}}}';
    commonquery = JSON.parse(commonquery);

    getElasticData(index, commonquery, 0, 0, "listProductSubCategory.categoryname.raw.keyword:asc").then(json => {
      if (json !== null) {
        this.setState({ specificationLoader: false });
        let data = json.aggregations.categoryname.buckets;
        let categoryListdata = [];
        if (data.length > 0) {
          data.map((item) => {
            categoryListdata.push(item.key);
          });
          this.setState({ categoryList: categoryListdata, loading: false });
        }
        if(data.length === 0 ) {
          this.setState({loadingText : 'Loading...'},()=>{
            setTimeout(() => {
              this.setState({loadingText : 'No Data'})
            }, 3000);
          })
        }
      } else {
        this.setState({loadingText : 'Loading...'},()=>{
          setTimeout(() => {
            this.setState({loadingText : 'No Data'})
          }, 3000);
        })
      }
    }).catch();


    // axios.get(
    //   getElasticIndexNew(
    //     localStorage.userType,
    //     null,
    //     null,
    //     null
    //   ) + '_search?size=10000'
    // ).then(json => {
    //   if (json.status === 200) {
    //     this.setState({ specificationLoader: false });
    //     let gradeLevel = [];
    //     if (localStorage.userType.includes(RoleCodes.BUYER)) {

    //       if (localStorage.gradeLevel !== undefined) {
    //         JSON.parse(localStorage.gradeLevel).map(item => {
    //           gradeLevel.push(item.gradeLevel);
    //         })
    //       }

    //       let commodityName = [];
    //       if (localStorage.commodityName !== "undefined") {
    //         JSON.parse(localStorage.commodityName).map(item => {
    //           commodityName.push(item.commodityName);
    //         })
    //       }
    //       let countriesGuid = [];
    //       if (localStorage.userCountries !== "undefined") {
    //         JSON.parse(localStorage.userCountries).map(item => {
    //           countriesGuid.push(item.countryGuid);
    //         })
    //       }

    //       let filterData = json.data.hits.hits.filter((x) => { return x._source.languageGuid === localStorage.languageId && x._source["status_raw.raw"] === "Approved" && x._source.isActive === true && x._source.listRateCardVM.filter(x => { return x.countryGuid.includes(countriesGuid) }) });


    //       let data = '';
    //       if (JSON.parse(localStorage.commodityName).length > 0) {
    //         data = filterData.filter((x, idx) => { return commodityName.includes(x._source["commodity.raw"]) && (x._source["listProductSubCategory"].length !== 0) })

    //         // searchkit.addDefaultQuery(query => {
    //         //   return query.addQuery(
    //         //     BoolMust([
    //         //       TermQuery("languageGuid", localStorage.languageId),
    //         //       TermsQuery("listRateCardVM.countryGuid", countriesGuid),
    //         //       TermsQuery("commodity.raw", commodityName),
    //         //       TermQuery("status_raw.raw", "Approved"),
    //         //       TermQuery("isActive", "true")
    //         //     ])
    //         //   );
    //         // });
    //       }
    //       else {
    //         data = filterData.filter((x, idx) => { return (x._source["listProductSubCategory"].length !== 0) })
    //         // searchkit.addDefaultQuery(query => {
    //         //   return query.addQuery(
    //         //     BoolMust([
    //         //       TermQuery("languageGuid", localStorage.languageId),
    //         //       TermsQuery("listRateCardVM.countryGuid", countriesGuid),
    //         //       TermQuery("status_raw.raw", "Approved"),
    //         //       TermQuery("isActive", "true")
    //         //     ])
    //         //   );
    //         // });
    //       }

    //       const Categories = data.map(q => {
    //         if (q._source.listProductSubCategory[0]["categoryname.raw"] !== undefined) {
    //           return q._source.listProductSubCategory[0]["categoryname.raw"];
    //         }
    //       });

    //       let result = Categories.filter((q, idx) => Categories.indexOf(q) === idx);

    //       let categoryList = result.sort(function (a, b) {
    //         return a - b
    //       });

    //       this.setState({ categoryList: categoryList });

    //       let stringdataResult = '';
    //       // for (let i = 0; i < categoryList.length; i++) {
    //       //   if (categoryList[i] !== '') {
    //       //     return (<div>
    //       //       <div className="sk-hierarchical-menu-option sk-hierarchical-menu-list__item">
    //       //         <div className="sk-hierarchical-menu-option__text">categoryList[i]</div>
    //       //       </div>
    //       //     </div>)
    //       //   }
    //       // }
    //     }
    //   }
    // })
  }

  async componentDidMount() {
    this.getShoplanguageresource();
    CategoryData = this.getIndexData();
  }

  getShoplanguageresource() {
    getPageResource(getLanguageResourceElasticIndex(getWebsiteLanguageGuid(), 'shop') + '&size=10000')
        .then(json => {
            this.setState({ shoplanguageresource: json });
        }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
}

  render() {
    return (
      <React.Fragment>
        <div className="main_product_cata">
          <div className="product_cata">
            <div className="sk-panel filter--categories">
              <div className="sk-panel__content">
                <div className="sk-hierarchical-menu-list__root">
                  <div className="sk-hierarchical-menu-list__hierarchical-options">
                    {this.state.categoryList.loading === true ?
                      <InitialLoaderComponent></InitialLoaderComponent>
                      : this.state.categoryList.length == 0 ? <div className="sk-hierarchical-menu-option sk-hierarchical-menu-list__item"><div className="sk-hierarchical-menu-option__text">{this.state.loadingText}</div></div> : this.state.categoryList.map((CatNames) => {
                        return (<div>
                          <div className="sk-hierarchical-menu-option sk-hierarchical-menu-list__item" onClick={() => this.onCategoryClick(CatNames)} >
                            <div className="sk-hierarchical-menu-option__text">{CatNames}</div>
                          </div>
                        </div>)
                      })}
                    {/* <div>
                      <div className="sk-hierarchical-menu-option sk-hierarchical-menu-list__item">
                        <div className="sk-hierarchical-menu-option__text">Bags</div>
                      </div>
                    </div> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="redirect_listing_page solid_btn_new">
            {/* <Link to="listing-page" {...(localStorage.setItem('previousPath', 'view-more'))} ><span>View More</span></Link> */}
            <Link to={{
              pathname: 'listing-page',
              state: {
                buyerBusinessType: this.props.buyerBusinessType,
                buyerProductLevelCertificates: this.props.buyerProductLevelCertificates,
                buyerSupplierLevelAdditionalCertificates: this.props.buyerSupplierLevelAdditionalCertificates,
                buyerSupplierLevelMandatoryCertificates: this.props.buyerSupplierLevelMandatoryCertificates,
                commaSepratedBuyerProductCategories: this.props.commaSepratedBuyerProductCategories,
              }
            }} {...(localStorage.setItem('previousPath', 'view-more'))}>
              {/* <span>View More</span> */}
              <span>{this.state.shoplanguageresource !== null ? getLabelText(this.state.shoplanguageresource.filter(x => { return x.resourceKey === "viewmore"; })[0], "View More") : ""}</span>
              </Link>
          </div>
        </div>
      </React.Fragment>
    )
  }

}

export default withStyles(navbarsStyle)(ShopCategories)
