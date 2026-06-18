import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Popover from '@material-ui/core/Popover';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import React from 'react';

const styles = {
    root: {
        color: '#cdcdcd',
        '&$checked': {
            color: '#008522',
        },
    },
    checked: {},
};

class RfqSupplierListDropdown extends React.Component {
    state = {
        anchorEl: null,
        checkedA: true,
    };

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

    handleChange = () => event => {
        this.setState({ checkedA : event.target.checked });
    };

    render() {
        const { classes } = this.props;
        const { anchorEl } = this.state;
        const open = Boolean(anchorEl);
        let finaldoropdownlistarray = this.props.allsuppliers.sort((a, b) => a.companyname < b.companyname ? -1 : 1)
        let dropdownlist = finaldoropdownlistarray.map(item => {
            return <div>
                <div>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={this.props.selectedlisting.filter(items => items.supplierCompanyGuid == item.supplierCompanyGuid).length > 0 ? true : false}
                                onChange={(event)=>this.props.onchangeselectionindropdown(item.supplierCompanyGuid, event)}
                                value="checkedA"
                                classes={{
                                    root: classes.root,
                                    checked: classes.checked,
                                }}
                            />
                        }
                        label={item.companyname}
                    />
                </div>
                <div>
                    <span className="currencySymbolFont">{localStorage.currencySymbol}</span>{item.totalcosting.toFixed(2)}
                </div>
            </div>
        });
        return (
            <div className="rfq_supp_list_dropdown">
                <span
                    className="rfq_supp_list_dropdown_btn"
                    aria-owns={open ? 'simple-popper' : undefined}
                    aria-haspopup="true"
                    variant="contained"
                    onClick={this.handleClick}
                >
                    Add/Remove Suppliers
                </span>
                <Popover
                    open={open}
                    anchorEl={anchorEl}
                    onClose={this.handleClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'center',
                    }}
                    PaperProps={{
                        style: { width: '311px' },
                    }}
                >
                    <div className="rfq_supp_list_dropdown_popup">
                        <div>
                            <div>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={this.props.selectedlisting.length == this.props.allsuppliers.length ? true : false}
                                            onChange={(event)=>this.props.onchangeselectionindropdown(null, event)}
                                            value="checkedA"
                                            classes={{
                                                root: classes.root,
                                                checked: classes.checked,
                                            }}
                                        />
                                    }
                                    label="Select All"
                                />
                            </div>
                        </div>
                        {dropdownlist}
                    </div>
                </Popover>
            </div>
        );
    }
}

RfqSupplierListDropdown.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(RfqSupplierListDropdown);