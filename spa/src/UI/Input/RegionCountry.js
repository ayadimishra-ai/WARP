import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Popover from '@material-ui/core/Popover';
import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import Input from "../../UI/Input/MaterialInputQuestionnaire";
import Accordion from "../../components/Material/Accordion/Accordion.jsx";
import { divide } from 'lodash';
const styles = theme => ({
    typography: {
        margin: theme.spacing.unit * 2,
    },
});
class CustomSearchMultiSelectDropdown extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            anchorEl: null,
        };
    }
    sortJson(element, prop, propType, asc) {
        switch (propType) {
            case "int":
                element = element.sort(function (a, b) {
                    if (asc) {
                        return (parseInt(a[prop]) > parseInt(b[prop])) ? 1 : ((parseInt(a[prop]) < parseInt(b[prop])) ? -1 : 0);
                    } else {
                        return (parseInt(b[prop]) > parseInt(a[prop])) ? 1 : ((parseInt(b[prop]) < parseInt(a[prop])) ? -1 : 0);
                    }
                });
                break;
            default:
                element = element.sort(function (a, b) {
                    if (asc) {
                        return (a[prop].toLowerCase() > b[prop].toLowerCase()) ? 1 : ((a[prop].toLowerCase() < b[prop].toLowerCase()) ? -1 : 0);
                    } else {
                        return (b[prop].toLowerCase() > a[prop].toLowerCase()) ? 1 : ((b[prop].toLowerCase() < a[prop].toLowerCase()) ? -1 : 0);
                    }
                });
        }
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
    checkBox = (ev) => {
        ev.preventDefault();
    }
    render() {
        const { classes } = this.props;
        const { anchorEl } = this.state;
        const open = Boolean(anchorEl);

        return (
            <React.Fragment>
                <Button
                    aria-owns={open ? 'simple-popper' : undefined}
                    aria-haspopup="true"
                    variant="contained"
                    onClick={this.handleClick}
                    className="newInput">
                    <span>Region Country List</span>
                    <KeyboardArrowDown />
                </Button>
                <Popover
                    id="customDropdownSearch"
                    open={open}
                    anchorEl={anchorEl}
                    onClose={this.handleClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                    }}
                    transformOrigin={{
                        vertical: 'center',
                        horizontal: 'center',
                    }}
                    className="customDropdownSearch"
                >
                    <div className="searchBar">
                        <h6>{this.props.headingText}</h6>
                    </div>
                    <div className="dropdownData">
                        {this.sortJson(this.props.options, "regionName", "string", true)}
                        {this.props.options.map((region) => {
                            let options = this.props.options;
                            let regionCheck = false;
                            let regionArray = [];
                            if (this.props.answerGuid !== null && this.props.answerGuid !== undefined) {
                                regionArray = this.props.answerGuid.split('~');
                                regionArray = regionArray.filter(function (item, pos) {
                                    return regionArray.indexOf(item) == pos;
                                })
                                //alert(regionArray.indexOf(region.regionGuid))
                                regionCheck = regionArray.indexOf(region.regionGuid) > -1 ? true : false;
                                regionArray = regionArray.filter(e => e !== region.regionGuid);
                            }
                            //alert(options.filter(x => x.regionGuid == region.regionGuid)[0].listCountry.length==regionArray.length )
                            return <div className="main_accordian dropdownAccordion">
                                <Accordion
                                    active={0}
                                    collapses={[
                                        {
                                            title: <React.Fragment>
                                                <Input class="mainAccordlable"
                                                    disabled={this.props.disabled}
                                                    valueGuid={region.regionGuid}
                                                    onClickd={(e) => this.checkBox(e)}
                                                    changed={this.props.changed}
                                                    checked={regionCheck}
                                                    label={region.regionName}
                                                    elementType='Check' />
                                            </React.Fragment>,
                                            content: <React.Fragment>
                                                <div className="main_accordian_inner">
                                                    <React.Fragment>
                                                        <div className="prod_type_list">
                                                            {this.sortJson(region.listCountry, "countryName", "string", true)}
                                                            {region.listCountry.map((country) => {
                                                                return <div>
                                                                    <Input
                                                                        disabled={this.props.disabled}
                                                                        valueGuid={country.countryGuid}
                                                                        onClickd={(e) => this.checkBox(e)}
                                                                        checked={regionArray.indexOf(country.countryGuid) > -1 ? true : false}
                                                                        changed={this.props.changed}
                                                                        label={country.countryName}
                                                                        elementType='Check' />
                                                                </div>
                                                            })}

                                                        </div>
                                                    </React.Fragment>

                                                </div>
                                            </React.Fragment>
                                        }]}
                                />
                            </div>
                        })}
                    </div>
                </Popover>
            </React.Fragment>
        );
    }
}
CustomSearchMultiSelectDropdown.propTypes = {
    classes: PropTypes.object.isRequired,
};
export default withStyles(styles)(CustomSearchMultiSelectDropdown);