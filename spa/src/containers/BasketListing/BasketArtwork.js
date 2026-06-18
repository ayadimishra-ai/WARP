import React, { Component } from "react";
import { connect } from "react-redux";
import GridContainer from "../../components/Material/Grid/GridContainer";
import GridItem from "../../components/Material/Grid/GridItem";
import Button from "../../UI/Button/MaterialButton";
import basicsStyle from "../../assets/jss/material-kit-pro-react/views/componentsSections/basicsStyle.jsx";
import withStyles from "@material-ui/core/styles/withStyles";
import Input from "../../UI/Input/MaterialInput";
import { getFileExtension, getServiceUrl } from "../../config";
import axios from "axios";
import Spinner from "../../UI/Spinner/Spinner";
import PropTypes from 'prop-types';
import toaster from 'toasted-notes';
import { toasterAlert } from '../../utility';
import { getWebsiteUrl } from "../../config";
import { updateProductBasket } from '../../components/Basket/CommonBasket';
import { Tooltip } from "@material-ui/core";

const awsUrl = getWebsiteUrl();

const initialState = {
    artworkForm: {
        defaultArtwork: {
            elementType: "checkbox",
            elementConfig: {
                options: [],
                selectCaption: "-- Select Artwork --"
            },
            value: [],
            validation: {
                required: false
            },
            valid: true,
            touched: false,
            checked: false,
            fileFolder: "ProductArtworkFiles",
            bindFiles: true
        }
    },
    uploadForm: {
        // artworkTitle: {
        //     elementType: "input",
        //     elementConfig: {
        //         type: "text",
        //         placeholder: "Add Artwork Title"
        //     },
        //     value: "",
        //     validation: {
        //         required: false
        //     },
        //     errorMessage: "Title is required",
        //     valid: true,
        //     touched: false
        // },
        file: {
            divclassName: "upload_artwork_div",
            elementType: "input",
            elementConfig: {
                type: "file"
            },
            validation: {
                required: true
            },
            errorMessage: "File types allowed: JPG, PNG, PDF",
            valid: false,
            touched: false,
            uploadmsg: (
                <p id="fie-upload-message">
                    <span>Upload Artwork</span>
                    <span>File format .jpg, .png, .pdf</span>
                </p>
            )
        }
    },
    formIsValid: false,
    selectedFile: null,
    loading: false,
    resources: [],
    languageList: [],
    selectedLanguage: "0",
    simpleSelect: "",
    openBottom: false,
    artworkList: [],
    activeCheckboxes: [],
    listOfSelectedFile: []
};
function contains(arr, element) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] === element) {
            return true;
        }
    }
    return false;
}
class BasketArtwork extends Component {
    static contextTypes = {
        router: PropTypes.object
    }
    constructor(props, context) {
        super(props, context);
        this.state = {
            ...initialState,
            openArtwork: false
        };
        this.artworkChangeHandler = this.artworkChangeHandler.bind(this);
    }
    getArtwork() {
        let result = this.props.masterArtwork.map(item => ({
            Id: item.artworkGuid,
            Value: item.artworkImageName
        }));

        const finalarray = [];

        this.props.masterArtwork.forEach(e1 =>
            this.props.selectedArtwork.forEach(e2 => {
                if (e1.artworkGuid === e2.artworkGuid) {
                    finalarray.push(e1.artworkGuid);
                }
            })
        );
        this.setState({ artworkList: result });
        this.setState({ activeCheckboxes: finalarray });
        this.setState({ listOfSelectedFile: result.filter(item => finalarray.includes(item.Id)) });
        const updatedArtworkForm = {
            ...this.state.artworkForm
        };
        updatedArtworkForm.defaultArtwork.elementConfig.options = result;
        updatedArtworkForm.defaultArtwork.value = finalarray;
        this.setState({ artworkForm: updatedArtworkForm });

    }
    async componentDidMount() {
        this.getArtwork();
    }
    handleSimple = event => {
        this.setState({ [event.target.name]: event.target.value });
    };
    addNewArtworkClick = () => {
        this.setState({ openBottom: true });
    };
    closeArtworkHandler = () => {
        this.setState({ openBottom: false });
    };
    checkValidity(value, rules, inputIdentifier) {
        let isValid = true;
        if (rules !== undefined) {
            if (rules.required) {
                isValid = value.trim() !== "" && value.trim() !== "0";
                if (inputIdentifier === "file") {
                    if (
                        getFileExtension(value) === "jpg" ||
                        getFileExtension(value) === "jpeg" ||
                        getFileExtension(value) === "png" ||
                        getFileExtension(value) === "pdf"
                    ) {
                        isValid = true;
                    } else {
                        isValid = false;
                    }
                }
            }
        }
        return isValid;
    }
    uploadChangeHandler = (event, inputIdentifier, arkworkIndex) => {
        const updatedUploadForm = {
            ...this.state.uploadForm
        };
        const updatedFormElement = {
            ...updatedUploadForm[inputIdentifier]
        };
        updatedFormElement.value = event.target.value;
        updatedFormElement.valid = this.checkValidity(
            updatedFormElement.value,
            updatedFormElement.validation,
            inputIdentifier
        );
        updatedUploadForm[inputIdentifier] = updatedFormElement;

        let formIsValid = true;

        for (let inputIndentifiers in updatedUploadForm) {
            formIsValid = updatedUploadForm[inputIndentifiers].valid && formIsValid;
        }
        this.setState({
            uploadForm: updatedUploadForm,
            formIsValid: formIsValid,
            selectedFile: inputIdentifier === "file" ? event.target.files[0] : ""
        });
        if (event.target.files !== null) {
            if (event.target.files[0] !== undefined) {
                document.getElementById("fie-upload-message" + arkworkIndex).innerHTML =
                    event.target.files[0].name;
            } else {
                document.getElementById("fie-upload-message" + arkworkIndex).innerHTML =
                    "Drag your files here or click in this area.";
            }
        }
        const formData = new FormData();
        if (formIsValid) {
            this.setState({ loading: true });
            let title = "";//this.state.uploadForm.artworkTitle.value;
            const updatedUploadForm1 = {
                ...this.state.uploadForm
            };
            formData.append(
                "files",
                inputIdentifier === "file" ? event.target.files[0] : ""
            );

            var config = {
                headers: {
                    Authorization: "Bearer " + localStorage.tokenId,
                    "Content-Type": "multipart/form-data",
                    "UploadType": "ProductArtwork",
                    "ArtworkTitleName": title,
                    "LanguageGuid": localStorage.languageId,
                    "BasketGuidNew": this.props.BasketGuid,
                    "UserGuid": this.props.userId
                }
            };
            // axios
            //     .post(
            //         getServiceUrl() +
            //         "FileUpload/uploadfile",
            //         formData,
            //         config
            //     )
            //     .then(response => {
            //         this.setState({ loading: false });
            //         if (response.data === "Duplicate") {
            //             toaster.notify(toasterAlert('WARNING', 'Artwork Title should be unique'), {
            //                 duration: null
            //             })

            //         } else {
            //             //updatedUploadForm1.artworkTitle.value = "";
            //             updatedUploadForm1.file.value = "";
            //             updatedUploadForm1.file.touched = false;

            //             this.setState({ uploadForm: updatedUploadForm1 }, () => {
            //                 // console.log(this.state.uploadForm, 'uploadForm');
            //             });
            //             document.getElementById("fie-upload-message" + arkworkIndex).innerHTML = 'Upload File';
            //             //alert(JSON.stringify(response.data))
            //             this.props.artworkDataCallback(response.data, this.props.BasketGuid);
            //             toaster.notify(toasterAlert('SUCCESS', 'Uploaded Successfully'), {
            //                 duration: null
            //             })

            //             this.setState({
            //                 openBottom: false
            //             });
            //         }
            //         //this.stateResetHandler();
            //         //document.getElementById("fie-upload-message").innerHTML = 'Drag your files here or click in this area.';
            //     });
        } else {
            const updatedUploadForm = {
                ...this.state.uploadForm
            };
            for (let inputIndentifiers in updatedUploadForm) {
                updatedUploadForm[inputIndentifiers].touched = !updatedUploadForm[
                    inputIndentifiers
                ].valid;
            }
            this.setState({
                uploadForm: updatedUploadForm
            });
        }
    };
    stateResetHandler() {
        this.setState(this.initialState);

        const updatedUploadFormInfo = {
            ...this.state.uploadForm
        };
        updatedUploadFormInfo.file.touched = false;
        this.setState({
            uploadForm: updatedUploadFormInfo
        });

        const updatedArtworkFormInfo = {
            ...this.state.artworkForm
        };
        updatedArtworkFormInfo.touched = false;
        this.setState({
            artworkForm: updatedArtworkFormInfo
        });
        this.setState({ loading: false });
    }
    artworkChangeHandler = (id, event, inputIdentifier) => {
        if (this.state.activeCheckboxes.some(item => item === id)) {
            this.state.activeCheckboxes.splice(
                this.state.activeCheckboxes.indexOf(id),
                1
            );
        } else {
            this.state.activeCheckboxes.push(id);
        }
        const updatedArtworkInfo = {
            ...this.state.artworkForm
        };
        const updatedFormElement = {
            ...updatedArtworkInfo[inputIdentifier]
        };
        updatedFormElement.value = event.target.value;
        updatedFormElement.valid = this.checkValidity(
            updatedFormElement.value,
            updatedFormElement.validation,
            ""
        );

        let formIsValid = true;
        for (let inputIdentifiers in updatedArtworkInfo) {
            formIsValid = updatedArtworkInfo[inputIdentifiers].valid && formIsValid;
        }
        this.setState({
            artworkForm: updatedArtworkInfo,
            formIsValid: formIsValid
        });
    };
    submitNewArtworkHandler = (event, arkworkIndex) => {
        event.preventDefault();
        const formData = new FormData();
        if (this.state.formIsValid) {
            this.setState({ loading: true });
            let title = "";//this.state.uploadForm.artworkTitle.value;
            const updatedUploadForm1 = {
                ...this.state.uploadForm
            };
            formData.append(
                "files",
                this.state.selectedFile
            );

            var config = {
                headers: {
                    Authorization: "Bearer " + localStorage.tokenId,
                    "Content-Type": "multipart/form-data",
                    "UploadType": "ProductArtwork",
                    "ArtworkTitleName": title,
                    "LanguageGuid": localStorage.languageId,
                    "BasketGuidNew": this.props.BasketGuid,
                    "UserGuid": this.props.userId
                }
            };
            // axios
            //     .post(
            //         getServiceUrl() +
            //         "FileUpload/uploadfile",
            //         formData,
            //         config
            //     )
            //     .then(response => {
            //         this.setState({ loading: false });
            //         if (response.data === "Duplicate") {
            //             toaster.notify(toasterAlert('WARNING', 'Artwork Title should be unique'), {
            //                 duration: null
            //             })

            //         } else {
            //             //updatedUploadForm1.artworkTitle.value = "";
            //             updatedUploadForm1.file.value = "";
            //             updatedUploadForm1.file.touched = false;

            //             this.setState({ uploadForm: updatedUploadForm1 }, () => {
            //                 // console.log(this.state.uploadForm, 'uploadForm');
            //             });
            //             document.getElementById("fie-upload-message" + arkworkIndex).innerHTML = 'Upload File';
            //             //alert(JSON.stringify(response.data))
            //             this.props.artworkDataCallback(response.data, this.props.BasketGuid);
            //             toaster.notify(toasterAlert('SUCCESS', 'Uploaded Successfully'), {
            //                 duration: null
            //             })

            //             this.setState({
            //                 openBottom: false
            //             });
            //         }
            //         //this.stateResetHandler();
            //         //document.getElementById("fie-upload-message").innerHTML = 'Drag your files here or click in this area.';
            //     });
        } else {
            const updatedUploadForm = {
                ...this.state.uploadForm
            };
            for (let inputIndentifiers in updatedUploadForm) {
                updatedUploadForm[inputIndentifiers].touched = !updatedUploadForm[
                    inputIndentifiers
                ].valid;
            }
            this.setState({
                uploadForm: updatedUploadForm
            });
        }
    };
    componentWillMount = () => {
        this.selectedCheckboxes = new Set();
    };
    openArtwork = () => {
        this.setState({ openArtwork: true });
    };
    closeArtwork = () => {
        this.setState({ openArtwork: false, artworkList: this.state.artworkList });
    };

    submitExistingArtworkHandler = event => {
        event.preventDefault();
        if (this.state.formIsValid) {
            this.setState({ loading: true });
            let NewArrayArtworkId = [];
            for (const id of this.state.activeCheckboxes) {
                NewArrayArtworkId.push(id);
            }
            var data = NewArrayArtworkId.join();

            var paramters = {
                'BasketGuid': this.props.BasketGuid,
                'ArtworkGuid': data,
            };
            updateProductBasket(paramters)
                .then((json) => {
                    if (json.status === 200) {
                        this.setState({ loading: false });
                        this.setState({ openArtwork: false });
                        let listOfSelectedFile = this.state.artworkList.filter(item => this.state.activeCheckboxes.includes(item.Id));
                        this.setState({ openBottom: false, listOfSelectedFile: listOfSelectedFile });
                        this.props.callBackUpdateArtworkData(data, this.props.BasketGuid, this.props.ProductGuid)
                    }
                }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
        } else {
            const updatedArtworkForm = {
                ...this.state.artworkForm
            };
            for (let inputIndentifiers in updatedArtworkForm) {
                updatedArtworkForm[inputIndentifiers].touched = !updatedArtworkForm[
                    inputIndentifiers
                ].valid;
            }
            this.setState({
                artworkForm: updatedArtworkForm
            });
        }
    };
    checkBox = (ev) => {
        ev.stopPropagation();
    }
    handleChange = name => event => {
        this.setState({ [name]: event.target.checked });
    };

    componentWillReceiveProps(nextProps) {
        let finalarray = [];
        let result = nextProps.masterArtwork.map(item => ({
            Id: item.artworkGuid,
            Value: item.artworkImageName
        }));
        nextProps.masterArtwork.forEach(e1 =>
            nextProps.selectedArtwork.forEach(e2 => {
                if (e1.artworkGuid === e2.artworkGuid) {
                    finalarray.push(e1.artworkGuid);
                }
            })
        );
        this.setState({ artworkList: result });
        this.setState({ activeCheckboxes: finalarray });
        this.setState({ listOfSelectedFile: result.filter(item => finalarray.includes(item.Id)) });
        const updatedArtworkForm = {
            ...this.state.artworkForm
        };
        updatedArtworkForm.defaultArtwork.elementConfig.options = result;
        updatedArtworkForm.defaultArtwork.value = finalarray;
        this.setState({ artworkForm: updatedArtworkForm });
    }
    removeSpecificArtwork = (event, artworkId) => {
        let finalarray = this.state.activeCheckboxes.filter(x => x !== artworkId);
        this.setState({ loading: true });
        let NewArrayArtworkId = [];
        for (const id of finalarray) {
            NewArrayArtworkId.push(id);
        }
        var data = NewArrayArtworkId.join();

        var paramters = {
            'BasketGuid': this.props.BasketGuid,
            'ArtworkGuid': data,
        };
        updateProductBasket(paramters)
            .then((json) => {
                if (json.status === 200) {
                    this.setState({ loading: false })
                    this.setState({ openArtwork: false })
                    let listOfSelectedFile = this.state.artworkList.filter(item => this.state.activeCheckboxes.includes(item.Id));
                    this.setState({ listOfSelectedFile: listOfSelectedFile });
                    this.props.callBackUpdateArtworkData(data, this.props.BasketGuid, this.props.ProductGuid)
                }
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }

    render() {
        let formElementsArray = [];
        let artworkHTML = "";
        let ImageName = "";
        let boolean = false;
        for (let key in this.state.uploadForm) {
            formElementsArray.push({
                id: key,
                config: this.state.uploadForm[key]
            });
        }
        let artworkElementsArray = [];

        for (let key in this.state.artworkForm) {
            artworkElementsArray.push({
                id: key,
                config: this.state.artworkForm[key]
            });
        }

        if (this.state.artworkList.length > 0) {
            artworkHTML = this.state.artworkList.map(
                data => (
                    (boolean =
                        contains(this.state.activeCheckboxes, data.Id) === false
                            ? false
                            : true),
                    (ImageName = data.Value !== undefined ?
                        data.Value.substr(data.Value.lastIndexOf(".") + 1) === "pdf"
                            ? "Pdf.png"
                            : data.Value : data.Value),
                    artworkElementsArray.map(formElement => (
                        <div key={formElement.id} style={{border : boolean ? '1px solid #72D0C6' : '1px solid #E4E4E4'}} className="artwork_list">
                            <Input
                                id={data.Id}
                                elementType={formElement.config.elementType}
                                elementConfig={formElement.config.elementConfig}
                                invalid={!formElement.config.valid}
                                shouldValidate={formElement.config.validation}
                                touched={formElement.config.touched}
                                errorMessage={formElement.config.errorMessage}
                                value={formElement.config.value}
                                checked={boolean}
                                onClickd={this.checkBox}
                                changed={event =>
                                    this.artworkChangeHandler(data.Id, event, formElement.id)
                                }
                            />
                            {formElement.config.bindFiles === true ? (
                                <a
                                    target="_blank"
                                    href={
                                        awsUrl +
                                        formElement.config.fileFolder +
                                        "/" +
                                        data.Value
                                    }
                                >
                                    <img
                                        src={
                                            awsUrl +
                                            formElement.config.fileFolder +
                                            "/" +
                                            ImageName
                                        }
                                        onError={e => {
                                            e.target.onerror = null;
                                            e.target.src =
                                                awsUrl +
                                                formElement.config.fileFolder +
                                                "/" +
                                                "default.jpg";
                                        }}
                                    />
                                </a>
                            ) : (
                                data.Value
                            )}
                        </div>
                    ))
                )
            );
        }
        return (
            <React.Fragment>
                <GridContainer className="artworkcontainer_wrap">
                    <GridItem
                        className="default_artwork_selection"
                        // sm={5}
                        xs={8}
                        md={8}
                        // xs={5}
                        sm={8}
                        style={{ paddingRight: 0 }}
                    >
                        <Button greenSubmit onClick={this.openArtwork}>
                            Select Artwork
                        </Button>
                        <div
                            className="select_artwork_popup_div"
                            style={{ display: this.state.loading ? "none" : "block" }}
                        />
                        <div
                            className="select_artwork_popup"
                            style={{ height: this.state.openArtwork === true ? "220px" : "0" }}
                        >
                            <div className="artwork_list_parent">
                                {artworkHTML}
                            </div>

                            <Button onClick={this.submitExistingArtworkHandler} simple>
                                Select
                            </Button>
                            <Button onClick={this.closeArtwork} simple>
                                Cancel
                            </Button>

                        </div>
                    </GridItem>
                    <GridItem className="basket_listing_plus" xs={1} md={1} sm={4}>
                        <Tooltip title={"Need personalization? Click here to upload artwork"}>
                            <span className="artworkupload_icon" onClick={this.addNewArtworkClick}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="16" viewBox="0 0 24 16" fill="none">
                                    <path d="M18.705 5.004C17.839 2.056 15.15 0 12 0C9.708 0 7.56 1.138 6.258 3.005C2.786 3.133 0 5.997 0 9.5C0 13.084 2.916 16 6.5 16H9H11V10H8L12 6L16 10H13V16H15H18.5C21.533 16 24 13.532 24 10.5C24 7.536 21.643 5.111 18.705 5.004Z" fill="white" />
                                </svg>
                            </span>
                        </Tooltip>
                    </GridItem>
                </GridContainer>
                <GridContainer style={{ display: this.state.loading ? "none" : "flex" }}
                    className={
                        "new_artwork_container "
                    }
                >
                    {this.state.openBottom === false ?
                        this.state.listOfSelectedFile.map((item) => (

                            <React.Fragment>
                                <div className="upldartwork_det">
                                    <span className="upldartwork_name">{item.Value}</span>
                                    <span onClick={(event) => this.removeSpecificArtwork(event, item.Id)}><svg xmlns="http://www.w3.org/2000/svg" width="18" height="20" viewBox="0 0 18 20" fill="none">
                                        <path d="M7 9V15M11 9V15M1 5H17M16 5L15.133 17.142C15.0971 17.6466 14.8713 18.1188 14.5011 18.4636C14.1309 18.8083 13.6439 19 13.138 19H4.862C4.35614 19 3.86907 18.8083 3.49889 18.4636C3.1287 18.1188 2.90292 17.6466 2.867 17.142L2 5H16ZM12 5V2C12 1.73478 11.8946 1.48043 11.7071 1.29289C11.5196 1.10536 11.2652 1 11 1H7C6.73478 1 6.48043 1.10536 6.29289 1.29289C6.10536 1.48043 6 1.73478 6 2V5H12Z" stroke="#454545" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                    </span>
                                </div>
                            </React.Fragment>
                        ))
                        : <React.Fragment>
                            <GridItem className="title_upload_artwork">
                                {formElementsArray.map((formElement, index) => (
                                    <div
                                        style={formElement.config.bgcss}
                                        className={formElement.config.divclassName}
                                        key={formElement.id}
                                    >
                                        {/* {formElement.config.uploadmsg} */}
                                        {formElement.config.uploadmsg !== undefined ?
                                            <p className="fie-upload-message" id={"fie-upload-message" + this.props.arkworkIndex}><span>Upload Artwork</span><span>File format .jpg, .png, .pdf</span></p>
                                            : ""
                                        }
                                        <span className="artworkCloudIcon">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="17" viewBox="0 0 24 17" fill="none">
                                                <path d="M19.35 7.03536C18.67 3.58536 15.64 0.995361 12 0.995361C9.11 0.995361 6.6 2.63536 5.35 5.03536C2.34 5.35536 0 7.90536 0 10.9954C0 14.3054 2.69 16.9954 6 16.9954H19C21.76 16.9954 24 14.7554 24 11.9954C24 9.35536 21.95 7.21536 19.35 7.03536ZM19 14.9954H6C3.79 14.9954 2 13.2054 2 10.9954C2 8.94536 3.53 7.23536 5.56 7.02536L6.63 6.91536L7.13 5.96536C8.08 4.13536 9.94 2.99536 12 2.99536C14.62 2.99536 16.88 4.85536 17.39 7.42536L17.69 8.92536L19.22 9.03536C20.78 9.13536 22 10.4454 22 11.9954C22 13.6454 20.65 14.9954 19 14.9954ZM8 9.99536H10.55V12.9954H13.45V9.99536H16L12 5.99536L8 9.99536Z" fill="#72D0C6" />
                                            </svg>
                                        </span>

                                        <Input
                                            elementType={formElement.config.elementType}
                                            elementConfig={formElement.config.elementConfig}
                                            invalid={!formElement.config.valid}
                                            shouldValidate={formElement.config.validation}
                                            touched={formElement.config.touched}
                                            errorMessage={formElement.config.errorMessage}
                                            value={formElement.config.value}
                                            changed={event =>
                                                this.uploadChangeHandler(event, formElement.id, this.props.arkworkIndex)
                                            }
                                        />
                                    </div>
                                ))}
                            </GridItem>
                            {/* <GridItem sm={2} md={6}>
                                <Button
                                    onClick={event => this.submitNewArtworkHandler(event, this.props.arkworkIndex)}
                                    className="cart_save_btn"
                                    simple
                                >
                                    Upload
                                </Button>
                            </GridItem>
                            <GridItem sm={2} md={6}>
                                <Button
                                    onClick={this.closeArtworkHandler}
                                    className="cart_cance_btn"
                                    simple
                                >
                                    Cancel
                                </Button>
                            </GridItem> */}
                        </React.Fragment>}
                </GridContainer>
                <div className="basket_art_spinner" style={{ display: this.state.loading ? "block" : "none" }}>
                    <Spinner />
                </div>
            </React.Fragment>
        );
    }
}
const mapStateToProps = state => {
    return {
        userId: state.login.userId,
        userType: state.login.userType,
        languageId: state.master.languageId,
        emailId: state.login.emailId,
        IsAuthentic: state.login.IsAuthentic,
        languageList: state.master.languageList,
        tokenId: state.login.tokenId,
        tokenStart: state.login.tokenStart,
        tokenEnd: state.login.tokenEnd,
        cartCounter: state.basket.cartCounter
    };
};

export default connect(mapStateToProps)(withStyles(basicsStyle)(BasketArtwork));
