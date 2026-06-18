import { PowerBIEmbed } from "powerbi-client-react";
import React, { Component, createRef } from "react";
import Spinner from "../../UI/Spinner/Spinner";

class PowerBiReportIframe extends Component {
  containerRef = createRef();

  constructor(props) {
    super(props);
    this.state = {
      currentHeight: 0,
    };
  }

  componentDidMount() {
    this.updateHeight();
    window.addEventListener("resize", this.updateHeight);
  }

  componentDidUpdate(prevProps) {
    // If props change, update height calculation
    if (prevProps !== this.props) {
      this.updateHeight();
    }
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateHeight);
  }

  updateHeight = () => {
    if (this.containerRef.current) {
      const iframeWidth = this.containerRef.current.offsetWidth;
      const newHeight = this.calculateHeight(iframeWidth);
      // console.log("iframeWidth", iframeWidth);
      this.setState({ currentHeight: newHeight });
    }
  };

  calculateHeight = (iframeWidth) => {
    const baseHeight = this.props.iframeHeight || 1500;
    const prototypeWidth = 1775;
    const staticLinkActive =
      this.props.staticLink && this.props.isPowerBiReport;

    const fixedBottom = staticLinkActive ? 70 : 0;
    const scalableHeight = baseHeight - fixedBottom;

    if (iframeWidth >= prototypeWidth) {
      return baseHeight;
    }

    const scaleFactor = iframeWidth / prototypeWidth;
    let scaledHeight = Math.round(scalableHeight * scaleFactor) + fixedBottom;

    // Additional watermark height addition
    if (!this.props.isPowerBiReport) {
      if (iframeWidth > 1600) {
        scaledHeight += this.props.lsTabs ? 6 : 3;
      } else if (iframeWidth > 1450) {
        scaledHeight += this.props.lsTabs ? 10 : 5;
      } else if (iframeWidth > 1300) {
        scaledHeight += this.props.lsTabs ? 25 : 7;
      } else if (iframeWidth > 1150) {
        scaledHeight += this.props.lsTabs ? 29 : 11;
      } else if (iframeWidth > 960) {
        scaledHeight += this.props.lsTabs ? 38 : 15;
      } else if (iframeWidth > 860) {
        scaledHeight += this.props.lsTabs ? 45 : 16;
      } else if (iframeWidth > 760) {
        scaledHeight += this.props.lsTabs ? 50 : 17;
      } else if (iframeWidth > 661) {
        scaledHeight += this.props.lsTabs ? 55 : 18;
      } else if (iframeWidth > 560) {
        scaledHeight += this.props.lsTabs ? 60 : 19;
      } else {
        scaledHeight += this.props.lsTabs ? 65 : 20;
      }
    }
    return scaledHeight;
  };

  render() {
    const {
      embedConfig,
      cssClassName = "default-class",
      withBorder,
      staticLink,
      title,
      onLoad,
      loader,
      isPowerBiReport,
    } = this.props;
    const { currentHeight } = this.state;

    return (
      <div ref={this.containerRef} className="powerBiContainer">
        {loader && (
          <div
            style={{
              display: loader ? "block" : "none",
              position: "absolute",
              width: "100%",
              height: "100vh",
              background: "#fff",
            }}
          >
            <Spinner />
          </div>
        )}
        {isPowerBiReport ? (
          <div
            className="powerBiPagination"
            style={{
              borderTop: withBorder ? "1px solid #E6E6E6" : "none",
              height: staticLink ? "70px" : "1.2vw",
              display: "block",
              background: " #F7F9FB",
              width: "100%",
              position: "absolute",
              bottom: 0,
              left: 0,
            }}
          />
        ) : (
          <div
            className="LSWaterMark"
            style={{
              background: "#F7F9FB",
              width: "100%",
              position: "absolute",
              bottom: 0,
              borderTop: withBorder ? "1px solid #E6E6E6" : "none",
              height: 28,
            }}
          />
        )}
        {staticLink ? (
          <div className={cssClassName}>
            <iframe
              loading="eager"
              title={title || "Power Bi Dashboard"}
              width={"100%"}
              src={embedConfig}
              onLoad={onLoad}
              allowFullscreen
            />
          </div>
        ) : (
          <PowerBIEmbed embedConfig={embedConfig} cssClassName={cssClassName} />
        )}
        <style>{`
              .${cssClassName} iframe {
                height: ${currentHeight}px !important;
                border: ${withBorder ? "1px solid #E6E6E6" : "none"};
              }
            `}</style>
      </div>
    );
  }
}

export default PowerBiReportIframe;
