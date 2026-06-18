import React, { Component } from "react";
import PropTypes from "prop-types";
import SpeechRecognition from "react-speech-recognition";
import Mic from "@material-ui/icons/Mic";

const propTypes = {
  // Props injected by SpeechRecognition
  transcript: PropTypes.string,
  resetTranscript: PropTypes.func,
  browserSupportsSpeechRecognition: PropTypes.bool,
  startListening: PropTypes.func,
  stopListening: PropTypes.func,
  interimTranscript: PropTypes.string,
  finalTranscript: PropTypes.string,
  abortListening: PropTypes.func
}
const options = {
  autoStart: false
}

class Dictaphone extends Component {
  constructor(props) {
    super(props)
    this.StartListening = this.StartListening.bind(this);
    this.state = {
      isListening: true
    }
  }

  StartListening(message) {
    this.setState({ isListening: !this.state.isListening })
    if (this.state.isListening === true) {
      this.props.startListening();
      this.props.Listen()
      this.props.changeRecordingState();
    }
    else {
      this.props.abortListening()
      this.props.resetTranscript()
      this.props.stopListening();
      this.props.StopListen(message)
    }

  }
  render() {

    const { browserSupportsSpeechRecognition, finalTranscript } = this.props
    let Recording = ""
    Recording = finalTranscript
    if (Recording !== "") {
      this.StartListening(Recording)
    }
    if (!browserSupportsSpeechRecognition) {
      return null
    }
    return (
      <button className="arrowBtn mike" onClick={() => this.StartListening(Recording)}><Mic /></button>
    )
  }
}


Dictaphone.propTypes = propTypes
export default SpeechRecognition(options)(Dictaphone)