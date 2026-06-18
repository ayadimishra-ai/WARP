import React, { Component } from 'react';
import { getWebsiteUrl } from '../../config';

import ShopServiceBg from "../../assets/img/shopservice_bg.jpg";

const awsUrl = getWebsiteUrl();

let Updatecount = 0;
 
class Partners extends Component {
    constructor(props) {
        super(props)
        this.state = {
            loading: false,
            CategoryImages: []
        }
    }
    
    componentDidMount() {
        this.setState({ loading: true })
    }

    

    render() {
        
        return (
            <React.Fragment>
                <div className="ourservvshop_sec">
                    <img alt="" src={ShopServiceBg} />
                    <div className="oursrvshop_content">
                        <div className="section_heading">
                            Our services towards creating<br/> <span>sustainable</span> supply chain<br/> network marketplace
                        </div>
                        <p>Lorem cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.n proident, sunt
                        <a className="knowmore_btn">know more</a></p>
                    </div>
                </div>
            </React.Fragment>
        )
    }
}
export default Partners