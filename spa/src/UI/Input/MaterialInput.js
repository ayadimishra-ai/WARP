import React, { Component } from 'react'
import CustomInput from "../../components/Material/CustomInput/CustomInput.jsx";
import withStyles from "@material-ui/core/styles/withStyles";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import Checkbox from "@material-ui/core/Checkbox";
import Check from "@material-ui/icons/Check";
import ExpandMore from "@material-ui/icons/ExpandMore";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import InputLabel from "@material-ui/core/InputLabel";
import { getWebsiteUrl } from '../../config';
import basicsStyle from "../../assets/jss/material-kit-pro-react/views/componentsSections/basicsStyle.jsx";
import { Creatable } from 'react-select'
import CloudUpload from "@material-ui/icons/CloudUpload";
import Delete from "@material-ui/icons/Delete";
import Visibility from "@material-ui/icons/Visibility";
import Datetime from "react-datetime";
import Close from "@material-ui/icons/Close";
import Popover from '@material-ui/core/Popover';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';

const awsUrl = getWebsiteUrl();
class Input extends Component {
    constructor(props) {

        super(props);
        this.state = {
            shrink: false,
            anchorEl: null,
            autoCompleteFocus: false,
            menuIsOpen: false,
            showDiv: false,
            searchInputDropDown: false,
            searchdrop_popLeft: 0,
            searchdrop_popTop: 0,
        }
        this.myInput = React.createRef()
        this.customSearchDropwdoneBTn = React.createRef()
        this.searchInputDropDown_popup = React.createRef()
    }
    async divOpenOnFocusBlur() {
        this.setState({ showDiv: !this.state.showDiv });
    }

    customSearchDropdownOnclick = async () => {
        const { divOpenOnFocusBlur = f => f } = this.props;
        if (this.props.showDiv === true) {
            await this.setState({ searchInputDropDown: false });
            document.body.style.overflow = "auto"
            divOpenOnFocusBlur(false);
        } else if (this.props.showDiv === false) {
            await this.setState({ searchInputDropDown: true }, () => {
                document.body.style.overflow = "hidden"
                var pos = this.customSearchDropwdoneBTn.current && this.customSearchDropwdoneBTn.current.getClientRects()[0]
                //console.log(this.searchInputDropDown_popup.current && this.searchInputDropDown_popup)
                this.setState({ searchdrop_popLeft: pos.left, searchdrop_popTop: pos.top + pos.height, searchdrop_popWidth: pos.width })
                // window.scroll({
                //     top: 210,
                //     behavior: 'smooth'
                //   });
                divOpenOnFocusBlur(true);
            })

        }
    }

    customSearchDropdownOnLeave = async () => {
        // this.setState({ searchInputDropDown: false })
        const { divOpenOnFocusBlur = f => f } = this.props;
        if (this.props.showDiv === true) {
            await this.setState({ searchInputDropDown: false });
            document.body.style.overflow = "auto"
            divOpenOnFocusBlur(true);
        }
    }

    customSearchDropdownOnChange = (event, Data) => {
        const { changed = f => f } = this.props;
        if (Data !== null) {
            this.setState({ searchInputDropDown: false });
            document.body.style.overflow = "auto"
            changed(Data);
        } else {
            this.setState({ searchInputDropDown: false })
            document.body.style.overflow = "auto"
        }
    }

    labelShrink = () => {
        this.setState({ shrink: true })
    }

    componentDidMount() {

    }
    handleClick = event => {
        this.setState({
            anchorEl: event.currentTarget,
        });
    };
    handleClose = () => {
        this.setState({
            anchorEl: null,
        });
    };
    render() {
        //alert(this.props.FormControlClass)
        const { anchorEl } = this.state;
        const open = Boolean(anchorEl);
        const { classes } = this.props;
        let inputElement = null;
        const inputClasses = [classes.InputElement];
        let validationError = null;
        let showerror = 0;

        if (this.props.invalid && this.props.shouldValidate && this.props.touched) {
            inputClasses.push(classes.Invalid);

            if (this.props.newThemeError !== undefined && this.props.newThemeError !== "" && this.props.newThemeError !== false) {
                showerror = 1;
                validationError = <div className="newThemeError"><p>{this.props.newThemeError}</p></div>
            } else {
                if (this.props.errorMessage !== undefined && this.props.errorMessage !== "" && this.props.errorMessage !== false) {
                    showerror = 1;
                    validationError = <p className={classes.ValidationError}>{this.props.errorMessage}</p>
                }
            }
        }
        let input2class = ""; let datetime2class = ""; let fileErrorClass = "";
        if (this.props.label !== undefined && this.props.label !== "" && this.props.label !== null) {
            if (showerror == 0) {
                input2class = 'input_2_main';
                datetime2class = 'date_input_2_main';
            }
            else {
                input2class = 'input_2_main error_input';
                datetime2class = 'date_input_2_main date_error_input';
                fileErrorClass = "error_input"
            }
        }
        else {
            if (showerror == 0) {
                input2class = 'input_2_main nolabel';
                datetime2class = 'date_input_2_main';
            }
            else {
                input2class = 'input_2_main error_input nolabel';
                datetime2class = 'date_input_2_main date_error_input';
                fileErrorClass = "error_input"
            }
        }
        switch (this.props.elementType) {
            case ('input'):
                inputElement = <CustomInput
                    // labelText="hifssdfsdg"
                    class={this.props.class}
                    onChange={this.props.changed}
                    formControlProps={this.props.formControlProps}
                    inputProps={{ ...this.props.elementConfig }}
                    value={this.props.value}
                    onKeyPress={this.props.onKeyPress}
                    onKeyUp={this.props.onKeyUp}
                    id={this.props.id}
                    onPaste={this.props.onPaste}
                    error={this.props.error}
                    success={this.props.success}
                    disabled={this.props.elementConfig !== undefined ? this.props.elementConfig.disabled !== undefined ? this.props.elementConfig.disabled : false : false}
                />;
                break;
            case ('input_2'):
                inputElement = <CustomInput
                    endIcon={this.props.endIcon}
                    startIcon={this.props.startIcon}
                    variant="filled"
                    mainClass={input2class}
                    labelText={this.props.label}
                    class={this.props.class}
                    onChange={this.props.changed}
                    formControlProps={this.props.formControlProps}
                    inputProps={{ ...this.props.elementConfig }}
                    value={this.props.value}
                    onKeyPress={this.props.onKeyPress}
                    onKeyUp={this.props.onKeyUp}
                    id={this.props.id}
                    onPaste={this.props.onPaste}
                    error={this.props.error}
                    success={this.props.success}
                    onFocus={this.props.onFocus}
                    onBlur={this.props.onBlur}
                    disabled={this.props.elementConfig !== undefined ? this.props.elementConfig.disabled !== undefined ? this.props.elementConfig.disabled : false : false}
                />;
                break;
            case ('textarea'):
                inputElement = <React.Fragment>
                    <textarea
                        className={classes + ' ' + this.props.class + ' ' + 'textarea' + ' ' + input2class}
                        {...this.props.elementConfig}
                        value={this.props.value}
                        onChange={this.props.changed}
                        onPaste={this.props.onPaste} />
                        {this.props.errorMessage && <div className="newThemeError">
                        <p>{this.props.errorMessage}</p></div>}
                </React.Fragment>;
                break;
            case ('select'):
                inputElement = (
                    <FormControl
                        className={classes.selectFormControl + ' ' + this.props.FormControlClass}
                        fullWidth
                        disabled={this.props.elementConfig !== undefined ? this.props.elementConfig.disabled !== undefined ? this.props.elementConfig.disabled : false : false}
                    >
                        <InputLabel
                            htmlFor="simple-select"
                            className={classes.selectLabel + ' ' + this.props.selectInputlabel}
                        //shrink={this.state.shrink}
                            shrink={this.state.shrink === undefined ? false : this.state.shrink}
                        >
                            {this.props.elementConfig.label}
                        </InputLabel>
                        <Select id={this.props.id} className={this.props.selectTag + ' ' + 'material_select'}
                            MenuProps={{
                                className: classes.selectMenu
                            }}
                            IconComponent={ExpandMore}
                            classes={{
                                select: classes.select
                            }}
                            value={this.props.value}
                            onChange={(e) => { this.props.SelectChange(e); this.labelShrink(e) }}
                            inputProps={{
                                className: "selectmate" + ' ' + this.props.class,
                            }}
                        >

                            <MenuItem
                                classes={{
                                    root: classes.selectMenuItem,
                                    selected: classes.selectMenuItemSelected
                                }}
                                value="0"
                                key="0"
                            >
                                {this.props.selectLableHeader ? this.props.selectLableHeader : '-- Select --'}
                            </MenuItem>
                            {this.props.elementConfig.options.map(
                                option => (
                                    <MenuItem
                                        classes={{
                                            root: classes.selectMenuItem,
                                            selected: classes.selectMenuItemSelected
                                        }}
                                        value={option.Id}
                                        key={option.Id}
                                    >
                                        {option.Value}
                                    </MenuItem>
                                )
                            )}
                        </Select>
                    </FormControl>
                );
                break;
            case ('select_2'):
                inputElement = (
                    <FormControl
                        variant="filled"
                        className={input2class}
                        fullWidth
                        disabled={this.props.elementConfig !== undefined ? this.props.elementConfig.disabled !== undefined ? this.props.elementConfig.disabled : false : false}
                    >
                        <InputLabel
                            htmlFor="simple-select"
                            className={classes.selectLabel + ' ' + this.props.selectInputlabel}
                        //shrink={this.state.shrink}
                           
                        >
                            {this.props.label}
                        </InputLabel>
                        <Select id={this.props.id} className={this.props.selectTag + ' ' + 'material_select'}
                            MenuProps={{
                                className: classes.selectMenu
                            }}
                            // IconComponent={ExpandMore}
                            classes={{
                                select: classes.select
                            }}
                            value={this.props.value}
                            onChange={(e) => { this.props.SelectChange(e); this.labelShrink(e) }}
                            inputProps={{
                                className: "selectmate" + ' ' + this.props.class,
                            }}
                        >

                            <MenuItem
                                classes={{
                                    root: classes.selectMenuItem,
                                    selected: classes.selectMenuItemSelected
                                }}
                                value=""
                                key=""
                            >
                                {this.props.selectLableHeader ? this.props.selectLableHeader : '-- Select --'}
                            </MenuItem>
                            {this.props.elementConfig.options.map(
                                option => (
                                    <MenuItem
                                        classes={{
                                            root: classes.selectMenuItem,
                                            selected: classes.selectMenuItemSelected
                                        }}
                                        value={option.Id}
                                        key={option.Id}
                                    >
                                        {option.Value}
                                    </MenuItem>
                                )
                            )}
                        </Select>
                    </FormControl>
                );
                break;

            case ('multiSelect'):
                inputElement = (
                    <FormControl
                        disabled={this.props.elementConfig !== undefined ? this.props.elementConfig.disabled !== undefined ? this.props.elementConfig.disabled : false : false}
                        className={classes.selectFormControl + ' ' + this.props.FormControlClass}
                        fullWidth>
                        <InputLabel
                            htmlFor="select-multiple"
                            className={classes.selectLabel + ' ' + this.props.InputClass}
                            shrink={this.state.shrink}>
                            {this.props.selectlabel}
                        </InputLabel>
                        <Select
                            className={this.props.SelectTagClass}
                            multiple
                            MenuProps={{
                                className: classes.selectMenu + ' ' + ''
                            }}
                            classes={{
                                select: classes.select
                            }}
                            value={this.props.value}
                            onChange={(e) => { this.props.SelectChange(e); this.labelShrink(e); }}
                            inputProps={{
                                className: "selectmate" + ' ' + this.props.class,
                            }}
                            selected={this.props.selected}
                        >
                            {this.props.elementConfig.options.map(
                                option => (
                                    <MenuItem
                                        classes={{
                                            root: classes.selectMenuItem + ' ' + this.props.img_option,
                                            selected: classes.selectMenuItemSelectedMultiple
                                        }}
                                        value={option.Id}
                                        key={option.Id}
                                    >
                                        {this.props.BindFiles === true ? <img alt=" " src={awsUrl() + this.props.FileFolder + "/" + option.Value}
                                            onError={(e) => { e.target.onerror = null; e.target.src = awsUrl() + this.props.FileFolder + "/" + "default.jpg" }}></img> : option.Value}
                                    </MenuItem>
                                )
                            )}
                        </Select>
                    </FormControl>
                );
                break;
            case ('checkbox'):
                inputElement = (
                    <FormControlLabel
                        disabled={this.props.elementConfig !== undefined ? this.props.elementConfig.disabled !== undefined ? this.props.elementConfig.disabled : false : false}
                        onClick={(e) => { this.props.onClickd(e) }}
                        control={
                            <Checkbox
                                className={this.props.elementConfig !== undefined ? this.props.elementConfig.disabled !== undefined ? this.props.elementConfig.disabled && 'disabled_checkbox' : "" : ""}
                                id={this.props.id}
                                tabIndex={-1} //done
                                onChange={(e) => { this.props.changed(e) }}    //done           
                                checked={this.props.checked} //done
                                checkedIcon={<Check className={classes.checkedIcon} />}
                                icon={<Check className={classes.uncheckedIcon} />}
                                classes={{
                                    checked: classes.checked,
                                    root: classes.checkRoot
                                }}

                            />
                        }
                        classes={{ label: classes.label }}
                        label={this.props.checkBoxLabel} //done
                        className={this.props.class}
                    />

                )
                break;
            case ('autoComplete'):
                inputElement = (
                    <Creatable
                        value={this.props.value}
                        isClearable
                        classNamePrefix="react_select"
                        onChange={this.props.changed}
                        // onInputChange={this.props.changed}
                        options={this.props.elementConfig.options}
                        isDisabled={this.props.elementConfig !== undefined ? this.props.elementConfig.disabled !== undefined ? this.props.elementConfig.disabled : false : false}
                    />
                )
                break;
            case ('autoComplete_2'):
                inputElement = (
                    <div className='autoComplete_2_searchbox'>
                        <CustomInput
                            variant="filled"
                            mainClass={input2class}
                            labelText={this.props.label}
                            class={this.props.class}
                            onChange={this.props.changed}
                            onFocus={(e) => this.props.divOpenOnFocusBlur(e)}
                            //onBlur={() => this.divOpenOnFocusBlur()}
                            //onBlur={() => this.props.handleDiv(false)}
                            formControlProps={this.props.formControlProps}
                            inputProps={{ ...this.props.elementConfig }}
                            value={this.props.value}
                            onKeyPress={this.props.onKeyPress}
                            onKeyUp={this.props.onKeyUp}
                            id={this.props.id}
                            onPaste={this.props.onPaste}
                            error={this.props.error}
                            success={this.props.success}
                            disabled={this.props.elementConfig !== undefined ? this.props.elementConfig.disabled !== undefined ? this.props.elementConfig.disabled : false : false}
                        />
                        {this.props.showDiv ? <div className='autoComplete_2_popup'>
                            {this.props.elementConfig.options.map((data, i) => {
                                return (
                                    <span onClick={() => this.props.changed(data)}>{data.label}</span>
                                )
                            })
                            }
                        </div> : null}
                    </div>
                )
                break;
            case ('radioGroup'):
                inputElement = (
                    <RadioGroup
                        aria-label="radio"
                        name="radio"
                        value={this.props.value}
                        onChange={this.props.radioChanged}
                        row
                        className='radio_Group'
                    >
                        {this.props.radioBtnOptions.map((data) => {
                            return (
                                <FormControlLabel value={data} control={<Radio />} label={data} />
                            )
                        })}
                    </RadioGroup>
                )
                break;
            case ('file'):
                inputElement = (
                    <div className="category_img_upload">
                        <input type='file' onChange={this.props.changed} />
                        <div className="">
                        <div>
                                <h5>{this.props.fileLabel ? this.props.fileLabel + ' -' : ''} Drag and drop <br /> your image here</h5>
                                {this.props.elementConfig.size === 0 ? '': <p>(Image Size is {this.props.elementConfig.size} {(this.props.elementConfig.unit===undefined || this.props.elementConfig.unit===null || this.props.elementConfig.unit==="")? "" : this.props.elementConfig.unit  } and Image dimension is {this.props.elementConfig.width} px * {this.props.elementConfig.height} px  configurable on global settings.)</p>}
                            </div>
                            <div>
                                <CloudUpload />
                            </div>
                        </div>
                        {this.props.file && <div style={{width:'320px',height:'320px'}}>
                            <img style={{width:'100%'}} src={this.props.file} alt={this.props.file} />
                        </div>}
                    </div>
                    
                )
                break;
            case ('file2'):
                inputElement = (
                    <React.Fragment>
                        <div className="certficate_upload">
                            <input style={{ display: this.props.elementConfig !== undefined && this.props.elementConfig.disabled === true ? 'none' : '' }} type='file' onChange={this.props.changed}
                                disabled={this.props.elementConfig !== undefined ? this.props.elementConfig.disabled !== undefined ? this.props.elementConfig.disabled : false : false}
                            />
                            <div className="file2_input">
                                <p>{this.props.certificateType}</p>
                                <div className={this.props.clearAllowed === false ? 'uploadIcon' : 'removeIcon'}>
                                    {this.props.clearAllowed === false ? <CloudUpload /> :
                                        <Close onClick={this.props.removehandler} />
                                    }
                                </div>
                            </div>
                        </div>
                        {this.props.note && <div className="file2_note">
                            <span>{this.props.note}</span>
                        </div>
                        }
                    </React.Fragment>
                )
                break;
            case ('file2_2'):
                inputElement = (
                    <React.Fragment>
                        <div className={"certficate_upload certficate_upload2" + ' ' + fileErrorClass}>
                            <label className={this.props.certificateType ? "newDesign_date_picker_label_shrink" : "newDesign_date_picker_label"}>{this.props.label}</label>
                            <input id={this.props.key} title={this.props.certificateType} style={{ display: this.props.elementConfig !== undefined && this.props.elementConfig.disabled === true ? 'none' : '' }} type='file' onChange={this.props.changed}
                                disabled={this.props.elementConfig !== undefined ? this.props.elementConfig.disabled !== undefined ? this.props.elementConfig.disabled : false : false}
                            />
                            <div className="file2_input">
                                <p className="primary_grey_12">{this.props.certificateType ? this.props.certificateType : ''}</p>
                                <div style={{ marginTop: '-12px' }} className={this.props.clearAllowed === false ? 'uploadIcon' : 'removeIcon'}>
                                    {this.props.clearAllowed === false ? <svg xmlns="http://www.w3.org/2000/svg" width="27" height="18" viewBox="0 0 27 18" fill="none">
                                        <path id="Vector" d="M13.5 0C10.8737 0 8.66319 1.40568 7.2334 3.39038C3.24614 3.43563 0 6.68992 0 10.6875C0 14.7131 3.28695 18 7.3125 18H20.8125C24.2163 18 27 15.2163 27 11.8125C27 8.44834 24.2742 5.71073 20.9246 5.64697C19.9462 2.40927 17.0461 0 13.5 0ZM13.5 2.25C16.3176 2.25 18.6232 4.30368 19.0481 6.9917L19.2195 8.07275L20.3049 7.93213C20.5562 7.89941 20.7168 7.875 20.8125 7.875C23 7.875 24.75 9.62502 24.75 11.8125C24.75 14 23 15.75 20.8125 15.75H14.625V11.25H18L13.5 6.75L9 11.25H12.375V15.75H7.3125C4.50255 15.75 2.25 13.4974 2.25 10.6875C2.25 7.87755 4.50255 5.625 7.3125 5.625C7.35187 5.625 7.44352 5.63286 7.59375 5.64038L8.28149 5.67554L8.62427 5.07788C9.59637 3.3889 11.4051 2.25 13.5 2.25Z" fill="#FF9E1B" />
                                    </svg> :
                                        <Close onClick={this.props.removehandler} />
                                    }
                                </div>
                            </div>
                        </div>
                        {this.props.note && <div className="file2_note primary_grey_12">
                            <span>{this.props.note}</span>
                        </div>
                        }
                    </React.Fragment>
                )
                break;
            case ('file2_3'):
                inputElement = (
                    <React.Fragment>
                        <div className={"certficate_upload certficate_upload2" + ' ' + fileErrorClass}>
                            <label className={this.props.DocumentValue ? "newDesign_date_picker_label_shrink" : "newDesign_date_picker_label"}>{this.props.label}</label>
                            <input title={this.props.certificateType} style={{ display: this.props.elementConfig !== undefined && this.props.elementConfig.disabled === true ? 'none' : '' }} type='file' onChange={this.props.changed}
                                disabled={this.props.elementConfig !== undefined ? this.props.elementConfig.disabled !== undefined ? this.props.elementConfig.disabled : false : false}
                            />
                            <div className={"file2_input"}>
                                <p className="primary_grey_12">{this.props.DocumentValue ? this.props.DocumentValue : ''}</p>
                                <div style={{ marginTop: '-12px' }} className={this.props.clearAllowed === false ? 'uploadIcon' : 'removeIcon'}>
                                    {this.props.viewFile ? <a target='_blank' href={this.props.viewFile}><Visibility style={{ color: '#FF9E1B', cursor: 'pointer', pointerEvents:'all' }} /></a> : this.props.clearAllowed === false ? <svg xmlns="http://www.w3.org/2000/svg" width="27" height="18" viewBox="0 0 27 18" fill="none">
                                        <path id="Vector" d="M13.5 0C10.8737 0 8.66319 1.40568 7.2334 3.39038C3.24614 3.43563 0 6.68992 0 10.6875C0 14.7131 3.28695 18 7.3125 18H20.8125C24.2163 18 27 15.2163 27 11.8125C27 8.44834 24.2742 5.71073 20.9246 5.64697C19.9462 2.40927 17.0461 0 13.5 0ZM13.5 2.25C16.3176 2.25 18.6232 4.30368 19.0481 6.9917L19.2195 8.07275L20.3049 7.93213C20.5562 7.89941 20.7168 7.875 20.8125 7.875C23 7.875 24.75 9.62502 24.75 11.8125C24.75 14 23 15.75 20.8125 15.75H14.625V11.25H18L13.5 6.75L9 11.25H12.375V15.75H7.3125C4.50255 15.75 2.25 13.4974 2.25 10.6875C2.25 7.87755 4.50255 5.625 7.3125 5.625C7.35187 5.625 7.44352 5.63286 7.59375 5.64038L8.28149 5.67554L8.62427 5.07788C9.59637 3.3889 11.4051 2.25 13.5 2.25Z" fill="#FF9E1B" />
                                    </svg> :
                                        <Close onClick={this.props.removehandler} />
                                    }
                                </div>
                            </div>
                        </div>
                        {this.props.note && <div className="file2_note primary_grey_12">
                            <span>{this.props.note}</span>
                        </div>
                        }
                    </React.Fragment>
                )
                break;
            case ('file3'):
                inputElement = (
                    <div className="company_certficate_upload">
                        {this.props.disabled ? '' : <input type='file' onChange={this.props.changed} />}
                        {this.props.disabled ? <div className="after_uploading">
                            <div>
                                <h6>{this.props.certficateName}</h6>
                            </div>
                            <div>
                                <a target='_blank' href={this.props.link}><Visibility titleAccess={this.props.titlename} /></a>
                                <Delete onClick={this.props.click} />
                            </div>
                        </div> :
                            <div className={this.props.selectedFile !== undefined && this.props.selectedFile ? "after_uploading" : "before_upload"}>
                                <div>
                                    <h6>{this.props.certficateName}</h6>
                                </div>
                                <div>
                                    <CloudUpload />
                                </div>
                            </div>
                        }
                    </div>
                )
                break;
            case ('datetime'):
                inputElement = (
                    <Datetime
                        isValidDate={this.props.disableDate && this.props.disableDate}
                        className={classes.InputElement + "newThemeInputDate"}
                        value={this.props.value}
                        onChange={this.props.changed}
                        timeFormat={false}
                        closeOnSelect={true}
                        inputProps={{ disabled: this.props.elementConfig !== undefined ? this.props.elementConfig.disabled !== undefined ? this.props.elementConfig.disabled : false : false }}
                    />
                )
                break;
            case ('datetime_2'):
                inputElement = (<React.Fragment>
                    <label className={this.props.value ? "newDesign_date_picker_label_shrink" : "newDesign_date_picker_label"}>{this.props.label}</label>
                    <Datetime
                        isValidDate={this.props.disableDate && this.props.disableDate}
                        className={datetime2class}
                        value={this.props.value}
                        onChange={this.props.changed}
                        dateFormat={this.props.dateFormat ? this.props.dateFormat : 'DD-MM-YYYY'}
                        timeFormat={false}
                        closeOnSelect={true}
                       // inputProps={{ disabled: this.props.elementConfig !== undefined ? this.props.elementConfig.disabled !== undefined ? this.props.elementConfig.disabled : false : false, class: 'date_newInput_2' }}
                        inputProps={{ disabled: this.props.elementConfig !== undefined ? this.props.elementConfig.disabled !== undefined ? this.props.elementConfig.disabled : false : false, class: 'date_newInput_2', onKeyDown: (e) => { e.preventDefault() } }}
                    />
                </React.Fragment>
                )
                break;
            case ('customMultiselect'):
                inputElement = (<React.Fragment>
                    <div ref={this.myInput} className={'customMulti_select '}
                        aria-owns={open ? 'customMultiselect' : undefined}
                        aria-haspopup="true"
                        variant="contained"
                        onClick={this.handleClick}
                    >
                        <label
                            className="customMultiselect_btn"
                        >
                            {this.props.label}
                            <ExpandMore />
                        </label>
                    </div>
                    <Popover
                        id={'customMultiselect'}
                        open={open}
                        anchorEl={anchorEl}
                        onClose={() => this.setState({ anchorEl: null })}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                        }}
                        PaperProps={{
                            style: { width: this.myInput.current && this.myInput.current.clientWidth + 'px' },
                        }}
                    >
                        <div className="customMultiselect_popup">
                            {this.props.elementConfig.options.map((data) => {
                                // console.log(this.props.options)
                                return (
                                    <FormControlLabel
                                        disabled={this.props.elementConfig !== undefined ? this.props.elementConfig.disabled !== undefined ? this.props.elementConfig.disabled : false : false}
                                        control={
                                            <Checkbox
                                                id={data.Id}
                                                tabIndex={-1} //done
                                                onChange={(e) => { this.props.changed(data.Id) }}    //done
                                                checked={data.IsSelected} //done
                                                checkedIcon={<Check className={classes.checkedIcon} />}
                                                icon={<Check className={classes.uncheckedIcon} />}
                                                classes={{
                                                    checked: classes.checked,
                                                    root: classes.checkRoot
                                                }}
                                            />
                                        }
                                        classes={{ label: classes.label }}
                                        label={data.Value} //done
                                        className={this.props.class}
                                    />
                                )
                            })}
                        </div>
                    </Popover>
                </React.Fragment>
                )
                break;
            case ('searchInputDropdown'):
                inputElement = (<div ref={this.customSearchDropwdoneBTn} className='searchInputDropdown_box'>
                    <CustomInput
                        startIcon={this.props.startIcon}
                        variant="filled"
                        mainClass={input2class}
                        labelText={this.props.label}
                        class={this.props.class}
                        onChange={(event) => { this.customSearchDropdownOnChange(event, null) }}
                        formControlProps={this.props.formControlProps}
                        inputProps={{ ...this.props.elementConfig }}
                        onFocus={(e) => this.customSearchDropdownOnclick(e)}
                        // onBlur={() => this.customSearchDropdownOnLeave()}
                        value={this.props.value}
                        onKeyPress={this.props.onKeyPress}
                        onKeyUp={this.props.onKeyUp}
                        id={this.props.id}
                        onPaste={this.props.onPaste}
                        error={this.props.error}
                        success={this.props.success}
                        disabled={this.props.elementConfig !== undefined ? this.props.elementConfig.disabled !== undefined ? this.props.elementConfig.disabled : false : false}
                    />
                    {this.state.searchInputDropDown && <div onClick={(event) => { this.customSearchDropdownOnChange(event, null) }} className="backdrop"></div>}
                    {this.state.searchInputDropDown && <div style={{ width: this.state.searchdrop_popWidth + 'px' }} ref={this.searchInputDropDown_popup} id="data" className='searchInputDropdown_popup'>
                        {this.props.elementConfig.options.map((data, i) => {
                            return (
                                <p>
                                    <span onClick={(event) => { this.customSearchDropdownOnChange(event, data) }}>{data.deliveryLocationName}</span>
                                    {this.props.startIcon && this.props.startIcon}
                                </p>
                            )
                        })
                        }
                        {/* <span>
                            kdfjsd hdfsjd dsflkfsd ksdfldkf kljsldfds lksdfjl klsdfj kdsjfkd
                        </span>
                        <span>
                        kdfjsd hdfsjd dsflkfsd ksdfldkf kljsldfds lksdfjl klsdfj kdsjfkd
                        </span>
                        <span>
                        kdfjsd hdfsjd dsflkfsd ksdfldkf kljsldfds lksdfjl klsdfj kdsjfkd
                        </span>
                        <span>
                        kdfjsd hdfsjd dsflkfsd ksdfldkf kljsldfds lksdfjl klsdfj kdsjfkd
                        </span>
                        <span>
                        kdfjsd hdfsjd dsflkfsd ksdfldkf kljsldfds lksdfjl klsdfj kdsjfkd
                        </span>
                        <span>
                            kdfjsd hdfsjd
                        </span>
                        <span>
                            kdfjsd hdfsjd
                        </span> */}
                    </div>}
                </div>
                )
                break;
            default:
                inputElement = <input
                    className={classes.InputElement}
                    {...this.props.elementConfig}
                    value={this.props.value}
                    onChange={this.props.changed} />;
        }

        return (
            <div className={this.props.elementConfig !== undefined && this.props.elementConfig.disabled !== undefined && this.props.elementConfig.disabled === true ? 'disabledTextfield input_parent_div' : 'input_parent_div'}>
                {
                    this.props.elementType !== 'autoComplete_2' && this.props.elementType !== 'customMultiselect' && this.props.elementType !== 'file2_2' && this.props.elementType !== 'file2_3' && this.props.elementType !== 'datetime_2' && this.props.elementType !== 'input_2' && this.props.elementType !== "select_2" ?
                        <label className={this.props.labelClass && this.props.labelClass ? this.props.labelClass + ' input_label' : 'input_label'}>{this.props.label}</label> : ""
                }
                {inputElement}
                {validationError}

                {this.props.passwordError && <div className="passwordError"><p>{this.props.passwordError}</p></div>}
            </div>
        );
    }
}
export default withStyles(basicsStyle)(Input);