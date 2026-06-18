import { getAppApiUrl } from "@warp/configs/api.config";
import { getConfig } from "@warp/configs/s3bucket.config";
import { useGetFormfieldAndAnswersByinvitationIdLazyQuery } from "@warp/graphql/queries/generated/get-formfield-and-answers-by-invitationId";
import htmlToPdfmake from "html-to-pdfmake";
import jsonata from "jsonata";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { useState } from "react";
import { convertDBAnswersToStoreAnswers } from "../features/form/store";
const { s3_bucket } = getConfig();
const url = getAppApiUrl();

export const useDownloadBRSRAssessmentPDF = () => {
  const [loader, setLoading] = useState(false);
  const refetchformfielddata =
    useGetFormfieldAndAnswersByinvitationIdLazyQuery()[0];

  const generateAndDownloadBRSRPdf = async (
    invitationId: string,
    questionaryName: string
  ) => {
    let formFielddata: any = "";
    try {
      if (loader) return;
      setLoading(true);
      if (!formFielddata && !!invitationId) {
        formFielddata = await refetchformfielddata({
          variables: {
            invitationId: invitationId,
          },
        }).then((fielddata: any) => {
          return fielddata;
        });
      }

      // Fetch the content from the local file or API
      let htmlContent: any = "";
      if (!htmlContent) {
        htmlContent = await fetch(
          questionaryName === "BRSR Core"
            ? `https://s3.ap-south-1.amazonaws.com/snowkap.warplive.files/public/templates/BRSR_Core_Template.txt`
            : questionaryName === "BRSR Comprehensive Core"
            ? "https://s3.ap-south-1.amazonaws.com/snowkap.warplive.files/public/templates/BRSR_Comprehensive_Core_Template.txt"
            : `https://s3.ap-south-1.amazonaws.com/snowkap.warplive.files/public/templates/brsr2_template_5.txt`
        )
          .then((response) => {
            return response.text();
          })
          .then(async (data) => {
            try {
              return data;
            } catch (error) {
              console.error("Error object:", error);
            }
          })
          .catch((error) => {
            console.error("Error fetching the file:", error);
          });
      }

      if (!!htmlContent && !!formFielddata) {
        let AnswerObject: any = convertDBAnswersToStoreAnswers(
          formFielddata?.data?.FormSubmission[0]?.FormInvitation?.Form
            ?.FormFields,
          formFielddata?.data?.FormSubmission[0]?.Answers ?? []
        );

        console.log("htmlContent = ", htmlContent);
        console.log("AnswerObject = ", AnswerObject);

        await formFielddata?.data?.FormSubmission[0]?.FormInvitation?.Form?.FormFields.map(
          (rec: any) => {
            if (rec?.interfaceOptions?.isAdvance === true) {
              const pdfMakeContent = htmlToPdfmake(
                AnswerObject[rec?.field]?.value
              );

              if (AnswerObject[rec?.field])
                AnswerObject[rec?.field].value = pdfMakeContent;
            }

            // scientific notation value converting to number.
            if (/e[-+]?\d+/i.test(String(AnswerObject[rec?.field]?.value))) {
              AnswerObject[rec?.field].value = AnswerObject[
                rec?.field
              ]?.value?.toLocaleString("fullwide", { useGrouping: false });
            }
          }
        );

        let fileName = questionaryName + ".pdf";
        const newtemplate = await jsonata(htmlContent).evaluate(AnswerObject);

        const _ = require("lodash");
        // Deep clone the template to avoid read-only property issues
        let clonedTemplate = await _.cloneDeep(newtemplate);
        //  pdfMake.vfs = pdfFonts?.pdfMake?.vfs;
        (pdfMake as any).vfs = (pdfFonts as any).pdfMake?.vfs;
        pdfMake.fonts = {
          OpenSans: {
            normal:
              "https://s3.ap-south-1.amazonaws.com/snowkap.warplive.files/public/pdf_template/open-sans/OpenSans-Regular.ttf",
            bold: "https://s3.ap-south-1.amazonaws.com/snowkap.warplive.files/public/pdf_template/open-sans/OpenSans-Bold.ttf",
            italics:
              "https://s3.ap-south-1.amazonaws.com/snowkap.warplive.files/public/pdf_template/open-sans/OpenSans-Italic.ttf",
            bolditalics:
              "https://s3.ap-south-1.amazonaws.com/snowkap.warplive.files/public/pdf_template/open-sans/OpenSans-Italic.ttf",
          },
          Roboto: {
            normal:
              "https://s3.ap-south-1.amazonaws.com/snowkap.warplive.files/public/pdf_template/roboto/Roboto-Regular.ttf",
            bold: "https://s3.ap-south-1.amazonaws.com/snowkap.warplive.files/public/pdf_template/roboto/Roboto-Bold.ttf",
          },
        };
        pdfMake.createPdf(clonedTemplate).download(fileName);
      }
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  return { generateAndDownloadBRSRPdf, loader };
};
