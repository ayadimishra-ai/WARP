import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import Left from '@material-ui/icons/ChevronLeft';
import Right from '@material-ui/icons/ChevronRight';
const LEFT_PAGE = 'LEFT';
const RIGHT_PAGE = 'RIGHT';
// let CurrentP = 1;
/**
 * Helper method for creating a range of numbers
 * range(1, 5) => [1, 2, 3, 4, 5]
 */
const range = (from, to, step = 1) => {
  let i = from;
  const range = [];
  while (i <= to) {
    range.push(i);
    i += step;
  }
  return range;
}
class Pagination extends Component {
  constructor(props) {
    super(props);
    const { totalRecords = null, pageLimit = 10, pageNeighbours = 0, DataFilters = '', HeadFilters = '' } = props;
    this.pageLimit = typeof pageLimit === 'number' ? pageLimit : 10;
    this.totalRecords = typeof totalRecords === 'number' ? totalRecords : 0;
    // pageNeighbours can be: 0, 1 or 2
    this.pageNeighbours = typeof pageNeighbours === 'number'
      ? Math.max(0, Math.min(pageNeighbours, 2))
      : 0;
    this.totalPages = Math.ceil(this.totalRecords / this.pageLimit);
    this.state = { currentPage: 1 };
    this.DataFilters = typeof DataFilters === 'string' ? DataFilters : '';
    this.HeadFilters = typeof HeadFilters === 'string' ? HeadFilters : '';
  }
  componentDidMount() {
    this.props.onRef(this)
    this.gotoPage(1);
  }
  componentWillUnmount() {
    this.props.onRef(undefined)
  }
  method() {
    this.gotoPage(1);
  }
  componentDidUpdate() {
    const totalRecords = this.props.totalRecords, pageLimit = this.props.pageLimit,
      pageNeighbours = this.props.pageNeighbours,
      DataFilters = this.props.DataFilters, HeadFilters = this.props.HeadFilters;
    let tempcount = false;
    if (this.totalRecords !== totalRecords) {
      tempcount = true;
    } else {
      tempcount = false;
    }
    this.pageLimit = typeof pageLimit === 'number' ? pageLimit : 10;
    this.totalRecords = typeof totalRecords === 'number' ? totalRecords : 0;
    // pageNeighbours can be: 0, 1 or 2
    this.pageNeighbours = typeof pageNeighbours === 'number'
      ? Math.max(0, Math.min(pageNeighbours, 2))
      : 0;
    this.totalPages = Math.ceil(this.totalRecords / this.pageLimit);
    // this.state = { currentPage: 1 };
    this.DataFilters = typeof DataFilters === 'string' ? DataFilters : '';
    this.HeadFilters = typeof HeadFilters === 'string' ? HeadFilters : '';
    // this.gotoPage(1);
    this.fetchPageNumbers();

    if (tempcount) {
      this.gotoPage(1);
    }
  }

  fetchPageNumbers = () => {
    const totalPages = this.totalPages;
    const currentPage = this.state.currentPage;
    const pageNeighbours = this.pageNeighbours;
    /**
     * totalNumbers: the total page numbers to show on the control
     * totalBlocks: totalNumbers + 2 to cover for the left(<) and right(>) controls
     */
    const totalNumbers = (this.pageNeighbours * 2) + 3;
    const totalBlocks = totalNumbers + 2;
    if (totalPages > totalBlocks) {
      const startPage = Math.max(2, currentPage - pageNeighbours);
      const endPage = Math.min(totalPages - 1, currentPage + pageNeighbours);
      let pages = range(startPage, endPage);
      /**
       * hasLeftSpill: has hidden pages to the left
       * hasRightSpill: has hidden pages to the right
       * spillOffset: number of hidden pages either to the left or to the right
       */
      const hasLeftSpill = startPage > 2;
      const hasRightSpill = (totalPages - endPage) > 1;
      const spillOffset = totalNumbers - (pages.length + 1);
      switch (true) {
        // handle: (1) < {5 6} [7] {8 9} (10)
        case (hasLeftSpill && !hasRightSpill): {
          const extraPages = range(startPage - spillOffset, startPage - 1);
          pages = [LEFT_PAGE, ...extraPages, ...pages];
          break;
        }
        // handle: (1) {2 3} [4] {5 6} > (10)
        case (!hasLeftSpill && hasRightSpill): {
          const extraPages = range(endPage + 1, endPage + spillOffset);
          pages = [...pages, ...extraPages, RIGHT_PAGE];
          break;
        }
        // handle: (1) < {4 5} [6] {7 8} > (10)
        case (hasLeftSpill && hasRightSpill):
        default: {
          pages = [LEFT_PAGE, ...pages, RIGHT_PAGE];
          break;
        }
      }
      return [1, ...pages, totalPages];
    }
    return range(1, totalPages);
  }
  gotoPage = page => {
    const { onPageChanged = f => f } = this.props;
    //const currentPage = Math.max(0, Math.min(page, this.totalPages));
    const currentPage1 = Math.max(0, Math.min(page, this.totalPages));
    //const currentPage = this.props.isBackClick ? this.props.prevCurrentPage : currentPage1;
    const currentPage = (this.props.isBackClick && page === 1) ? this.props.prevCurrentPage : currentPage1;
    const paginationData = {
      //currentPage,
      currentPage: currentPage,
      totalPages: this.totalPages,
      pageLimit: this.pageLimit,
      totalRecords: this.totalRecords,
      DataFilters: this.DataFilters,
      HeadFilters: this.HeadFilters
    };
    this.setState({ currentPage }, () => onPageChanged(paginationData));
  }
  handleClick = page => evt => {
    evt.preventDefault();
    this.gotoPage(page);
  }
  handleMoveLeft = evt => {
    evt.preventDefault();
    // this.gotoPage(this.state.currentPage - (this.pageNeighbours * 2) - 1);
    this.gotoPage(this.state.currentPage - 1);
  }
  handleMoveRight = evt => {
    evt.preventDefault();
    // this.gotoPage(this.state.currentPage + (this.pageNeighbours * 2) + 1);
    this.gotoPage(this.state.currentPage + 1);
  }
  render() {
    if (!this.totalRecords || this.totalPages === 1) return null;
    const { currentPage } = this.state;
    const pages = this.fetchPageNumbers();
    return (
      <Fragment>
        <div className="pagination_parent">
          <div data-qa="options" className="pagination_parent_in">
            {pages.map((page, index) => {
              if (page === LEFT_PAGE) return (
                <div className="pagination_prev" >
                  <div className="prev_btn" onClick={this.handleMoveLeft}>
                    <Left />
                  </div>
                </div>
              );
              if (page === RIGHT_PAGE) return (
                <div className="pagination_next" >
                  <div className="next_btn" onClick={this.handleMoveRight}>
                    <Right />
                  </div>
                </div>
              );
              return (
                // <li key={index} className={`page-item${currentPage === page ? ' active' : ''}`}>
                //   <a className="page-link" href="#" onClick={this.handleClick(page)}>{page}</a>
                // </li>
                <div key={index} className={`page-item${currentPage === page ? ' active_page_pagination' : ' main_pagination'}`}>
                  <div data-qa="label" className="main_pagination_inner" onClick={this.handleClick(page)}>{page}</div>
                </div>
              );
            })}
          </div>
        </div>
      </Fragment>
    );
  }
}
Pagination.propTypes = {
  totalRecords: PropTypes.number.isRequired,
  pageLimit: PropTypes.number,
  pageNeighbours: PropTypes.number,
  onPageChanged: PropTypes.func
};
export default Pagination;