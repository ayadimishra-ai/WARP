import axios from 'axios';
import React, { Component } from 'react';
import Typed from "react-typed";
import { getServiceUrl, getWebsiteUrl } from '../../config';
import * as RoleCodes from "../../rolecodes";
import SLISearch from '../DashBoard/slisearchshoppage';

const awsUrl = getWebsiteUrl();

let Updatecount = 0;

class CategoryBannerSlider extends Component {
    constructor(props) {
        super(props)
        this.state = {
            loading: false,
            CategoryImages: []
        }
    }
    getCategoryBannerImages() {
        let Category = [];
        if (this.props.BuyerProductCategories.length > 0) {
            Category = this.props.BuyerProductCategories;
        }

        var config = {
            headers: {
                'Authorization': 'Bearer ' + localStorage.tokenId,
                'Content-Type': 'application/json',
                'CommodityNames': JSON.parse(localStorage.commodityName).map(x => x.commodityName),
                'CategoryNames': Category
            },
        };
        axios.get(getServiceUrl() + 'Category/GetCategoryImages', config)
            .then((response) => {
                if (response.data !== null) {
                    if (response.data.table1.length > 0) {
                        this.setState({
                            CategoryImages: response.data.table1, loading: false
                        });
                    }
                }
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }
    componentDidMount() {
        this.setState({ loading: true })
        this.getCategoryBannerImages();
    }

    // componentDidUpdate() {
    //     let Category = this.props.BuyerProductCategories;

    //     if (Category !== undefined && Category.length > 0 && Updatecount === 0) {
    //         Updatecount = 1;
    //         this.getCategoryBannerImages();
    //     }

    //     if (Category !== undefined && Category.length === 0 && Updatecount === 1) {
    //         Updatecount = 0;
    //     }
    // }

    updatewhishlist = () => {
        const { updatewhishlist = f => f } = this.props;
        // this.forceUpdate();
        updatewhishlist();
    }

    render() {
            var settings = {
            dots: true,
            infinite: false,
            speed: 500,
            slidesToShow: 1,
            slidesToScroll: 1,
            autoplay: true,
            autoplaySpeed: 3000,
            infinite: false,
            speed: 1000
        };
        return (
            <React.Fragment>
                {/* {this.state.CategoryImages.length > 0 ? */}
                <div className="category_slider_banner">
                    <img alt=" " src={awsUrl + "shop_banner.jpg"} />
                    <div className="banner_text">
                        <div className="banner_heading">
                            Enabling Sustainable Commerce
                            <span className="bansub_head">For</span>
                            <div className="typed_text">
                                <Typed
                                    strings={["YOUR BUSINESS", "YOUR SUPPLY CHAIN", "YOUR PLANET", "YOU"]}
                                    typeSpeed={40}
                                    backSpeed={50}
                                    loop
                                />
                            </div>
                        </div>
                        {(JSON.parse(localStorage.userType) === RoleCodes.BUYER) ?
                            <div className="bansearch_cont">
                                <div className="bansrch_btns">
                                    <a className="active">Buy</a>
                                    {/* <a>Consult</a> */}
                                </div>
                                {/* <div className="bannersrch_form">
                                    <Input elementType='input_2' class= "newInput_2" elementConfig={{placeholder: "Search Commodities, Product , Material"}}/>
                                    <Button>Submit</Button>
                                </div>
                                 */}
                                <SLISearch updatewhishlist={this.updatewhishlist} isSliSearchEnabled={this.props.isSliSearchEnabled}></SLISearch>
                            </div> : ""
                        }

                        {/* <Slider {...settings}>
                                {
                                    localStorage.getItem('emailId') === 'user@somersetinduscap.com' || 
                                    localStorage.getItem('emailId') === 'nakul@fireside.com' || 
                                    localStorage.getItem('emailId') === 'user@company1.com' || 
                                    localStorage.getItem('emailId') === 'user@company2.com'||
                                    localStorage.getItem('emailId') === 'user@company3.com' ? <img alt=" " src={require("../../assets/img/shopPageBanner.jpg")}/> :
                                    this.state.CategoryImages.map(item =>
                                        <img alt=" " src={awsUrl + "CategoryImages/CategoryBannerImages/" + item.categoryImage} />
                                        
                                )}
                                
                            </Slider> */}
                    </div>
                    {/* <div style={{ display: this.state.loading ? "block" : "none" }}>
                        <Spinner />
                    </div> */}
                </div>
            </React.Fragment>
        )
    }
}
export default CategoryBannerSlider