import Delete from "@material-ui/icons/DeleteForever";
import Edit from "@material-ui/icons/Edit";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import Sort from "@material-ui/icons/Sort";
import axios from "axios";
import moment from "moment";
import React, { Component } from "react";
import { confirmAlert } from "react-confirm-alert";
import GridContainer from "../../components/Material/Grid/GridContainer";
import GridItem from "../../components/Material/Grid/GridItem.jsx";
import { getServiceUrl } from "../../config";
import Button from "../../UI/Button/MaterialButton";
import Input from "../../UI/Input/MaterialInput";

import Spinner from "../../UI/Spinner/Spinner";
const initialState = {
  materialForm: {
    MaterialName: {
      elementType: "input_2",
      class: "newInput_2",
      elementConfig: {
        type: "text",
        // placeholder: "Commodity"
      },
      value: "",
      validation: {
        required: true,
        maxLength: 50
      },
      valid: true,
      touched: false,
      formControlProps: { fullWidth: true },
      label: "Material Name *"
    },
    Emission: {
      elementType: "input_2",
      class: "newInput_2",
      elementConfig: {
        type:"text",
       // placeholder: "Emission factor"
      },
      value: "",
     validation: {
        required: true,
       // alphaNumericOnly: true,
        maxLength: 50
      },
      //requiredclass: "required",
      valid: true,
      touched: false,
      formControlProps: { fullWidth: true },
      label: "Emission factor *"
    },

  },
  isValid: false,
  errorMessage: "",
  loading: false,
  SubmitButton: "Add",
  materialList: [],
  materialGuid: null,
  searchMaterial: "",
  alphaNumericOnly: true,
  paste: false,
  materialnamesort:true,
  emissionsort:true,
  createdOnsort:true,
  createdBysort:true,
  modifiedOnsort:true,
  modifiedBysort:true
  
};

class MaterialManagement extends Component {
  state = { ...initialState }; // use spread operator to avoid mutation

  constructor(props) {
    super(props);
  }
  handleChange(checked) {
    this.setState({ checked });
  }
  async componentDidMount() {
    
    this.getMaterialData("");
  }
  
  changeSearch(event) {
    this.setState({ searchMaterial: event.target.value });
  }
  resetSearch() {
    
    this.getMaterialData("");
    this.setState({ searchMaterial: "" });
  }
  
  sortMaterial() {
    if (this.state.sort) {
      this.setState({
        sort: !this.state.sort,
        materialList: this.state.materialList.sort((a, b) =>
          a.materialName > b.materialName ? 1 : -1
        )
      });
    } else {
      this.setState({
        sort: !this.state.sort,
        materialList: this.state.materialList.sort((a, b) =>
          a.materialName < b.materialName ? 1 : -1
        )
      });
    }
  }
  
  enterkey = e => {
    this.setState({ paste: false });
    var keyCode = e.keyCode || e.which;
    //Regex for Valid Characters i.e. Alphabets and Numbers.
    var regex = /[/[a-zA-Z &]+$/;
    //Validate TextBox value against the Regex.
    var isValid = regex.test(String.fromCharCode(keyCode));
    this.setState({ alphaNumericOnly: isValid });
    if(isNaN(e.keyCode))
    {
      this.setState({ alphaNumericOnly: false });
    }
    else{this.setState({ alphaNumericOnly: true });}
  };
  onPaste = () => {
    this.setState({ paste: true });
  };
  validateForm() {
    if (this.state.materialForm.MaterialName.value === "") {
      this.setState({
        isValid: false,
        errorMessage: "Material name is mandatory"
      });
    } else {
      this.setState({ isValid: true });
    }
  }
async getMaterialData(searchMaterial)
{
   
    let list = null;
    var config = {
        headers: {
            'Authorization': 'Bearer ' + localStorage.tokenId,
            'Content-Type': 'application/json',
            'MaterialName': searchMaterial == undefined ? '' : searchMaterial
        },
    };
    
    await axios.get(getServiceUrl() + 'masterdata/GetMaterial', config)
        .then((json) => {
            list = JSON.stringify(json.data)
            this.setState({
              materialList: json.data,
              loading: false
            });
        }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    return JSON.parse(list).map(item => ({
        materialGuid : item.materialGuid,
        materialName : item.materialName ,
        createdOn: item.createdOn,
        createdBy: item.createdBy,
        modifiedOn: item.modifiedOn,
        modifiedBy: item.modifiedBy,
        isActive: item.isActive
    }))
}
  async upsertMaterial(event) {
    
    this.setState({ loading: true });
    event.preventDefault();
    const updatedMaterialForm = {
      ...this.state.materialForm
    };
   const formData = {      
      "MaterialName": this.state.materialForm['MaterialName'].value,
	    "LanguageId": localStorage.languageId,
	    "IsActive": true,
	    "CreatedBy": localStorage.getItem("userId"),
	    "EmissionFactor":this.state.materialForm['Emission'].value 
     };

    const data={
       "MaterialGuid": this.state.materialGuid,
	    "MaterialName": this.state.materialForm['MaterialName'].value,
	    "LanguageId": localStorage.languageId,
	    "IsActive": true,
	    "CreatedBy": localStorage.getItem("userId"),
	    "ModifiedBy": localStorage.getItem("userId"),
	    "EmissionFactor": this.state.materialForm['Emission'].value
    }
    var config = {
      headers: {
        Authorization: "Bearer " + localStorage.tokenId,
        "Content-Type": "application/json",
       
      }
    };
    
    await this.validateForm();
    if (this.state.isValid) {
      await axios
        .post(getServiceUrl() + "masterdata/InsertOrUpdateMaterial",this.state.materialGuid!=null?data:formData, config)
        .then(response => {
          this.getMaterialData("");
          this.resetForm();
          this.setState({ loading: false });
          confirmAlert({
            message: response.data,
            buttons: [
              {
                label: "OK"
              }
            ]
          });
        })
        .catch(err =>
          err.response !== undefined
            ? err.response.status === 401
              ? (window.location.pathname = "/logout")
              : ""
            : ""
        );
    }
     else {
      this.setState({ loading: false });
      confirmAlert({
        message: this.state.errorMessage,
        buttons: [
          {
            label: "OK"
          }
        ]
      });
    }
  }
  
 async deleteMaterialConfirmation(materialGuid) {
    confirmAlert({
      message: "Are you sure, you want to delete?",
      buttons: [
        {
          label: "Yes",
          onClick: () => this.deleteMaterial(materialGuid)
        },
        {
          label: "No"
        }
      ]
    });
  }

  async deleteMaterial(GroupGuid){
    var config = {
      
      headers: {
          'Authorization': 'Bearer ' + localStorage.tokenId,
          'Content-Type': 'application/json',
          'MaterialGuid': GroupGuid == undefined ? '' : GroupGuid
      },
  };
  await axios.get(getServiceUrl() + 'masterdata/DeleteMaterial', config)
      .then((json) => {
        this.getMaterialData("");
        confirmAlert({
          message: json.data=="True"? "Data deleted successfully" : "",
          buttons: [
            {
              label: "OK"
            }
          ]
        });
      }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
  }

  ChangeHandler = (event, inputIdentifier) => {
    const updatedMaterialForm = {
      ...this.state.materialForm
    };

    const updatedFormElement = {
      ...updatedMaterialForm[inputIdentifier]
    };

    updatedFormElement.value = event.target.value;

    updatedMaterialForm[inputIdentifier] = updatedFormElement;
    if(inputIdentifier=="MaterialName"){
    if (!this.state.paste) {
      if (this.state.alphaNumericOnly) {
        if (
          event.target.value.length <= updatedFormElement.validation.maxLength
        ) {
          this.setState({
            materialForm: updatedMaterialForm
          });
        }
      }
    }
    }
    if(inputIdentifier==="Emission")
    {
        var regex = /^[0-9]*(\.[0-9]{0,2})?$/; 
       var isValid = regex.test(event.target.value);
      if(isValid)
      {
        if ( event.target.value.length <= updatedFormElement.validation.maxLength ) {
          this.setState({
            materialForm: updatedMaterialForm
          });
        }
      }
    }

  };

  editForm = (materialName,emissionFactor, materialGuid) => {
    
    document.documentElement.scrollTop = 0;
    const updatedMaterialForm = {
      ...this.state.materialForm
    };

    const materialNameElement = {
      ...updatedMaterialForm["MaterialName"]
    };
    const EmissionFactorElement = {
      ...updatedMaterialForm["Emission"]
    };

    materialNameElement.value = materialName;
    EmissionFactorElement.value=emissionFactor;
    updatedMaterialForm["MaterialName"] = materialNameElement;
    updatedMaterialForm["Emission"]=EmissionFactorElement;

    this.setState({
      materialForm: updatedMaterialForm,
      oldValues: updatedMaterialForm,
      SubmitButton: "Update",
      materialGuid: materialGuid,
    });
    
  };
  resetForm() {
    const updatedMaterialForm = {
      ...this.state.materialForm
    };

    const materialNameElement = {
      ...updatedMaterialForm["MaterialName"]
    };
    const EmissionFactorElement = {
      ...updatedMaterialForm["Emission"]
    };

    materialNameElement.value = "";
    EmissionFactorElement.value="";

    updatedMaterialForm["MaterialName"] = materialNameElement;
    updatedMaterialForm["Emission"]=EmissionFactorElement;

    this.setState({
      materialForm: updatedMaterialForm,
      SubmitButton: "Add",
      materialGuid: null,
      
    });
  }
  async sortMaterialManagement(ColumnName){
    switch(ColumnName){
      case"Materialname":
      if (this.state.materialnamesort) {
        this.setState({
          materialnamesort: !this.state.materialnamesort,
          emissionsort: true,
          createdOnsort:true,
          createdBysort:true,
          modifiedOnsort:true,
          modifiedBysort:true,
          materialList: this.state.materialList.sort((a, b) =>
            a.materialName.toString().toLowerCase() > b.materialName.toString().toLowerCase() ? 1 : -1
          )
        });
      } else {
        this.setState({
          materialnamesort: !this.state.materialnamesort,
          emissionsort: true,
          createdOnsort:true,
          createdBysort:true,
          modifiedOnsort:true,
          modifiedBysort:true,
          materialList: this.state.materialList.sort((a, b) =>
            a.materialName.toString().toLowerCase() < b.materialName.toString().toLowerCase() ? 1 : -1
          )
        });
      }
      break;
      case "Emission":
        if (this.state.emissionsort) {
          this.setState({
            emissionsort: !this.state.emissionsort,
            sort: true,
            createdOnsort:true,
            createdBysort:true,
            modifiedOnsort:true,
            modifiedBysort:true,
            materialList: this.state.materialList.sort((a, b) =>
              a.emissionFactor > b.emissionFactor ? 1 : -1
            )
          });
        } else {
          this.setState({
            emissionsort: !this.state.emissionsort,
            materialnamesort:true,
            createdOnsort:true,
            createdBysort:true,
            modifiedOnsort:true,
            modifiedBysort:true,
            materialList: this.state.materialList.sort((a, b) =>
              a.emissionFactor < b.emissionFactor ? 1 : -1
            )
          });
        }
      break;
      case "CreatedOn":
        if (this.state.createdOnsort) {
          this.setState({
            createdOnsort: !this.state.createdOnsort,
            emissionsort: true,
            materialnamesort:true,
            createdBysort:true,
            modifiedOnsort:true,
            modifiedBysort:true,
            materialList: this.state.materialList.sort((a, b) =>
              a.createdOn > b.createdOn ? 1 : -1
            )
           
          });
        } else {
          this.setState({
            createdOnsort: !this.state.createdOnsort,
            emissionsort: true,
            materialnamesort:true,
            createdBysort:true,
            modifiedOnsort:true,
            modifiedBysort:true,
            materialList: this.state.materialList.sort((a, b) =>
              a.createdOn < b.createdOn ? 1 : -1
            )
          });
        }
      break;
      case "ModifiedOn" :
        
        const arrModiDate = this.state.materialList.filter(el => {
          return el.modifiedDate != null && el.modifiedDate != ''
         });
         const arrModiDatenull = this.state.materialList.filter(el => {
          return el.modifiedDate === null 
         });
        if (this.state.modifiedOnsort) {
         await this.setState({
            modifiedOnsort: !this.state.modifiedOnsort,
            emissionsort: true,
            createdOnsort:true,
            createdBysort:true,
            materialnamesort:true,
            modifiedBysort:true,
            materialList: arrModiDate.sort((a, b) =>
              a.modifiedOn > b.modifiedDate ? 1 : -1
            )
          });
          await this.setState({ materialList: [...this.state.materialList, ...arrModiDatenull] });
        } else {
         await this.setState({
            modifiedOnsort: !this.state.modifiedOnsort,
            emissionsort: true,
            createdOnsort:true,
            createdBysort:true,
            materialnamesort:true,
            modifiedBysort:true,
            materialList: arrModiDate.sort((a, b) =>
              a.modifiedDate < b.modifiedDate ? 1 : -1
            )
          });
          await this.setState({ materialList: [ ...arrModiDatenull,  ...this.state.materialList] });
        }
      break;
      case "CreatedBy":
        if (this.state.createdBysort) {
          this.setState({
            createdBysort: !this.state.createdBysort,
            emissionsort: true,
            createdOnsort:true,
            materialnamesort:true,
            modifiedOnsort:true,
            modifiedBysort:true,
            materialList: this.state.materialList.sort((a, b) =>
              a.createdBy > b.createdBy ? 1 : -1
            )
          });
        } else {
          this.setState({
            createdBysort: !this.state.createdBysort,
            emissionsort: true,
            createdOnsort:true,
            materialnamesort:true,
            modifiedOnsort:true,
            modifiedBysort:true,
            materialList: this.state.materialList.sort((a, b) =>
              a.createdBy < b.createdBy ? 1 : -1
            )
          });
        }
      break;
      case "ModifiedBy" :
        const arrModiBy = this.state.materialList.filter(el => {
          return el.modifiedBy != null && el.modifiedBy != ''
         });
         const arrModiBynull = this.state.materialList.filter(el => {
          return el.modifiedBy === null 
         });
        if (this.state.modifiedBysort) {
          await this.setState({
            modifiedBysort: !this.state.modifiedBysort,
            isArtworksort: true,
            createdOnsort:true,
            createdBysort:true,
            modifiedOnsort:true,
            materialnamesort:true,
            materialList: arrModiBy.sort((a, b) =>
              a.modifiedBy > b.modifiedBy ? 1 : -1
            )
          });
          await this.setState({ materialList: [ ...this.state.materialList, ...arrModiBynull,] });
        } else {
         await this.setState({
            modifiedBysort: !this.state.modifiedBysort,
            isArtworksort: true,
            createdOnsort:true,
            createdBysort:true,
            modifiedOnsort:true,
            materialnamesort:true,
            materialList: arrModiBy.sort((a, b) =>
              a.modifiedBy < b.modifiedBy ? 1 : -1
            )
          });
          await this.setState({ materialList: [...arrModiBynull,  ...this.state.materialList] });
        }
      break; 
     
    }
  }
  
  render() {
    let formElementsArray = [];

    for (let key in this.state.materialForm) {
      formElementsArray.push({
        id: key,
        config: this.state.materialForm[key]
      });
    }
    
    let materialList = this.state.materialList.map(item => (
      <React.Fragment>
        <tr>
          <td>
            <p>{item.materialName}</p>
          </td>
          <td>
            <p>{item.emissionFactor}</p>
          </td>
          <td>
           
            <p>{item.createdDate !=null ?  moment(item.createdDate).format("DD/MM/YYYY") : "" }</p>
          </td>
          <td>
            <p>{item.createdBy}</p>
          </td>
          <td>
           
            <p>{item.modifiedDate !=null ?  moment(item.modifiedDate).format("DD/MM/YYYY") : "" }</p>
          </td>
          <td>
            <p>{item.modifiedBy}</p>
          </td>
          <td>
            <div className="category_details3">
              {/* <div>
                            <Switch
                                checked={item.isActive}
                                onChange={() => this.ChangeCategoryStatus(item.categoryGuid, item.isActive, 'CHANGESTATUS')}
                                onColor="#86d3ff"
                                onHandleColor="#2693e6"
                                handleDiameter={15}
                                uncheckedIcon={false}
                                checkedIcon={false}
                                boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                                activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                                height={12}
                                width={30}
                                className="react-switch"
                            // id={data.userEmailTemplateNotificationGuid}
                            />
                        </div> */}
              <div>
                <Edit
                  onClick={event =>
                    this.editForm(
                      item.materialName,
                      item.emissionFactor,
                      item.materialGuid
                    )
                  }
                />
                <Delete
                  data-tip
                  data-for="error2"
                  onClick={() =>
                    this.deleteMaterialConfirmation(
                      item.materialGuid
                    )
                  }
                />
              </div>
            </div>
          </td>
        </tr>
      </React.Fragment>
    ));

    return (
      <div className="CategoryManagement CommodityManag ">
        <div className="cm_outer">
          <div className="cm_header">
            <h6>
              <Sort />
              Add/Edit material
            </h6>
          </div>
          <div className="category_form">
            <GridContainer>
              {formElementsArray.map(formElement => (
                <GridItem key={formElement.id} md={4} xs={12}>
                  <div className="newThemeInput">
                    <Input
                      onPaste={() => this.onPaste()}
                      onKeyPress={e => this.enterkey(e)}
                      elementType={formElement.config.elementType}
                      elementConfig={formElement.config.elementConfig}
                      invalid={!formElement.config.valid}
                      shouldValidate={formElement.config.validation}
                      touched={formElement.config.touched}
                      errorMessage={formElement.config.errorMessage}
                      value={formElement.config.value}
                      changed={event => this.ChangeHandler(event, formElement.id)}
                      SelectChange={event =>
                        this.ChangeHandler(event, formElement.id)
                      }
                      label={formElement.config.label}
                      class={formElement.config.class}
                      fileLabel={formElement.config.fileLabel}
                      checkBoxLabel={formElement.config.checkBoxLabel}
                    />
                  </div>
                </GridItem>
              ))}
              <GridItem md={4} xs={12}>
                <div className="">
                  <Button
                    outlineBtnNew
                    onClick={event => this.upsertMaterial(event)}
                    disabled={this.state.loading === true ? true : false}
                  >
                    {this.state.SubmitButton}
                  </Button>
                  <Button solidBtnNew onClick={() => this.resetForm()}>
                    Reset
                  </Button>
                  
                </div>
              </GridItem>
            </GridContainer>
          </div>
          <div className="category_list">
            <div>
              <hr />
              <GridContainer>
                <GridItem md={4}>
                  <div className="category_search">
                    <div className="newThemeInput">
                      <Input
                        elementType="input_2"
                        class="newInput_2"
                        label="Search"
                        changed={event => this.changeSearch(event)}
                        value={this.state.searchMaterial}
                      />
                    </div>
                  </div>
                </GridItem>
                <GridItem md={8} xs={12}>
                  <div>
                    <Button
                      outlineBtnNew
                      onClick={() =>
                        this.getMaterialData(this.state.searchMaterial)
                      }
                    >
                      Search
                    </Button>
                    <Button solidBtnNew onClick={() => this.resetSearch()}>
                      Clear
                    </Button>
                  </div>
                </GridItem>
              </GridContainer>
              <div className="border_top">
                <div class="cart_table_top_border" />
              </div>
              <div className="category_list_table">
                {/* <div class="cart_table_top_border"></div> */}
                <table>
                  <thead>
                    <tr>
                      <th onClick={() => this.sortMaterialManagement("Materialname")}>
                        <div className="sort_category">
                          Material Name
                          {this.state.materialnamesort ? <ExpandMore /> : <ExpandLess />}
                        </div>
                      </th>
                      <th onClick={() => this.sortMaterialManagement("Emission")}>
                      <div className="sort_category">
                        Emission Factor
                        {this.state.emissionsort ? <ExpandMore /> : <ExpandLess />}
                        </div>
                        </th>

                      <th onClick={() => this.sortMaterialManagement("CreatedOn")}>
                      <div className="sort_category">
                      Created On
                        {this.state.createdOnsort ? <ExpandMore /> : <ExpandLess />}
                        </div>
                        </th>
                        <th onClick={() => this.sortMaterialManagement("CreatedBy")}>
                      <div className="sort_category">
                      Created By
                        {this.state.createdBysort ? <ExpandMore /> : <ExpandLess />}
                        </div>
                        </th>
                        <th onClick={() => this.sortMaterialManagement("ModifiedOn")}>
                      <div className="sort_category">
                      Modified On
                        {this.state.modifiedOnsort ? <ExpandMore /> : <ExpandLess />}
                        </div>
                        </th>
                        <th onClick={() => this.sortMaterialManagement("ModifiedBy")}>
                      <div className="sort_category">
                      Modified By
                        {this.state.modifiedBysort ? <ExpandMore /> : <ExpandLess />}
                        </div>
                        </th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.state.loading == true ? (
                      <tr>
                        <td colSpan="6">
                          <div style={{ display: "block" }}>
                            <Spinner />
                          </div>
                        </td>
                      </tr>
                    ) : materialList.length > 0 ? (
                      materialList
                    ) : (
                      <tr>
                        <td colSpan="6">
                          <div>No Result Found</div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default MaterialManagement;