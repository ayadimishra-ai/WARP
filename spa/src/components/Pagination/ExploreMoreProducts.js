import React, { Component, Fragment } from 'react';
import Button from "../../UI/Button/MaterialButton";
import Spinner from "../../UI/Spinner/Spinner";

const paginationData = {

};
class ExploreMoreProducts extends Component {
    constructor(props) {
        super(props);

    }
    render() {
        let loadingButton = this.props.loading;
        if (this.props.currentCommodity == this.props.commodityName) {
            loadingButton = loadingButton;
        }
        else {
            loadingButton = false;
        }
        let buttonText = 'Explore ' + this.props.commodityName;
        return (
            <Fragment>
                <div className="sk-pagination-navigation is-numbered exploreprodbtn_cont">
                    {
                        loadingButton ? <div className="text-center">
                            <Button className='solid_btn_new' onClick={this.props.clicked}><Spinner /></Button>
                        </div> :
                            <div className="text-center">
                                <Button className='solid_btn_new' onClick={this.props.clicked}>{buttonText}</Button>
                            </div>
                    }
                </div>
            </Fragment>
        );
    }
}
export default ExploreMoreProducts;