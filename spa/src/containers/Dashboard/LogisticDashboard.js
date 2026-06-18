import React, { Component } from "react";

class LogiscticDashboard extends Component {
  constructor(props) {
    super(props);
    this.iframeRef = React.createRef();
    this.state = {
      dashboardUrls: "",
      loader: true,
    };
  }

  

  adjustIframeHeight = () => {
        const iframe = this.iframeRef.current;
        if (iframe && iframe.contentWindow) {
            const iframeDoc = iframe.contentWindow.document;
            if (iframeDoc) {
                iframe.style.height = iframeDoc.body.scrollHeight + 'px';
            }
        }
    };

  componentDidMount = async () => {
    this.setState({loader:false});

     const iframe = this.iframeRef.current;
        if (iframe) {
            iframe.addEventListener('load', this.adjustIframeHeight);
        }
  };

    componentWillUnmount() {
        const iframe = this.iframeRef.current;
        if (iframe) {
            iframe.removeEventListener('load', this.adjustIframeHeight);
        }
    }
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
                      frameBorder="0"
                                title="Dasboard"
                                id="iframeDasboard"
                                src={'https://app.powerbi.com/view?r=eyJrIjoiYzdiM2QwZDctOTk5YS00ZTE1LWI0ZjktYmE2YjUxZDZiY2I0IiwidCI6IjY0MGQ3N2VlLTRiNDEtNDc5Mi05YzQ0LTA2OTQ1MDAxOTE5OCJ9'}
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
export default LogiscticDashboard;
