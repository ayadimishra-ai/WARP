import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import basicsStyle from "../../assets/jss/material-kit-pro-react/views/componentsSections/basicsStyle.jsx";
import { FormControl, InputLabel, MenuItem, Select } from "@material-ui/core";
import { ArrowDropDown} from "@material-ui/icons";

class SelectLocation extends Component {
    render() {
        const { location, handleChange, classes, isDisabled, shrink, locationList } = this.props;


        return (
            <div className="newThemeInput">
                <div className="input_parent_div">
                    <FormControl
                        className={'input_2_main'}
                        fullWidth
                        disabled={isDisabled}
                        variant="filled"
                    >
                        <InputLabel
                            htmlFor="simple-select"
                            className={classes.selectLabel}
                            //shrink={this.state.shrink}
                            // shrink={shrink}
                        >
                            Select Location
                        </InputLabel>
                        <Select
                            className={this.props.selectTag + ' ' + 'material_select'}
                            IconComponent = {ArrowDropDown}
                            MenuProps={{
                                className: classes.selectMenu,
                            }}
                            classes={{
                                select: classes.select
                            }}
                            value={location}
                            onChange={handleChange}
                            inputProps={{
                                name: "location",
                                id: "filled-location-simple",
                                className: "selectmate" + ' ' + 'newInput_2',
                            }}
                        >
                            {locationList.map((menuItem) => (
                                <MenuItem
                                    key={menuItem.value}
                                    value={menuItem.value}
                                    classes={{
                                        root: classes.selectMenuItem,
                                        selected: classes.selectMenuItemSelected,
                                    }}
                                    className={this.props.selectMenuItemSelected === true ? "LocationSelected" : "" }
                                >
                                    {menuItem.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </div>
            </div>
        );
    }
}

export default withStyles(basicsStyle)(SelectLocation);
