import withStyles from "@material-ui/core/styles/withStyles";
import React, { Component } from 'react';
import ReactReadMoreReadLess from "react-read-more-read-less";
import javascriptStyles from "../../assets/jss/material-kit-pro-react/views/componentsSections/javascriptStyles";
import { getLabelText } from '../../config';


class ProductDetailTab extends Component {
    constructor(props) {
        super(props)
        this.state = { divShow: false, btnShow: true, viewLess: false };
        this.viewHandler = this.viewHandler.bind(this)
    }

    componentDidMount() {
        // let ht = document.querySelector('.product_details_right_container .product_description .desccontentp p').scrollHeight;
        // let hh = document.querySelector('.scrolled_content .product_description .desccontentp p').scrollHeight;
        // let pt = document.querySelector('.product_details_right_container .product_description').scrollHeight;
        // let pp = document.querySelector('.scrolled_content .product_description').scrollHeight;
        // this.timeout = setTimeout(() => {
        //     if (hh < ht) {
        //         document.querySelectorAll('.proddet_viewmore')[0].style.display = 'none';
        //     }
        //     if (hh <= 69 || pp < 115) {
        //         document.querySelectorAll('.proddet_viewmore')[1].style.display = 'none';
        //     }
        // }, 500);
    }

    componentWillUnmount() {
        clearTimeout(this.timeout);
    }

    viewHandler() {
        this.setState({ viewLess: !this.state.viewLess })
    }
    render() {
        const Resources = this.props.Resources;
        // const { divShow } = this.state;
        // const { btnShow } = this.state;

        return (
            <>
                <div className="detpageprodesc_cont">
                    <div className="product_description">
                        {this.props.page !== 'compare' ?
                            this.props.ShowHeading === false ? '' : <h5>{getLabelText(Resources.filter(x => { return x.resourceKey === "Description"; })[0], "Description")}</h5> : ""}
                        {this.props.page === 'details_tabs' ?  <div className="desccontentp">
                            {this.props.Description && <p>{this.props.Description}</p>}
                            {this.props.FurtherDescription && <p>{this.props.FurtherDescription}</p>}
                        </div> : <ReactReadMoreReadLess
                            charLimit={180}
                            readMoreText={"..."}
                            readLessText={"..."}
                            readMoreClassName="read-more-less--more"
                            readLessClassName="read-more-less--less"
                        >
                            {this.props.Description + ' ' + this.props.FurtherDescription}

                        </ReactReadMoreReadLess>}

                    </div>

                </div>
            </>
        )
    }
}

export default withStyles(javascriptStyles)(ProductDetailTab);