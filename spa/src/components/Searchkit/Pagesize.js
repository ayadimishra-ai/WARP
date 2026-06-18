import React, { Component } from "react";
import { connect } from "react-redux";
import { PageSizeSelector, Toggle } from "searchkit";
class Pagesize extends Component {
  render() {
    return (
      <React.Fragment>
        <span className="pageSize">
          <span className="items_per_page">Items per page</span>
          <PageSizeSelector options={[16, 32, 64, 128]} listComponent={Toggle} />
        </span>
      </React.Fragment>
    );
  }
}
const mapStateToProps = state => {
  return {
    userType: state.login.userType
  };
};
export default connect(mapStateToProps)(Pagesize);
