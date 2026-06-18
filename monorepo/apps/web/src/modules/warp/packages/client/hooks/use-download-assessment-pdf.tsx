import {
  Document,
  Image,
  Link,
  Page,
  pdf,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { convertDBAnswersToStoreAnswers } from "@/modules/warp/packages/client/features/form/store";
import { FormField, Question, Section } from "@/modules/warp/packages/graphql/generated/types";
import { useGetFormfieldAndAnswersByinvitationIdLazyQuery } from "@/modules/warp/packages/graphql/queries/generated/get-formfield-and-answers-by-invitationId";
import { useGetSubmittedFormToDownloadAsPdfLazyQuery } from "@/modules/warp/packages/graphql/queries/generated/get-submitted-form-to-download-as-pdf";
import { saveAs } from "file-saver";
import jsonata from "jsonata";
import { concat, sortBy } from "lodash";
import { useState } from "react";
import { FormFieldWithChildrenType } from "../features/form/types";

const getBaseUrl = () =>
  typeof window !== "undefined" ? window.location.origin : "";

let showlable = false;
let score = true;
const styles = StyleSheet.create({
  page: {
    border: "1px solid #cdcdcd",
    padding: "35px",
    display: "flex",
    flexDirection: "column",
    width: "80%",
    margin: "auto",
  },
  coloumn: {
    display: "flex",
    flexDirection: "column",
  },
  halfWidth: {
    flex: "0 0 50%",
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  mainTitle: {
    fontSize: 14,
    fontWeight: 400,
  },
  flex: {
    display: "flex",
  },
  flex10: {
    width: "100%",
    // border: "1px solid #cdcdcd",
    // borderRadius: "5px",
    margin: "2px 0",
    padding: "0px 20px",
  },
  tagText: {
    fontSize: "10pt",
    fontWeight: 400,
    marginBottom: "5pt",
    width: "100%",
    textOverflow: "ellipsis",
    display: "flex",
    flexWrap: "wrap",
  },
  flex90: {
    width: "100%",
    border: "1px solid #cdcdcd",
    borderRadius: "5px",
    margin: "2px 0",
    padding: "5px 5px 0 5px",
  },
  subTitle: {
    fontSize: 12,
    fontWeight: 400,
    marginTop: "1px",
    padding: 5,
  },
  questions: {
    display: "flex",
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
    textAlign: "left",
    // border: "1px solid #ffff00",
  },
  questionsText: {
    fontSize: "10pt",
    fontWeight: 400,
    paddingRight: 85,
  },
  questionContainer: {
    display: "flex",
    marginBottom: "0px",
    width: "100%",
    // border: "1px solid #ff0000",
  },
  questionLeft: {
    width: "88%",
    // border: "1px solid #00eeee",
  },
  questionRight: {
    width: "11%",
    // border: "1px solid #cdcdcd",
  },
  ansContainer: {
    display: "flex",
    marginBottom: "10px",
    width: "100%",
    marginTop: "5px",
    // border: "1px solid #00ff00",
  },
  ansText: {
    fontSize: "10pt",
    fontWeight: 400,
    marginBottom: "5pt",
    width: "100%",
    display: "flex",
    flexWrap: "wrap",
  },
  widthFull: {
    width: "100%",
    display: "flex",
    flexWrap: "wrap",
    flexDirection: "column",
  },
  questionPoints: {
    backgroundColor: "#FFF5E6",
    padding: "5px",
    width: "52x",
    marginLeft: "7px",
    fontSize: 10,
    textAlign: "center",
    marginTop: "10px",
  },
  zeroPoints: {
    padding: "0px",
    marginLeft: "15px",
    fontSize: 10,
  },
  topTablePart: {
    display: "flex",
    marginTop: "15px",
  },
  margin: {
    marginTop: "10px",
    marginBottom: "10px",
  },
  logo: {
    marginTop: "10px",
    marginBottom: "10px",
  },
  ansOptions: {
    display: "flex",
    flexDirection: "row",
    paddingLeft: 20,
  },
  textInput: {
    border: "1px solid #000",
    padding: 2,
    fontSize: 11,
    minWidth: "100pt",
  },
  normalTextAns: {
    fontSize: 11,
  },
  table: {
    display: "flex",
    flexDirection: "column",
  },
  tableHead: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 5,
    borderBottom: "2px solid orange",
    textAlign: "left",
  },
  tableBody: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottom: "1px solid #cdcdcd",
    padding: 5,
    textAlign: "left",
  },
  tableBodyText: {
    fontSize: 9,
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    flexBasis: 0,
    paddingLeft: 20,
  },
  tableHeadText: {
    fontSize: 10,
    fontWeight: 400,
    flexGrow: 1,
    flexBasis: 0,
    paddingLeft: 20,
  },
  summaryTable: {
    display: "flex",
    flexDirection: "row",
  },
  summaryTableChild: {
    flex: "0 0 50%",
  },
  summaryHeadtxt: {
    fontSize: 10,
    marginBottom: 10,
  },
  divider: {
    width: "100%",
    height: "1pt",
    backgroundColor: "#ccc",
    marginTop: 10,
    marginBottom: 10,
  },
  areaTitle: {
    display: "flex",
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  areaPoints: {
    fontSize: 12,
    paddingTop: 8,
    fontWeight: 400,
    marginTop: "1px",
    padding: 5,
  },
  questionIcon: {
    flexShrink: 0,
  },
  subAnswerQuestion: {
    marginLeft: "7pt",
    marginBottom: "10pt",
    marginTop: "10pt",
  },
  radioCheckboxStyles: {
    width: "10pt",
    height: "10pt",
    marginRight: "10pt",
    marginBottom: "10px",
  },
  textRight: {
    textAlign: "right",
  },
  sectionBgColor: {
    backgroundColor: "#72d0c6",
    color: "#fff",
    height: 30,
  },
  displayFlex: {
    display: "flex",
    flexDirection: "row",
    alignItems: "baseline",
  },
});
const checkedRadio = (
  <Image
    style={styles.radioCheckboxStyles}
    src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAXCAIAAABrvZPKAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAAAJ/SURBVDhPpZQ9SLJRFMcfFTNDjKIIMbChgkQRxEUCaxcSnR2KlpYQaulrsmZpdBGcXIR2EQkRIwhcTEEXQQTNKI3yg4Ke93/vPb09Rr3D2294OPec8z/3ued+qGRZln7Bj3r4u93u09OTXq+fnp7WarUU+ALyvtBqtcLhsNlspgxJGh8f39raKhQKlKFgRP/29razszM2NjY7O3t0dJROp29ubrLZbDQadTgcKLS6ulqr1Sib86mHOBAIGI3GeDw+HA7JqyCXyzmdTovFoixB+r/iq6sr4fmWTqfjcrmUJUiPOfHb/xYLUMJut/v9fjEkPaoGg0FhC4rF4vb2Nvxer/fi4oK8nGQyqdFo6vU6bKa/vr5Gb/DlUUYqlULPee+Jvb09ivHFzs/PHx4ewmb6/f19m83GQ4zX11eTyUQ6Bfl8njJk+fj4eGlpCYYagfv7e7REJIHLy8tms0kDBYlEgixJQn673YbB9JhQp9NxP+Pl5YWsUZ6fn8mSJDQbKhhMPzU19fDwwP0Mt9v97Wn1eDxkSdLj4yNUzMIasHmYH//Dl8YIhUI87ZOVlZV+v09hWV5fX8d5gcH0g8FgZmbm7OyMhxjv7+8nJyeTk5NQqtVqn8+HS0ExvrXwZzIZ2LT/BwcH2BKsXAwFvV6vVCrd3d3R+IPNzU2r1Sps0jcajbm5ubW1NWiE5ydOT09VKhWOkBiSHpTLZVECd55co2BRuNcQx2Ixcin1QJTALdrd3a1UKuTlZz4SiSwuLqIXSjEY0QO8Oefn58vLy5gHTwjWubCwgN1BL7Ep1WqV8j74/v2CE+29vb3FWiYmJlBoY2PDYDBQWMFv3092/v4fSfoDjPbnZTwBjLMAAAAASUVORK5CYII="
  />
);
const nonCheckedRadio = (
  <Image
    style={styles.radioCheckboxStyles}
    src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAVCAIAAADNQonCAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAAAHySURBVDhPlZS/q4FRGMe5fv9OmRiUTEoZJAslWcjCRsRARlnFoIwyKDIp2ZTFHyAbShkYlZSSRX4lJPd573O4rqv7vvezvM/3ec/zPec95z0P+3a7sX7R7/crlcpkMtlsNiKRSKPRhMNhv9/P4/HIiCc+yPNOq9WyWCxWqxXqHQ5HJBLxer3gEgqFtFptLpc7n89k6ANYxYNSqcRms4PBYK/XI6k7i8Uik8koFAqPx3M6nUj2i28LrC8Wi0S/YzgcKpXKFxdi0e12aesRdEmlUkQ/LHw+n91ux5iWQqEAX7Tf71FSFvP5nMPhNJtNTNGyXq8lEgkcGUrKAvZZrVZfLhdMMSEWi5nNZoypQ53NZkajkcvl4hkxwWQyQRXGlMXhcJBKpagZIpPJdrsdxpQF6O12i5ohMF4ul2NMWej1+tFoBEeNKSbADYAqImA/lssln8+v1+u4PbSsViuBQFCr1VCS/yIQCMDVwJiWfD6vUqmOxyNKYjEYDODXSKfTKP+g0+mIxeJsNkv0wwJoNBq0LlgP9/B6vZLUswWALi6Xq91uPw8CxuNxIpEQCoUv9cAPCwDmcbvdcOV0Ol00Gk0mk/F43GazwcYbDIZyufxSD7zvWtPptFqtwszQtWDl0LWg5TidTvL6J+8t/sVr4/s3LNYn3SDX2HgsnlgAAAAASUVORK5CYII="
  />
);
const CheckedBox = (
  <Image
    style={styles.radioCheckboxStyles}
    src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAQCAIAAAB7ptM1AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAAAEUSURBVDhPlZE9rkRQFMdnHz6eaUYoH4Whk4hSqVCJTmIBNqC1AyvQvT28xuzAR6IiokGikOCdvHPLEeZXnXPy/13Xubf9n3mebdu+3+9fx3AcZ5pm3/eoENPzvNs1DMNAhZiqqsI0iqLfY5IkgQxN06gQ8/l8wjRNU2zfkmUZZCiKwvbc7LpuGAYoPjPbthVFUVGUcRzPzXVdcYFN0wiCgOmyLE/Mbdtc1308Hq/Xi+d5GMJK8jyHzIkJ32EYBmoE6qIoMHN+26qq4NGhZVkWLokB4NKG6rrWdR2OwBa5ZL7lvalpGkzDMPw5Jo5jyMCfo0LMIAhgegXLslAh5rIsvu/Lsvx9jCRJjuNM04QKMT9m3/8Aqacl9F7E8bIAAAAASUVORK5CYII="
  />
);
const nonCheckedBox = (
  // eslint-disable-next-line jsx-a11y/alt-text
  <Image
    style={styles.radioCheckboxStyles}
    src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAATCAIAAAD9MqGbAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAAADESURBVDhP7ZPBDYQgEEVlF6ugARMrACswsQBvVOLJiy3QgxVYAt5swISrsQV1zJ8buzHhspd9h4FP5g8J+YjzPLMkXrwmQHcS+75XVZXn+fs7UsqyLNd1hYWdbdvypCeMMbBI6BACVedcXdc4iVmWpWkadN5ggNaa9uM4Qn5knmfqUUpBpr/Q3/nEL5ycIYol1Wmatm3DSQzSQ+mF5Ax1Xcf6CWstLPw/qQ7D4L0/jgMdMUKIoij6vqcvdUs4E0h9oSy7AIQtg2/svyIKAAAAAElFTkSuQmCC"
  />
);
const companyLogo = (
  <Image
    style={{ width: "113pt", height: "56pt" }}
    src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJUAAABKCAYAAACyyha1AAAABmJLR0QA/wD/AP+gvaeTAAAMwElEQVR42u1dCZAcVRleBIKA4pEUoICcQkEVh1wSQGrY7e7dnZ2d6d2wOSocSnCFlBwKEiEmtcFYxIiFJCa47k53dg1qoqkkpEQjURErpBKMBg8kh0YCIVCEZGOSnSub8funX2d7Z/v1dPfM7M7xXtWr2e2Zftf/vf967/2vpqaMUrqj40PJaP2VSU2+J6FL8xOavDqhKa8kuqRLh/2285oT2W+2JDRpDd5ZmIzKX0xodZdROTUiVW9K99SNTWpKO8Dxi7gmv4/PtE3el+pWbhn2brrmuERU6bD5/YFEVFqZjEp3prvrPylGuRqA1BE4AVymFVxoFQCQ4AApO8fx+0l25SV15W58n+S8lwLwfh3XlJDgYJUIpgWNJ0FE3ZvQ5f+4BFJ2PkLi0a5sDsfKysqOuC4/mNYDHxbUKHvOBF1Jl74MML3jE0zpDEeLKlNtORXEnAeOR/nNjGgUnKs8U1Kvuw5E3JQHmCj3xTSl1pZDadJMfH/UZ7l/TWr1VwsqlQt3IutMk7+LPOCD2LsSUfln+Jyd0JXJsV7pM7Z19CqnQqTdBg74OH7fS+LNR11JEp3UXkG1Ek4xveE8EGuDB8IOwCXwB+SvxLvrL8qn7n5NOcdwLcgvZJR09214ld4V1CtJQEkBcgG4ISRzIcwuFjEPddWdEdekR1DH2+6ApexJacqNgoollOAbmmiY/s7EA0d6Lx6VHiLxNWJWJzlUoaC7c13IUwQ1S0Eh16T7XOhPKRD3GZj0Hx8dPa/5FCj230Y7YjldF7p8h6DqaHIoTb49J6Ci8tZSsbTiPXUXA1ybcwJLU+4S1B0NAsFT7eDNNnWVnvSiwEdKyjolkagrT+cCFnSyekHlkeRQunQ5Bv6wA1GOwtyfUdJiO6pMy2El9tktaItUjJm+tPE0Emk5/D9Ty4LbRpVG58mh7Eh3Sh8TVC86l1J+6eR3KhdADYpxqd5xqQfOVUH14irmU5xdBtJ9ZeoSmUB6FB9Y0gRB/WKIveeaPgG3wLtcQEWVBeXNgbHk4+CsFfuziqN//NiBS60v9zW0zMa/zI5TruP2BwIFBQVUwyV88SD9j7fwW3bAAjeiJRveFhzsyfqsQEPBdCnlOa5o0KX7K6qvxpITjyMvE2goCKDqLnPwmm+qxA1v6NeveE7RWJdyvkBF3qJPWsSbubElcl1luk0yzl3biUTeeIGKfHSM5eNPxkDu57gPfl/ZHFr6OWcyHSi1paeySrRizzezK3ttLNktfc5BtxJbZPLQLV6wHVSciqmGwwPo50YOqFYIdPgXff0cN8LMquDUxqKzHaj6hQj0o6DrcpAr+rAvqSomVsZvZb+TgcZHoMSzPsXdc7StqiaXJv+Js4NhrkCJd071R85yxTNVpVdy1gQr3fotPNs31sH226/Yl9fWlvw5lSRxOPZBGqeqBIiqqhc2N0fmNjeHf4q8OBSKTGpraxvj9A47v2dvTrPdkMFgy8Uodx7y7EAgcIL1/WY8NL5TVb/tRhnXob1Po4xV+FwWDocfQz7DWxmRmUY7Wm62Pkc5t6LMTnzenTVW57E+PYk+ZeIu0O4M3kloOgrGqzsSiXyeykIdX7U+D4VaxrM6kJvzWjOldlI/QiE1kC9O0E55sF3GGIRC4XsJPzVDO6AG8GUCOZ2VtwNY3B2NsWj9rbxjTOnlbcezRjSY5YXDkflZ9S40vgsv9to5tOt4es+mzZQPot5W9wMVWWq8p64Y2r7Ialbeng6La4SAy36/Kcu18pbdeKSideN5dRNBsstC+Vfg2T56ju+/lQ8IGDjN8X85f1CpHZwxjyPfYx289azSHnQoTB3B/7sI3c56hDKZ55+yDFCDpeKjqKulEKAyZp9Zrroc5X4J7f46TQT2PEFcwN3AR5rZO4dMzoN2fxT/xwYJEr7JUvcrxjP14SxQbfDqBM0GFeq5iEDMyv9+viAwJI+V+M1XFwZU4S34ux1/P4C8lpUfC4VCZ5mDtNuYFZE7LZzgZDTgFGclXbqfM4gbOKCivL+pacIF+YCqtbX1UyZnRcdmWb9TFOVUPP8768+LLrneGPz+A/ZOkBF76tB2hzNreS0tLafj/wGaIMFg67lDQIVAavarCsoDbkBFBMHfO1mdeW9mtIxTfJAbR7oKASri4uYzUmvw7D02+VpNUK20DOBrpGOQLpTT4uHHfHreBlR7zBmO/GpjY+NJfkGFMu8yxVy2nsa+n8y+T9HkcMn5dMatn80ak172/C08Pg7En8YGdf2wScbfoPioC1Btw+c/WZ0rqa78uVRkjkUCEQc8ityPiTG2kKBiXP0Ae36bFdFrszjKABHdqXMYrDkc38wqG1DtamxsPRuf77P/F/kHlfooG6ytfOXd6McxdpyTAGoje2c3AH8aDT5yEmWNw+d/mei4wdSz0K8HbXxVP+IcipiVG1RD8gf5KueM++4x281Ato7pad8ogE613TAwIvNJFLJnB4YBltBMFVp+RA2K8DmVPIszM1fbgcpCvAH2bIcfUKGMO0y9iWaJAyeL5bJgzdTe3n4ifr+Xtecp9rmG6SXm/2QYHDYm3HCwckHl4ADNAhW4orqZ1fUSGSP+FfRj4vsIqQGULfrmTr9lOyjqu5qaIoObB5qaWi4lKyHLIvqNnc7ixuFHm9d4oGIzZm6WvuIJVEyv6TdmnRq1DhC5E1Dev00F3qO46DLFJuNGt2dxvpSTFQVQdXFO2XzTBajeoH4wF8xB9mxOHqJvI4f4OZmFS1C9jjwDeTrGWTENHFNUjGNEGCCTGp9fI6uGFGpGmIlcRR2RWXixnJxAReY5yv2tX1CxQXvcYv1tZkBdYBGvfeAmnvaKw1qULAMfIzFo4Y7bLN9N56gDz9t71ZV2F6DaaMNpB6hN3rmUer05BmQBNzWp15jZ4oZZVyidaliigaPZTmxyOJrVFR0OW1fAqdo4oNrtBCoLt9ntF1SG0hx+wuQeWflNU4/w7vsyrJhsLmfhrgOkg9qDihPUw+E8oB2omMj9CXv+bjAYPNMb4Q1Lj+nEQxJZrCatAbjLiwIqC8c6n2Yg+UZI5JHnNNc7CP56Ay8kkHkUi5U7w252o45rje9UxS+bJ/cEyniEgEltR1lTyLLMUxeZl+3jYisO5P1/iDsenPOOKb3+C7x3gkH1KhoDqzvHnOzMIJmBcbrFq3Vs+JDslX1aITDG3fvEI25HZQ/RnwqZ+rsaz+aef9Plq6ppmeuQHjiTNxbpzsC4GpHcJbagvI9zEnlaNY0FC5lkG9JRIMVjgl61lrM3vbOqxoHjs0PQ2nUCJZ4HMxPO0I7tv11NWz64SrouPyFQ4pXtG7Gb7PUqnDSphjFguuVRr0q6SDy9Cve4UJwEzvLEd6piYuE+G178CBHU378+sYynpGJf1ZiKnlSGsfK6OKJVcGWds6/KANakSu47u2yA03cpItDhd7YaZ//2cgZ3SyUfKKW7AnkXDAjRl78InOcQtnBiJfaZbkN1CH72lEBFvmKgu/ZcbsAzRCmuNN2KuG/m/mbOHn2yCAUqCiIK6PozbrCKOZXUVxyinc4P8CY/K9BQWG4V48ZN76q7oiL6iTCTXDcKwjNWShjKEtKtlO85WENvUND+shZ7UL55p7KryTc3soOOG7Ac789D0P5yXr7BwvFift8QOqnT+QSSSH4H3li6cbi3uDyDVjgcSTN0qW6pSVC/qDOas197EFiPlZVijmvYnK6Xw/6xHwqqF1sMItgXBvtvlQAsFtTsiENf/kxXuQmqj4SVhLDP7B5kh3uSpc50x/ADoSUxMWhdD4p3jjv/9qIPFwhqjySwjLWxRI47k393OCp/uqQA1VM3lneM3ZIP0T59QeVRUdzlcC5gZdYOdUUtiYmgKbUuboBPitCLo5wIMLmvvTVON8eX1F44Gm3s76k9CwH3lzpbrpkcw+9aBVVLgWPB5HbwRA9ZO6NYov2acs5ItOtgr3I6uTlInLloWx+JdEHNkuJYmas3drogXppxtiUpTbmxGA5Tul2eXX/S77I9O5PR+isFFUswEWeA3+dFl4Q8RlCI0CdJ36H9W76Ub+yUSEWlm9nJl395q19ZRSEYBfVK2Y8FzsM81P0ewZVmSv96KMrdFPuJjt9TINdkd/31dNgCx6KuzQR2hd4DI+FhisaC/JLPug5TzIiqDQZbnpZhwyU+uNYIZWkNBcsVVCprJZ57gGBkc1R5jdwggiqVIBLhWWc3xW8aJUD9BR70FiHqKjSllsg3sZ2kfUUG0n7SuYRnvJq4FxZq47rSDOJryNsLI97krVgaWkjl+rUkRaqgRLcnMO/8bAIa3f1ClyuxhWuKQBPPWIe6/A4+/wEr8GW4A3rISiS9TRxIKH76P1RWnXhhD2UPAAAAAElFTkSuQmCC"
  />
);

let questionNumber = 0;
let currentQuestion = 0;
const getQuestionIncrement = (isNewSection: boolean) => {
  if (isNewSection) {
    return (questionNumber = 0);
  } else {
    return (questionNumber = questionNumber + 1);
  }
};

export const generatePdfDocument = async (
  documentData: any,
  questionaryName: string,
  AnswerObject: any,
  questionaryId: string,
  globalMaster: any,
  fromCarryForwardSuggestion?: boolean
) => {
  questionNumber = 0;
  let name = documentData.FormInvitation.Form.name;
  if (name === "Health, Safety and Governance Questionnaire") {
    score = false;
    //dynamic score check commented
    // score = documentData.FormInvitation.Form.calc;
  }

  //const slicedArray = documentData.FormInvitation.Form.Sections.slice(2, 3);
  let SectionDetailsTable: any;
  let ListPdf: string[] = [];
  let isScoreNAEnable = false;
  if (typeof globalMaster != "undefined" && globalMaster != null) {
    const globaldata = globalMaster.filter(
      (x: any) => x.type === "PdfScorePermission"
    );
    if (globaldata?.length > 0) {
      ListPdf = globaldata[0]?.data.formId;
      isScoreNAEnable = globaldata[0]?.data.IsEnable;
    }
  }
  const sectionLogo = <View style={styles.logo}>{companyLogo}</View>;

  const sectionMainTitle = (
    <View style={styles.margin}>
      <Text style={styles.mainTitle}>
        {questionaryName} -{" "}
        {new Date().toLocaleString("en-US", { day: "2-digit" })}{" "}
        {new Date().toLocaleString("en-US", { month: "long" })}{" "}
        {new Date().getFullYear()}
      </Text>
    </View>
  );

  const sectionSubTitle = (
    <View style={styles.displayFlex}>
      <Text style={styles.summaryHeadtxt}>Here is summary of </Text>
      <Text
        style={[
          {
            fontSize: 10,
            color: "#FFA93C",
            textTransform: "capitalize",
            marginBottom: 0,
          },
        ]}
      >
        {documentData?.FormInvitation?.ParentCompanyMapping?.User
          ? documentData?.FormInvitation?.ParentCompanyMapping?.User?.name
          : documentData?.FormInvitation?.Company?.name}{" "}
      </Text>
      <Text style={styles.summaryHeadtxt}>ESG performance</Text>
    </View>
  );

  const sectionSummaryTable = (
    <View style={styles.summaryTable}>
      <View style={styles.summaryTableChild}>
        <View style={styles.table}>
          <View style={styles.tableHead}>
            <Text style={[styles.tableHeadText, { paddingLeft: 0 }]}>
              Sustainibility Area{" "}
            </Text>
            <Text style={styles.tableHeadText}>Scores</Text>
          </View>
          {documentData.FormInvitation.Form.Sections.map(
            (section: Section, index: number) => {
              //getDetailsSection
              SectionDetailsTable = concat(
                SectionDetailsTable,
                <View key={section.id}>
                  {index == 0 ? (
                    <View style={styles.tableHead}>
                      <Text style={[styles.tableHeadText, { paddingLeft: 0 }]}>
                        Sections and Questions
                      </Text>
                      {score ? (
                        <Text style={[styles.tableHeadText, styles.textRight]}>
                          Scores
                        </Text>
                      ) : (
                        ""
                      )}
                    </View>
                  ) : (
                    ""
                  )}
                  {section.Questions.length === 0 ||
                  section.weightage === 0 ||
                  section.ParentSection == null ? (
                    <View
                      style={[
                        styles.areaTitle,
                        styles.sectionBgColor,
                        { marginTop: 25 },
                      ]}
                    >
                      <Text style={styles.subTitle}>{section.content}</Text>
                      {score ? (
                        <Text
                          style={[styles.areaPoints, { padding: "0 12px" }]}
                        >
                          {section.weightage === 0
                            ? "NA"
                            : ListPdf.includes(questionaryId) && isScoreNAEnable
                            ? "NA"
                            : section.FormResults.filter(
                                (x: any) =>
                                  x.questionId == null &&
                                  x.sectionId == section.id
                              ).length > 0
                            ? section.FormResults.filter(
                                (x: any) =>
                                  x.questionId == null &&
                                  x.sectionId == section.id
                              )[0].score
                            : "NA"}
                          {ListPdf.includes(questionaryId) && isScoreNAEnable
                            ? ""
                            : section.weightage === 0
                            ? " "
                            : `/ ${section.weightage}`}
                        </Text>
                      ) : (
                        ""
                      )}
                    </View>
                  ) : null}
                  {section.Questions.length === 0
                    ? getQuestionIncrement(true)
                    : section.Questions.map(
                        (question: Question, index: number) => {
                          return question.Answers.length > 0
                            ? getQuestionAnswersView(
                                question,
                                getQuestionIncrement(false),
                                AnswerObject
                              )
                            : null;
                        }
                      )}
                </View>
              );

              //getSuummaySection
              return section.ParentSection == null ? (
                <View style={styles.tableBody}>
                  <Text style={[styles.tableBodyText, { paddingLeft: 0 }]}>
                    {section.content}
                  </Text>
                  {score ? (
                    <Text style={styles.tableBodyText}>
                      {section.weightage === 0
                        ? "NA"
                        : ListPdf.includes(questionaryId) && isScoreNAEnable
                        ? "NA"
                        : section.FormResults.filter(
                            (x: any) =>
                              x.questionId == null && x.sectionId == section.id
                          ).length > 0
                        ? section.FormResults.filter(
                            (x: any) =>
                              x.questionId == null && x.sectionId == section.id
                          )[0].score === 0
                          ? "0"
                          : section.FormResults.filter(
                              (x: any) =>
                                x.questionId == null &&
                                x.sectionId == section.id
                            )[0].score
                        : "NA"}{" "}
                      {ListPdf.includes(questionaryId) && isScoreNAEnable
                        ? ""
                        : section.weightage === 0
                        ? " "
                        : `/ ${section.weightage}`}
                    </Text>
                  ) : (
                    ""
                  )}
                </View>
              ) : null;
            }
          )}
        </View>
      </View>
      <View style={styles.summaryTableChild}>
        <Image src={`${getBaseUrl()}/images/assessment_illustration.png`} />
      </View>
    </View>
  );

  const sectionSummaryTablewithputscore = (
    <View style={styles.summaryTable}>
      <View style={styles.summaryTableChild}></View>
      <View style={styles.summaryTableChild}>
        <Image src={`${getBaseUrl()}/images/assessment_illustration.png`} />
      </View>
      <View style={styles.summaryTableChild}></View>
    </View>
  );

  const blob = await pdf(
    <Document>
      <Page size="A4" style={styles.page}>
        {sectionLogo}
        {sectionMainTitle}
        {sectionSubTitle}
        {score ? sectionSummaryTable : sectionSummaryTablewithputscore}
        <View style={styles.divider}></View>
        {SectionDetailsTable} {/* Available in sectionSummaryTable Variable */}
      </Page>
    </Document>
  ).toBlob();

  // Only save/download locally if not from carry-forward suggestions
  if (!fromCarryForwardSuggestion) {
    saveAs(blob, documentData?.FormInvitation?.Form?.name);
  }

  return blob; // Return blob for client-side usage
};

export const useDownloadAssessmentPDF = () => {
  const refetch = useGetSubmittedFormToDownloadAsPdfLazyQuery()[0];
  const refetchformfielddata =
    useGetFormfieldAndAnswersByinvitationIdLazyQuery()[0];
  const [loading, setLoading] = useState(false);

  const generateAndDownloadPdf = async (
    invitationId: string,
    submissionId: string,
    questionaryName: string,
    QuestionFormId: string,
    globalMasterData: any
  ) => {
    try {
      if (loading) return;
      setLoading(true);
      const formFielddata: any = await refetchformfielddata({
        variables: {
          invitationId: invitationId,
        },
      });
      let AnswerObject: any = convertDBAnswersToStoreAnswers(
        formFielddata?.data?.FormSubmission[0]?.FormInvitation?.Form
          ?.FormFields,
        formFielddata?.data?.FormSubmission[0]?.Answers ?? []
      );
      const { data, error } = await refetch({
        variables: { invitationId, submissionId },
      });
      if (!!error) {
        console.error({ error });
      } else if (!!data?.FormSubmission.length) {
        await generatePdfDocument(
          data?.FormSubmission[0],
          questionaryName,
          AnswerObject,
          QuestionFormId,
          globalMasterData,
          false
        );
      }
    } catch (error) {
      console.log(error);
    }

    setLoading(false);
  };

  return { generateAndDownloadPdf, loading };
};
const getQuestionAnswersView = (
  question: Question,
  questionSeq: number,
  AnswerObject: any
) => {
  let childrenDetails: any = <></>;

  const QuestionsRender = (
    FormFieldDetails: any,
    question: any,
    FieldType: string
  ) => {
    switch (FieldType) {
      case "MainQuestion": {
        return (
          <View style={styles.questions}>
            <View style={styles.questionLeft}>
              <Text style={styles.questionsText}>
                {FormFieldDetails.interfaceOptions?.title ?? ""}{" "}
                {FormFieldDetails.fieldOptions?.label ?? ""}
              </Text>
            </View>
            <View style={styles.questionRight}>
              {score ? (
                <Text
                  style={
                    question?.FormResults[0]?.score === 0
                      ? styles.questionPoints
                      : styles.questionPoints
                  }
                >
                  {question?.FormResults[0]?.score
                    ? question?.FormResults[0]?.score
                    : question?.weightage === 0 || question?.calc === null
                    ? "NA"
                    : "0"}
                </Text>
              ) : (
                ""
              )}
            </View>
          </View>
        );
      }
      case "SubQuestion": {
        return (
          <View style={styles.ansOptions}>
            <Text style={[styles.ansText, { fontSize: 12 }]}>
              {FormFieldDetails.fieldOptions?.label ?? ""}
            </Text>
          </View>
        );
      }
      default:
        break;
    }
  };

  const answersRender = (
    questionTitle?: String,
    answers?: any,
    isCheckBoxOrRadio?: String,
    selectedValue?: boolean,
    isFile?: boolean
  ) => {
    if ((isCheckBoxOrRadio ?? "") !== "") {
      if (isCheckBoxOrRadio === "checkBox") {
        return (
          <>
            {(questionTitle ?? "") !== "" ? questionTitle : ""}
            <View style={styles.ansOptions}>
              {selectedValue === true ? CheckedBox : nonCheckedBox}
              <Text style={styles.ansText}>{answers}</Text>
            </View>
          </>
        );
      }

      if (isCheckBoxOrRadio === "radio") {
        return (
          <>
            {(questionTitle ?? "") !== "" ? questionTitle : ""}
            {answers !== undefined ? (
              <View style={styles.ansOptions}>
                {selectedValue === true ? checkedRadio : nonCheckedRadio}
                <Text style={styles.ansText}>{answers}</Text>
              </View>
            ) : (
              ""
            )}
          </>
        );
      }
    }

    if (isFile ?? false) {
      return (
        <Link
          style={[styles.widthFull, { paddingLeft: 20 }]}
          src={answers.path}
        >
          <Text style={styles.ansText}>{answers.name}</Text>
        </Link>
      );
    }

    return (
      <>
        {(questionTitle ?? "") !== "" ? (
          <View style={styles.ansOptions}>
            <Text style={styles.ansText}>{questionTitle}</Text>
          </View>
        ) : (
          ""
        )}
        <View style={styles.ansOptions}>
          <Text style={styles.ansText}>{answers}</Text>
        </View>
      </>
    );
  };
  const manageSelectMultipleDropdown = (
    questionTitle?: String,
    answers?: any,
    isCheckBoxOrRadio?: String,
    selectedValue?: boolean,
    isFile?: boolean
  ) => {
    if (isFile ?? false) {
      return (
        <Link style={styles.flex90} src={answers.path}>
          <Text style={styles.ansText}>{answers.name}</Text>
        </Link>
      );
    }

    return (
      <>
        {(questionTitle ?? "") !== "" ? questionTitle : ""}
        <View style={styles.flex10}>
          <Text style={styles.tagText}>{answers}</Text>
        </View>
      </>
    );
  };
  const mergeRender = (viewDetail: any) => {
    return (
      <>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            width: "100%",
          }}
        >
          {viewDetail}
        </View>
      </>
    );
  };
  const answerRenderMultipleDropdown = (answer: any, question: Question) => {
    let returnDetail: any = <></>;
    let fileLable: any = "";
    answer?.data?.value.map((files: any) => {
      const getType = typeof files;

      if (getType === "string") {
        const stringTag = manageSelectMultipleDropdown("", files);
        returnDetail = concat(returnDetail, stringTag);
      }
      const tag = manageSelectMultipleDropdown("", files.value);
      returnDetail = concat(returnDetail, tag);
      question?.FormFields?.map((formField: any) => {
        if ((files[formField?.field] ?? "") === "") return;
        switch (formField.interface) {
          case "select-radio": {
            returnDetail = concat(
              returnDetail,
              <>
                {formField.fieldOptions?.label}
                {formField.interfaceOptions.choices.map(
                  (data: any, index: any) => {
                    return answersRender(
                      "",
                      data.label,
                      "radio",
                      data.value?.toLowerCase() ==
                        String(
                          files[formField?.field]?.value ?? ""
                        ).toLocaleLowerCase()
                        ? true
                        : false
                    );
                  }
                )}
              </>
            );
          }
          case "select-dropdown": {
            returnDetail = concat(
              returnDetail,
              answersRender(
                formField.fieldOptions?.label,
                files[formField?.field]?.value
              )
            );
          }
          case "select-toggle": {
            returnDetail = concat(
              returnDetail,
              <>
                {formField.fieldOptions?.label}
                {answersRender(
                  "",
                  formField.interfaceOptions.onLabel,
                  "radio",
                  files[formField?.field]?.value === true
                )}
                {answersRender(
                  "",
                  formField.interfaceOptions.offLabel,
                  "radio",
                  files[formField?.field]?.value === false
                )}
              </>
            );
          }
          case "file": {
            const attachments = files[formField?.field]?.value ?? [];
            const hasAttachments =
              Array.isArray(attachments) && attachments.length > 0;
            fileLable = formField.fieldOptions?.label;
            returnDetail = concat(
              returnDetail,
              <>
                {formField.fieldOptions?.label !== "" &&
                formField.fieldOptions?.label !== fileLable ? (
                  <View style={styles.ansOptions}>
                    <Text style={styles.ansText}>
                      {formField.fieldOptions?.label}
                    </Text>
                  </View>
                ) : (
                  ""
                )}
                {hasAttachments &&
                  answer?.data?.value.map((files1: any) => {
                    if (files.value === files1.value) {
                      if (files1[formField?.field].value ?? "") {
                        return files1[formField?.field].value.map(
                          (file: any) => {
                            // console.log({ file });
                            return answersRender("", file, "", false, true);
                          }
                        );
                      }
                    }
                  })}
              </>
            );
          }
          case "datetime": {
            return answersRender(
              formField.fieldOptions?.label,
              files[formField?.field]?.value
            );
          }
          case "select-multiple-checkbox": {
            returnDetail = concat(
              returnDetail,
              <>
                {formField.fieldOptions?.label}
                {formField.interfaceOptions.choices.map(
                  (data: any, index: any) => {
                    return answersRender(
                      "",
                      data.label,
                      "checkBox",
                      Array.isArray(files[formField?.field]?.value) &&
                        files[formField?.field]?.value?.filter(
                          (x: string) => x == data.value
                        )?.length > 0
                        ? true
                        : false
                    );
                  }
                )}
              </>
            );
          }
          case "input-multiline": {
            return answersRender(
              formField.fieldOptions?.label,
              files[formField?.field]?.value
            );
          }
          case "input": {
            returnDetail = concat(
              returnDetail,
              answersRender(
                formField.fieldOptions?.label,
                files[formField?.field]?.value
              )
            );
            return;
          }
          case "number-input": {
            returnDetail = concat(
              returnDetail,
              answersRender(
                formField.fieldOptions?.label,
                files[formField?.field]?.value
              )
            );
            return;
          }
          default: {
            answersRender(
              formField.fieldOptions?.label,
              files[formField?.field]?.value?.content,
              "checkBox",
              files[formField?.field]?.value?.selected ? true : false
            );
          }
        }
      });
    });
    returnDetail = mergeRender(returnDetail);
    return returnDetail;
  };
  const getRenderElement = (
    FormFieldDetails: FormField,
    questionSeq: number
  ) => {
    let checkIsMainQuestion = false;
    showlable = false;
    if (questionSeq !== currentQuestion) {
      currentQuestion = questionSeq;
      checkIsMainQuestion = true;
    }
    if (FormFieldDetails) {
      if (FormFieldDetails.autoCalculatedCalculation) {
        if (FormFieldDetails.autoCalculatedCalculation?.pdfRule) {
          const pdfData =
            jsonata(
              FormFieldDetails.autoCalculatedCalculation?.pdfRule
            ).evaluate(question.Answers) ?? false;

          showlable = pdfData;
        }
      }
    } else {
      return "";
    }
    let answerLength = question.Answers.filter(
      (x: any) => x.formFieldId == FormFieldDetails.id
    ).length;
    if (answerLength === 0 && FormFieldDetails.interface !== "group-detail")
      return "";

    let isdisplay: boolean = true;
    if (!!FormFieldDetails.displayRules) {
      isdisplay =
        jsonata(FormFieldDetails.displayRules[0].rule).evaluate(AnswerObject) ??
        false;
    }
    return isdisplay ? (
      <View style={styles.questionContainer}>
        {FormFieldDetails.interface === "group-detail" && checkIsMainQuestion
          ? QuestionsRender(FormFieldDetails, question, "MainQuestion")
          : FormFieldDetails.interface === "group-detail"
          ? showlable === true && FormFieldDetails.fieldOptions.enable === false // pdf subquestion lable changes
            ? QuestionsRender([], [], "SubQuestion")
            : QuestionsRender(FormFieldDetails, [], "SubQuestion") //changes
          : ""}

        {answerLength > 0 && checkIsMainQuestion
          ? QuestionsRender(FormFieldDetails, question, "MainQuestion")
          : ""}
        {question.Answers.filter(
          (x: any) => x.formFieldId == FormFieldDetails.id
        ).length > 0 ? (
          <View style={styles.ansContainer}>
            {question.Answers.filter(
              (x: any) => x.formFieldId == FormFieldDetails.id
            ).map((answer: any) => {
              let questionSubTitle: any = "";
              if (
                !checkIsMainQuestion &&
                FormFieldDetails.fieldOptions?.label !== ""
              ) {
                questionSubTitle = QuestionsRender(
                  FormFieldDetails,
                  [],
                  "SubQuestion"
                );
              }
              switch (FormFieldDetails.interface) {
                case "select-radio": {
                  return (
                    <>
                      {questionSubTitle}
                      {FormFieldDetails.interfaceOptions.choices.map(
                        (data: any, index: any) => {
                          return answersRender(
                            "",
                            data.label,
                            "radio",
                            data.value?.toLowerCase() ==
                              String(
                                answer?.data?.value ?? ""
                              ).toLocaleLowerCase()
                              ? true
                              : false
                          );
                        }
                      )}
                    </>
                  );
                }
                case "select-dropdown": {
                  return answersRender(questionSubTitle, answer?.data?.value);
                }
                case "select-toggle": {
                  return (
                    <>
                      {questionSubTitle}
                      {answersRender(
                        "",
                        FormFieldDetails.interfaceOptions.onLabel,
                        "radio",
                        answer?.data?.value === true
                      )}
                      {answersRender(
                        "",
                        FormFieldDetails.interfaceOptions.offLabel,
                        "radio",
                        answer?.data?.value === false
                      )}
                    </>
                  );
                }
                case "file": {
                  const attachments = answer?.data?.value ?? [];
                  const hasAttachments =
                    Array.isArray(attachments) && attachments.length > 0;
                  return (
                    <>
                      {questionSubTitle !== "" ? (
                        <View style={styles.ansOptions}>
                          <Text style={styles.ansText}>{questionSubTitle}</Text>
                        </View>
                      ) : (
                        ""
                      )}
                      {hasAttachments &&
                        answer?.data?.value.map((files: any) => {
                          return files.value.map((file: any) => {
                            // console.log({ file });
                            return answersRender("", file, "", false, true);
                          });
                        })}
                    </>
                  );
                }
                case "datetime": {
                  return answersRender(questionSubTitle, answer?.data?.value);
                }
                case "select-multiple-checkbox": {
                  return (
                    <>
                      {questionSubTitle}
                      {FormFieldDetails.interfaceOptions.choices.map(
                        (data: any, index: any) => {
                          return answersRender(
                            "",
                            data.label,
                            "checkBox",
                            Array.isArray(answer?.data?.value) &&
                              answer?.data?.value?.filter(
                                (x: string) => x == data.value
                              )?.length > 0
                              ? true
                              : false
                          );
                        }
                      )}
                    </>
                  );
                }
                case "select-multiple-dropdown": {
                  return (
                    <>
                      {questionSubTitle}
                      {answer.data.length > 1
                        ? answer.data.map((data: any) => {
                            return answersRender("", data.value);
                          })
                        : ""}

                      {answerRenderMultipleDropdown(answer, question)}

                      {/* {answer?.data?.value.map((files: any) => {
                          return question?.FormFields?.map((formField: any) => {
                            if (Object.keys(files).includes(formField?.field)) {
                              return files[formField?.field]?.value?.map(
                                (file: any) => {
                                  // return answersRender("", file, "", false, true);
                                  return (
                                    <View style={styles.summaryTable}>
                                      <View style={styles.flex10}>
                                        <Text style={styles.ansText}>
                                          {files.value}
                                        </Text>
                                      </View>
                                      <Link style={styles.flex90} src={file.path}>
                                        <Text style={styles.ansText}>
                                          {file.name}
                                        </Text>
                                      </Link>
                                    </View>
                                  );
                                }
                              );
                            }
                          });
                        })} */}
                    </>
                  );
                }
                case "input-multiline": {
                  return answersRender(questionSubTitle, answer?.data?.value);
                }
                case "input": {
                  return answersRender(questionSubTitle, answer?.data?.value);
                }
                case "number-input": {
                  return answersRender(questionSubTitle, answer?.data?.value);
                }
                default: {
                  return answersRender(
                    questionSubTitle,
                    answer.content,
                    "checkBox",
                    answer.selected ? true : false
                  );
                }
              }
            })}
          </View>
        ) : (
          ""
        )}
      </View>
    ) : (
      ""
    );
  };

  const getChildren = (
    formFields: FormFieldWithChildrenType[],
    parentField: FormFieldWithChildrenType
  ): void => {
    let children = formFields.filter(
      (ff) => ff.groupField.trim() === parentField?.field?.trim()
    );
    //console.log({ parentField: parentField.field.trim() });
    const data = getRenderElement(parentField, questionSeq);
    childrenDetails = concat(childrenDetails, data);
    if (children.length > 0) {
      sortBy(children ?? [], ["seqIndex"], ["field"]).map((child) =>
        getChildren(formFields, child)
      );
    }
  };

  const getFirstFormField = question.FormFields.filter((m: any) =>
    m.groupField.includes("tabs")
  )[0];

  getChildren(
    question.FormFields as FormField[],
    getFirstFormField as FormField
  );

  return childrenDetails;
};
