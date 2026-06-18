import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { getLabelText } from '../../config';

class RecentlyBought extends Component {
    render() {
        return (
            this.props.RecentlyBoughtProducts.length > 0 ? <React.Fragment>
                <p>{getLabelText(this.props.LanguageResources.filter((x) => { return x.resourceKey === 'recentlyboughtproducts' })[0], "Bought by")}</p>
                <h6><Link to="#"
                    onClick={(event) => { event.preventDefault(); this.props.RecentlyBoughtProductScroll() }}>
                    {this.props.RecentlyBoughtProducts.length} </Link></h6>
                    {/* {this.props.RecentlyBoughtProducts.length > 1 ? " users" : " user"} */}

            </React.Fragment> : ""
        )
    }
}
export default (RecentlyBought);