import React, { Component } from "react";
import { getAWSUrl } from '../../config';

const awsUrl = getAWSUrl("");

class BasketArtworkInFreightOption extends Component {
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
        this.props.ArtworkData.map(data => {
            if (data.basketGuid === this.props.BasketGuid)
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
                    {/* <span style={{ cursor: "pointer" }} onClick={this.openArtwork}>View</span> */}
                    <div className="select_artwork_popup selected_artwork"
                        style={{ height: "100px"}}>
                        <div className="artwork_list_parent">
                            {this.props.ArtworkData !== null && this.props.ArtworkData !== undefined ?
                                this.props.ArtworkData.filter(x => x.basketGuid === this.props.BasketGuid).map((data, item) => (
                                    URL = data.artworkImageName === undefined ? "NA" : data.artworkImageName.substr(data.artworkImageName.lastIndexOf(".") + 1) === "pdf"
                                        ? awsUrl +
                                        "ProductArtworkFiles/Pdf.png" : awsUrl +
                                        "ProductArtworkFiles/" +
                                        data.artworkImageName,
                                    <div className="artwork_list"><a target="_blank"
                                        href={URL}>
                                        <img
                                            src={URL}
                                            onClick={this.openWindow}
                                            onError={e => {
                                                e.target.onerror = null;
                                                e.target.src =
                                                    awsUrl +
                                                    "ProductArtworkFiles/" +
                                                    "default.jpg";
                                            }}
                                        /></a></div>)) : "NA"}
                        </div>
                        {/* <Button onClick={this.closeArtwork} simple>CLOSE</Button> */}
                    </div>
                </div>
                <div style={{ display: this.state.showArtwork === false ? "block" : "none" }}>
                    <span>NA</span>
                </div>
            </React.Fragment>
        )
    }
}

export default (BasketArtworkInFreightOption)