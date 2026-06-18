import React, { Component, PureComponent } from "react";
import { connect } from "react-redux";
import Aux from "../../hoc/Auxx";
import axios from 'axios';
import {
  // getElasticIndexUrl,
  getUserPermision,
  getLanguageResourceElasticIndex,
  getLabelText,
  getWebsiteGUID,
  getServiceUrl,
} from "../../config";
// import "../../../node_modules/searchkit/release/theme.css";
// import "../../../node_modules/searchkit-datefilter/release/theme.css";
import { Redirect } from "react-router-dom";
import * as PageKeys from "../../pagekeys";
import {
  BreadCrumb,
  getPageResource,
  toasterAlert,
  getElasticData,
  getElasticDataPOIndex,
} from "../../utility";
import GridContainer from "../../components/Material/Grid/GridContainer";
import GridItem from "../../components/Material/Grid/GridItem";
import { Table, Thead, Tbody, Tr, Th, Td } from "react-super-responsive-table";
import toaster from "toasted-notes";
import Input from "../../UI/Input/MaterialInput";
import Datetime from "react-datetime";
import Pagination from "../../components/Pagination/Pagination";
import moment from "moment";
import * as RoleCodes from "../../rolecodes";
import * as actionCreators from "../../store/actions/index";
import Spinner from "../../UI/Spinner/Spinner";

const InitialLoaderComponent = (props) => (
  <div className="data-loading-div">
    <img
      alt="loader"
      src="https://cdnjs.cloudflare.com/ajax/libs/galleriffic/2.0.1/css/loader.gif"
    />
    loading please wait...
  </div>
);

let GlobalPageLimit = 10;
let hitCount = 0;
let SearchValues = "";
let FromDate = "";
let ToDate = "";
let LocationselectedValues = "";
let isSelected = 0;
let isSelectedStatus = 0;
let Selected_Status = "";

const today = moment();
const disableFutureDt = (current) => {
  return current.isBefore(today);
};
class List extends PureComponent {
  render() {
    let counts = 0;
    return (
      <div>
        {this.props.LocationValues !== "" &&
          this.props.LocationValues !== "-- Select --" ? (
            <div className="sk-filter-group filter-group-users">
              <input type="hidden" value={(counts = counts + 1)} />
              <div className="sk-filter-groups">
                <div className="sk-filter-group-items">
                  <div className="sk-filter-group-items__title">Location</div>
                  <div className="sk-filter-group-items__list">
                    <div
                      className="sk-filter-group-items__value"
                      data-key="Location"
                      onClick={this.props.onClick}
                    >
                      {this.props.LocationValues}
                    </div>
                  </div>
                </div>
                <div
                  className="sk-filter-group__remove-action"
                  data-key="Location"
                  onClick={this.props.onClick}
                >
                  X
              </div>
              </div>
            </div>
          ) : (
            ""
          )}
        {this.props.SearchValues !== "" ? (
          <div className="sk-filter-group filter-group-users">
            <input type="hidden" value={(counts = counts + 1)} />
            <div className="sk-filter-groups">
              <div className="sk-filter-group-items">
                <div className="sk-filter-group-items__title">
                  Product, Supplier, PO#, PR#
                </div>
                <div className="sk-filter-group-items__list">
                  <div
                    className="sk-filter-group-items__value"
                    data-key="SearchValues"
                    onClick={this.props.onClick}
                  >
                    {this.props.SearchValues}
                  </div>
                </div>
              </div>
              <div
                className="sk-filter-group__remove-action"
                data-key="SearchValues"
                onClick={this.props.onClick}
              >
                X
              </div>
            </div>
          </div>
        ) : (
            ""
          )}

        {this.props.fromdate !== "" ? (
          <div className="sk-filter-group filter-group-users">
            <input type="hidden" value={(counts = counts + 1)} />
            <div className="sk-filter-groups">
              <div className="sk-filter-group-items">
                <div className="sk-filter-group-items__title">FromDate</div>
                <div className="sk-filter-group-items__list">
                  <div
                    className="sk-filter-group-items__value"
                    data-key="fromdateFilter"
                    onClick={this.props.onClick}
                  >
                    {this.props.fromdate}
                  </div>
                </div>
              </div>
              <div
                className="sk-filter-group__remove-action"
                data-key="fromdateFilter"
                onClick={this.props.onClick}
              >
                X
              </div>
            </div>
          </div>
        ) : (
            ""
          )}

        {this.props.todate !== "" ? (
          <div className="sk-filter-group filter-group-users">
            <input type="hidden" value={(counts = counts + 1)} />
            <div className="sk-filter-groups">
              <div className="sk-filter-group-items">
                <div className="sk-filter-group-items__title">ToDate</div>
                <div className="sk-filter-group-items__list">
                  <div
                    className="sk-filter-group-items__value"
                    data-key="todateFilter"
                    onClick={this.props.onClick}
                  >
                    {this.props.todate}
                  </div>
                </div>
              </div>
              <div
                className="sk-filter-group__remove-action"
                data-key="todateFilter"
                onClick={this.props.onClick}
              >
                X
              </div>
            </div>
          </div>
        ) : (
            ""
          )}

        {this.props.Selected_Status !== "" ? (
          <div className="sk-filter-group filter-group-users">
            <input type="hidden" value={(counts = counts + 1)} />
            <div className="sk-filter-groups">
              <div className="sk-filter-group-items">
                <div className="sk-filter-group-items__title">Staus</div>
                <div className="sk-filter-group-items__list">
                  <div
                    className="sk-filter-group-items__value"
                    data-key="Selected_Status"
                    onClick={this.props.onClick}
                  >
                    {this.props.Selected_Status}
                  </div>
                </div>
              </div>
              <div
                className="sk-filter-group__remove-action"
                data-key="Selected_Status"
                onClick={this.props.onClick}
              >
                X
              </div>
            </div>
          </div>
        ) : (
            ""
          )}

        {counts > 0 ? (
          <div className="sk-reset-filters">
            <div
              className="sk-reset-filters__reset"
              onClick={this.props.onClick}
            >
              Clear all filters
            </div>
          </div>
        ) : (
            ""
          )}
      </div>
    );
  }
}

//#region
class OrderDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      resources: [],
      openOrder: false,
      openOrderBlock: "",
      Productsname: false,
      ProductsnameBlock: "",
      openPR: false,
      openPRBlock: "",
      indexData: [],
    };
  }
  componentDidMount() {
    getPageResource(
      getLanguageResourceElasticIndex(
        localStorage.languageId,
        PageKeys.polisting
      )
    )
      .then((json) => {
        this.setState({ resources: json });
      })
      .catch((err) =>
        err.response !== undefined
          ? err.response.status === 401
            ? (window.location.pathname = "/logout")
            : ""
          : ""
      );
  }
  openOrder = () => {
    if (this.state.openOrder === false) {
      this.setState({ openOrder: true });
    } else {
      this.setState({ openOrder: false });
    }
  };

  openOrder = (id, length, event) => {
    var object = event.currentTarget;
    if (
      object.innerHTML.includes(
        getLabelText(
          this.state.resources.filter((x) => {
            return x.resourceKey === "more";
          })[0],
          "More"
        )
      )
    ) {
      object.innerHTML =
        "- " +
        length +
        " " +
        getLabelText(
          this.state.resources.filter((x) => {
            return x.resourceKey === "less";
          })[0],
          "Less"
        );
      this.setState({ openOrder: { [id]: true } });
    } else {
      object.innerHTML =
        "+ " +
        length +
        " " +
        getLabelText(
          this.state.resources.filter((x) => {
            return x.resourceKey === "more";
          })[0],
          "More"
        );
      this.setState({ openOrder: false });
    }
    this.setState({ openOrderBlock: { [id]: object.innerHTML } });
  };
  openProductsname = (id, length, event) => {
    var object = event.currentTarget;
    if (
      object.innerHTML.includes(
        getLabelText(
          this.state.resources.filter((x) => {
            return x.resourceKey === "more";
          })[0],
          "More"
        )
      )
    ) {
      object.innerHTML =
        "- " +
        length +
        " " +
        getLabelText(
          this.state.resources.filter((x) => {
            return x.resourceKey === "less";
          })[0],
          "Less"
        );
      this.setState({ Productsname: { [id]: true } });
    } else {
      object.innerHTML =
        "+ " +
        length +
        " " +
        getLabelText(
          this.state.resources.filter((x) => {
            return x.resourceKey === "more";
          })[0],
          "More"
        );
      this.setState({ Productsname: false });
    }
    this.setState({ ProductsnameBlock: { [id]: object.innerHTML } });
  };
  openPR = (id, length, event) => {
    var object = event.currentTarget;
    if (
      object.innerHTML.includes(
        getLabelText(
          this.state.resources.filter((x) => {
            return x.resourceKey === "more";
          })[0],
          "More"
        )
      )
    ) {
      object.innerHTML =
        "- " +
        length +
        " " +
        getLabelText(
          this.state.resources.filter((x) => {
            return x.resourceKey === "less";
          })[0],
          "Less"
        );
      this.setState({ openPR: { [id]: true } });
    } else {
      object.innerHTML =
        "+ " +
        length +
        " " +
        getLabelText(
          this.state.resources.filter((x) => {
            return x.resourceKey === "more";
          })[0],
          "More"
        );
      this.setState({ openPR: false });
    }
    this.setState({ openPRBlock: { [id]: object.innerHTML } });
  };

  render() {
    hitCount = this.props !== "" ? this.props.hits.length : 0;
    let source;
    let newCreatedDate;
    let newModifiedDate;

    return (
      <div className="pr_listing_table">
        <Table>
          {/* <Thead>
                        <Tr>
                            <Th>All </Th>
                            <Th>In-progress</Th>
                            <Th>Rejected</Th>
                            <Th>On-Hold</Th>
                            <Th>Approved</Th>
                            <Th>Fulfilled</Th>                          
                        </Tr>
                    </Thead> */}
          <Thead>
            <Tr>
              <Th>
                {getLabelText(
                  this.state.resources.filter((x) => {
                    return x.resourceKey === "po#";
                  })[0],
                  "PO#"
                )}
              </Th>
              <Th className="ord_detail_pr_po">
                {getLabelText(
                  this.state.resources.filter((x) => {
                    return x.resourceKey === "orderdetails";
                  })[0],
                  "Order Details"
                )}
              </Th>
              <Th>
                {getLabelText(
                  this.state.resources.filter((x) => {
                    return x.resourceKey === "suppliername";
                  })[0],
                  "Supplier Name"
                )}
              </Th>
              <Th>
                {getLabelText(
                  this.state.resources.filter((x) => {
                    return x.resourceKey === "raisedon";
                  })[0],
                  "Raised On"
                )}
              </Th>
              <Th>
                {getLabelText(
                  this.state.resources.filter((x) => {
                    return x.resourceKey === "updateddon";
                  })[0],
                  "Updated On"
                )}
              </Th>
              <Th>
                {getLabelText(
                  this.state.resources.filter((x) => {
                    return x.resourceKey === "status";
                  })[0],
                  "PO Status"
                )}
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {/* {console.log(this.props.hits._source.listProductNameVM)} */}
            {this.props.hits.map(
              (hit) => (
                (source = hit._source),
                //log(source.listProductNameVM),
                (newCreatedDate = moment(source.createdDate).format(
                  "DD/MM/YYYY"
                )),
                (newModifiedDate = moment(source.modifiedDate).format(
                  "DD/MM/YYYY"
                )),
                (
                  <React.Fragment>
                    <Tr key={source.orderPOMappingGuid}>
                      <Td>{source.pONumber}</Td>

                      <Td>
                        <div>
                          {source.listProductNameVM !== undefined
                            ? source.listProductNameVM.map((item) => (
                              <div>{item.productName}</div>
                            ))
                            : ""}
                        </div>

                        <div className="polisting_prn_pon_cont">
                          <span className="req_id">
                            {source.listOrderIdVM !== undefined
                              ? source.listOrderIdVM.map((item) => (
                                <span>Order ID: {item.orderId}</span>
                              ))
                              : ""}
                          </span>

                          <span className="prn">
                            {source.listPRNumberVM !== undefined
                              ? source.listPRNumberVM.map((item) => (
                                <span>{item.pRNumber}</span>
                              ))
                              : ""}
                          </span>
                        </div>
                      </Td>
                      <Td>{source.supplierName}</Td>
                      <Td>
                        {newCreatedDate === "01/01/0001" ? "" : newCreatedDate}
                      </Td>
                      <Td>
                        {newModifiedDate === "01/01/0001"
                          ? ""
                          : newModifiedDate}
                      </Td>
                      <Td>{source.statusName}</Td>
                    </Tr>
                  </React.Fragment>
                )
              )
            )}
          </Tbody>
        </Table>
      </div>
    );
  }
}
const errorComponent = () => {
  // return <div className="no-products-found">{this.state.resources === undefined ? "No Products Found" : getLabelText(this.state.resources.filter((x) => { return x.resourceKey === 'norecordsfound' })[0], "No Records Found")}</div>
  return <div className="no-products-found">No Records Found</div>;
};
//#endregion

class POListingView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewmore: false,
      resources: [],
      loading: false,
      allSuppliers: [],
      currentSuppliers: { hits: [] },
      indexDataList: 0,
      currentPO: { hits: [] },
      currentPage: 1,
      totalPages: null,
      selectedName: "",
      value: "0",
      Emailvalue: "",
      FromDate: "",
      ToDate: "",
      Searchval: "",
      DataFilters: "",
      HeadFilters: "",
      locationdata: { options: [] },
      Orderstatus: [],
      Selected_Status: "",
      parentSupplierId: "",
    };
    this.SearchRef = React.createRef();
    this.LocationRef = React.createRef();
    this.fromdateRef = React.createRef();
    this.todateRef = React.createRef();
  }

  async getParentSupplierId() {
    var config = {
      headers: {
        Authorization: "Bearer " + localStorage.tokenId,
        "Content-Type": "application/json",
        userGuid: localStorage.userId
      }
    };
    await axios
      .get(getServiceUrl() + "MasterData/GetParentSupplierId", config)
      .then(json => {
        this.setState({ parentSupplierId: json.data.table1[0].supplierGuid });
      })
      .catch(err => {
        console.error(err);
      });
  }
  async componentDidMount() {
    let data = {
      currentPage: 1,
      totalPages: 0,
      pageLimit: GlobalPageLimit,
      DataFilters: "",
      HeadFilters: "",
    };
    await this.getParentSupplierId();
    this.getIndexData(data);
    getPageResource(
      getLanguageResourceElasticIndex(
        localStorage.languageId,
        PageKeys.polisting
      )
    )
      .then((json) => {
        this.setState({ resources: json, show_resources: true });
      })
      .catch((err) =>
        err.response !== undefined
          ? err.response.status === 401
            ? (window.location.pathname = "/logout")
            : ""
          : ""
      );
  }

  getIndexData = (data) => {
    let indexName = getWebsiteGUID() + "_polisting";
    if (this.props.userType === RoleCodes.BUYER || this.props.userType === RoleCodes.ADMIN || this.props.userType === RoleCodes.APPROVER) {
      indexName = getWebsiteGUID() + "_" + localStorage.companyGuid + "_polisting";
    }
    else if (this.props.userType === RoleCodes.SUPPLIER) {
      indexName = getWebsiteGUID() + "_" + this.state.parentSupplierId + "_polisting";
    }
    const { allSuppliers, filterSupplier, indexDataList } = this.state;
    const {
      currentPage,
      totalPages,
      pageLimit,
      DataFilters,
      HeadFilters,
    } = data;
    if (currentPage === undefined) {
      currentPage = 1;
    }
    const offsetall = (currentPage - 1) * pageLimit;

    let commonquery = "";
    let ParentGuid =
      localStorage.parentUserId !== undefined
        ? localStorage.parentUserId === "00000000-0000-0000-0000-000000000000"
          ? localStorage.userId
          : localStorage.parentUserId
        : localStorage.userId;

    if (
      (DataFilters !== undefined && DataFilters !== "") ||
      (HeadFilters !== undefined && HeadFilters !== "")
    ) {
      var config;
      if (HeadFilters != "") {
        if (this.props.userType === RoleCodes.BUYER) {

          commonquery =
            '"query": {"bool": {"must": [{"match": {"languageGuid": "' +
            localStorage.languageId +
            '"}},{"match": {"userGuid": "' +
            this.props.userId +
            '"}},{"match": {"companyGuid": "' +
            localStorage.companyGuid +
            '"}}]' +
            ',"filter": [ ' +
            JSON.parse(HeadFilters) +
            "]" +
            "}}";
        } else if (this.props.userType === RoleCodes.APPROVER) {
          commonquery =
            '"query": {"bool": {"must": [{"match": {"languageGuid": "' +
            localStorage.languageId +
            '"}}]' +
            ',"filter": [ ' +
            JSON.parse(HeadFilters) +
            "]" +
            "}}";
        } else if (this.props.userType === RoleCodes.SUPPLIER) {
          commonquery =
            '"query": {"bool": {"must": [{"match": {"languageGuid": "' +
            localStorage.languageId +
            '"}},{"match": {"supplierGuid": "' +
            ParentGuid +
            '"}}]' +
            ',"filter": [ ' +
            JSON.parse(HeadFilters) +
            "]" +
            "}}";
        } else if (this.props.userType === RoleCodes.ADMIN) {
          commonquery =
            '"query": {"bool": {"must": [{"match": {"languageGuid": "' +
            localStorage.languageId +
            '"}}]' +
            ',"filter": [ ' +
            JSON.parse(HeadFilters) +
            "]" +
            "}}";
        } else if (this.props.userType === RoleCodes.STRATEGICUSER) {
          commonquery =
            '"query": {"bool": {"must": [{"match": {"languageGuid": "' +
            localStorage.languageId +
            '"}}]' +
            ',"filter": [ ' +
            JSON.parse(HeadFilters) +
            "]" +
            "}}";
        } else if (
          this.props.userType.includes(RoleCodes.STRATEGICUSER) &&
          this.props.userType.includes(RoleCodes.APPROVER) &&
          !this.props.userType.includes(RoleCodes.BUYER)
        ) {
          commonquery =
            '"query": {"bool": {"must": [{"match": {"languageGuid": "' +
            localStorage.languageId +
            '"}}]' +
            ',"filter": [ ' +
            JSON.parse(HeadFilters) +
            "]" +
            "}}";
        } else {
          if (this.props.userType.includes(RoleCodes.APPROVER)) {
            commonquery =
              '"query": {"bool": {"must": [{"match": {"languageGuid": "' +
              localStorage.languageId +
              '"}},{"match": {"companyGuid": "' +
              localStorage.companyGuid +
              '"}}]' +
              ',"filter": [ ' +
              JSON.parse(HeadFilters) +
              "]" +
              "}}";
          }
        }

        // config = {
        //   method: "post",
        //   url:
        //     getElasticIndexUrl("_polisting", "polistingelasticvm") +
        //     "_search?from=" +
        //     offsetall +
        //     "&size=" +
        //     GlobalPageLimit +
        //     "&sort=modifiedDate:desc" +
        //     DataFilters,
        //   headers: {
        //     "Content-Type": "application/json",
        //   },
        //   data: JSON.parse("{" + commonquery + "}"),
        // };
      } else {
        if (this.props.userType === RoleCodes.BUYER) {
          commonquery =
            '"query": {"bool": {"must": [{"match": {"languageGuid": "' +
            localStorage.languageId +
            '"}},{"match": {"userGuid": "' +
            this.props.userId +
            '"}},{"match": {"companyGuid": "' +
            localStorage.companyGuid +
            '"}}]}}';
        } else if (this.props.userType === RoleCodes.APPROVER) {
          commonquery =
            '"query": {"bool": {"must": [{"match": {"languageGuid": "' +
            localStorage.languageId +
            '"}}]}}';
        } else if (this.props.userType === RoleCodes.SUPPLIER) {
          commonquery =
            '"query": {"bool": {"must": [{"match": {"languageGuid": "' +
            localStorage.languageId +
            '"}},{"match": {"supplierGuid": "' +
            ParentGuid +
            '"}}]}}';
        } else if (this.props.userType === RoleCodes.ADMIN) {
          commonquery =
            '"query": {"bool": {"must": [{"match": {"languageGuid": "' +
            localStorage.languageId +
            '"}}]}}';
        } else if (this.props.userType === RoleCodes.STRATEGICUSER) {
          commonquery =
            '"query": {"bool": {"must": [{"match": {"languageGuid": "' +
            localStorage.languageId +
            '"}}]}}';
        } else if (
          this.props.userType.includes(RoleCodes.STRATEGICUSER) &&
          this.props.userType.includes(RoleCodes.APPROVER) &&
          !this.props.userType.includes(RoleCodes.BUYER)
        ) {
          commonquery =
            '"query": {"bool": {"must": [{"match": {"languageGuid": "' +
            localStorage.languageId +
            '"}}]}}';
        } else {
          if (this.props.userType.includes(RoleCodes.APPROVER)) {
            commonquery =
              '"query": {"bool": {"must": [{"match": {"languageGuid": "' +
              localStorage.languageId +
              '"}},{"match": {"companyGuid": "' +
              localStorage.companyGuid +
              '"}}]}}';
          }
        }
        // config = {
        //   method: "post",
        //   url:
        //     getElasticIndexUrl("_polisting", "polistingelasticvm") +
        //     "_search?from=" +
        //     offsetall +
        //     "&size=" +
        //     GlobalPageLimit +
        //     "&sort=modifiedDate:desc" +
        //     DataFilters,
        //   headers: {
        //     "Content-Type": "application/json",
        //   },
        //   data: JSON.parse("{" + commonquery + "}"),
        // };
      }
      // this.setState({ loading: true });
      let Oldcommonquery = commonquery;
      if (commonquery !== "") {
        commonquery = JSON.parse("{" + commonquery + "}");
      } else {
        commonquery = "";
      }

      var dataFiltersAll =
        '{"size": 0,"aggs": {"GetStatus": {"terms": {"field": "status_raw.raw.keyword"}},"GetLocation": {"terms": {"field": "listProductNameVM.deliverylocation_raw.raw.keyword"}}},' +
        Oldcommonquery +
        " }";

      // var configFilterAll = {
      //   method: "post",
      //   url:
      //     getElasticIndexUrl("_polisting", "polistingelasticvm") +
      //     "_search?" +
      //     "sort=modifiedDate:desc",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   data: JSON.parse(dataFiltersAll),
      // };

      getElasticDataPOIndex(
        indexName,
        JSON.parse(dataFiltersAll),
        offsetall,
        GlobalPageLimit,
        "modifiedDate:desc"
      ).then((json) => {
        if (json !== null) {
          let optiondatafield = [];
          let optiondatafieldLocation = [];
          if (json.aggregations.GetStatus.buckets.length !== 0) {
            json.aggregations.GetStatus.buckets.map((item) => {
              optiondatafield.push({ Id: item.key, Value: item.doc_count });
            });
          }

          if (json.aggregations.GetStatus.buckets.length !== 0) {
            json.aggregations.GetLocation.buckets.map((item) => {
              optiondatafieldLocation.push({
                Id: item.key,
                Value: item.key + "(" + item.doc_count + ")",
              });
            });
          }

          let optiondata = {
            options: optiondatafieldLocation,
          };
          if (isSelected === 0) {
            if (isSelectedStatus === 0) {
              this.setState({
                Orderstatus: optiondatafield,
                locationdata: optiondata,
              });
            } else {
              this.setState({ locationdata: optiondata });
            }
          } else {
            if (isSelectedStatus === 0) {
              this.setState({ Orderstatus: optiondatafield });
            }
          }
        }
      });

      getElasticDataPOIndex(
        indexName,
        commonquery,
        offsetall,
        GlobalPageLimit,
        "modifiedDate:desc"
      ).then((json) => {
        if (json !== null) {
          if (json.hits.total === 0) {
            this.setState({ currentSuppliers: { hits: [] } });
          } else {
            let totalPages = json.hits.total / GlobalPageLimit;
            if (totalPages <= 1) {
              totalPages = 1;
            }
            // let data = { currentPage: currentPage, totalPages: totalPages, pageLimit: GlobalPageLimit, totalRecords: json.hits.total };
            // this.onPageChanged(data);
            this.setState({
              indexDataList: json.hits.total,
              allSuppliers: json.hits.hits,
              currentPage: currentPage,
              currentSuppliers: { hits: json.hits.hits },
              totalPages: json.hits.total,
              pageLimit: GlobalPageLimit,
              loading: false,
            });
          }
        }
      });
    } else {
      this.setState({ loading: true });

      let ParentGuid =
        localStorage.parentUserId !== undefined
          ? localStorage.parentUserId === "00000000-0000-0000-0000-000000000000"
            ? localStorage.userId
            : localStorage.parentUserId
          : localStorage.userId;

      if (this.props.userType === RoleCodes.BUYER) {
        commonquery =
          '"query": {"bool": {"must": [{"match": {"languageGuid": "' +
          localStorage.languageId +
          '"}},{"match": {"userGuid": "' +
          this.props.userId +
          '"}},{"match": {"companyGuid": "' +
          localStorage.companyGuid +
          '"}}]}}';
      } else if (this.props.userType === RoleCodes.APPROVER) {
        commonquery =
          '"query": {"bool": {"must": [{"match": {"languageGuid": "' +
          localStorage.languageId +
          '"}}]}}';
      } else if (this.props.userType === RoleCodes.SUPPLIER) {
        commonquery =
          '"query": {"bool": {"must": [{"match": {"languageGuid": "' +
          localStorage.languageId +
          '"}},{"match": {"supplierGuid": "' +
          ParentGuid +
          '"}}]}}';
      } else if (this.props.userType === RoleCodes.ADMIN) {
        commonquery =
          '"query": {"bool": {"must": [{"match": {"languageGuid": "' +
          localStorage.languageId +
          '"}}]}}';
      } else if (this.props.userType === RoleCodes.STRATEGICUSER) {
        commonquery =
          '"query": {"bool": {"must": [{"match": {"languageGuid": "' +
          localStorage.languageId +
          '"}}]}}';
      } else if (
        this.props.userType.includes(RoleCodes.STRATEGICUSER) &&
        this.props.userType.includes(RoleCodes.APPROVER) &&
        !this.props.userType.includes(RoleCodes.BUYER)
      ) {
        commonquery =
          '"query": {"bool": {"must": [{"match": {"languageGuid": "' +
          localStorage.languageId +
          '"}}]}}';
      } else {
        if (this.props.userType.includes(RoleCodes.APPROVER)) {
          commonquery =
            '"query": {"bool": {"must": [{"match": {"languageGuid": "' +
            localStorage.languageId +
            '"}},{"match": {"companyGuid": "' +
            localStorage.companyGuid +
            '"}}]}}';
        }
      }

      var dataFiltersAll =
        '{"size": 0,"aggs": {"GetStatus": {"terms": {"field": "status_raw.raw.keyword"}},"GetLocation": {"terms": {"field": "listProductNameVM.deliverylocation_raw.raw.keyword"}}},' +
        commonquery +
        " }";

      getElasticDataPOIndex(
        indexName,
        JSON.parse(dataFiltersAll),
        offsetall,
        GlobalPageLimit,
        "modifiedDate:desc"
      ).then((json) => {
        if (json !== null) {
          let optiondatafield = [];
          let optiondatafieldLocation = [];
          if (json.aggregations.GetStatus.buckets.length !== 0) {
            json.aggregations.GetStatus.buckets.map((item) => {
              optiondatafield.push({ Id: item.key, Value: item.doc_count });
            });
          }

          if (json.aggregations.GetStatus.buckets.length !== 0) {
            json.aggregations.GetLocation.buckets.map((item) => {
              optiondatafieldLocation.push({
                Id: item.key,
                Value: item.key + "(" + item.doc_count + ")",
              });
            });
          }

          let optiondata = {
            options: optiondatafieldLocation,
          };
          this.setState({
            Orderstatus: optiondatafield,
            locationdata: optiondata,
            loading: false
          });
        } else {
          this.setState({ loading: false });
        }
      });

      if (commonquery !== "") {
        commonquery = JSON.parse("{" + commonquery + "}");
      } else {
        commonquery = "";
      }

      getElasticDataPOIndex(
        indexName,
        commonquery,
        offsetall,
        GlobalPageLimit,
        "modifiedDate:desc"
      ).then((json) => {
        if (json !== null) {
          if (json.hits.total === 0) {
            this.setState({ currentSuppliers: { hits: [] }, loading: false });
          } else {
            this.setState({
              indexDataList: json.hits.total,
              allSuppliers: json.hits.hits,
              currentPage: currentPage,
              currentSuppliers: { hits: json.hits.hits },
              totalPages: json.hits.total,
              pageLimit: GlobalPageLimit,
              loading: false,
            });
          }
        }
      });
    }

    if (this.props.userType.includes(RoleCodes.BUYER)) {
      this.props.onGetCartCounter(this.props.userId, this.props.languageId);
      this.props.onGetWishlistCounter(this.props.userId, this.props.languageId);
      this.props.onGetBuyingWindowCounter(
        this.props.userId,
        this.props.languageId
      );
    }
  };

  commonFilter = () => {
    let tempcount = 0;
    let currentPageindex = 1;
    let DataFilters = "";
    let HeadFilters = "";
    if (
      LocationselectedValues !== undefined &&
      LocationselectedValues !== "" &&
      LocationselectedValues !== "0"
    ) {
      // DataFilters = '&q=listProductNameVM.deliverylocation_raw.raw' + LocationselectedValues;
      HeadFilters =
        '{"term":{"listProductNameVM.deliverylocation_raw.raw.keyword":"' +
        LocationselectedValues +
        '"}}';
      tempcount = tempcount + 1;
      currentPageindex = this.state.currentPage;
      //currentPageindex = 1;
    } else {
      HeadFilters = "";
    }

    if (SearchValues !== undefined && SearchValues !== "") {
      if (tempcount === 0) {
        HeadFilters =
          '{"multi_match": {"query": "' +
          SearchValues +
          '","type": "phrase_prefix","fields": ["pONumber","listProductNameVM.productName","listOrderIdVM.pRNumber","supplierName"],"operator": "or"}}';
      } else {
        HeadFilters =
          HeadFilters +
          ',{"multi_match": {"query": "' +
          SearchValues +
          '","type": "phrase_prefix","fields": ["pONumber","listProductNameVM.productName","listOrderIdVM.pRNumber","supplierName"],"operator": "or"}}';
      }
      tempcount = tempcount + 1;
      currentPageindex = 1;
    } else {
      if (
        LocationselectedValues !== undefined &&
        LocationselectedValues === ""
      ) {
        HeadFilters = "";
      }
    }

    if (FromDate !== undefined && FromDate !== "") {
      if (tempcount === 0) {
        HeadFilters =
          '{"range": {"createdDate": {"gte": "' +
          FromDate +
          '","format": "yyyy-MM-dd"}}}';
      } else {
        HeadFilters =
          HeadFilters +
          ',{"range": {"createdDate": {"gte": "' +
          FromDate +
          '","format": "yyyy-MM-dd"}}}';
      }
      tempcount = tempcount + 1;
      currentPageindex = 1;
    } else {
      if (
        LocationselectedValues !== undefined &&
        LocationselectedValues === "" &&
        SearchValues !== undefined &&
        SearchValues === ""
      ) {
        HeadFilters = "";
      }
    }

    if (ToDate !== undefined && ToDate !== "") {
      if (tempcount === 0) {
        HeadFilters =
          '{"range": {"createdDate": {"lte": "' +
          ToDate +
          '","format": "yyyy-MM-dd"}}}';
      } else {
        HeadFilters =
          HeadFilters +
          ',{"range": {"createdDate": {"lte": "' +
          ToDate +
          '","format": "yyyy-MM-dd"}}}';
      }
      currentPageindex = 1;
    } else {
      if (
        LocationselectedValues !== undefined &&
        LocationselectedValues === "" &&
        FromDate !== undefined &&
        FromDate === "" &&
        SearchValues !== undefined &&
        SearchValues === ""
      ) {
        HeadFilters = "";
      }
    }

    if (Selected_Status !== undefined && Selected_Status !== "") {
      if (tempcount === 0) {
        HeadFilters = '{"term":{"status_raw.raw.keyword":"' + Selected_Status + '"}}';
      } else {
        HeadFilters =
          HeadFilters +
          ',{"term":{"status_raw.raw.keyword":"' +
          Selected_Status +
          '"}}';
      }
      currentPageindex = 1;
    } else {
      if (
        LocationselectedValues !== undefined &&
        LocationselectedValues === "" &&
        FromDate !== undefined &&
        FromDate === "" &&
        SearchValues !== undefined &&
        SearchValues === "" &&
        ToDate !== undefined &&
        ToDate !== ""
      ) {
        HeadFilters = "";
      }
    }

    if (HeadFilters !== "") {
      HeadFilters = JSON.stringify(HeadFilters);
    }

    if (DataFilters !== "") {
      DataFilters = JSON.stringify(DataFilters);
    }

    this.setState({ DataFilters: DataFilters, HeadFilters: HeadFilters });
    let data = {
      currentPage: currentPageindex,
      totalPages: 0,
      pageLimit: GlobalPageLimit,
      DataFilters: DataFilters,
      HeadFilters: HeadFilters,
    };
    this.getIndexData(data);
  };

  removeFilter = (props) => {
    let filterkey = props._dispatchInstances.memoizedProps["data-key"];
    switch (filterkey) {
      case "SearchValues":
        SearchValues = "";
        this.setState({ Searchval: "" });
        const Searchnode = this.SearchRef.current;
        document.getElementById(Searchnode.props.id).value = "";
        break;
      case "Location":
        this.setState({ value: "0", selectedName: "-- Select --" });
        LocationselectedValues = "";
        const sortnode = this.LocationRef.current;
        document.getElementById(sortnode.props.id).value = "0";
        // sortnode.props.value = "0"
        break;
      case "Selected_Status":
        // this.setState({ value: "0", selectedName: "-- Select --" });
        Selected_Status = "";
        this.setState({ Selected_Status: "" });
        break;
      case "fromdateFilter":
        this.setState({ FromDate: "" });
        FromDate = "";
        const fromdatenode = this.fromdateRef.current;
        fromdatenode.state.inputValue = "";
        break;
      case "todateFilter":
        this.setState({ ToDate: "" });
        ToDate = "";
        const todatenode = this.todateRef.current;
        todatenode.state.inputValue = "";
        break;

      default:
        SearchValues = "";
        this.setState({ Searchval: "" });
        const Searchnode1 = this.SearchRef.current;
        document.getElementById(Searchnode1.props.id).value = "";

        this.setState({ value: "0", selectedName: "-- Select --" });
        LocationselectedValues = "";
        const sortnode1 = this.LocationRef.current;
        document.getElementById(sortnode1.props.id).value = "0";

        Selected_Status = "";
        this.setState({ Selected_Status: "" });

        this.setState({ FromDate: "" });
        FromDate = "";
        let fromdatenode1 = this.fromdateRef.current;
        fromdatenode1.state.inputValue = "";

        this.setState({ ToDate: "" });
        ToDate = "";
        let todatenode1 = this.todateRef.current;
        todatenode1.state.inputValue = "";

        break;
    }
    this.commonFilter();
  };

  onSearchChanged = (props) => {
    SearchValues = props.target.value;
    this.setState({ Searchval: props.target.value });
    isSelected = 0;
    isSelectedStatus = 0;
    this.commonFilter();
  };

  onFromdateChange = (props) => {
    if (props !== undefined && props !== "") {
      // let fromdate = moment(new Date(props._d)).format("YYYY-MM-DDTH:mm:ss");
      let fromdate = moment(new Date(props._d)).format("YYYY-MM-DD");
      let todaydate = moment(new Date()).format("YYYY-MM-DD");
      if (todaydate < fromdate) {
        toaster.notify(
          toasterAlert(
            "WARNING",
            "From Date cannot be greater than current date."
          ),
          { duration: null }
        );
        const fromdatenode = this.fromdateRef.current;
        fromdatenode.state.inputValue = "";
      } else {
        let showdate = moment(new Date(props._d)).format("DD MMM YYYY");
        this.setState({ FromDate: showdate, FromDateevent: props });
        FromDate = fromdate;
        isSelected = 0;
        isSelectedStatus = 0;
        this.commonFilter();
      }
    }
  };

  onTodateChange = (props) => {
    if (props !== undefined && props !== "") {
      // let todate = moment(new Date(props._d)).format("YYYY-MM-DDTH:mm:ss");
      let todate = moment(new Date(props._d)).format("YYYY-MM-DD");
      let todaydate = moment(new Date()).format("YYYY-MM-DD");
      let tempcount = 0;
      if (FromDate !== undefined && FromDate !== "" && todate < FromDate) {
        tempcount = tempcount + 1;
        toaster.notify(
          toasterAlert("WARNING", "To Date cannot be greater than From date."),
          { duration: null }
        );
      }

      if (todaydate < todate) {
        tempcount = tempcount + 1;
        toaster.notify(
          toasterAlert(
            "WARNING",
            "To Date cannot be greater than current date."
          ),
          { duration: null }
        );
      }

      if (tempcount === 0) {
        let showdate = moment(new Date(props._d)).format("DD MMM YYYY");
        this.setState({ ToDate: showdate, ToDateevent: props });
        ToDate = todate;
        isSelected = 0;
        isSelectedStatus = 0;
        this.commonFilter();
      }
    }
  };

  onSelectChanged = (props) => {
    // const { allSuppliers } = this.state;
    // let name = props.currentTarget.innerText;
    if (props.target.value !== '0') {
      this.setState({
        value: props.target.value,
        selectedName: props.target.value,
        selectevent: props,
      });
      LocationselectedValues = props.target.value;
      isSelected = 1;
      isSelectedStatus = 0;
      this.commonFilter();
    }
  };

  onSelectChangedStatus = (props) => {
    Selected_Status = props._dispatchInstances.memoizedProps["data-key"];
    this.setState({ Selected_Status: Selected_Status });
    isSelected = 0;
    isSelectedStatus = 1;
    this.commonFilter();
  };

  render() {
    let breadCrumb = null;
    if (this.props.userType === RoleCodes.SUPPLIER) {
      {
        breadCrumb = BreadCrumb([{ 'pageName': 'Dashboard', 'url': '/home' },
        { 'pageName': 'POs', 'url': '/polisting' }
        ])
      }
    }
    else {
      breadCrumb = BreadCrumb([{ 'pageName': 'Shop', 'url': '/shop' },
      { 'pageName': 'POs', 'url': '/polisting' }
      ])
    }

    let permissions = localStorage.permissions !== undefined? JSON.parse(localStorage.permissions):[];
        if(permissions.length === 0){
            return <Redirect to="/not-found" />;
        }else if(getUserPermision(permissions, PageKeys.polisting) === null)
        {
            return <Redirect to="/not-found" />;
        }

    // if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIER) {
    //   if (localStorage.userStatus !== "Account Approved") {
    //     return (<div id="no_prod_listing_page" className="no-products-found">
    //       <h4>Oops! Your Account is not Approved to access this page.</h4>
    //     </div>)
    //   }
    // }

    const {
      allSuppliers,
      currentSuppliers,
      currentPage,
      totalPages,
    } = this.state;
    const totalProducts = this.state.indexDataList;
    const { resources } = this.state;
    return (
      <div>
        <div
          className=""
          style={{ display: this.state.loading ? "none" : "block" }}
        >
          <Aux>
          <div className="breadtitle_wrap">
                {breadCrumb}
            </div>
            {/* <div className="Pr_lisiting_container" >
                    <div className="Pr_listing_filters"> */}
            <div id="PO_listing" className="Pr_lisiting_container">
              <div className="Po_listing_filters ">
                <h4>Purchase Orders</h4>
                <GridContainer>
                  <GridItem className="newThemeInput" md={4} xs={12}>
                    <Input
                      id="orders"
                      elementType="input"
                      elementConfig={{ 'placeholder': 'Product, Supplier, PO#, Order#' }}
                      // label="Product, Supplier, PO#, Order#"
                      onKeyUp={this.onSearchChanged}
                      ref={this.SearchRef}
                      class="newInput"
                    />
                  </GridItem>
                  <GridItem md={3} xs={12}>
                    <div className="po_date_filter">
                      <Datetime
                        id="createddate_filter"
                        closeOnSelect={true}
                        timeFormat={false}
                        inputProps={{ placeholder: "From", class: 'newInput' }}
                        onChange={this.onFromdateChange}
                        id="startDate"
                        name="startDate"
                        ref={this.fromdateRef}
                        // value={''}
                        className="newThemeInput"
                        isValidDate={disableFutureDt}
                      />
                      <span>-</span>
                      <Datetime
                        id="orderTotal_filter"
                        closeOnSelect={true}
                        timeFormat={false}
                        inputProps={{ placeholder: "To", class: 'newInput' }}
                        onChange={this.onTodateChange}
                        id="EndDate"
                        name="EndDate"
                        ref={this.todateRef}
                        className="newThemeInput"
                        // value={''}
                        isValidDate={disableFutureDt}
                      />
                    </div>
                  </GridItem>

                  <GridItem className="newThemeInput" md={3} xs={12}>
                    <Input
                      id="FilterSortID"
                      elementType="select"
                      class="newInput"
                      // label="Sort by name"
                      value={this.state.value}
                      SelectChange={this.onSelectChanged}
                      ref={this.LocationRef}
                      elementConfig={
                        this.state.locationdata !== null
                          ? this.state.locationdata
                          : ""
                      }
                      selectLableHeader={'Sort by location'}
                    />
                  </GridItem>
                </GridContainer>
              </div>
              <div class="pr_listing_table_filter">
                <div class="sk-panel filter--statusFilter">
                  <div class="sk-panel__header">Status</div>
                  <div class="sk-panel__content">
                    <div class="sk-hierarchical-menu-list__root">
                      <div class="sk-hierarchical-menu-list__hierarchical-options">
                        <div>
                          <div class="sk-hierarchical-menu-option pr_po_status_text sk-hierarchical-menu-list__item is-active">
                            <div
                              data-qa="label"
                              class="sk-hierarchical-menu-option__text"
                            >
                              <b>PO Status:</b>
                            </div>
                          </div>
                        </div>
                        {this.state.Orderstatus.length > 0
                          ? this.state.Orderstatus.map((item) => (
                            <div>
                              <div
                                class="sk-hierarchical-menu-option sk-hierarchical-menu-list__item is-active"
                                data-qa="option"
                                data-key={item.Id}
                                onClick={(event) =>
                                  this.onSelectChangedStatus(event)
                                }
                              >
                                <div
                                  data-qa="label"
                                  class="sk-hierarchical-menu-option__text"
                                >
                                  {item.Id}
                                </div>
                                <div
                                  data-qa="count"
                                  class="sk-hierarchical-menu-option__count"
                                >
                                  {item.Value}
                                </div>
                              </div>
                              <div class="sk-hierarchical-menu-list__hierarchical-options" />
                            </div>
                          ))
                          : ""}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* <div className="cart_table_top_border" /> */}
              <GridContainer>
                <GridItem md={12}>
                  <List
                    SearchValues={this.state.Searchval}
                    LocationValues={this.state.selectedName}
                    fromdate={this.state.FromDate}
                    todate={this.state.ToDate}
                    Selected_Status={this.state.Selected_Status}
                    onClick={this.removeFilter}
                  />
                </GridItem>
              </GridContainer>
              <GridContainer className="supp_list_container">
                <GridItem>
                  {currentSuppliers.hits.length > 0 ? (
                    <OrderDetail hits={currentSuppliers.hits} />
                  ) : (
                      <div className="sk-no-hits">
                        <div className="sk-no-hits__info">No Records Found.</div>
                      </div>
                    )}
                </GridItem>
                <GridItem>
                  {
                    this.state.indexDataList.value !== undefined ? (
                      <GridContainer className="pagi_container" justify="center">
                        <GridItem>
                          <Pagination
                            totalRecords={this.state.indexDataList.value}
                            pageLimit={GlobalPageLimit}
                            pageNeighbours={1}
                            DataFilters={this.state.DataFilters}
                            HeadFilters={this.state.HeadFilters}
                            onPageChanged={this.getIndexData}
                            onRef={(ref) => (this.child = ref)}
                          />
                        </GridItem>
                      </GridContainer>
                    ) : (
                        ""
                      )}
                </GridItem>
              </GridContainer>
            </div>
          </Aux>
        </div>
        <div style={{ display: this.state.loading ? "block" : "none" }}>
          <Spinner />
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    userType: state.login.userType,
    permissions: state.login.permissions,
    userId: state.login.userId,
    languageId: state.login.languageId,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    onGetCartCounter: (userId, languageId) =>
      dispatch(actionCreators.cartCounter(userId, languageId)),
    onGetWishlistCounter: (userId, languageId) =>
      dispatch(actionCreators.wishlistCounter(userId, languageId)),
    onGetBuyingWindowCounter: (userId, languageId) =>
      dispatch(actionCreators.buyingWindowCounter(userId, languageId)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(POListingView);
