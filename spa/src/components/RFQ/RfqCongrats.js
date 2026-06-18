import React, { Component } from "react";
import { Link } from "react-router-dom";
import Button from "../../UI/Button/MaterialButton";
import Input from "../../UI/Input/MaterialInput";
import {
  getPageResource,
  amountUnit,
  getElasticData,
  getBuyerPreferences,
} from "../../utility";
import {
  getServiceUrl, getWebsiteGUID, getWebsiteLanguageGuid,
  getLanguageResourceElasticIndex, getLabelText, getUrlParameter,
  getWebsiteUrl, getAWSUrl, getElasticIndexNew, getGlobalSettings,
} from "../../config";
import GridContainer from "../Material/Grid/GridContainer";
import GridItem from "../Material/Grid/GridItem";
import axios from "axios";
import { confirmAlert } from "react-confirm-alert";
import Tooltip from "@material-ui/core/Tooltip";
import Info from "@material-ui/icons/Info";
import RfqProductImage from "./RfqProductImage";
import * as RoleCodes from "../../rolecodes";
import Spinner from "../../UI/Spinner/Spinner";
import ProductForFrequentlyBought from "../ProductDetails/ProductForFrequentlyBought";
import { getBasketDetails, getWishListDetails, getProductForFrequentlyBought, } from "../Basket/CommonBasket";
import { connect } from "react-redux";

// let decimalValue = 2;
// const decimalPrecision = () => {
//   getGlobalSettings("DECIMALPRECISION").then(function(result) {
//     decimalValue = result.data.hits.hits[0]._source.settingsValue;
//   });
// };

class RfqCongrats extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rfqLanguageResources: [],
      totalqtyunit: "",
      showemmissiondata: "none",
      showemmissiondatatable: [],
      totalqty: 0,
      FrequentlyBought: [],
      showFrequentlyBoughtData: [],
      FrequentlyBoughtData: [],
      basketData: [],
      showBasketData: false,
      loading: false,
      wishlistLanguageResources: [],
      cartdetailLanguageResources: [],
      rfqProductDetails: [],
      resources: [],
      wishListDetails: [],
      showWishlistData: false,
      tempLoader: false,
      buyerBusinessType: "",
      buyerProductLevelCertificates: "",
      buyerSupplierLevelAdditionalCertificates: "",
      buyerSupplierLevelMandatoryCertificates: "",
      buyerCategory: "",
      commaSepratedBuyerProductCategories: "",
      tildeSepratedBuyerProductCategories: "",
      showLoader: true,
      ProductIsInWishList: false,
      show_resources: false,
      userCountry: [],
      userCountryAll: [],
    };
  }
  fetchBasketDetails() {
    getBasketDetails(
      this.props.userId,
      localStorage.companyGuid,
      localStorage.languageId
    )
      .then((json) => {
        if (json.data.length >= 1) {
          var propsProductGuid = this.props.ProductGuid;
          var newJson = json.data.filter(function (a) {
            return a.productGuid === propsProductGuid;
          });
          if (newJson.length >= 1) {
            this.setState({ ProductIsInCart: true });
          } else {
            this.setState({ ProductIsInCart: false });
          }
        } else {
          this.setState({ ProductIsInCart: false });
        }
        this.setState({
          loading: false,
          basketData: json.data,
          showBasketData: true,
        });
      })
      .catch((err) =>
        err.response !== undefined
          ? err.response.status === 401
            ? (window.location.pathname = "/")
            : ""
          : ""
      );
  }
  fetchWishListDetails() {
    getWishListDetails(
      this.props.userId,
      localStorage.companyGuid,
      localStorage.languageId
    )
      .then((json) => {
        if (json.data.table1.length > 1) {
          var propsProductGuid = this.props.ProductGuid;
          var newJson = json.data.table1.filter(function (a) {
            return a.productGuid === propsProductGuid;
          });
          if (newJson.length >= 1) {
            this.setState({ ProductIsInWishList: true });
          } else {
            this.setState({ ProductIsInWishList: false });
          }
        } else {
          this.setState({ ProductIsInWishList: false });
        }
        this.setState({
          loading: false,
          wishListDetails: json.data.table1,
          showWishlistData: true,
        });
      })
      .catch((err) =>
        err.response !== undefined
          ? err.response.status === 401
            ? (window.location.pathname = "/")
            : ""
          : ""
      );
  }
  getWishListLanguageResource() {
    getPageResource(
      getLanguageResourceElasticIndex(getWebsiteLanguageGuid(), "wishlist") +
      "&size=10000"
    )
      .then((json) => {
        this.setState({ wishlistLanguageResources: json });
      })
      .catch((err) =>
        err.response !== undefined
          ? err.response.status === 401
            ? (window.location.pathname = "/")
            : ""
          : ""
      );
  }
  getCartDetailLanguageResource() {
    getPageResource(
      getLanguageResourceElasticIndex(getWebsiteLanguageGuid(), "cartdetail") +
      "&size=10000"
    )
      .then((json) => {
        this.setState({ cartdetailLanguageResources: json });
      })
      .catch((err) =>
        err.response !== undefined
          ? err.response.status === 401
            ? (window.location.pathname = "/")
            : ""
          : ""
      );
  }
  async getRFQ() {
    var config = {
      headers: {
        Authorization: "Bearer " + localStorage.tokenId,
        "Content-Type": "application/json",
      },
    };
    await axios
      .get(
        getServiceUrl() +
        "product/GetOnGoingRFQProductList?UserGuid=" +
        this.props.userId,
        config
      )
      .then((json) => {
        if (json.status === 200) {
          this.setState({ rfqProductDetails: json.data });
        }
      })
      .catch((err) =>
        err.response !== undefined
          ? err.response.status === 401
            ? (window.location.pathname = "/logout")
            : ""
          : ""
      );
  }

  async componentDidMount() {
    if (this.props.userType.includes(RoleCodes.BUYER)) {
      await this.getBuyerPreferences();
    }
    //decimalPrecision();
    this.getRFQLanguageResource();
    if (this.props.isBuyer) {
      let qty = 0,
        qtyunit = "",
        skuguid = "00000000-0000-0000-0000-000000000000";
     // if (this.props.orderdetail.length > 0) {
        if (this.props.orderdetail.SelectedLocationList.length > 0) {
          qtyunit = this.props.orderdetail.SelectedLocationList[0]
            .selectedUOMText;
          this.props.orderdetail.SelectedLocationList.map((item) => {
            qty = parseFloat(item.Qty) + parseFloat(qty);
          });
        }
     // }
      if (
        this.props.SelectedSkuGuid != null &&
        this.props.SelectedSkuGuid != undefined &&
        this.props.SelectedSkuGuid != ""
      ) {
        skuguid = this.props.SelectedSkuGuid;
      } else {
        skuguid =
          this.props.exactProductDetail != null &&
            this.props.exactProductDetail != undefined &&
            this.props.exactProductDetail != ""
            ? this.props.exactProductDetail.listRateCardVM != null &&
              this.props.exactProductDetail.listRateCardVM != undefined &&
              this.props.exactProductDetail.listRateCardVM != ""
              ? this.props.exactProductDetail.listRateCardVM.filter(
                (t) => t.isDefault === true
              )[0].skuGuid
              : "00000000-0000-0000-0000-000000000000"
            : "00000000-0000-0000-0000-000000000000";
      }
      this.setState({ totalqty: qty, totalqtyunit: qtyunit });
      if (this.props.ProductGuid !== "00000000-0000-0000-0000-000000000000") {
        this.getproductcarbonemission(this.props.ProductGuid, skuguid, qty);
      }
    }

    getPageResource(getLanguageResourceElasticIndex(getWebsiteLanguageGuid(), "productdetail") + "&size=10000").then((json) => {
      let countriesGuid = [];
      if (localStorage.userCountries !== "undefined") {
        JSON.parse(localStorage.userCountries).map((item) => {
          countriesGuid.push(item.countryGuid);
        });
      }
      this.setState({
        resources: json,
        show_resources: true,
        userCountry: countriesGuid[0],
        userCountryAll: countriesGuid,
      });
    }).catch((err) =>
      err.response !== undefined
        ? err.response.status === 401
          ? (window.location.pathname = "/")
          : ""
        : ""
    );

    this.fetchBasketDetails();
    this.fetchWishListDetails();
    this.getWishListLanguageResource();
    this.getRFQ();
  }
  getRFQLanguageResource() {
    getPageResource(
      getLanguageResourceElasticIndex(getWebsiteLanguageGuid(), "createRFQ") +
      "&size=10000"
    )
      .then((json) => {
        this.setState({ rfqLanguageResources: json });
      })
      .catch((err) =>
        err.response !== undefined
          ? err.response.status === 401
            ? (window.location.pathname = "/")
            : ""
          : ""
      );
  }
  checkBox = (ev) => {
    ev.stopPropagation();
  };
  async getproductcarbonemission(ProductGuid, SkuGuid, totalqty) {
    let formbody = {};
    var config = {
      headers: {
        Authorization: "Bearer " + localStorage.tokenId,
        "Content-Type": "application/json",
        ProductGuid: ProductGuid,
        SkuGuid: SkuGuid,
        Quantity: totalqty,
      },
    };
    await axios
      .post(
        getServiceUrl() + "Product/GetProductCarbonEmissionDetails?",
        formbody,
        config
      )
      .then((response) => {
        if (response != null) {
          this.setState({
            showemmissiondatatable: response.data.table1,
            showemmissiondata: "flex",
          });
        } else {
          this.setState({ showemmissiondata: "none" });
        }
      })
      .catch((err) => {
        console.log(err);
        this.setState({ loading: false });
        confirmAlert({
          message: "Something went wrong. Please try again",
          buttons: [
            {
              label: "OK",
            },
          ],
        });
      });
  }
  async getProductForFrequentlyBought(
    buyerBusinessTypeForIndex,
    buyerProductLevelCertificatesForIndex,
    buyerSupplierLevelAdditionalCertificatesForIndex,
    buyerSupplierLevelMandatoryCertificatesForIndex,
    tildeSepratedBuyerProductCategories
  ) {
    // debugger;
    // this.setState({ tempLoader: true });
    await getProductForFrequentlyBought(this.props.ProductGuid, this.props.exactProductDetail.supplierGuid)
      .then((json) => {

        this.setState({ tempLoader: false });
        if (json.status === 200) {
          let productGuids = [
            ...new Set(json.data.map((x) => x.mappedProductGuid)),
          ];
          // this.getIndexData("getProductForFrequentlyBought", productGuids);
          this.getIndexData(
            "getProductForFrequentlyBought",
            buyerBusinessTypeForIndex,
            buyerProductLevelCertificatesForIndex,
            buyerSupplierLevelAdditionalCertificatesForIndex,
            buyerSupplierLevelMandatoryCertificatesForIndex,
            tildeSepratedBuyerProductCategories,
            productGuids
          );
          this.setState({
            FrequentlyBought: json.data,
            showFrequentlyBoughtData: true,
          });

        }
      })
      .catch((err) =>
        err.response !== undefined
          ? err.response.status === 401
            ? (window.location.pathname = "/")
            : ""
          : ""
      );
  }
  getIndexData = (
    callingMethodName,
    buyerBusinessTypeForIndex,
    buyerProductLevelCertificatesForIndex,
    buyerSupplierLevelAdditionalCertificatesForIndex,
    buyerSupplierLevelMandatoryCertificatesForIndex,
    tildeSepratedBuyerProductCategories,
    ProductGuids
  ) => {
    let indexName = "";
    let url = getElasticIndexNew(
      localStorage.userType,
      localStorage.userId,
      localStorage.languageId,
      localStorage.companyGuid
    );
    let splitURL = url
      .replace("https://", "")
      .replace("http://")
      .split("/");
    if (splitURL.length === 3) {
      indexName = splitURL[1];
    } else {
      for (let i = 0; i < splitURL.length; i++) {
        if (i === 1) {
          indexName = splitURL[i];
        }
      }
    }

    let countriesGuid = [],
      elasticQuery = "";
    if (
      localStorage.userCountries !== undefined &&
      localStorage.userCountries !== null &&
      localStorage.userCountries !== "null"
    ) {
      JSON.parse(localStorage.userCountries).map((item) => {
        countriesGuid.push(item.countryGuid);
      });
    }

    let commodityName = [];
    if (localStorage.commodityName !== undefined) {
      JSON.parse(localStorage.commodityName).map((item) => {
        commodityName.push(item.commodityName);
      });
    }

    let gradeLevel = [];
    if (localStorage.gradeLevel !== undefined) {
      JSON.parse(localStorage.gradeLevel).map((item) => {
        gradeLevel.push(item.gradeLevel);
      });
    }

    //let headerQuery = 'listBuyerCompanyMaterialTopicRankingVM.supplierRank:asc';
    let headerQuery = "productname_raw.raw.keyword:asc";
    elasticQuery = {
      query: {
        bool: {
          must: [
            { match: { languageGuid: localStorage.languageId } },
            {
              terms: {
                "listRateCardVM.CountryGuid.raw.keyword": countriesGuid,
              },
            },
            { terms: { "commodity.raw.keyword": commodityName } },
            { match: { "status_raw.raw.keyword": "Approved" } },
            { match: { isActive: "true" } },
            { match: { isSupplierActive: "true" } },
            //{ match: { "businessReady": "true" } },
            { terms: { "productguid_raw.raw.keyword": ProductGuids } },
            tildeSepratedBuyerProductCategories.length > 0
              ? {
                terms: {
                  "productcategories_raw.raw.keyword": tildeSepratedBuyerProductCategories,
                },
              }
              : "",
            {
              terms: {
                "supplierbusinesstype.raw.keyword": buyerBusinessTypeForIndex,
              },
            },
            {
              terms: {
                "listproductcertifications.raw.keyword": buyerProductLevelCertificatesForIndex,
              },
            },
            {
              bool: {
                should: [
                  {
                    terms: { "listproductgradelevel.raw.keyword": gradeLevel },
                  },
                  {
                    bool: {
                      must_not: [
                        {
                          exists: {
                            field: "listproductgradelevel.raw.keyword",
                          },
                        },
                      ],
                    },
                  },
                  {
                    terms: {
                      "listSupplierMandatoryCertificates.documentguid.raw.keyword": buyerSupplierLevelMandatoryCertificatesForIndex,
                    },
                  },
                  {
                    terms: {
                      "listSupplierAdditionalCertificates.documenttitle.raw.keyword": buyerSupplierLevelAdditionalCertificatesForIndex,
                    },
                  },
                ],
              },
            },
            // {
            //     bool: {
            //         must: [
            //             {
            //                 match: { "listBuyerCompanyMaterialTopicRankingVM.companyGuid": localStorage.companyGuid }
            //             },
            //         ]
            //     }
            // },
          ],
        },
      },
    };
    getElasticData(indexName, elasticQuery, 0, 500, headerQuery).then(
      (json) => {
        if (json !== null && json !== undefined) {
          let data = [...new Set(json.hits.hits.map((x) => x._source))];
          //   getElasticData("_globalsettings", "", 0, 500, "").then((result) => {
          //     if (result !== null && result !== undefined) {
          //       let globalSettingsData = [
          //         ...new Set(result.hits.hits.map((x) => x._source)),
          //       ];

          if (callingMethodName === "getProductForFrequentlyBought") {
            this.setState({
              FrequentlyBoughtData: data,
              tempLoader: false,
            });
          }
          //     }
          //   });
        }
        this.setState({ showLoader: false });
      }
    );
  };
  getBuyerPreferences = async () => {
    await getBuyerPreferences(localStorage.userId, localStorage.companyGuid)
      .then((json) => {
        let buyerBusinessType = "",
          buyerProductLevelCertificates = "",
          buyerSupplierLevelAdditionalCertificates = "",
          buyerSupplierLevelMandatoryCertificates = "",
          buyerCategory = "",
          buyerSubCategory = "",
          buyerProductType = "",
          commaSepratedBuyerProductCategories = "",
          BuyerProductCategories = [];
        let buyerBusinessTypeForIndex = [],
          buyerProductLevelCertificatesForIndex = [],
          buyerSupplierLevelAdditionalCertificatesForIndex = [],
          buyerSupplierLevelMandatoryCertificatesForIndex = [],
          tildeSepratedBuyerProductCategories = [];

        if (json.data.user.table3 !== undefined) {
          if (json.data.user.table3.length > 0) {
            json.data.user.table3.map((item) => {
              buyerBusinessType =
                buyerBusinessType + '"' + item.businessTypeName + '",';
              buyerBusinessTypeForIndex.push(item.businessTypeName);
            });
            buyerBusinessType = buyerBusinessType.slice(0, -1);
          }
        }
        if (json.data.user.table4 !== undefined) {
          if (json.data.user.table4.length > 0) {
            json.data.user.table4.map((item) => {
              buyerProductLevelCertificates =
                buyerProductLevelCertificates +
                '"' +
                item.productCertificateName +
                '",';
              buyerProductLevelCertificatesForIndex.push(
                item.productCertificateName
              );
            });
            buyerProductLevelCertificates = buyerProductLevelCertificates.slice(
              0,
              -1
            );
          }
        }
        if (json.data.user.table5 !== undefined) {
          if (json.data.user.table5.length > 0) {
            json.data.user.table5.map((item) => {
              if (item.documentType === "Additional") {
                buyerSupplierLevelAdditionalCertificates =
                  buyerSupplierLevelAdditionalCertificates +
                  '"' +
                  item.supplierDocumentName +
                  '",';
                buyerSupplierLevelAdditionalCertificatesForIndex.push(
                  item.supplierDocumentName
                );
              } else {
                buyerSupplierLevelMandatoryCertificates =
                  buyerSupplierLevelMandatoryCertificates +
                  '"' +
                  item.supplierDocumentGuid +
                  '",';
                buyerSupplierLevelMandatoryCertificatesForIndex.push(
                  item.supplierDocumentGuid
                );
              }
            });
            buyerSupplierLevelAdditionalCertificates = buyerSupplierLevelAdditionalCertificates.slice(
              0,
              -1
            );
            buyerSupplierLevelMandatoryCertificates = buyerSupplierLevelMandatoryCertificates.slice(
              0,
              -1
            );
          }
        }
        if (json.data.user.table6 !== undefined) {
          if (json.data.user.table6.length > 0) {
            json.data.user.table6.map((item) => {
              commaSepratedBuyerProductCategories =
                commaSepratedBuyerProductCategories +
                '"' +
                item.productCategories +
                '",';
              BuyerProductCategories.push(item.categoryGuid);
              tildeSepratedBuyerProductCategories.push(item.productCategories);
            });
            commaSepratedBuyerProductCategories = commaSepratedBuyerProductCategories.slice(
              0,
              -1
            );
          }
        }
        if (json.data.user.table6 !== undefined) {
          if (json.data.user.table6.length > 0) {
            json.data.user.table6.map((item) => {
              buyerCategory = buyerCategory + '"' + item.categoryName + '",';
            });
            buyerCategory = buyerCategory.slice(0, -1);
          }
        }
        let commodityDetails = [];
        if (json.data.user.table1 !== undefined) {
          if (json.data.user.table1.length > 0) {
            json.data.user.table1.map((item) => {
              commodityDetails.push(
                '{"commodityName":"' + item.commodityName + '"}'
              );
            });
            let parsedetails = "";
            if (commodityDetails.length > 0) {
              parsedetails = JSON.parse("[" + commodityDetails + "]");
            }
            if (parsedetails !== "") {
              localStorage.setItem(
                "commodityName",
                JSON.stringify(parsedetails)
              );
            }
          }
        }

        this.setState({
          buyerBusinessType: buyerBusinessTypeForIndex,
          buyerProductLevelCertificates: buyerProductLevelCertificatesForIndex,
          buyerSupplierLevelAdditionalCertificates: buyerSupplierLevelAdditionalCertificatesForIndex,
          buyerSupplierLevelMandatoryCertificates: buyerSupplierLevelMandatoryCertificatesForIndex,
          buyerCategory: buyerCategory,
          commaSepratedBuyerProductCategories: commaSepratedBuyerProductCategories,
          BuyerProductCategories: BuyerProductCategories,
          tildeSepratedBuyerProductCategories: tildeSepratedBuyerProductCategories,
          // buyerSubCategory: buyerSubCategory, buyerProductType: buyerProductType
        });
        if (this.props.ProductGuid != null && this.props.ProductGuid != undefined && this.props.exactProductDetail.supplierGuid != null && this.props.exactProductDetail.supplierGuid != undefined) {
          this.getProductForFrequentlyBought(
            buyerBusinessTypeForIndex,
            buyerProductLevelCertificatesForIndex,
            buyerSupplierLevelAdditionalCertificatesForIndex,
            buyerSupplierLevelMandatoryCertificatesForIndex,
            tildeSepratedBuyerProductCategories
          );
        }
      })
      .catch((err) =>
        err.response !== undefined
          ? err.response.status === 401
            ? (window.location.pathname = "/")
            : ""
          : ""
      );
  };

  render() {
    let params = getUrlParameter("productguid");
    let selectedCommodity =
      this.props.SelectedCommodityName !== undefined &&
        this.props.SelectedCommodityName != ""
        ? this.props.SelectedCommodityName
        : "";
    let SelectedCategory =
      this.props.SelectedCategoryName !== undefined &&
        this.props.SelectedCategoryName != ""
        ? this.props.SelectedCategoryName
        : "";
    let SelectedSubCategory =
      this.props.SelectedSubCategoryName !== undefined &&
        this.props.SelectedSubCategoryName != ""
        ? this.props.SelectedSubCategoryName
        : "";
    let SelectedProductTypeName =
      this.props.SelectedProductTypeName !== undefined &&
        this.props.SelectedProductTypeName != ""
        ? this.props.SelectedProductTypeName
        : "";
    let SelectedProductName = 
        this.props.NewRfqStepData !== undefined && 
            this.props.NewRfqStepData !== null &&
              this.props.NewRfqStepData !== "" 
                ? this.props.NewRfqStepData.productName
            : null;
    let BuyerTechnicalSpecificationsDocumentName =
      this.props.TechnicalSpecificationsDocumentName !== undefined &&
        this.props.TechnicalSpecificationsDocumentName !== null
        ? this.props.BuyerTechnicalSpecificationsDocumentName !== ""
          ? this.props.BuyerTechnicalSpecificationsDocumentName
          : null
        : null;
    let TechnicalSpecificationsDocumentName =
      this.props.TechnicalSpecificationsDocumentName !== undefined &&
        this.props.TechnicalSpecificationsDocumentName !== null
        ? this.props.TechnicalSpecificationsDocumentName !== ""
          ? this.props.TechnicalSpecificationsDocumentName
          : null
        : null;
    let TechnicalSpecificationsDocument =
      this.props.TechnicalSpecificationsDocument !== undefined &&
        this.props.TechnicalSpecificationsDocument !== null
        ? this.props.TechnicalSpecificationsDocument !== ""
          ? this.props.TechnicalSpecificationsDocument
          : null
        : null;
    let ArtworkDocumentName =
      this.props.ArtworkDocumentName !== undefined &&
        this.props.ArtworkDocumentName !== null
        ? this.props.ArtworkDocumentName !== ""
          ? this.props.ArtworkDocumentName
          : null
        : null;
    let ArtworkDocument =
      this.props.ArtworkDocument !== undefined &&
        this.props.ArtworkDocument !== null
        ? this.props.ArtworkDocument !== ""
          ? this.props.ArtworkDocument
          : null
        : null;
    let rfqGuid =
      this.props.rfqGuid !== undefined && this.props.rfqGuid !== null
        ? this.props.rfqGuid
        : "";
    let createdBy =
      this.props.createdBy !== undefined && this.props.createdBy !== null
        ? JSON.parse(localStorage.userType) === RoleCodes.SUPPLIER
          ? localStorage.companyGuid
          : this.props.createdBy
        : "";
    //let applicationValue = this.props.selectedData !== undefined && this.props.selectedData !== null ? this.props.selectedData.ApplicationValue : "";
    let issharetechnicalspecificationdocument =
      this.props.selectedData !== undefined && this.props.selectedData !== null
        ? this.props.selectedData.Issharetechnicalspecificationdocument
        : "";
    //let tranportationOwnership = this.props.SelectedTransportation !== undefined && this.props.SelectedTransportation !== null ? this.props.SelectedTransportation.tranportationOwnership : "";
    let carbonemissionvalue = 0,
      carbonemissionunit = "",
      perunitcarbonemissionvalue = 0;
    let perunitcarbonemissionunit = "";
    if (this.props.isBuyer) {
      carbonemissionvalue =
        this.state.showemmissiondatatable != undefined
          ? this.state.showemmissiondatatable.length > 0
            ? this.state.showemmissiondatatable[0].carbonEmission
            : 0
          : 0;
      carbonemissionunit =
        this.state.showemmissiondatatable != undefined
          ? this.state.showemmissiondatatable.length > 0
            ? this.state.showemmissiondatatable[0].carbonEmissionUnit
            : ""
          : "";
      perunitcarbonemissionvalue =
        this.state.showemmissiondatatable != undefined
          ? this.state.showemmissiondatatable.length > 0
            ? this.state.showemmissiondatatable[0].perUnitCarbonEmission
            : 0
          : 0;
      perunitcarbonemissionunit =
        this.state.showemmissiondatatable != undefined
          ? this.state.showemmissiondatatable.length > 0
            ? this.state.showemmissiondatatable[0].perUnitCarbonEmissionUnit
            : ""
          : "";
    } else {
      carbonemissionvalue =
        this.props.showemmissiondatatable != undefined
          ? this.props.showemmissiondatatable.length > 0
            ? this.props.showemmissiondatatable[0].carbonEmission
            : 0
          : 0;
      carbonemissionunit =
        this.props.showemmissiondatatable != undefined
          ? this.props.showemmissiondatatable.length > 0
            ? this.props.showemmissiondatatable[0].carbonEmissionUnit
            : ""
          : "";
      perunitcarbonemissionvalue =
        this.props.showemmissiondatatable != undefined
          ? this.props.showemmissiondatatable.length > 0
            ? this.props.showemmissiondatatable[0].perUnitCarbonEmission
            : 0
          : 0;
      perunitcarbonemissionunit =
        this.props.showemmissiondatatable != undefined
          ? this.props.showemmissiondatatable.length > 0
            ? this.props.showemmissiondatatable[0].perUnitCarbonEmissionUnit
            : ""
          : "";
    }
    let productImageDetail =
      this.props.exactProductDetail !== undefined &&
        this.props.exactProductDetail !== null
        ? this.props.exactProductDetail.listRateCardVM
        : "";
    let productImageURL = "";
    if (localStorage.userType.includes("BUYER")) {
      if (
        this.props.virtualSampleData !== undefined &&
        this.props.virtualSampleData.length > 0 &&
        this.props.exactProductDetail !== null &&
        this.props.exactProductDetail !== undefined &&
        this.props.virtualSampleData.filter(
          (x) => x === this.props.exactProductDetail.supplierCompanyGuid
        ).length > 0
      ) {
        if (
          productImageDetail !== undefined &&
          productImageDetail != "" &&
          productImageDetail.length > 0
        ) {
          let prodImageName = this.props.exactProductDetail.listRateCardVM.filter(
            (t) => t.isDefault === true
          )[0].imageName;
          if (prodImageName !== "") {
            productImageURL =
              getAWSUrl() +
              "ProductImages/" +
              this.props.exactProductDetail.supplierGuid.toUpperCase() +
              "/Medium/" +
              localStorage.companyGuid.toUpperCase() +
              "/" +
              prodImageName;
          }
        }
      } else {
        if (
          productImageDetail !== undefined &&
          productImageDetail != "" &&
          productImageDetail.length > 0
        ) {
          let prodImageName = this.props.exactProductDetail.listRateCardVM.filter(
            (t) => t.isDefault === true
          )[0].imageName;
          if (prodImageName !== "") {
            productImageURL =
              getAWSUrl() +
              "ProductImages/" +
              this.props.exactProductDetail.supplierGuid.toUpperCase() +
              "/Medium/" +
              prodImageName;
          }
        }
      }
    } else {
      if (
        productImageDetail !== undefined &&
        productImageDetail != "" &&
        productImageDetail.length > 0
      ) {
        let prodImageName = this.props.exactProductDetail.listRateCardVM.filter(
          (t) => t.isDefault === true
        )[0].imageName;
        if (prodImageName !== "") {
          productImageURL =
            getAWSUrl() +
            "ProductImages/" +
            this.props.exactProductDetail.supplierGuid.toUpperCase() +
            "/Medium/" +
            prodImageName;
        }
      }
    }
    let productSkuGuid =
      this.props.productSkuDetail !== undefined &&
        this.props.productSkuDetail !== null
        ? this.props.productSkuDetail[0].productSkuGuid
        : "";
    let companyName = this.props.NewRfqStepData !== undefined && this.props.NewRfqStepData != "" ? this.props.NewRfqStepData.companyName : "";
    let totalco2 = 0;
    let tranportemission = this.props.TransportEmission !== "" && this.props.TransportEmission !== 0 && this.props.TransportEmission !== undefined ? this.props.TransportEmission : 0;
    let carbonemission = this.props.CarbonEmission !== "" && this.props.CarbonEmission !== 0 && this.props.CarbonEmission !== undefined ? this.props.CarbonEmission : 0;
    totalco2 = parseFloat(tranportemission) + parseFloat(carbonemission);
    return (
      <React.Fragment>
        {/*{this.props.isEdit !== null && this.props.isEdit !== undefined && this.props.isEdit === true ? '' : <p className="rfq_desc">{this.props.SelectedCommodityName} {">"} {this.props.SelectedCategoryName} {">"} {this.props.SelectedSubCategoryName}</p>}*/}
        {/* <div className="rfq_congrats_main">
                    <div className="rfq_body">
                        <div className="rfq_congrats">
                            <h4>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "hurray,itsdone!!! "; })[0], " Hurray, its done!!! ") : ""}</h4>
                            {this.props.InvitedSuppliers !== undefined && this.props.InvitedSuppliers !== null ?
                                <p>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "yourrfqissuccessfullysubmittedto"; })[0], "Your RFQ is successfully submitted to") : ""} {this.props.InvitedSuppliers} {this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "suppliers"; })[0], "suppliers") : ""}</p>
                                : ""}
                        </div>
                    </div>
                    <div className="rfq_action">
                        <Button solidBtnNew onClick={this.props.gotoDashboard}>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "rfqlisting"; })[0], "RFQ Listing") : ""}</Button>
                        {this.props.isBuyer !== undefined && this.props.isBuyer !== null ?
                            this.props.isBuyer === false ?
                                ""
                                :
                                params !== undefined && params !== null ?
                                    params === false ?
                                        <Button solidBtnNew onClick={this.props.gotoHomePage}>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "createnewrfq"; })[0], "Create New Rfq") : ""}</Button>
                                        :
                                        ""
                                    :
                                    <Button solidBtnNew onClick={this.props.gotoHomePage}>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "createnewrfq"; })[0], "Create New Rfq") : ""}</Button>
                            :
                            params !== undefined && params !== null ?
                                params === false ?
                                    <Button solidBtnNew onClick={this.props.gotoHomePage}>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "createnewrfq"; })[0], "Create New Rfq") : ""}</Button>
                                    :
                                    ""
                                :
                                ""
                        }
                    </div>
                </div> */}
        <GridContainer className="rfq_congrats_main">
          {/* <GridItem className="rfq_product_type_img" md={5}>
                        <img src="https://ewizgreen-beta.s3.amazonaws.com/CategoryIcons/ic_Corrugated_Boxes.svg" />
                    </GridItem> */}
          {this.props.isBuyer ? (
            this.props.isCatelogRFQ ? (
              productImageURL != "" ? (
                <GridItem md={4}>
                  {/* <img src={productImageURL} onError={(e) => { e.target.onerror = null; e.target.src = getAWSUrl() + "ProductImages/Thumbnail/default.jpg"}} /> */}
                  <RfqProductImage
                    exactProductDetail={this.props.exactProductDetail}
                    ProductGuid={this.props.ProductGuid}
                    SelectedSkuGuid={this.props.SelectedSkuGuid}
                    virtualSampleData={this.props.virtualSampleData}
                  />
                </GridItem>
              ) : (
                <GridItem className="rfq_product_type_img" md={4}>
                  <img
                    src={getAWSUrl() + "ProductImages/Thumbnail/default.jpg"}
                  />
                </GridItem>
              )
            ) : this.props.producttypeicon != null &&
              this.props.producttypeicon != "" &&
              this.props.producttypeicon != undefined ? (
              <GridItem className="rfq_product_type_img" md={4}>
                <img
                  src={
                    getAWSUrl() + "CategoryIcons/" + this.props.producttypeicon
                  }
                />
              </GridItem>
            ) : (
              <GridItem className="rfq_product_type_img" md={4}>
                <img
                  src={getAWSUrl() + "ProductImages/Thumbnail/default.jpg"}
                />
              </GridItem>
            )
          ) : this.props.isExactSupplier ? (
            productImageURL != "" ? (
              <GridItem md={4}>
                {/* <img src={productImageURL} onError={(e) => { e.target.onerror = null; e.target.src = getAWSUrl() + "ProductImages/Thumbnail/default.jpg" }} /> */}
                <RfqProductImage
                  exactProductDetail={this.props.exactProductDetail}
                  ProductGuid={this.props.exactProductDetail.productGuid}
                  SelectedSkuGuid={productSkuGuid}
                  virtualSampleData={this.props.virtualSampleData}
                  buyerCompanyGuid={
                    this.props.rfqGeneralDetails.buyerCompanyGuid
                  }
                />
              </GridItem>
            ) : (
              <GridItem className="rfq_product_type_img" md={4}>
                <img
                  src={getAWSUrl() + "ProductImages/Thumbnail/default.jpg"}
                />
              </GridItem>
            )
          ) : this.props.rfqGeneralDetails.productTypeIcon != null &&
            this.props.rfqGeneralDetails.productTypeIcon != undefined &&
            this.props.rfqGeneralDetails.productTypeIcon != "" ? (
            <GridItem className="rfq_product_type_img" md={4}>
              <img
                id="ProdDefaultImg"
                role="img"
                src={
                  this.props.rfqGeneralDetails !== undefined
                    ? getAWSUrl() +
                    "CategoryIcons/" +
                    this.props.rfqGeneralDetails.productTypeIcon
                    : ""
                }
                alt={
                  this.props.rfqGeneralDetails !== undefined
                    ? this.props.rfqGeneralDetails.productTypeName
                    : ""
                }
              />
            </GridItem>
          ) : (
            <GridItem className="rfq_product_type_img" md={4}>
              <img src={getAWSUrl() + "ProductImages/Thumbnail/default.jpg"} />
            </GridItem>
          )}
          <GridItem className="rfq_congrats_content" md={8}>
            <div className="rfq_congrats_head">
              <h4>
                <b>Congratulations {localStorage.firstName}!</b>
              </h4>
              {this.props.isBuyer ? (
                <p>
                  {this.state.rfqLanguageResources !== null
                    ? getLabelText(
                      this.state.rfqLanguageResources.filter((x) => {
                        return x.resourceKey === "yourrfqsendsuccessfully";
                      })[0],
                      "Your RFQ request is sent successfully"
                    )
                    : ""}
                </p>
              ) : (
                <p>{this.props.congratMessage}</p>
              )}
            </div>
            <div className="rfq_congrats_middle">
              <div>
                <p className="rfq_desc rfq_breadcrumb">
                  {selectedCommodity} {SelectedCategory !== "" ? ">" : ""}{" "}
                  {SelectedCategory} {SelectedSubCategory !== "" ? ">" : ""}{" "}
                  {SelectedSubCategory}{" "}
                  {SelectedProductTypeName !== "" &&
                    SelectedProductTypeName !== null
                    ? ">"
                    : ""}{" "}
                  {SelectedProductTypeName}
                </p>
              </div>
              <div>
                {this.props.isBuyer ?
                <div>
                  {SelectedProductName !== "" && SelectedProductName !== null  ?
                    <div>
                    <h6 style={{fontWeight: 600, color: '#1C9689', marginBottom: '5px' }}>Product Name</h6>
                    <h5 style={{fontStyle: 'normal', fontWeight: 600, fontSize: '18px', lineHeight: '33px'}}>{SelectedProductName}</h5>
                    </div>
                    :
                    <div>
                      <h6 style={{fontWeight: 600, color: '#1C9689', marginBottom: '5px' }}>Product Type</h6>
                      <h5 style={{fontStyle: 'normal', fontWeight: 600, fontSize: '18px', lineHeight: '33px'}}>{SelectedProductTypeName}</h5>
                    </div>
                  }
                </div>
                : 
                <div>
                  {this.props.isExactSupplier !== false ?
                    <div>
                    <h6 style={{fontWeight: 600, color: '#1C9689', marginBottom: '5px' }}>Product Name</h6>
                    <h5 style={{fontStyle: 'normal', fontWeight: 600, fontSize: '18px', lineHeight: '33px'}}>{this.props.exactSupplierDetail[0].productName}</h5>
                    </div>
                    :
                    <div>
                      <h6 style={{fontWeight: 600, color: '#1C9689', marginBottom: '5px' }}>Product Type</h6>
                      <h5 style={{fontStyle: 'normal', fontWeight: 600, fontSize: '18px', lineHeight: '33px'}}>{SelectedProductTypeName}</h5>
                    </div>
                  }
                </div> }
              </div>
              <div className="rfq_congrats_middle_data">
                {this.props.ApplicationValue !== "" ? (
                  <div>
                    <h6>
                      {this.state.rfqLanguageResources !== null
                        ? getLabelText(
                          this.state.rfqLanguageResources.filter((x) => {
                            return x.resourceKey === "application/enduse";
                          })[0],
                          "Application/End use"
                        )
                        : ""}
                    </h6>
                    <div style={{ lineBreak: "anywhere" }}>
                      <h5>{this.props.ApplicationValue}</h5>
                    </div>
                  </div>
                ) : (
                  ""
                )}
                <div>
                  <h6>
                    {this.state.rfqLanguageResources !== null
                      ? getLabelText(
                        this.state.rfqLanguageResources.filter((x) => {
                          return x.resourceKey === "transportationownership";
                        })[0],
                        "Transportation Ownership"
                      )
                      : ""}
                  </h6>
                  <h5>{this.props.SelectedTransportation}</h5>
                </div>
                {this.props.isBuyer ?
                  <div>
                    <h6>Order Quantity</h6>
                    <h5>{this.state.totalqty} {this.state.totalqtyunit}</h5>
                  </div>
                  :
                  <div>
                    <h6>Order Quantity</h6>
                    <h5>{this.props.TotalQuantity} {this.props.qtyUnit}</h5>
                  </div>}
                {this.props.isBuyer ? ""
                  :
                  this.props.totalproductcost != null && this.props.totalproductcost != undefined && this.props.totalproductcost != "" ?
                    this.props.totalproductcost > 0 ?
                      <div>
                        <h6>Product Cost (in INR)</h6>
                        <h5>{amountUnit(this.props.totalproductcost)}</h5>
                      </div> : "" : ""}
              </div>
              {/* <div className="rfq_congrats_middle_data">
              </div> */}
              {this.props.isBuyer ?
                (totalco2 > 0) ?
                  <div style={{ background: "#1C9689", padding: "10px 23px 10px 23px", color: "#fff", fontSize: "18px", borderRadius: "0 20px 20px 0", display: "inline-flex", marginLeft: "-25px", marginBottom: "30px" }}><span>Carbon Details</span></div>
                  : "" : ""}
              {/* : this.props.rfqGeneralDetails != null && this.props.rfqGeneralDetails != null && this.props.rfqGeneralDetails != "" ?
                                    this.props.rfqGeneralDetails.productsuppliercompany == localStorage.companyGuid ?
                                        (perunitcarbonemissionvalue > 0 || carbonemissionvalue > 0) ?
                                            <div style={{ background: "#1C9689", padding: "10px 44px", color: "#fff", fontSize: "18px", borderRadius: "0 20px 20px 0", display: "inline-flex", marginLeft: "-25px", marginBottom: "30px" }}><span>Carbon Details</span></div>
                                            : "" : "" : ""} */}
              <div className="rfq_congrats_middle_data rfq_congrats_co2_details">
                {this.props.isBuyer ?
                  companyName !== "" ?
                    <React.Fragment>
                      <div>
                        <h6>Supplier Name</h6>
                        <h5>{companyName}</h5>
                      </div>
                      {/* {perunitcarbonemissionvalue > 0 ?
                                            <div>
                                                <h6 style={{ display: 'flex', alignItems: 'center' }}>
                                                    Carbon Footprint (in <span dangerouslySetInnerHTML={{ __html: perunitcarbonemissionunit }}></span>)
                                                    {localStorage.userType.includes("BUYER") === true ?
                                                        this.props.virtualSampleData !== undefined && this.props.virtualSampleData.length > 0 ?
                                                            this.props.virtualSampleData.filter(x => x === this.props.exactProductDetail.supplierCompanyGuid).length > 0 ?
                                                                <Tooltip placement="bottom-end" title={<div className='tooltip_div_bottom_end'>The product carbon footprint doesn't include the impact of the printing & embossing on the product.</div>}><Info /></Tooltip>
                                                                : "" : "" :
                                                        localStorage.userType.includes("SUPPLIER") === true ?
                                                            this.props.virtualSampleData !== undefined && this.props.virtualSampleData.length > 0 ?
                                                                this.props.virtualSampleData.filter(x => x === this.props.rfqGeneralDetails.buyerCompanyGuid).length > 0 ?
                                                                    <Tooltip placement="bottom-end" title={<div className='tooltip_div_bottom_end'>The product carbon footprint doesn't include the impact of the printing & embossing on the product.</div>}><Info /></Tooltip>
                                                                    : "" : "" : ""
                                                    }
                                                </h6>
                                                <h5>{parseFloat(Number(perunitcarbonemissionvalue).toFixed(2))}</h5>
                                            </div> : ""}
                                        {carbonemissionvalue > 0 ?
                                            <div>
                                                <h6>Total Carbon Emission (in <span dangerouslySetInnerHTML={{ __html: carbonemissionunit }}></span>)</h6>
                                                <h5>{parseFloat(Number(carbonemissionvalue).toFixed(2))}</h5>
                                            </div> : ""} */}
                      <div>
                        <h6><span>Total Kg CO<sub>2</sub>eq</span></h6>
                        <h5>{totalco2.toFixed(2)}</h5>
                      </div>
                      <div>
                        <h6><span>Product Kg CO<sub>2</sub>eq</span>{this.props.virtualSampleData !== undefined && this.props.virtualSampleData.length > 0 ?
                          this.props.virtualSampleData.filter(x => x === this.props.supplierCompanyGuid).length > 0 ?
                            <Tooltip placement="bottom-end" title={<div className='tooltip_div_bottom_end'>The product carbon footprint doesn't include the impact of the printing & embossing on the product.</div>}><Info /></Tooltip>
                            : "" : ""}</h6>
                        <h5>{carbonemission.toFixed(2)}</h5>
                      </div>
                      <div>
                        <h6><span>Transport Kg CO<sub>2</sub>eq</span></h6>
                        <h5>{tranportemission.toFixed(2)}</h5>
                      </div>
                    </React.Fragment>
                    : ""
                  :
                  <React.Fragment>
                    {/* {this.props.rfqGeneralDetails != null && this.props.rfqGeneralDetails != null && this.props.rfqGeneralDetails != "" ?
                                            this.props.rfqGeneralDetails.productsuppliercompany == localStorage.companyGuid ?
                                                <React.Fragment>
                                                    {perunitcarbonemissionvalue > 0 ?
                                                        <div>
                                                            <h6 style={{ display: 'flex', alignItems: 'center' }}>
                                                                Carbon Footprint (in <span dangerouslySetInnerHTML={{ __html: perunitcarbonemissionunit }}></span>)
                                                                {localStorage.userType.includes("BUYER") === true ?
                                                                    this.props.virtualSampleData !== undefined && this.props.virtualSampleData.length > 0 ?
                                                                        this.props.virtualSampleData.filter(x => x === this.props.exactProductDetail.supplierCompanyGuid).length > 0 ?
                                                                            <Tooltip placement="bottom-end" title={<div className='tooltip_div_bottom_end'>The product carbon footprint doesn't include the impact of the printing & embossing on the product.</div>}><Info /></Tooltip>
                                                                            : "" : "" :
                                                                    localStorage.userType.includes("SUPPLIER") === true ?
                                                                        this.props.virtualSampleData !== undefined && this.props.virtualSampleData.length > 0 ?
                                                                            this.props.virtualSampleData.filter(x => x === this.props.rfqGeneralDetails.buyerCompanyGuid).length > 0 ?
                                                                                <Tooltip placement="bottom-end" title={<div className='tooltip_div_bottom_end'>The product carbon footprint doesn't include the impact of the printing & embossing on the product.</div>}><Info /></Tooltip>
                                                                                : "" : "" : ""
                                                                }
                                                            </h6>
                                                            <h5>{parseFloat(Number(perunitcarbonemissionvalue).toFixed(2))}</h5>
                                                        </div>
                                                        : ""}
                                                    {carbonemissionvalue > 0 ?
                                                        <div>
                                                            <h6>Total Carbon Emission (in <span dangerouslySetInnerHTML={{ __html: carbonemissionunit }}></span>)</h6>
                                                            <h5>{parseFloat(Number(carbonemissionvalue).toFixed(2))}</h5>
                                                        </div> : ""}
                                                </React.Fragment>
                                                : "" : ""} */}
                  </React.Fragment>}
              </div>
            </div>
            <div className="view_tech_specs_div">
              {TechnicalSpecificationsDocument !== null ? (
                // <a className="view_tech_specs" target='_blank' href={URL.createObjectURL(TechnicalSpecificationsDocument)}>View Technical Specification Document</a>
                <div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M4 16V17C4 17.7956 4.31607 18.5587 4.87868 19.1213C5.44129 19.6839 6.20435 20 7 20H17C17.7956 20 18.5587 19.6839 19.1213 19.1213C19.6839 18.5587 20 17.7956 20 17V16M16 12L12 16M12 16L8 12M12 16V4"
                      stroke="#FF9907"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  <div>
                    <p className="file_name">
                      View Technical Specification Document
                    </p>
                    <a
                      className="view_tech_specs"
                      target="_blank"
                      href={URL.createObjectURL(
                        TechnicalSpecificationsDocument
                      )}
                    >
                      Download
                    </a>
                  </div>
                </div>
              ) : TechnicalSpecificationsDocumentName !== null ? (
                // <a className="view_tech_specs" target='_blank' href={getWebsiteUrl() + 'RFQ/' + rfqGuid + '/TechnicalSpecifications/' + createdBy + '/' + TechnicalSpecificationsDocumentName}>View Technical Specification Document</a>
                <div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M4 16V17C4 17.7956 4.31607 18.5587 4.87868 19.1213C5.44129 19.6839 6.20435 20 7 20H17C17.7956 20 18.5587 19.6839 19.1213 19.1213C19.6839 18.5587 20 17.7956 20 17V16M16 12L12 16M12 16L8 12M12 16V4"
                      stroke="#FF9907"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  <div>
                    <p className="file_name">
                      View Supplier Technical Specification Document
                    </p>
                    <a
                      className="view_tech_specs"
                      target="_blank"
                      href={
                        getWebsiteUrl() +
                        "RFQ/" +
                        rfqGuid +
                        "/TechnicalSpecifications/" +
                        createdBy +
                        "/" +
                        TechnicalSpecificationsDocumentName
                      }
                    >
                      Download
                    </a>
                  </div>
                </div>
              ) : (
                ""
              )}
              {this.props.isBuyer === false ? (
                BuyerTechnicalSpecificationsDocumentName !== null ? (
                  <div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M4 16V17C4 17.7956 4.31607 18.5587 4.87868 19.1213C5.44129 19.6839 6.20435 20 7 20H17C17.7956 20 18.5587 19.6839 19.1213 19.1213C19.6839 18.5587 20 17.7956 20 17V16M16 12L12 16M12 16L8 12M12 16V4"
                        stroke="#FF9907"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                    <div>
                      <p className="file_name">
                        View Technical Specification Document{" "}
                      </p>
                      <a
                        className="view_tech_specs"
                        target="_blank"
                        href={
                          getWebsiteUrl() +
                          "RFQ/" +
                          rfqGuid +
                          "/TechnicalSpecifications/" +
                          this.props.createdBy +
                          "/" +
                          BuyerTechnicalSpecificationsDocumentName
                        }
                      >
                        Download
                      </a>
                    </div>
                  </div>
                ) : (
                  ""
                )
              ) : (
                ""
              )}
              {ArtworkDocument !== null ? (
                // <a className="view_tech_specs" target='_blank' href={URL.createObjectURL(ArtworkDocument)}>View Artwork Document</a>
                <div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M4 16V17C4 17.7956 4.31607 18.5587 4.87868 19.1213C5.44129 19.6839 6.20435 20 7 20H17C17.7956 20 18.5587 19.6839 19.1213 19.1213C19.6839 18.5587 20 17.7956 20 17V16M16 12L12 16M12 16L8 12M12 16V4"
                      stroke="#FF9907"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  <div>
                    <p className="file_name">View Artwork Document</p>
                    <a
                      className="view_tech_specs"
                      target="_blank"
                      href={URL.createObjectURL(ArtworkDocument)}
                    >
                      Download
                    </a>
                  </div>
                </div>
              ) : ArtworkDocumentName !== null ? (
                // <a className="view_tech_specs" target='_blank' href={getWebsiteUrl() + 'RFQ/' + rfqGuid + '/Artwork/' + ArtworkDocumentName}>View Artwork Document</a>
                <div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M4 16V17C4 17.7956 4.31607 18.5587 4.87868 19.1213C5.44129 19.6839 6.20435 20 7 20H17C17.7956 20 18.5587 19.6839 19.1213 19.1213C19.6839 18.5587 20 17.7956 20 17V16M16 12L12 16M12 16L8 12M12 16V4"
                      stroke="#FF9907"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  <div>
                    <p className="file_name">View Artwork Document</p>
                    <a
                      className="view_tech_specs"
                      target="_blank"
                      href={
                        getWebsiteUrl() +
                        "RFQ/" +
                        rfqGuid +
                        "/Artwork/" +
                        ArtworkDocumentName
                      }
                    >
                      Download
                    </a>
                  </div>
                </div>
              ) : (
                ""
              )}
            </div>
            {/*{this.props.isBuyer ? "" :*/}
            {/*    this.props.SupplierStatus !== "Quote Sent" ? "" :*/}
            {/*        <div className="suplier_rfq_congrats_details">*/}
            {/*            <div>*/}
            {/*                <p>Product Cost</p>*/}
            {/*                <span className="in_unit">in INR</span>*/}
            {/*                <h3 >{amountUnit(this.props.totalproductcost)} </h3>*/}
            {/*            </div>*/}
            {/*            <div>*/}
            {/*                <p>Order Quantity</p>*/}
            {/*                <span className="in_unit">in {this.props.qtyUnit}</span>*/}
            {/*                <h3>{amountUnit(totalqty)}</h3>*/}
            {/*            </div>*/}
            {/*            {this.props.rfqGeneralDetails != null && this.props.rfqGeneralDetails != null && this.props.rfqGeneralDetails != "" ?*/}
            {/*                this.props.rfqGeneralDetails.productsuppliercompany == localStorage.companyGuid ? this.props.totalCarbonEmmision.length > 0 ?*/}
            {/*                    this.props.totalCarbonEmmision[0].carbonEmission > 0 ?*/}
            {/*                        <div>*/}
            {/*                            <p>Total Carbon Emission</p>*/}
            {/*                            <span className="in_unit">in {this.props.totalCarbonEmmision[0].carbonEmissionUnit}</span>*/}
            {/*                            <h3>{this.props.totalCarbonEmmision[0].carbonEmission}</h3>*/}
            {/*                        </div>*/}
            {/*                        : "" : "" : "" : ""}*/}
            {/*        </div>}*/}
            {this.props.isBuyer && issharetechnicalspecificationdocument ? (
              <div>
                <Input
                  checked={issharetechnicalspecificationdocument}
                  onClickd={(event) => {
                    this.checkBox(event);
                  }}
                  elementConfig={{ disabled: true }}
                  class="newInput"
                  elementType="checkbox"
                  checkBoxLabel={
                    this.state.rfqLanguageResources !== null
                      ? getLabelText(
                        this.state.rfqLanguageResources.filter((x) => {
                          return (
                            x.resourceKey ===
                            "suppliershouldsharetechnical specification document"
                          );
                        })[0],
                        "Supplier should share technical specification document"
                      )
                      : ""
                  }
                />
              </div>
            ) : (
              ""
            )}
            {this.props.isBuyer ? (
              <div>
                RFQ ID:{" "}
                <b style={{ marginRight: "20px", color: "#ffa93c" }}>
                  {this.props.NewRfqId}
                </b>{" "}
                Sent to: <b>{this.props.InvitedSuppliers} Suppliers</b>
              </div>
            ) : (
              ""
            )}
            {this.props.isBuyer ? (
              <div className="Rfqcongrats_action">
                <Button
                  className="secondarydBtn"
                  onClick={this.props.gotoDashboard}
                >
                  {this.state.rfqLanguageResources !== null
                    ? getLabelText(
                      this.state.rfqLanguageResources.filter((x) => {
                        return x.resourceKey === "viewthedetails";
                      })[0],
                      "View Details"
                    )
                    : ""}
                </Button>
                <Button
                  className="primaryBtn"
                  onClick={this.props.gotoHomePage}
                >
                  {this.state.rfqLanguageResources !== null
                    ? getLabelText(
                      this.state.rfqLanguageResources.filter((x) => {
                        return x.resourceKey === "rfqlist";
                      })[0],
                      "RFQ list"
                    )
                    : ""}
                </Button>
              </div>
            ) : (
              <div className="Rfqcongrats_action">
                <Button
                  className="secondarydBtn"
                  onClick={this.props.gotoDashboard}
                >
                  {this.state.rfqLanguageResources !== null
                    ? getLabelText(
                      this.state.rfqLanguageResources.filter((x) => {
                        return x.resourceKey === "rfqdashboard";
                      })[0],
                      "Dashboard"
                    )
                    : ""}
                </Button>
                <Button
                  className="primaryBtn"
                  onClick={this.props.gotoRfqViewPage}
                >
                  {this.state.rfqLanguageResources !== null
                    ? getLabelText(
                      this.state.rfqLanguageResources.filter((x) => {
                        return x.resourceKey === "viewrfqs";
                      })[0],
                      "View RfQs"
                    )
                    : ""}
                </Button>
              </div>
            )}
          </GridItem>
        </GridContainer>
        {this.state.tempLoader ? (
          <Spinner />
        ) : this.state.showFrequentlyBoughtData === true &&
          this.state.FrequentlyBought !== null &&
          this.state.FrequentlyBought.length > 0 ? (
          <div className="recentlyProd">
            <ProductForFrequentlyBought
              FrequentlyBought={this.state.FrequentlyBought}
              // decimalValue={decimalValue}
              SlidesToShow={4}
              LanguageResources={this.state.LanguageResources}
              basketData={this.state.basketData}
              wishListDetails={this.state.wishListDetails}
              showBasketData={this.state.showBasketData}
              showWishlistData={this.state.showWishlistData}
              wishlistLanguageResources={this.state.wishlistLanguageResources}
              cartdetailLanguageResources={this.state.cartdetailLanguageResources}
              FrequentlyBoughtData={this.state.FrequentlyBoughtData}
              rfqProductDetails={this.state.rfqProductDetails}
              congrates={true}
            />
          </div>
        ) : (
          ""
        )}
      </React.Fragment>
    );
  }
}
const mapStateToProps = (state) => {
  return {
    IsAuthorized: state.login.IsAuthorized,
    userId: state.login.userId,
    languageId: state.login.languageId,
    userType: state.login.userType,
    tokenId: state.login.tokenId,
  };
};
export default connect(mapStateToProps)(RfqCongrats);