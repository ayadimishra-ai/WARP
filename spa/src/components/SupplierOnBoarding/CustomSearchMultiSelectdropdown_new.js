import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Popover from '@material-ui/core/Popover';
import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import Input from "../../UI/Input/MaterialInput";
import Accordion from "../Material/Accordion/Accordion.jsx";
import axios from 'axios';
import Close from "@material-ui/icons/Close";
import { getServiceUrl } from '../../config';
import { confirmAlert } from 'react-confirm-alert';


const styles = theme => ({
    typography: {
        margin: theme.spacing.unit * 2,
    },
});

let count = 0;
let selectedCategories = [];
let DeleteCategoryValue = "";
let isSingleSelection = false;
let Filtertext = '';
class CustomSearchMultiSelectdropdown_new extends Component {
    constructor(props) {
        super(props);
        const { ProductTypedetails } = props;
        this.state = {
            anchorEl: null,
            ProductTypedetails: [],
            IscomponentDidUpdate: 0,
            IsEditProfile: false,
            Loader: true,
            items: [],
            selectedCategories: [],
            DeleteCategoryGuid: "",
            IsSingleSelection: false,
            Allfiltertext: '',
            ProductTypedetailsFiltered: [],
            ProductTypeFiltered: '',
            mappedCategoryList: []
        };
        this.myInput = React.createRef()
    }

    handleClick = event => {
        this.setState({
            anchorEl: event.currentTarget,
        });
    };

    componentDidUpdate() {
        const { DeleteCategoryGuid } = this.props;
        if (DeleteCategoryGuid !== undefined) {
            if (DeleteCategoryGuid !== null && DeleteCategoryGuid !== "") {
                DeleteCategoryValue = DeleteCategoryGuid;
            }
        }
    }

    async componentDidMount() {
        const { ProductTypedetails, DeleteCategoryGuid, IsSingleSelection } = this.props;
        let Details = ProductTypedetails;
        let DeleteCategory = DeleteCategoryGuid;
        let DeleteCategoryValue = ""
        if (DeleteCategory !== undefined) {
            if (DeleteCategory !== null && DeleteCategory !== "") {
                DeleteCategoryValue = DeleteCategory;
            }
        }
        if (IsSingleSelection != undefined) {
            if (IsSingleSelection !== null && IsSingleSelection !== "") {
                isSingleSelection = IsSingleSelection;
            }
        }
        await this.setState({ ProductTypedetails: Details, DeleteCategoryGuid: DeleteCategoryValue, IsSingleSelection: isSingleSelection, ProductTypedetailsFiltered: Details });
        this.load();
        this.getMappedCategory();

    }

    handleClose = () => {
        this.setState({
            anchorEl: null,
        });
    };

    checkBox = (ev) => {
        ev.stopPropagation();
    }

    Oncheck = (event, isSelected, categoryGuid, categoryName) => {
        event.stopPropagation();
        const menuData = this.state.ProductTypedetails;
        selectedCategories = [];

        let userGuid = "";
        userGuid = localStorage.userId;
    if (this.props.Pagestep==="onboarding")
    {
        
        if (categoryGuid !== null || categoryGuid !== undefined || categoryGuid !== "" || categoryGuid !== "null") {
        
            var config = {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.tokenId,
                    'categoryGuid': categoryGuid,
                    'SupplierGuid': userGuid,
                },
            };
             axios.get(getServiceUrl() + 'Category/ValidationUpdateProductOffering', config)
                .then(response => {
                    
                   let checkcategorymappedresponse = response.data
                   if (checkcategorymappedresponse ==='Category not mapped')
                   { 
                    let menuItems = menuData.map((item, i) => {
                        let menuItem = this.UpdateMenuItem(item, i, categoryGuid, isSelected);
                        return menuItem;
                    });
                    this.setState({ ProductTypedetails: menuItems, selectedCategories: selectedCategories, ProductTypedetailsFiltered: menuItems, });
                    this.load();
                    
                    }        
                    else{
                        confirmAlert({
                            customUI: ({ onClose }) => <div className="newErrorPopup">
                                <div>
                                    <h5>Error</h5>
                                    <Close onClick={onClose} />
                                </div>
                                <p>Product Category cannot be removed</p>
                            </div>
                        });
                    }
                }
                )}
    }
    else{
            let menuItems = menuData.map((item, i) => {
                let menuItem = this.UpdateMenuItem(item, i, categoryGuid, isSelected);
                return menuItem;
            });
            this.setState({ ProductTypedetails: menuItems, selectedCategories: selectedCategories, ProductTypedetailsFiltered: menuItems, });
            this.load();
        }
    }
    UpdateMenuItem = (item, i, categoryGuid, isSelected) => {
        let menuItem;
        if (item.listCategories.length === 0) {
            if (categoryGuid == item.categoryGuid) {
                if (isSelected === true) {
                    item.isSelected = false;
                }

                if (isSelected === false) {
                    item.isSelected = true;
                    if (isSingleSelection === true) {
                        let data = {
                            categoryName: item.categoryName,
                            categoryGuid: item.categoryGuid,
                            isArtworkApplicable: item.isArtworkApplicable !== undefined ? item.isArtworkApplicable : "",
                            categoryImage: item.categoryImage !== undefined ? item.categoryImage : ""
                        }
                        selectedCategories.push(data);
                    } else {
                        let data = {
                            categoryName: item.categoryName,
                            categoryGuid: item.categoryGuid
                        }
                        selectedCategories.push(data);
                    }
                }
            }
            if (isSingleSelection === true) {
                if (categoryGuid !== item.categoryGuid) {
                    if (item.isSelected === true) {
                        item.isSelected = false;
                    }

                }
            }
            menuItem = item;
        } else {
            if (categoryGuid == item.categoryGuid && isSingleSelection === false) {
                if (isSelected === true) {
                    item.isSelected = false;
                    let menuItemChildren = item.listCategories.map((item, i) => {
                        let menuItem = this.UpdateMenuItem(item, i, item.categoryGuid, isSelected);
                        return menuItem;
                    });
                }
                if (isSelected === false) {
                    item.isSelected = true;
                    let menuItemChildren = item.listCategories.map((item, i) => {
                        let menuItem = this.UpdateMenuItem(item, i, item.categoryGuid, isSelected);
                        return menuItem;
                    });
                }
            } else {
                if (isSingleSelection === true) {
                    let menuItemChildren = item.listCategories.map((item, i) => {
                        let menuItem = this.UpdateMenuItem(item, i, categoryGuid, isSelected);
                        return menuItem;
                    });
                } else {
                    let menuItemChildren = item.listCategories.map((item, i) => {
                        let menuItem = this.UpdateMenuItem(item, i, categoryGuid, isSelected);
                        return menuItem;
                    });

                    var selectedCount = item.listCategories.filter(y => y.isSelected === true).length;
                    var totalCount = item.listCategories.length;
                    if (selectedCount === totalCount) {
                        item.isSelected = true;
                    } else {
                        item.isSelected = false;
                    }
                }
            }
            let  mappedCategoryList = this.state.mappedCategoryList;
            if(item.listCategories !== undefined){
                mappedCategoryList.map(itemData=>{
                    if(item.listCategories.filter(x=> x.categoryGuid === itemData).length > 0){
                        let index = item.listCategories.findIndex(x=> x.categoryGuid === itemData);
                        if(index > -1){
                            item.listCategories[index].isSelected = true;
                        }
                    }else{

                    }
                })
            }
            menuItem = item;
        }
        return menuItem;
    }

    returnMenuItem = (item, i) => {
        let menuItem;

        if (item.listCategories.length === 0) {
            if (item.isSelected === true) {
                if (DeleteCategoryValue === item.categoryGuid) {
                    item.isSelected = false;
                } else {
                    if (isSingleSelection === true) {
                        let data = {
                            categoryName: item.categoryName,
                            categoryGuid: item.categoryGuid,
                            isArtworkApplicable: item.isArtworkApplicable !== undefined ? item.isArtworkApplicable : "",
                            categoryImage: item.categoryImage !== undefined ? item.categoryImage : ""
                        }
                        selectedCategories.push(data);
                    } else {
                        let data = {
                            categoryName: item.categoryName,
                            categoryGuid: item.categoryGuid
                        }
                        selectedCategories.push(data);
                    }
                    // let data = {
                    //     categoryName: item.categoryName,
                    //     categoryGuid: item.categoryGuid
                    // }
                    // selectedCategories.push(data);
                }
            }
            menuItem = (
                <div className="prod_type_list">
                    <div style={{ paddingLeft: (count + 1) * 35 + 'px', borderBottom: '1px solid #cdcdcd', marginLeft: '0px' }}>
                        <Input
                            id={item.categoryGuid}
                            class="innerAccordlable"
                            elementConfig={{ 'disabled': false }}
                            onClickd={this.checkBox}
                            changed={(event) => this.Oncheck(event, item.isSelected, item.categoryGuid, item.categoryName)}
                            checkBoxLabel={item.categoryName}
                            checked={item.isSelected}
                            elementType='checkbox' />
                    </div>
                </div>
            );


        } else {
            count = count + 1;
            let menuItemChildren = item.listCategories.map((item, i) => {
                let menuItem = this.returnMenuItem(item, i);
                return menuItem;
            });

            var selectedCount = item.listCategories.filter(y => y.isSelected === true).length;
            var totalCount = item.listCategories.length;
            if (selectedCount === totalCount) {
                item.isSelected = true;
            } else {
                item.isSelected = false;
            }

            menuItem = (
                <div className="main_accordian dropdownAccordion">
                    <Accordion
                        active={0}
                        collapses={[
                            {
                                title: <div style={{ paddingLeft: count * 35 + 'px' }}>
                                    {
                                        this.props.IsProductShow !== undefined ? this.props.IsProductShow === true ?
                                            <div className="input_parent_div">
                                                <label className='innerAccordlable'>
                                                    <span style={{ padding: '14px', display: 'block' }} >{item.categoryName}</span>
                                                </label>
                                            </div>
                                            :
                                            <Input
                                                id={item.categoryGuid}
                                                class="innerAccordlable"
                                                elementConfig={{ 'disabled': false }}
                                                onClickd={this.checkBox}
                                                changed={(event) => this.Oncheck(event, item.isSelected, item.categoryGuid, item.categoryName)}
                                                checked={item.isSelected}
                                                checkBoxLabel={item.categoryName}
                                                elementType='checkbox' />
                                            :
                                            <Input
                                                id={item.categoryGuid}
                                                class="innerAccordlable"
                                                elementConfig={{ 'disabled': false }}
                                                onClickd={this.checkBox}
                                                changed={(event) => this.Oncheck(event, item.isSelected, item.categoryGuid, item.categoryName)}
                                                checked={item.isSelected}
                                                checkBoxLabel={item.categoryName}
                                                elementType='checkbox' />
                                    }

                                </div>,
                                content: <Fragment>

                                    {menuItemChildren}
                                </Fragment>
                            }]}
                    />
                </div>

            );
            count = count - 1;
        }
        return menuItem;
    };


    load = async () => {
        const { onchange = f => f } = this.props;
        let menuData = this.state.ProductTypedetails;
        selectedCategories = [];
        this.setState({ Loader: true });
        let menuItems = menuData.map((item, i) => {
            let menuItem = this.returnMenuItem(item, i);
            return menuItem;
        });
        await this.setState({ items: menuItems });
        let data = {
            ProductTypedetails: menuData,
            selectedCategories: selectedCategories
        }
        onchange(data);
    };
    loaddata = async () => {
        const { onchange = f => f } = this.props;
        let menuData = this.state.ProductTypedetailsFiltered;
        selectedCategories = [];
        this.setState({ Loader: true });
        let menuItems = menuData.map((item, i) => {
            let menuItem = this.returnMenuItem(item, i);
            return menuItem;
        });
        await this.setState({ items: menuItems });
        let data = {
            ProductTypedetails: menuData,
            selectedCategories: selectedCategories
        }
        onchange(data);
    };

    getDataAllFilter = (event) => {
        Filtertext = event.target.value;

        this.setState({
            AllFiltertext: Filtertext
        });


        let FilteredProducts = [];
        FilteredProducts = this.state.ProductTypedetailsFiltered;

        const filterFn = (item, tag) => {
            return item.categoryName.toLowerCase().includes(Filtertext.toLowerCase())

        }

        const recursiveFind = (items, tag) => {
            return items.reduce((acc, cur) => {

                if (!cur.listCategories || cur.listCategories.length === 0) {

                    if (filterFn(cur, Filtertext.toLowerCase())) {
                        acc.push(cur)
                    }

                } else {
                    const newCur = { ...cur, listCategories: [...recursiveFind(cur.listCategories, Filtertext.toLowerCase())] }

                    if (JSON.stringify(newCur).includes(Filtertext.toLowerCase())) {
                        acc.push(newCur)
                    }
                }

                return acc
            }, [])
        }


        if (Filtertext !== '') {
            //   this.setState({ ProductTypedetails: FilteredProducts })
            const newObj = recursiveFind(FilteredProducts, Filtertext.toLowerCase())

            //let categoryListArr = this.state.ProductTypedetails.filter(item => item.categoryName.toLowerCase().includes(Filtertext.toLowerCase()))
            if (newObj.length > 0) {
                this.setState({ ProductTypedetails: newObj, ProductTypeFiltered: '' })
                this.load();
            }
            else {
                this.setState({ ProductTypeFiltered: 'No Records Found' })

            }
        }
        else {
            this.setState({ ProductTypedetails: FilteredProducts })
            this.loaddata();
        }



    }

    removeAllFilter = () => {
        Filtertext = '';

        this.setState({ ProductTypedetails: this.state.ProductTypedetailsFiltered, AllFiltertext: '' })
        this.load();
    }

    getMappedCategory = (event, isSelected) => {
        let userGuid = "";
        userGuid = localStorage.userId;
        var config = {
            headers: {
                'Authorization': 'Bearer ' + localStorage.tokenId,
                'SupplierGuid': userGuid,
            },
        };
         axios.get(getServiceUrl() + 'Category/GetMappedcategory', config)
         .then((json) => {
            this.setState({mappedCategoryList: json.data });
        }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
        
    }

    render() {

        const { anchorEl, ProductTypedetails } = this.state;
        const open = Boolean(anchorEl);
        const objectProductTypedetails = ProductTypedetails;
        if (DeleteCategoryValue !== "") {
            this.load();
            DeleteCategoryValue = "";
        }

        return (
            <Fragment>
                <div className="customDropdownSearch_btn" ref={this.myInput}>
                    <Button
                        onClick={this.handleClick}
                        className="newInput"
                    >
                        <span>{this.props.customDropTitle}</span>
                        <KeyboardArrowDown />
                    </Button>
                </div>
                <Popover
                    id="customDropdownSearch"
                    open={open}
                    anchorEl={anchorEl}
                    onClose={this.handleClose}
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
                    className="customDropdownSearch"
                >
                    <div className="dropdownSearchBar">
                        <div className="newThemeInput_2 certi_input">
                            <Input startIcon={<svg xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" fill="none">
                                <path d="M11.5161 6.76744C11.5148 7.90927 11.0426 9.00397 10.203 9.81136C9.36347 10.6187 8.22517 11.0729 7.03785 11.0741C5.85054 11.0729 4.71224 10.6187 3.87268 9.81136C3.03312 9.00397 2.56089 7.90927 2.55959 6.76744C2.56089 5.62562 3.03312 4.53092 3.87268 3.72353C4.71224 2.91614 5.85054 2.462 7.03785 2.46075C8.22517 2.462 9.36347 2.91614 10.203 3.72353C11.0426 4.53092 11.5148 5.62562 11.5161 6.76744ZM16.6337 14.7645C16.6328 14.4408 16.5002 14.1304 16.2642 13.8997L12.8356 10.6024C13.6433 9.47449 14.0752 8.13699 14.0741 6.76744C14.0749 5.8785 13.8935 4.99812 13.5402 4.17668C13.1868 3.35524 12.6685 2.60887 12.0149 1.98029C11.3613 1.35171 10.5852 0.853261 9.73101 0.513458C8.87685 0.173655 7.9614 -0.000824383 7.03704 2.92832e-06C6.11268 -0.000824383 5.19722 0.173655 4.34306 0.513458C3.4889 0.853261 2.7128 1.35171 2.05918 1.98029C1.40556 2.60887 0.887252 3.35524 0.533913 4.17668C0.180573 4.99812 -0.000857224 5.8785 3.04498e-06 6.76744C-0.000857224 7.65639 0.180573 8.53677 0.533913 9.35821C0.887252 10.1796 1.40556 10.926 2.05918 11.5546C2.7128 12.1832 3.4889 12.6816 4.34306 13.0214C5.19722 13.3612 6.11268 13.5357 7.03704 13.5349C8.46187 13.5359 9.85329 13.1199 11.0264 12.3422L14.455 15.6301C14.5721 15.7453 14.712 15.8368 14.8664 15.8992C15.0209 15.9616 15.1868 15.9936 15.3543 15.9933C15.6926 15.991 16.0164 15.8609 16.2558 15.631C16.4951 15.401 16.6309 15.0898 16.6337 14.7645Z" fill="#D7D7D7" />
                            </svg>} class="newInput_2" elementConfig={{ 'placeholder': 'Search here..' }} elementType='input_2' changed={event => this.getDataAllFilter(event)} value={(Filtertext)} />
                        </div>
                    </div>
                    {this.state.ProductTypeFiltered === 'No Records Found' ?
                        <div className="">
                            <span style={{ textAlign: 'center' }}> No records found</span>
                        </div>
                        :
                        <div className="dropdownData">
                            {this.state.items}
                        </div>
                    }
                    {/*<div>*/}
                    {/*    <div className="clear_search" data-key="" data-value="" onClick={this.removeAllFilter}><span>Clear</span></div>*/}
                    {/*</div>*/}
                </Popover>
            </Fragment>
        );
    }
}

CustomSearchMultiSelectdropdown_new.propTypes = {
    classes: PropTypes.object.isRequired,
};



export default withStyles(styles)(CustomSearchMultiSelectdropdown_new);