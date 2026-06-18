/* eslint-disable jsx-a11y/alt-text */
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
import MainLayout from "@/modules/warp/packages/client/layouts/MainLayout";
import { getNextauthUrl } from "@/modules/warp/packages/configs/nextauth.config";
import { useGetSubmittedFormToDownloadAsPdfLazyQuery } from "@/modules/warp/packages/graphql/queries/generated/get-submitted-form-to-download-as-pdf";
import { saveAs } from "file-saver";

const URL = getNextauthUrl();

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
    fontSize: 17,
    fontWeight: "bold",
  },
  flex: {
    display: "flex",
  },
  subTitle: {
    fontSize: 16,
    fontWeight: 700,
    marginTop: "15px",
  },
  questions: {
    display: "flex",
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "flex-start",
    textAlign: "left",
  },
  questionsText: {
    fontSize: "12pt",
    fontWeight: 700,
    paddingRight: 85,
    marginBottom: 10,
    lineHeight: "1.5pt",
  },
  questionContainer: {
    marginBottom: "5px",
  },
  questionLeft: {
    flexGrow: 1,
  },
  ansContainer: {
    display: "flex",
    marginBottom: "15px",
    width: "100%",
  },
  ansText: {
    fontSize: "10pt",
    fontWeight: 400,
    marginBottom: "5pt",
  },
  questionPoints: {
    backgroundColor: "#FFF5E6",
    padding: "10px",
    width: "32x",
    marginLeft: "15px",
    fontSize: 10,
  },
  zeroPoints: {
    padding: "0px",
    marginLeft: "15px",
    fontSize: 10,
  },
  questionRight: {
    flexShrink: 0,
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
    fontSize: 10,
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    flexBasis: 0,
    paddingLeft: 20,
  },
  tableHeadText: {
    fontSize: 12,
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
    fontWeight: "bold",
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
  <Image
    style={styles.radioCheckboxStyles}
    src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAATCAIAAAD9MqGbAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAAADESURBVDhP7ZPBDYQgEEVlF6ugARMrACswsQBvVOLJiy3QgxVYAt5swISrsQV1zJ8buzHhspd9h4FP5g8J+YjzPLMkXrwmQHcS+75XVZXn+fs7UsqyLNd1hYWdbdvypCeMMbBI6BACVedcXdc4iVmWpWkadN5ggNaa9uM4Qn5knmfqUUpBpr/Q3/nEL5ycIYol1Wmatm3DSQzSQ+mF5Ax1Xcf6CWstLPw/qQ7D4L0/jgMdMUKIoij6vqcvdUs4E0h9oSy7AIQtg2/svyIKAAAAAElFTkSuQmCC"
  />
);

const getQuestionAnswersView = (question: any, index: number) => {
  return (
    <View style={styles.questionContainer}>
      <View style={styles.questions}>
        <View style={styles.questionLeft}>
          <Text style={styles.questionsText}>
            Q{index + 1} {question.content}
          </Text>
        </View>
        {/* <View style={styles.questionIcon}>
          <Image
            style={{ width: "15pt", height: "15pt" }}
            src="data:image/png;base64,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"
          />
        </View> */}
        <View style={styles.questionRight}>
          <Text
            style={
              question.FormResults[0].score === 0
                ? styles.zeroPoints
                : styles.questionPoints
            }
          >
            {question.FormResults[0].score}
          </Text>
        </View>
      </View>
      <View style={styles.ansContainer}>
        {question.Answers.map((answer: any) => {
          switch (
            question.FormFields[0] ? question.FormFields[0].interface : null
          ) {
            case "select-radio": {
              return question.FormFields[0].interfaceOptions.choices.map(
                (data: any) => {
                  return (
                    <View style={styles.ansOptions}>
                      {answer.selected ? checkedRadio : nonCheckedRadio}
                      <Text style={styles.ansText}>{data.label}</Text>
                    </View>
                  );
                }
              );
            }
            case "select-dropdown": {
              return (
                <View style={styles.ansOptions}>
                  <Text style={styles.ansText}>{answer.data.value}</Text>
                </View>
              );
            }
            case "select-toggle": {
              return (
                <>
                  <View style={styles.ansOptions}>
                    {answer.data.value === true
                      ? checkedRadio
                      : nonCheckedRadio}
                    <Text style={styles.ansText}>
                      {question.FormFields[0].interfaceOptions.onLabel}
                    </Text>
                  </View>
                  <View style={styles.ansOptions}>
                    {answer.data.value === false
                      ? checkedRadio
                      : nonCheckedRadio}
                    <Text style={styles.ansText}>
                      {question.FormFields[0].interfaceOptions.offLabel}
                    </Text>
                  </View>
                </>
              );
            }
            case "file": {
              return (
                <View style={styles.ansOptions}>
                  <Link src="https://beta.snowkap.com/uploads/file_attachment/file/634e96d36102c60001d2137c/SamplePdf_477kb_1page.pdf">
                    <Text style={styles.ansText}></Text>
                  </Link>
                </View>
              );
            }
            case "datetime": {
              return (
                <View style={styles.ansOptions}>
                  <Text style={styles.textInput}>{answer.data.value}</Text>
                </View>
              );
            }
            case "select-multiple-checkbox": {
              return question.FormFields[0].interfaceOptions.choices.map(
                (data: any) => {
                  return (
                    <View style={styles.ansOptions}>
                      {answer.data.value.filter((x: string) => x == data.label)
                        .length > 0
                        ? CheckedBox
                        : nonCheckedBox}
                      <Text style={styles.ansText}>{data.label}</Text>
                    </View>
                  );
                }
              );
            }
            case "select-multiple-dropdown": {
              return answer.data.map((data: any) => {
                return (
                  <View style={styles.ansOptions}>
                    <Text style={styles.ansText}>{data.value}</Text>
                    <Text style={styles.ansText}>
                      {data.s1_1_q2_file.value}
                    </Text>
                    <Text style={styles.ansText}>
                      {data.s1_1_q2_validity_period.value}
                    </Text>
                  </View>
                );
              });
            }
            case "input-multiline": {
              return (
                <>
                  <View style={styles.ansOptions}>
                    <Text style={styles.ansText}>{answer.data.value}</Text>
                  </View>
                  {/* <View style={styles.subAnswerQuestion}>
                    <View>
                      <Text style={styles.questionsText}>
                        Q. Define the process followed?
                      </Text>
                    </View>
                    <View>
                      <View style={styles.ansOptions}>
                        <Text style={styles.textInput}>12</Text>
                      </View>
                    </View>
                  </View> */}
                </>
              );
            }
            case "input": {
              return (
                <>
                  <View style={styles.ansOptions}>
                    <Text style={styles.ansText}>{answer.data.value}</Text>
                  </View>
                  {/* <View style={styles.subAnswerQuestion}>
                    <View>
                      <Text style={styles.questionsText}>
                        Q. Define the process followed?
                      </Text>
                    </View>
                    <View>
                      <View style={styles.ansOptions}>
                        <Text style={styles.textInput}>12</Text>
                      </View>
                    </View>
                  </View> */}
                </>
              );
            }
            case "multi-select-row": {
              return answer.data.map((data: any) => {
                return (
                  <View style={styles.ansOptions}>
                    <Text style={styles.ansText}>{data.value}</Text>
                    <Text style={styles.ansText}>
                      {data.s1_1_q2_file.value}
                    </Text>
                    <Text style={styles.ansText}>
                      {data.s1_1_q2_validity_period.value}
                    </Text>
                  </View>
                );
              });
            }
            default: {
              return (
                <>
                  <View style={styles.ansOptions}>
                    {answer.selected ? CheckedBox : nonCheckedBox}
                    <Text style={styles.ansText}>{answer.content}</Text>
                  </View>
                </>
              );
            }
          }
        })}
      </View>
    </View>
  );
};
const generatePdfDocument = async (documentData: any) => {
  let sum = 0;
  const blob = await pdf(
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.logo}>
          <Image
            style={{ width: "113pt", height: "56pt" }}
            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJUAAABKCAYAAACyyha1AAAABmJLR0QA/wD/AP+gvaeTAAAMwElEQVR42u1dCZAcVRleBIKA4pEUoICcQkEVh1wSQGrY7e7dnZ2d6d2wOSocSnCFlBwKEiEmtcFYxIiFJCa47k53dg1qoqkkpEQjURErpBKMBg8kh0YCIVCEZGOSnSub8funX2d7Z/v1dPfM7M7xXtWr2e2Zftf/vf967/2vpqaMUrqj40PJaP2VSU2+J6FL8xOavDqhKa8kuqRLh/2285oT2W+2JDRpDd5ZmIzKX0xodZdROTUiVW9K99SNTWpKO8Dxi7gmv4/PtE3el+pWbhn2brrmuERU6bD5/YFEVFqZjEp3prvrPylGuRqA1BE4AVymFVxoFQCQ4AApO8fx+0l25SV15W58n+S8lwLwfh3XlJDgYJUIpgWNJ0FE3ZvQ5f+4BFJ2PkLi0a5sDsfKysqOuC4/mNYDHxbUKHvOBF1Jl74MML3jE0zpDEeLKlNtORXEnAeOR/nNjGgUnKs8U1Kvuw5E3JQHmCj3xTSl1pZDadJMfH/UZ7l/TWr1VwsqlQt3IutMk7+LPOCD2LsSUfln+Jyd0JXJsV7pM7Z19CqnQqTdBg74OH7fS+LNR11JEp3UXkG1Ek4xveE8EGuDB8IOwCXwB+SvxLvrL8qn7n5NOcdwLcgvZJR09214ld4V1CtJQEkBcgG4ISRzIcwuFjEPddWdEdekR1DH2+6ApexJacqNgoollOAbmmiY/s7EA0d6Lx6VHiLxNWJWJzlUoaC7c13IUwQ1S0Eh16T7XOhPKRD3GZj0Hx8dPa/5FCj230Y7YjldF7p8h6DqaHIoTb49J6Ci8tZSsbTiPXUXA1ybcwJLU+4S1B0NAsFT7eDNNnWVnvSiwEdKyjolkagrT+cCFnSyekHlkeRQunQ5Bv6wA1GOwtyfUdJiO6pMy2El9tktaItUjJm+tPE0Emk5/D9Ty4LbRpVG58mh7Eh3Sh8TVC86l1J+6eR3KhdADYpxqd5xqQfOVUH14irmU5xdBtJ9ZeoSmUB6FB9Y0gRB/WKIveeaPgG3wLtcQEWVBeXNgbHk4+CsFfuziqN//NiBS60v9zW0zMa/zI5TruP2BwIFBQVUwyV88SD9j7fwW3bAAjeiJRveFhzsyfqsQEPBdCnlOa5o0KX7K6qvxpITjyMvE2goCKDqLnPwmm+qxA1v6NeveE7RWJdyvkBF3qJPWsSbubElcl1luk0yzl3biUTeeIGKfHSM5eNPxkDu57gPfl/ZHFr6OWcyHSi1paeySrRizzezK3ttLNktfc5BtxJbZPLQLV6wHVSciqmGwwPo50YOqFYIdPgXff0cN8LMquDUxqKzHaj6hQj0o6DrcpAr+rAvqSomVsZvZb+TgcZHoMSzPsXdc7StqiaXJv+Js4NhrkCJd071R85yxTNVpVdy1gQr3fotPNs31sH226/Yl9fWlvw5lSRxOPZBGqeqBIiqqhc2N0fmNjeHf4q8OBSKTGpraxvj9A47v2dvTrPdkMFgy8Uodx7y7EAgcIL1/WY8NL5TVb/tRhnXob1Po4xV+FwWDocfQz7DWxmRmUY7Wm62Pkc5t6LMTnzenTVW57E+PYk+ZeIu0O4M3kloOgrGqzsSiXyeykIdX7U+D4VaxrM6kJvzWjOldlI/QiE1kC9O0E55sF3GGIRC4XsJPzVDO6AG8GUCOZ2VtwNY3B2NsWj9rbxjTOnlbcezRjSY5YXDkflZ9S40vgsv9to5tOt4es+mzZQPot5W9wMVWWq8p64Y2r7Ialbeng6La4SAy36/Kcu18pbdeKSideN5dRNBsstC+Vfg2T56ju+/lQ8IGDjN8X85f1CpHZwxjyPfYx289azSHnQoTB3B/7sI3c56hDKZ55+yDFCDpeKjqKulEKAyZp9Zrroc5X4J7f46TQT2PEFcwN3AR5rZO4dMzoN2fxT/xwYJEr7JUvcrxjP14SxQbfDqBM0GFeq5iEDMyv9+viAwJI+V+M1XFwZU4S34ux1/P4C8lpUfC4VCZ5mDtNuYFZE7LZzgZDTgFGclXbqfM4gbOKCivL+pacIF+YCqtbX1UyZnRcdmWb9TFOVUPP8768+LLrneGPz+A/ZOkBF76tB2hzNreS0tLafj/wGaIMFg67lDQIVAavarCsoDbkBFBMHfO1mdeW9mtIxTfJAbR7oKASri4uYzUmvw7D02+VpNUK20DOBrpGOQLpTT4uHHfHreBlR7zBmO/GpjY+NJfkGFMu8yxVy2nsa+n8y+T9HkcMn5dMatn80ak172/C08Pg7En8YGdf2wScbfoPioC1Btw+c/WZ0rqa78uVRkjkUCEQc8ityPiTG2kKBiXP0Ae36bFdFrszjKABHdqXMYrDkc38wqG1DtamxsPRuf77P/F/kHlfooG6ytfOXd6McxdpyTAGoje2c3AH8aDT5yEmWNw+d/mei4wdSz0K8HbXxVP+IcipiVG1RD8gf5KueM++4x281Ato7pad8ogE613TAwIvNJFLJnB4YBltBMFVp+RA2K8DmVPIszM1fbgcpCvAH2bIcfUKGMO0y9iWaJAyeL5bJgzdTe3n4ifr+Xtecp9rmG6SXm/2QYHDYm3HCwckHl4ADNAhW4orqZ1fUSGSP+FfRj4vsIqQGULfrmTr9lOyjqu5qaIoObB5qaWi4lKyHLIvqNnc7ixuFHm9d4oGIzZm6WvuIJVEyv6TdmnRq1DhC5E1Dev00F3qO46DLFJuNGt2dxvpSTFQVQdXFO2XzTBajeoH4wF8xB9mxOHqJvI4f4OZmFS1C9jjwDeTrGWTENHFNUjGNEGCCTGp9fI6uGFGpGmIlcRR2RWXixnJxAReY5yv2tX1CxQXvcYv1tZkBdYBGvfeAmnvaKw1qULAMfIzFo4Y7bLN9N56gDz9t71ZV2F6DaaMNpB6hN3rmUer05BmQBNzWp15jZ4oZZVyidaliigaPZTmxyOJrVFR0OW1fAqdo4oNrtBCoLt9ntF1SG0hx+wuQeWflNU4/w7vsyrJhsLmfhrgOkg9qDihPUw+E8oB2omMj9CXv+bjAYPNMb4Q1Lj+nEQxJZrCatAbjLiwIqC8c6n2Yg+UZI5JHnNNc7CP56Ay8kkHkUi5U7w252o45rje9UxS+bJ/cEyniEgEltR1lTyLLMUxeZl+3jYisO5P1/iDsenPOOKb3+C7x3gkH1KhoDqzvHnOzMIJmBcbrFq3Vs+JDslX1aITDG3fvEI25HZQ/RnwqZ+rsaz+aef9Plq6ppmeuQHjiTNxbpzsC4GpHcJbagvI9zEnlaNY0FC5lkG9JRIMVjgl61lrM3vbOqxoHjs0PQ2nUCJZ4HMxPO0I7tv11NWz64SrouPyFQ4pXtG7Gb7PUqnDSphjFguuVRr0q6SDy9Cve4UJwEzvLEd6piYuE+G178CBHU378+sYynpGJf1ZiKnlSGsfK6OKJVcGWds6/KANakSu47u2yA03cpItDhd7YaZ//2cgZ3SyUfKKW7AnkXDAjRl78InOcQtnBiJfaZbkN1CH72lEBFvmKgu/ZcbsAzRCmuNN2KuG/m/mbOHn2yCAUqCiIK6PozbrCKOZXUVxyinc4P8CY/K9BQWG4V48ZN76q7oiL6iTCTXDcKwjNWShjKEtKtlO85WENvUND+shZ7UL55p7KryTc3soOOG7Ac789D0P5yXr7BwvFift8QOqnT+QSSSH4H3li6cbi3uDyDVjgcSTN0qW6pSVC/qDOas197EFiPlZVijmvYnK6Xw/6xHwqqF1sMItgXBvtvlQAsFtTsiENf/kxXuQmqj4SVhLDP7B5kh3uSpc50x/ADoSUxMWhdD4p3jjv/9qIPFwhqjySwjLWxRI47k393OCp/uqQA1VM3lneM3ZIP0T59QeVRUdzlcC5gZdYOdUUtiYmgKbUuboBPitCLo5wIMLmvvTVON8eX1F44Gm3s76k9CwH3lzpbrpkcw+9aBVVLgWPB5HbwRA9ZO6NYov2acs5ItOtgr3I6uTlInLloWx+JdEHNkuJYmas3drogXppxtiUpTbmxGA5Tul2eXX/S77I9O5PR+isFFUswEWeA3+dFl4Q8RlCI0CdJ36H9W76Ub+yUSEWlm9nJl395q19ZRSEYBfVK2Y8FzsM81P0ewZVmSv96KMrdFPuJjt9TINdkd/31dNgCx6KuzQR2hd4DI+FhisaC/JLPug5TzIiqDQZbnpZhwyU+uNYIZWkNBcsVVCprJZ57gGBkc1R5jdwggiqVIBLhWWc3xW8aJUD9BR70FiHqKjSllsg3sZ2kfUUG0n7SuYRnvJq4FxZq47rSDOJryNsLI97krVgaWkjl+rUkRaqgRLcnMO/8bAIa3f1ClyuxhWuKQBPPWIe6/A4+/wEr8GW4A3rISiS9TRxIKH76P1RWnXhhD2UPAAAAAElFTkSuQmCC"
          />
        </View>
        <View style={styles.margin}>
          <Text style={styles.mainTitle}>
            ESG Diagnostic Report -{" "}
            {new Date().toLocaleString("en-US", { day: "2-digit" })}{" "}
            {new Date().toLocaleString("en-US", { month: "long" })}
          </Text>
        </View>
        <View>
          <Text style={styles.summaryHeadtxt}>
            Here is summary of ThinkBoxs ESG performance
          </Text>
        </View>
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
                (section: any, index: number) => {
                  return section.Questions.length > 0 ? (
                    <View style={styles.tableBody}>
                      <Text style={[styles.tableBodyText, { paddingLeft: 0 }]}>
                        {section.content}
                      </Text>
                      <Text style={styles.tableBodyText}>
                        {section.FormResults.filter(
                          (x: any) => x.questionId == null
                        ).map((data: any) => data.score)}{" "}
                        / {section.weightage}
                      </Text>
                    </View>
                  ) : null;
                }
              )}
            </View>
          </View>
          <View style={styles.summaryTableChild}>
            <Image src={URL + "/images/assessment_illustration.png"} />
          </View>
        </View>
        <View style={styles.divider}></View>
        {documentData.FormInvitation.Form.Sections.map(
          (section: any, index: number) => {
            return section.Questions.length > 0 ? (
              <View>
                <View style={styles.areaTitle}>
                  <Text style={styles.subTitle}>{section.content}</Text>
                  <Text style={styles.areaPoints}>
                    {section.FormResults.filter(
                      (x: any) => x.questionId == null
                    ).map((data: any) => data.score)}{" "}
                    / {section.weightage}
                  </Text>
                </View>
                {section.Questions.map((question: any, index: number) => {
                  return question.Answers.length > 0
                    ? getQuestionAnswersView(question, index)
                    : null;
                })}
              </View>
            ) : null;
          }
        )}
      </Page>
    </Document>
  ).toBlob();
  saveAs(blob, documentData.name);
};
const AssessmentListing = () => {
  const [refetch, { data, loading, error }] =
    useGetSubmittedFormToDownloadAsPdfLazyQuery();
  // console.log("q", newData.data?.FormSubmission[0]);

  try {
    {
      data?.FormSubmission[0]
        ? generatePdfDocument(data?.FormSubmission[0])
        : console.log(error);
      return (
        <button
          onClick={() =>
            refetch({
              variables: {
                invitationId: "f64a61d9-2248-4f2c-bc7d-15f15e7e5cbc",
                submissionId: "506a0000-2d10-498d-a640-3a3b1451b67d",
              },
            })
          }
        >
          PDF
        </button>
      );
    }
  } catch (e) {
    console.log(e);
    return null;
  }
};

AssessmentListing.getLayout = (page: any) => {
  return <MainLayout>{page}</MainLayout>;
};

AssessmentListing.title = "Assessment Listing";

export default AssessmentListing;
