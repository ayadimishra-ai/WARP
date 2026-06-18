import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Popover from '@material-ui/core/Popover';
import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import Input from "../../UI/Input/MaterialInput";
import Accordion from "../Material/Accordion/Accordion.jsx";


const styles = theme => ({
typography: {
    margin: theme.spacing.unit * 2,
},
});

class CustomSearchMultiSelectDropdown extends Component {
constructor(props) {
    super(props);
    const { ProductTypedetails } = props;
    this.state = {
        anchorEl: null,
        ProductTypedetails: [],
        IscomponentDidUpdate: 0,
        IsEditProfile: false
    };
    this.CommodityOncheck = this.CommodityOncheck.bind(this);
}

handleClick = event => {
    this.setState({
        anchorEl: event.currentTarget,
    });
};
componentDidUpdate(prevProps, prevState) {
    const { ProductTypedetails, ProductTypeUpdate, IsProductShow } = this.props;
    if (prevState.ProductTypedetails != ProductTypedetails) {
        this.setState({ ProductTypedetails: ProductTypedetails, IscomponentDidUpdate: 1, IsProductShow: IsProductShow });
    }
}

componentDidMount() {
    const { ProductTypedetails } = this.props;
    let Details = ProductTypedetails;
    Details.map((itemCommodity) => {
        let IsCategorySelected = itemCommodity.categoryDetails.map((itemCategory) => {
            let IsSubCategorySelected = itemCategory.subCategoryDetails.map((itemSubCategory) => {
                let ProductTotalCount = itemSubCategory.productTypeDetail.length;
                let ProductSelectedCount = itemSubCategory.productTypeDetail.filter(x => x.isSelected === true).length;
                if (ProductTotalCount === ProductSelectedCount) {
                    itemSubCategory.isSelected = true;
                    return true;
                } else {
                    itemSubCategory.isSelected = false;
                    return false;
                }
            });
            let TotalSubCategoryDetails = itemCategory.subCategoryDetails.length;
            let SelectedSubCategoryDetails = IsSubCategorySelected.filter(x => x === true).length;
            if (TotalSubCategoryDetails === SelectedSubCategoryDetails) {
                itemCategory.isSelected = true;
                return true;
            } else {
                itemCategory.isSelected = false;
                return false;
            }
        });
        let TotalCategoryDetails = itemCommodity.categoryDetails.length;
        let SelectedCategoryDetails = IsCategorySelected.filter(x => x === true).length;
        if (TotalCategoryDetails === SelectedCategoryDetails) {
            itemCommodity.isSelected = true;
        } else {
            itemCommodity.isSelected = false;
        }
    });
    let data = Details;
    this.setState({ ProductTypedetails: data });
    // this.props.onRef(this);
}

handleClose = () => {
    this.setState({
        anchorEl: null,
    });
};

checkBox = (ev) => {
    ev.stopPropagation();
}

CommodityOncheck = (event, isSelected, inputIdentifier) => {
    const { onchange = f => f } = this.props;
    event.stopPropagation();
    const updatedProductTypedetailsInfo = {
        ...this.state.ProductTypedetails
    };

    const updatedFormElement = {
        ...updatedProductTypedetailsInfo[inputIdentifier]
    };

    if (isSelected) {
        updatedFormElement.isSelected = false;
    } else {
        updatedFormElement.isSelected = true;
    }

    updatedFormElement.categoryDetails.map((itemCategory) => {
        if (isSelected) {
            itemCategory.isSelected = false;
        } else {
            itemCategory.isSelected = true;
        }

        itemCategory.subCategoryDetails.map((itemSubCategory) => {
            if (isSelected) {
                itemSubCategory.isSelected = false;
            } else {
                itemSubCategory.isSelected = true;
            }
            itemSubCategory.productTypeDetail.map((itemProductType) => {
                if (isSelected) {
                    itemProductType.isSelected = false;
                } else {
                    itemProductType.isSelected = true;
                }
            });
        });
    });

    updatedProductTypedetailsInfo[inputIdentifier] = updatedFormElement;
    onchange(updatedProductTypedetailsInfo);
}

CategoryOncheck = (event, isSelected, CommodityinputIdentifier, inputIdentifier) => {
    const { onchange = f => f } = this.props;
    event.stopPropagation();
    const updatedProductTypedetailsInfo = {
        ...this.state.ProductTypedetails
    };

    const updatedCommodityFormElement = {
        ...updatedProductTypedetailsInfo[CommodityinputIdentifier]
    };

    const updatedFormElement = {
        ...updatedCommodityFormElement.categoryDetails[inputIdentifier]
    };

    if (isSelected) {
        updatedFormElement.isSelected = false;
    } else {
        updatedFormElement.isSelected = true;
    }

    updatedFormElement.subCategoryDetails.map((itemSubCategory) => {
        if (isSelected) {
            itemSubCategory.isSelected = false;
        } else {
            itemSubCategory.isSelected = true;
        }
        itemSubCategory.productTypeDetail.map((itemProductType) => {
            if (isSelected) {
                itemProductType.isSelected = false;
            } else {
                itemProductType.isSelected = true;
            }
        });
    });

    updatedCommodityFormElement.categoryDetails[inputIdentifier] = updatedFormElement;
    updatedProductTypedetailsInfo[CommodityinputIdentifier] = updatedCommodityFormElement;
    onchange(updatedProductTypedetailsInfo);
}

SubCategoryOncheck = (event, isSelected, CommodityinputIdentifier, CategoryinputIdentifier, inputIdentifier) => {
    const { onchange = f => f } = this.props;
    event.stopPropagation();
    const updatedProductTypedetailsInfo = {
        ...this.state.ProductTypedetails
    };

    const updatedCommodityFormElement = {
        ...updatedProductTypedetailsInfo[CommodityinputIdentifier]
    };

    const updatedCategoryFormElement = {
        ...updatedCommodityFormElement.categoryDetails[CategoryinputIdentifier]
    };

    const updatedFormElement = {
        ...updatedCategoryFormElement.subCategoryDetails[inputIdentifier]
    };

    if (isSelected) {
        updatedFormElement.isSelected = false;
    } else {
        updatedFormElement.isSelected = true;
    }

    updatedFormElement.subCategoryDetails.map((itemSubCategory) => {
        if (isSelected) {
            itemSubCategory.isSelected = false;
        } else {
            itemSubCategory.isSelected = true;
        }
        itemSubCategory.productTypeDetail.map((itemProductType) => {
            if (isSelected) {
                itemProductType.isSelected = false;
            } else {
                itemProductType.isSelected = true;
            }
        });
    });

    updatedCommodityFormElement.categoryDetails[inputIdentifier] = updatedFormElement;
    updatedProductTypedetailsInfo[CommodityinputIdentifier] = updatedCommodityFormElement;
    onchange(updatedProductTypedetailsInfo);
}

SubCategoryOncheck = (event, isSelected, CommodityinputIdentifier, CategoryinputIdentifier, inputIdentifier) => {
    const { onchange = f => f } = this.props;
    event.stopPropagation();
    const updatedProductTypedetailsInfo = {
        ...this.state.ProductTypedetails
    };

    const updatedCommodityFormElement = {
        ...updatedProductTypedetailsInfo[CommodityinputIdentifier]
    };

    const updatedCategoryFormElement = {
        ...updatedCommodityFormElement.categoryDetails[CategoryinputIdentifier]
    };

    const updatedFormElement = {
        ...updatedCategoryFormElement.subCategoryDetails[inputIdentifier]
    };

    if (isSelected) {
        updatedFormElement.isSelected = false;
    } else {
        updatedFormElement.isSelected = true;
    }

    updatedFormElement.productTypeDetail.map((itemProductType) => {
        if (isSelected) {
            itemProductType.isSelected = false;
        } else {
            itemProductType.isSelected = true;
        }
    });

    updatedCategoryFormElement.subCategoryDetails[inputIdentifier] = updatedFormElement
    updatedCommodityFormElement.categoryDetails[CategoryinputIdentifier] = updatedCategoryFormElement;
    updatedProductTypedetailsInfo[CommodityinputIdentifier] = updatedCommodityFormElement;

    onchange(updatedProductTypedetailsInfo);
}

ProductTypeOncheck = (event, isSelected, CommodityinputIdentifier, CategoryinputIdentifier, SubCategoryinputIdentifier, inputIdentifier) => {
    const { onchange = f => f } = this.props;
    event.stopPropagation();
    const updatedProductTypedetailsInfo = {
        ...this.state.ProductTypedetails
    };

    const updatedCommodityFormElement = {
        ...updatedProductTypedetailsInfo[CommodityinputIdentifier]
    };

    const updatedCategoryFormElement = {
        ...updatedCommodityFormElement.categoryDetails[CategoryinputIdentifier]
    };

    const updatedSubCategoryFormElement = {
        ...updatedCategoryFormElement.subCategoryDetails[SubCategoryinputIdentifier]
    };

    const updatedFormElement = {
        ...updatedSubCategoryFormElement.productTypeDetail[inputIdentifier]
    };

    if (isSelected) {
        updatedFormElement.isSelected = false;
    } else {
        updatedFormElement.isSelected = true;
    }

    updatedSubCategoryFormElement.productTypeDetail[inputIdentifier] = updatedFormElement;
    updatedCategoryFormElement.subCategoryDetails[SubCategoryinputIdentifier] = updatedSubCategoryFormElement;
    updatedCommodityFormElement.categoryDetails[CategoryinputIdentifier] = updatedCategoryFormElement;
    updatedProductTypedetailsInfo[CommodityinputIdentifier] = updatedCommodityFormElement;
    onchange(updatedProductTypedetailsInfo);
}

CommodityOnClicked = (event, ProductClassificationGuid, isSelected) => {
    event.stopPropagation();
}

render() {
    const { anchorEl, ProductTypedetails } = this.state;
    const open = Boolean(anchorEl);
    const objectProductTypedetails = ProductTypedetails;
    return (
        <Fragment>
            <Button
                aria-owns={open ? 'simple-popper' : undefined}
                aria-haspopup="true"
                variant="contained"
                onClick={this.handleClick}
                className="newInput"
            >
                <span>{this.props.customDropTitle}</span>
                <KeyboardArrowDown />
            </Button>
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
                    style: { width: '38.5%' },
                }}
                className="customDropdownSearch"
            >
                {/* <div className="searchBar">
                    <h6>Select Product Type</h6>
                    <div className="newThemeInput certi_input">
                        <Input class="newInput" elementConfig={{ 'placeholder': 'Search Proudct Type By Keyword' }} elementType='input' />
                    </div>
                </div> */}
                <div className="dropdownData">
                    {objectProductTypedetails.length > 0 ?
                        objectProductTypedetails.map((CommodityItem, i) => {
                            return (<div className="main_accordian dropdownAccordion">
                                <Accordion
                                    active={1}
                                    collapses={[
                                        {
                                            title: <div style={{paddingLeft:'20px'}}>
                                                <Input
                                                    class="mainAccordlable"
                                                    elementConfig={{ 'disabled': false }}
                                                    onClickd={(event) => this.CommodityOnClicked(event, CommodityItem.productClassificationGuid, CommodityItem.isSelected)}
                                                    changed={(event) => this.CommodityOncheck(event, CommodityItem.isSelected, i)}
                                                    checked={CommodityItem.isSelected}
                                                    checkBoxLabel={CommodityItem.productClassificationName}
                                                    elementType='checkbox' />
                                            </div>,
                                            content: <Fragment>
                                                <div className="main_accordian_inner dropdownAccordion">
                                                    {CommodityItem.categoryDetails.length > 0 ?
                                                        CommodityItem.categoryDetails.map((CategoryItem, j) => {
                                                            return (<Accordion
                                                                active={0}
                                                                collapses={[
                                                                    {
                                                                        title: <div style={{paddingLeft:'40px'}}>
                                                                            <Input
                                                                                class="innerAccordlable"
                                                                                elementConfig={{ 'disabled': false }}
                                                                                onClickd={this.checkBox}
                                                                                changed={(event) => this.CategoryOncheck(event, CategoryItem.isSelected, i, j)}
                                                                                checked={CategoryItem.isSelected}
                                                                                checkBoxLabel={CategoryItem.categoryName}
                                                                                elementType='checkbox' />
                                                                        </div>,
                                                                        content: this.state.IsProductShow === false ? <Fragment>
                                                                            <div className="main_accordian_inner2 dropdownAccordion">
                                                                                {CategoryItem.subCategoryDetails.length > 0 ?
                                                                                    CategoryItem.subCategoryDetails.map((SubCategoryItem, k) => {
                                                                                        return (
                                                                                            <div style={{paddingLeft:'100px',borderBottom:'1px solid #cdcdcd'}} className="prod_type_list">
                                                                                                <Input
                                                                                                    class="innerAccordlable2"
                                                                                                    elementConfig={{ 'disabled': false }}
                                                                                                    onClickd={this.checkBox}
                                                                                                    changed={(event) => this.SubCategoryOncheck(event, SubCategoryItem.isSelected, i, j, k)}
                                                                                                    checked={SubCategoryItem.isSelected}
                                                                                                    checkBoxLabel={SubCategoryItem.subCategoryName}
                                                                                                    elementType='checkbox' /></div>)
                                                                                    })
                                                                                    : ""}

                                                                            </div>
                                                                        </Fragment> :
                                                                            <Fragment>
                                                                                <div className="main_accordian_inner dropdownAccordion">
                                                                                    {CategoryItem.subCategoryDetails.length > 0 ?
                                                                                        CategoryItem.subCategoryDetails.map((SubCategoryItem, k) => {
                                                                                            return (<Accordion
                                                                                                active={0}
                                                                                                collapses={[
                                                                                                    {
                                                                                                        title: <div style={{paddingLeft:'60px'}}>
                                                                                                            <Input
                                                                                                                class="innerAccordlable"
                                                                                                                elementConfig={{ 'disabled': false }}
                                                                                                                onClickd={this.checkBox}
                                                                                                                changed={(event) => this.SubCategoryOncheck(event, SubCategoryItem.isSelected, i, j, k)}
                                                                                                                checked={SubCategoryItem.isSelected}
                                                                                                                checkBoxLabel={SubCategoryItem.subCategoryName}
                                                                                                                elementType='checkbox' />
                                                                                                        </div>,
                                                                                                        content: <Fragment>
                                                                                                            {this.state.IsProductShow ?
                                                                                                                <div className="main_accordian_inner2 dropdownAccordion">
                                                                                                                    <div className="prod_type_list">
                                                                                                                        {SubCategoryItem.productTypeDetail.length > 0 ?
                                                                                                                            SubCategoryItem.productTypeDetail.map((productTypeItem, l) => {
                                                                                                                                return (<div style={{paddingLeft:'100px',borderBottom:'1px solid #cdcdcd'}}>
                                                                                                                                    <Input
                                                                                                                                        class="innerAccordlable2"
                                                                                                                                        elementConfig={{ 'disabled': false }}
                                                                                                                                        onClickd={this.checkBox}
                                                                                                                                        changed={(event) => this.ProductTypeOncheck(event, productTypeItem.isSelected, i, j, k, l)}
                                                                                                                                        checkBoxLabel={productTypeItem.productName}
                                                                                                                                        checked={productTypeItem.isSelected}
                                                                                                                                        elementType='checkbox' />
                                                                                                                                </div>)
                                                                                                                            })
                                                                                                                            : ""}
                                                                                                                    </div>
                                                                                                                </div> : ""}

                                                                                                        </Fragment>
                                                                                                    }]}
                                                                                            />)
                                                                                        })
                                                                                        : ""}
                                                                                </div>
                                                                            </Fragment>
                                                                    }]}
                                                            />)
                                                        })
                                                        : ""}

                                                </div>
                                            </Fragment>
                                        }]}
                                />
                            </div>)
                        }) : ""}
                </div>
            </Popover>
        </Fragment>
    );
}
}

CustomSearchMultiSelectDropdown.propTypes = {
classes: PropTypes.object.isRequired,
};


export default withStyles(styles)(CustomSearchMultiSelectDropdown);