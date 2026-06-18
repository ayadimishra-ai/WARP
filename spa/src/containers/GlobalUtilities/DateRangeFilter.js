import React, { Component } from 'react'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker-cssmodules.css";
import 'react-datepicker/dist/react-datepicker.css';
import {formatDate} from '../../utility';

class DateRangeFilter extends Component {

  constructor (props) {
    super(props)
    this.state = {
      startDate: null,
      endDate: null
    }
  }

  handleChangeStart = (event) => {
    this.setState({
      startDate: event
    }, this.updateSearch)
  }

  handleChangeEnd = (event) => {
    this.setState({
      endDate: event
    }, this.updateSearch)
  }

  clearDate = () => {
    this.setState({startDate:null})
    this.setState({endDate:null})
  }

  updateSearch = () => {
    const { startDate, endDate } = this.state
    const { onFinished } = this.props

    if (!startDate || !endDate) {
      return
    }

    onFinished({
      min: formatDate(startDate),
      max: formatDate(endDate),
    })
  }

  isBeforeStartDate = (date) => {
    if (!this.state.startDate) {
      return true
    }

    return this.state.startDate <= date
  }

  isAfterEndDate = (date) => {
    if (!this.state.endDate) {
      return true
    }

    return date <= this.state.endDate
  }

  render () {
    return (<div className="date-filter">
      <DatePicker
        className="sk-input-filter"
        placeholderText="From"      
        filterDate={this.isAfterEndDate}       
        selected={this.state.startDate}
        // startDate={this.state.startDate}
        // endDate={this.state.endDate}
        onChange={this.handleChangeStart} 
        />
      <DatePicker
        className="sk-input-filter"
        placeholderText="To"       
        filterDate={this.isBeforeStartDate}      
        selected={this.state.endDate}
        // startDate={this.state.startDate}
        // endDate={this.state.endDate}
        onChange={this.handleChangeEnd} 
        />
        <button className="hidden_clearDate_btn" onClick={this.clearDate}>clear date</button>
    </div>)
  }
}

export default DateRangeFilter
