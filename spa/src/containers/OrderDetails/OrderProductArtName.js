import React, { Component } from "react";
import Button from "../../UI/Button/MaterialButton";
import { getAWSUrl } from '../../config'

const awsUrl = getAWSUrl("");

class OrderProductArtName extends Component {
    constructor(props) {
        super(props);
        this.state = {
            openArtwork: false,
            showArtwork: false
        }
    }
    openArtwork = () => {
        this.setState({ openArtwork: true });
    };
    closeArtwork = () => {
        this.setState({ openArtwork: false });
    };

    componentDidMount() {
        this.props.OrderArtworkData.map(data => {
            if (data.orderDetailsGuid === this.props.OrderDetailsGuid)
                this.setState({
                    showArtwork: true
                })
        })
    }
    render() {
        let URL = null;

        return (
            <React.Fragment>
                <div className="select_artwork_popup_div" style={{ display: this.state.showArtwork === true ? "block" : "none" }}>
                    <a><h5 style={{ cursor: "pointer" }} onClick={this.openArtwork}>View</h5></a>
                    <div className="select_artwork_popup"
                        style={{ height: this.state.openArtwork === true ? "225px" : "0" }}>
                        <div className="artwork_list_parent">
                            {this.props.OrderArtworkData !== null ? this.props.OrderArtworkData.map((data, item) => (
                                URL = data.artworkImageName.substr(data.artworkImageName.lastIndexOf(".") + 1) === "pdf"
                                    ? awsUrl +
                                    "ProductArtworkFiles/OrderArtWork/Pdf.png" : awsUrl +
                                    "ProductArtworkFiles/OrderArtWork/" +
                                    data.orderDetailsGuid
                                    + "/" + data.artworkImageName,
                                <div className="artwork_list"><a target="_blank"
                                    href={URL}>
                                    <img
                                        alt=""
                                        src={URL}
                                        onClick={this.openWindow}
                                        onError={e => {
                                            e.target.onerror = null;
                                            e.target.src =
                                                awsUrl +
                                                "ProductArtworkFiles/" +
                                                "default.jpg";
                                        }}
                                    /></a></div>)) : "Not Applicable"}
                        </div>
                        <Button onClick={this.closeArtwork} simple>CLOSE</Button>
                    </div>
                </div>
                <div style={{ display: this.state.showArtwork === false ? "block" : "none" }}>
{/*                    <h5>NA</h5>*/}
                    Not Applicable
                </div>
            </React.Fragment>
        )
    }
}

export default (OrderProductArtName)