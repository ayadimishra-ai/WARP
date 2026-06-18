import React, { Component } from 'react';
import Slider from "react-slick";
import Spinner from '../../UI/Spinner/Spinner';
import { getLabelText } from '../../config';

class RecenltyBoughtUsersCarousel extends Component {
    render() {
        var settings = {
            dots: true,
            infinite: false,
            speed: 500,
            slidesToShow: 8,
            slidesToScroll: 1,
            responsive: [
                {
                    breakpoint: 1024,
                    settings: {
                        slidesToShow: 6,
                        slidesToScroll: 6,
                    }
                },
                {
                    breakpoint: 600,
                    settings: {
                        slidesToShow: 2,
                        slidesToScroll: 2,
                        initialSlide: 2
                    }
                },
                {
                    breakpoint: 480,
                    settings: {
                        slidesToShow: 3,
                        slidesToScroll: 3
                    }
                }
            ]
        };
        return (
            this.props.RecentlyBoughtProducts.length > 0 ?
                <React.Fragment>
                    <h4>{getLabelText(this.props.LanguageResources.filter((x) => { return x.resourceKey === 'recentlyboughtproducts' })[0], "Recently Bought By")}</h4>
                    <div className="users_list">
                        <Slider {...settings}>
                            {this.props.RecentlyBoughtProducts !== undefined ? this.props.RecentlyBoughtProducts.map(data => (
                                <div className="userOffline_parent">
                                    <div className="userOffline">
                                        <span className="users_listNameShort">{data.userInitial}</span>
                                    </div>
                                    <span className="users_listName">{data.userName}</span>
                                    {/* <span className="likelytoBuy_commitment_given">(120)</span> */}
                                </div>
                            )) : <Spinner />}
                        </ Slider>
                    </div>
                </React.Fragment> : ""
        )
    }
}
export default RecenltyBoughtUsersCarousel