import React, { Component, PureComponent } from 'react';
import { connect } from 'react-redux';
import Aux from '../../hoc/Auxx';
// import '../../../node_modules/searchkit/release/theme.css';
// import '../../../node_modules/searchkit-datefilter/release/theme.css';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { getServiceUrl, getLabelText, getLanguageResourceElasticIndex, getUserPermision } from '../../config';
import * as PageKeys from '../../pagekeys';
import { getPageResource, BreadCrumb, toasterAlert } from '../../utility';
import GridContainer from '../../components/Material/Grid/GridContainer';
import GridItem from '../../components/Material/Grid/GridItem';
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table';
import ThumbUp from '@material-ui/icons/ThumbUp';
import ThumbDown from '@material-ui/icons/ThumbDown';
import toaster from 'toasted-notes';
import { confirmAlert } from 'react-confirm-alert';
import Spinner from '../../UI/Spinner/Spinner';
import Input from "../../UI/Input/MaterialInput";
import Datetime from "react-datetime";
import Pagination from '../../components/Pagination/Pagination';
import moment from "moment";
import { getElasticData } from '../../utility';
import { Redirect } from "react-router-dom";

let GlobalPageLimit = 10;

let EmailValues = "";
let selectedValues = "";
let FromDate = "";
let ToDate = "";
let emailEvent, selectevent, FromDateevent, ToDateevent;
const today = moment();
const disableFutureDt = current => {
    return current.isBefore(today)
}

class List extends PureComponent {
    render() {
        let counts = 0;
        return (
            <div>
                {this.props.sort !== "" && this.props.sort !== "-- Select --" ?

                    <div className="sk-filter-group filter-group-users">
                        <input type="hidden" value={counts = counts + 1}></input>
                        <div className="sk-filter-groups">
                            <div className="sk-filter-group-items">
                                <div className="sk-filter-group-items__title">Sort By Name</div>
                                <div className="sk-filter-group-items__list">
                                    <div className="sk-filter-group-items__value" data-key={this.props.sort}>{this.props.sort}</div>
                                </div>
                            </div>
                            <div className="sk-filter-group__remove-action" data-key="selectFilter" onClick={this.props.onClick} >X</div>
                        </div>
                    </div>
                    : ""}
                {this.props.email !== "" ?
                    <div className="sk-filter-group filter-group-users">
                        <input type="hidden" value={counts = counts + 1}></input>
                        <div className="sk-filter-groups">
                            <div className="sk-filter-group-items">
                                <div className="sk-filter-group-items__title">Email ID</div>
                                <div className="sk-filter-group-items__list">
                                    <div className="sk-filter-group-items__value" data-key={this.props.email}>{this.props.email}</div>
                                </div>
                            </div>
                            <div className="sk-filter-group__remove-action" data-key="emailFilter" onClick={this.props.onClick}>X</div>
                        </div>
                    </div>
                    : ""}

                {this.props.fromdate !== "" ?
                    <div className="sk-filter-group filter-group-users">
                        <input type="hidden" value={counts = counts + 1}></input>
                        <div className="sk-filter-groups">
                            <div className="sk-filter-group-items">
                                <div className="sk-filter-group-items__title">FromDate</div>
                                <div className="sk-filter-group-items__list">
                                    <div className="sk-filter-group-items__value" data-key={this.props.fromdate}>{this.props.fromdate}</div>
                                </div>
                            </div>
                            <div className="sk-filter-group__remove-action" data-key="fromdateFilter" onClick={this.props.onClick}>X</div>
                        </div>
                    </div>
                    : ""}

                {this.props.todate !== "" ?
                    <div className="sk-filter-group filter-group-users">
                        <input type="hidden" value={counts = counts + 1}></input>
                        <div className="sk-filter-groups">
                            <div className="sk-filter-group-items">
                                <div className="sk-filter-group-items__title">ToDate</div>
                                <div className="sk-filter-group-items__list">
                                    <div className="sk-filter-group-items__value" data-key={this.props.todate}>{this.props.todate}</div>
                                </div>
                            </div>
                            <div className="sk-filter-group__remove-action" data-key="todateFilter" onClick={this.props.onClick}>X</div>
                        </div>
                    </div>
                    : ""}
                {counts > 0 ?
                    <div className="sk-reset-filters">
                        <div className="sk-reset-filters__reset" onClick={this.props.onClick}>Clear all filters</div>
                    </div> : ""}

            </div >

        )
    }
}

class SupplierDetailsListing extends Component {
    constructor(props) {
        super(props);
        this.state = {
            resources: [],
            refresh: false,
            loading: false,
            allSuppliers: [],
            filterSupplier: [],
            indexDataList: 0,
            currentSuppliers: { "hits": [] }, currentPage: 1, totalPages: null,
            selectedName: "",
            value: "0",
            Emailvalue: "",
            FromDate: "",
            ToDate: "",
            emailval: "",
            DataFilters: "",
            HeadFilters: ""
        }
        this.emailRef = React.createRef();
        this.sortRef = React.createRef();
        this.fromdateRef = React.createRef();
        this.todateRef = React.createRef();
    }

    componentDidUpdate() {
        this.commonFilter = this.commonFilter.bind(this);
    }

    getIndexData = (data) => {
        const { allSuppliers, filterSupplier, indexDataList } = this.state;
        const { currentPage, totalPages, pageLimit, DataFilters, HeadFilters } = data;
        if (currentPage === undefined) {
            currentPage = 1
        }
        const offsetall = (currentPage - 1) * pageLimit;

        if ((DataFilters !== undefined && DataFilters !== "") || (HeadFilters !== undefined && HeadFilters !== '')) {

            var config;
            if (HeadFilters !== '') {
                getElasticData("_supplierdetails", HeadFilters, offsetall, GlobalPageLimit, DataFilters).then(json => {
                    if (json !== null) {
                        if (json.hits.total === 0) {
                            this.setState({ currentSuppliers: { "hits": [] } });
                        } else {
                            let totalPages = json.hits.total / GlobalPageLimit;
                            if (totalPages <= 1) {
                                totalPages = 1;
                            }
                            this.setState({ indexDataList: json.hits.total, allSuppliers: json.hits.hits, currentPage: currentPage, currentSuppliers: { "hits": json.hits.hits }, totalPages: json.hits.total, pageLimit: GlobalPageLimit, loading: false });
                        }
                    }
                });

            } else {

                getElasticData("_supplierdetails", "", offsetall, GlobalPageLimit, DataFilters).then(json => {
                    if (json !== null) {
                        if (json.hits.total === 0) {
                            this.setState({ currentSuppliers: { "hits": [] } });
                        } else {
                            let totalPages = json.hits.total / GlobalPageLimit;
                            if (totalPages <= 1) {
                                totalPages = 1;
                            }
                            this.setState({ indexDataList: json.hits.total, allSuppliers: json.hits.hits, currentPage: currentPage, currentSuppliers: { "hits": json.hits.hits }, totalPages: json.hits.total, pageLimit: GlobalPageLimit, loading: false });
                        }
                    }
                });
            }

        } else {
            this.setState({ loading: true });
            getElasticData("_supplierdetails", "", offsetall, GlobalPageLimit, "").then(json => {
                if (json !== null) {
                    if (json.hits.total === 0) {
                        this.setState({ currentSuppliers: { "hits": [] } });
                    } else {
                        this.setState({ indexDataList: json.hits.total, allSuppliers: json.hits.hits, currentPage: currentPage, currentSuppliers: { "hits": json.hits.hits }, totalPages: json.hits.total, pageLimit: GlobalPageLimit, loading: false });
                    }
                }
            });
        }
    }

    async componentDidMount() {
        let data = { currentPage: 1, totalPages: 0, pageLimit: GlobalPageLimit, DataFilters: '', HeadFilters: '' };
        this.getIndexData(data);
        getPageResource(getLanguageResourceElasticIndex(localStorage.languageId, PageKeys.suppliermanagement))
            .then(json => {
                this.setState({ resources: json, show_resources: true });
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }

    onActivateDeactivateClick = (userGuid, emailId, firstName, userStatus, countryGuid) => {
        this.setState({ loading: true });
        const user = {
            UserGuid: userGuid,
            FirstName: firstName,
            UserStatus: userStatus,
            EmailId: emailId,
            CountryGuid: countryGuid,
        }
        axios({
            url: getServiceUrl() + 'Users/UpdateUserStatus?',
            method: 'post',
            data: user,
            headers: { 'Authorization': 'Bearer ' + localStorage.tokenId, 'Content-Type': 'application/json' },
        }).then((response) => {
            this.setState({ loading: false });
            confirmAlert({
                message: response.data.saveresult,
                buttons: [
                    {
                        label: 'SUCCESS',
                        onClick: () => {
                            window.location.href = "./supplier-listing";
                        }
                    }
                ]
            });
        })
    }

    SupplierList = (props) => (
        <React.Fragment>
            <div className="Pr_lisiting_container_inner">
                <div className="pr_listing_table">
                    <Table>
                        <Thead>
                            <Tr>
                                <Th>Email</Th>
                                <Th>Name</Th>
                                <Th>Company Name</Th>
                                <Th>Country</Th>
                                <Th>Approval status</Th>
                                <Th>Status</Th>
                                <Th>Activate/Deactivate</Th>
                                <Th>Action</Th>
                                <Th>View</Th>
                                <Th></Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {props.hits.length > 0 ?
                                props.hits.map(hit => (
                                    hit._source.userGuid !== '00000000-0000-0000-0000-000000000000' ?
                                        <Tr>
                                            <Td>{hit._source.emailId}</Td>
                                            <Td>{hit._source.firstName} {hit._source.lastName}</Td>
                                            <Td>{hit._source.companyName}</Td>
                                            <Td>
                                                {
                                                    hit._source.listSupplierCountryMappingVM.map(x =>
                                                        <div>
                                                            <span>{x["countryname_raw.raw"]}</span>&nbsp;&nbsp;
                                            {hit._source.userStatus === "Active" ?
                                                                <span> {x.isActive ?
                                                                    <Link id={hit._source.userGuid + "_" + x["countryname_raw.raw"]} to='#' onClick={() => {
                                                                        confirmAlert({
                                                                            message: getLabelText(this.state.resources.filter((x) => { return x.resourceKey === 'confirmcountrydeactive' })[0], "Are you sure You want to deactivate supplier Country?"),
                                                                            buttons: [
                                                                                {
                                                                                    label: 'Yes',
                                                                                    onClick: () => this.onActivateDeactivateClick(x.userGuid, hit._source.emailId, hit._source.firstName, 'CountryDeactive', x.countryGuid)
                                                                                },
                                                                                {
                                                                                    label: 'No',
                                                                                }
                                                                            ]
                                                                        });
                                                                    }}>
                                                                        Deactivate
                                                </Link> :
                                                                    <Link to='#' onClick={() => {
                                                                        confirmAlert({
                                                                            message: getLabelText(this.state.resources.filter((x) => { return x.resourceKey === 'confirmcountryactive' })[0], "Are you sure You want to activate supplier Country?"),
                                                                            buttons: [
                                                                                {
                                                                                    label: 'Yes',
                                                                                    onClick: () => this.onActivateDeactivateClick(x.userGuid, hit._source.emailId, hit._source.firstName, 'CountryActive', x.countryGuid)
                                                                                },
                                                                                {
                                                                                    label: 'No',
                                                                                }
                                                                            ]
                                                                        });
                                                                    }}>
                                                                        Activate
                                                </Link>}
                                                                </span> : ''}
                                                        </div>
                                                    )
                                                }
                                            </Td>
                                            <Td>{hit._source.userRegistrationStatus}</Td>
                                            <Td>{hit._source.userStatus}</Td>
                                            <Td>
                                                {hit._source.userStatus === "Active" ?
                                                    <Link id={hit._source.userGuid} to='#' onClick={() => {
                                                        confirmAlert({
                                                            message: getLabelText(this.state.resources.filter((x) => { return x.resourceKey === 'confirmdeactive' })[0], "Are you sure You want to deactivate supplier?"),
                                                            buttons: [
                                                                {
                                                                    label: 'Yes',
                                                                    onClick: () => this.onActivateDeactivateClick(hit._source.userGuid, hit._source.emailId, hit._source.firstName, 'Deactive', '00000000-0000-0000-0000-000000000000')
                                                                },
                                                                {
                                                                    label: 'No',
                                                                }
                                                            ]
                                                        });
                                                    }}>
                                                        Deactivate
                                        </Link> :
                                                    <Link to='#' onClick={() => {
                                                        confirmAlert({
                                                            message: getLabelText(this.state.resources.filter((x) => { return x.resourceKey === 'confirmactive' })[0], "Are you sure You want to activate supplier?"),
                                                            buttons: [
                                                                {
                                                                    label: 'Yes',
                                                                    onClick: () => this.onActivateDeactivateClick(hit._source.userGuid, hit._source.emailId, hit._source.firstName, 'Active', '00000000-0000-0000-0000-000000000000')
                                                                },
                                                                {
                                                                    label: 'No',
                                                                }
                                                            ]
                                                        });
                                                    }}>
                                                        Activate
                                        </Link>
                                                }
                                            </Td>
                                            {hit._source.userRegistrationStatus === "Pending" ?
                                                <Td>
                                                    <Link to='#' onClick={() => {
                                                        confirmAlert({
                                                            message: getLabelText(this.state.resources.filter((x) => { return x.resourceKey === 'confirmapprove' })[0], "Are you sure you want to approve?"),
                                                            buttons: [
                                                                {
                                                                    label: 'Yes',
                                                                    onClick: () => this.onActivateDeactivateClick(hit._source.userGuid, hit._source.emailId, hit._source.firstName, 'Account Approved', '00000000-0000-0000-0000-000000000000')
                                                                },
                                                                {
                                                                    label: 'No',
                                                                }
                                                            ]
                                                        });
                                                    }}>
                                                        <ThumbUp />
                                                    </Link>
                                                    <Link to='#' onClick={() => {
                                                        confirmAlert({
                                                            message: getLabelText(this.state.resources.filter((x) => { return x.resourceKey === 'confirmreject' })[0], "Are you sure you want to reject?"),
                                                            buttons: [
                                                                {
                                                                    label: 'Yes',
                                                                    onClick: () => this.onActivateDeactivateClick(hit._source.userGuid, hit._source.emailId, hit._source.firstName, 'Rejected', '00000000-0000-0000-0000-000000000000')
                                                                },
                                                                {
                                                                    label: 'No',
                                                                }
                                                            ]
                                                        });
                                                    }}>
                                                        <ThumbDown />
                                                    </Link>
                                                </Td>
                                                : <Td></Td>}
                                            {hit._source.userRegistrationStatus === "Account Approved" ?
                                                <Td>
                                                    <Link to='#' onClick={() => {
                                                        confirmAlert({
                                                            message: getLabelText(this.state.resources.filter((x) => { return x.resourceKey === 'confirmreject' })[0], "Are you sure you want to reject?"),
                                                            buttons: [
                                                                {
                                                                    label: 'Yes',
                                                                    onClick: () => this.onActivateDeactivateClick(hit._source.userGuid, hit._source.emailId, hit._source.firstName, 'Rejected')
                                                                },
                                                                {
                                                                    label: 'No',
                                                                }
                                                            ]
                                                        });
                                                    }}>
                                                        <ThumbDown />
                                                    </Link>
                                                </Td>
                                                : null}
                                            {hit._source.userRegistrationStatus === "Rejected" ?
                                                <Td>
                                                    <Link to='#' onClick={() => {
                                                        confirmAlert({
                                                            message: getLabelText(this.state.resources.filter((x) => { return x.resourceKey === 'confirmapprove' })[0], "Are you sure you want to approve?"),
                                                            buttons: [
                                                                {
                                                                    label: 'Yes',
                                                                    onClick: () => this.onActivateDeactivateClick(hit._source.userGuid, hit._source.emailId, hit._source.firstName, 'Account Approved')
                                                                },
                                                                {
                                                                    label: 'No',
                                                                }
                                                            ]
                                                        });
                                                    }}>
                                                        <ThumbUp />
                                                    </Link>
                                                </Td>
                                                : null}
                                            <Td>
                                                <Link to='#' onClick={() => '#'}>
                                                    View Detail
                                     </Link>
                                            </Td>
                                            <Td></Td>
                                        </Tr> : null
                                )) : ""}
                        </Tbody>
                    </Table>
                </div>
            </div>
        </React.Fragment>
    );

    onInputChanged = (props) => {
        EmailValues = props.target.value;
        emailEvent = props;
        this.setState({ emailval: props.target.value });
        this.commonFilter();
    }

    onSelectChanged = (props) => {
        const { allSuppliers } = this.state;
        let name = props.currentTarget.innerText;
        this.setState({ value: props.target.value, selectedName: name, selectevent: props });
        selectedValues = props.target.value;
        this.commonFilter();
    }

    onFromdateChange = (props) => {
        if (props !== undefined && props !== '') {
            let fromdate = moment(new Date(props._d)).format("YYYY-MM-DD");
            let todaydate = moment(new Date()).format("YYYY-MM-DD");
            if (todaydate < fromdate) {
                toaster.notify(toasterAlert('WARNING', 'From Date cannot be greater than current date.'), { duration: null });
                const fromdatenode = this.fromdateRef.current;
                fromdatenode.state.inputValue = "";
            } else {
                let showdate = moment(new Date(props._d)).format("DD MMM YYYY");
                this.setState({ FromDate: showdate, FromDateevent: props });
                FromDate = fromdate;
                this.commonFilter();
            }
        }
    }

    onTodateChange = (props) => {
        if (props !== undefined && props !== '') {
            // let todate = moment(new Date(props._d)).format("YYYY-MM-DDTH:mm:ss");
            let todate = moment(new Date(props._d)).format("YYYY-MM-DD");
            let todaydate = moment(new Date()).format("YYYY-MM-DD");
            let tempcount = 0;
            if (FromDate !== undefined && FromDate !== "" && todate < FromDate) {
                tempcount = tempcount + 1;
                toaster.notify(toasterAlert('WARNING', 'To Date cannot be greater than From date.'), { duration: null });
            }

            if (todaydate < todate) {
                tempcount = tempcount + 1;
                toaster.notify(toasterAlert('WARNING', 'To Date cannot be greater than current date.'), { duration: null });
            }

            if (tempcount === 0) {
                let showdate = moment(new Date(props._d)).format("DD MMM YYYY");
                this.setState({ ToDate: showdate, ToDateevent: props });
                ToDate = todate;
                this.commonFilter();
            }

        }
    }

    removeFilter = (props) => {
        let filterkey = props._dispatchInstances.memoizedProps["data-key"]
        switch (filterkey) {
            case "emailFilter":
                EmailValues = "";
                this.setState({ emailval: "" });
                const emailnode = this.emailRef.current;
                document.getElementById(emailnode.props.id).value = ""
                break;
            case "selectFilter":
                this.setState({ value: "0", selectedName: "-- Select --" });
                selectedValues = "";
                const sortnode = this.sortRef.current;
                document.getElementById(sortnode.props.id).value = "0"
                // sortnode.props.value = "0"
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
                EmailValues = "";
                this.setState({ emailval: "" });
                let emailnode1 = this.emailRef.current;
                document.getElementById(emailnode1.props.id).value = "";

                this.setState({ value: "0", selectedName: "-- Select --" });
                selectedValues = "";
                let sortnode1 = this.sortRef.current;
                document.getElementById(sortnode1.props.id).value = "0";

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
    }

    commonFilter = () => {
        let tempcount = 0;
        let currentPageindex = 1;
        let DataFilters = '';
        let HeadFilters = '';
        if (selectedValues !== undefined && selectedValues !== "") {
            DataFilters = selectedValues;
            tempcount = tempcount + 1;
            currentPageindex = this.state.currentPage;
        }

        if (EmailValues !== undefined && EmailValues !== "") {
            HeadFilters = JSON.stringify({
                "query": {
                    "bool": {
                        "filter": [
                            {
                                "multi_match": {
                                    "query": "" + EmailValues + "",
                                    "type": "phrase_prefix",
                                    "fields": [
                                        "emailId",
                                        "firstname"
                                    ],
                                    "operator": "or"
                                }
                            }
                        ]
                    }
                }
            })
            tempcount = tempcount + 1;
            currentPageindex = 1;
        }

        if (FromDate !== undefined && FromDate !== "") {
            if (tempcount === 0) {
                HeadFilters = JSON.stringify({
                    "query": {
                        "bool": {
                            "filter": [
                                {
                                    "range": {
                                        "createdDate": {
                                            "gte": "" + FromDate + "",
                                            "format": "yyyy-MM-dd"
                                        }
                                    }
                                }
                            ]
                        }
                    }
                })
            } else {
                if (EmailValues !== undefined && EmailValues !== "") {
                    HeadFilters = JSON.stringify({
                        "query": {
                            "bool": {
                                "filter": [
                                    {
                                        "multi_match": {
                                            "query": "" + EmailValues + "",
                                            "type": "phrase_prefix",
                                            "fields": [
                                                "emailId",
                                                "firstname"
                                            ],
                                            "operator": "or"
                                        }
                                    },
                                    {
                                        "range": {
                                            "createdDate": {
                                                "gte": "" + FromDate + "",
                                                "format": "yyyy-MM-dd"
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    })
                } else {
                    HeadFilters = JSON.stringify({
                        "query": {
                            "bool": {
                                "filter": [
                                    {
                                        "range": {
                                            "createdDate": {
                                                "gte": "" + FromDate + "",
                                                "format": "yyyy-MM-dd"
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    })
                }
            }
            tempcount = tempcount + 1;
            currentPageindex = 1;
        } else {
            if (EmailValues !== undefined && EmailValues === "") {
                HeadFilters = "";
            }
        }

        if (ToDate !== undefined && ToDate !== "") {
            if (tempcount === 0) {
                HeadFilters = JSON.stringify({
                    "query": {
                        "bool": {
                            "filter": [
                                {
                                    "range": {
                                        "createdDate": {
                                            "lte": "" + ToDate + "",
                                            "format": "yyyy-MM-dd"
                                        }
                                    }
                                }
                            ]
                        }
                    }
                })
            } else {
                if (FromDate !== undefined && FromDate !== "" && EmailValues !== undefined && EmailValues !== "") {
                    HeadFilters = JSON.stringify({
                        "query": {
                            "bool": {
                                "filter": [
                                    {
                                        "multi_match": {
                                            "query": "" + EmailValues + "",
                                            "type": "phrase_prefix",
                                            "fields": [
                                                "emailId",
                                                "firstname"
                                            ],
                                            "operator": "or"
                                        }
                                    },
                                    {
                                        "range": {
                                            "createdDate": {
                                                "gte": "" + FromDate + "",
                                                "lte": "" + ToDate + "",
                                                "format": "yyyy-MM-dd"
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    })
                } else if (FromDate !== undefined && FromDate !== "") {
                    HeadFilters = JSON.stringify({
                        "query": {
                            "bool": {
                                "filter": [
                                    {
                                        "range": {
                                            "createdDate": {
                                                "gte": "" + FromDate + "",
                                                "lte": "" + ToDate + "",
                                                "format": "yyyy-MM-dd"
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    })
                } else if (EmailValues !== undefined && EmailValues !== "") {
                    HeadFilters = JSON.stringify({
                        "query": {
                            "bool": {
                                "filter": [
                                    {
                                        "multi_match": {
                                            "query": "" + EmailValues + "",
                                            "type": "phrase_prefix",
                                            "fields": [
                                                "emailId",
                                                "firstname"
                                            ],
                                            "operator": "or"
                                        }
                                    },
                                    {
                                        "range": {
                                            "createdDate": {
                                                "lte": "" + ToDate + "",
                                                "format": "yyyy-MM-dd"
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    })
                }
            }
            currentPageindex = 1;
        } else {
            if (FromDate !== undefined && FromDate === "" && EmailValues !== undefined && EmailValues === "") {
                HeadFilters = "";
            }
        }
        this.setState({ DataFilters: DataFilters, HeadFilters: HeadFilters });
        let data = { currentPage: currentPageindex, totalPages: 0, pageLimit: GlobalPageLimit, DataFilters: DataFilters, HeadFilters: HeadFilters };
        this.getIndexData(data);
    }

    render() {
        let permissions = localStorage.permissions !== undefined? JSON.parse(localStorage.permissions):[];
        if(permissions.length === 0){
            return <Redirect to="/not-found" />;
        }else if(getUserPermision(permissions, PageKeys.suppliermanagement) === null)
        {
            return <Redirect to="/not-found" />;
        }
        const { allSuppliers, currentSuppliers, currentPage, totalPages } = this.state;
        const totalProducts = this.state.indexDataList;

        return (
            <div>
                <div className="" style={({ display: this.state.loading ? 'none' : 'block' })}>
                    <Aux>
                    {BreadCrumb([{ 'pageName': 'Supplier Listing', 'url': '/supplier-listing' }])}
                        <div className="supp_listing_body Pr_lisiting_container">
                            <div className="supp_list_filter ">
                                <h4>Supplier Listing</h4>
                                <div className="supp_listing_stat">
                                    <h6>Search Supplier</h6>
                                    <div className="sk-hits-stats">
                                        <div className="sk-hits-stats__info">{this.state.indexDataList} results found</div>
                                    </div>
                                </div>
                                <div className="Supplier_listing_filters">
                                    <GridContainer>
                                        <GridItem md={3} xs={12}>
                                            <Input id="FilterEmailID" elementType="input" label="Email Id/ Name" onKeyUp={(event) => this.onInputChanged(event)} ref={this.emailRef} />
                                        </GridItem>
                                        <GridItem md={3} xs={12}>
                                            <Input id="FilterSortID" elementType="select" label="Sort by name" value={this.state.value} SelectChange={this.onSelectChanged} ref={this.sortRef}
                                                elementConfig={{
                                                    options: [{ Id: 'firstname_raw.raw:asc', Value: "First Name asc" },
                                                    { Id: "firstname_raw.raw:desc", Value: "First Name desc" },
                                                    { Id: "companyname_raw.raw:asc", Value: "Company Name asc" },
                                                    { Id: "companyname_raw.raw:desc", Value: "Company Name desc" },
                                                    { Id: "listSupplierCountryMappingVM.countryname_raw.raw:asc", Value: "Country asc" },
                                                    { Id: "listSupplierCountryMappingVM.countryname_raw.raw:desc", Value: "Country desc" }]

                                                }} />
                                        </GridItem>
                                        <GridItem md={4} xs={12}>
                                            <label className="input_label custom_label">Date Filters</label>
                                            <div className="po_date_filter">
                                                <Datetime id="FilterFromDateID"
                                                    closeOnSelect={true}
                                                    timeFormat={false}
                                                    inputProps={{ placeholder: "From" }}
                                                    onChange={this.onFromdateChange}
                                                    id="startDate"
                                                    name="startDate"
                                                    ref={this.fromdateRef}
                                                    maxDate={new Date()}
                                                    isValidDate={disableFutureDt}
                                                // value={''}
                                                />
                                                <Datetime id="FilterToDateID"
                                                    closeOnSelect={true}
                                                    timeFormat={false}
                                                    inputProps={{ placeholder: "To" }}
                                                    onChange={this.onTodateChange}
                                                    id="EndDate"
                                                    name="EndDate"
                                                    ref={this.todateRef}
                                                    isValidDate={disableFutureDt}
                                                // value={''}
                                                />
                                            </div>
                                        </GridItem>
                                    </GridContainer>
                                </div>
                                <GridContainer>
                                    <GridItem md={12}>
                                        <List email={this.state.emailval} sort={this.state.selectedName} fromdate={this.state.FromDate} todate={this.state.ToDate} onClick={this.removeFilter}></List>
                                    </GridItem>


                                </GridContainer>
                            </div>
                            <GridContainer className="supp_list_container">
                                <GridItem>
                                    {currentSuppliers.hits.length > 0 ? this.SupplierList(currentSuppliers) : <div className="sk-no-hits"><div className="sk-no-hits__info">No Records Found.</div></div>}

                                </GridItem>
                                <GridItem>
                                    {this.state.indexDataList !== 0 && this.state.indexDataList > 0 ?
                                        <GridContainer className="pagi_container" justify="center">
                                            <GridItem>
                                                <Pagination onRef={ref => (this.child = ref)} totalRecords={totalProducts} pageLimit={GlobalPageLimit} pageNeighbours={1} DataFilters={this.state.DataFilters} HeadFilters={this.state.HeadFilters} onPageChanged={this.getIndexData} />
                                            </GridItem>
                                        </GridContainer> : ""}
                                </GridItem>
                            </GridContainer>
                        </div>
                    </Aux>
                </div>
                <div style={({ display: this.state.loading ? 'block' : 'none' })}>
                    <Spinner />
                </div>
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        userType: state.login.userType,
    };
}
export default connect(mapStateToProps)(SupplierDetailsListing);