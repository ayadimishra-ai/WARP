import {
  Document,
  Image,
  Page,
  Path,
  PDFDownloadLink,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import MainLayout from "@warp/client/layouts/MainLayout";
import { NextPageType } from "@warp/client/types/page-types";
import { useEffect, useState } from "react";

const styles = StyleSheet.create({
  page: {
    border: "1px solid #cdcdcd",
    padding: "35px",
    display: "flex",
    flexDirection: "column",
    width: "70%",
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
    alignItems: "center",
    textAlign: "left",
  },
  questionsText: {
    fontSize: "12pt",
    fontWeight: 700,
    paddingRight: 80,
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
    fontSize: "12pt",
    fontWeight: 700,
  },
  questionPoints: {
    backgroundColor: "#FFF5E6",
    padding: "10px",
    marginLeft: "15px",
    fontSize: 12,
  },
  zeroPoints: {
    padding: "0px",
    marginLeft: "15px",
    fontSize: 12,
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
  },
  tableHeadText: {
    fontSize: 12,
    flexGrow: 1,
    flexBasis: 0,
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
});
const ConvertFormJSONDetailsIntoPDFToDownload: NextPageType = ({}) => {
  const checkedRadio = (
    <svg width="20" height="20" viewBox="0 0 50 50">
      <Path
        fill="#000"
        d="M16 2a14 14 0 1 0 14 14A14 14 0 0 0 16 2Zm0 26a12 12 0 1 1 12-12a12 12 0 0 1-12 12Z"
      />
      <Path fill="#000" d="M16 10a6 6 0 1 0 6 6a6 6 0 0 0-6-6Z" />
    </svg>
  );
  const nonCheckedRadio = (
    <svg width="20" height="20" viewBox="0 0 50 50">
      <Path
        fill="#000"
        d="M16 2a14 14 0 1 0 14 14A14 14 0 0 0 16 2Zm0 26a12 12 0 1 1 12-12a12 12 0 0 1-12 12Z"
      />
    </svg>
  );
  const CheckedBox = (
    <svg
      width="22"
      height="22"
      preserveAspectRatio="xMidYMid meet"
      viewBox="0 0 35 35"
    >
      <Path
        fill="#000"
        d="M7 5c-1.103 0-2 .897-2 2v10c0 1.103.897 2 2 2h10c1.103 0 2-.897 2-2V7c0-1.103-.897-2-2-2H7zm0 12V7h10l.002 10H7z"
      />
      <Path
        fill="#000"
        d="M10.996 12.556L9.7 11.285l-1.4 1.43l2.704 2.647l4.699-4.651l-1.406-1.422z"
      />
    </svg>
  );
  const nonCheckedBox = (
    <svg
      width="22"
      height="22"
      preserveAspectRatio="xMidYMid meet"
      viewBox="0 0 35 35"
    >
      <Path
        fill="#000"
        d="M7 5c-1.103 0-2 .897-2 2v10c0 1.103.897 2 2 2h10c1.103 0 2-.897 2-2V7c0-1.103-.897-2-2-2H7zm0 12V7h10l.002 10H7z"
      />
    </svg>
  );
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.logo}>
          <Image
            style={{ width: "113pt", height: "56pt" }}
            src={"http://localhost:3000/images/CompanyLogo.png"}
          />
        </View>
        <View style={styles.margin}>
          <Text style={styles.mainTitle}>
            ESG Diagnostic Report - 12th October 2022
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
                <Text style={styles.tableHeadText}>Sustainibility Area </Text>
                <Text style={styles.tableHeadText}>Scores</Text>
              </View>
              <View style={styles.tableBody}>
                <Text style={styles.tableBodyText}>Company Information</Text>
                <Text style={styles.tableBodyText}>140 / 195</Text>
              </View>
              <View style={styles.tableBody}>
                <Text style={styles.tableBodyText}>Workplace</Text>
                <Text style={styles.tableBodyText}>70 / 135</Text>
              </View>
              <View style={styles.tableBody}>
                <Text style={styles.tableBodyText}>Community</Text>
                <Text style={styles.tableBodyText}>60 / 60</Text>
              </View>
              <View style={styles.tableBody}>
                <Text style={styles.tableBodyText}>Company Information</Text>
                <Text style={styles.tableBodyText}>140 / 195</Text>
              </View>
              <View style={styles.tableBody}>
                <Text style={styles.tableBodyText}>Workplace</Text>
                <Text style={styles.tableBodyText}>70 / 135</Text>
              </View>
              <View style={styles.tableBody}>
                <Text style={styles.tableBodyText}>Community</Text>
                <Text style={styles.tableBodyText}>60 / 60</Text>
              </View>
            </View>
          </View>
          <View style={styles.summaryTableChild}>
            <Image src="http://localhost:3000/images/assessment_illustration.png" />
          </View>
        </View>
        <View style={styles.divider}></View>
        <View>
          <View style={styles.areaTitle}>
            <Text style={styles.subTitle}>Company Information</Text>
            <Text style={styles.areaPoints}>140/165</Text>
          </View>
          <View style={styles.questionContainer}>
            <View style={styles.questions}>
              <View style={styles.questionLeft}>
                <Text style={styles.questionsText}>
                  Q1 Which, if any, of the following statements apply to the
                  company
                </Text>
              </View>
              <View style={styles.questionIcon}>
                <svg width="20" height="20">
                  <Path
                    d="M10 0C4.487 0 0 4.487 0 10s4.487 10 10 10 10-4.487 10-10S15.513 0 10 0Zm-.833 1.707v1.626H7.5V2.048a8.33 8.33 0 0 1 1.667-.34Zm1.666 0a8.288 8.288 0 0 1 3.9 1.433l-.566.193v.834h-.834L12.5 5v1.667l1.667-.834 2.5.834-.834 1.666-1.666-.833H12.5l-1.667 1.667v1.666L12.5 12.5h1.667L15 14.167l-1.756 3.514a8.33 8.33 0 0 1-4.149.602l-1.624-1.587.029-3.363-2.5-2.5H2.5V9.167l4.167-2.5V5h1.666l.834.833L10.833 5V1.707Z"
                    fill="#008522"
                  />
                </svg>
              </View>
              <View style={styles.questionRight}>
                <Text style={styles.questionPoints}>10</Text>
              </View>
            </View>
            <View style={styles.ansContainer}>
              <View style={styles.ansOptions}>
                {checkedRadio}
                <Text style={styles.ansText}>dsdfsdf</Text>
              </View>
              <View style={styles.ansOptions}>
                {nonCheckedRadio}
                <Text style={styles.ansText}>dsdfsdf</Text>
              </View>
              <View style={styles.ansOptions}>
                {CheckedBox}
                <Text style={styles.ansText}>dsdfsdf</Text>
              </View>
              <View style={styles.ansOptions}>
                {nonCheckedBox}
                <Text style={styles.ansText}>dsdfsdf</Text>
              </View>
              <View style={styles.ansOptions}>
                <Text style={styles.textInput}>dsdfsdf</Text>
                <Text style={styles.textInput}>dsdfsdf</Text>
              </View>
            </View>
          </View>
          <View style={styles.questionContainer}>
            <View style={styles.questions}>
              <View>
                <Text style={styles.questionsText}>
                  Q1 Which, if any, of the following statements apply to the
                  company?
                </Text>
              </View>
              <View style={styles.questionRight}>
                <svg width="20" height="20">
                  <Path
                    d="M10.539 0c-.637 0-1.154.517-1.154 1.154v7.308h-.77v-5.77a1.154 1.154 0 0 0-2.307 0v10.981s-2.215-1.433-3.33-1.918a2.417 2.417 0 0 0-.965-.216c-1.721 0-1.859 1.538-1.859 1.538l3.077 2.308 2.463 2.955A4.615 4.615 0 0 0 9.239 20h5.53c1.7 0 3.078-1.378 3.078-3.077V5a1.154 1.154 0 0 0-2.308 0v3.462h-.77v-5.77a1.154 1.154 0 0 0-2.307 0v5.77h-.77V1.154C11.693.517 11.177 0 10.54 0Zm0 11.539c.632 0 1.188.308 1.538.78.351-.472.906-.78 1.539-.78 1.062 0 1.923.86 1.923 1.922 0 1.924-3.462 4.231-3.462 4.231s-3.461-2.307-3.461-4.23c0-1.063.86-1.923 1.923-1.923Z"
                    fill="#F99E45"
                  />
                </svg>
                <Text style={styles.questionPoints}>10</Text>
              </View>
            </View>
            <View style={styles.ansContainer}>
              <View style={styles.ansOptions}>
                {checkedRadio}
                <Text style={styles.ansText}>dsdfsdf</Text>
              </View>
              <View style={styles.ansOptions}>
                {nonCheckedRadio}
                <Text style={styles.ansText}>dsdfsdf</Text>
              </View>
              <View style={styles.ansOptions}>
                {CheckedBox}
                <Text style={styles.ansText}>dsdfsdf</Text>
              </View>
              <View style={styles.ansOptions}>
                {nonCheckedBox}
                <Text style={styles.ansText}>dsdfsdf</Text>
              </View>
              <View style={styles.ansOptions}>
                <Text style={styles.textInput}>dsdfsdf</Text>
                <Text style={styles.textInput}>dsdfsdf</Text>
              </View>
            </View>
          </View>
          <View style={styles.questionContainer}>
            <View style={styles.questions}>
              <View>
                <Text style={styles.questionsText}>
                  Q1 Which, if any, of the following statements apply to the
                  company?
                </Text>
              </View>
              <View style={styles.questionRight}>
                <svg width="20" height="20">
                  <Path
                    d="M1.23.231C.55.231 0 .781 0 1.461V13.77h16V1.462C16 .782 15.45.23 14.77.23H1.23Zm0 3.692h13.54v8.616H1.23V3.923Zm11.066 1.225a.616.616 0 0 0-.423.186l-.917.917-.22-.109a.616.616 0 1 0-.55 1.101l.616.308a.615.615 0 0 0 .71-.116l1.23-1.23a.615.615 0 0 0-.446-1.057ZM3.692 6.385a.615.615 0 1 0 0 1.23h3.693a.615.615 0 1 0 0-1.23H3.692Zm8.604 1.84a.616.616 0 0 0-.423.186l-.917.917-.22-.11a.616.616 0 1 0-.55 1.102l.616.308a.616.616 0 0 0 .71-.116l1.23-1.23a.615.615 0 0 0-.446-1.057ZM3.692 9.462a.615.615 0 1 0 0 1.23h3.693a.617.617 0 1 0 0-1.23H3.692Z"
                    fill="#012169"
                  />
                </svg>
                <Text style={styles.zeroPoints}>0</Text>
              </View>
            </View>
            <View style={styles.ansContainer}>
              <View style={styles.table}>
                <View style={styles.tableHead}>
                  <Text style={styles.tableHeadText}>Countries </Text>
                  <Text style={styles.tableHeadText}></Text>
                  <Text style={styles.tableHeadText}></Text>
                </View>
                <View style={styles.tableBody}>
                  <Text style={styles.tableBodyText}>
                    Latin America and the Caribbean
                  </Text>
                  <Text style={styles.tableBodyText}>Antigua and Barbuda</Text>
                  <Text style={styles.tableBodyText}>
                    Latin America and the Caribbean
                  </Text>
                </View>
                <View style={styles.tableBody}>
                  <Text style={styles.tableBodyText}>Europe</Text>
                  <View style={styles.tableBodyText}>
                    <View style={styles.ansOptions}>
                      {checkedRadio}
                      <Text style={styles.ansText}>Yes</Text>
                    </View>
                    <View style={styles.ansOptions}>
                      {nonCheckedRadio}
                      <Text style={styles.ansText}>No</Text>
                    </View>
                  </View>
                  <Text style={styles.tableBodyText}>
                    Latin America and the Caribbean
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

const AssessmentListing = () => {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <>
      {isClient && (
        <PDFDownloadLink
          document={<ConvertFormJSONDetailsIntoPDFToDownload />}
          fileName="form name.pdf"
        >
          {({ blob, url, loading, error }) =>
            loading ? "Loading document..." : "Download now!"
          }
        </PDFDownloadLink>
      )}
      {/* <PDFViewer
        width="1000"
        height="700"
        children={
          <>
            <ConvertFormJSONDetailsIntoPDFToDownload />
          </>
        }
      /> */}
    </>
  );
};

AssessmentListing.getLayout = (page: any) => {
  return <MainLayout>{page}</MainLayout>;
};

AssessmentListing.title = "Assessment Listing";

export default AssessmentListing;
