import React, { Component } from "react";

class LogisticClientDashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dashboardUrls: "",
      loader: true,
    };
  }

  componentDidMount = async () => {
    this.setState({loader: false})
  };
  render() {
    return (
      <>
        <div className="powerBiContainer" style={{ padding: "0px" }}>
          <div>
            {(
              <div className="waterMarkContainer">
                <div className="waterMarkHide" style={{height:64}}></div>
                <iframe
                      scrolling="no"
                      title="Dasboard"
                      id="iframeDasboard"
                                src={'https://app.powerbi.com/view?r=eyJrIjoiYWU0OGRkZjMtOTY1OC00YWJiLWFkYzAtNmU2N2I2OGYxNGFkIiwidCI6IjY0MGQ3N2VlLTRiNDEtNDc5Mi05YzQ0LTA2OTQ1MDAxOTE5OCJ9'}
                                frameBorder="0"
                                style={{ width: '100%' }}
                                height="1200"
                                allowFullScreen
                                onLoad={() => this.setState({ loader: false })}
                />
              </div>
            )}
          </div>
        </div>
      </>
    );
  }
}
export default LogisticClientDashboard;
