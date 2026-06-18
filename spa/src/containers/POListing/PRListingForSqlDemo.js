import React, { Component } from 'react';
import Aux from '../../hoc/Auxx';
import { connect } from 'react-redux';
import axios from 'axios';
import { getServiceUrl } from '../../config';
import Button from '../../UI/Button/MaterialButton';
import DatePicker from 'react-datepicker';
import moment from "moment";

class PRListingForSqlDemo extends Component {

  state = {
    orders: [],
    total: null,
    per_page: 10,
    current_page: 1,
    searchtext:'',
    startDate:null,
    endDate:null
  }

  componentDidMount() {
    this.makeHttpRequestWithPage(1);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.setState({searchtext: event.target.value});
  }

  handleChangeStart = (event) => {
    this.setState({
      startDate: event
    })
  }

  handleChangeEnd = (event) => {
    this.setState({
      endDate: event
    })
  }

  makeHttpRequestWithPage = async pageNumber => {
    var config = {
      headers: {
        "Authorization": "Bearer " + localStorage.tokenId,
        'Content-Type': 'application/json',
        "pageNo": pageNumber,
        "pageSize": 10,
        "searchKeyword": this.state.searchtext,
        "sortBy": "",
        "startDate":(this.state.startDate===undefined?"":moment.utc(this.state.startDate)),
        "endDate":(this.state.endDate===undefined?"":moment.utc(this.state.endDate)),
      }
    };
    axios.get(getServiceUrl() + 'Order/GetPRListingForSqlDemo', config)
      .then((json) => {
        if (json.data.listPRListingElasticVM.length >= 1) {
          this.setState({
            orders: json.data.listPRListingElasticVM,
            total: json.data.total,
            per_page: 10,
            current_page: 1
          });
        }
        else {
          alert("No Records Found.");
          this.setState({
            orders: [],
            total: null,
            per_page: 10,
            current_page: 1
          });
        }

      }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname='/' : '' : '');
  }

  resetHandler(event) {
    this.setState({
      orders: [],
      total: null,
      per_page: 10,
      current_page: 1,
      searchtext:'',
      startDate:null,
      endDate:null
    });

    var config = {
      headers: {
        "Authorization": "Bearer " + localStorage.tokenId,
        'Content-Type': 'application/json',
        "pageNo": 1,
        "pageSize": 10,
        "searchKeyword": '',
        "sortBy": ""
      }
    };
    axios.get(getServiceUrl() + 'Order/GetPRListingForSqlDemo', config)
      .then((json) => {
        if (json.data.listPRListingElasticVM.length >= 1) {
          this.setState({
            orders: json.data.listPRListingElasticVM,
            total: json.data.total,
            per_page: 10,
            current_page: 1
          });
        }
        else {
          alert("No Records Found.");
          this.setState({
            orders: [],
            total: null,
            per_page: 10,
            current_page: 1
          });
        }

      }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname='/' : '' : '');

    event.preventDefault();
  }
  

  searchHandler(event) {
    var config = {
      headers: {
        "Authorization": "Bearer " + localStorage.tokenId,
        'Content-Type': 'application/json',
        "pageNo": 1,
        "pageSize": 10,
        "searchKeyword": this.state.searchtext,
        "sortBy": "",
        "startDate":(this.state.startDate===undefined?"":moment(this.state.startDate).format()),
        "endDate":(this.state.endDate===undefined?"":moment(this.state.endDate).format()),
      }
    };
    axios.get(getServiceUrl() + 'Order/GetPRListingForSqlDemo', config)
      .then((json) => {
        if (json.data.listPRListingElasticVM.length >= 1) {
          this.setState({
            orders: json.data.listPRListingElasticVM,
            total: json.data.total,
            per_page: 10,
            current_page: 1
          });
        }
        else {
          alert("No Records Found.");
          this.setState({
            orders: [],
            total: null,
            per_page: 10,
            current_page: 1
          });
        }

      }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname='/' : '' : '');

    event.preventDefault();
  }

  render() {
    let orders, renderPageNumbers;
    if (this.state.orders !== null) {
      orders = this.state.orders.map(order => (
        <tr>
          <td>{order.orderId}</td>
          <td>{order.prNumber}</td>
          <td>
            {order.listOrderProductVM.map(item => (
              <div>{item.productName}</div>
            ))}
          </td>
          <td>
            {order.listOrderCompanyVM.map(item => (
              <div>{item.companyName}</div>
            ))}
          </td>
          <td>{order.createdDate}</td>
          <td>{order.statusName}</td>
          <td>
            {order.listOrderPOVM.map(item => (
              <div>{item.poNumber}</div>
            ))}
          </td>
        </tr>
      ));
    }

    const pageNumbers = [];
    if (this.state.total !== null) {
      for (let i = 1; i <= Math.ceil(this.state.total / this.state.per_page); i++) {
        pageNumbers.push(i);
      }


      renderPageNumbers = pageNumbers.map(number => {
        return (
          <span key={number} onClick={() => this.makeHttpRequestWithPage(number)}>{number}</span>
        );
      });
    }

    return (
      <Aux>
        <div className="prlistingDemoCont">
          <h5>Purchase Request</h5>
        <div>
          <div className="filters">
            <ul>
              <li>
                <input type="text" value={this.state.value} onChange={this.handleChange} placeholder="Search by products, supplier, PR#, PO#..." />
              </li>
              <li>
                  {/* <DateRangeFilter/> */}
                  <DatePicker
                  //className="sk-input-filter"
                  placeholderText="From"      
                  //filterDate={this.isAfterEndDate}       
                  selected={this.state.startDate}
                  // startDate={this.state.startDate}
                  // endDate={this.state.endDate}
                  onChange={this.handleChangeStart}
                  />
                <DatePicker
                  //className="sk-input-filter"
                  placeholderText="To"       
                  //filterDate={this.isBeforeStartDate}      
                  selected={this.state.endDate}
                  // startDate={this.state.startDate}
                  // endDate={this.state.endDate}
                  onChange={this.handleChangeEnd} 
                  />
              </li>
              <li>
              <Button
                                color="greenBtn" round
                                btnType="btnDefault"
                                onClick={(event) => this.searchHandler(event)}>
                                Search
                            </Button>
              <Button
                                color="greenBtn" round
                                btnType="btnDefault"
                                onClick={(event) => this.resetHandler(event)}>
                                Reset
                            </Button>
              </li>
            </ul>
          </div>
        </div>
        <div>

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>PR</th>
                <th>Order Details</th>
                <th>Supplier Name</th>
                <th>Raised On</th>
                <th>Status</th>
                <th>PO</th>
              </tr>
            </thead>
            <tbody>
              {orders}
            </tbody>
          </table>


          <div className="prlistdemoPagin">
            <span onClick={() => this.makeHttpRequestWithPage(1)}>&laquo;</span>
            {renderPageNumbers}
            <span onClick={() => this.makeHttpRequestWithPage(1)}>&raquo;</span>
          </div>

        </div>
        </div>
      </Aux>
    );
  }
}

const mapStateToProps = state => {
  return {
    userType: state.login.userType,
    permissions: state.login.permissions
  };
}
export default connect(mapStateToProps)(PRListingForSqlDemo);