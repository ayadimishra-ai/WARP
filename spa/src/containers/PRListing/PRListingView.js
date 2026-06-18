import React, { Component, PureComponent } from "react";
import { connect } from "react-redux";
import Aux from "../../hoc/Auxx";
import {
    getUserPermision,
    getLanguageResourceElasticIndex,
    getLabelText,
    getWebsiteGUID,
} from "../../config";
// import "../../../node_modules/searchkit/release/theme.css";
// import "../../../node_modules/searchkit-datefilter/release/theme.css";
import { Redirect } from "react-router-dom";
// import { Link } from 'react-router-dom';
import * as PageKeys from "../../pagekeys";
import {
    getPageResource,
    toasterAlert,
    getElasticData,
    BreadCrumb
} from "../../utility";
import GridContainer from "../../components/Material/Grid/GridContainer";
import GridItem from "../../components/Material/Grid/GridItem";
import { Table, Thead, Tbody, Tr, Th, Td } from "react-super-responsive-table";
import toaster from "toasted-notes";
import Input from "../../UI/Input/MaterialInput";
import Datetime from "react-datetime";
import Pagination from "../../components/Pagination/Pagination";
import moment from "moment";
import PropTypes from "prop-types";
import * as RoleCodes from "../../rolecodes";
import * as actionCreators from "../../store/actions/index";
import Spinner from "../../UI/Spinner/Spinner";


// const InitialLoaderComponent = props => (
//     <div className="data-loading-div">
//         <img
//             alt="loader"
//             src="https://cdnjs.cloudflare.com/ajax/libs/galleriffic/2.0.1/css/loader.gif"
//         />
//         loading please wait...
//     </div>
// );
let v = "";
let GlobalPageLimit = 10;
let hitCount = 0;
let isSelected = 0;
let isSelectedStatus = 0;
let SearchValues = localStorage.setItem("SearchValues", "");
let FromDate = localStorage.setItem("FromDate", "");
let ToDate = localStorage.setItem("ToDate", "");
let OrderFromRange = localStorage.setItem("OrderFromRange", "");
let OrderToRange = localStorage.setItem("OrderToRange", "");
let LocationselectedValues = localStorage.setItem("LocationselectedValues", "");
let Selected_Status = localStorage.setItem("Selected_Status", "");

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

                {this.props.OrderFromRange !== "" ? (
                    <div className="sk-filter-group filter-group-users">
                        <input type="hidden" value={(counts = counts + 1)} />
                        <div className="sk-filter-groups">
                            <div className="sk-filter-group-items">
                                <div className="sk-filter-group-items__title">Order From </div>
                                <div className="sk-filter-group-items__list">
                                    <div
                                        className="sk-filter-group-items__value"
                                        data-key="OrderFromRange"
                                        onClick={this.props.onClick}
                                    >
                                        {this.props.OrderFromRange}
                                    </div>
                                </div>
                            </div>
                            <div
                                className="sk-filter-group__remove-action"
                                data-key="OrderFromRange"
                                onClick={this.props.onClick}
                            >
                                X
                            </div>
                        </div>
                    </div>
                ) : (
                    ""
                )}

                {this.props.OrderToRange !== "" ? (
                    <div className="sk-filter-group filter-group-users">
                        <input type="hidden" value={(counts = counts + 1)} />
                        <div className="sk-filter-groups">
                            <div className="sk-filter-group-items">
                                <div className="sk-filter-group-items__title">Order To</div>
                                <div className="sk-filter-group-items__list">
                                    <div
                                        className="sk-filter-group-items__value"
                                        data-key="OrderToRange"
                                        onClick={this.props.onClick}
                                    >
                                        {this.props.OrderToRange}
                                    </div>
                                </div>
                            </div>
                            <div
                                className="sk-filter-group__remove-action"
                                data-key="OrderToRange"
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
                                <div className="sk-filter-group-items__title">Status</div>
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

class OrderDetail extends Component {
    static contextTypes = {
        router: PropTypes.object,
    };
    constructor(props, context) {
        super(props, context);
        this.state = {
            openOrder: false,
            openOrderBlock: "",
            suppName: false,
            suppNameBlock: "",
            openPo: false,
            openPoBlock: "",
            resources: [],
            pRNumberClick: false,
        };
    }

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

    openSuppname = (id, length, event) => {
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
            this.setState({ suppName: { [id]: true } });
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
            this.setState({ suppName: false });
        }
        this.setState({ suppNameBlock: { [id]: object.innerHTML } });
    };

    // dont delete from shubham
    //  openPo = (id, length, event) => {
    //     var object = event.currentTarget;
    //     if (object.innerHTML.includes(getLabelText(this.state.resources.
    //         filter(x => { return x.resourceKey === "more"; })[0], "More"))) {
    //         object.innerHTML = "- " + length + " " + getLabelText(this.state.resources.filter(x => { return x.resourceKey === "less"; })[0], "Less");
    //         this.setState({ openPo: { [id]: true } })
    //     }
    //     else {
    //         object.innerHTML = "+ " + length + " " + getLabelText(this.state.resources.filter(x => { return x.resourceKey === "more"; })[0], "More");
    //         this.setState({ openPo: false })
    //     }
    //     this.setState({ openPoBlock: { [id]: object.innerHTML } });
    // }

    checkEntryPoint = (event, click, length) => {
        switch (click) {
            case "trclick":
                this.orderIDClickHandler(event.currentTarget.id);
                if (event.stopPropagation) {
                    event.stopPropagation();
                }
                break;

            case "prnumberclick":
                this.PRNumberClickHandler(event.currentTarget.id);
                if (event.stopPropagation) {
                    event.stopPropagation();
                }
                break;

            case "orderclick":
                this.openOrder(
                    event.currentTarget.id,
                    event.currentTarget.innerHTML.split(" ")[1],
                    event
                );
                if (event.stopPropagation) {
                    event.stopPropagation();
                }
                break;

            case "suppnameclick":
                this.openSuppname(
                    event.currentTarget.id,
                    event.currentTarget.innerHTML.split(" ")[1],
                    event
                );
                if (event.stopPropagation) {
                    event.stopPropagation();
                }
                break;

            default:
        }
    };

    filterSet() {
        localStorage.setItem("LocationselectedValues", LocationselectedValues);
        localStorage.setItem("SearchValues", SearchValues);
        localStorage.setItem("FromDate", FromDate);
        localStorage.setItem("ToDate", ToDate);
        localStorage.setItem("OrderFromRange", OrderFromRange);
        localStorage.setItem("OrderToRange", OrderToRange);
        localStorage.setItem("Selected_Status", Selected_Status);
    }

    orderIDClickHandler = (orderId) => {
        //Below LOC is commented so as to reset all existing applied Filters when user is redirected to Order Detail page | ShriGanesh Singh | 10th April 2021
        // this.filterSet();
        this.context.router.history.push("/order-details?orderid=" + orderId);
    };
    PRNumberClickHandler = (pRNumber) => {
        //Below LOC is commented so as to reset all existing applied Filters when user is redirected to Order Detail page | ShriGanesh Singh | 10th April 2021
        // this.filterSet();
        this.context.router.history.push("/order-details?prnumber=" + pRNumber);
    };

    componentDidMount() {
        getPageResource(
            getLanguageResourceElasticIndex(localStorage.languageId, PageKeys.prs)
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

    render() {
        hitCount = this.props.hits.length;
        let source;
        let newCreatedDate;
        let newModifiedDate;
        let isExpiredCount = 0;
        let rfqordertype = 'NORMALORDER';
        let poNumberStatus = [];
        let isDeactivatedCount = 0;
        let isInActiveSupplierCount = 0;

        return (
            <div className="pr_listing_table">
                <Table id="prData">
                    <Thead>
                        <Tr>
                            <Th>
                                {getLabelText(
                                    this.state.resources.filter((x) => {
                                        return x.resourceKey === "id";
                                    })[0],
                                    "ID"
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
                            <Th className="grid_status">
                                {getLabelText(
                                    this.state.resources.filter((x) => {
                                        return x.resourceKey === "requeststatus";
                                    })[0],
                                    "Order Status"
                                )}
                            </Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {this.props.hits.map(
                            (hit) => (
                                (source = hit._source),
                                (poNumberStatus = hit._source.listOrderPOVM),
                                (newCreatedDate = moment(source.createdDate).format(
                                    "DD/MM/YYYY"
                                )),
                                (newModifiedDate = moment(source.modifiedDate).format(
                                    "DD/MM/YYYY"
                                )),
                                (isExpiredCount = hit._source.listOrderProductExpiryVM.filter(
                                    (x) => x.isExpired === true
                                ).length),
                                (rfqordertype = hit._source.listOrderProductVM[0].ordertype),
                                (isDeactivatedCount = hit._source.listOrderProductExpiryVM.filter(
                                    (x) => x.isDeactivated === true
                                ).length),
                                (isInActiveSupplierCount = hit._source.listOrderProductExpiryVM.filter(
                                    (x) => x.isSupplierActive === false
                                ).length),
                                (
                                    <React.Fragment>
                                        <Tr
                                            onClick={(e) => this.checkEntryPoint(e, "trclick", null)}
                                            id={source.orderId}
                                        >
                                            <Td>
                                                <span>{source.orderId}</span>
                                            </Td>

                                            <Td>
                                                <div
                                                    key={"product_" + source.orderId}
                                                    className={
                                                        this.state.openOrder[source.orderId] === true
                                                            ? "pr_listing_order_detail_open"
                                                            : "pr_listing_order_detail_close"
                                                    }
                                                >
                                                    {source.listOrderProductVM.map((item) => (
                                                        <div>{item.productName}</div>
                                                    ))}
                                                </div>
                                                <span
                                                    id={source.orderId}
                                                    onClick={(e) => this.checkEntryPoint(e, "orderclick")}
                                                    className="view_more_pr_listing"
                                                >
                                                    {source.listOrderProductVM.length > 1
                                                        ? this.state.openOrderBlock[source.orderId] ===
                                                            undefined
                                                            ? "+ " +
                                                            (source.listOrderProductVM.length - 1) +
                                                            " More"
                                                            : this.state.openOrderBlock[source.orderId]
                                                        : ""}
                                                </span>

                                                <div className="prn">
                                                    <span
                                                        id={source.pRNumber}
                                                        onClick={(e) =>
                                                            this.checkEntryPoint(e, "prnumberclick", null)
                                                        }
                                                    >
                                                        {source.pRNumber}
                                                    </span>
                                                </div>

                                                <div className="pon" key={"po_" + source.orderId}>
                                                    {source.listOrderPOVM.map((item) => (
                                                        <span>{item.pONumber}</span>
                                                    ))}
                                                </div>
                                                {rfqordertype == 'NORMALORDER' ?
                                                    <div className="pr_listing_options">
                                                        {isExpiredCount > 0 && poNumberStatus.length === 0 ? (
                                                            <p className="redText">
                                                                {isExpiredCount}{" "}
                                                                {getLabelText(
                                                                    this.state.resources.filter((x) => {
                                                                        return x.resourceKey === "lineitemexpired";
                                                                    })[0],
                                                                    "Line Item Expired"
                                                                )}
                                                            </p>
                                                        ) : (
                                                            ""
                                                        )}
                                                        {isDeactivatedCount > 0 &&
                                                            poNumberStatus.length === 0 ? (
                                                            <p className="orangeText">
                                                                {isDeactivatedCount}{" "}
                                                                {getLabelText(
                                                                    this.state.resources.filter((x) => {
                                                                        return (
                                                                            x.resourceKey === "lineitemdeactivated"
                                                                        );
                                                                    })[0],
                                                                    "Line Item Deactivated"
                                                                )}
                                                            </p>
                                                        ) : (
                                                            ""
                                                        )}
                                                        {isInActiveSupplierCount > 0 &&
                                                            poNumberStatus.length === 0 ? (
                                                            <p className="orangeText">
                                                                {isInActiveSupplierCount}{" "}
                                                                {getLabelText(
                                                                    this.state.resources.filter((x) => {
                                                                        return (
                                                                            x.resourceKey === "lineitemdeactivated"
                                                                        );
                                                                    })[0],
                                                                    "Line Item Deactivated"
                                                                )}
                                                            </p>
                                                        ) : (
                                                            ""
                                                        )}
                                                    </div> : ''}
                                            </Td>
                                            <Td>
                                                <div
                                                    key={"company_" + source.orderId}
                                                    className={
                                                        this.state.suppName[source.orderId] === true
                                                            ? "pr_listing_order_detail_open"
                                                            : "pr_listing_order_detail_close"
                                                    }
                                                >
                                                    {source.listOrderCompanyVM.map((item) => (
                                                        <div>{item.companyName}</div>
                                                    ))}
                                                </div>
                                                <span
                                                    id={source.orderId}
                                                    onClick={(e) =>
                                                        this.checkEntryPoint(e, "suppnameclick")
                                                    }
                                                    className="view_more_pr_listing"
                                                >
                                                    {source.listOrderCompanyVM.length > 1
                                                        ? this.state.suppNameBlock[source.orderId] ===
                                                            undefined
                                                            ? "+ " +
                                                            (source.listOrderCompanyVM.length - 1) +
                                                            " More"
                                                            : this.state.suppNameBlock[source.orderId]
                                                        : ""}
                                                </span>
                                            </Td>
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

// const errorComponent = () => {
//     return <div className="no-products-found prListnotFound">No Records Found.</div>
// }

class PRListingView extends Component {
    onClick = () => {
        this.child.method(); // do stuff
    };
    constructor(props) {
        super(props);
        this.state = {
            viewmore: false,
            resources: [],
            loading: false,
            allSuppliers: [],
            filterSupplier: [],
            indexDataList: 0,
            currentSuppliers: { hits: [] },
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
            OrderFromRange: "",
            OrderToRange: "",
            Selected_Status: "",
            currentrecords: 0,
        };
        this.SearchRef = React.createRef();
        this.LocationRef = React.createRef();
        this.fromdateRef = React.createRef();
        this.todateRef = React.createRef();
        this.orderTotal_filter_fromRef = React.createRef();
        this.orderTotal_filter_toRef = React.createRef();
    }

    async componentDidMount() {
        this._isMounted = true;
        const sortnode = this.LocationRef.current;
        const Searchnode = this.SearchRef.current;
        const fromdatenode = this.fromdateRef.current;
        const todatenode = this.todateRef.current;
        window.onpopstate = () => {
            if (
                localStorage.getItem("LocationselectedValues") !== null &&
                localStorage.getItem("LocationselectedValues") !== "undefined"
            ) {
                LocationselectedValues = localStorage.getItem("LocationselectedValues");
                this.setState({ selectedName: LocationselectedValues });
                document.getElementById(
                    sortnode.props.id
                ).value = LocationselectedValues;
            } else {
                this.setState({ selectedName: "" });
                document.getElementById(sortnode.props.id).value = "";
            }

            if (
                localStorage.getItem("SearchValues") !== null &&
                localStorage.getItem("SearchValues") !== "undefined"
            ) {
                SearchValues = localStorage.getItem("SearchValues");
                this.setState({ Searchval: SearchValues });
                document.getElementById(Searchnode.props.id).value = SearchValues;
            } else {
                this.setState({ Searchval: "" });
                document.getElementById(Searchnode.props.id).value = "";
            }

            if (
                localStorage.getItem("FromDate") !== null &&
                localStorage.getItem("FromDate") !== "undefined"
            ) {
                FromDate = localStorage.getItem("FromDate");
                this.setState({ FromDate: FromDate });
                fromdatenode.state.inputValue = FromDate;
            } else {
                this.setState({ FromDate: "" });
                fromdatenode.state.inputValue = "";
            }

            if (
                localStorage.getItem("ToDate") !== null &&
                localStorage.getItem("ToDate") !== "undefined"
            ) {
                ToDate = localStorage.getItem("ToDate");
                this.setState({ ToDate: ToDate });
                todatenode.state.inputValue = ToDate;
            } else {
                this.setState({ ToDate: "" });
                todatenode.state.inputValue = "";
            }

            if (
                localStorage.getItem("Selected_Status") !== null &&
                localStorage.getItem("Selected_Status") !== "undefined"
            ) {
                Selected_Status = localStorage.getItem("Selected_Status");
                this.setState({ Selected_Status: Selected_Status });
            } else {
                this.setState({ Selected_Status: "" });
            }
            this.commonFilter();
            let data = {
                currentPage: 1,
                totalPages: 0,
                pageLimit: GlobalPageLimit,
                DataFilters: "",
                HeadFilters: "",
            };
            this.getIndexData(data);
        };

        this.setState({ selectedName: "" });
        document.getElementById(sortnode.props.id).value = "";
        this.setState({ Searchval: "" });
        document.getElementById(Searchnode.props.id).value = "";
        this.setState({ FromDate: "" });
        fromdatenode.state.inputValue = "";
        this.setState({ ToDate: "" });
        todatenode.state.inputValue = "";
        this.setState({ Selected_Status: "" });
        SearchValues = "";
        FromDate = "";
        ToDate = "";
        OrderFromRange = "";
        OrderToRange = "";
        Selected_Status = "";
        this.commonFilter();
        let data = {
            currentPage: 1,
            totalPages: 0,
            pageLimit: GlobalPageLimit,
            DataFilters: "",
            HeadFilters: "",
        };
        this.getIndexData(data);

        getPageResource(
            getLanguageResourceElasticIndex(
                localStorage.languageId,
                PageKeys.suppliermanagement
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
        const urlParams = new URLSearchParams(window.location.search);
        const myParam = urlParams.get('orders');
        if (myParam) {
            this.onSearchChanged(myParam)
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.location !== prevProps.location) {
            const urlParams = new URLSearchParams(window.location.search);
            const myParam = urlParams.get('orders');
            if (myParam) {
                this.onSearchChanged(myParam)
            }
        }
    }

    getIndexData = (data) => {
        let indexName = getWebsiteGUID() + "_prlisting";
        if (this.props.userType === RoleCodes.BUYER || this.props.userType === RoleCodes.ADMIN || this.props.userType === RoleCodes.APPROVER) {
            indexName = getWebsiteGUID() + "_" + localStorage.companyGuid + "_prlisting";
        }
        // const { allSuppliers, filterSupplier, indexDataList } = this.state;
        const { currentPage, pageLimit, DataFilters, HeadFilters } = data;
        if (currentPage === undefined) {
            currentPage = 1;
        }
        const offsetall = (currentPage - 1) * pageLimit;

        let commonquery = "";

        if (
            (DataFilters !== undefined && DataFilters !== "") ||
            (HeadFilters !== undefined && HeadFilters !== "")
        ) {
            // var config;
            if (HeadFilters !== "") {
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
            }

            let Oldcommonquery = commonquery;
            if (commonquery !== "") {
                commonquery = JSON.parse("{" + commonquery + "}");
            } else {
                commonquery = "";
            }

            var dataFiltersAll =
                '{ "size": 0, "aggs": {"GetStatus": {"terms": {"field": "status_raw.raw.keyword"}},"GetLocation": {"terms": {"field": "listOrderLocationVM.deliverylocation_raw.raw.keyword"}},"MinOrderPrice": {"min": {"field": "orderTotal"}},"MaxOrderPrice": {"max": {"field": "orderTotal"}}},' +
                Oldcommonquery +
                " }";

            getElasticData(
                indexName,
                JSON.parse(dataFiltersAll),
                offsetall,
                0,
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

                    // const OrderFromRangenode = this.orderTotal_filter_fromRef.current;
                    // document.getElementById(OrderFromRangenode.props.id).value =
                    //   json.aggregations.MinOrderPrice.value;

                    // const OrderToRangenode = this.orderTotal_filter_toRef.current;
                    // document.getElementById(OrderToRangenode.props.id).value =
                    //   json.aggregations.MaxOrderPrice.value;

                    // this.setState({ OrderFromRange: json.aggregations.MinOrderPrice.value, OrderToRange: json.aggregations.MaxOrderPrice.value });
                    // OrderFromRange = json.aggregations.MinOrderPrice.value;
                    // OrderToRange = json.aggregations.MaxOrderPrice.value;
                } else {
                    this.setState({ loading: false });
                }
            });

            getElasticData(
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
                        let totalPages = json.hits.total / GlobalPageLimit;
                        if (totalPages <= 1) {
                            totalPages = 1;
                        }
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
                '{ "size": 0, "aggs": {"GetStatus": {"terms": {"field": "status_raw.raw.keyword"}},"GetLocation": {"terms": {"field": "listOrderLocationVM.deliverylocation_raw.raw.keyword"}},"MinOrderPrice": {"min": {"field": "orderTotal"}},"MaxOrderPrice": {"max": {"field": "orderTotal"}}},' +
                commonquery +
                " }";

            getElasticData(
                indexName,
                JSON.parse(dataFiltersAll),
                offsetall,
                0,
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
                    });

                    const OrderFromRangenode = this.orderTotal_filter_fromRef.current;
                    if (OrderFromRangenode.props !== null) {
                        // document.getElementById(OrderFromRangenode.props.id).value =
                        //   json.aggregations.MinOrderPrice.value;
                    }

                    const OrderToRangenode = this.orderTotal_filter_toRef.current;
                    if (OrderToRangenode.props !== null) {
                        // document.getElementById(OrderToRangenode.props.id).value =
                        //   json.aggregations.MaxOrderPrice.value;
                    }

                    // this.setState({ OrderFromRange: json.aggregations.MinOrderPrice.value, OrderToRange: json.aggregations.MaxOrderPrice.value });
                    // OrderFromRange = json.aggregations.MinOrderPrice.value;
                    // OrderToRange = json.aggregations.MaxOrderPrice.value;
                } else {
                    this.setState({ loading: false })
                }
            });

            if (commonquery !== "") {
                commonquery = JSON.parse("{" + commonquery + "}");
            } else {
                commonquery = "";
            }

            getElasticData(
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
            HeadFilters =
                '{"term":{"listOrderLocationVM.deliverylocation_raw.raw.keyword":"' +
                LocationselectedValues +
                '"}}';
            tempcount = tempcount + 1;
            currentPageindex = 1;
        } else {
            HeadFilters = "";
        }

        if (SearchValues !== undefined && SearchValues !== "") {
            if (tempcount === 0) {
                HeadFilters =
                    '{"multi_match": {"query": "' +
                    SearchValues +
                    '","type": "phrase_prefix","fields": ["orderId","listOrderProductVM.productName","listOrderCompanyVM.companyName","pRNumber","listOrderPOVM.pONumber"],"operator": "or"}}';
            } else {
                HeadFilters =
                    HeadFilters +
                    ',{"multi_match": {"query": "' +
                    SearchValues +
                    '","type": "phrase_prefix","fields": ["orderId","listOrderProductVM.productName","listOrderCompanyVM.companyName","pRNumber","listOrderPOVM.pONumber"],"operator": "or"}}';
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

        if (OrderFromRange !== undefined && OrderFromRange !== "") {
            if (tempcount === 0) {
                HeadFilters =
                    '{"range": {"orderTotal": {"gte": "' + OrderFromRange + '"}}}';
            } else {
                HeadFilters =
                    HeadFilters +
                    ',{"range": {"orderTotal": {"gte": "' +
                    OrderFromRange +
                    '"}}}';
            }
            tempcount = tempcount + 1;
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

        if (OrderToRange !== undefined && OrderToRange !== "") {
            if (tempcount === 0) {
                HeadFilters =
                    '{"range": {"orderTotal": {"lte": "' + OrderToRange + '"}}}';
            } else {
                HeadFilters =
                    HeadFilters +
                    ',{"range": {"orderTotal": {"lte": "' +
                    OrderToRange +
                    '"}}}';
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
                ToDate !== "" &&
                OrderFromRange !== undefined &&
                OrderFromRange !== ""
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
                OrderToRange !== undefined &&
                OrderToRange !== "" &&
                LocationselectedValues !== undefined &&
                LocationselectedValues === "" &&
                FromDate !== undefined &&
                FromDate === "" &&
                SearchValues !== undefined &&
                SearchValues === "" &&
                ToDate !== undefined &&
                ToDate !== "" &&
                OrderFromRange !== undefined &&
                OrderFromRange !== ""
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
        window.history.replaceState(null, null, window.location.pathname);
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
                break;
            case "Selected_Status":
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
            case "OrderFromRange":
                this.setState({ OrderFromRange: "" });
                OrderFromRange = "";
                break;
            case "OrderToRange":
                this.setState({ OrderToRange: "" });
                OrderToRange = "";
                break;

            default:
                SearchValues = "";
                this.setState({ Searchval: "" });
                const Searchnode1 = this.SearchRef.current;
                document.getElementById(Searchnode1.props.id).value = "";

                this.setState({ value: "0", selectedName: "-- Select --" });
                LocationselectedValues = "";
                let sortnode1 = this.LocationRef.current;
                this.setState({ Selected_Status: "" });
                Selected_Status = "";
                this.setState({ FromDate: "" });
                FromDate = "";
                const fromdatenode1 = this.fromdateRef.current;
                fromdatenode1.state.inputValue = "";
                this.setState({ ToDate: "" });
                ToDate = "";
                const todatenode1 = this.todateRef.current;
                todatenode1.state.inputValue = "";
                this.setState({ OrderFromRange: "" });
                OrderFromRange = "";
                this.setState({ OrderToRange: "" });
                OrderToRange = "";
                break;
        }
        this.commonFilter();
    };

    onSearchChanged = (props) => {
        if (props.target !== undefined) {
            SearchValues = props.target.value;
        }
        else {
            SearchValues = props;
        }
        const Searchnode = this.SearchRef.current;

        this.setState({ Searchval: SearchValues });
        document.getElementById(Searchnode.props.id).value = SearchValues


        this.setState({ Searchval: SearchValues });
        isSelected = 0;
        isSelectedStatus = 0;
        this.commonFilter();
    };

    onFromdateChange = (props) => {
        if (props !== undefined && props !== "") {
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

    onOrderFromChanged = (props) => {
        OrderFromRange = props.target.value;

        this.setState({ OrderFromRange: props.target.value });
        // if (props.keyCode === 13) {
        isSelected = 0;
        isSelectedStatus = 0;
        this.commonFilter();
        // }
    };

    onOrderToChanged = (props) => {
        OrderToRange = props.target.value;
        this.setState({ OrderToRange: props.target.value });
        // if (props.keyCode === 13) {
        isSelected = 0;
        isSelectedStatus = 0;
        this.commonFilter();
        // }
    };

    onSelectChanged = (props) => {
        if (props.target.value !== '0') {
            const { allSuppliers } = this.state;
            let name = props.currentTarget.innerText;
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
        v = props.currentTarget.innerText
            .replace(props._dispatchInstances.memoizedProps["data-key"].trim(), "")
            .trim();
        let totalPages = v / GlobalPageLimit;
        if (totalPages <= 1) {
            totalPages = 1;
        }
        this.setState({ currentrecords: v });
        this.setState({ Selected_Status: Selected_Status });
        isSelected = 0;
        isSelectedStatus = 1;
        this.commonFilter();
        this.onClick();
    };

    render() {
        let breadCrumb = null;
        if (this.props.userType === RoleCodes.BUYER) {
            breadCrumb = BreadCrumb([{ 'pageName': 'Shop', 'url': '/shop' },
            { 'pageName': 'Orders', 'url': '/#' }
            ])
        }
        if (getUserPermision(this.props.permissions, PageKeys.prs) === null) {
            return <Redirect to="/home" />;
        }

        const {
            allSuppliers,
            currentSuppliers,
            currentPage,
            totalPages,
        } = this.state;
        const totalProducts = this.state.indexDataList;

        const totalPagesh = this.state.totalPages;
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
                            <div className="page_top_title">
                                <div className="page_heading">
                                    Orders
                                </div>
                            </div>
                        </div>
                        <div className="Pr_lisiting_container">
                            <div className="Pr_listing_filters ">
                                <GridContainer className="newThemeInput" >
                                    <GridItem md={3} xs={12}>
                                        <Input
                                            id="orders"
                                            elementType="input"
                                            elementConfig={{ 'placeholder': 'Product, Supplier, PO#, Order#' }}
                                            class="newInput"
                                            onKeyUp={this.onSearchChanged}
                                            ref={this.SearchRef}
                                        />
                                    </GridItem>
                                    <GridItem md={3} xs={12}>
                                        <div className="po_date_filter input_parent_div">
                                            <Datetime
                                                // id="createddate_filter"
                                                closeOnSelect={true}
                                                timeFormat={false}
                                                inputProps={{ placeholder: "From", class: "newInput" }}
                                                className="newThemeInput"
                                                onChange={this.onFromdateChange}
                                                id="startDate"
                                                name="startDate"
                                                ref={this.fromdateRef}
                                                isValidDate={disableFutureDt}
                                            // value={''}
                                            />
                                            <span>-</span>
                                            <Datetime
                                                // id="orderTotal_filter"
                                                closeOnSelect={true}
                                                timeFormat={false}
                                                inputProps={{ placeholder: "To", class: "newInput" }}
                                                className="newThemeInput"
                                                onChange={this.onTodateChange}
                                                id="EndDate"
                                                name="EndDate"
                                                ref={this.todateRef}
                                                isValidDate={disableFutureDt}
                                            // value={''}
                                            />
                                        </div>
                                    </GridItem>
                                    <GridItem className="pr_order_total" md={2} xs={12}>
                                        <Input
                                            id="orderTotal_filter_from"
                                            elementType="input"
                                            elementConfig={{ 'placeholder': 'Order Total From' }}
                                            class="newInput"
                                            onKeyUp={(event) => this.onOrderFromChanged(event)}
                                            ref={this.orderTotal_filter_fromRef}
                                        />
                                    </GridItem>
                                    <GridItem md={2} xs={12}>
                                        <Input
                                            id="orderTotal_filter_to"
                                            elementType="input"
                                            elementConfig={{ 'placeholder': 'Order Total To' }}
                                            class="newInput"
                                            onKeyUp={(event) => this.onOrderToChanged(event)}
                                            ref={this.orderTotal_filter_toRef}
                                        />
                                    </GridItem>
                                    <GridItem className="newThemeInput" md={2} xs={12}>
                                        <Input
                                            id="FilterSortID"
                                            elementType="select"
                                            class="newInput"
                                            value={this.state.value}
                                            SelectChange={this.onSelectChanged}
                                            ref={this.LocationRef}
                                            elementConfig={
                                                this.state.locationdata !== null
                                                    ? this.state.locationdata
                                                    : ""
                                            }
                                            selectLableHeader={'Select Location'}
                                        />
                                    </GridItem>
                                </GridContainer>
                            </div>
                            <div className="pr_listing_table_filter">
                                <div className="sk-panel filter--statusFilter">
                                    <div className="sk-panel__header">Status</div>
                                    <div className="sk-panel__content">
                                        <div className="sk-hierarchical-menu-list__root">
                                            <div className="sk-hierarchical-menu-list__hierarchical-options">
                                                <div>
                                                    <div className="sk-hierarchical-menu-option pr_po_status_text sk-hierarchical-menu-list__item is-active">
                                                        <div
                                                            data-qa="label"
                                                            className="sk-hierarchical-menu-option__text"
                                                        >
                                                            <b>Order Status:</b>
                                                        </div>
                                                    </div>
                                                </div>
                                                {this.state.Orderstatus.length > 0
                                                    ? this.state.Orderstatus.map((item) => (
                                                        <div>
                                                            <div
                                                                className={item.Id + ' ' + "sk-hierarchical-menu-option sk-hierarchical-menu-list__item is-active"}
                                                                data-qa="option"
                                                                data-key={item.Id}
                                                                onClick={(event) =>
                                                                    this.onSelectChangedStatus(event)
                                                                }
                                                            >
                                                                <div
                                                                    data-qa="label"
                                                                    className="sk-hierarchical-menu-option__text"
                                                                >
                                                                    {item.Id}
                                                                </div>
                                                                <div
                                                                    data-qa="count"
                                                                    className="sk-hierarchical-menu-option__count"
                                                                >
                                                                    ({item.Value})
                                                                </div>
                                                            </div>
                                                            <div className="sk-hierarchical-menu-list__hierarchical-options" />
                                                        </div>
                                                    ))
                                                    : ""}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <GridContainer>
                                <GridItem md={12}>
                                    <List
                                        SearchValues={this.state.Searchval}
                                        LocationValues={this.state.selectedName}
                                        fromdate={this.state.FromDate}
                                        todate={this.state.ToDate}
                                        OrderFromRange={this.state.OrderFromRange}
                                        OrderToRange={this.state.OrderToRange}
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
                                    {this.state.totalPages <= GlobalPageLimit ? (
                                        ""
                                    ) : this.state.indexDataList.value !== undefined ? (
                                        <div className="pagi_container" justify="center">
                                            <Pagination
                                                totalRecords={this.state.indexDataList.value}
                                                pageLimit={GlobalPageLimit}
                                                pageNeighbours={1}
                                                DataFilters={this.state.DataFilters}
                                                HeadFilters={this.state.HeadFilters}
                                                onPageChanged={this.getIndexData}
                                                onRef={(ref) => (this.child = ref)}
                                            />
                                        </div>
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
)(PRListingView);
