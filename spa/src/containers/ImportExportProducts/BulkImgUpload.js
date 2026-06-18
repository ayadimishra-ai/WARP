import axios from "axios";
import React, { Component } from 'react';
import { confirmAlert } from 'react-confirm-alert';
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";
import GridContainer from "../../components/Material/Grid/GridContainer";
import GridItem from "../../components/Material/Grid/GridItem";
import {
    getFileExtension, getLabelText, getLanguageResourceElasticIndex, getServiceUrl, getWebsiteGUID
} from "../../config";
import * as PageKeys from "../../pagekeys";
import * as RoleCodes from "../../rolecodes";
import Button from "../../UI/Button/MaterialButton";
import Input from "../../UI/Input/MaterialInput";
import Spinner from "../../UI/Spinner/Spinner";
import { getElasticData, getPageResource } from "../../utility";

const initialState = {
    uploadForm: {
        largeImages: {
            elementType: "input",
            elementConfig: {
                type: "file",
                size: 200,
                width: 200,
                height: 200,
            },
            validation: {
                required: true
            },
            errorMessage: "Please select a .zip file.",
            valid: false,
            touched: false,
            label: 'Large Images (Image minimum resolution: 800X800)'
        },
        mediumImages: {
            elementType: "input",
            elementConfig: {
                type: "file",
                size: 200,
                width: 200,
                height: 200,
            },
            validation: {
                required: true
            },
            errorMessage: "Please select a .zip file.",
            valid: false,
            touched: false,
            label: 'Medium Images (Image minimum resolution: 800X800)'

        },
        thumbnailImages: {
            elementType: "input",
            elementConfig: {
                type: "file",
                size: 200,
                width: 200,
                height: 200,
            },
            validation: {
                required: true
            },
            errorMessage: "Please select a .zip file.",
            valid: false,
            touched: false,
            label: 'Thumbnail Images (Image minimum resolution: 800X800)'
        },
        documents: {
            elementType: "input",
            elementConfig: {
                type: "file",
                size: 200,
                width: 200,
                height: 200,
            },
            validation: {
                required: true
            },
            errorMessage: "Please select a .zip file.",
            valid: false,
            touched: false,
            label: 'Documents (Image minimum resolution: 800X800)'
        },
        productCertificate: {
            elementType: "input",
            elementConfig: {
                type: "file",
                size: 200,
                width: 200,
                height: 200,
            },
            validation: {
                required: true
            },
            errorMessage: "Please select a .zip file.",
            valid: false,
            touched: false,
            label: 'ProductCertificate (Image minimum resolution: 800X800)'
        },
    },
    uploadFormDropdowns: {
        supplier: {
            elementType: 'select_2',
            class: "newInput_2",
            elementConfig: {
                options: [],
                disabled: false
            },
            value: '',
            validation: {
                required: true,
            },
            requiredclass: 'required',
            newThemeError: 'Please select supplier.',
            valid: false,
            touched: false,
            label: "Select Supplier",
        },
    },
    formIsValid: false,
    selectedFile: null,
    loading: true,
    resources: [],
    selectedSupplierCompanyName: "0",
    supplierCompanyList: [],
};
let uploadCount = 0, fileUploadCount = 0;
class BulkImgUpload extends Component {

    state = {
        ...initialState,
        selectedFile: null,
        size: null,
        resources: [],
        globalSettingsData: '',
        selectedImgFolders: [],
        MsgArry: [],
        //fileUploadCount: 0
    }
    constructor(props) {
        super(props)
    }

    componentDidMount = () => {
        this.getGlobalSettingsData();
        this.stateResetHandler();
        getPageResource(
            getLanguageResourceElasticIndex(localStorage.languageId, PageKeys.rfqlisting)
        )
            .then((json) => {
                this.setState({ resources: json });
            })
            .catch((err) =>
                err.response !== undefined
                    ? err.response.status === 401
                        ? (window.location.pathname = "/logout")
                        : ""
                    : ""
            );
    }

    onFileChange(e) {
        const formData = new FormData();
        this.setState({ selectedFile: e.target.files[0] })
        let size = e.target.files[0].size;
        let filesize;
        let maxFileSizeAllowed = this.state.globalSettingsData;

        if (size / 1024 / 1024 > maxFileSizeAllowed) {
            confirmAlert({
                message: 'max file size allowed is ' + maxFileSizeAllowed,
                buttons: [
                    {
                        label: 'OK',
                    }
                ]
            });
        }
        var regex = new RegExp("([a-zA-Z0-9s_\\.-:])+(.zip)$");
        if (!regex.test(e.target.files[0].name.toLowerCase())) {
            confirmAlert({
                message: "Please select a valid file.",
                buttons: [
                    {
                        label: "OK"
                    }
                ]
            });
        }
    }

    checkSelectValidity(value, rules) {
        let isValid = true;
        if (rules.required) {
            isValid = value.trim() !== "0";
        }
        return isValid;
    }
    getGlobalSettingsData = () => {
        getElasticData( getWebsiteGUID() + "_globalsettings", '', 0, 500, '').then(result => {
            if (result !== null && result !== undefined) {
                let globalSettingsData = [...new Set(result.hits.hits.map(x => x._source))];
                this.setState({ globalSettingsData: globalSettingsData.filter(x => x.settingsKey === "BULKIMAGEUPLOADFILESIZE")[0].settingsValue });
            }
        });
    }
    checkValidity(value, rules) {
        let isValid = true;
        let Size = ''
        if (rules.required) {
            isValid = value.trim() !== "" && getFileExtension(value) === "zip";
        }
        return isValid;
    }

    fileSelectedHandler = (event, inputIdentifier) => {
        this.onFileChange(event);
        const updatedUploadForm = {
            ...this.state.uploadForm
        };
        const updatedFormElement = {
            ...updatedUploadForm[inputIdentifier]
        };
        updatedFormElement.value = event.target.value;
        updatedFormElement.valid = this.checkValidity(
            updatedFormElement.value,
            updatedFormElement.validation
        );

        updatedUploadForm[inputIdentifier] = updatedFormElement;

        let formIsValid = true;

        for (let inputIndentifiers in updatedUploadForm) {
            formIsValid = updatedUploadForm[inputIndentifiers].valid && formIsValid;
        }

        let filesavearray = [];
        filesavearray = this.state.selectedImgFolders;
        filesavearray.push({
            file: event.target.files[0],
            fileType: inputIdentifier === 'largeImages' ? 'Large' : inputIdentifier === 'mediumImages' ? 'Medium' : inputIdentifier === 'thumbnailImages' ? 'Thumbnail' : inputIdentifier === 'documents' ? 'Documents' : inputIdentifier === 'productCertificate' ? 'ProductCertificate' : ''
        })
        this.setState({
            uploadForm: updatedUploadForm,
            formIsValid: formIsValid,
            selectedFile: event.target.files[0],
            selectedImgFolders: filesavearray
        });
        if (event.target.files[0] !== undefined) {
            // document.getElementById("fie-upload-message").innerHTML =
            //     event.target.files[0].name;
        } else {
            document.getElementById("fie-upload-message").innerHTML =
                "Drag your files here or click in this area.";
        }
    };

    async fileUpload(UploadType, file) {
        let FileType = "";
        if (UploadType.toString().toLowerCase() === "large" || UploadType.toString().toLowerCase() === "medium" || UploadType.toString().toLowerCase() === "thumbnail") {
            FileType = "image";
        } else if (UploadType.toString().toLowerCase() === "documents") {
            FileType = "Document";
        } else {
            FileType = "ProductCertificate";
        }
        const formData = new FormData();
        formData.append(
            "files",
            file
        );
        var config = {
            headers: {
                Authorization: "Bearer " + localStorage.tokenId,
                "Content-Type": "multipart/form-data",
                SupplierGuid: JSON.parse(localStorage.userType) === RoleCodes.SUPPLIERSUPPORTPERSON ? this.state.selectedSupplierCompanyName : localStorage.userId,
                Size: UploadType,
                FileType: FileType
            }
        };
        await axios.post(
            getServiceUrl() +
            "FileUpload/BulkFilesUploader",
            formData,
            config
        )
            .then(response => {
                let msgArry = [...this.state.MsgArry];
                if (response.data === 'success') {
                    msgArry.push("Success");
                    fileUploadCount = fileUploadCount + 1;
                    this.setState({ MsgArry: msgArry });
                } else {
                    let msgArry = [...this.state.MsgArry];
                    msgArry.push("Fail");
                    fileUploadCount = fileUploadCount + 1;
                    this.setState({ MsgArry: msgArry });
                }

            });
        if (uploadCount === fileUploadCount) {
            alert(this.state.MsgArry[0]);
        }
        this.stateResetHandler();
    }

    async submitHandler(event) {
        let userId = null;
        if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIERSUPPORTPERSON) {
            userId = this.state.selectedSupplierCompanyName
        } else {
            userId = this.props.userId;
        }

        const formData = new FormData();
        let formIsValid = this.checkFormValidity();

        if (this.state.selectedSupplierCompanyName) {
            if (formIsValid) {
                this.setState({ loading: true });
                let msgArry = [];
                this.state.selectedImgFolders.map(item => {
                    uploadCount = uploadCount + 1;
                    this.fileUpload(item.fileType, item.file)
                });
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

                const updatedUploadFormDropdownInfo = {
                    ...this.state.uploadFormDropdowns
                };
                for (let inputIndentifiers in updatedUploadFormDropdownInfo) {
                    updatedUploadFormDropdownInfo[inputIndentifiers].touched = !updatedUploadFormDropdownInfo[
                        inputIndentifiers
                    ].valid;
                }
                this.setState({
                    uploadFormDropdowns: updatedUploadFormDropdownInfo
                });
            }
        }
        else {
            confirmAlert({
                message: "Please select Supplier.",
                buttons: [
                    {
                        label: "OK"
                    }
                ]
            });
        }
    };
    onSupplierChangeHandler = (event, inputIdentifier) => {
        const updatedUploadFormDropdownInfo = {
            ...this.state.uploadFormDropdowns
        };
        const updatedFormElement = {
            ...updatedUploadFormDropdownInfo[inputIdentifier]
        };
        updatedFormElement.value = event.target.value;
        updatedFormElement.valid = this.checkSelectValidity(
            updatedFormElement.value,
            updatedFormElement.validation
        );
        updatedFormElement.touched = true;
        updatedUploadFormDropdownInfo[inputIdentifier] = updatedFormElement;

        let formIsValid = true;
        let aa = this.state.selectedSupplierCompanyName;
        for (let inputIndentifiers in updatedUploadFormDropdownInfo) {
            formIsValid =
                updatedUploadFormDropdownInfo[inputIndentifiers].valid &&
                formIsValid;
        }
        this.setState({
            uploadFormDropdowns: updatedUploadFormDropdownInfo,
            formIsValid: formIsValid,
            selectedSupplierCompanyName: event.target.value
        });
    };

    getSupplierCompanyList = () => {
        var config = {
            headers: {
                'Authorization': 'Bearer ' + localStorage.tokenId,
                'Content-Type': 'application/json',
            },
        };
        axios.get(getServiceUrl() + 'Users/GetParentSupplierCompanyListForImport', config)
            .then((response) => {
                if (response.data !== null) {
                    let list = [];
                    response.data.table1.filter(x => x.isActive === true).map(item => {
                        list.push({
                            Id: item.userGuid,
                            Value: item.supplierCompanyName
                        })
                    })
                    const updatedUploadFormDropdownInfo = { ...this.state.uploadFormDropdowns };
                    updatedUploadFormDropdownInfo.supplier.elementConfig.options = list;
                    if (list.length === 1) {
                        updatedUploadFormDropdownInfo.supplier.value = list[0].Id;
                        updatedUploadFormDropdownInfo.supplier.valid = true;
                        updatedUploadFormDropdownInfo.supplier.touched = true;
                    }
                    this.setState({
                        uploadFormDropdowns: updatedUploadFormDropdownInfo,
                        selectedSupplierCompanyName: updatedUploadFormDropdownInfo.supplier.value,
                        loading: false,
                        supplierCompanyList: list
                    });
                }
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }

    checkFormValidity = () => {
        let formIsValid = false;
        const updatedUploadFormDropdownInfo = { ...this.state.uploadFormDropdowns };
        for (let inputIndentifiers in updatedUploadFormDropdownInfo) {
            formIsValid =
                updatedUploadFormDropdownInfo[inputIndentifiers].valid || formIsValid;
        }

        const updatedUploadForm = { ...this.state.uploadForm };
        for (let inputIndentifiers in updatedUploadForm) {
            formIsValid = updatedUploadForm[inputIndentifiers].valid || formIsValid;
        }
        return formIsValid;
    }
    stateResetHandler() {
        this.setState(this.initialState);

        if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIERSUPPORTPERSON) {
            const updatedUploadFormDropdownInfo = { ...this.state.uploadFormDropdowns };
            updatedUploadFormDropdownInfo.supplier.valid = false;
            updatedUploadFormDropdownInfo.supplier.touched = false;
            this.setState({ uploadFormDropdowns: updatedUploadFormDropdownInfo, loading: false });
            this.getSupplierCompanyList();
        } else if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIER) {
            const updatedUploadFormDropdownInfo = { ...this.state.uploadFormDropdowns };
            updatedUploadFormDropdownInfo.supplier.valid = true;
            updatedUploadFormDropdownInfo.supplier.touched = true;
            this.setState({ uploadFormDropdowns: updatedUploadFormDropdownInfo, loading: false });
        }
    }

    showFileName = (fileType) => {
        let fileName = '';
        if (this.state.selectedImgFolders.length > 0) {
            if (fileType == "largeImages") {
                fileName = this.state.selectedImgFolders.filter(x => x.fileType === "Large").length > 0 ? this.state.selectedImgFolders.filter(x => x.fileType === "Large")[0].file.name : "";
            } else if (fileType == "mediumImages") {
                fileName = this.state.selectedImgFolders.filter(x => x.fileType === "Medium").length > 0 ? this.state.selectedImgFolders.filter(x => x.fileType === "Medium")[0].file.name : "";
            } else if (fileType == "thumbnailImages") {
                fileName = this.state.selectedImgFolders.filter(x => x.fileType === "Thumbnail").length > 0 ? this.state.selectedImgFolders.filter(x => x.fileType === "Thumbnail")[0].file.name : "";
            } else if (fileType == "documents") {
                fileName = this.state.selectedImgFolders.filter(x => x.fileType === "Documents").length > 0 ? this.state.selectedImgFolders.filter(x => x.fileType === "Documents")[0].file.name : "";
            } else if (fileType == "productCertificate") {
                fileName = this.state.selectedImgFolders.filter(x => x.fileType === "ProductCertificate").length > 0 ? this.state.selectedImgFolders.filter(x => x.fileType === "ProductCertificate")[0].file.name : "";
            }
        }
        return fileName;
    }

    render() {
        let pageBody = <Spinner />;
        const { resources } = this.state;
        let formElementsArray = [];
        for (let key in this.state.uploadForm) {
            formElementsArray.push({
                id: key,
                config: this.state.uploadForm[key]
            });
        }

        let formElementsDropdownArray = [];
        for (let key in this.state.uploadFormDropdowns) {
            formElementsDropdownArray.push({
                id: key,
                config: this.state.uploadFormDropdowns[key]
            });
        }
        if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIER) {
            formElementsDropdownArray = formElementsDropdownArray.filter(x => x.id !== "supplier");
        }
        switch (JSON.parse(localStorage.userType)) {
            case RoleCodes.SUPPLIER:
                if (!this.state.loading) {
                    pageBody = (
                        <form className="upload-form" onSubmit={(e) => this.submitHandler(e)}>
                            <GridContainer>
                                <GridItem md="6">
                                    <div className="newThemeInput">
                                        {formElementsDropdownArray.map(formElement => (
                                            <Input
                                                elementType={formElement.config.elementType}
                                                class={formElement.config.class}
                                                elementConfig={formElement.config.elementConfig}
                                                invalid={!formElement.config.valid}
                                                shouldValidate={formElement.config.validation}
                                                touched={formElement.config.touched}
                                                errorMessage={formElement.config.errorMessage}
                                                value={formElement.config.value}
                                                label={formElement.config.label}
                                            />
                                        ))}
                                    </div>
                                </GridItem>
                            </GridContainer>
                            <GridContainer>
                                <GridItem xs={12} md={6} sm={6} lg={6}>
                                    {formElementsArray.map(formElement => (
                                        <div style={{ margin: '15px 0' }} className="imp_form_left">
                                            <div className="imp_form_left_upload">
                                                <div>
                                                    <div style={{ textAlign: 'left' }}>
                                                        {formElement.id === 'largeImages' ? <p className="upload_label">{getLabelText(
                                                            this.state.resources.filter((x) => {
                                                                return x.resourceKey === "LargeImage";
                                                            })[0],
                                                            "Large Images (Image minimum resolution: 800X800)"
                                                        )}</p> :
                                                            formElement.id === 'mediumImages' ? <p className="upload_label">{getLabelText(
                                                                this.state.resources.filter((x) => {
                                                                    return x.resourceKey === "MediumImage";
                                                                })[0],
                                                                "Medium Images (Image minimum resolution: 800X800)"
                                                            )}</p> :
                                                                formElement.id === 'thumbnailImages' ? <p className="upload_label">{getLabelText(
                                                                    this.state.resources.filter((x) => {
                                                                        return x.resourceKey === "ThumbnailImage";
                                                                    })[0],
                                                                    "Thumbnail Images (Image minimum resolution: 800X800)"
                                                                )}</p> :
                                                                    formElement.id === 'documents' ? <p className="upload_label">{getLabelText(
                                                                        this.state.resources.filter((x) => {
                                                                            return x.resourceKey === "Documents";
                                                                        })[0],
                                                                        "Documents (Image minimum resolution: 800X800)"
                                                                    )}</p> :
                                                                        formElement.id === 'productCertificate' ? <p className="upload_label">{getLabelText(
                                                                            this.state.resources.filter((x) => {
                                                                                return x.resourceKey === "ProductCertificate";
                                                                            })[0],
                                                                            "ProductCertificate (Image minimum resolution: 800X800)"
                                                                        )}</p> : ""}
                                                    </div>
                                                    <div key={formElement.id} className="upload_input">
                                                        <p className="upload_label">{getLabelText(
                                                            this.state.resources.filter((x) => {
                                                                return x.resourceKey === "DragAndDropYourImageHere";
                                                            })[0],
                                                            "Drag and drop your image here"
                                                        )}</p>
                                                        <Input
                                                            elementType={formElement.config.elementType}
                                                            elementConfig={formElement.config.elementConfig}
                                                            invalid={!formElement.config.valid}
                                                            shouldValidate={formElement.config.validation}
                                                            touched={formElement.config.touched}
                                                            errorMessage={formElement.config.errorMessage}
                                                            value={formElement.config.value}
                                                            changed={event =>
                                                                this.fileSelectedHandler(event, formElement.id)
                                                            }
                                                        />
                                                        <p id="fie-upload-message">
                                                            <span>{getLabelText(
                                                                this.state.resources.filter((x) => {
                                                                    return x.resourceKey === "MaximumUploadSizeUpto20Mb";
                                                                })[0],
                                                                "Maximum upoad size upto 20MB")}</span>
                                                        </p>
                                                        <p id="fie-upload-message">{this.showFileName(formElement.id)}</p>
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    ))}
                                </GridItem>
                                <GridItem xs={12} md={12} sm={12} lg={12}>
                                    <Button solidBtnNew onClick={() => this.submitHandler()}>Submit</Button>
                                </GridItem>
                            </GridContainer>
                        </form>
                    );
                }
                return (
                    <div className="">
                        <div className="import_div">
                            <span>{getLabelText(
                                this.state.resources.filter((x) => {
                                    return x.resourceKey === "ProductBulkImageUpload";
                                })[0],
                                "Bulk Image Upload")}</span>
                            {pageBody}
                        </div>
                    </div>
                );
            case RoleCodes.SUPPLIERSUPPORTPERSON:
                if (!this.state.loading) {
                    pageBody = (
                        <form className="upload-form" onSubmit={() => this.submitHandler()}>
                            <GridContainer>
                                <GridItem md="6">
                                    <div className="newThemeInput">
                                        {formElementsDropdownArray.map(formElement => (
                                            <Input
                                                elementType={formElement.config.elementType}
                                                class={formElement.config.class}
                                                elementConfig={formElement.config.elementConfig}
                                                invalid={!formElement.config.valid}
                                                shouldValidate={formElement.config.validation}
                                                touched={formElement.config.touched}
                                                errorMessage={formElement.config.errorMessage}
                                                value={formElement.config.value}
                                                label={formElement.config.label}
                                                SelectChange={(event) => this.onSupplierChangeHandler(event, formElement.id)}
                                            />
                                        ))}
                                    </div>
                                </GridItem>
                            </GridContainer>
                            <GridContainer>
                                <GridItem xs={12} md={6} sm={6} lg={6}>
                                    <div className="imp_form_left">
                                        <div className="imp_form_left_upload">

                                            {formElementsArray.map((formElement) => (
                                                <div>
                                                    {formElement.id === 'largeImages' ? <p className="upload_label">{getLabelText(
                                                        this.state.resources.filter((x) => {
                                                            return x.resourceKey === "LargeImage";
                                                        })[0],
                                                        "Large Images (Image minimum resolution: 800X800)"
                                                    )}</p> :
                                                        formElement.id === 'mediumImages' ? <p className="upload_label">{getLabelText(
                                                            this.state.resources.filter((x) => {
                                                                return x.resourceKey === "MediumImage";
                                                            })[0],
                                                            "Medium Images (Image minimum resolution: 800X800)"
                                                        )}</p> :
                                                            formElement.id === 'thumbnailImages' ? <p className="upload_label">{getLabelText(
                                                                this.state.resources.filter((x) => {
                                                                    return x.resourceKey === "ThumbnailImage";
                                                                })[0],
                                                                "Thumbnail Images (Image minimum resolution: 800X800)"
                                                            )}</p> :
                                                                formElement.id === 'documents' ? <p className="upload_label">{getLabelText(
                                                                    this.state.resources.filter((x) => {
                                                                        return x.resourceKey === "Documents";
                                                                    })[0],
                                                                    "Documents (Image minimum resolution: 800X800)"
                                                                )}</p> :
                                                                    formElement.id === 'productCertificate' ? <p className="upload_label">{getLabelText(
                                                                        this.state.resources.filter((x) => {
                                                                            return x.resourceKey === "ProductCertificate";
                                                                        })[0],
                                                                        "ProductCertificate (Image minimum resolution: 800X800)"
                                                                    )}</p> : ""}
                                                    <div key={formElement.id} className={formElement.id === "supplier" ? "imp_downl" : "upload_input"}>
                                                        {formElement.id === 'supplier' ? "" :
                                                            <p className="upload_label">{getLabelText(
                                                                this.state.resources.filter((x) => {
                                                                    return x.resourceKey === "DragAndDropYourImageHere";
                                                                })[0],
                                                                "Drag and drop your image here"
                                                            )}</p>}
                                                        <Input
                                                            elementType={formElement.config.elementType}
                                                            elementConfig={formElement.config.elementConfig}
                                                            invalid={!formElement.config.valid}
                                                            shouldValidate={formElement.config.validation}
                                                            touched={formElement.config.touched}
                                                            errorMessage={formElement.config.errorMessage}
                                                            value={formElement.config.value}
                                                            changed={event =>
                                                                this.fileSelectedHandler(event, formElement.id)
                                                            }
                                                        />
                                                        {formElement.id === 'supplier' ? "" :
                                                            <p id="fie-upload-message">
                                                                <span>{getLabelText(
                                                                    this.state.resources.filter((x) => {
                                                                        return x.resourceKey === "MaximumUploadSizeUpto20Mb";
                                                                    })[0],
                                                                    "Maximum upoad size upto 20MB")}</span>
                                                            </p>}
                                                        <p id="fie-upload-message">{this.showFileName(formElement.id)}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                    </div>

                                </GridItem>
                                <GridItem xs={12} md={12} sm={12} lg={12}>
                                    <Button solidBtnNew onClick={() => this.submitHandler()}>Submit</Button>
                                </GridItem>
                            </GridContainer>
                        </form>
                    );
                }
                return (
                    <div className="">
                        <div className="import_div">
                            <span>{getLabelText(
                                this.state.resources.filter((x) => {
                                    return x.resourceKey === "ProductBulkImageUpload";
                                })[0],
                                "Bulk Image Upload")}</span>
                            {pageBody}
                        </div>
                    </div>
                );
            default:
                return <Redirect to="/home" />;
        }
    }
}
const mapStateToProps = state => {
    return {
        userId: state.login.userId
    };
};
export default connect(mapStateToProps)(BulkImgUpload)