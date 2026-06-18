// var jsonata = require("jsonata");
import jsonata from "jsonata";
type QuestionType =
  | "TEXT"
  | "NUMBER"
  | "RICHTEXT"
  | "NUMBER"
  | "CHECKBOX"
  | "RADIO"
  | "FILE"
  | "SELECT"
  | "MULTISELECT"
  | "MULTISELECT_FILE"
  | "TAG";

let _questionType: QuestionType;

const question = [
  {
    id: "s1_q1",
    title: "s1_q1",
    content:
      "Does the facility have a management system in place, or is it developing one, to assess environmental risks associated with production?",
    seqIndex: 1,
    type: "CHECKBOX" as QuestionType,
    calc: {
      value:
        "$sum([answer[questionId= 's1_q1'].data.value ? 5 : 0, answer[questionId= 's1_q1_a1'].data.value != '' ? 5 : 0])",
    },
    weightage: 5,
    parentQuestionId: null,
  },
  {
    id: "s1_q1_a1",
    title: "s1_q1_a1",
    content: "Specify certification ?",
    type: "SELECT" as QuestionType,
    seqIndex: 2,
    calc: "",
    weightage: 5,
    parentQuestionId: "s1_q1",
  },
  {
    id: "s1_q2",
    title: "s1_q2",
    content:
      "Is the facility management system in compliance with applicable environmental laws and regulations?",
    type: "MULTISELECT" as QuestionType,
    seqIndex: 3,
    calc: {
      value:
        "$count(answer[questionId= 's1_q2'].data.value) = 0 ? 0 : $count(answer[questionId= 's1_q2'].data.value) < 3 ? 8 : $count(answer[questionId= 's1_q2'].data.value) < 5 ? 15 : 20",
    },
    weightage: 20,
    parentQuestionId: null,
  },
  {
    id: "s1_q3",
    title: "s1_q3",
    content:
      "Does the facility hold the necessary valid license(s) or permit(s) to operate ?",
    type: "MULTISELECT_FILE" as QuestionType,
    seqIndex: 3,
    calc: {
      value:
        "$count(answer[questionId= 's1_q3'].data.value.value) = 0 ? 0 : $count(answer[questionId= 's1_q3'].data.value.value) < 3 ? 8 : $count(answer[questionId= 's1_q3'].data.value.value) < 5 ? 15 : 20",
    },
    weightage: 20,
    parentQuestionId: null,
  },
  {
    id: "s1_q4",
    title: "s1_q4",
    content:
      "Are environmental policies, practices, and expectations communicated to all employees and suppliers in local or appropriate languages?",
    type: "CHECKBOX" as QuestionType,
    seqIndex: 4,
    calc: {
      value:
        "$sum([answer[questionId= 's1_q4'].data.value ? 5 : 0, $count(answer[questionId= 's1_q4_a1'].data.value) > 0 ? 5 : 0])",
    },
    weightage: 5,
    parentQuestionId: null,
  },
  {
    id: "s1_q4_a1",
    title: "s1_q4_a1",
    content: "Provide Proof",
    type: "FILE" as QuestionType,
    seqIndex: 4,
    calc: "",
    weightage: 5,
    parentQuestionId: "s1_q4",
  },
  {
    id: "s1_q6",
    title: "s1_q6",
    content:
      "Do you have a training Awareness Programs of employess for awareness related to Environment? Frequency",
    type: "CHECKBOX" as QuestionType,
    seqIndex: 6,
    calc: {
      value:
        "$sum([answer[questionId= 's1_q6'].data.value ? 5 : 0, $single([{'key':'Monthly','value':1},{'key':'Quarterly','value':2},{'key':'Half Yearly','value':3},{'key':'Yearly','value':4}],function($v){$v.key=answer[questionId='s1_q6_a1'].data.value}).value])",
    },
    weightage: 5,
    parentQuestionId: null,
  },
  {
    id: "s1_q6_a1",
    title: "s1_q6_a1",
    content: "Frequency",
    type: "SELECT" as QuestionType,
    seqIndex: 5,
    calc: "",
    weightage: 5,
    parentQuestionId: "s1_q6",
  },
  {
    id: "s2_q5",
    title: "s2_q5",
    content: "Specify the GHG emissions targets for the facility if any ?",
    type: "NUMBER" as QuestionType,
    seqIndex: 7,
    calc: { value: "answer[questionId= 's2_q5'].data.value > 0 ? 10 : 0" },
    weightage: 10,
    parentQuestionId: null,
  },
];

const questionChoice = [
  {
    id: "s1_q1_a1_1",
    questionId: "s1_q1_a1",
    type: "CHECKBOX" as QuestionType,
    key: "ISO_14001",
    file: null,
  },
  {
    id: "s1_q1_a1_2",
    questionId: "s1_q1_a1",
    type: "CHECKBOX" as QuestionType,
    key: "RC_14001",
    file: { allowed: {} },
  },
  {
    id: "s1_q1_a1_3",
    questionId: "s1_q1_a1",
    type: "CHECKBOX" as QuestionType,
    key: "EMAS",
    file: { allowed: {} },
  },
  {
    id: "s1_q2_1",
    questionId: "s1_q2",
    type: "MULTISELECT" as QuestionType,
    key: "Test 1",
    file: null,
  },
  {
    id: "s1_q2_2",
    questionId: "s1_q2",
    type: "MULTISELECT" as QuestionType,
    key: "Test 2",
    file: null,
  },
  {
    id: "s1_q2_3",
    questionId: "s1_q2",
    type: "MULTISELECT" as QuestionType,
    key: "Test 3",
    file: null,
  },
  {
    id: "s1_q2_4",
    questionId: "s1_q2",
    type: "MULTISELECT" as QuestionType,
    key: "Test 4",
    file: null,
  },
  {
    id: "s1_q2_5",
    questionId: "s1_q2",
    type: "MULTISELECT" as QuestionType,
    key: "Test 5",
    file: null,
  },
  {
    id: "s1_q3_1",
    questionId: "s1_q3",
    type: "MULTISELECT" as QuestionType,
    key: "Air emissions",
    file: null,
  },
  {
    id: "s1_q3_2",
    questionId: "s1_q3",
    type: "MULTISELECT" as QuestionType,
    key: "Waste water management",
    file: null,
  },
  {
    id: "s1_q3_3",
    questionId: "s1_q3",
    type: "MULTISELECT" as QuestionType,
    key: "Waste issues",
    file: null,
  },
];

const questionSelect = [
  {
    id: "s1_q6_a1_1",
    questionId: "s1_q6_a1",
    type: "SELECT" as QuestionType,
    key: "Monthly",
    value: "Monthly",
    file: null,
  },
  {
    id: "s1_q6_a1_2",
    questionId: "s1_q6_a1",
    type: "SELECT" as QuestionType,
    key: "Quarterly",
    value: "Quarterly",
    file: null,
  },
  {
    id: "s1_q6_a1_3",
    questionId: "s1_q6_a1",
    type: "SELECT" as QuestionType,
    key: "Half_yearly",
    value: "Half yearly",
    file: null,
  },
  {
    id: "s1_q6_a1_4",
    questionId: "s1_q6_a1",
    type: "SELECT" as QuestionType,
    key: "Annual",
    value: "Annual",
    file: null,
  },
];

const questionInput = [
  {
    id: "s1_q1_a1_2_file",
    questionId: "s1_q1_a1",
    type: "FILE" as QuestionType,
    file: { allowed: {} },
  },
  {
    id: "s1_q1_a1_3_file",
    questionId: "s1_q1_a1",
    type: "FILE" as QuestionType,
    file: { allowed: {} },
  },
  {
    id: "s1_q4_a1_1_file",
    questionId: "s1_q4_a1",
    type: "FILE" as QuestionType,
    file: { allowed: {} },
  },
  {
    id: "s2_q5_a1",
    questionId: "s2_q5",
    type: "NUMBER" as QuestionType,
    file: { allowed: {} },
  },
];

const answer = {
  answer: [
    {
      id: "s1_q1_ans",
      questionId: "s1_q1",
      data: {
        type: "CHECKBOX" as QuestionType,
        value: true,
      },
    },
    {
      id: "s1_q1_a1_ans",
      questionId: "s1_q1_a1",
      data: {
        type: "SELECT" as QuestionType,
        value: "ISO 14001",
        label: "ISO 14001",
      },
    },
    {
      id: "s1_q4_ans",
      questionId: "s1_q4",
      data: {
        type: "CHECKBOX" as QuestionType,
        value: true,
      },
    },
    {
      id: "s1_q4_a1_ans",
      questionId: "s1_q4_a1",
      data: {
        type: "FILE" as QuestionType,
        value: ["fileId1"], // Id from AnsFile table
      },
    },
    {
      id: "s1_q2_ans",
      questionId: "s1_q2",
      data: {
        type: "MULTISELECT" as QuestionType,
        value: ["Test 1", "Test 2", "Test 3", "Test 4", "Test 5", "Test 6"],
        choices: [],
      },
    },
    {
      id: "s1_q3_ans",
      questionId: "s1_q3",
      data: {
        type: "MULTISELECT_FILE" as QuestionType,
        value: [
          {
            value: "Air emissions",
            file: [""], // Id from AnsFile table
          },
          {
            value: "Waste water management",
            file: [""], // Id from AnsFile table
          },
          {
            value: "Waste issues",
            file: [""], // Id from AnsFile table
          },
        ],
        choices: [],
      },
    },
    {
      id: "s1_q6_ans",
      questionId: "s1_q6",
      data: {
        type: "CHECKBOX" as QuestionType,
        value: true,
      },
    },
    {
      id: "s1_q6_a1_ans",
      questionId: "s1_q6_a1",
      data: {
        type: "SELECT" as QuestionType,
        value: "Quarterly",
        label: "Quarterly",
      },
    },
    {
      id: "s2_q5_ans",
      questionId: "s2_q5",
      data: {
        type: "NUMBER" as QuestionType,
        value: 0,
      },
    },
  ],
};

const answerFile = [
  {
    answerId: "s1_q1_a1_ans",
    path: "file_path",
  },
  {
    answerId: "s1_q4_a1_ans",
    path: "file_path",
  },
  {
    answerId: "s1_q3_1_ans",
    path: "file_path",
  },
  {
    answerId: "s1_q3_2_ans",
    path: "file_path",
  },
  {
    answerId: "s1_q3_3_ans",
    path: "file_path",
  },
];

// async function getQuestionConditionalValue(field) {
//   if (field?.hasOwnProperty("_eq")) {
//     // equal condition operation
//     return field._eq;
//   } else if (field?.hasOwnProperty("_neq")) {
//     // not equal condition operation
//     return field._neq;
//   } else if (field?.hasOwnProperty("_length")) {
//     // length condition operation
//     const keyObj = Object.keys(field._length)[0];
//     return field?._length[keyObj];
//   }
// }

// async function conditionCheck(operation, operator1, operator2) {
//   if (operation?.hasOwnProperty("_eq")) {
//     return operator1 === operator2;
//   } else if (operation?.hasOwnProperty("_neq")) {
//     return operator1 !== operator2;
//   } else if (operation?.hasOwnProperty("_gt")) {
//     return operator1 > operator2;
//   } else if (operation?.hasOwnProperty("_lt")) {
//     return operator1 < operator2;
//   } else if (operation?.hasOwnProperty("_gte")) {
//     return operator1 >= operator2;
//   } else if (operation?.hasOwnProperty("_lte")) {
//     return operator1 <= operator2;
//   }
// }

// async function getQuestionFromRef(questionId: string) {
//   return await question.filter((x) => x.id == questionId)[0];
// }

// async function getAnswerFromQuestionId(questionId: string) {
//   return await answer.filter((x) => x.questionId == questionId)[0];
// }

// async function calcScoreFromQuestion(question) {
//   let gotMarks = 0;
//   question.calc.forEach(async (rule) => {
//     if (rule.type == "ifelse") {
//       // If else
//       // const fetchAnswer = answer.filter((x) => x.questionId == question.id)[0];
//       const fetchAnswer = await getAnswerFromQuestionId(question.id);
//       if (!!fetchAnswer) {
//         if (rule.if.hasOwnProperty("_or")) {
//           // or present

//           rule.if._or.forEach(async (field) => {
//             const getQuestionFieldKey = Object.keys(field)[0];
//             const getAnswerFromQuestion = await getAnswerFromQuestionId(
//               getQuestionFieldKey
//             );

//             if (!!getAnswerFromQuestion) {
//               if (getAnswerFromQuestion.data.type == "CHECKBOX") {
//                 if (
//                   await conditionCheck(
//                     field,
//                     await getQuestionConditionalValue(field),
//                     getAnswerFromQuestion.data.value
//                   )
//                 ) {
//                   gotMarks = rule.if.then.value;
//                 }
//               } else if (getAnswerFromQuestion.data.type == "SELECT") {
//                 if (
//                   await conditionCheck(
//                     field,
//                     await getQuestionConditionalValue(field),
//                     getAnswerFromQuestion.data.value
//                   )
//                 ) {
//                   gotMarks = rule.if.then.value;
//                 }
//               } else if (getAnswerFromQuestion.data.type == "NUMBER") {
//                 if (
//                   await conditionCheck(
//                     field,
//                     await getQuestionConditionalValue(field),
//                     getAnswerFromQuestion.data.value
//                   )
//                 ) {
//                   gotMarks = rule.if.then.value;
//                 }
//               } else if (getAnswerFromQuestion.data.type == "FILE") {
//                 const fileNamesArray = getAnswerFromQuestion.data.value;
//                 if (
//                   await conditionCheck(
//                     field,
//                     fileNamesArray.length,
//                     await getQuestionConditionalValue(field)
//                   )
//                 ) {
//                   // gotMarks = gotMarks + rule.if.then.value;
//                   gotMarks = rule.if.then.value;
//                 } else {
//                   gotMarks = rule.else.value;
//                 }
//               } else if (getAnswerFromQuestion.data.type == "MULTISELECT") {
//                 const selectedNamesArray = getAnswerFromQuestion.data.value;
//                 if (
//                   await conditionCheck(
//                     field,
//                     selectedNamesArray.length,
//                     await getQuestionConditionalValue(field)
//                   )
//                 ) {
//                   // gotMarks = gotMarks + rule.if.then.value;
//                   gotMarks = rule.if.then.value;
//                 } else {
//                   gotMarks = rule.else.value;
//                 }
//               } else if (
//                 getAnswerFromQuestion.data.type == "MULTISELECT_FILE"
//               ) {
//                 const fileNamesArray = getAnswerFromQuestion.data.value;
//                 const totalSelectedUploadedFiles = [];

//                 await fileNamesArray.forEach(async (fileSelect) => {
//                   if (fileSelect.file.length > 0) {
//                     totalSelectedUploadedFiles.push(fileSelect.value);
//                   }
//                 });

//                 if (
//                   await conditionCheck(
//                     field,
//                     totalSelectedUploadedFiles.length,
//                     await getQuestionConditionalValue(field)
//                   )
//                 ) {
//                   // gotMarks = gotMarks + rule.if.then.value;
//                   gotMarks = rule.if.then.value;
//                 } else {
//                   gotMarks = rule.else.value;
//                 }
//                 // console.log(question.id, gotMarks);
//               }
//             }
//           });
//         } else {
//           let keys = Object.keys(rule.if);
//           const ignoreKeys = ["then"];
//           const getQuestionFieldKey = keys.filter((y) =>
//             y.indexOf(ignoreKeys)
//           )[0];

//           if (fetchAnswer.questionId == getQuestionFieldKey) {
//             if (fetchAnswer.data.type == "CHECKBOX") {
//               if (
//                 await conditionCheck(
//                   rule.if[getQuestionFieldKey],
//                   await getQuestionConditionalValue(
//                     rule.if[getQuestionFieldKey]
//                   ),
//                   fetchAnswer.data.value
//                 )
//               ) {
//                 // gotMarks = gotMarks + rule.if.then.value;
//                 gotMarks = rule.if.then.value;
//               } else {
//                 gotMarks = rule.else.value;
//               }
//             } else if (fetchAnswer.data.type == "SELECT") {
//               if (
//                 await conditionCheck(
//                   rule.if[getQuestionFieldKey],
//                   await getQuestionConditionalValue(
//                     rule.if[getQuestionFieldKey]
//                   ),
//                   fetchAnswer.data.value
//                 )
//               ) {
//                 // gotMarks = gotMarks + rule.if.then.value;
//                 gotMarks = rule.if.then.value;
//               } else {
//                 gotMarks = rule.else.value;
//               }
//             } else if (fetchAnswer.data.type == "NUMBER") {
//               if (
//                 await conditionCheck(
//                   rule.if[getQuestionFieldKey],
//                   await getQuestionConditionalValue(
//                     rule.if[getQuestionFieldKey]
//                   ),
//                   fetchAnswer.data.value
//                 )
//               ) {
//                 // gotMarks = gotMarks + rule.if.then.value;
//                 gotMarks = rule.if.then.value;
//               } else {
//                 gotMarks = rule.else.value;
//               }
//             } else if (fetchAnswer.data.type == "FILE") {
//               const fileNamesArray = fetchAnswer.data.value;
//               if (
//                 await conditionCheck(
//                   rule.if[getQuestionFieldKey],
//                   fileNamesArray.length,
//                   await getQuestionConditionalValue(
//                     rule.if[getQuestionFieldKey]
//                   )
//                 )
//               ) {
//                 // gotMarks = gotMarks + rule.if.then.value;
//                 gotMarks = rule.if.then.value;
//               } else {
//                 gotMarks = rule.else.value;
//               }
//             } else if (fetchAnswer.data.type == "MULTISELECT") {
//               const selectedNamesArray = fetchAnswer.data.value;
//               if (
//                 await conditionCheck(
//                   rule.if[getQuestionFieldKey],
//                   selectedNamesArray.length,
//                   await getQuestionConditionalValue(
//                     rule.if[getQuestionFieldKey]
//                   )
//                 )
//               ) {
//                 // gotMarks = gotMarks + rule.if.then.value;
//                 gotMarks = rule.if.then.value;
//               } else {
//                 gotMarks = rule.else.value;
//               }
//             } else if (fetchAnswer.data.type == "MULTISELECT_FILE") {
//               const fileNamesArray = fetchAnswer.data.value;
//               const totalSelectedUploadedFiles = [];

//               await fileNamesArray.forEach(async (fileSelect) => {
//                 if (fileSelect.file.length > 0) {
//                   totalSelectedUploadedFiles.push(fileSelect.value);
//                 }
//               });

//               if (
//                 await conditionCheck(
//                   rule.if[getQuestionFieldKey],
//                   totalSelectedUploadedFiles.length,
//                   await getQuestionConditionalValue(
//                     rule.if[getQuestionFieldKey]
//                   )
//                 )
//               ) {
//                 // gotMarks = gotMarks + rule.if.then.value;
//                 gotMarks = rule.if.then.value;
//               } else {
//                 gotMarks = rule.else.value;
//               }
//               // console.log(question.id, gotMarks);
//             }
//           }
//         }
//       }
//     } else if (rule.type == "case") {
//       const fetchAnswer = await getAnswerFromQuestionId(question.id);
//       if (!!fetchAnswer) {
//         rule.case.forEach(async (caseCondition) => {
//           const keys = Object.keys(caseCondition.condition[0]);
//           const getQuestionFieldKey = !!keys ? keys[0] : "";

//           // if (fetchAnswer.data.type == "CHECKBOX") {
//           // } else if (fetchAnswer.data.type == "FILE") {
//           // }
//           if (fetchAnswer.data.type == "SELECT") {
//             const selectedValue = fetchAnswer.data.value;

//             if (getQuestionFieldKey != "") {
//               let conditionField =
//                 caseCondition.condition[0][getQuestionFieldKey];
//               // if (
//               //   caseCondition.condition[0][getQuestionFieldKey].hasOwnProperty(
//               //     "_length"
//               //   )
//               // ) {
//               //   conditionField =
//               //     caseCondition.condition[0][getQuestionFieldKey]._length;
//               // }

//               if (
//                 await conditionCheck(
//                   conditionField,
//                   selectedValue,
//                   await getQuestionConditionalValue(
//                     caseCondition.condition[0][getQuestionFieldKey]
//                   )
//                 )
//               ) {
//                 // gotMarks = gotMarks + rule.if.then.value;
//                 gotMarks = caseCondition.value;
//               }
//             } else {
//               gotMarks = 0;
//             }
//             // console.log(question.id, gotMarks);
//           } else if (fetchAnswer.data.type == "NUMBER") {
//             const selectedValue = fetchAnswer.data.value;

//             if (getQuestionFieldKey != "") {
//               let conditionField =
//                 caseCondition.condition[0][getQuestionFieldKey];
//               if (
//                 caseCondition.condition[0][getQuestionFieldKey].hasOwnProperty(
//                   "_length"
//                 )
//               ) {
//                 conditionField =
//                   caseCondition.condition[0][getQuestionFieldKey]._length;
//               }

//               if (
//                 await conditionCheck(
//                   conditionField,
//                   selectedValue,
//                   await getQuestionConditionalValue(
//                     caseCondition.condition[0][getQuestionFieldKey]
//                   )
//                 )
//               ) {
//                 // gotMarks = gotMarks + rule.if.then.value;
//                 gotMarks = caseCondition.value;
//               }
//             } else {
//               gotMarks = 0;
//             }
//             // console.log(question.id, gotMarks);
//           } else if (fetchAnswer.data.type == "MULTISELECT_FILE") {
//             const fileNamesArray = fetchAnswer.data.value;
//             const totalSelectedUploadedFiles = [];

//             await fileNamesArray.forEach(async (fileSelect) => {
//               if (fileSelect.file.length > 0) {
//                 totalSelectedUploadedFiles.push(fileSelect.value);
//               }
//             });

//             if (getQuestionFieldKey != "") {
//               let conditionField =
//                 caseCondition.condition[0][getQuestionFieldKey];
//               if (
//                 caseCondition.condition[0][getQuestionFieldKey].hasOwnProperty(
//                   "_length"
//                 )
//               ) {
//                 conditionField =
//                   caseCondition.condition[0][getQuestionFieldKey]._length;
//               }

//               if (
//                 await conditionCheck(
//                   conditionField,
//                   totalSelectedUploadedFiles.length,
//                   await getQuestionConditionalValue(
//                     caseCondition.condition[0][getQuestionFieldKey]
//                   )
//                 )
//               ) {
//                 // gotMarks = gotMarks + rule.if.then.value;
//                 gotMarks = caseCondition.value;
//               }
//             } else {
//               gotMarks = 0;
//             }
//             // console.log(question.id, gotMarks);
//           }
//         });
//       }
//     } else if (rule.type == "sum") {
//       if (rule.hasOwnProperty("rule")) {
//         let keys = Object.keys(rule.rule);
//         if (keys.length == 1) {
//           const getQuestionFieldKey = keys[0];
//           // const fetchAnswer = answer.filter(
//           //   (x) => x.questionId == getQuestionFieldKey
//           // )[0];
//           const fetchAnswer = await getAnswerFromQuestionId(
//             getQuestionFieldKey
//           );

//           if (!!fetchAnswer) {
//             if (fetchAnswer.data.type == "CHECKBOX") {
//               if (
//                 await conditionCheck(
//                   rule.rule[getQuestionFieldKey],
//                   await getQuestionConditionalValue(
//                     rule.rule[getQuestionFieldKey]
//                   ),
//                   fetchAnswer.data.value
//                 )
//               ) {
//                 if (rule.value.hasOwnProperty("ref")) {
//                   const question = await getQuestionFromRef(rule.value.ref);
//                   gotMarks = gotMarks + (await calcScoreFromQuestion(question));
//                 } else {
//                   gotMarks = gotMarks + rule.value;
//                 }
//               }
//             } else if (fetchAnswer.data.type == "SELECT") {
//               if (
//                 await conditionCheck(
//                   rule.rule[getQuestionFieldKey],
//                   await getQuestionConditionalValue(
//                     rule.rule[getQuestionFieldKey]
//                   ),
//                   fetchAnswer.data.value
//                 )
//               ) {
//                 if (rule.value.hasOwnProperty("ref")) {
//                   const question = await getQuestionFromRef(rule.value.ref);
//                   gotMarks = gotMarks + (await calcScoreFromQuestion(question));
//                 } else {
//                   gotMarks = gotMarks + rule.value;
//                 }
//               }
//             } else if (fetchAnswer.data.type == "NUMBER") {
//               if (
//                 await conditionCheck(
//                   rule.rule[getQuestionFieldKey],
//                   await getQuestionConditionalValue(
//                     rule.rule[getQuestionFieldKey]
//                   ),
//                   fetchAnswer.data.value
//                 )
//               ) {
//                 if (rule.value.hasOwnProperty("ref")) {
//                   const question = await getQuestionFromRef(rule.value.ref);
//                   gotMarks = gotMarks + (await calcScoreFromQuestion(question));
//                 } else {
//                   gotMarks = gotMarks + rule.value;
//                 }
//               }
//             } else if (fetchAnswer.data.type == "FILE") {
//               const fileNamesArray = fetchAnswer.data.value;
//               if (
//                 await conditionCheck(
//                   rule.rule[getQuestionFieldKey],
//                   fileNamesArray.length,
//                   await getQuestionConditionalValue(
//                     rule.rule[getQuestionFieldKey]
//                   )
//                 )
//               ) {
//                 if (rule.value.hasOwnProperty("ref")) {
//                   const question = await getQuestionFromRef(rule.value.ref);
//                   gotMarks = gotMarks + (await calcScoreFromQuestion(question));
//                 } else {
//                   gotMarks = gotMarks + rule.value;
//                 }
//               }
//             } else if (fetchAnswer.data.type == "MULTISELECT") {
//               const selectedNamesArray = fetchAnswer.data.value;
//               if (
//                 await conditionCheck(
//                   rule.rule[getQuestionFieldKey],
//                   selectedNamesArray.length,
//                   await getQuestionConditionalValue(
//                     rule.rule[getQuestionFieldKey]
//                   )
//                 )
//               ) {
//                 // gotMarks = gotMarks + rule.if.then.value;
//                 if (rule.value.hasOwnProperty("ref")) {
//                   const question = await getQuestionFromRef(rule.value.ref);
//                   gotMarks = gotMarks + (await calcScoreFromQuestion(question));
//                 } else {
//                   gotMarks = gotMarks + rule.value;
//                 }
//               }
//             } else if (fetchAnswer.data.type == "MULTISELECT_FILE") {
//               const fileNamesArray = fetchAnswer.data.value;
//               const totalSelectedUploadedFiles = [];

//               await fileNamesArray.forEach(async (fileSelect) => {
//                 if (fileSelect.file.length > 0) {
//                   totalSelectedUploadedFiles.push(fileSelect.value);
//                 }
//               });

//               if (
//                 await conditionCheck(
//                   rule.rule[getQuestionFieldKey],
//                   totalSelectedUploadedFiles.length,
//                   await getQuestionConditionalValue(
//                     rule.rule[getQuestionFieldKey]
//                   )
//                 )
//               ) {
//                 if (rule.value.hasOwnProperty("ref")) {
//                   const question = await getQuestionFromRef(rule.value.ref);
//                   gotMarks = gotMarks + (await calcScoreFromQuestion(question));
//                 } else {
//                   gotMarks = gotMarks + rule.value;
//                 }
//               }
//               // console.log(question.id, gotMarks);
//             }
//           }
//         }
//       }
//     }

//     console.log(question.id, rule.type, " => ", gotMarks);
//   });
//   return gotMarks;
// }

export const calculateScore = async () => {
  let score: any = {};

  const fetchQuestions = question
    .filter((x) => x.parentQuestionId == null)
    .sort(function (a, b) {
      return a.seqIndex - b.seqIndex;
    });

  if (!!fetchQuestions) {
    fetchQuestions.forEach(async (question) => {
      // const gotMarks = await calcScoreFromQuestion(question);
      // const stringyfiedData = stringify(question.calc);
      // console.log("stringyfiedData", question.calc.value);

      // const parsedData = JSON.parse(stringyfiedData).value;
      // console.log("parsedData", parsedData);

      var expression = jsonata(question.calc.value);
      var result = expression.evaluate(answer);
      score[question.id] = result;
    });
  }
  return score;
};

export const calculateScoreFromGQL = async (data: string) => {
  let score: any = {};

  var expression = jsonata(data.value);
  var result = expression.evaluate(answer);

  //   return stringify(data);
  return result;
};
