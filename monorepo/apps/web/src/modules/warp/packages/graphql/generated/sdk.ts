import * as types from './types';

import { GraphQLClient, RequestOptions } from 'graphql-request';
import gql from 'graphql-tag';
type GraphQLClientRequestHeaders = RequestOptions['requestHeaders'];

export const UpsertValidationWarningLogsDocument = gql`
    mutation upsertValidationWarningLogs($object: [ValidationWarningLogs_insert_input!]!, $deleteobject: ValidationWarningLogs_bool_exp!) {
  delete_ValidationWarningLogs(where: $deleteobject) {
    affected_rows
  }
  insert_ValidationWarningLogs(
    objects: $object
    on_conflict: {constraint: ValidationWarningLogs_pkey}
  ) {
    returning {
      Id
    }
  }
}
    `;
export const AppendFormInvitationMetadataDocument = gql`
    mutation appendFormInvitationMetadata($invitationId: uuid!, $metadata: jsonb!) {
  update_FormInvitation(
    _append: {metadata: $metadata}
    where: {id: {_eq: $invitationId}}
  ) {
    affected_rows
    returning {
      id
      metadata
    }
  }
}
    `;
export const BulkDeleteSourceFilesFromIdDocument = gql`
    mutation bulkDeleteSourceFilesFromId($id: [uuid!]!) {
  delete_Sources(where: {sourceFilesId: {_in: $id}}) {
    returning {
      id
    }
  }
  delete_SourceFiles(where: {id: {_in: $id}}) {
    returning {
      id
    }
  }
}
    `;
export const Bulk_Insert_AiBulkDocumentProcessingDocument = gql`
    mutation bulk_insert_AIBulkDocumentProcessing($data: [AIBulkDocumentProcessing_insert_input!]!) {
  insert_AIBulkDocumentProcessing(
    objects: $data
    on_conflict: {constraint: AIBulkDocumentProcessing_pkey}
  ) {
    returning {
      id
      formInvitationId
    }
  }
}
    `;
export const BulkInsertAnswerDocument = gql`
    mutation bulkInsertAnswer($answerData: [Answer_insert_input!]!) {
  insert_Answer(objects: $answerData, on_conflict: {constraint: Answer_pkey}) {
    affected_rows
    returning {
      id
      submissionId
      formFieldId
    }
  }
}
    `;
export const BulkInsertCompaniesWithUsersDocument = gql`
    mutation BulkInsertCompaniesWithUsers($companyInput: [Company_insert_input!]!, $userInput: [User_insert_input!]!, $parentCompanyInput: [ParentCompanyMapping_insert_input!]!) {
  insert_Company(
    objects: $companyInput
    on_conflict: {constraint: Company_name_key}
  ) {
    returning {
      id
      name
      country
      details
      primaryContact
      parentCompanyId
      created_by
      updated_by
      created_at
      updated_at
      isActive
    }
  }
  insert_User(objects: $userInput) {
    returning {
      id
      name
      email
      emailVerified
      details
      image
      companyId
      phone
      phoneVerified
      created_by
      updated_by
      created_at
      updated_at
      isActive
      UserRoles {
        roleName
      }
    }
  }
  insert_ParentCompanyMapping(
    objects: $parentCompanyInput
    on_conflict: {constraint: ParentCompanyMapping_pkey}
  ) {
    returning {
      Id
      CompanyId
      ParentCompanyId
    }
  }
}
    `;
export const Bulk_Insert_Document_LogFilesDocument = gql`
    mutation bulk_insert_document_logFiles($data: [DocumentLogs_insert_input!]!) {
  insert_DocumentLogs(
    objects: $data
    on_conflict: {constraint: DocumentLogs_pkey}
  ) {
    returning {
      id
      error
      fileName
      originalFileName
      fileUrl
      expiryDate
      raraResponse
    }
  }
}
    `;
export const BulkInsertFormFieldsDocument = gql`
    mutation BulkInsertFormFields($objects: [FormField_insert_input!]!) {
  insert_FormField(
    objects: $objects
    on_conflict: {constraint: FormField_pkey, update_columns: [field, type, interface, seqIndex, dataPoint, subtheme, interfaceOptions, fieldOptions, displayOptions, displayRules, validationRules, warningRules, tags, updated_at]}
  ) {
    returning {
      id
      formId
      sectionId
      questionId
    }
    affected_rows
  }
}
    `;
export const BulkInsertFormSubmissionDocument = gql`
    mutation bulkInsertFormSubmission($formSubmissionInput: [FormSubmission_insert_input!]!) {
  insert_FormSubmission(
    objects: $formSubmissionInput
    on_conflict: {constraint: FormSubmission_pkey}
  ) {
    returning {
      id
    }
  }
}
    `;
export const BulkInsertInterimRecommendationDocument = gql`
    mutation bulkInsertInterimRecommendation($interinm_recommendation: [Interim_Recommendation_insert_input!]!) {
  insert_Interim_Recommendation(
    objects: $interinm_recommendation
    on_conflict: {constraint: Interim_Recommendation_pkey}
  ) {
    affected_rows
    returning {
      id
    }
  }
}
    `;
export const BulkInsertInterimAnswerDocument = gql`
    mutation bulkInsertInterimAnswer($interinm_input: [Interim_Answer_insert_input!]!) {
  insert_Interim_Answer(
    objects: $interinm_input
    on_conflict: {constraint: Interim_Answer_formFieldId_submissionId_questionId_key, update_columns: [data, updated_by, isDeleted]}
  ) {
    affected_rows
    returning {
      id
      formFieldId
      questionId
      data
    }
  }
}
    `;
export const BulkinsertOpsToIqCurationDocument = gql`
    mutation bulkinsertOPSToIQCuration($opsToIQCurationInsertInput: [OPSToIQCuration_insert_input!]!) {
  insert_OPSToIQCuration(
    objects: $opsToIQCurationInsertInput
    on_conflict: {constraint: OPSToIQCuration_pkey}
  ) {
    returning {
      id
      formInvitationId
    }
  }
}
    `;
export const BulkInsertQuestionsDocument = gql`
    mutation BulkInsertQuestions($objects: [Question_insert_input!]!) {
  insert_Question(
    objects: $objects
    on_conflict: {constraint: Question_pkey, update_columns: [sectionId, key, tags, content, weightage]}
  ) {
    affected_rows
    returning {
      id
      key
      content
      sectionId
      tags
      weightage
    }
  }
}
    `;
export const BulkInsertRecommendationCommentDocument = gql`
    mutation bulkInsertRecommendationComment($interim_recommendation: [Interim_Recommendation_insert_input!]!, $interim_comments: [Interim_Comments_insert_input!]!) {
  insert_Interim_Recommendation(
    objects: $interim_recommendation
    on_conflict: {constraint: Interim_Recommendation_pkey}
  ) {
    affected_rows
    returning {
      id
    }
  }
  insert_Interim_Comments(
    objects: $interim_comments
    on_conflict: {constraint: Interim_Comments_pkey}
  ) {
    affected_rows
    returning {
      id
    }
  }
}
    `;
export const BulkInsertSectionsDocument = gql`
    mutation BulkInsertSections($objects: [Section_insert_input!]!) {
  insert_Section(
    objects: $objects
    on_conflict: {constraint: Section_pkey, update_columns: [key, content, tags, sectionId, formId]}
  ) {
    affected_rows
    returning {
      id
      key
      content
      tags
      sectionId
      formId
    }
  }
}
    `;
export const Bulk_Insert_SourceFilesDocument = gql`
    mutation bulk_insert_sourceFiles($data: [SourceFiles_insert_input!]!) {
  insert_SourceFiles(objects: $data, on_conflict: {constraint: SourceFiles_pkey}) {
    returning {
      id
      error
      fileName
      filePath
      originalFileName
      originalFileUrl
      Sources {
        FormInvitation {
          id
          companyId
          formId
          Company {
            name
          }
          FormSubmissions(where: {isActive: {_eq: true}}, order_by: {updated_at: desc}) {
            id
          }
        }
        id
      }
    }
  }
}
    `;
export const BulkInsertSourcesDocument = gql`
    mutation BulkInsertSources($data: [Sources_insert_input!]!) {
  insert_Sources(objects: $data) {
    returning {
      id
      formInvitationId
      type
      url
      sourceFilesId
      created_at
      documentLogsId
    }
  }
}
    `;
export const BulkInsertSuggestionSourceMappingDocument = gql`
    mutation bulkInsertSuggestionSourceMapping($objects: [SuggestionSourceMapping_insert_input!]!) {
  insert_SuggestionSourceMapping(objects: $objects) {
    affected_rows
    returning {
      id
      suggestionId
      sourceId
      suggestionPageNo
      suggestionInfoContent
      created_at
    }
  }
}
    `;
export const BulkInsertSuggestionsDocument = gql`
    mutation bulkInsertSuggestions($objects: [Suggestions_insert_input!]!) {
  insert_Suggestions(objects: $objects) {
    affected_rows
    returning {
      id
      formFieldId
      formInvitationId
      isSelected
      selectedByUserId
      suggestion
      created_at
    }
  }
}
    `;
export const BulkinsertwebCurationDocument = gql`
    mutation bulkinsertwebCuration($webCurationInsertInput: [WebCuration_insert_input!]!) {
  insert_WebCuration(
    objects: $webCurationInsertInput
    on_conflict: {constraint: WebCurationLogs_pkey}
  ) {
    returning {
      id
      formInvitationId
    }
  }
}
    `;
export const BulkUpdateCompaniesWithUsersDocument = gql`
    mutation BulkUpdateCompaniesWithUsers($companyUpdate: [Company_updates!]!, $userUpdate: [User_updates!]!, $userroleUpdate: [UserRole_updates!]!, $parentCompanyMapping: [ParentCompanyMapping_updates!]!) {
  update_Company_many(updates: $companyUpdate) {
    returning {
      id
      name
      country
      details
      primaryContact
      parentCompanyId
      created_by
      updated_by
      created_at
      updated_at
      isActive
    }
  }
  update_User_many(updates: $userUpdate) {
    returning {
      id
      name
      email
      emailVerified
      details
      image
      companyId
      phone
      phoneVerified
      created_by
      updated_by
      created_at
      updated_at
      isActive
      UserRoles {
        roleName
      }
    }
  }
  update_UserRole_many(updates: $userroleUpdate) {
    returning {
      userId
      roleName
    }
  }
  update_ParentCompanyMapping_many(updates: $parentCompanyMapping) {
    returning {
      Id
      ParentCompanyId
    }
  }
}
    `;
export const Bulk_Update_Document_LogFilesDocument = gql`
    mutation bulk_update_document_logFiles($deletes: [DocumentLogs_updates!]!, $updates: [DocumentLogs_updates!]!) {
  delete_result: update_DocumentLogs_many(updates: $deletes) {
    affected_rows
    returning {
      id
      status
      error
      fileName
      fileUrl
      originalFileName
    }
  }
  update_result: update_DocumentLogs_many(updates: $updates) {
    affected_rows
    returning {
      id
      status
      error
      fileName
      fileUrl
      originalFileName
    }
  }
}
    `;
export const BulkUpdateInterimRecommendationByInterimAnswerIdDocument = gql`
    mutation bulkUpdateInterimRecommendationByInterimAnswerId($Interim_Recommendation: [Interim_Recommendation_updates!]!) {
  update_Interim_Recommendation_many(updates: $Interim_Recommendation) {
    returning {
      id
      status
    }
  }
}
    `;
export const BulkUpdateProcessingDataDocument = gql`
    mutation bulkUpdateProcessingData($AIBulkDocumentProcessingUpdate: [AIBulkDocumentProcessing_updates!]!) {
  update_AIBulkDocumentProcessing_many(updates: $AIBulkDocumentProcessingUpdate) {
    returning {
      id
    }
  }
}
    `;
export const BulkUpdateSourceAndSourcesDocument = gql`
    mutation bulkUpdateSourceAndSources($SourceFiles: [SourceFiles_updates!]!, $Sources: [Sources_updates!]!) {
  update_SourceFiles_many(updates: $SourceFiles) {
    returning {
      id
      status
      originalFileUrl
      fileName
      originalFileName
      Sources {
        FormInvitation {
          id
          companyId
          formId
        }
        id
      }
    }
  }
  update_Sources_many(updates: $Sources) {
    returning {
      id
    }
  }
}
    `;
export const BulkUpdateSourceFilesDocument = gql`
    mutation bulkUpdateSourceFiles($SourceFiles: [SourceFiles_updates!]!) {
  update_SourceFiles_many(updates: $SourceFiles) {
    returning {
      id
      status
    }
  }
}
    `;
export const BulkUpdateSuggestionsDocument = gql`
    mutation bulkUpdateSuggestions($suggestionData: [Suggestions_updates!]!) {
  update_Suggestions_many(updates: $suggestionData) {
    returning {
      id
      formInvitationId
      formFieldId
    }
  }
}
    `;
export const BulkUpsertAnswerforAiDocument = gql`
    mutation bulkUpsertAnswerforAI($submissionId: uuid, $answerData: [Answer_insert_input!]!) {
  delete_Answer(where: {_and: [{submissionId: {_eq: $submissionId}}]}) {
    affected_rows
  }
  insert_Answer(objects: $answerData, on_conflict: {constraint: Answer_pkey}) {
    affected_rows
    returning {
      id
      submissionId
      formFieldId
    }
  }
}
    `;
export const BulkUpsertReviewerDetailsMappingDocument = gql`
    mutation BulkUpsertReviewerDetailsMapping($objects: [ReviewerDetailsMapping_insert_input!]!) {
  insert_ReviewerDetailsMapping(
    objects: $objects
    on_conflict: {constraint: ReviewerDetailsMapping_pkey, update_columns: [currentStatus, updated_by]}
  ) {
    affected_rows
    returning {
      id
      currentStatus
      questionId
      FormInvitationId
    }
  }
}
    `;
export const BulkUpsertValidationWarningLogsDocument = gql`
    mutation bulkUpsertValidationWarningLogs($ValidationWarningLogs: [ValidationWarningLogs_insert_input!]!, $ValidationWarningLogsupdate: [ValidationWarningLogs_updates!]!) {
  insert_ValidationWarningLogs(
    objects: $ValidationWarningLogs
    on_conflict: {constraint: ValidationWarningLogs_pkey}
  ) {
    affected_rows
    returning {
      Id
    }
  }
  update_ValidationWarningLogs_many(updates: $ValidationWarningLogsupdate) {
    returning {
      Id
    }
  }
}
    `;
export const CreateParentCompanyMappingDocument = gql`
    mutation createParentCompanyMapping($input: [ParentCompanyMapping_insert_input!]!) {
  insert_ParentCompanyMapping(
    objects: $input
    on_conflict: {constraint: ParentCompanyMapping_pkey}
  ) {
    returning {
      Id
      CompanyId
      ParentCompanyId
      User {
        id
        email
      }
    }
  }
}
    `;
export const CreateAiChatUsageDocument = gql`
    mutation CreateAIChatUsage($subscriptionId: uuid!, $companyId: uuid!, $allocationId: uuid, $textualUsed: Int!, $graphicalUsed: Int!, $metadata: jsonb) {
  insert_AIChatUsage_one(
    object: {subscriptionId: $subscriptionId, companyId: $companyId, allocationId: $allocationId, textualUsed: $textualUsed, graphicalUsed: $graphicalUsed, metadata: $metadata, createdAt: "now()", updatedAt: "now()"}
  ) {
    id
    subscriptionId
    companyId
    allocationId
    textualUsed
    graphicalUsed
    metadata
    createdAt
    updatedAt
  }
}
    `;
export const CreateCompanyDocument = gql`
    mutation createCompany($input: [Company_insert_input!]!) {
  insert_Company(objects: $input, on_conflict: {constraint: Company_name_key}) {
    returning {
      id
      name
      primaryContact
      details
      parentCompanyId
      platformId
      created_by
      updated_by
      country
    }
  }
}
    `;
export const CreateFormSubmissionDocument = gql`
    mutation createFormSubmission($invitationId: uuid!) {
  insert_FormSubmission_one(object: {invitationId: $invitationId, isActive: true}) {
    id
  }
}
    `;
export const CreateUserDocument = gql`
    mutation createUser($input: [User_insert_input!]!) {
  insert_User(objects: $input, on_conflict: {constraint: User_email_key}) {
    affected_rows
    returning {
      id
      name
      email
      emailVerified
      phone
      phoneVerified
      image
      details
      companyId
      created_by
      updated_by
      UserRoles {
        roleName
        Role {
          id
          isActive
        }
      }
    }
  }
}
    `;
export const DeleteAddressDetailsDocument = gql`
    mutation DeleteAddressDetails($id: uuid, $IsActive: Boolean) {
  update_Addresses(_set: {IsActive: $IsActive}, where: {id: {_eq: $id}}) {
    returning {
      id
      IsActive
    }
  }
}
    `;
export const DeleteAnswersBySubmissionIdDocument = gql`
    mutation DeleteAnswersBySubmissionId($SubmissionId: uuid!) {
  delete_Answer(where: {submissionId: {_eq: $SubmissionId}}) {
    affected_rows
    returning {
      id
    }
  }
}
    `;
export const DeleteCompanyDetailsByIdDocument = gql`
    mutation deleteCompanyDetailsById($id: uuid) {
  update_Company(where: {id: {_eq: $id}}, _set: {isActive: false}) {
    affected_rows
    returning {
      id
      name
      primaryContact
      details
      parentCompanyId
      platformId
      created_by
      updated_by
      country
      isActive
    }
  }
}
    `;
export const DeleteFormfieldByFormIdDocument = gql`
    mutation DeleteFormfieldByFormId($formid: uuid!) {
  delete_FormField(where: {formId: {_eq: $formid}}) {
    affected_rows
    returning {
      id
    }
  }
}
    `;
export const DeleteInterimFormLogsByQuestionIdsDocument = gql`
    mutation DeleteInterimFormLogsByQuestionIds($questionIds: [uuid!]!) {
  delete_InterimFormLogs(where: {questionId: {_in: $questionIds}}) {
    affected_rows
  }
}
    `;
export const DeleteQuestionsByFormIdDocument = gql`
    mutation DeleteQuestionsByFormId($formId: uuid!) {
  update_Question(
    where: {Section: {formId: {_eq: $formId}}}
    _set: {parentQuestionId: null}
  ) {
    affected_rows
  }
  delete_Question(where: {Section: {formId: {_eq: $formId}}}) {
    affected_rows
  }
}
    `;
export const DeleteQuestionsBySectionIdDocument = gql`
    mutation DeleteQuestionsBySectionId($SectionId: [uuid!]) {
  delete_Question(where: {sectionId: {_in: $SectionId}}) {
    affected_rows
    returning {
      id
    }
  }
}
    `;
export const DeleteSectionsByFormIdDocument = gql`
    mutation DeleteSectionsByFormId($formid: uuid!) {
  delete_Section(where: {formId: {_eq: $formid}}) {
    affected_rows
    returning {
      id
    }
  }
}
    `;
export const DeleteUserDetailByIdDocument = gql`
    mutation deleteUserDetailById($id: uuid) {
  update_User(where: {id: {_eq: $id}}, _set: {isActive: false}) {
    affected_rows
    returning {
      id
      name
      email
      emailVerified
      phone
      phoneVerified
      image
      details
      companyId
      created_by
      updated_by
      isActive
    }
  }
}
    `;
export const InsertAddressDocument = gql`
    mutation insertAddress($addressLine1: String!, $addressLine2: String, $addressLine3: String, $poBoxNumber: String, $city: uuid!, $country: uuid!, $state: uuid!, $zipcode: String, $phoneNo: String, $landMark: String, $isDefault: Boolean, $gstNumber: String, $companyId: uuid!, $ownershipType: String, $addresstype: jsonb!, $addressLable: String) {
  insert_Addresses(
    objects: {addressLine1: $addressLine1, addressLine2: $addressLine2, addressLine3: $addressLine3, poBoxNumber: $poBoxNumber, city: $city, country: $country, isDefault: $isDefault, landMark: $landMark, companyId: $companyId, state: $state, zipcode: $zipcode, phoneNo: $phoneNo, gstNumber: $gstNumber, ownershipType: $ownershipType, addressType: $addresstype, addressLable: $addressLable}
  ) {
    returning {
      id
      addressLine1
      addressLine2
      addressLine3
    }
  }
}
    `;
export const InsertAssesseeUserMappingDocument = gql`
    mutation insertAssesseeUserMapping($object: [AssesseeUserMapping_insert_input!]!) {
  insert_AssesseeUserMapping(
    objects: $object
    on_conflict: {constraint: AssesseeUserMapping_pkey}
  ) {
    returning {
      id
      parentCompanyMappingId
      userId
      parentUserId
      questionId
      formId
      InvitationId
      IsActive
    }
  }
}
    `;
export const InsertcompanyformfundtypeDocument = gql`
    mutation insertcompanyformfundtype($object: [CompanyFormFundtype_insert_input!]!) {
  insert_CompanyFormFundtype(
    objects: $object
    on_conflict: {constraint: CompanyFormFundtype_pkey}
  ) {
    returning {
      id
    }
  }
}
    `;
export const InsertCompanyDocument = gql`
    mutation InsertCompany($insertObject: [Company_insert_input!]!, $updateObject: [Company_updates!]!) {
  insert_Company(objects: $insertObject, on_conflict: {constraint: Company_pkey}) {
    returning {
      id
      name
      primaryContact
      metadata
    }
  }
  update_Company_many(updates: $updateObject) {
    affected_rows
    returning {
      id
      name
      primaryContact
      metadata
    }
  }
}
    `;
export const Insert_EmailNotificationsDocument = gql`
    mutation insert_EmailNotifications($emailData: [EmailNotifications_insert_input!]!) {
  insert_EmailNotifications(
    objects: $emailData
    on_conflict: {constraint: EmailNotifications_pkey}
  ) {
    returning {
      id
    }
  }
}
    `;
export const InsertFormFieldOneDocument = gql`
    mutation InsertFormFieldOne($object: FormField_insert_input!) {
  insert_FormField_one(object: $object) {
    id
    formId
    sectionId
    questionId
    field
    type
    interface
    seqIndex
    dataPoint
    subtheme
    created_at
    updated_at
  }
}
    `;
export const InsertFormFieldDocument = gql`
    mutation InsertFormField($objects: [FormField_insert_input!]!) {
  insert_FormField(objects: $objects) {
    returning {
      id
      formId
      sectionId
      questionId
      field
      type
      interface
      seqIndex
      dataPoint
      subtheme
      created_at
      updated_at
    }
    affected_rows
  }
}
    `;
export const InsertFormInvitationNewCompanyDocument = gql`
    mutation InsertFormInvitationNewCompany($object: [FormInvitation_insert_input!]!) {
  insert_FormInvitation(
    objects: $object
    on_conflict: {constraint: FormInvitation_pkey}
  ) {
    returning {
      id
      email
      companyId
      formId
      status
      interimCheck
      reviewerDetails
      Form {
        id
        name
      }
    }
  }
}
    `;
export const InsertFormInvitationDocument = gql`
    mutation InsertFormInvitation($object: [FormInvitation_insert_input!]!, $companyId: uuid!) {
  insert_FormInvitation(
    objects: $object
    on_conflict: {constraint: FormInvitation_pkey}
  ) {
    returning {
      id
      companyId
      email
      formId
      status
      interimCheck
      Form {
        id
        name
      }
    }
  }
  update_ParentCompanyMapping(
    _set: {isActive: false}
    where: {_and: [{CompanyId: {_eq: $companyId}}, {ParentCompanyId: {_is_null: true}}]}
  ) {
    affected_rows
  }
}
    `;
export const InsertFormDetailsOneDocument = gql`
    mutation InsertFormDetailsOne($formid: uuid!, $framework: String!, $focusArea: jsonb!, $timeInMinutes: Int!, $bodyTemplate: String!, $questions: Int!) {
  insert_FormDetails_one(
    object: {formId: $formid, framework: $framework, focusArea: $focusArea, timeInMinutes: $timeInMinutes, bodyTemplate: $bodyTemplate, questions: $questions}
  ) {
    id
    formId
  }
}
    `;
export const InsertInterimFormLogsDocument = gql`
    mutation insertInterimFormLogs($input: [InterimFormLogs_insert_input!]!) {
  insert_InterimFormLogs(objects: $input) {
    returning {
      id
      questionId
      score
      status
    }
  }
}
    `;
export const InsertIntoInterimCommentsDocument = gql`
    mutation insertIntoInterimComments($interim_recommendation_id: uuid, $comments: String, $upload_document: String!, $filename: String!, $userId: uuid, $status: String, $recommendationId: uuid, $isApproved: Boolean, $invitationId: uuid) {
  insert_Interim_Comments(
    on_conflict: {constraint: Interim_Comments_pkey}
    objects: {comments: $comments, filename: $filename, upload_document: $upload_document, interim_recommendation_id: $interim_recommendation_id, created_by: $userId, updated_by: $userId, invitationId: $invitationId}
  ) {
    returning {
      id
      comments
    }
  }
  update_Interim_Recommendation(
    _set: {status: $status, isApproved: $isApproved, updated_at: now}
    where: {id: {_eq: $recommendationId}}
  ) {
    affected_rows
  }
}
    `;
export const InsertIntoSubmissionTableDocument = gql`
    mutation insertIntoSubmissionTable($FormSubmissionInput: [FormSubmission_insert_input!]!) {
  insert_FormSubmission(
    objects: $FormSubmissionInput
    on_conflict: {constraint: FormSubmission_pkey}
  ) {
    affected_rows
    returning {
      FormInvitation {
        id
        interimCheck
        companyId
      }
      id
    }
  }
}
    `;
export const InsertFormInvitationCommentDocument = gql`
    mutation InsertFormInvitationComment($companyId: uuid, $content: String, $invitationId: uuid, $userId: uuid, $formFieldId: uuid!, $status: String) {
  insert_InvitationComment(
    on_conflict: {constraint: InvitationComment_pkey}
    objects: {companyId: $companyId, content: $content, invitationId: $invitationId, userId: $userId, formFieldId: $formFieldId}
  ) {
    returning {
      id
      content
      FormInvitation {
        InvitationComments_aggregate(where: {formFieldId: {_eq: $formFieldId}}) {
          aggregate {
            count
          }
        }
      }
    }
  }
  update_FormInvitation(
    where: {companyId: {_eq: $companyId}, id: {_eq: $invitationId}}
    _set: {status: $status, updated_by: $userId, updated_at: "now()"}
  ) {
    returning {
      id
    }
  }
}
    `;
export const InsertInvitationConsultantMappingDocument = gql`
    mutation insertInvitationConsultantMapping($object: [InvitationConsultantMapping_insert_input!]!) {
  insert_InvitationConsultantMapping(
    objects: $object
    on_conflict: {constraint: InvitationConsultantMapping_pkey}
  ) {
    returning {
      id
      invitationId
      consultantUserId
      consultantCompanyId
    }
  }
}
    `;
export const InsertMakerCheckerRemarkDocument = gql`
    mutation InsertMakerCheckerRemark($reviewerDetailsMappingId: uuid!, $remark: String!, $status: String!, $createdBy: uuid!, $Ismailsent: Boolean!) {
  insert_MakerCheckerRemarks_one(
    object: {ReviewerDetailsMappingId: $reviewerDetailsMappingId, remark: $remark, status: $status, created_by: $createdBy, Ismailsent: $Ismailsent}
  ) {
    id
    remark
    status
  }
}
    `;
export const InsertQuestionnaireLogDocument = gql`
    mutation InsertQuestionnaireLog($formid: uuid!, $form_title: String, $form_description: String, $number_of_questions: String, $time_in_minutes: String, $form_type: String, $file_url: String, $created_by: uuid!, $event_type: String!) {
  insert_newformslogs_one(
    object: {formid: $formid, form_title: $form_title, form_description: $form_description, number_of_questions: $number_of_questions, time_in_minutes: $time_in_minutes, form_type: $form_type, file_url: $file_url, created_by: $created_by, event_type: $event_type}
  ) {
    id
    formid
    form_title
    form_description
    number_of_questions
    time_in_minutes
    form_type
    file_url
    created_by
    created_at
    event_type
  }
}
    `;
export const InsertQuestionnaireDocument = gql`
    mutation InsertQuestionnaire($title: String!, $description: String!, $type: String!, $formtype: String!) {
  insert_Form_one(
    object: {title: $title, name: $title, description: $description, type: $type, created_at: "now()", updated_at: "now()", formtype: $formtype}
  ) {
    id
    name
    title
    description
    type
    tags
    created_at
    updated_at
    __typename
  }
}
    `;
export const InsertRaraValidationAndRatingDocument = gql`
    mutation insertRaraValidationAndRating($object: [RaraValidationAndRating_insert_input!]!) {
  insert_RaraValidationAndRating(objects: $object) {
    affected_rows
  }
}
    `;
export const InsertRecommendationReminderEmailsDocument = gql`
    mutation insertRecommendationReminderEmails($emailId: String!, $ccEmailId: String!, $subject: String!, $invitationId: uuid, $bccEmailId: String) {
  insert_EmailNotifications(
    objects: {emailId: $emailId, ccEmailId: $ccEmailId, subject: $subject, invitationId: $invitationId, bccEmailId: $bccEmailId}
  ) {
    affected_rows
    returning {
      id
      emailId
    }
  }
}
    `;
export const InsertRecommendationDocument = gql`
    mutation insertRecommendation($recommendationsData: [Interim_Recommendation_insert_input!]!) {
  insert_Interim_Recommendation(objects: $recommendationsData) {
    affected_rows
    returning {
      id
      interim_answer_id
      recommendations
      expectedDate
    }
  }
}
    `;
export const InsertReviewerDetailsMappingDocument = gql`
    mutation InsertReviewerDetailsMapping($questionId: uuid!, $currentStatus: String!, $createdBy: uuid!, $updatedBy: uuid!, $formInvitationId: uuid!) {
  insert_ReviewerDetailsMapping_one(
    object: {questionId: $questionId, currentStatus: $currentStatus, created_by: $createdBy, updated_by: $updatedBy, FormInvitationId: $formInvitationId}
  ) {
    id
    currentStatus
    questionId
    FormInvitationId
  }
}
    `;
export const Reopen_InvitationDocument = gql`
    mutation reopen_invitation($companyId: uuid, $invitationId: uuid, $userId: uuid, $status: String) {
  update_FormInvitation(
    where: {companyId: {_eq: $companyId}, id: {_eq: $invitationId}}
    _set: {status: $status, updated_by: $userId, updated_at: "now()"}
  ) {
    returning {
      id
    }
  }
}
    `;
export const StartNewSubmissionByInvitationIdDocument = gql`
    mutation startNewSubmissionByInvitationId($invitationId: uuid!) {
  update_FormInvitation(
    _set: {status: "Draft"}
    where: {_and: [{id: {_eq: $invitationId}}, {status: {_eq: "Invited"}}]}
  ) {
    affected_rows
  }
}
    `;
export const UpdateUserResetPasswordFlagDocument = gql`
    mutation updateUserResetPasswordFlag($id: uuid!) {
  update_User(where: {id: {_eq: $id}}, _set: {IsPasswordReset: true}) {
    affected_rows
  }
}
    `;
export const UpdateValidationWarningLogsDocument = gql`
    mutation updateValidationWarningLogs($formfieldId: uuid, $invitationId: uuid) {
  update_ValidationWarningLogs(
    _set: {IsActive: false}
    where: {_and: [{formFieldId: {_eq: $formfieldId}}, {InvitationId: {_eq: $invitationId}}]}
  ) {
    affected_rows
  }
}
    `;
export const UpdateAddressDocument = gql`
    mutation UpdateAddress($id: uuid!, $addressLine1: String!, $addressLine2: String, $addressLine3: String, $poBoxNumber: String, $city: uuid!, $country: uuid!, $state: uuid!, $zipcode: String, $phoneNo: String, $landMark: String, $isDefault: Boolean, $gstNumber: String, $companyId: uuid!, $ownershipType: String, $addresstype: jsonb!, $IsActive: Boolean, $addressLable: String) {
  update_Addresses(
    _set: {addressLine1: $addressLine1, addressLine2: $addressLine2, addressLine3: $addressLine3, poBoxNumber: $poBoxNumber, city: $city, country: $country, state: $state, zipcode: $zipcode, phoneNo: $phoneNo, landMark: $landMark, isDefault: $isDefault, gstNumber: $gstNumber, companyId: $companyId, ownershipType: $ownershipType, addressType: $addresstype, IsActive: $IsActive, addressLable: $addressLable}
    where: {id: {_eq: $id}}
  ) {
    returning {
      id
      addressLine1
      addressLine2
      addressLine3
    }
  }
}
    `;
export const UpdateSubscriptionMetadataDocument = gql`
    mutation UpdateSubscriptionMetadata($id: uuid!, $metadata: jsonb!) {
  update_AIChatSubscription(where: {id: {_eq: $id}}, _set: {metadata: $metadata}) {
    affected_rows
    returning {
      id
      metadata
      updatedAt
    }
  }
}
    `;
export const UpdateAiChatUsageDocument = gql`
    mutation UpdateAIChatUsage($id: uuid!, $textualUsed: Int!, $graphicalUsed: Int!, $metadata: jsonb) {
  update_AIChatUsage_by_pk(
    pk_columns: {id: $id}
    _set: {textualUsed: $textualUsed, graphicalUsed: $graphicalUsed, metadata: $metadata, updatedAt: "now()"}
  ) {
    id
    subscriptionId
    companyId
    allocationId
    textualUsed
    graphicalUsed
    metadata
    updatedAt
  }
}
    `;
export const UpdateAnswerDocument = gql`
    mutation updateAnswer($AnswerUpdate: [Answer_updates!]!) {
  update_Answer_many(updates: $AnswerUpdate) {
    returning {
      id
      questionId
      submissionId
    }
  }
}
    `;
export const UpdateAnswerIdinInterimAnswerDocument = gql`
    mutation updateAnswerIdinInterimAnswer($InterimAnswerUpdate: [Interim_Answer_updates!]!, $oldSubmissionId: uuid) {
  update_Interim_Answer_many(updates: $InterimAnswerUpdate) {
    returning {
      id
      answerId
    }
  }
  update_Interim_Answer(
    _set: {isViewOnly: true}
    where: {submissionId: {_eq: $oldSubmissionId}}
  ) {
    affected_rows
    returning {
      id
    }
  }
}
    `;
export const UpdateAssesseeUserMappingbyInvitationIdDocument = gql`
    mutation UpdateAssesseeUserMappingbyInvitationId($invitationId: uuid!, $invitationStatus: String!, $userId: uuid!, $questionId: uuid!, $updatedAt: timestamptz!) {
  update_AssesseeUserMapping(
    _set: {Status: $invitationStatus, updated_by: $userId, updated_at: $updatedAt}
    where: {_and: [{InvitationId: {_eq: $invitationId}}, {questionId: {_eq: $questionId}}]}
  ) {
    affected_rows
  }
}
    `;
export const UpdateAssesseeUserMappingForResponderDocument = gql`
    mutation UpdateAssesseeUserMappingForResponder($invitationId: uuid!, $invitationStatus: String!, $userId: uuid!, $questionId: uuid!, $isResponder: Boolean, $updatedAt: timestamptz!, $responderStatus: String!) {
  update_AssesseeUserMapping(
    _set: {Status: $invitationStatus, updated_by: $userId, IsResponder: $isResponder, updated_at: $updatedAt, ResponderStatus: $responderStatus}
    where: {_and: [{InvitationId: {_eq: $invitationId}}, {questionId: {_eq: $questionId}}]}
  ) {
    affected_rows
  }
}
    `;
export const UpdateAssesseeUserMappingResponderStatusByResponderDocument = gql`
    mutation UpdateAssesseeUserMappingResponderStatusByResponder($invitationId: uuid!, $userId: uuid!, $ResponderStatus: String!, $updatedAt: timestamptz!) {
  update_AssesseeUserMapping(
    _set: {updated_by: $userId, updated_at: $updatedAt, ResponderStatus: $ResponderStatus}
    where: {_and: [{InvitationId: {_eq: $invitationId}}, {userId: {_eq: $userId}}]}
  ) {
    affected_rows
  }
}
    `;
export const UpdateCompanyDetailsDocument = gql`
    mutation updateCompanyDetails($companyId: uuid!, $IsManufacturing: Boolean, $metadata: jsonb!) {
  update_Company(
    _set: {metadata: $metadata, IsManufacturing: $IsManufacturing}
    where: {id: {_eq: $companyId}}
  ) {
    returning {
      id
      IsManufacturing
      parentCompanyId
    }
  }
}
    `;
export const UpdateCompanyPrimaryContactDocument = gql`
    mutation UpdateCompanyPrimaryContact($companyId: uuid, $primaryContact: jsonb!) {
  update_Company(
    _set: {primaryContact: $primaryContact}
    where: {id: {_eq: $companyId}}
  ) {
    returning {
      id
      primaryContact
    }
  }
}
    `;
export const UpdateCompanyDetailByIdDocument = gql`
    mutation updateCompanyDetailById($input: [Company_updates!]!) {
  update_Company_many(updates: $input) {
    affected_rows
    returning {
      id
      name
      primaryContact
      details
      parentCompanyId
      platformId
      created_by
      updated_by
      country
      isActive
    }
  }
}
    `;
export const UpdateCompletionPercentageDocument = gql`
    mutation updateCompletionPercentage($invitationId: uuid!, $completionPercentage: String!) {
  update_FormInvitation(
    _set: {completion: $completionPercentage}
    where: {id: {_eq: $invitationId}}
  ) {
    affected_rows
    returning {
      id
      status
    }
  }
}
    `;
export const UpdateFormCalcDocument = gql`
    mutation updateFormCalc($calc: json!) {
  update_Form(
    _set: {calc: $calc}
    where: {id: {_eq: "0d4655d1-b58b-4d52-826d-d28f8a5514c6"}}
  ) {
    returning {
      calc
    }
  }
}
    `;
export const UpdateFormInvitationByCompanyIdAndFormIdDocument = gql`
    mutation updateFormInvitationByCompanyIdAndFormId($invitationId: [uuid!], $companyid: [uuid!], $formId: uuid!) {
  update_FormInvitation_many(
    updates: {where: {id: {_in: $invitationId}}, _set: {formId: $formId}}
  ) {
    affected_rows
  }
  update_CompanyFormFundtype_many(
    updates: {where: {companyId: {_in: $companyid}}, _set: {formId: $formId}}
  ) {
    affected_rows
  }
}
    `;
export const UpdateFormInvitationMetadataDocument = gql`
    mutation updateFormInvitationMetadata($formInvitationId: uuid!, $status: String!, $metadata: jsonb) {
  update_FormInvitation(
    where: {id: {_eq: $formInvitationId}}
    _set: {metadata: $metadata, status: $status}
  ) {
    returning {
      id
      status
      metadata
    }
  }
  insert_FormSubmission_one(
    object: {invitationId: $formInvitationId, isActive: true}
  ) {
    id
  }
}
    `;
export const UpdateFormInvitationStatusDocument = gql`
    mutation updateFormInvitationStatus($invitationId: uuid!, $invitationStatus: String!) {
  update_FormInvitation(
    _set: {status: $invitationStatus}
    where: {id: {_eq: $invitationId}}
  ) {
    affected_rows
    returning {
      id
      status
    }
  }
}
    `;
export const UpdateFormInvitationDocument = gql`
    mutation updateFormInvitation($invitationId: uuid!, $set: FormInvitation_set_input!) {
  update_FormInvitation(_set: $set, where: {id: {_eq: $invitationId}}) {
    affected_rows
    returning {
      id
      status
      metadata
    }
  }
}
    `;
export const UpdateFormSubmissionStatusDocument = gql`
    mutation updateFormSubmissionStatus($submissionId: uuid!, $status: String!) {
  update_FormSubmission_by_pk(
    pk_columns: {id: $submissionId}
    _set: {status: $status}
  ) {
    id
    status
  }
}
    `;
export const UpdateFormInvitationInterimCheckByIdDocument = gql`
    mutation updateFormInvitationInterimCheckById($InvitationId: uuid, $InterimCheck: jsonb!, $Completion: String) {
  update_FormInvitation(
    where: {id: {_eq: $InvitationId}}
    _set: {interimCheck: $InterimCheck, completion: $Completion}
  ) {
    returning {
      id
    }
  }
}
    `;
export const UpdateFormInvitationStatusBulkbyIdDocument = gql`
    mutation updateFormInvitationStatusBulkbyId($formInvitationUpdateData: [FormInvitation_updates!]!, $webCurationUpdateData: [WebCuration_updates!]!, $aiBulkDocumentProcessingUpdateData: [AIBulkDocumentProcessing_updates!]!, $opsCurationUpdateData: [OPSToIQCuration_updates!]!) {
  update_FormInvitation_many(updates: $formInvitationUpdateData) {
    returning {
      id
      status
      formId
      companyId
      ParentCompanyMapping {
        ParentCompanyId
        companyByParentcompanyid {
          platformId
        }
      }
      Form {
        id
        formtype
      }
    }
  }
  update_WebCuration_many(updates: $webCurationUpdateData) {
    returning {
      id
      formInvitationId
      status
    }
  }
  update_AIBulkDocumentProcessing_many(
    updates: $aiBulkDocumentProcessingUpdateData
  ) {
    returning {
      id
      formInvitationId
      requestStatus
    }
  }
  update_OPSToIQCuration_many(updates: $opsCurationUpdateData) {
    returning {
      id
      formInvitationId
      status
    }
  }
}
    `;
export const UpdateInterimAnswerByQuestionIdAndSubmissionIdDocument = gql`
    mutation updateInterimAnswerByQuestionIdAndSubmissionId($Interim_AnswerUpdate: [Interim_Answer_updates!]!) {
  update_Interim_Answer_many(updates: $Interim_AnswerUpdate) {
    returning {
      id
      questionId
      submissionId
      status
      data
      interim_answer_id
      FormField {
        interface
      }
      Interim_Recommendations {
        id
        status
        answeroption
      }
      Interim_Answer {
        id
        interim_answer_id
        Interim_Recommendations {
          id
          status
          answeroption
        }
      }
    }
  }
}
    `;
export const UpdateInterimAnswerDocument = gql`
    mutation updateInterimAnswer($interimAnswerId: uuid!, $answerData: jsonb!) {
  update_Interim_Answer(
    where: {id: {_eq: $interimAnswerId}}
    _set: {data: $answerData}
  ) {
    affected_rows
  }
}
    `;
export const UpdateInterimRecommendationByInterimAnswerIdDocument = gql`
    mutation updateInterimRecommendationByInterimAnswerId($interimAnswerId: uuid!, $status: String!) {
  update_Interim_Recommendation(
    where: {interim_answer_id: {_eq: $interimAnswerId}}
    _set: {status: $status}
  ) {
    affected_rows
  }
}
    `;
export const UpdateInvitationToDraftByInvitationIdDocument = gql`
    mutation updateInvitationToDraftByInvitationId($invitationId: [uuid!]!) {
  update_FormInvitation(
    _set: {status: "Draft"}
    where: {_and: [{id: {_in: $invitationId}}, {status: {_eq: "Invited"}}]}
  ) {
    affected_rows
  }
}
    `;
export const UpdateIsEmailSubscribedDocument = gql`
    mutation updateIsEmailSubscribed($emailId: String, $isEmailSubscribed: Boolean) {
  update_User(
    where: {email: {_eq: $emailId}}
    _set: {isEmailSubscribed: $isEmailSubscribed}
  ) {
    affected_rows
  }
}
    `;
export const UpdateMakerCheckerRemarksDocument = gql`
    mutation UpdateMakerCheckerRemarks($where: MakerCheckerRemarks_bool_exp!, $_set: MakerCheckerRemarks_set_input!) {
  update_MakerCheckerRemarks(where: $where, _set: $_set) {
    affected_rows
  }
}
    `;
export const UpdateMultipleSelectInterfaceOptionsChoicesDocument = gql`
    mutation updateMultipleSelectInterfaceOptionsChoices($id: uuid!, $input: jsonb) {
  update_FormField(where: {id: {_eq: $id}}, _set: {interfaceOptions: $input}) {
    returning {
      id
      interfaceOptions
    }
  }
}
    `;
export const UpdateNewSubmissionByInvitationIdDocument = gql`
    mutation updateNewSubmissionByInvitationId($invitationId: uuid!, $formId: uuid!, $metadata: jsonb!, $companyId: uuid!, $isManufacturing: Boolean!) {
  update_FormInvitation(
    _set: {formId: $formId}
    where: {_and: [{id: {_eq: $invitationId}}]}
  ) {
    affected_rows
  }
  update_Company(
    _set: {metadata: $metadata, IsManufacturing: $isManufacturing}
    where: {_and: [{id: {_eq: $companyId}}]}
  ) {
    affected_rows
  }
  update_CompanyFormFundtype(
    where: {companyId: {_eq: $companyId}}
    _set: {formId: $formId}
  ) {
    affected_rows
  }
}
    `;
export const UpdateParentCompanyMappingbyCompanyIdDocument = gql`
    mutation UpdateParentCompanyMappingbyCompanyId($companyId: uuid!) {
  update_ParentCompanyMapping(
    _set: {isActive: false}
    where: {_and: [{CompanyId: {_eq: $companyId}}, {ParentCompanyId: {_is_null: true}}]}
  ) {
    affected_rows
  }
}
    `;
export const UpdateParentCompanyMappingbyIdDocument = gql`
    mutation UpdateParentCompanyMappingbyId($parentCompanyId: uuid!, $companyId: uuid!) {
  update_ParentCompanyMapping(
    _set: {isActive: false}
    where: {_and: [{CompanyId: {_eq: $companyId}}, {ParentCompanyId: {_eq: $parentCompanyId}}]}
  ) {
    affected_rows
  }
}
    `;
export const UpdateRecommendationStatusDocument = gql`
    mutation updateRecommendationStatus($status: String, $recommendationId: uuid, $isApproved: Boolean) {
  update_Interim_Recommendation(
    _set: {status: $status, isApproved: $isApproved}
    where: {id: {_eq: $recommendationId}}
  ) {
    affected_rows
    returning {
      id
      status
    }
  }
}
    `;
export const UpdateTimestampAfterEmailSendDocument = gql`
    mutation updateTimestampAfterEmailSend($id: [uuid!]!, $reminderIntervalAfterDueDate: timestamp!) {
  updateTimestampAfterEmailSend: update_Interim_Recommendation(
    where: {id: {_in: $id}}
    _set: {ReminderIntervalAfterDueDate: $reminderIntervalAfterDueDate}
  ) {
    affected_rows
  }
}
    `;
export const UpdateReviewerDetailsMappingDocument = gql`
    mutation UpdateReviewerDetailsMapping($id: uuid!, $currentStatus: String!, $updatedBy: uuid!) {
  update_ReviewerDetailsMapping_by_pk(
    pk_columns: {id: $id}
    _set: {currentStatus: $currentStatus, updated_by: $updatedBy}
  ) {
    id
    currentStatus
    questionId
    FormInvitationId
  }
}
    `;
export const UpdateSkipStatusByInvitationIdDocument = gql`
    mutation updateSkipStatusByInvitationId($status: Boolean, $formInvitationId: uuid!, $invitationStatus: String!) {
  update_FormInvitation(
    where: {id: {_eq: $formInvitationId}}
    _set: {status: $invitationStatus}
  ) {
    returning {
      id
      status
    }
  }
  insert_FormSubmission_one(
    object: {invitationId: $formInvitationId, isActive: true}
  ) {
    id
  }
}
    `;
export const UpdateSourcesByIdDocument = gql`
    mutation updateSourcesById($id: uuid!, $_set: Sources_set_input!) {
  update_Sources_by_pk(pk_columns: {id: $id}, _set: $_set) {
    id
    sourceFilesId
    updated_at
  }
}
    `;
export const UpdateSubmissionStatusForInProgressDocument = gql`
    mutation updateSubmissionStatusForInProgress($submissionId: uuid!, $submissionStatus: String!) {
  update_FormSubmission_by_pk(
    pk_columns: {id: $submissionId}
    _set: {status: $submissionStatus, remarks: $submissionStatus}
  ) {
    id
    invitationId
    status
  }
}
    `;
export const UpdateSubmissionStatusDocument = gql`
    mutation updateSubmissionStatus($submissionId: uuid!, $submissionStatus: String!) {
  update_FormSubmission_by_pk(
    pk_columns: {id: $submissionId}
    _set: {status: $submissionStatus}
  ) {
    id
    invitationId
    status
  }
}
    `;
export const UpdateUserAllocationMetadataDocument = gql`
    mutation UpdateUserAllocationMetadata($id: uuid!, $metadata: jsonb!) {
  update_AIChatUserAllocation(
    where: {id: {_eq: $id}}
    _set: {metadata: $metadata}
  ) {
    affected_rows
    returning {
      id
      metadata
      updatedAt
    }
  }
}
    `;
export const UpdateUserDetailByIdDocument = gql`
    mutation updateUserDetailById($input: [User_updates!]!) {
  update_User_many(updates: $input) {
    affected_rows
    returning {
      id
      name
      email
      emailVerified
      phone
      phoneVerified
      image
      details
      companyId
      created_by
      updated_by
      isActive
    }
  }
}
    `;
export const UpdateStatusOfEmailDocument = gql`
    mutation updateStatusOfEmail($emailData: [EmailNotifications_updates!]!) {
  update_EmailNotifications_many(updates: $emailData) {
    returning {
      id
    }
  }
}
    `;
export const UpsertAnswerDocument = gql`
    mutation upsertAnswer($answerData: [Answer_insert_input!]!, $submissionId: uuid, $questionId: uuid) {
  delete_Answer(
    where: {_and: [{questionId: {_eq: $questionId}}, {submissionId: {_eq: $submissionId}}]}
  ) {
    affected_rows
  }
  insert_Answer(
    objects: $answerData
    on_conflict: {constraint: Answer_submissionId_questionId_formFieldId_key, update_columns: [data]}
  ) {
    affected_rows
  }
}
    `;
export const UpsertFormInvitationCompletionDocument = gql`
    mutation upsertFormInvitationCompletion($invitationId: uuid!, $completion: String!) {
  update_FormInvitation(
    _set: {completion: $completion}
    where: {id: {_eq: $invitationId}}
  ) {
    affected_rows
  }
}
    `;
export const UpsertFormResultDocument = gql`
    mutation upsertFormResult($invitationId: uuid!, $invitationStatus: String!, $input: [FormResult_insert_input!]!, $interimCheck: jsonb!) {
  insert_FormResult(
    objects: $input
    on_conflict: {constraint: FormResult_pkey, update_columns: [score, recommendations]}
  ) {
    affected_rows
  }
  update_FormInvitation(
    _set: {status: $invitationStatus, interimCheck: $interimCheck}
    where: {id: {_eq: $invitationId}}
  ) {
    affected_rows
  }
}
    `;
export const GetInternalRequestCompanyDocument = gql`
    query GetInternalRequestCompany {
  GlobalMaster(where: {type: {_eq: "InternalRequestCompany"}}) {
    id
    data
    type
  }
}
    `;
export const FormWithDataPointsDocument = gql`
    query formWithDataPoints {
  Form(where: {isAIDataPointsAdded: {_eq: true}}) {
    id
    isAIDataPointsAdded
  }
}
    `;
export const GetAiSuggestedDocumentsDocument = gql`
    query GetAISuggestedDocuments {
  AISuggestedDocuments(order_by: {isOther: asc}) {
    id
    title
    maxSize
    sampleFileUrl
    seqIndex
    acceptedFormats
    isOther
    masterDocumentKey
  }
}
    `;
export const GetActiveSubscriptionByCompanyIdDocument = gql`
    query GetActiveSubscriptionByCompanyId($companyId: uuid!, $userId: uuid!) {
  AIChatSubscription(
    where: {companyId: {_eq: $companyId}, isActive: {_eq: true}, startDate: {_lte: "now()"}, endDate: {_gte: "now()"}}
    order_by: {createdAt: desc}
    limit: 1
  ) {
    id
    companyId
    subscriptionName
    hasDocumentRepo
    hasESG
    hasBRSR
    textualLimit
    graphicalLimit
    startDate
    endDate
    isActive
    note
    createdAt
    updatedAt
    Company {
      id
      name
    }
    AIChatUserAllocations(
      where: {userId: {_eq: $userId}, isActive: {_eq: true}}
      limit: 1
    ) {
      id
      userId
      textualAllocated
      graphicalAllocated
      isActive
      allocatedBy
      metadata
      createdAt
      updatedAt
      AIChatUsages(limit: 1) {
        id
        textualUsed
        graphicalUsed
        metadata
        createdAt
        updatedAt
      }
    }
  }
}
    `;
export const Getaddressesbyuser_IdDocument = gql`
    query getaddressesbyuser_id($userId: uuid!, $companyId: uuid!) {
  Addresses(where: {AddressMappings: {UserId: {_eq: $userId}}}) {
    id
    addressLine1
    addressLine2
    addressLine3
    poBoxNumber
    zipcode
    phoneNo
    landMark
    isDefault
    region
    gstNumber
    ownershipType
    IsActive
    countryName
    stateName
    cityName
    addressLable
    companyId
  }
  AddressesByCompanyId: Addresses(where: {companyId: {_eq: $companyId}}) {
    id
    addressLine1
    addressLine2
    addressLine3
    poBoxNumber
    zipcode
    phoneNo
    landMark
    isDefault
    region
    gstNumber
    ownershipType
    IsActive
    countryName
    stateName
    cityName
    addressLable
    companyId
  }
}
    `;
export const GetAddressDetailDocument = gql`
    query getAddressDetail($addressLine1: String, $addressLine2: String, $addressLine3: String, $poBoxNumber: String, $city: uuid, $country: uuid, $state: uuid, $zipcode: String, $phoneNo: String, $landMark: String, $isDefault: Boolean, $gstNumber: String, $companyId: uuid, $ownershipType: String, $addresstype: jsonb, $addressLable: String) {
  Addresses(
    where: {addressLine1: {_eq: $addressLine1}, addressLine2: {_eq: $addressLine2}, addressLine3: {_eq: $addressLine3}, addressType: {_eq: $addresstype}, city: {_eq: $city}, companyId: {_eq: $companyId}, country: {_eq: $country}, gstNumber: {_eq: $gstNumber}, isDefault: {_eq: $isDefault}, landMark: {_eq: $landMark}, ownershipType: {_eq: $ownershipType}, phoneNo: {_eq: $phoneNo}, poBoxNumber: {_eq: $poBoxNumber}, state: {_eq: $state}, zipcode: {_eq: $zipcode}, addressLable: {_eq: $addressLable}}
  ) {
    id
    addressLine1
    addressLine2
    addressLine3
    IsActive
  }
}
    `;
export const GetSubscriptionByIdDocument = gql`
    query GetSubscriptionById($id: uuid!) {
  AIChatSubscription(where: {id: {_eq: $id}}) {
    id
    companyId
    subscriptionName
    hasDocumentRepo
    hasESG
    hasBRSR
    textualLimit
    graphicalLimit
    startDate
    endDate
    isActive
    note
    metadata
    createdAt
    updatedAt
  }
}
    `;
export const GetAiDataStatsByFormIdAndInviationIdNonAiDocument = gql`
    query getAIDataStatsByFormIdAndInviationIdNonAi($formId: uuid!, $inputFields: [String!]!) {
  FormField(
    where: {type: {_in: $inputFields}, questionId: {_is_null: false}, formId: {_eq: $formId}}
  ) {
    id
    fieldOptions
    dataPoint
    Form {
      isAIDataPointsAdded
    }
  }
}
    `;
export const GetAiDataStatsByFormIdAndInviationIdDocument = gql`
    query getAIDataStatsByFormIdAndInviationId($formId: uuid!, $invitationId: uuid!, $inputFields: [String!]!) {
  FormField(
    where: {type: {_in: $inputFields}, questionId: {_is_null: false}, formId: {_eq: $formId}}
  ) {
    id
    fieldOptions
    dataPoint
    Suggestions(where: {formInvitationId: {_eq: $invitationId}}) {
      id
      formFieldId
      suggestion
      SuggestionSourceMappings {
        id
        suggestionId
        sourceId
        Source {
          id
          type
          formInvitationId
        }
      }
    }
    Form {
      isAIDataPointsAdded
    }
  }
}
    `;
export const GetCompanyAiSubscriptionsDocument = gql`
    query GetCompanyAISubscriptions($companyId: uuid!) {
  AISubscriptions(where: {companyId: {_eq: $companyId}}) {
    id
    subscriptionPlan
    isActive
    Form {
      id
      name
    }
  }
}
    `;
export const GetAiChatUsageBySubscriptionIdDocument = gql`
    query GetAIChatUsageBySubscriptionId($subscriptionId: uuid!) {
  AIChatUsage(where: {subscriptionId: {_eq: $subscriptionId}}) {
    id
    subscriptionId
    companyId
    allocationId
    textualUsed
    graphicalUsed
    metadata
    createdAt
    updatedAt
  }
}
    `;
export const GetAllUsersByQuestionIdAndInvitationIdDocument = gql`
    query getAllUsersByQuestionIdAndInvitationId($questionId: [uuid!], $invitationId: uuid) {
  Question(where: {_and: {id: {_in: $questionId}}}) {
    id
    key
    content
    AssesseeUserMappings(where: {InvitationId: {_eq: $invitationId}}) {
      id
      parentCompanyMappingId
      ParentCompanyMapping {
        Id
        ParentCompanyId
        companyByParentcompanyid {
          id
          name
          isActive
          Users {
            id
            name
            email
            isActive
            isEmailSubscribed
            UserRoles {
              userId
              roleName
            }
          }
          AssessorConsultantMappings {
            id
            formId
            companyByConsultantcompanyid {
              id
              name
              isActive
              Users {
                id
                name
                email
                isActive
                isEmailSubscribed
                UserRoles {
                  userId
                  roleName
                }
              }
            }
          }
        }
      }
      User {
        id
        name
        email
        isActive
        isEmailSubscribed
        UserRoles {
          userId
          roleName
        }
      }
      userByUserid {
        id
        name
        email
        isActive
        isEmailSubscribed
        UserRoles {
          userId
          roleName
        }
      }
    }
    FormFields {
      InvitationComments(where: {invitationId: {_eq: $invitationId}}) {
        User {
          id
          name
          email
          isActive
          isEmailSubscribed
          UserRoles {
            userId
            roleName
          }
        }
        Company {
          Users {
            id
            name
            email
            isActive
            isEmailSubscribed
            UserRoles {
              userId
              roleName
            }
          }
          ParentCompanyMappings {
            Id
            ParentCompanyId
            companyByParentcompanyid {
              id
              name
              isActive
              Users {
                id
                name
                email
                isActive
                isEmailSubscribed
                UserRoles {
                  userId
                  roleName
                }
              }
              AssessorConsultantMappings {
                id
                formId
                companyByConsultantcompanyid {
                  id
                  name
                  isActive
                  Users {
                    id
                    name
                    email
                    isActive
                    isEmailSubscribed
                    UserRoles {
                      userId
                      roleName
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
    `;
export const GetAnswerByDateDocument = gql`
    query getAnswerByDate($startDate: timestamptz, $endDate: timestamptz) {
  Answer(where: {created_at: {_gte: $startDate, _lte: $endDate}}) {
    id
    questionId
    submissionId
    formFieldId
    created_by
    FormSubmission {
      FormInvitation {
        id
      }
    }
    Question {
      id
      key
      content
      FormFields {
        questionId
        field
        interfaceOptions
        groupField
      }
    }
    FormField {
      id
      field
      fieldOptions
      type
      subtheme
      interfaceOptions
      interface
      Section {
        id
        content
        ParentSection {
          id
          content
        }
      }
      Form {
        FormFields(where: {interface: {_in: ["group-wizard", "group-detail"]}}) {
          interfaceOptions
          interface
          questionId
          groupField
        }
      }
      Question {
        id
        content
      }
    }
  }
}
    `;
export const GetAnswerByQuestionIdAndSubmissionIdDocument = gql`
    query getAnswerByQuestionIdAndSubmissionId($questionId: uuid!, $submissionId: uuid!) {
  FormSubmission(where: {id: {_eq: $submissionId}}) {
    id
    FormInvitation {
      id
      status
    }
  }
  Answer(
    where: {questionId: {_eq: $questionId}, submissionId: {_eq: $submissionId}}
  ) {
    id
    questionId
    data
    submissionId
    status
    formFieldId
    FormField {
      interface
    }
    Interim_Answers {
      id
      data
      Interim_Recommendations {
        id
        answeroption
        status
      }
    }
  }
  Interim_Answer(
    where: {questionId: {_eq: $questionId}, submissionId: {_eq: $submissionId}}
  ) {
    id
    questionId
    data
    submissionId
    formFieldId
    FormField {
      interface
    }
    Interim_Recommendations {
      id
      answeroption
      status
    }
  }
}
    `;
export const GetAnswerBySubmissionIdAndquestionIdDocument = gql`
    query getAnswerBySubmissionIdAndquestionId($SubmissionId: uuid, $questionId: uuid) {
  FormSubmission(where: {id: {_eq: $SubmissionId}}) {
    Answers(where: {questionId: {_eq: $questionId}}) {
      id
      questionId
      submissionId
      formFieldId
      data
      status
    }
  }
}
    `;
export const GetAnsweredResultDocument = gql`
    query GetAnsweredResult($invitationId: uuid) {
  FormInvitation(
    where: {_and: [{id: {_eq: $invitationId}}, {isActive: {_eq: true}}]}
  ) {
    Company {
      id
      name
    }
    email
    Form {
      id
      name
    }
    status
    FormSubmissions(where: {isActive: {_eq: true}}) {
      id
      FormResults {
        id
        Section {
          id
          content
        }
        Question {
          id
          content
        }
        score
      }
    }
  }
}
    `;
export const GetAnswersByFormSubmissionIdDocument = gql`
    query getAnswersByFormSubmissionId($SubmissionId: uuid!) {
  Answer(where: {submissionId: {_eq: $SubmissionId}}) {
    questionId
    data
    submissionId
    created_by
    updated_by
    status
    formFieldId
  }
  carryForWardData: Answer(
    where: {_and: {submissionId: {_eq: $SubmissionId}, Interim_Answers: {answerId: {_is_null: false}}}}
  ) {
    submissionId
    formFieldId
    questionId
    Interim_Answers {
      id
      answerId
      interim_answer_id
    }
  }
}
    `;
export const GetAnswersByIdsDocument = gql`
    query GetAnswersByIds($where: Answer_bool_exp!) {
  Answer(where: $where) {
    id
    submissionId
    questionId
    formFieldId
  }
}
    `;
export const GetAssesseeUserMappingByDateDocument = gql`
    query getAssesseeUserMappingByDate($startDate: timestamptz, $endDate: timestamptz) {
  AssesseeUserMapping(
    where: {created_at: {_gte: $startDate, _lte: $endDate}, IsActive: {_eq: true}}
    order_by: {Question: {Section: {key: asc}}}
  ) {
    id
    userId
    questionId
    formId
    InvitationId
    IsActive
    created_at
    updated_at
    Question {
      id
      content
      FormFields {
        id
        field
        fieldOptions
        interfaceOptions
      }
      Section {
        id
        content
        ParentSection {
          id
          content
        }
      }
    }
    ParentCompanyMapping {
      Id
      CompanyId
      Company {
        id
        name
      }
    }
    User {
      id
      name
    }
  }
}
    `;
export const GetAssesseeUserMappingByUserIdDocument = gql`
    query getAssesseeUserMappingByUserId($userId: uuid) {
  AssesseeUserMapping(
    where: {_and: {userId: {_eq: $userId}, Status: {_neq: "Responded"}}}
  ) {
    id
    userId
    Status
  }
}
    `;
export const GetAssesseeUserMappingsDocument = gql`
    query getAssesseeUserMappings($where: AssesseeUserMapping_bool_exp!) {
  AssesseeUserMapping(where: $where) {
    id
    userId
    parentUserId
    InvitationId
    questionId
    Question {
      id
      key
      content
      FormFields {
        questionId
        field
        interfaceOptions
        groupField
      }
    }
    ParentCompanyMapping {
      Id
      Company {
        id
        Users {
          id
          name
          email
          IsPasswordReset
        }
      }
    }
    User {
      id
      name
      email
      isEmailSubscribed
      UserRoles {
        roleName
      }
    }
    userByUserid {
      id
      name
      email
      isEmailSubscribed
      UserRoles {
        roleName
      }
    }
    FormInvitation {
      id
      email
      companyByParentcompanyid {
        name
        metadata
      }
    }
  }
}
    `;
export const GetassesseeuserbyinvitationIdDocument = gql`
    query getassesseeuserbyinvitationId($invitationId: uuid!) {
  AssesseeUserMapping(where: {InvitationId: {_eq: $invitationId}}) {
    id
    parentCompanyMappingId
    userId
    parentUserId
    questionId
    formFieldId
    formId
    reviewerUserId
    InvitationId
    roleId
    IsActive
    userByUserid {
      id
      name
    }
    User {
      id
      name
    }
  }
}
    `;
export const GetAssesseUserQuestionDetailByUseridDocument = gql`
    query getAssesseUserQuestionDetailByUserid($userId: uuid!) {
  AssesseeUserMapping(where: {userId: {_eq: $userId}}) {
    id
    parentCompanyMappingId
    userId
    parentUserId
    questionId
    formFieldId
    formId
    reviewerUserId
    InvitationId
    roleId
    IsActive
  }
}
    `;
export const GetAssessmentListForDownloadDocument = gql`
    query getAssessmentListForDownload($companyId: uuid, $where2: AddressMapping_bool_exp!, $userId: uuid, $statusWhere: FormInvitation_bool_exp!) {
  CompanyForm(where: {companyId: {_eq: $companyId}}) {
    formId
    Form {
      GroupForms {
        formId
        __typename
      }
      __typename
    }
    __typename
  }
  FormInvitation(where: $statusWhere, order_by: {updated_at: desc}) {
    id
    email
    interimCheck
    ValidationWarningLogs_aggregate(
      where: {IsActive: {_eq: true}, Logtype: {_eq: "invitation"}}
    ) {
      aggregate {
        count
        __typename
      }
      __typename
    }
    ParentCompanyMapping {
      Id
      UserId
      ParentUserId
      Address {
        addressLable
        __typename
      }
      User {
        id
        name
        email
        __typename
      }
      Company {
        id
        name
        metadata
        __typename
      }
      companyByParentcompanyid {
        id
        name
        __typename
      }
      userByParentuserid {
        id
        name
        email
        __typename
      }
      __typename
    }
    Form {
      id
      name
      calc
      GroupForms {
        groupFormId
        formId
        Form {
          name
          __typename
        }
        __typename
      }
      __typename
    }
    Company {
      id
      name
      __typename
    }
    durationTo
    durationFrom
    status
    created_at
    updated_at
    FormSubmissions(where: {isActive: {_eq: true}}, order_by: {updated_at: desc}) {
      id
      status
      FormResults(
        where: {_and: [{questionId: {_is_null: true}}, {sectionId: {_is_null: true}}]}
      ) {
        score
        __typename
      }
      __typename
      Answers(order_by: {updated_at: desc}, limit: 1) {
        questionId
        __typename
      }
      Interim_Answers(
        where: {Question: {AssesseeUserMappings: {userId: {_eq: $userId}}}}
      ) {
        id
        questionId
        Interim_Recommendations {
          id
          status
          __typename
        }
        Interim_Answer {
          id
          Interim_Recommendations {
            id
            status
            __typename
          }
          __typename
        }
        __typename
      }
    }
    InvitationComments(limit: 1) {
      content
      created_at
      __typename
    }
    __typename
    AssesseeUserMappings {
      id
      formId
      InvitationId
      IsActive
      __typename
    }
  }
  AddressMapping(where: $where2) {
    Address {
      addressLable
      __typename
    }
    __typename
  }
  AssesseeUserMapping(where: {_and: [{userId: {_eq: $userId}}]}) {
    id
    userId
    questionId
    InvitationId
    __typename
  }
}
    `;
export const GetAssessmentListDocument = gql`
    query getAssessmentList($where: FormInvitation_bool_exp!, $platformId: uuid, $companyId: uuid, $where2: AddressMapping_bool_exp!, $invitationType: [String!], $userId: uuid, $sourceType: String!) {
  GlobalMaster(
    where: {_and: {Platform: {id: {_eq: $platformId}}, type: {_in: $invitationType}}}
  ) {
    id
    platformId
    type
    data
    __typename
  }
  CompanyForm(where: {companyId: {_eq: $companyId}}) {
    formId
    Form {
      GroupForms {
        formId
        __typename
      }
      __typename
    }
    __typename
  }
  FormInvitation(where: $where, order_by: {updated_at: desc}) {
    ParentUser {
      Company {
        name
      }
    }
    id
    email
    companyId
    parentcompanyId
    reviewerParentCompanyId
    completion
    interimCheck
    reviewerDetails
    ValidationWarningLogs_aggregate(
      where: {IsActive: {_eq: true}, Logtype: {_eq: "invitation"}}
    ) {
      aggregate {
        count
      }
    }
    ParentCompanyMapping {
      Id
      UserId
      ParentUserId
      Address {
        addressLable
        __typename
      }
      User {
        id
        name
        email
        __typename
      }
      Company {
        id
        name
        metadata
        __typename
      }
      companyByParentcompanyid {
        id
        name
        __typename
      }
      userByParentuserid {
        id
        name
        email
      }
      __typename
    }
    Form {
      id
      name
      formtype
      calc
      GroupForms {
        groupFormId
        formId
        Form {
          name
          __typename
        }
        __typename
      }
      __typename
    }
    Company {
      id
      name
      __typename
    }
    durationTo
    durationFrom
    status
    created_by
    created_at
    updated_at
    ParentUser {
      Company {
        name
      }
      UserRoles {
        roleName
      }
    }
    completion
    metadata
    WebCurations(order_by: {created_at: desc}, limit: 1) {
      id
      status
      error
    }
    AIBulkDocumentProcessings {
      id
      requestStatus
    }
    Sources(where: {type: {_eq: $sourceType}}) {
      SourceFile {
        id
        status
      }
    }
    FormSubmissions(where: {isActive: {_eq: true}}, order_by: {updated_at: desc}) {
      id
      status
      FormResults(
        where: {_and: [{questionId: {_is_null: true}}, {sectionId: {_is_null: true}}]}
      ) {
        score
        __typename
      }
      __typename
      Answers(order_by: {updated_at: desc}, limit: 1) {
        questionId
      }
      Interim_Answers(
        where: {Question: {AssesseeUserMappings: {userId: {_eq: $userId}}}}
      ) {
        id
        questionId
        Interim_Recommendations {
          id
          status
        }
        Interim_Answer {
          id
          Interim_Recommendations {
            id
            status
          }
        }
      }
    }
    InvitationComments(order_by: {created_at: desc}, limit: 1) {
      content
      created_at
    }
    __typename
    AssesseeUserMappings {
      id
      formId
      InvitationId
      questionId
      IsActive
      userId
      parentUserId
      Status
      ResponderStatus
      User {
        id
        name
      }
    }
  }
  AddressMapping(where: $where2) {
    Address {
      addressLable
      __typename
    }
    __typename
  }
  AssesseeUserMapping(where: {_and: [{userId: {_eq: $userId}}]}) {
    id
    userId
    questionId
    InvitationId
    ResponderStatus
  }
}
    `;
export const GetAssessmentListingDetailsDocument = gql`
    query getAssessmentListingDetails($companyId: uuid!) {
  GlobalMaster_InternalRequestCompany: GlobalMaster(
    where: {type: {_eq: "InternalRequestCompany"}}
  ) {
    id
    type
    data
  }
  GlobalMaster_InviterFormAutoAppover: GlobalMaster(
    where: {type: {_eq: "InviterFormAutoAppover"}}
  ) {
    id
    type
    data
  }
  Company(where: {id: {_eq: $companyId}, isActive: {_eq: true}}) {
    id
    name
    primaryContact
    details
    platformId
    metadata
    ParentCompany {
      id
      name
    }
    ParentCompanyMappings(where: {isActive: {_eq: true}}) {
      ParentCompanyId
    }
    AssessorConsultantMappings {
      id
      consultantCompanyId
      assessorCompanyId
      Form {
        id
      }
    }
  }
}
    `;
export const GetAssessorConsultantMappingByConsultantCompanyIdDocument = gql`
    query getAssessorConsultantMappingByConsultantCompanyId($consultantCompanyId: uuid) {
  AssessorConsultantMapping(
    where: {consultantCompanyId: {_eq: $consultantCompanyId}}
  ) {
    id
    consultantCompanyId
    assessorCompanyId
    formId
  }
}
    `;
export const GetAssessorConsultantMappingDocument = gql`
    query getAssessorConsultantMapping {
  AssessorConsultantMapping(where: {isActive: {_eq: true}}) {
    id
    formId
    consultantCompanyId
    assessorCompanyId
    isActive
    Company {
      Users {
        UserRoles {
          userId
          roleName
        }
      }
    }
  }
}
    `;
export const GetAssignedQuestionDetailsByInvitationIdDocument = gql`
    query getAssignedQuestionDetailsByInvitationId($invitationId: uuid) {
  AssesseeUserMapping(
    where: {_and: {InvitationId: {_eq: $invitationId}, IsActive: {_eq: true}}}
    order_by: {updated_at: desc}
  ) {
    id
    InvitationId
    formId
    questionId
    userId
    Status
    created_at
    updated_at
    updated_by
    FormField {
      field
    }
    User {
      id
      name
    }
    userByUserid {
      id
      name
    }
    Form {
      id
      name
    }
    Question {
      id
      key
      FormFields {
        id
        interfaceOptions
        interface
        subtheme
      }
      Section {
        id
        content
        ParentSection {
          id
          content
        }
      }
    }
  }
}
    `;
export const GetAssignedQuestionUserDetailsByQuestionIdDocument = gql`
    query getAssignedQuestionUserDetailsByQuestionId($questionId: uuid, $invitationId: uuid) {
  FormInvitation(
    where: {_and: [{id: {_eq: $invitationId}}, {isActive: {_eq: true}}]}
  ) {
    id
    ParentCompanyMapping {
      Id
      UserId
    }
  }
  AssesseeUserMapping(
    where: {_and: [{questionId: {_eq: $questionId}}, {InvitationId: {_eq: $invitationId}}, {IsActive: {_eq: true}}]}
  ) {
    id
    questionId
    userId
    userByUserid {
      id
      name
      email
      isActive
      UserRoles {
        userId
        roleName
      }
    }
  }
}
    `;
export const GetCompanyDetailByNameDocument = gql`
    query getCompanyDetailByName($newName: [String!]) {
  Company(where: {name: {_in: $newName}, isActive: {_eq: true}}) {
    name
  }
}
    `;
export const GetCompanyByNameDocument = gql`
    query GetCompanyByName($where: Company_bool_exp) {
  Company(where: $where) {
    id
    name
    primaryContact
    ParentCompanyMappings(where: {isActive: {_eq: true}}) {
      ParentCompanyId
    }
    metadata
    IsManufacturing
  }
}
    `;
export const GetCompanyByParentCompanyIdAndPlatformIdDocument = gql`
    query GetCompanyByParentCompanyIdAndPlatformId($parentCompanyId: uuid, $platformId: uuid, $allConsultantCompanyIds: [uuid!]) {
  Company(
    where: {_and: [{isActive: {_eq: true}}, {platformId: {_eq: $platformId}}], ParentCompanyMappings: {ParentCompanyId: {_eq: $parentCompanyId}, isActive: {_eq: true}}, id: {_nin: $allConsultantCompanyIds}}
  ) {
    id
    name
    country
    primaryContact
    isActive
    IsManufacturing
  }
}
    `;
export const GetCompanyByParentCompanyIdNullDocument = gql`
    query GetCompanyByParentCompanyIdNull($parentCompanyId: uuid, $platformId: uuid, $allConsultantCompanyIds: [uuid!]) {
  Company(
    where: {_and: [{isActive: {_eq: true}}, {platformId: {_eq: $platformId}}, {id: {_neq: $parentCompanyId}}], ParentCompanyMappings: {_or: [{ParentCompanyId: {_is_null: true}}, {ParentCompanyId: {_neq: $parentCompanyId}}], _and: [{isActive: {_eq: true}}]}, id: {_nin: $allConsultantCompanyIds}}
  ) {
    id
    name
    country
    primaryContact
    isActive
    parentCompanyId
    ParentCompanyMappings {
      ParentCompanyId
      isActive
    }
    IsManufacturing
  }
}
    `;
export const GetcompanyfundtypeavailabilityDocument = gql`
    query getcompanyfundtypeavailability($formId: uuid, $vcCompanyId: uuid) {
  CompanyFormFundtype(
    where: {formId: {_eq: $formId}, vcCompanyId: {_eq: $vcCompanyId}}
  ) {
    id
    companyId
    vcCompanyId
    formId
    fundType
  }
}
    `;
export const GetCompanySubscriptionWithAllUsersDocument = gql`
    query GetCompanySubscriptionWithAllUsers($companyId: uuid!) {
  AIChatSubscription(
    where: {companyId: {_eq: $companyId}, isActive: {_eq: true}, startDate: {_lte: "now()"}, endDate: {_gte: "now()"}}
    order_by: {createdAt: desc}
    limit: 1
  ) {
    id
    companyId
    subscriptionName
    hasDocumentRepo
    hasESG
    hasBRSR
    textualLimit
    graphicalLimit
    startDate
    endDate
    isActive
    note
    createdAt
    updatedAt
    AIChatUserAllocations(where: {isActive: {_eq: true}}) {
      id
      userId
      textualAllocated
      graphicalAllocated
      isActive
      allocatedBy
      metadata
      createdAt
      updatedAt
      AIChatUsages(limit: 1) {
        id
        textualUsed
        graphicalUsed
        metadata
        createdAt
        updatedAt
      }
    }
  }
}
    `;
export const GetExistingCompaniesOrUsersRecordByIdDocument = gql`
    query getExistingCompaniesOrUsersRecordById($companyId: [uuid!], $usersId: [uuid!]) {
  Company(
    where: {id: {_in: $companyId}, ParentCompanyMappings: {isActive: {_eq: true}}}
  ) {
    id
    name
    ParentCompanyMappings {
      ParentCompanyId
    }
  }
  User(where: {id: {_in: $usersId}}) {
    id
    email
  }
}
    `;
export const GetCompanyWithFormInvitationAndEmailTemplatesDocument = gql`
    query GetCompanyWithFormInvitationAndEmailTemplates {
  Company {
    id
    name
    FormInvitations {
      id
    }
    Platform {
      EmailTemplates {
        type
      }
    }
  }
}
    `;
export const GetCompanyDetailByBulkIdDocument = gql`
    query getCompanyDetailByBulkId($companyIds: [uuid!]) {
  Company(where: {id: {_in: $companyIds}, isActive: {_eq: true}}) {
    id
    name
    primaryContact
    details
    platformId
    ParentCompanyMappings(where: {isActive: {_eq: true}}) {
      ParentCompanyId
    }
  }
}
    `;
export const GetCompanyDetailByIdDocument = gql`
    query getCompanyDetailById($id: uuid) {
  Company(where: {id: {_eq: $id}, isActive: {_eq: true}}) {
    id
    name
    primaryContact
    ParentCompanyMappings(where: {isActive: {_eq: true}}) {
      ParentCompanyId
      CompanyId
    }
    details
    platformId
    metadata
    ParentCompany {
      id
      name
    }
    AssessorConsultantMappings(where: {isActive: {_eq: true}}) {
      id
      assessorCompanyId
      consultantCompanyId
      isActive
    }
  }
}
    `;
export const GetCompanyDetailByparentcompanyidDocument = gql`
    query getCompanyDetailByparentcompanyid($companyId: uuid!, $parentCompanyId: uuid!) {
  Company(where: {id: {_eq: $companyId}, isActive: {_eq: true}}) {
    id
    name
    primaryContact
    ParentCompanyMappings(
      where: {isActive: {_eq: true}, ParentCompanyId: {_eq: $parentCompanyId}}
    ) {
      ParentCompanyId
    }
    details
    platformId
    metadata
  }
}
    `;
export const GetcompanyidbyinvitationidDocument = gql`
    query getcompanyidbyinvitationid($invitationId: uuid) {
  FormInvitation(where: {id: {_eq: $invitationId}}) {
    companyId
    id
    formId
  }
}
    `;
export const GetConsultantAssessmentListDocument = gql`
    query getConsultantAssessmentList($where: FormInvitation_bool_exp!, $platformId: uuid, $companyId: uuid, $invitationType: [String!], $sourceType: String!) {
  AddressMapping {
    id
  }
  GlobalMaster(
    where: {_and: {Platform: {id: {_eq: $platformId}}, type: {_in: $invitationType}}}
  ) {
    id
    platformId
    type
    data
    __typename
  }
  CompanyForm(where: {companyId: {_eq: $companyId}}) {
    formId
    Form {
      GroupForms {
        formId
        __typename
      }
      __typename
    }
    __typename
  }
  FormInvitation(where: $where, order_by: {updated_at: desc}) {
    ParentUser {
      id
      name
      Company {
        name
      }
    }
    id
    companyId
    parentcompanyId
    reviewerParentCompanyId
    interimCheck
    completion
    reviewerDetails
    ValidationWarningLogs_aggregate {
      aggregate {
        count
      }
    }
    ParentCompanyMapping {
      Id
      CompanyId
      ParentCompanyId
      ParentUserId
      UserId
      Address {
        addressLable
        __typename
      }
      userByParentuserid {
        id
        name
        email
      }
      companyByParentcompanyid {
        id
        name
        __typename
      }
      Company {
        id
        name
        metadata
        __typename
      }
      User {
        id
        name
        email
      }
    }
    Form {
      id
      name
      formtype
      GroupForms {
        groupFormId
        formId
        Form {
          name
          __typename
        }
        __typename
      }
      __typename
    }
    Company {
      id
      name
      __typename
    }
    durationTo
    durationFrom
    status
    created_at
    created_by
    ParentUser {
      UserRoles {
        roleName
      }
    }
    WebCurations(order_by: {created_at: desc}, limit: 1) {
      id
      status
      error
    }
    AIBulkDocumentProcessings {
      id
      requestStatus
    }
    Sources(where: {type: {_eq: $sourceType}}) {
      SourceFile {
        id
        status
      }
    }
    FormSubmissions(where: {isActive: {_eq: true}}) {
      id
      status
      FormResults(
        where: {_and: [{questionId: {_is_null: true}}, {sectionId: {_is_null: true}}]}
      ) {
        score
        __typename
      }
      __typename
    }
    InvitationConsultantMappings {
      id
      invitationId
      consultantUserId
      consultantCompanyId
      Company {
        id
        name
        __typename
      }
      User {
        id
        name
        email
        __typename
      }
      __typename
    }
    InvitationComments(order_by: {created_at: desc}, limit: 1) {
      content
      created_at
    }
    __typename
    AssesseeUserMappings {
      id
      formId
      InvitationId
      IsActive
    }
  }
}
    `;
export const GetConsultantFormWithDetailsDocument = gql`
    query getConsultantFormWithDetails($companyId: uuid) {
  AssessorConsultantMapping(where: {consultantCompanyId: {_eq: $companyId}}) {
    Form {
      id
      name
      title
      description
      tags
      formtype
      Details {
        id
        formId
        focusArea
        timeInMinutes
      }
      GroupForms {
        groupFormId
        formId
        Form {
          Details {
            industry
          }
        }
      }
    }
    Company {
      id
      name
    }
  }
}
    `;
export const GetConsultantDataByFormIdDocument = gql`
    query getConsultantDataByFormId($where1: AssessorConsultantMapping_bool_exp!, $where2: AssessorConsultantMapping_bool_exp!) {
  AssessorConsultantMapping(where: $where1) {
    formId
    companyByConsultantcompanyid {
      id
      name
      Users {
        email
        name
        isEmailSubscribed
        UserRoles {
          roleName
        }
      }
    }
  }
  GroupForm: AssessorConsultantMapping(where: $where2) {
    formId
    companyByConsultantcompanyid {
      id
      name
      Users {
        email
        name
        isEmailSubscribed
        UserRoles {
          roleName
        }
      }
    }
  }
}
    `;
export const GetConversationMessagesDocument = gql`
    query GetConversationMessages($conversationId: uuid!, $limit: Int = 20, $cursor: timestamptz, $withCursor: Boolean = false) {
  AIMessages(
    where: {conversationId: {_eq: $conversationId}, _and: [{createdAt: {_lt: $cursor}}]}
    order_by: [{createdAt: desc}]
    limit: $limit
  ) @include(if: $withCursor) {
    messageId
    conversationId
    role
    content
    rephrasedContent
    sources
    type
    createdAt
    updatedAt
    metadata
  }
  AIMessagesAll: AIMessages(
    where: {conversationId: {_eq: $conversationId}}
    order_by: [{createdAt: desc}]
    limit: $limit
  ) @skip(if: $withCursor) {
    messageId
    conversationId
    role
    content
    rephrasedContent
    sources
    type
    createdAt
    updatedAt
    metadata
  }
}
    `;
export const GetDeclinedQuestionsCountDocument = gql`
    query getDeclinedQuestionsCount($invitationId: uuid!) {
  ReviewerDetailsMapping_aggregate(
    where: {_and: [{FormInvitationId: {_eq: $invitationId}}, {currentStatus: {_eq: "Declined"}}]}
  ) {
    aggregate {
      count
    }
  }
}
    `;
export const GetDocumentLogsPaginatedDocument = gql`
    query GetDocumentLogsPaginated($companyId: uuid!, $limit: Int = 20, $cursor: timestamptz, $withCursor: Boolean = false, $searchTerm: String) {
  DocumentLogs(
    where: {companyId: {_eq: $companyId}, status: {_in: ["Processing", "Processed"]}, extractionPercentage: {_is_null: false}, _and: [{createdAt: {_lt: $cursor}}, {_or: [{originalFileName: {_ilike: $searchTerm}}, {fileName: {_ilike: $searchTerm}}, {_and: [{AISuggestedDocuments: {title: {_ilike: $searchTerm}}}, {AISuggestedDocuments: {isOther: {_neq: true}}}]}]}]}
    order_by: [{createdAt: desc}]
    limit: $limit
  ) @include(if: $withCursor) {
    id
    companyId
    originalFileName
    fileName
    fileUrl
    status
    extractionPercentage
    aiSuggestedDocumentId
    createdAt
    updatedAt
    AISuggestedDocuments {
      id
      title
      isOther
    }
  }
  DocumentLogsAll: DocumentLogs(
    where: {companyId: {_eq: $companyId}, status: {_in: ["Processing", "Processed"]}, extractionPercentage: {_is_null: false}, _or: [{originalFileName: {_ilike: $searchTerm}}, {fileName: {_ilike: $searchTerm}}, {_and: [{AISuggestedDocuments: {title: {_ilike: $searchTerm}}}, {AISuggestedDocuments: {isOther: {_neq: true}}}]}]}
    order_by: [{createdAt: desc}]
    limit: $limit
  ) @skip(if: $withCursor) {
    id
    companyId
    originalFileName
    fileName
    fileUrl
    status
    extractionPercentage
    aiSuggestedDocumentId
    createdAt
    updatedAt
    AISuggestedDocuments {
      id
      title
      isOther
    }
  }
}
    `;
export const GetDocumentLogsWithAiSuggestedDocumentsDocument = gql`
    query GetDocumentLogsWithAISuggestedDocuments($where: DocumentLogs_bool_exp) {
  DocumentLogs(where: $where, order_by: [{createdAt: desc}]) {
    id
    originalFileName
    fileName
    fileSize
    fileUrl
    status
    createdAt
    createdBy
    deletedAt
    deletedBy
    cardName
    version
    aiSuggestedDocumentId
    expiryDate
    raraResponse
    error
    AISuggestedDocuments {
      id
      title
      isOther
    }
    CreatedByUser: UserByCreatedBy {
      id
      name
    }
    DeletedByUser: DeletedByUser {
      id
      name
    }
  }
}
    `;
export const GetDocumentLogsWithSourcesDocument = gql`
    query GetDocumentLogsWithSources($where: DocumentLogs_bool_exp!, $limit: Int, $offset: Int, $order_by: [DocumentLogs_order_by!]) {
  DocumentLogs(where: $where, limit: $limit, offset: $offset, order_by: $order_by) {
    id
    companyId
    fileUrl
    originalFileName
    status
    createdAt
    createdBy
    fileName
    fileSize
    expiryDate
    documentLogsSources {
      id
      formInvitationId
      documentLogsId
      type
      url
      created_at
    }
    AISuggestedDocuments {
      title
      isOther
      id
    }
  }
}
    `;
export const GetDocumentLogsDocument = gql`
    query GetDocumentLogs($where: DocumentLogs_bool_exp!) {
  DocumentLogs(where: $where, order_by: {createdAt: desc}) {
    AISuggestedDocuments {
      title
      isOther
      id
      masterDocumentKey
    }
    id
    companyId
    originalFileName
    status
    aiSuggestedDocumentId
    updatedBy
    updatedAt
    fileSize
    fileName
    fileUrl
    createdBy
    expiryDate
    error
    deletedBy
    deletedAt
    cardName
    version
    createdAt
    raraResponse
    uploadedFromInvitationId
    extractionPercentage
    UserByCreatedBy {
      id
      name
    }
  }
}
    `;
export const GetEmailConfigurationByplatformIdDocument = gql`
    query GetEmailConfigurationByplatformId($platformId: uuid) {
  EmailConfiguration(where: {platformId: {_eq: $platformId}}) {
    fromEmail
    host
    port
    isSecure
    user
    password
  }
}
    `;
export const GetEmailTemplateByTypeDocument = gql`
    query getEmailTemplateByType($emailType: String, $platformId: uuid) {
  EmailTemplate(where: {type: {_eq: $emailType}}) {
    bccEmails
    ccEmails
    subject
    template
    companyId
    formId
    platformId
    Platform {
      id
      origin
      EmailConfigs(where: {platformId: {_eq: $platformId}}) {
        fromEmail
        host
        port
        isSecure
        user
        password
      }
    }
  }
}
    `;
export const GetEmailTemplateDataByinvitationIdDocument = gql`
    query GetEmailTemplateDataByinvitationId($invitationId: uuid, $questionId: uuid, $emailType: String, $formId: uuid, $platformId: uuid) {
  FormInvitation(where: {id: {_eq: $invitationId}}) {
    email
    companyId
    updated_at
    durationFrom
    durationTo
    reviewerDetails
    ParentUser {
      name
      email
      isEmailSubscribed
      UserRoles {
        roleName
      }
    }
    companyByParentcompanyid {
      name
      metadata
      assessorConsultantMappingsByConsultantcompanyid {
        updated_at
      }
      Users {
        email
        name
        isEmailSubscribed
        UserRoles {
          roleName
        }
      }
      AssessorConsultantMappings(where: {formId: {_eq: $formId}}) {
        companyByConsultantcompanyid {
          id
          name
          Users {
            email
            name
            isEmailSubscribed
            UserRoles {
              roleName
            }
          }
        }
      }
      GroupForm: AssessorConsultantMappings(
        where: {Form: {GroupForms: {formId: {_eq: $formId}}}}
      ) {
        companyByConsultantcompanyid {
          id
          name
          Users {
            email
            name
            isEmailSubscribed
            UserRoles {
              roleName
            }
          }
        }
      }
    }
    InvitationComments {
      content
      created_at
    }
    Company {
      name
      primaryContact
      platformId
      Platform {
        id
        origin
        EmailTemplates(where: {_and: {type: {_eq: $emailType}}}) {
          ccEmails
          subject
          template
          companyId
          formId
          bccEmails
        }
        EmailTemplateswithFormId: EmailTemplates(
          where: {_and: {type: {_eq: $emailType}}, formId: {_eq: $formId}}
        ) {
          ccEmails
          subject
          template
          companyId
          formId
          bccEmails
        }
        EmailConfigs(where: {platformId: {_eq: $platformId}}) {
          fromEmail
          host
          port
          isSecure
          user
          password
        }
      }
      Users {
        id
        email
        isEmailSubscribed
        name
      }
    }
    Form {
      id
      title
    }
  }
  GlobalMaster(where: {type: {_eq: "Recommendation_new"}}) {
    id
    type
    data
  }
  AssesseeUserMapping(where: {_and: {InvitationId: {_eq: $invitationId}}}) {
    InvitationId
    questionId
    userByUserid {
      id
      UserRoles(where: {roleName: {_neq: "Responder"}}) {
        roleName
        User {
          id
          name
          email
        }
      }
    }
  }
  AssesseeUserMappingRespnder: AssesseeUserMapping(
    where: {_and: {InvitationId: {_eq: $invitationId}}, questionId: {_eq: $questionId}}
  ) {
    InvitationId
    questionId
    userByUserid {
      id
      UserRoles {
        roleName
        User {
          id
          name
          email
          isEmailSubscribed
        }
      }
    }
  }
  FormSubmission(where: {_and: {invitationId: {_eq: $invitationId}}}) {
    id
    invitationId
  }
}
    `;
export const GetEmailTemplateDataByEmailtypeDocument = gql`
    query GetEmailTemplateDataByEmailtype($emailType: [String!]) {
  EmailTemplate(where: {type: {_in: $emailType}}) {
    id
    bccEmails
    ccEmails
    subject
    template
    companyId
    formId
    type
  }
}
    `;
export const GetEmailtemplateForOnboardingDocument = gql`
    query getEmailtemplateForOnboarding($invitationId: [uuid!], $emailType: [String!]!) {
  FormInvitation(where: {id: {_in: $invitationId}}) {
    id
    created_by
    email
    companyId
    ParentUser {
      name
      email
      isEmailSubscribed
      UserRoles {
        roleName
      }
      Company {
        name
        primaryContact
      }
    }
    Company {
      name
      primaryContact
      platformId
      Platform {
        origin
        EmailTemplates(where: {_and: {type: {_in: $emailType}}}) {
          type
          ccEmails
          subject
          template
          companyId
          formId
          bccEmails
        }
        EmailConfigs {
          fromEmail
          host
          port
          isSecure
          user
          password
        }
      }
      Users {
        id
        email
        isEmailSubscribed
        name
      }
    }
    Form {
      id
      title
    }
    companyByParentcompanyid {
      name
      metadata
    }
  }
}
    `;
export const GetEmailtemplateForBulkProcessingDocsDocument = gql`
    query getEmailtemplateForBulkProcessingDocs($invitationId: [uuid!], $emailType: [String!]!) {
  FormInvitation(where: {id: {_in: $invitationId}}) {
    id
    created_by
    email
    companyId
    ParentUser {
      name
      email
      isEmailSubscribed
      UserRoles {
        roleName
      }
      Company {
        name
        primaryContact
      }
    }
    Company {
      name
      primaryContact
      platformId
      Platform {
        origin
        EmailTemplates(where: {_and: {type: {_in: $emailType}}}) {
          type
          ccEmails
          subject
          template
          companyId
          formId
          bccEmails
        }
        EmailConfigs {
          fromEmail
          host
          port
          isSecure
          user
          password
        }
      }
      Users {
        id
        email
        isEmailSubscribed
        name
      }
    }
    Form {
      id
      title
    }
    companyByParentcompanyid {
      name
      metadata
    }
  }
}
    `;
export const GetExistingCompaniesNameWithUsersEmailDocument = gql`
    query GetExistingCompaniesNameWithUsersEmail($companyArray: [String!], $usersEmailArray: [String!]) {
  Company(where: {name: {_in: $companyArray}}) {
    name
  }
  User(where: {email: {_in: $usersEmailArray}}) {
    email
  }
}
    `;
export const GetExistingFormInvitationEkycDocument = gql`
    query GetExistingFormInvitationEkyc($companyId: [uuid!], $formId: [uuid!]) {
  FormInvitation(
    where: {_and: [{formId: {_in: $formId}}, {companyId: {_in: $companyId}}]}
  ) {
    durationFrom
    durationTo
    companyId
    formId
  }
}
    `;
export const GetExistingFormInvitationByUserAndAddressIdDocument = gql`
    query GetExistingFormInvitationByUserAndAddressId($userId: [uuid!], $addressId: uuid!, $companyId: uuid!, $formId: uuid!, $durationFrom: date!, $durationTo: date!) {
  FormInvitation(
    where: {formId: {_eq: $formId}, ParentCompanyMapping: {UserId: {_in: $userId}, AddressId: {_eq: $addressId}, CompanyId: {_eq: $companyId}}, _or: [{_and: [{durationFrom: {_lte: $durationFrom}}, {durationTo: {_gte: $durationFrom}}]}, {_and: [{durationFrom: {_gte: $durationFrom}}, {durationTo: {_lte: $durationTo}}]}, {_and: [{durationFrom: {_lte: $durationTo}}, {durationTo: {_gte: $durationTo}}]}]}
  ) {
    durationFrom
    durationTo
    formId
    ParentCompanyMapping {
      AddressId
      CompanyId
      ParentCompanyId
    }
  }
}
    `;
export const GetExistingFormInvitationDocument = gql`
    query GetExistingFormInvitation($companyId: [uuid!], $formId: [uuid!], $durationFrom: date!, $durationTo: date!, $parentcompanyId: [uuid!]) {
  FormInvitation(
    where: {_and: [{formId: {_in: $formId}}, {companyId: {_in: $companyId}}, {parentcompanyId: {_in: $parentcompanyId}}, {_or: [{_and: [{durationFrom: {_lte: $durationFrom}}, {durationTo: {_gte: $durationFrom}}]}, {_and: [{durationFrom: {_gte: $durationFrom}}, {durationTo: {_lte: $durationTo}}]}, {_and: [{durationFrom: {_lte: $durationTo}}, {durationTo: {_gte: $durationTo}}]}]}]}
  ) {
    durationFrom
    durationTo
    companyId
    formId
    id
  }
}
    `;
export const GetDocumentsForExpiryDocument = gql`
    query GetDocumentsForExpiry($where_30: DocumentLogs_bool_exp!, $where_20: DocumentLogs_bool_exp!, $where_5: DocumentLogs_bool_exp!, $where_expired: DocumentLogs_bool_exp!) {
  reminder_30: DocumentLogs(where: $where_30) {
    id
    fileName
    originalFileName
    expiryDate
    createdBy
    companyId
    metadata
  }
  reminder_20: DocumentLogs(where: $where_20) {
    id
    fileName
    originalFileName
    expiryDate
    createdBy
    companyId
    metadata
  }
  reminder_5: DocumentLogs(where: $where_5) {
    id
    fileName
    originalFileName
    expiryDate
    createdBy
    companyId
    metadata
  }
  expired: DocumentLogs(where: $where_expired) {
    id
    fileName
    originalFileName
    expiryDate
    createdBy
    companyId
    metadata
  }
}
    `;
export const GetFirstDeclinedQuestionIdDocument = gql`
    query getFirstDeclinedQuestionId($invitationId: uuid!) {
  ReviewerDetailsMappingDeclined: ReviewerDetailsMapping(
    where: {_and: [{FormInvitationId: {_eq: $invitationId}}, {currentStatus: {_eq: "Declined"}}]}
    limit: 1
    order_by: {Question: {key: asc}}
  ) {
    id
    questionId
    created_at
  }
  ReviewerDetailsMappingResubmitted: ReviewerDetailsMapping(
    where: {_and: [{FormInvitationId: {_eq: $invitationId}}, {currentStatus: {_eq: "Re-Submitted"}}]}
    limit: 1
    order_by: {Question: {key: asc}}
  ) {
    id
    questionId
    created_at
  }
}
    `;
export const GetFomfieldHirarchyNameByInvitationidDocument = gql`
    query getFomfieldHirarchyNameByInvitationid($invitationId: uuid) {
  FormInvitation(where: {id: {_eq: $invitationId}}) {
    Form {
      id
      FormFields(where: {interface: {_eq: "group-wizard"}}, order_by: {field: asc}) {
        interfaceOptions
        interface
      }
    }
  }
}
    `;
export const GetFormCalcDocument = gql`
    query getFormCalc {
  Form(where: {id: {_eq: "0d4655d1-b58b-4d52-826d-d28f8a5514c6"}}) {
    calc
  }
}
    `;
export const GetFormDetailByBulkFormIdDocument = gql`
    query getFormDetailByBulkFormId($formId: [uuid!]) {
  FormDetails(where: {formId: {_in: $formId}}) {
    id
    formId
    bodyTemplate
    framework
    focusArea
    timeInMinutes
    notes
    industry
  }
}
    `;
export const GetFormDetailsByIndustryDocument = gql`
    query getFormDetailsByIndustry($where: FormDetails_bool_exp) {
  Form(where: {Details: $where}) {
    id
    name
    title
    Details {
      focusArea
      industry
    }
  }
}
    `;
export const GetformFieldsbyInvitationIdDocument = gql`
    query getformFieldsbyInvitationId($invitationId: uuid!, $questionId: uuid!) {
  FormInvitation(where: {_and: [{id: {_eq: $invitationId}}]}) {
    id
    status
    companyId
    formId
    Form {
      id
      name
      isDelegateQuestion
      FormFields(order_by: {field: asc}, where: {questionId: {_eq: $questionId}}) {
        id
        field
        Question {
          id
        }
        field
        type
        fieldOptions
        interface
        interfaceOptions
        display
        displayOptions
        groupField
        InvitationComments_aggregate(where: {invitationId: {_eq: $invitationId}}) {
          aggregate {
            count
          }
        }
      }
    }
    parentcompanyId
    ParentCompanyMapping {
      ParentCompanyId
    }
    FormSubmissions {
      id
      status
    }
  }
}
    `;
export const GetFormFieldsByQuestionIdDocument = gql`
    query getFormFieldsByQuestionId($questionId: uuid) {
  FormField(where: {questionId: {_eq: $questionId}}, order_by: {field: asc}) {
    id
    field
    type
    questionId
    groupField
    displayRules
    fieldOptions
    interface
    interfaceOptions
    display
    displayOptions
    validationRules
    seqIndex
  }
}
    `;
export const GetFormFieldsWithSqlQueryDocument = gql`
    query GetFormFieldsWithSQLQuery($formId: uuid!) {
  FormField(
    where: {formId: {_eq: $formId}, generatedSQLQuery: {_is_null: false}}
    limit: 1
  ) {
    id
    formId
    generatedSQLQuery
  }
}
    `;
export const GetFormFormDetailsCompanyListDocument = gql`
    query getFormFormDetailsCompanyList {
  Form {
    id
    name
    title
    description
  }
  FormDetails {
    id
    formId
    focusArea
    timeInMinutes
  }
  Company(where: {isActive: {_eq: true}}) {
    id
    name
    country
    primaryContact
    details
    isActive
  }
}
    `;
export const GetFormIntroByFormIdDocument = gql`
    query getFormIntroByFormId($formId: uuid!) {
  FormDetails(where: {formId: {_eq: $formId}}) {
    id
    formId
    bodyTemplate
    framework
    focusArea
    timeInMinutes
    notes
  }
  GlobalMaster(where: {type: {_eq: "FormIcons"}}) {
    data
  }
}
    `;
export const GetFormIntroByInvitationIdDocument = gql`
    query getFormIntroByInvitationId($invitationId: uuid!) {
  FormInvitation(
    where: {_and: [{id: {_eq: $invitationId}}, {isActive: {_eq: true}}]}
  ) {
    id
    interimCheck
    formId
    status
    metadata
    Company {
      name
      metadata
    }
    durationFrom
    durationTo
    parentcompanyId
    Form {
      name
      Details {
        id
        formId
        bodyTemplate
        framework
        focusArea
        timeInMinutes
        notes
        questions
      }
      GroupForms {
        groupFormId
        formId
      }
      CompanyForms {
        Company {
          metadata
        }
      }
      formtype
      isAIDataPointsAdded
    }
    Sources {
      id
      type
      SourceFile {
        id
        status
      }
    }
  }
  GlobalMaster(where: {type: {_in: ["FormIcons", "FocusArea"]}}) {
    data
    type
  }
}
    `;
export const GetFormInvitationbasicDetailsDocument = gql`
    query getFormInvitationbasicDetails($invitationId: [uuid!]!, $inputFields: [String!]!) {
  FormInvitation(where: {id: {_in: $invitationId}}) {
    id
    FormSubmissions(where: {isActive: {_eq: true}}) {
      Answers {
        data
        formFieldId
        FormField {
          id
          type
          field
          questionId
          fieldOptions
        }
      }
    }
    Form {
      FormFields(where: {questionId: {_is_null: false}, type: {_in: $inputFields}}) {
        id
        fieldOptions
        displayRules
        type
        questionId
        Question {
          key
        }
      }
    }
  }
}
    `;
export const GetFormInvitationByFormIdAndEmailIdDocument = gql`
    query getFormInvitationByFormIdAndEmailId($formId: uuid, $emailId: [String!]!) {
  FormInvitation(
    where: {formId: {_eq: $formId}, email: {_in: $emailId}, status: {_nin: ["Submitted", "Approved"]}, isActive: {_eq: true}}
  ) {
    id
    formId
    companyId
    email
    durationFrom
    durationTo
    isActive
    status
  }
}
    `;
export const GetFormInvitationByFormIdDocument = gql`
    query getFormInvitationByFormId($formId: uuid, $companyId: [uuid!]!) {
  FormInvitation(
    where: {formId: {_eq: $formId}, companyId: {_in: $companyId}, status: {_neq: "Submitted"}, isActive: {_eq: true}}
  ) {
    id
    formId
    companyId
    email
    durationFrom
    durationTo
    isActive
    status
  }
}
    `;
export const GetFormInvitationDetailsByCompanyIdDocument = gql`
    query getFormInvitationDetailsByCompanyId($companyId: [uuid!], $sourceType: String!) {
  FormInvitation(where: {companyId: {_in: $companyId}}) {
    status
    created_by
    ParentUser {
      Company {
        name
      }
      UserRoles {
        roleName
      }
    }
    ParentCompanyMapping {
      Id
      ParentCompanyId
      UserId
    }
    id
    durationTo
    durationFrom
    companyId
    Company {
      id
      name
      IsManufacturing
      metadata
    }
    completion
    Form {
      id
      name
      title
      isAIDataPointsAdded
      formtype
    }
    AIBulkDocumentProcessings {
      id
      requestStatus
    }
    Sources(where: {type: {_eq: $sourceType}}) {
      SourceFile {
        id
        status
      }
    }
    AIBulkDocumentProcessings {
      id
      requestStatus
    }
    Sources(where: {type: {_eq: $sourceType}}) {
      SourceFile {
        id
        status
      }
    }
  }
}
    `;
export const GetFormInvitationDetailsbyIdDocument = gql`
    query getFormInvitationDetailsbyId($invitationId: uuid, $sourceType: String!) {
  FormInvitation(where: {id: {_eq: $invitationId}}) {
    status
    created_by
    metadata
    ParentUser {
      Company {
        name
      }
      UserRoles {
        roleName
      }
    }
    ParentCompanyMapping {
      Id
      ParentCompanyId
      UserId
    }
    id
    durationTo
    durationFrom
    companyId
    Company {
      id
      name
      IsManufacturing
      metadata
    }
    completion
    Form {
      id
      name
      title
      isAIDataPointsAdded
    }
    interimCheck
    formId
    FormSubmissions(where: {isActive: {_eq: true}}) {
      id
    }
    AIBulkDocumentProcessings {
      id
      requestStatus
    }
    Sources(where: {type: {_eq: $sourceType}}) {
      SourceFile {
        id
        status
      }
    }
  }
}
    `;
export const GetFormQuestionnaireDocument = gql`
    query getFormQuestionnaire($formId: uuid!) {
  FormInvitation(where: {formId: {_eq: $formId}}) {
    id
    Form {
      Sections {
        id
        key
        content
        tags
        sectionId
        weightage
        calc
        Questions {
          id
          key
          content
          tags
          weightage
          calc
          Answers {
            id
            data
            status
            AnswerFiles {
              id
              name
              type
              path
              sizeInBytes
              provider
            }
          }
        }
      }
    }
  }
}
    `;
export const GetFormSubmissionByInvitationsDocument = gql`
    query getFormSubmissionByInvitations($where: [FormSubmission_bool_exp!]!) {
  FormSubmission(where: {_or: $where}) {
    id
    invitationId
    isActive
  }
}
    `;
export const GetFormSubmissionDetailsDocument = gql`
    query getFormSubmissionDetails($invitationId: uuid!) {
  FormSubmission(
    where: {_and: [{invitationId: {_eq: $invitationId}}, {isActive: {_eq: true}}]}
  ) {
    id
    Answers {
      id
      questionId
      data
      status
    }
  }
}
    `;
export const GetFormTemplateDataDocument = gql`
    query GetFormTemplateData($formId: uuid!) {
  Form(where: {id: {_eq: $formId}}) {
    id
    title
    description
    name
    formtype
    tags
    Sections(order_by: {key: asc}) {
      id
      key
      content
      tags
      sectionId
      ParentSection {
        id
        key
        content
      }
      Questions(order_by: {key: asc}) {
        id
        key
        content
        tags
        parentQuestionId
        sectionId
      }
    }
    FormFields(order_by: {seqIndex: asc}) {
      id
      field
      type
      interface
      interfaceOptions
      fieldOptions
      displayOptions
      displayRules
      validationRules
      autoCalculatedCalculation
      seqIndex
      groupField
      tags
      dataPoint
      sectionId
      questionId
      Section {
        id
        key
        content
      }
      Question {
        id
        key
        content
      }
    }
  }
}
    `;
export const GetFormWithDetailsDocument = gql`
    query GetFormWithDetails($companyId: uuid) {
  Form(where: {CompanyForms: {companyId: {_eq: $companyId}}}) {
    id
    name
    title
    description
    tags
    formtype
    Details {
      id
      formId
      focusArea
      timeInMinutes
    }
    GroupForms {
      groupFormId
      formId
      Form {
        Details {
          industry
        }
      }
    }
  }
}
    `;
export const GetFormsDocument = gql`
    query GetForms($ids: [uuid!]!) {
  Form(where: {id: {_in: $ids}}) {
    id
    name
    isAIDataPointsAdded
  }
}
    `;
export const FormInvitationDatawithCompanyIdDocument = gql`
    query formInvitationDatawithCompanyId($companyId: [uuid!]!) {
  FormInvitation(distinct_on: created_by, where: {companyId: {_in: $companyId}}) {
    id
    created_by
    ParentUser {
      UserRoles {
        userId
        roleName
      }
      Company {
        id
      }
    }
  }
}
    `;
export const GetformInvitationdatabycustomwhereDocument = gql`
    query getformInvitationdatabycustomwhere($where: FormInvitation_bool_exp!) {
  FormInvitation(where: $where, order_by: {created_at: asc}) {
    id
    companyId
    formId
    email
    Company {
      name
    }
    Sources(order_by: {SourceFile: {created_at: desc}}) {
      id
      url
      type
      SourceFile {
        id
        fileName
        filePath
        originalFileName
        originalFileUrl
        fileSize
        uploadedByUserId
        error
      }
    }
  }
}
    `;
export const GetFormfieldAndAnswersByinvitationIdDocument = gql`
    query getFormfieldAndAnswersByinvitationId($invitationId: uuid!) {
  FormSubmission(
    where: {invitationId: {_eq: $invitationId}, isActive: {_eq: true}}
  ) {
    Answers {
      id
      data
      questionId
      submissionId
      formFieldId
    }
    FormInvitation {
      Form {
        FormFields {
          id
          field
          type
          fieldOptions
          interface
          interfaceOptions
          display
          displayOptions
          displayRules
          validationRules
          seqIndex
          groupField
          recommendationCalc
          subtheme
          formId
          warningRules
        }
      }
      durationFrom
      durationTo
    }
  }
}
    `;
export const GetformFieldsbySubmissionIdDocument = gql`
    query getformFieldsbySubmissionId($submissionId: uuid!) {
  FormSubmission(where: {id: {_eq: $submissionId}}) {
    FormInvitation {
      Form {
        id
        FormFields(where: {interfaceOptions: {_has_key: "rara"}}) {
          formId
          id
          interfaceOptions
          questionId
          Answers(where: {submissionId: {_eq: $submissionId}}) {
            id
            data
          }
        }
      }
      Company {
        id
        name
        primaryContact
      }
    }
  }
  GlobalMaster(where: {type: {_eq: "Rara_integration"}}) {
    id
    platformId
    type
    data
  }
}
    `;
export const GetFormFieldsAndAnswerDataByInvitationIdDocument = gql`
    query getFormFieldsAndAnswerDataByInvitationId($invitationId: uuid!) {
  FormInvitation(where: {id: {_eq: $invitationId}}) {
    Form {
      FormFields(order_by: {field: asc}) {
        id
        field
        type
        Section {
          id
          key
          content
          parentSectionId: sectionId
          ParentSection {
            id
            key
            content
          }
        }
        Question {
          id
          key
          parentQuestionId
        }
        fieldOptions
        interface
        interfaceOptions
        display
        displayRules
        groupField
        subtheme
        formId
        InvitationComments_aggregate(where: {invitationId: {_eq: $invitationId}}) {
          aggregate {
            count
          }
        }
      }
    }
    FormSubmissions(where: {_and: [{isActive: {_eq: true}}]}) {
      id
      Answers {
        id
        questionId
        formFieldId
        data
        status
        updated_at
        created_at
      }
    }
  }
}
    `;
export const GetFormInvitationbyStatusDocument = gql`
    query getFormInvitationbyStatus($status: String!, $curationStatus: String!) {
  FormInvitation(where: {status: {_eq: $status}}) {
    WebCurations(where: {status: {_eq: $curationStatus}}) {
      id
      status
    }
    id
    status
    companyId
  }
}
    `;
export const GetInvitationDetailsDocument = gql`
    query getInvitationDetails($formId: uuid, $companyId: uuid!) {
  FormInvitation(
    where: {_and: {formId: {_eq: $formId}}, companyId: {_eq: $companyId}}
    order_by: {created_at: desc}
  ) {
    id
    formId
    companyId
    status
    created_at
  }
}
    `;
export const GetFormResultBySubmissionIdDocument = gql`
    query getFormResultBySubmissionId($submissionId: uuid) {
  FormResult(where: {submissionId: {_eq: $submissionId}}) {
    id
    score
    questionId
    sectionId
    submissionId
    recommendations
    isActive
  }
}
    `;
export const GetGlobalMasterByInternalRequestCompanyDocument = gql`
    query GetGlobalMasterByInternalRequestCompany {
  GlobalMaster(where: {type: {_eq: "InternalRequestCompany"}}) {
    id
    type
    data
  }
}
    `;
export const GetGlobalMasterByBrsrTemplateDocument = gql`
    query GetGlobalMasterByBRSRTemplate {
  GlobalMaster(where: {type: {_eq: "BRSRTemplate"}}) {
    id
    platformId
    type
    data
  }
}
    `;
export const GetGlobalMasterByCountryDocument = gql`
    query GetGlobalMasterByCountry {
  GlobalMaster(where: {type: {_eq: "CountryMaster"}}) {
    id
    type
    data
  }
}
    `;
export const GetGlobalMasterByEmailOnSubmissionDocument = gql`
    query GetGlobalMasterByEmailOnSubmission {
  GlobalMaster(where: {type: {_eq: "SendSuccessEmailOnSubmissionFormList"}}) {
    id
    type
    data
  }
}
    `;
export const GetGlobalMasterByTypeListDocument = gql`
    query getGlobalMasterByTypeList($type: [String!]) {
  GlobalMaster(where: {type: {_in: $type}}) {
    id
    platformId
    type
    data
  }
}
    `;
export const GetGlobalMasterByTypeDocument = gql`
    query getGlobalMasterByType($type: String!) {
  GlobalMaster(where: {type: {_eq: $type}}) {
    id
    platformId
    type
    data
  }
}
    `;
export const GetGlobalMasterDatabyCityStateCountryDocument = gql`
    query GetGlobalMasterDatabyCityStateCountry($type: String) {
  GlobalMaster(where: {type: {_eq: $type}}) {
    id
    type
    data
  }
}
    `;
export const GetGlobalMasterDataForInviterFormAutoAppoverDocument = gql`
    query GetGlobalMasterDataForInviterFormAutoAppover {
  GlobalMaster(where: {type: {_eq: "InviterFormAutoAppover"}}) {
    id
    type
    data
  }
}
    `;
export const GetGlobalMasterFormIconsDocument = gql`
    query GetGlobalMasterFormIcons {
  GlobalMaster(where: {type: {_eq: "FormIcons"}}) {
    id
    platformId
    type
    data
  }
}
    `;
export const GetglobalmasterdataforfundtypeDocument = gql`
    query getglobalmasterdataforfundtype {
  GlobalMaster(where: {type: {_eq: "companyFundType"}}) {
    id
    data
    platformId
    type
  }
}
    `;
export const GetInputFieldFromFormIdDocument = gql`
    query getInputFieldFromFormId($formId: uuid!, $invitationId: uuid!, $inputFields: [String!]!) {
  FormField(
    where: {type: {_in: $inputFields}, questionId: {_is_null: false}, formId: {_eq: $formId}}
  ) {
    id
    fieldOptions
    dataPoint
    Suggestions(where: {formInvitationId: {_eq: $invitationId}}) {
      id
    }
  }
}
    `;
export const GetInterimAnsweridFromAnsweridDocument = gql`
    query getInterimAnsweridFromAnswerid($answerId: [uuid!]!) {
  Interim_Answer(where: {answerId: {_in: $answerId}}) {
    id
    answerId
    interim_answer_id
  }
}
    `;
export const GetinterimcommentsbyrecommendidDocument = gql`
    query getinterimcommentsbyrecommendid($recommendationId: uuid) {
  Interim_Comments(
    where: {interim_recommendation_id: {_eq: $recommendationId}}
    order_by: {created_at: asc}
  ) {
    id
    comments
    upload_document
    updated_by
    updated_at
    filename
    interim_recommendation_id
    created_by
    created_at
    User {
      id
      name
    }
    Interim_Recommendation {
      status
    }
  }
}
    `;
export const GetInterimRecommendationBySubmissionIdDocument = gql`
    query getInterimRecommendationBySubmissionId($submissionId: uuid) {
  Interim_Answer(where: {submissionId: {_eq: $submissionId}}) {
    id
    status
    submissionId
    Interim_Recommendations {
      id
      recommendations
      status
      interim_answer_id
    }
  }
}
    `;
export const GetInterimScoreCalculationDetailsDocument = gql`
    query getInterimScoreCalculationDetails($invitationId: uuid!, $submissionId: uuid!, $formId: uuid!) {
  FormInvitation(where: {id: {_eq: $invitationId}}) {
    companyId
    created_by
  }
  Form(where: {id: {_eq: $formId}}) {
    id
    calc
    Sections {
      id
      key
      calc
      ChildSections {
        id
        key
        calc
      }
      Questions {
        id
        key
        calc
        FormFields {
          id
          field
          interface
          recommendationCalc
        }
        Interim_Answers(where: {submissionId: {_eq: $submissionId}}) {
          id
          data
          status
          created_by
          updated_by
          FormField {
            id
            field
          }
        }
      }
      sectionId
    }
  }
  GlobalMaster(where: {type: {_eq: "OnFormScoreCalculationTrigger"}}) {
    id
    platformId
    data
    type
  }
  reopenlist_FormInvitation: FormInvitation(
    where: {_and: [{id: {_eq: $invitationId}}]}
  ) {
    id
    formId
    status
    companyByParentcompanyid {
      id
    }
  }
}
    `;
export const GetinterimwarninglogsbyInvitationIdDocument = gql`
    query getinterimwarninglogsbyInvitationId($invitationId: [uuid!]!) {
  ValidationWarningLogs(
    where: {InvitationId: {_in: $invitationId}, IsActive: {_eq: true}, Logtype: {_eq: "recommendation"}}
    order_by: {created_at: desc}
  ) {
    Id
    OldValue
    NewValue
    Ratio
    formFieldId
    QuestionId
    InvitationId
    values
    Logtype
    created_by
    updated_by
  }
}
    `;
export const GetInvitaionListByFormIdDocument = gql`
    query getInvitaionListByFormId($formId: uuid!) {
  FormInvitation(where: {formId: {_eq: $formId}}) {
    id
    parentcompanyId
    companyId
  }
}
    `;
export const GetInvitationAndSubmissionDetailsByInvitationIdDocument = gql`
    query getInvitationAndSubmissionDetailsByInvitationId($invitationId: uuid!, $includeAllSections: Boolean!) {
  FormInvitation(
    where: {_and: [{id: {_eq: $invitationId}}, {isActive: {_eq: true}}]}
  ) {
    id
    status
    formId
    parentcompanyId
    interimCheck
    companyId
    reviewerDetails
    metadata
    ParentCompanyMapping {
      Id
      UserId
      ParentUserId
    }
    parentCompanyMappingByReviewerparentcompanyid {
      Id
      UserId
      ParentUserId
    }
    FormSubmissions(where: {_and: [{isActive: {_eq: true}}]}) {
      id
      status
    }
    Form {
      formtype
      isDelegateQuestion
      name
      Sections(order_by: {key: asc}, limit: 1) {
        Questions(order_by: {key: asc}, limit: 1) {
          id
          content
        }
      }
      AllSections: Sections @include(if: $includeAllSections) {
        Questions {
          FormFields {
            id
            interfaceOptions
            groupField
            questionId
          }
        }
      }
    }
  }
}
    `;
export const GetinvitationcommentDocument = gql`
    query getinvitationcomment($where: InvitationComment_bool_exp) {
  InvitationComment(where: $where) {
    id
    content
    status
    created_at
    formFieldId
    User {
      id
      name
      UserRoles {
        roleName
      }
      Company {
        id
        name
      }
    }
    Company {
      id
      name
    }
  }
}
    `;
export const GetInvitationCommentsByDateDocument = gql`
    query getInvitationCommentsByDate($startDate: timestamptz, $endDate: timestamptz) {
  InvitationComment(
    where: {created_at: {_gte: $startDate, _lte: $endDate}, isActive: {_eq: true}}
  ) {
    id
    companyId
    invitationId
    userId
    content
    isActive
    FormField {
      id
      field
      fieldOptions
      type
      subtheme
      interfaceOptions
      interface
      Section {
        id
        content
        ParentSection {
          id
          content
        }
      }
      Form {
        id
        name
        FormFields(where: {interface: {_in: ["group-wizard", "group-detail"]}}) {
          interfaceOptions
          interface
          questionId
          groupField
        }
        FormsIds {
          formId
          groupFormId
        }
      }
      Question {
        id
        key
        content
        FormFields {
          questionId
          field
          interfaceOptions
          groupField
        }
      }
    }
    Company {
      name
      Platform {
        origin
      }
    }
    User {
      id
      name
      isEmailSubscribed
      UserRoles {
        userId
        roleName
      }
    }
    FormInvitation {
      email
      ParentCompanyMapping {
        ParentUserId
        UserId
        CompanyId
        ParentCompanyId
        VCCompanyUser: companyByParentcompanyid {
          Users(where: {UserRoles: {roleName: {_eq: "Inviter"}}}) {
            id
            name
            email
            isEmailSubscribed
          }
        }
        PCCompanyUser: Company {
          Users(where: {UserRoles: {roleName: {_eq: "Invitee"}}}) {
            id
            name
            email
            isEmailSubscribed
          }
        }
        VCuser: userByParentuserid {
          id
          name
          email
          isEmailSubscribed
        }
        PCUser: User {
          id
          name
          email
          isEmailSubscribed
        }
      }
      Company {
        Users(where: {UserRoles: {roleName: {_eq: "Inviter"}}}) {
          id
          name
          email
          isEmailSubscribed
        }
      }
      parentcompanyId
      companyByParentcompanyid {
        name
        metadata
        Users(where: {UserRoles: {roleName: {_eq: "Inviter"}}}) {
          id
          name
          email
          isEmailSubscribed
        }
      }
      ParentCompanyMapping {
        ParentCompanyId
        companyByParentcompanyid {
          name
          Users(where: {UserRoles: {roleName: {_eq: "Inviter"}}}) {
            id
            name
            email
            isEmailSubscribed
          }
        }
      }
    }
  }
}
    `;
export const GetInvitationDetailsByIdDocument = gql`
    query getInvitationDetailsById($invitationId: uuid, $questionId: uuid) {
  FormInvitation(where: {id: {_eq: $invitationId}}) {
    id
    AssesseeUserMappings(where: {questionId: {_eq: $questionId}}) {
      userByUserid {
        id
        UserRoles(where: {roleName: {_eq: "Responder"}}) {
          User {
            id
            name
            email
          }
        }
      }
    }
  }
}
    `;
export const GetInvitationDetailsByCompanyIdDocument = gql`
    query getInvitationDetailsByCompanyId($companyId: uuid) {
  FormInvitation(
    where: {companyId: {_eq: $companyId}, _and: {reviewerDetails: {_neq: "null"}}}
  ) {
    id
    email
    companyId
    reviewerDetails
    reviewerParentCompanyId
  }
}
    `;
export const GetInvitationDetailsByInviationIdDocument = gql`
    query getInvitationDetailsByInviationId($invitationId: uuid) {
  FormInvitation(where: {id: {_eq: $invitationId}}) {
    id
    AssesseeUserMappings {
      userByUserid {
        id
        UserRoles(where: {roleName: {_eq: "Responder"}}) {
          User {
            id
            name
            email
          }
        }
      }
    }
  }
}
    `;
export const GetinvitationSkipStatusDocument = gql`
    query getinvitationSkipStatus($formInvitationId: uuid!) {
  FormInvitation(where: {id: {_eq: $formInvitationId}}) {
    status
  }
}
    `;
export const GetinvitationstatusandreopenlistDocument = gql`
    query getinvitationstatusandreopenlist($invitationId: uuid!, $type: String) {
  FormInvitation(where: {_and: [{id: {_eq: $invitationId}}]}) {
    id
    formId
    status
    companyByParentcompanyid {
      id
    }
  }
  GlobalMaster(where: {type: {_eq: $type}}) {
    data
    id
  }
}
    `;
export const GetInvitationStatusCountsDocument = gql`
    query getInvitationStatusCounts($invitationId: uuid!) {
  FormInvitation(
    where: {_and: [{id: {_eq: $invitationId}}, {isActive: {_eq: true}}]}
  ) {
    id
    companyId
    formId
    reviewerDetails
    ParentCompanyMapping {
      Id
      UserId
      ParentUserId
    }
    parentCompanyMappingByReviewerparentcompanyid {
      Id
      UserId
      ParentUserId
    }
    FormSubmissions(where: {_and: [{isActive: {_eq: true}}]}) {
      id
      status
    }
    ReviewerDetailsMappings(order_by: [{Question: {key: asc}}]) {
      id
      currentStatus
      questionId
      Question {
        key
      }
      MakerCheckerRemarks(
        where: {remark: {_neq: "Answered by Maker"}}
        order_by: {created_at: asc}
      ) {
        remark
        created_at
        status
        Ismailsent
      }
    }
    Declined_Questions_aggregate: ReviewerDetailsMappings_aggregate(
      where: {currentStatus: {_eq: "Declined"}}
    ) {
      aggregate {
        count
      }
    }
    Resubmitted_Questions_aggregate: ReviewerDetailsMappings_aggregate(
      where: {currentStatus: {_eq: "Re-Submitted"}}
    ) {
      aggregate {
        count
      }
    }
    Form {
      FormFields_aggregate(
        where: {questionId: {_is_null: false}, groupField: {_like: "%tabs%"}}
      ) {
        aggregate {
          count
        }
      }
    }
  }
}
    `;
export const GetInvitationSuggestionDataDocument = gql`
    query getInvitationSuggestionData($invitationId: [uuid!]!, $inputFields: [String!]!) {
  FormInvitation(where: {id: {_in: $invitationId}}) {
    id
    Suggestions {
      id
      selectedByUserId
      isSelected
      formFieldId
      suggestion
      FormField {
        id
        type
        field
        questionId
        fieldOptions
      }
    }
    Form {
      FormFields(where: {questionId: {_is_null: false}, type: {_in: $inputFields}}) {
        id
        fieldOptions
        displayRules
        type
        questionId
        Question {
          key
        }
      }
    }
  }
}
    `;
export const GetInvitaionListByFormIdandDateDocument = gql`
    query getInvitaionListByFormIdandDate($formId: uuid!, $expectedDaterecomm: timestamp!, $recommendationStatus: [String!]) {
  Interim_Recommendation(
    where: {_or: [{expectedDate: {_eq: $expectedDaterecomm}}, {ReminderIntervalAfterDueDate: {_eq: $expectedDaterecomm}}], status: {_in: $recommendationStatus}, Interim_Answer: {FormSubmission: {FormInvitation: {formId: {_eq: $formId}}}}}
  ) {
    id
    interim_answer_id
    expectedDate
    ReminderIntervalAfterDueDate
    recommendations
    Interim_Answer {
      id
      submissionId
      FormSubmission {
        id
        invitationId
        FormInvitation {
          id
          parentcompanyId
          companyId
        }
      }
    }
  }
}
    `;
export const GetInvitationListByFormIdDocument = gql`
    query getInvitationListByFormId($formId: uuid!, $expectedDaterecomm: timestamp!, $recommendationStatus: [String!]) {
  Interim_Recommendation(
    where: {expectedDate: {_eq: $expectedDaterecomm}, status: {_in: $recommendationStatus}, Interim_Answer: {FormSubmission: {FormInvitation: {formId: {_eq: $formId}}}}}
  ) {
    id
    interim_answer_id
    expectedDate
    ReminderIntervalAfterDueDate
    recommendations
    Interim_Answer {
      id
      submissionId
      FormSubmission {
        id
        invitationId
        FormInvitation {
          id
          parentcompanyId
          companyId
        }
      }
    }
  }
}
    `;
export const GetInvitedAssessmentListByCompanyIdDocument = gql`
    query getInvitedAssessmentListByCompanyId($companyId: uuid!) {
  FormInvitation(
    where: {_and: {status: {_eq: "Invited"}}, companyId: {_eq: $companyId}}
  ) {
    id
    formId
    companyId
    parentcompanyId
    email
    reviewerDetails
    reviewerParentCompanyId
    Form {
      id
      name
    }
  }
}
    `;
export const GetInvitersDocument = gql`
    query GetInviters {
  User(where: {UserRoles: {roleName: {_eq: "Inviter"}}}) {
    id
    name
    email
    Company {
      id
      name
    }
  }
}
    `;
export const CheckIsPasswordResetDocument = gql`
    query CheckIsPasswordReset($email: String!) {
  User(where: {email: {_eq: $email}}) {
    id
    IsPasswordReset
  }
}
    `;
export const GetLastInvitationAnswerDetailsForCompanyByUserIdDocument = gql`
    query getLastInvitationAnswerDetailsForCompanyByUserId($userIds: [uuid!]!, $formId: uuid, $parentcompanyId: uuid, $status: [String!]!) {
  User(where: {id: {_in: $userIds}}) {
    id
    Company {
      LastFormInvitationWithoutUserId: ParentCompanyMappings(
        where: {ParentCompanyId: {_eq: $parentcompanyId}, FormInvitations: {_and: [{formId: {_eq: $formId}}, {status: {_in: ["Submitted", "Approved"]}}]}}
        order_by: {FormInvitations_aggregate: {max: {created_at: desc}}}
        limit: 1
      ) {
        id: CompanyId
        FormInvitations(
          where: {formId: {_eq: $formId}, isActive: {_eq: true}, status: {_in: ["Submitted", "Approved"]}, parentcompanyId: {_eq: $parentcompanyId}}
          order_by: {created_at: desc}
          limit: 1
        ) {
          id
          companyId
          created_at
          FormSubmissions(where: {isActive: {_eq: true}}) {
            Interim_Answers_aggregate {
              aggregate {
                count
              }
            }
            Interim_Answers {
              isDeleted
              updated_by
              id
              formFieldId
              submissionId
              questionId
              data
              created_by
              Interim_Recommendations(where: {status: {_nin: $status}}) {
                interim_answer_id
                id
              }
              FormSubmission {
                invitationId
              }
              Interim_Answer {
                isDeleted
                submissionId
                Interim_Recommendations(where: {status: {_nin: $status}}) {
                  interim_answer_id
                  id
                }
              }
            }
          }
        }
      }
    }
  }
}
    `;
export const GetLastInvitationAnswerDetailsForUserByUserIdDocument = gql`
    query getLastInvitationAnswerDetailsForUserByUserId($userIds: [uuid!]!, $formId: uuid, $parentcompanyId: uuid, $status: [String!]!) {
  User(where: {id: {_in: $userIds}}) {
    id
    Company {
      LastFormInvitation: ParentCompanyMappings(
        where: {ParentCompanyId: {_eq: $parentcompanyId}, UserId: {_in: $userIds}, FormInvitations: {_and: [{formId: {_eq: $formId}}, {status: {_in: ["Submitted", "Approved"]}}]}}
        order_by: {FormInvitations_aggregate: {max: {created_at: desc}}}
        limit: 1
      ) {
        id: CompanyId
        FormInvitations(
          where: {formId: {_eq: $formId}, isActive: {_eq: true}, status: {_in: ["Submitted", "Approved"]}, parentcompanyId: {_eq: $parentcompanyId}}
          order_by: {created_at: desc}
          limit: 1
        ) {
          id
          companyId
          created_at
          FormSubmissions(where: {isActive: {_eq: true}}) {
            Interim_Answers_aggregate {
              aggregate {
                count
              }
            }
            Interim_Answers {
              isDeleted
              updated_by
              id
              formFieldId
              submissionId
              questionId
              data
              created_by
              Interim_Recommendations(where: {status: {_nin: $status}}) {
                interim_answer_id
                id
              }
              FormSubmission {
                invitationId
              }
              Interim_Answer {
                isDeleted
                submissionId
                Interim_Recommendations(where: {status: {_nin: $status}}) {
                  interim_answer_id
                  id
                }
              }
            }
          }
        }
      }
    }
  }
}
    `;
export const GetLastInvitationAnswerDetailsDocument = gql`
    query getLastInvitationAnswerDetails($companyId: [uuid!]!, $formId: uuid, $parentcompanyId: uuid, $status: [String!]!) {
  LastFormInvitation: Company(where: {id: {_in: $companyId}}) {
    id
    FormInvitations(
      where: {formId: {_eq: $formId}, isActive: {_eq: true}, status: {_in: ["Submitted", "Approved"]}, parentcompanyId: {_eq: $parentcompanyId}}
      order_by: {created_at: desc}
      limit: 1
    ) {
      id
      companyId
      created_at
      FormSubmissions(where: {isActive: {_eq: true}}) {
        Interim_Answers_aggregate {
          aggregate {
            count
          }
        }
        Interim_Answers {
          isDeleted
          updated_by
          id
          formFieldId
          submissionId
          questionId
          data
          created_by
          Interim_Recommendations(where: {status: {_nin: $status}}) {
            interim_answer_id
            id
          }
          FormSubmission {
            invitationId
          }
          Interim_Answer {
            isDeleted
            submissionId
            Interim_Recommendations(where: {status: {_nin: $status}}) {
              interim_answer_id
              id
            }
          }
        }
      }
    }
  }
}
    `;
export const GetLastSubmittedInvitationDocument = gql`
    query getLastSubmittedInvitation($formId: uuid!, $companyId: uuid!, $currentInvitationId: uuid!) {
  FormSubmission(
    where: {_and: [{status: {_eq: "Successful"}}, {isActive: {_eq: true}}, {FormInvitation: {formId: {_eq: $formId}}}, {FormInvitation: {companyId: {_eq: $companyId}}}, {FormInvitation: {isActive: {_eq: true}}}, {invitationId: {_neq: $currentInvitationId}}]}
    order_by: {updated_at: desc}
    limit: 1
  ) {
    id
    invitationId
    status
    created_at
    updated_at
    FormInvitation {
      id
      companyId
      formId
      status
      created_at
      email
    }
    Answers {
      id
      questionId
      formFieldId
      data
      status
      isDeleted
    }
  }
}
    `;
export const GetLatestAnsweredQuestionIdDocument = gql`
    query getLatestAnsweredQuestionId($invitationId: uuid) {
  FormSubmission(where: {invitationId: {_eq: $invitationId}}) {
    id
    invitationId
    Answers(
      order_by: {updated_at: desc}
      limit: 1
      where: {created_by: {_is_null: false}}
    ) {
      id
      questionId
    }
  }
}
    `;
export const GetLatestAssignedQuestionIdDocument = gql`
    query getLatestAssignedQuestionId($invitationId: uuid, $userId: uuid) {
  AssesseeUserMapping(
    where: {_and: [{userId: {_eq: $userId}}], InvitationId: {_eq: $invitationId}}
    limit: 1
    order_by: {updated_at: desc}
  ) {
    id
    userId
    questionId
    InvitationId
  }
}
    `;
export const GetParentCompanyMappingDetailsByCompanyIdDocument = gql`
    query getParentCompanyMappingDetailsByCompanyId($companyId: uuid) {
  ParentCompanyMapping(
    where: {_and: [{CompanyId: {_eq: $companyId}}, {isActive: {_eq: true}}]}
  ) {
    Id
    CompanyId
    ParentCompanyId
    isActive
  }
}
    `;
export const GetParentCompanyByCompanyAndParentCompanyIdDocument = gql`
    query getParentCompanyByCompanyAndParentCompanyId($companyId: uuid!, $parentCompanyId: uuid!) {
  ParentCompanyMapping(
    where: {CompanyId: {_eq: $companyId}, ParentCompanyId: {_eq: $parentCompanyId}}
  ) {
    Id
  }
}
    `;
export const GetParentCompanyByUserAndAddressIdDocument = gql`
    query getParentCompanyByUserAndAddressId($userId: [uuid!], $parentUserId: uuid!, $addressId: uuid!) {
  ParentCompanyMapping(
    where: {UserId: {_in: $userId}, ParentUserId: {_eq: $parentUserId}, AddressId: {_eq: $addressId}}
  ) {
    Id
    UserId
    ParentUserId
    AddressId
    User {
      email
    }
  }
}
    `;
export const GetParentCompanyDetailByUserIdDocument = gql`
    query getParentCompanyDetailByUserId($userId: [uuid!]) {
  ParentCompanyMapping(where: {UserId: {_in: $userId}}) {
    Id
    UserId
    ParentUserId
    AddressId
  }
}
    `;
export const GetParentCompanyByCompanyIdNullDocument = gql`
    query GetParentCompanyByCompanyIdNull($companyId: uuid, $platformId: uuid) {
  Company(
    where: {_and: [{isActive: {_eq: true}}, {platformId: {_eq: $platformId}}, {id: {_eq: $companyId}}], ParentCompanyMappings: {_or: [{ParentCompanyId: {_is_null: true}}], _and: {isActive: {_eq: true}}}}
  ) {
    id
    name
    country
    primaryContact
    isActive
    parentCompanyId
    ParentCompanyMappings {
      ParentCompanyId
    }
  }
}
    `;
export const GetPendingMakerCheckerRemarksDocument = gql`
    query GetPendingMakerCheckerRemarks($where: MakerCheckerRemarks_bool_exp!) {
  MakerCheckerRemarks(where: $where) {
    id
    created_by
    ReviewerDetailsMapping {
      questionId
      FormInvitation {
        id
        companyId
        formId
        Company {
          platformId
        }
        ParentCompanyMapping {
          UserId
        }
      }
    }
    status
    Ismailsent
    created_at
  }
}
    `;
export const GetPlatformAndUserDetailsToGenerateTokenDocument = gql`
    query getPlatformAndUserDetailsToGenerateToken($sharedKey: uuid!, $secretKey: String!, $companyId: uuid!, $userEmail: String!) {
  Platform(where: {id: {_eq: $sharedKey}, apiKey: {_eq: $secretKey}}) {
    id
    Companies(where: {id: {_eq: $companyId}}) {
      id
      Users(where: {companyId: {_eq: $companyId}, email: {_eq: $userEmail}}) {
        id
        companyId
        email
        UserRoles {
          roleName
        }
      }
    }
  }
}
    `;
export const GetPlatformApikeyByPlatformIdAndOriginDocument = gql`
    query getPlatformApikeyByPlatformIdAndOrigin($platformId: uuid!) {
  Platform(where: {id: {_eq: $platformId}}) {
    id
    apiKey
  }
}
    `;
export const GetPostSubmissionRequiredDetailsDocument = gql`
    query getPostSubmissionRequiredDetails($formSubmissionId: uuid!) {
  FormSubmission(where: {id: {_eq: $formSubmissionId}}) {
    FormInvitation {
      companyId
      reviewerParentCompanyId
      Form {
        id
      }
      Company {
        parentCompanyId
        metadata
      }
    }
  }
  Platform {
    id
  }
}
    `;
export const GetProcessingDataByIdAllTypesDocument = gql`
    query getProcessingDataByIdAllTypes($Id: [uuid!]!, $inputFields: [String!]!) {
  AIBulkDocumentProcessing(where: {id: {_in: $Id}}) {
    id
    formInvitationId
    processedDocuments
    requestStatus
    processingType: __typename
    FormInvitation {
      id
      metadata
      FormSubmissions(where: {isActive: {_eq: true}}) {
        Answers {
          formFieldId
          data
          FormField {
            id
            type
            field
            questionId
            fieldOptions
          }
        }
      }
      Form {
        FormFields(where: {questionId: {_is_null: false}, type: {_in: $inputFields}}) {
          id
          fieldOptions
          displayRules
          type
          questionId
          Question {
            key
          }
        }
        formtype
        id
      }
    }
  }
  WebCuration(where: {id: {_in: $Id}}) {
    id
    formInvitationId
    status
    processingType: __typename
    FormInvitation {
      id
      metadata
      FormSubmissions(where: {isActive: {_eq: true}}) {
        Answers {
          formFieldId
          data
          FormField {
            id
            type
            field
            questionId
            fieldOptions
          }
        }
      }
      Form {
        FormFields(where: {questionId: {_is_null: false}, type: {_in: $inputFields}}) {
          id
          fieldOptions
          displayRules
          type
          questionId
          Question {
            key
          }
        }
        formtype
        id
      }
    }
  }
  OPSToIQCuration(where: {id: {_in: $Id}}) {
    id
    formInvitationId
    status
    processingType: __typename
    FormInvitation {
      id
      metadata
      FormSubmissions(where: {isActive: {_eq: true}}) {
        Answers {
          formFieldId
          data
          FormField {
            id
            type
            field
            questionId
            fieldOptions
          }
        }
      }
      Form {
        FormFields(where: {questionId: {_is_null: false}, type: {_in: $inputFields}}) {
          id
          fieldOptions
          displayRules
          type
          questionId
          Question {
            key
          }
        }
        formtype
        id
      }
    }
  }
}
    `;
export const GetProcessingDataByIdDocument = gql`
    query getProcessingDataById($Id: [uuid!]!, $inputFields: [String!]!) {
  AIBulkDocumentProcessing(where: {id: {_in: $Id}}) {
    id
    formInvitationId
    processedDocuments
    requestStatus
    FormInvitation {
      id
      FormSubmissions(where: {isActive: {_eq: true}}) {
        Answers {
          formFieldId
          data
          FormField {
            id
            type
            field
            questionId
            fieldOptions
          }
        }
      }
      Form {
        FormFields(where: {questionId: {_is_null: false}, type: {_in: $inputFields}}) {
          id
          fieldOptions
          displayRules
          type
          questionId
          Question {
            key
          }
        }
        formtype
        id
      }
    }
  }
}
    `;
export const GetProcessingDataByInvitationIdDocument = gql`
    query getProcessingDataByInvitationId($invitationId: uuid!) {
  FormInvitation(where: {id: {_eq: $invitationId}}) {
    Form {
      title
      formtype
    }
    Company {
      name
    }
    status
    metadata
  }
}
    `;
export const GetProgressReportbySubmissionIdDocument = gql`
    query getProgressReportbySubmissionId($submissionId: uuid) {
  CarryForwardInterimLogs: InterimFormLogs(
    where: {submissionId: {_eq: $submissionId}, Interim_Answer: {Interim_Answer: {Interim_Recommendations: {isApproved: {_eq: true}}}}}
    order_by: {created_at: asc}
  ) {
    created_at
    score
    submissionId
    status
    updated_at
  }
  InterimFormLogs(
    where: {submissionId: {_eq: $submissionId}, Interim_Answer: {Interim_Recommendations: {isApproved: {_eq: true}}}}
    order_by: {created_at: asc}
  ) {
    created_at
    score
    submissionId
    status
    updated_at
  }
  DefaultInterimLogs: InterimFormLogs(
    where: {submissionId: {_eq: $submissionId}}
    order_by: {created_at: asc}
    limit: 1
  ) {
    created_at
    score
    submissionId
    status
    updated_at
  }
  Interim_Answer(limit: 1, where: {submissionId: {_eq: $submissionId}}) {
    isViewOnly
  }
  Interim_Recommendation(
    limit: 1
    order_by: {updated_at: desc}
    where: {isApproved: {_eq: true}}
  ) {
    id
    interim_answer_id
    created_at
    updated_at
    Interim_Answer {
      id
    }
  }
}
    `;
export const GetQuestionsFromFormIdDocument = gql`
    query getQuestionsFromFormId($formId: uuid!) {
  Question(
    where: {Section: {formId: {_eq: $formId}}, parentQuestionId: {_is_null: true}}
    order_by: {created_at: asc}
  ) {
    content
    id
    key
    parentQuestionId
    sectionId
    tags
    updated_at
    weightage
    calc
    FormFields(order_by: {seqIndex: asc}) {
      created_at
      display
      displayOptions
      displayRules
      field
      fieldOptions
      formId
      groupField
      id
      interface
      interfaceOptions
      questionId
      sectionId
      seqIndex
      type
      updated_at
      validationRules
    }
  }
}
    `;
export const GetQuestionListByInvitationIdDocument = gql`
    query getQuestionListByInvitationId($invitationId: uuid) {
  FormInvitation(
    where: {_and: [{id: {_eq: $invitationId}}, {isActive: {_eq: true}}]}
  ) {
    Form {
      id
      name
      Sections {
        id
        Questions {
          id
          content
          FormFields {
            id
            questionId
            sectionId
            fieldOptions
          }
        }
      }
    }
  }
}
    `;
export const GetQuestionnaireDetailsForDeletionDocument = gql`
    query GetQuestionnaireDetailsForDeletion($formid: uuid!) {
  Form(where: {id: {_eq: $formid}}) {
    Sections {
      id
      Questions {
        id
      }
    }
    FormFields {
      id
    }
    FormInvitations {
      id
      FormSubmissions {
        id
      }
    }
  }
}
    `;
export const GetQuestionnaireFiltersDataDocument = gql`
    query GetQuestionnaireFiltersData {
  FormTypes: Form(distinct_on: [type]) {
    type
  }
  FormTags: Form(distinct_on: [tags], where: {tags: {_is_null: false}}) {
    tags
  }
}
    `;
export const GetQuestionnaireListDocument = gql`
    query GetQuestionnaireList($limit: Int!, $offset: Int!, $where: Form_bool_exp, $orderBy: [Form_order_by!]) {
  Form(limit: $limit, offset: $offset, where: $where, order_by: $orderBy) {
    id
    title
    description
    type
    tags
    created_at
    updated_at
    formtype
    isOldQuestionnaire
    CompanyForms {
      companyId
      Company {
        id
        name
      }
    }
    FormInvitations(limit: 1) {
      id
    }
    newformslogs_aggregate {
      aggregate {
        count
      }
    }
  }
  Form_aggregate(where: $where) {
    aggregate {
      count
    }
  }
}
    `;
export const GetQuestionnaireLogsDocument = gql`
    query GetQuestionnaireLogs($formid: uuid!, $limit: Int!, $offset: Int!, $where: newformslogs_bool_exp!, $orderBy: [newformslogs_order_by!]) {
  newformslogs(
    limit: $limit
    offset: $offset
    where: {_and: [{formid: {_eq: $formid}}, $where]}
    order_by: $orderBy
  ) {
    id
    event_type
    form_title
    number_of_questions
    time_in_minutes
    form_type
    created_at
    User {
      name
      email
    }
  }
  newformslogs_aggregate(where: {_and: [{formid: {_eq: $formid}}, $where]}) {
    aggregate {
      count
    }
  }
}
    `;
export const RaraCompanyAccessDocument = gql`
    query raraCompanyAccess($companyIdList: [uuid!]!, $companyId: uuid!) {
  ParentCompanyMapping(
    where: {ParentCompanyId: {_in: $companyIdList}, CompanyId: {_eq: $companyId}, isActive: {_eq: true}}
  ) {
    CompanyId
    ParentCompanyId
    Id
    __typename
  }
}
    `;
export const GetvalidationandratingDocument = gql`
    query getvalidationandrating($invitationId: [uuid!]!) {
  RaraValidationAndRating(where: {invitationId: {_in: $invitationId}}) {
    data
    formFieldId
    id
    type
    submissionId
    invitationId
    created_at
    fileId
  }
}
    `;
export const GetRecomendationBySubmissionIdAndFormfieldIdDocument = gql`
    query getRecomendationBySubmissionIdAndFormfieldId($formfieldid: [uuid!]!, $submissionid: uuid) {
  Interim_Answer(
    where: {submissionId: {_eq: $submissionid}, formFieldId: {_in: $formfieldid}}
  ) {
    formFieldId
    Interim_Recommendations(where: {status: {_neq: "Closed"}}) {
      id
      answeroption
      status
      interim_answer_id
    }
    Interim_Answer {
      formFieldId
      Interim_Recommendations(where: {status: {_neq: "Closed"}}) {
        id
        answeroption
        status
        interim_answer_id
      }
    }
  }
  Answer(
    where: {submissionId: {_eq: $submissionid}, formFieldId: {_in: $formfieldid}}
  ) {
    formFieldId
    Interim_Answers {
      formFieldId
      Interim_Recommendations(where: {status: {_neq: "Closed"}}) {
        id
        answeroption
        status
        interim_answer_id
      }
      Interim_Answer {
        formFieldId
        Interim_Recommendations(where: {status: {_neq: "Closed"}}) {
          id
          answeroption
          status
          interim_answer_id
        }
      }
      Interim_Answers {
        formFieldId
        Interim_Recommendations(where: {status: {_neq: "Closed"}}) {
          id
          answeroption
          status
          interim_answer_id
        }
      }
    }
  }
}
    `;
export const GetRecommendationByInterimAnswerIdAndQuestionIdDocument = gql`
    query getRecommendationByInterimAnswerIdAndQuestionId($interimAnswerId: uuid!, $questionId: uuid!) {
  Interim_Recommendation(
    where: {interim_answer_id: {_eq: $interimAnswerId}, questionId: {_eq: $questionId}}
  ) {
    id
    interim_answer_id
    questionId
    status
    recommendations
    answeroption
  }
}
    `;
export const GetRecommendationListByInvitationIdDocument = gql`
    query getRecommendationListByInvitationId($invitationId: uuid, $questionId: uuid!) {
  FormInvitation(where: {id: {_eq: $invitationId}}) {
    id
    created_at
    status
    Form {
      id
      name
    }
    companyId
    Company {
      name
    }
    interimCheck
    FormSubmissions(where: {_and: [{isActive: {_eq: true}}]}) {
      id
      addRecommendation: Interim_Answers(
        where: {questionId: {_eq: $questionId}}
        order_by: {created_at: desc}
      ) {
        id
        formFieldId
        isViewOnly
      }
      Interim_Answers(
        where: {_and: {Interim_Recommendations: {id: {_is_null: false}}, questionId: {_eq: $questionId}}}
        order_by: {created_at: desc}
      ) {
        submissionId
        questionId
        id
        formFieldId
        isViewOnly
        Interim_Recommendations(order_by: {created_at: desc}) {
          created_at
          updated_at
          created_by
          updated_by
          status
          recommendations
          questionId
          Question {
            key
          }
          Interim_Answer {
            FormField {
              field
              created_at
            }
          }
          isActive
          id
          expectedDate
          answeroption
          ReminderIntervalAfterDueDate
          Interim_Comments(order_by: {created_at: asc}) {
            id
            comments
            upload_document
            updated_by
            updated_at
            interim_recommendation_id
            created_by
            created_at
            filename
            User {
              id
              name
            }
          }
        }
        Interim_Answer {
          Interim_Recommendations(order_by: {created_at: desc}) {
            updated_by
            updated_at
            status
            recommendations
            questionId
            Question {
              key
            }
            isActive
            interim_answer_id
            Interim_Answer {
              FormField {
                field
                created_at
              }
            }
            id
            expectedDate
            created_by
            created_at
            answeroption
            isApproved
            ReminderIntervalAfterDueDate
            Interim_Comments {
              upload_document
              updated_by
              updated_at
              interim_recommendation_id
              id
              filename
              created_by
              created_at
              comments
            }
          }
        }
      }
      carryforwardAfterSubmit: Interim_Answers(
        where: {_and: {Interim_Answer: {id: {_is_null: false}}, questionId: {_eq: $questionId}}}
        order_by: {created_at: desc}
      ) {
        submissionId
        questionId
        id
        formFieldId
        isViewOnly
        Interim_Answer {
          Interim_Recommendations(order_by: {created_at: desc}) {
            updated_by
            updated_at
            status
            recommendations
            questionId
            Question {
              key
            }
            isActive
            interim_answer_id
            Interim_Answer {
              FormField {
                field
                created_at
              }
            }
            id
            expectedDate
            created_by
            created_at
            answeroption
            isApproved
            ReminderIntervalAfterDueDate
            Interim_Comments {
              upload_document
              updated_by
              updated_at
              interim_recommendation_id
              id
              filename
              created_by
              created_at
              comments
            }
          }
        }
      }
      Answers(where: {questionId: {_eq: $questionId}}) {
        id
        questionId
        formFieldId
        carryforwardbeforesubmit0: Interim_Answers(
          where: {Interim_Recommendations: {id: {_is_null: false}}}
        ) {
          Interim_Recommendations(order_by: {created_at: desc}) {
            created_at
            updated_at
            created_by
            updated_by
            status
            recommendations
            questionId
            Question {
              key
            }
            isActive
            id
            expectedDate
            answeroption
            ReminderIntervalAfterDueDate
            Interim_Comments(order_by: {created_at: asc}) {
              id
              comments
              upload_document
              updated_by
              updated_at
              interim_recommendation_id
              created_by
              created_at
              User {
                id
                name
              }
            }
          }
        }
        carryforwardbeforesubmit1: Interim_Answers(
          where: {Interim_Answer: {id: {_is_null: false}}}
        ) {
          Interim_Answer {
            Interim_Recommendations(order_by: {created_at: desc}) {
              created_at
              updated_at
              created_by
              updated_by
              status
              recommendations
              questionId
              Question {
                key
              }
              isActive
              id
              expectedDate
              answeroption
              ReminderIntervalAfterDueDate
              Interim_Comments(order_by: {created_at: asc}) {
                id
                comments
                upload_document
                updated_by
                updated_at
                interim_recommendation_id
                created_by
                created_at
                User {
                  id
                  name
                }
              }
            }
          }
        }
        carryforwardbeforesubmit2: Interim_Answers(
          where: {Interim_Answers: {id: {_is_null: false}}}
        ) {
          Interim_Answers {
            Interim_Recommendations(order_by: {created_at: desc}) {
              created_at
              updated_at
              created_by
              updated_by
              status
              recommendations
              questionId
              Question {
                key
              }
              isActive
              id
              expectedDate
              answeroption
              ReminderIntervalAfterDueDate
              Interim_Comments(order_by: {created_at: asc}) {
                id
                comments
                upload_document
                updated_by
                updated_at
                interim_recommendation_id
                created_by
                created_at
                User {
                  id
                  name
                }
              }
            }
          }
        }
      }
    }
  }
}
    `;
export const GetRecommendationListDocument = gql`
    query getRecommendationList($invitationId: uuid) {
  FormInvitation(where: {id: {_eq: $invitationId}}) {
    id
    created_at
    Form {
      id
      name
    }
    Company {
      name
    }
    reviewerDetails
    FormSubmissions(where: {_and: [{isActive: {_eq: true}}]}) {
      id
      Interim_Answers(
        where: {Interim_Recommendations: {id: {_is_null: false}}}
        order_by: {created_at: desc}
      ) {
        submissionId
        questionId
        formFieldId
        isViewOnly
        Interim_Recommendations(order_by: {created_at: desc}) {
          created_at
          updated_at
          created_by
          updated_by
          status
          recommendations
          questionId
          Question {
            key
          }
          Interim_Answer {
            FormField {
              field
              created_at
            }
          }
          isActive
          id
          expectedDate
          answeroption
          ReminderIntervalAfterDueDate
          Interim_Comments(order_by: {created_at: asc}) {
            id
            comments
            upload_document
            updated_by
            updated_at
            interim_recommendation_id
            created_by
            created_at
            filename
            User {
              id
              name
            }
          }
        }
      }
      carryForWardData: Interim_Answers(
        where: {Interim_Answer: {id: {_is_null: false}}}
        order_by: {created_at: desc}
      ) {
        formFieldId
        isViewOnly
        questionId
        Interim_Answer {
          Interim_Recommendations(order_by: {created_at: desc}) {
            updated_by
            updated_at
            status
            recommendations
            questionId
            Question {
              key
            }
            isActive
            interim_answer_id
            Interim_Answer {
              FormField {
                field
                created_at
              }
            }
            id
            expectedDate
            created_by
            created_at
            answeroption
            isApproved
            ReminderIntervalAfterDueDate
            Interim_Comments {
              upload_document
              updated_by
              updated_at
              interim_recommendation_id
              id
              filename
              created_by
              created_at
              comments
            }
          }
        }
      }
    }
    ParentCompanyMapping {
      UserId
      User {
        id
        name
        email
      }
    }
  }
}
    `;
export const GetRecommendationRenderFormDetailsDocument = gql`
    query getRecommendationRenderFormDetails($invitationId: uuid!) {
  FormInvitation(where: {_and: [{id: {_eq: $invitationId}}]}) {
    ParentCompanyMapping {
      ParentCompanyId
    }
    id
    interimCheck
    status
    companyId
    formId
    Form {
      id
      name
      isDelegateQuestion
      Details {
        focusArea
      }
      FormFields(order_by: {field: asc}) {
        id
        field
        type
        Section {
          id
          key
          content
          parentSectionId: sectionId
          ParentSection {
            id
            key
            content
          }
        }
        Question {
          id
          key
          parentQuestionId
        }
        fieldOptions
        interface
        interfaceOptions
        display
        displayOptions
        displayRules
        validationRules
        seqIndex
        groupField
        recommendationCalc
        subtheme
        formId
        warningRules
        autoCalculatedCalculation
        InvitationComments_aggregate(where: {invitationId: {_eq: $invitationId}}) {
          aggregate {
            count
          }
        }
      }
    }
    FormSubmissions(where: {_and: [{isActive: {_eq: true}}]}) {
      id
      Interim_Answers {
        id
        questionId
        formFieldId
        data
        status
        updated_at
        created_at
        isViewOnly
        Interim_Recommendations(order_by: {created_at: asc}) {
          created_at
          updated_at
          created_by
          updated_by
          status
          recommendations
          questionId
          isActive
          id
          expectedDate
          answeroption
          ReminderIntervalAfterDueDate
        }
        Interim_Answer {
          Interim_Recommendations(order_by: {created_at: asc}) {
            created_at
            updated_at
            created_by
            updated_by
            status
            recommendations
            questionId
            isActive
            id
            expectedDate
            answeroption
            ReminderIntervalAfterDueDate
          }
        }
      }
    }
  }
  AssesseeUserMapping(where: {_and: [{InvitationId: {_eq: $invitationId}}]}) {
    id
    userId
    questionId
    InvitationId
  }
}
    `;
export const GetReminderDetailsByInvitationIdDocument = gql`
    query getReminderDetailsByInvitationId($invitationId: uuid!) {
  Interim_Recommendation(
    where: {Interim_Answer: {FormSubmission: {invitationId: {_eq: $invitationId}}}}
  ) {
    id
    expectedDate
    recommendations
    interim_answer_id
    ReminderIntervalAfterDueDate
  }
}
    `;
export const GetRenderFormDetailsDocument = gql`
    query getRenderFormDetails($invitationId: uuid!) {
  FormInvitation(where: {_and: [{id: {_eq: $invitationId}}]}) {
    ParentCompanyMapping {
      ParentCompanyId
      UserId
      ParentUserId
    }
    id
    interimCheck
    status
    companyId
    formId
    Form {
      id
      name
      formtype
      isAIDataPointsAdded
      isDelegateQuestion
      Details {
        focusArea
      }
    }
    FormSubmissions(where: {_and: [{isActive: {_eq: true}}]}) {
      id
      Answers {
        id
        questionId
        formFieldId
        data
        status
        updated_at
        created_at
      }
      IsCarryForward: Answers(
        where: {Interim_Answers: {id: {_is_null: false}}}
        limit: 1
      ) {
        Interim_Answers {
          id
        }
      }
      Interim_Answers(limit: 1) {
        id
      }
    }
  }
  AssesseeUserMapping(where: {_and: [{InvitationId: {_eq: $invitationId}}]}) {
    id
    userId
    questionId
    InvitationId
  }
}
    `;
export const GetRenderFormFieldDetailsDocument = gql`
    query getRenderFormFieldDetails($invitationId: uuid!) {
  FormInvitation(where: {_and: [{id: {_eq: $invitationId}}]}) {
    Form {
      id
      name
      isDelegateQuestion
      isAIDataPointsAdded
      Details {
        focusArea
      }
      FormFields(order_by: {field: asc}) {
        id
        field
        type
        Section {
          id
          key
          content
          parentSectionId: sectionId
          ParentSection {
            id
            key
            content
          }
        }
        Question {
          id
          key
          parentQuestionId
        }
        questionId
        fieldOptions
        interface
        interfaceOptions
        display
        displayOptions
        displayRules
        validationRules
        seqIndex
        groupField
        recommendationCalc
        subtheme
        formId
        warningRules
        autoCalculatedCalculation
        InvitationComments_aggregate(where: {invitationId: {_eq: $invitationId}}) {
          aggregate {
            count
          }
        }
      }
    }
    Suggestions {
      formFieldId
      id
      suggestion
      isSelected
      selectedByUserId
      SuggestionSourceMappings(order_by: {Source: {type: asc}}) {
        suggestionPageNo
        suggestionInfoContent
        Source {
          id
          type
          url
          SourceFile {
            id
            originalFileUrl
            originalFileName
            created_at
          }
        }
      }
    }
  }
}
    `;
export const GetScoreCalculationDetailsDocument = gql`
    query getScoreCalculationDetails($invitationId: uuid!, $submissionId: uuid!, $formId: uuid!) {
  FormInvitation(where: {id: {_eq: $invitationId}}) {
    companyId
    created_by
    interimCheck
  }
  Form(where: {id: {_eq: $formId}}) {
    id
    calc
    Sections {
      id
      key
      calc
      ChildSections {
        id
        key
        calc
      }
      Questions {
        id
        key
        calc
        FormFields {
          id
          field
          interface
          recommendationCalc
          displayRules
        }
        Answers(where: {submissionId: {_eq: $submissionId}, isDeleted: {_eq: false}}) {
          id
          data
          status
          created_by
          updated_by
          FormField {
            id
            field
          }
          Interim_Answers {
            id
            answerId
            interim_answer_id
            Interim_Recommendations {
              status
              answeroption
            }
          }
        }
        Interim_Answers(
          where: {submissionId: {_eq: $submissionId}, isDeleted: {_eq: false}}
        ) {
          id
          data
          status
          created_by
          updated_by
          FormField {
            id
            field
          }
        }
      }
      sectionId
    }
  }
  GlobalMaster(where: {type: {_eq: "OnFormScoreCalculationTrigger"}}) {
    id
    platformId
    data
    type
  }
  reopenlist_FormInvitation: FormInvitation(
    where: {_and: [{id: {_eq: $invitationId}}]}
  ) {
    id
    formId
    status
    companyByParentcompanyid {
      id
    }
  }
  reopenlist_GlobalMaster: GlobalMaster(
    where: {type: {_eq: "Recommendation_new"}}
  ) {
    id
    data
  }
}
    `;
export const GetSourceFilesByInvitationIdDocument = gql`
    query getSourceFilesByInvitationId($invitationId: uuid) {
  FormInvitation(where: {id: {_eq: $invitationId}}) {
    AIBulkDocumentProcessings {
      id
    }
    id
    formId
    companyId
    Form {
      name
    }
    FormSubmissions(where: {isActive: {_eq: true}}) {
      id
    }
    created_by
    ParentUser {
      UserRoles {
        roleName
      }
    }
    status
    Company {
      name
    }
  }
  Sources(where: {formInvitationId: {_eq: $invitationId}}) {
    id
    sourceFilesId
    type
    SourceFile {
      totalDataPointsAdded
      id
      status
      currentPage
      totalPages
      originalFileUrl
      originalFileName
      filePath
      fileSize
      currentDataPointsCurated
      error
    }
  }
}
    `;
export const GetSourceDataByIdDocument = gql`
    query getSourceDataById($sourceId: [uuid!]!) {
  Sources(where: {id: {_in: $sourceId}}) {
    id
    SourceFile {
      originalFileUrl
      originalFileName
      status
    }
  }
}
    `;
export const GetSourceDataByInvitationIdDocument = gql`
    query getSourceDataByInvitationId($invitationId: uuid!) {
  Sources(where: {formInvitationId: {_eq: $invitationId}}) {
    id
    sourceFilesId
    type
    documentLogsId
    SourceFile {
      id
      status
      currentPage
      totalPages
      originalFileUrl
      originalFileName
      filePath
      fileName
      fileSize
      created_at
    }
  }
  FormInvitation(where: {id: {_eq: $invitationId}}) {
    id
    companyId
    parentcompanyId
    formId
    metadata
    FormSubmissions {
      id
    }
    durationFrom
    durationTo
    Form {
      name
      isAIDataPointsAdded
    }
  }
}
    `;
export const GetSubmittedFormToDownloadAsPdfDocument = gql`
    query getSubmittedFormToDownloadAsPDF($invitationId: uuid!, $submissionId: uuid) {
  FormSubmission(
    where: {_and: [{invitationId: {_eq: $invitationId}}, {id: {_eq: $submissionId}}, {isActive: {_eq: true}}, {FormInvitation: {isActive: {_eq: true}}}]}
  ) {
    FormInvitation {
      id
      ParentCompanyMapping {
        User {
          name
        }
        userByParentuserid {
          name
        }
      }
      Company {
        id
        name
      }
      Form {
        name
        Sections(order_by: {key: asc}) {
          id
          content
          weightage
          ParentSection {
            id
            content
          }
          FormResults(where: {submissionId: {_eq: $submissionId}}) {
            sectionId
            questionId
            score
          }
          Questions(order_by: {created_at: asc}) {
            content
            weightage
            calc
            FormResults(where: {submissionId: {_eq: $submissionId}}) {
              sectionId
              questionId
              score
            }
            FormFields(order_by: {seqIndex: asc}) {
              type
              interface
              interfaceOptions
              id
              fieldOptions
              field
              groupField
              seqIndex
              displayRules
              autoCalculatedCalculation
            }
            Answers(where: {submissionId: {_eq: $submissionId}}) {
              id
              data
              formFieldId
            }
          }
        }
      }
    }
  }
}
    `;
export const GetsubmittedformtodownloadexcelDocument = gql`
    query getsubmittedformtodownloadexcel($invitationId: uuid, $submissionId: uuid) {
  FormSubmission(
    where: {_and: [{invitationId: {_eq: $invitationId}}, {id: {_eq: $submissionId}}, {isActive: {_eq: true}}, {FormInvitation: {isActive: {_eq: true}}}]}
  ) {
    FormInvitation {
      id
      Company {
        id
        name
      }
      Form {
        name
        Sections(order_by: {key: asc}) {
          id
          content
          weightage
          ParentSection {
            id
            content
            weightage
            ParentSection {
              id
              content
              weightage
            }
          }
          FormResults(where: {submissionId: {_eq: $submissionId}}) {
            sectionId
            questionId
            score
          }
          Questions(order_by: {created_at: asc}) {
            content
            weightage
            subtheme
            key
            FormResults(where: {submissionId: {_eq: $submissionId}}) {
              sectionId
              questionId
              score
            }
            FormFields(order_by: {field: asc, seqIndex: desc}) {
              type
              interface
              interfaceOptions
              id
              fieldOptions
              field
              groupField
              seqIndex
              autoCalculatedCalculation
              subtheme
              created_at
            }
            Answers(where: {submissionId: {_eq: $submissionId}}) {
              id
              data
              formFieldId
            }
          }
        }
        FormFields(where: {questionId: {_is_null: true}}) {
          id
          field
          interfaceOptions
          interface
          groupField
        }
      }
    }
  }
}
    `;
export const GetSuggestedDocumentsDocument = gql`
    query GetSuggestedDocuments($formId: uuid!, $invitationId: uuid!, $type: String!) {
  Form(where: {id: {_eq: $formId}}) {
    id
    name
    title
  }
  SuggestedDocuments(where: {formId: {_eq: $formId}}, order_by: {isOther: asc}) {
    id
    title
    maxSize
    sampleFileUrl
    seqIndex
    acceptedFormats
    updated_at
    isOther
  }
  Sources(where: {formInvitationId: {_eq: $invitationId}, type: {_eq: $type}}) {
    id
    SourceFile {
      id
      originalFileName
      originalFileUrl
      totalDataPointsAdded
      error
    }
    SuggestionSourceMappings_aggregate {
      aggregate {
        count
      }
    }
  }
}
    `;
export const GetSuggestionByInvitationAndFormFieldDetailsDocument = gql`
    query getSuggestionByInvitationAndFormFieldDetails($invitationId: uuid!, $formFieldId: uuid!) {
  Suggestions(
    where: {formInvitationId: {_eq: $invitationId}, formFieldId: {_eq: $formFieldId}}
  ) {
    formFieldId
    FormField {
      interface
    }
    id
    suggestion
    isSelected
    SuggestionSourceMappings(order_by: {Source: {type: asc}}) {
      suggestionPageNo
      suggestionInfoContent
      Source {
        id
        type
        url
        SourceFile {
          id
          originalFileUrl
          originalFileName
          created_at
        }
      }
    }
  }
}
    `;
export const GetSuggestionsAndFormFieldDataByInvitationIdDocument = gql`
    query getSuggestionsAndFormFieldDataByInvitationId($invitationId: uuid, $inputFields: [String!]!) {
  FormInvitation(where: {id: {_eq: $invitationId}}) {
    FormSubmissions(where: {isActive: {_eq: true}}) {
      id
      Answers_aggregate {
        aggregate {
          count
        }
      }
    }
    id
    Suggestions(
      where: {selectedByUserId: {_is_null: true}, isSelected: {_eq: true}}
    ) {
      id
      selectedByUserId
      isSelected
      formFieldId
      suggestion
      FormField {
        id
        type
        field
        questionId
        fieldOptions
      }
    }
    Form {
      FormFields(where: {questionId: {_is_null: false}, type: {_in: $inputFields}}) {
        id
        fieldOptions
        displayRules
        type
        questionId
        Question {
          key
        }
      }
    }
  }
}
    `;
export const GetSuggestionsDataByInvitationIdDocument = gql`
    query getSuggestionsDataByInvitationId($invitationId: uuid) {
  FormInvitation(where: {id: {_eq: $invitationId}}) {
    id
    Suggestions {
      id
      selectedByUserId
      isSelected
      formFieldId
      suggestion
      FormField {
        id
        questionId
      }
    }
  }
}
    `;
export const GetTodayEmailDataDocument = gql`
    query getTodayEmailData($startDate: timestamptz, $endDate: timestamptz, $status: String, $limit: Int) {
  EmailNotifications(
    where: {created_at: {_gte: $startDate, _lte: $endDate}, status: {_eq: $status}}
    limit: $limit
  ) {
    id
    emailId
    subject
    invitationId
    mailBody
    configData
    ccEmails
    bccEmailId
  }
}
    `;
export const GetUserAllocationByIdDocument = gql`
    query GetUserAllocationById($id: uuid!) {
  AIChatUserAllocation(where: {id: {_eq: $id}}) {
    id
    subscriptionId
    companyId
    userId
    textualAllocated
    graphicalAllocated
    isActive
    allocatedBy
    metadata
    createdAt
    updatedAt
    AIChatUsages {
      id
      textualUsed
      graphicalUsed
      metadata
      createdAt
      updatedAt
    }
  }
}
    `;
export const GetUserConversationsDocument = gql`
    query GetUserConversations($userId: uuid!, $limit: Int = 20, $cursor: timestamptz, $withCursor: Boolean = false, $searchTerm: String = "") {
  search_conversations_fts_cursor(
    args: {search_text: $searchTerm, user_id_filter: $userId, cursor_time: $cursor, result_limit: $limit}
  ) @include(if: $withCursor) {
    conversationId
    userId
    companyId
    allocationId
    title
    createdAt
    updatedAt
    isActive
  }
  AIConversationsAll: search_conversations_fts(
    args: {search_text: $searchTerm, user_id_filter: $userId, result_limit: $limit}
  ) @skip(if: $withCursor) {
    conversationId
    userId
    companyId
    allocationId
    title
    createdAt
    updatedAt
    isActive
  }
}
    `;
export const GetUserDetailsByInvitationIdDocument = gql`
    query getUserDetailsByInvitationId($invitationId: uuid!) {
  FormInvitation(
    where: {_and: [{id: {_eq: $invitationId}}, {isActive: {_eq: true}}]}
  ) {
    id
    email
    Company {
      id
      name
    }
    ParentCompanyMapping {
      User {
        id
        email
        name
      }
    }
  }
}
    `;
export const GetParentCompanyMappingByAddressIdDocument = gql`
    query getParentCompanyMappingByAddressId($companyId: uuid, $parentUserId: uuid) {
  ParentCompanyMapping(
    where: {CompanyId: {_eq: $companyId}, ParentUserId: {_eq: $parentUserId}}
  ) {
    AddressId
    User {
      email
      id
      name
      UserRoles {
        userId
        roleName
      }
    }
  }
  Addresses(where: {companyId: {_eq: $companyId}}) {
    id
  }
}
    `;
export const GetUserDetailByBulkIdDocument = gql`
    query getUserDetailByBulkId($id: [uuid!]) {
  User(where: {id: {_in: $id}, isActive: {_eq: true}}) {
    id
    name
  }
}
    `;
export const GetUserDetailByCompanyIdDocument = gql`
    query getUserDetailByCompanyId($companyId: uuid) {
  User(
    where: {companyId: {_eq: $companyId}, isActive: {_eq: true}, UserRoles: {roleName: {_nin: ["Inviter", "Analytics", "Consultant"]}}}
    order_by: {name: asc}
  ) {
    id
    name
    email
    details
    companyId
    UserRoles {
      userId
      roleName
      Role {
        id
        isActive
      }
    }
  }
}
    `;
export const GetUserDetailByEmailDocument = gql`
    query getUserDetailByEmail($newEmail: [String!]) {
  User(where: {email: {_in: $newEmail}}) {
    email
    id
    name
    companyId
    AddressMappings {
      AddressId
      id
    }
  }
  Company(where: {primaryContact: {_contains: {email: $newEmail}}}) {
    id
    name
    primaryContact
  }
}
    `;
export const GetUserDetailByIdDocument = gql`
    query getUserDetailById($id: uuid) {
  User(where: {id: {_eq: $id}, isActive: {_eq: true}}) {
    id
    name
    email
    emailVerified
    phone
    phoneVerified
    image
    details
    companyId
    created_by
    updated_by
  }
}
    `;
export const GetUserDetailByParentCompanyIdDocument = gql`
    query getUserDetailByParentCompanyId($companyId: uuid, $userId: uuid) {
  ParentCompanyMapping(
    where: {ParentCompanyId: {_eq: $companyId}, User: {id: {_is_null: false}}}
  ) {
    Id
    CompanyId
    ParentCompanyId
    UserId
    ParentUserId
    AddressId
    User {
      email
      id
      name
      UserRoles {
        userId
        roleName
      }
    }
  }
  User(where: {id: {_eq: $userId}}) {
    email
    id
    name
    companyId
    UserRoles {
      userId
      roleName
    }
  }
}
    `;
export const GetUserDetailByPhoneDocument = gql`
    query getUserDetailByPhone($phone: [String!]) {
  User(where: {phone: {_in: $phone}, isActive: {_eq: true}}) {
    phone
  }
}
    `;
export const GetvalidationWarningRulesbyInvitationIdDocument = gql`
    query getvalidationWarningRulesbyInvitationId($invitationId: uuid, $userId: uuid) {
  ValidationWarningLogs(
    where: {InvitationId: {_eq: $invitationId}, IsActive: {_eq: true}}
    order_by: {created_at: desc}
  ) {
    Id
    values
    formFieldId
    QuestionId
    Question {
      id
      key
      FormFields {
        field
        id
        fieldOptions
        interfaceOptions
        interface
        subtheme
        groupField
        created_at
        AssesseeUserMappings(
          where: {InvitationId: {_eq: $invitationId}, userId: {_eq: $userId}}
        ) {
          id
          parentCompanyMappingId
          userId
          parentUserId
          questionId
          formFieldId
          formId
          reviewerUserId
          InvitationId
          roleId
          IsActive
        }
      }
      Section {
        id
        content
        ParentSection {
          id
          content
        }
      }
    }
  }
}
    `;
export const GetWarninginterimdataByFormIdDocument = gql`
    query getWarninginterimdataByFormId($formId: uuid, $companyId: [uuid!]!) {
  FormInvitation(
    where: {formId: {_eq: $formId}, companyId: {_in: $companyId}, isActive: {_eq: true}, status: {_eq: "Submitted"}}
    order_by: {created_at: asc}
  ) {
    id
    formId
    companyId
    email
    durationFrom
    durationTo
    isActive
    interimCheck
    FormSubmissions(where: {isActive: {_eq: true}}) {
      id
      Answers(where: {FormField: {warningRules: {_neq: "null"}}}) {
        formFieldId
        data
        FormField {
          warningRules
        }
      }
    }
  }
}
    `;
export const GetWebCurationProcessAndAiBulkDocumentProcessingDocument = gql`
    query getWebCurationProcessAndAIBulkDocumentProcessing($invitationIds: [uuid!]!) {
  WebCuration(where: {formInvitationId: {_in: $invitationIds}}) {
    id
    formInvitationId
    status
  }
  OPSToIQCuration(where: {formInvitationId: {_in: $invitationIds}}) {
    id
    formInvitationId
    status
  }
  AIBulkDocumentProcessing(where: {formInvitationId: {_in: $invitationIds}}) {
    id
    formInvitationId
    requestStatus
  }
}
    `;

export type SdkFunctionWrapper = <T>(action: (requestHeaders?:Record<string, string>) => Promise<T>, operationName: string, operationType?: string, variables?: any) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType, _variables) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    upsertValidationWarningLogs(variables: types.UpsertValidationWarningLogsMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpsertValidationWarningLogsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpsertValidationWarningLogsMutation>({ document: UpsertValidationWarningLogsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'upsertValidationWarningLogs', 'mutation', variables);
    },
    appendFormInvitationMetadata(variables: types.AppendFormInvitationMetadataMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.AppendFormInvitationMetadataMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.AppendFormInvitationMetadataMutation>({ document: AppendFormInvitationMetadataDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'appendFormInvitationMetadata', 'mutation', variables);
    },
    bulkDeleteSourceFilesFromId(variables: types.BulkDeleteSourceFilesFromIdMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.BulkDeleteSourceFilesFromIdMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.BulkDeleteSourceFilesFromIdMutation>({ document: BulkDeleteSourceFilesFromIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'bulkDeleteSourceFilesFromId', 'mutation', variables);
    },
    bulk_insert_AIBulkDocumentProcessing(variables: types.Bulk_Insert_AiBulkDocumentProcessingMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.Bulk_Insert_AiBulkDocumentProcessingMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.Bulk_Insert_AiBulkDocumentProcessingMutation>({ document: Bulk_Insert_AiBulkDocumentProcessingDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'bulk_insert_AIBulkDocumentProcessing', 'mutation', variables);
    },
    bulkInsertAnswer(variables: types.BulkInsertAnswerMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.BulkInsertAnswerMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.BulkInsertAnswerMutation>({ document: BulkInsertAnswerDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'bulkInsertAnswer', 'mutation', variables);
    },
    BulkInsertCompaniesWithUsers(variables: types.BulkInsertCompaniesWithUsersMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.BulkInsertCompaniesWithUsersMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.BulkInsertCompaniesWithUsersMutation>({ document: BulkInsertCompaniesWithUsersDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'BulkInsertCompaniesWithUsers', 'mutation', variables);
    },
    bulk_insert_document_logFiles(variables: types.Bulk_Insert_Document_LogFilesMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.Bulk_Insert_Document_LogFilesMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.Bulk_Insert_Document_LogFilesMutation>({ document: Bulk_Insert_Document_LogFilesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'bulk_insert_document_logFiles', 'mutation', variables);
    },
    BulkInsertFormFields(variables: types.BulkInsertFormFieldsMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.BulkInsertFormFieldsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.BulkInsertFormFieldsMutation>({ document: BulkInsertFormFieldsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'BulkInsertFormFields', 'mutation', variables);
    },
    bulkInsertFormSubmission(variables: types.BulkInsertFormSubmissionMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.BulkInsertFormSubmissionMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.BulkInsertFormSubmissionMutation>({ document: BulkInsertFormSubmissionDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'bulkInsertFormSubmission', 'mutation', variables);
    },
    bulkInsertInterimRecommendation(variables: types.BulkInsertInterimRecommendationMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.BulkInsertInterimRecommendationMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.BulkInsertInterimRecommendationMutation>({ document: BulkInsertInterimRecommendationDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'bulkInsertInterimRecommendation', 'mutation', variables);
    },
    bulkInsertInterimAnswer(variables: types.BulkInsertInterimAnswerMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.BulkInsertInterimAnswerMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.BulkInsertInterimAnswerMutation>({ document: BulkInsertInterimAnswerDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'bulkInsertInterimAnswer', 'mutation', variables);
    },
    bulkinsertOPSToIQCuration(variables: types.BulkinsertOpsToIqCurationMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.BulkinsertOpsToIqCurationMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.BulkinsertOpsToIqCurationMutation>({ document: BulkinsertOpsToIqCurationDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'bulkinsertOPSToIQCuration', 'mutation', variables);
    },
    BulkInsertQuestions(variables: types.BulkInsertQuestionsMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.BulkInsertQuestionsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.BulkInsertQuestionsMutation>({ document: BulkInsertQuestionsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'BulkInsertQuestions', 'mutation', variables);
    },
    bulkInsertRecommendationComment(variables: types.BulkInsertRecommendationCommentMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.BulkInsertRecommendationCommentMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.BulkInsertRecommendationCommentMutation>({ document: BulkInsertRecommendationCommentDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'bulkInsertRecommendationComment', 'mutation', variables);
    },
    BulkInsertSections(variables: types.BulkInsertSectionsMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.BulkInsertSectionsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.BulkInsertSectionsMutation>({ document: BulkInsertSectionsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'BulkInsertSections', 'mutation', variables);
    },
    bulk_insert_sourceFiles(variables: types.Bulk_Insert_SourceFilesMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.Bulk_Insert_SourceFilesMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.Bulk_Insert_SourceFilesMutation>({ document: Bulk_Insert_SourceFilesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'bulk_insert_sourceFiles', 'mutation', variables);
    },
    BulkInsertSources(variables: types.BulkInsertSourcesMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.BulkInsertSourcesMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.BulkInsertSourcesMutation>({ document: BulkInsertSourcesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'BulkInsertSources', 'mutation', variables);
    },
    bulkInsertSuggestionSourceMapping(variables: types.BulkInsertSuggestionSourceMappingMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.BulkInsertSuggestionSourceMappingMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.BulkInsertSuggestionSourceMappingMutation>({ document: BulkInsertSuggestionSourceMappingDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'bulkInsertSuggestionSourceMapping', 'mutation', variables);
    },
    bulkInsertSuggestions(variables: types.BulkInsertSuggestionsMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.BulkInsertSuggestionsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.BulkInsertSuggestionsMutation>({ document: BulkInsertSuggestionsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'bulkInsertSuggestions', 'mutation', variables);
    },
    bulkinsertwebCuration(variables: types.BulkinsertwebCurationMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.BulkinsertwebCurationMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.BulkinsertwebCurationMutation>({ document: BulkinsertwebCurationDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'bulkinsertwebCuration', 'mutation', variables);
    },
    BulkUpdateCompaniesWithUsers(variables: types.BulkUpdateCompaniesWithUsersMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.BulkUpdateCompaniesWithUsersMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.BulkUpdateCompaniesWithUsersMutation>({ document: BulkUpdateCompaniesWithUsersDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'BulkUpdateCompaniesWithUsers', 'mutation', variables);
    },
    bulk_update_document_logFiles(variables: types.Bulk_Update_Document_LogFilesMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.Bulk_Update_Document_LogFilesMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.Bulk_Update_Document_LogFilesMutation>({ document: Bulk_Update_Document_LogFilesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'bulk_update_document_logFiles', 'mutation', variables);
    },
    bulkUpdateInterimRecommendationByInterimAnswerId(variables: types.BulkUpdateInterimRecommendationByInterimAnswerIdMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.BulkUpdateInterimRecommendationByInterimAnswerIdMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.BulkUpdateInterimRecommendationByInterimAnswerIdMutation>({ document: BulkUpdateInterimRecommendationByInterimAnswerIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'bulkUpdateInterimRecommendationByInterimAnswerId', 'mutation', variables);
    },
    bulkUpdateProcessingData(variables: types.BulkUpdateProcessingDataMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.BulkUpdateProcessingDataMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.BulkUpdateProcessingDataMutation>({ document: BulkUpdateProcessingDataDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'bulkUpdateProcessingData', 'mutation', variables);
    },
    bulkUpdateSourceAndSources(variables: types.BulkUpdateSourceAndSourcesMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.BulkUpdateSourceAndSourcesMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.BulkUpdateSourceAndSourcesMutation>({ document: BulkUpdateSourceAndSourcesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'bulkUpdateSourceAndSources', 'mutation', variables);
    },
    bulkUpdateSourceFiles(variables: types.BulkUpdateSourceFilesMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.BulkUpdateSourceFilesMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.BulkUpdateSourceFilesMutation>({ document: BulkUpdateSourceFilesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'bulkUpdateSourceFiles', 'mutation', variables);
    },
    bulkUpdateSuggestions(variables: types.BulkUpdateSuggestionsMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.BulkUpdateSuggestionsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.BulkUpdateSuggestionsMutation>({ document: BulkUpdateSuggestionsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'bulkUpdateSuggestions', 'mutation', variables);
    },
    bulkUpsertAnswerforAI(variables: types.BulkUpsertAnswerforAiMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.BulkUpsertAnswerforAiMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.BulkUpsertAnswerforAiMutation>({ document: BulkUpsertAnswerforAiDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'bulkUpsertAnswerforAI', 'mutation', variables);
    },
    BulkUpsertReviewerDetailsMapping(variables: types.BulkUpsertReviewerDetailsMappingMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.BulkUpsertReviewerDetailsMappingMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.BulkUpsertReviewerDetailsMappingMutation>({ document: BulkUpsertReviewerDetailsMappingDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'BulkUpsertReviewerDetailsMapping', 'mutation', variables);
    },
    bulkUpsertValidationWarningLogs(variables: types.BulkUpsertValidationWarningLogsMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.BulkUpsertValidationWarningLogsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.BulkUpsertValidationWarningLogsMutation>({ document: BulkUpsertValidationWarningLogsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'bulkUpsertValidationWarningLogs', 'mutation', variables);
    },
    createParentCompanyMapping(variables: types.CreateParentCompanyMappingMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.CreateParentCompanyMappingMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.CreateParentCompanyMappingMutation>({ document: CreateParentCompanyMappingDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'createParentCompanyMapping', 'mutation', variables);
    },
    CreateAIChatUsage(variables: types.CreateAiChatUsageMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.CreateAiChatUsageMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.CreateAiChatUsageMutation>({ document: CreateAiChatUsageDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'CreateAIChatUsage', 'mutation', variables);
    },
    createCompany(variables: types.CreateCompanyMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.CreateCompanyMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.CreateCompanyMutation>({ document: CreateCompanyDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'createCompany', 'mutation', variables);
    },
    createFormSubmission(variables: types.CreateFormSubmissionMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.CreateFormSubmissionMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.CreateFormSubmissionMutation>({ document: CreateFormSubmissionDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'createFormSubmission', 'mutation', variables);
    },
    createUser(variables: types.CreateUserMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.CreateUserMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.CreateUserMutation>({ document: CreateUserDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'createUser', 'mutation', variables);
    },
    DeleteAddressDetails(variables?: types.DeleteAddressDetailsMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.DeleteAddressDetailsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.DeleteAddressDetailsMutation>({ document: DeleteAddressDetailsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'DeleteAddressDetails', 'mutation', variables);
    },
    DeleteAnswersBySubmissionId(variables: types.DeleteAnswersBySubmissionIdMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.DeleteAnswersBySubmissionIdMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.DeleteAnswersBySubmissionIdMutation>({ document: DeleteAnswersBySubmissionIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'DeleteAnswersBySubmissionId', 'mutation', variables);
    },
    deleteCompanyDetailsById(variables?: types.DeleteCompanyDetailsByIdMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.DeleteCompanyDetailsByIdMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.DeleteCompanyDetailsByIdMutation>({ document: DeleteCompanyDetailsByIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'deleteCompanyDetailsById', 'mutation', variables);
    },
    DeleteFormfieldByFormId(variables: types.DeleteFormfieldByFormIdMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.DeleteFormfieldByFormIdMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.DeleteFormfieldByFormIdMutation>({ document: DeleteFormfieldByFormIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'DeleteFormfieldByFormId', 'mutation', variables);
    },
    DeleteInterimFormLogsByQuestionIds(variables: types.DeleteInterimFormLogsByQuestionIdsMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.DeleteInterimFormLogsByQuestionIdsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.DeleteInterimFormLogsByQuestionIdsMutation>({ document: DeleteInterimFormLogsByQuestionIdsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'DeleteInterimFormLogsByQuestionIds', 'mutation', variables);
    },
    DeleteQuestionsByFormId(variables: types.DeleteQuestionsByFormIdMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.DeleteQuestionsByFormIdMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.DeleteQuestionsByFormIdMutation>({ document: DeleteQuestionsByFormIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'DeleteQuestionsByFormId', 'mutation', variables);
    },
    DeleteQuestionsBySectionId(variables?: types.DeleteQuestionsBySectionIdMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.DeleteQuestionsBySectionIdMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.DeleteQuestionsBySectionIdMutation>({ document: DeleteQuestionsBySectionIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'DeleteQuestionsBySectionId', 'mutation', variables);
    },
    DeleteSectionsByFormId(variables: types.DeleteSectionsByFormIdMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.DeleteSectionsByFormIdMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.DeleteSectionsByFormIdMutation>({ document: DeleteSectionsByFormIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'DeleteSectionsByFormId', 'mutation', variables);
    },
    deleteUserDetailById(variables?: types.DeleteUserDetailByIdMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.DeleteUserDetailByIdMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.DeleteUserDetailByIdMutation>({ document: DeleteUserDetailByIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'deleteUserDetailById', 'mutation', variables);
    },
    insertAddress(variables: types.InsertAddressMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.InsertAddressMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.InsertAddressMutation>({ document: InsertAddressDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'insertAddress', 'mutation', variables);
    },
    insertAssesseeUserMapping(variables: types.InsertAssesseeUserMappingMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.InsertAssesseeUserMappingMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.InsertAssesseeUserMappingMutation>({ document: InsertAssesseeUserMappingDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'insertAssesseeUserMapping', 'mutation', variables);
    },
    insertcompanyformfundtype(variables: types.InsertcompanyformfundtypeMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.InsertcompanyformfundtypeMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.InsertcompanyformfundtypeMutation>({ document: InsertcompanyformfundtypeDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'insertcompanyformfundtype', 'mutation', variables);
    },
    InsertCompany(variables: types.InsertCompanyMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.InsertCompanyMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.InsertCompanyMutation>({ document: InsertCompanyDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'InsertCompany', 'mutation', variables);
    },
    insert_EmailNotifications(variables: types.Insert_EmailNotificationsMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.Insert_EmailNotificationsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.Insert_EmailNotificationsMutation>({ document: Insert_EmailNotificationsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'insert_EmailNotifications', 'mutation', variables);
    },
    InsertFormFieldOne(variables: types.InsertFormFieldOneMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.InsertFormFieldOneMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.InsertFormFieldOneMutation>({ document: InsertFormFieldOneDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'InsertFormFieldOne', 'mutation', variables);
    },
    InsertFormField(variables: types.InsertFormFieldMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.InsertFormFieldMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.InsertFormFieldMutation>({ document: InsertFormFieldDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'InsertFormField', 'mutation', variables);
    },
    InsertFormInvitationNewCompany(variables: types.InsertFormInvitationNewCompanyMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.InsertFormInvitationNewCompanyMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.InsertFormInvitationNewCompanyMutation>({ document: InsertFormInvitationNewCompanyDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'InsertFormInvitationNewCompany', 'mutation', variables);
    },
    InsertFormInvitation(variables: types.InsertFormInvitationMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.InsertFormInvitationMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.InsertFormInvitationMutation>({ document: InsertFormInvitationDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'InsertFormInvitation', 'mutation', variables);
    },
    InsertFormDetailsOne(variables: types.InsertFormDetailsOneMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.InsertFormDetailsOneMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.InsertFormDetailsOneMutation>({ document: InsertFormDetailsOneDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'InsertFormDetailsOne', 'mutation', variables);
    },
    insertInterimFormLogs(variables: types.InsertInterimFormLogsMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.InsertInterimFormLogsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.InsertInterimFormLogsMutation>({ document: InsertInterimFormLogsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'insertInterimFormLogs', 'mutation', variables);
    },
    insertIntoInterimComments(variables: types.InsertIntoInterimCommentsMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.InsertIntoInterimCommentsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.InsertIntoInterimCommentsMutation>({ document: InsertIntoInterimCommentsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'insertIntoInterimComments', 'mutation', variables);
    },
    insertIntoSubmissionTable(variables: types.InsertIntoSubmissionTableMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.InsertIntoSubmissionTableMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.InsertIntoSubmissionTableMutation>({ document: InsertIntoSubmissionTableDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'insertIntoSubmissionTable', 'mutation', variables);
    },
    InsertFormInvitationComment(variables: types.InsertFormInvitationCommentMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.InsertFormInvitationCommentMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.InsertFormInvitationCommentMutation>({ document: InsertFormInvitationCommentDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'InsertFormInvitationComment', 'mutation', variables);
    },
    insertInvitationConsultantMapping(variables: types.InsertInvitationConsultantMappingMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.InsertInvitationConsultantMappingMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.InsertInvitationConsultantMappingMutation>({ document: InsertInvitationConsultantMappingDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'insertInvitationConsultantMapping', 'mutation', variables);
    },
    InsertMakerCheckerRemark(variables: types.InsertMakerCheckerRemarkMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.InsertMakerCheckerRemarkMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.InsertMakerCheckerRemarkMutation>({ document: InsertMakerCheckerRemarkDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'InsertMakerCheckerRemark', 'mutation', variables);
    },
    InsertQuestionnaireLog(variables: types.InsertQuestionnaireLogMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.InsertQuestionnaireLogMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.InsertQuestionnaireLogMutation>({ document: InsertQuestionnaireLogDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'InsertQuestionnaireLog', 'mutation', variables);
    },
    InsertQuestionnaire(variables: types.InsertQuestionnaireMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.InsertQuestionnaireMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.InsertQuestionnaireMutation>({ document: InsertQuestionnaireDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'InsertQuestionnaire', 'mutation', variables);
    },
    insertRaraValidationAndRating(variables: types.InsertRaraValidationAndRatingMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.InsertRaraValidationAndRatingMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.InsertRaraValidationAndRatingMutation>({ document: InsertRaraValidationAndRatingDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'insertRaraValidationAndRating', 'mutation', variables);
    },
    insertRecommendationReminderEmails(variables: types.InsertRecommendationReminderEmailsMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.InsertRecommendationReminderEmailsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.InsertRecommendationReminderEmailsMutation>({ document: InsertRecommendationReminderEmailsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'insertRecommendationReminderEmails', 'mutation', variables);
    },
    insertRecommendation(variables: types.InsertRecommendationMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.InsertRecommendationMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.InsertRecommendationMutation>({ document: InsertRecommendationDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'insertRecommendation', 'mutation', variables);
    },
    InsertReviewerDetailsMapping(variables: types.InsertReviewerDetailsMappingMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.InsertReviewerDetailsMappingMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.InsertReviewerDetailsMappingMutation>({ document: InsertReviewerDetailsMappingDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'InsertReviewerDetailsMapping', 'mutation', variables);
    },
    reopen_invitation(variables?: types.Reopen_InvitationMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.Reopen_InvitationMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.Reopen_InvitationMutation>({ document: Reopen_InvitationDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'reopen_invitation', 'mutation', variables);
    },
    startNewSubmissionByInvitationId(variables: types.StartNewSubmissionByInvitationIdMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.StartNewSubmissionByInvitationIdMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.StartNewSubmissionByInvitationIdMutation>({ document: StartNewSubmissionByInvitationIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'startNewSubmissionByInvitationId', 'mutation', variables);
    },
    updateUserResetPasswordFlag(variables: types.UpdateUserResetPasswordFlagMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpdateUserResetPasswordFlagMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpdateUserResetPasswordFlagMutation>({ document: UpdateUserResetPasswordFlagDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateUserResetPasswordFlag', 'mutation', variables);
    },
    updateValidationWarningLogs(variables?: types.UpdateValidationWarningLogsMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpdateValidationWarningLogsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpdateValidationWarningLogsMutation>({ document: UpdateValidationWarningLogsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateValidationWarningLogs', 'mutation', variables);
    },
    UpdateAddress(variables: types.UpdateAddressMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpdateAddressMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpdateAddressMutation>({ document: UpdateAddressDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'UpdateAddress', 'mutation', variables);
    },
    UpdateSubscriptionMetadata(variables: types.UpdateSubscriptionMetadataMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpdateSubscriptionMetadataMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpdateSubscriptionMetadataMutation>({ document: UpdateSubscriptionMetadataDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'UpdateSubscriptionMetadata', 'mutation', variables);
    },
    UpdateAIChatUsage(variables: types.UpdateAiChatUsageMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpdateAiChatUsageMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpdateAiChatUsageMutation>({ document: UpdateAiChatUsageDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'UpdateAIChatUsage', 'mutation', variables);
    },
    updateAnswer(variables: types.UpdateAnswerMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpdateAnswerMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpdateAnswerMutation>({ document: UpdateAnswerDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateAnswer', 'mutation', variables);
    },
    updateAnswerIdinInterimAnswer(variables: types.UpdateAnswerIdinInterimAnswerMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpdateAnswerIdinInterimAnswerMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpdateAnswerIdinInterimAnswerMutation>({ document: UpdateAnswerIdinInterimAnswerDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateAnswerIdinInterimAnswer', 'mutation', variables);
    },
    UpdateAssesseeUserMappingbyInvitationId(variables: types.UpdateAssesseeUserMappingbyInvitationIdMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpdateAssesseeUserMappingbyInvitationIdMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpdateAssesseeUserMappingbyInvitationIdMutation>({ document: UpdateAssesseeUserMappingbyInvitationIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'UpdateAssesseeUserMappingbyInvitationId', 'mutation', variables);
    },
    UpdateAssesseeUserMappingForResponder(variables: types.UpdateAssesseeUserMappingForResponderMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpdateAssesseeUserMappingForResponderMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpdateAssesseeUserMappingForResponderMutation>({ document: UpdateAssesseeUserMappingForResponderDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'UpdateAssesseeUserMappingForResponder', 'mutation', variables);
    },
    UpdateAssesseeUserMappingResponderStatusByResponder(variables: types.UpdateAssesseeUserMappingResponderStatusByResponderMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpdateAssesseeUserMappingResponderStatusByResponderMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpdateAssesseeUserMappingResponderStatusByResponderMutation>({ document: UpdateAssesseeUserMappingResponderStatusByResponderDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'UpdateAssesseeUserMappingResponderStatusByResponder', 'mutation', variables);
    },
    updateCompanyDetails(variables: types.UpdateCompanyDetailsMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpdateCompanyDetailsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpdateCompanyDetailsMutation>({ document: UpdateCompanyDetailsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateCompanyDetails', 'mutation', variables);
    },
    UpdateCompanyPrimaryContact(variables: types.UpdateCompanyPrimaryContactMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpdateCompanyPrimaryContactMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpdateCompanyPrimaryContactMutation>({ document: UpdateCompanyPrimaryContactDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'UpdateCompanyPrimaryContact', 'mutation', variables);
    },
    updateCompanyDetailById(variables: types.UpdateCompanyDetailByIdMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpdateCompanyDetailByIdMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpdateCompanyDetailByIdMutation>({ document: UpdateCompanyDetailByIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateCompanyDetailById', 'mutation', variables);
    },
    updateCompletionPercentage(variables: types.UpdateCompletionPercentageMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpdateCompletionPercentageMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpdateCompletionPercentageMutation>({ document: UpdateCompletionPercentageDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateCompletionPercentage', 'mutation', variables);
    },
    updateFormCalc(variables: types.UpdateFormCalcMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpdateFormCalcMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpdateFormCalcMutation>({ document: UpdateFormCalcDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateFormCalc', 'mutation', variables);
    },
    updateFormInvitationByCompanyIdAndFormId(variables: types.UpdateFormInvitationByCompanyIdAndFormIdMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpdateFormInvitationByCompanyIdAndFormIdMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpdateFormInvitationByCompanyIdAndFormIdMutation>({ document: UpdateFormInvitationByCompanyIdAndFormIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateFormInvitationByCompanyIdAndFormId', 'mutation', variables);
    },
    updateFormInvitationMetadata(variables: types.UpdateFormInvitationMetadataMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpdateFormInvitationMetadataMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpdateFormInvitationMetadataMutation>({ document: UpdateFormInvitationMetadataDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateFormInvitationMetadata', 'mutation', variables);
    },
    updateFormInvitationStatus(variables: types.UpdateFormInvitationStatusMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpdateFormInvitationStatusMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpdateFormInvitationStatusMutation>({ document: UpdateFormInvitationStatusDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateFormInvitationStatus', 'mutation', variables);
    },
    updateFormInvitation(variables: types.UpdateFormInvitationMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpdateFormInvitationMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpdateFormInvitationMutation>({ document: UpdateFormInvitationDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateFormInvitation', 'mutation', variables);
    },
    updateFormSubmissionStatus(variables: types.UpdateFormSubmissionStatusMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpdateFormSubmissionStatusMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpdateFormSubmissionStatusMutation>({ document: UpdateFormSubmissionStatusDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateFormSubmissionStatus', 'mutation', variables);
    },
    updateFormInvitationInterimCheckById(variables: types.UpdateFormInvitationInterimCheckByIdMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpdateFormInvitationInterimCheckByIdMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpdateFormInvitationInterimCheckByIdMutation>({ document: UpdateFormInvitationInterimCheckByIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateFormInvitationInterimCheckById', 'mutation', variables);
    },
    updateFormInvitationStatusBulkbyId(variables: types.UpdateFormInvitationStatusBulkbyIdMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpdateFormInvitationStatusBulkbyIdMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpdateFormInvitationStatusBulkbyIdMutation>({ document: UpdateFormInvitationStatusBulkbyIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateFormInvitationStatusBulkbyId', 'mutation', variables);
    },
    updateInterimAnswerByQuestionIdAndSubmissionId(variables: types.UpdateInterimAnswerByQuestionIdAndSubmissionIdMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpdateInterimAnswerByQuestionIdAndSubmissionIdMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpdateInterimAnswerByQuestionIdAndSubmissionIdMutation>({ document: UpdateInterimAnswerByQuestionIdAndSubmissionIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateInterimAnswerByQuestionIdAndSubmissionId', 'mutation', variables);
    },
    updateInterimAnswer(variables: types.UpdateInterimAnswerMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpdateInterimAnswerMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpdateInterimAnswerMutation>({ document: UpdateInterimAnswerDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateInterimAnswer', 'mutation', variables);
    },
    updateInterimRecommendationByInterimAnswerId(variables: types.UpdateInterimRecommendationByInterimAnswerIdMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpdateInterimRecommendationByInterimAnswerIdMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpdateInterimRecommendationByInterimAnswerIdMutation>({ document: UpdateInterimRecommendationByInterimAnswerIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateInterimRecommendationByInterimAnswerId', 'mutation', variables);
    },
    updateInvitationToDraftByInvitationId(variables: types.UpdateInvitationToDraftByInvitationIdMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpdateInvitationToDraftByInvitationIdMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpdateInvitationToDraftByInvitationIdMutation>({ document: UpdateInvitationToDraftByInvitationIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateInvitationToDraftByInvitationId', 'mutation', variables);
    },
    updateIsEmailSubscribed(variables?: types.UpdateIsEmailSubscribedMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpdateIsEmailSubscribedMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpdateIsEmailSubscribedMutation>({ document: UpdateIsEmailSubscribedDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateIsEmailSubscribed', 'mutation', variables);
    },
    UpdateMakerCheckerRemarks(variables: types.UpdateMakerCheckerRemarksMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpdateMakerCheckerRemarksMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpdateMakerCheckerRemarksMutation>({ document: UpdateMakerCheckerRemarksDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'UpdateMakerCheckerRemarks', 'mutation', variables);
    },
    updateMultipleSelectInterfaceOptionsChoices(variables: types.UpdateMultipleSelectInterfaceOptionsChoicesMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpdateMultipleSelectInterfaceOptionsChoicesMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpdateMultipleSelectInterfaceOptionsChoicesMutation>({ document: UpdateMultipleSelectInterfaceOptionsChoicesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateMultipleSelectInterfaceOptionsChoices', 'mutation', variables);
    },
    updateNewSubmissionByInvitationId(variables: types.UpdateNewSubmissionByInvitationIdMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpdateNewSubmissionByInvitationIdMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpdateNewSubmissionByInvitationIdMutation>({ document: UpdateNewSubmissionByInvitationIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateNewSubmissionByInvitationId', 'mutation', variables);
    },
    UpdateParentCompanyMappingbyCompanyId(variables: types.UpdateParentCompanyMappingbyCompanyIdMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpdateParentCompanyMappingbyCompanyIdMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpdateParentCompanyMappingbyCompanyIdMutation>({ document: UpdateParentCompanyMappingbyCompanyIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'UpdateParentCompanyMappingbyCompanyId', 'mutation', variables);
    },
    UpdateParentCompanyMappingbyId(variables: types.UpdateParentCompanyMappingbyIdMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpdateParentCompanyMappingbyIdMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpdateParentCompanyMappingbyIdMutation>({ document: UpdateParentCompanyMappingbyIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'UpdateParentCompanyMappingbyId', 'mutation', variables);
    },
    updateRecommendationStatus(variables?: types.UpdateRecommendationStatusMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpdateRecommendationStatusMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpdateRecommendationStatusMutation>({ document: UpdateRecommendationStatusDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateRecommendationStatus', 'mutation', variables);
    },
    updateTimestampAfterEmailSend(variables: types.UpdateTimestampAfterEmailSendMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpdateTimestampAfterEmailSendMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpdateTimestampAfterEmailSendMutation>({ document: UpdateTimestampAfterEmailSendDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateTimestampAfterEmailSend', 'mutation', variables);
    },
    UpdateReviewerDetailsMapping(variables: types.UpdateReviewerDetailsMappingMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpdateReviewerDetailsMappingMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpdateReviewerDetailsMappingMutation>({ document: UpdateReviewerDetailsMappingDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'UpdateReviewerDetailsMapping', 'mutation', variables);
    },
    updateSkipStatusByInvitationId(variables: types.UpdateSkipStatusByInvitationIdMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpdateSkipStatusByInvitationIdMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpdateSkipStatusByInvitationIdMutation>({ document: UpdateSkipStatusByInvitationIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateSkipStatusByInvitationId', 'mutation', variables);
    },
    updateSourcesById(variables: types.UpdateSourcesByIdMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpdateSourcesByIdMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpdateSourcesByIdMutation>({ document: UpdateSourcesByIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateSourcesById', 'mutation', variables);
    },
    updateSubmissionStatusForInProgress(variables: types.UpdateSubmissionStatusForInProgressMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpdateSubmissionStatusForInProgressMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpdateSubmissionStatusForInProgressMutation>({ document: UpdateSubmissionStatusForInProgressDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateSubmissionStatusForInProgress', 'mutation', variables);
    },
    updateSubmissionStatus(variables: types.UpdateSubmissionStatusMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpdateSubmissionStatusMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpdateSubmissionStatusMutation>({ document: UpdateSubmissionStatusDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateSubmissionStatus', 'mutation', variables);
    },
    UpdateUserAllocationMetadata(variables: types.UpdateUserAllocationMetadataMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpdateUserAllocationMetadataMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpdateUserAllocationMetadataMutation>({ document: UpdateUserAllocationMetadataDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'UpdateUserAllocationMetadata', 'mutation', variables);
    },
    updateUserDetailById(variables: types.UpdateUserDetailByIdMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpdateUserDetailByIdMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpdateUserDetailByIdMutation>({ document: UpdateUserDetailByIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateUserDetailById', 'mutation', variables);
    },
    updateStatusOfEmail(variables: types.UpdateStatusOfEmailMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpdateStatusOfEmailMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpdateStatusOfEmailMutation>({ document: UpdateStatusOfEmailDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateStatusOfEmail', 'mutation', variables);
    },
    upsertAnswer(variables: types.UpsertAnswerMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpsertAnswerMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpsertAnswerMutation>({ document: UpsertAnswerDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'upsertAnswer', 'mutation', variables);
    },
    upsertFormInvitationCompletion(variables: types.UpsertFormInvitationCompletionMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpsertFormInvitationCompletionMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpsertFormInvitationCompletionMutation>({ document: UpsertFormInvitationCompletionDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'upsertFormInvitationCompletion', 'mutation', variables);
    },
    upsertFormResult(variables: types.UpsertFormResultMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpsertFormResultMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpsertFormResultMutation>({ document: UpsertFormResultDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'upsertFormResult', 'mutation', variables);
    },
    GetInternalRequestCompany(variables?: types.GetInternalRequestCompanyQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetInternalRequestCompanyQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetInternalRequestCompanyQuery>({ document: GetInternalRequestCompanyDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetInternalRequestCompany', 'query', variables);
    },
    formWithDataPoints(variables?: types.FormWithDataPointsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.FormWithDataPointsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.FormWithDataPointsQuery>({ document: FormWithDataPointsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'formWithDataPoints', 'query', variables);
    },
    GetAISuggestedDocuments(variables?: types.GetAiSuggestedDocumentsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetAiSuggestedDocumentsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetAiSuggestedDocumentsQuery>({ document: GetAiSuggestedDocumentsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetAISuggestedDocuments', 'query', variables);
    },
    GetActiveSubscriptionByCompanyId(variables: types.GetActiveSubscriptionByCompanyIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetActiveSubscriptionByCompanyIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetActiveSubscriptionByCompanyIdQuery>({ document: GetActiveSubscriptionByCompanyIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetActiveSubscriptionByCompanyId', 'query', variables);
    },
    getaddressesbyuser_id(variables: types.Getaddressesbyuser_IdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.Getaddressesbyuser_IdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.Getaddressesbyuser_IdQuery>({ document: Getaddressesbyuser_IdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getaddressesbyuser_id', 'query', variables);
    },
    getAddressDetail(variables?: types.GetAddressDetailQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetAddressDetailQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetAddressDetailQuery>({ document: GetAddressDetailDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getAddressDetail', 'query', variables);
    },
    GetSubscriptionById(variables: types.GetSubscriptionByIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetSubscriptionByIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetSubscriptionByIdQuery>({ document: GetSubscriptionByIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetSubscriptionById', 'query', variables);
    },
    getAIDataStatsByFormIdAndInviationIdNonAi(variables: types.GetAiDataStatsByFormIdAndInviationIdNonAiQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetAiDataStatsByFormIdAndInviationIdNonAiQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetAiDataStatsByFormIdAndInviationIdNonAiQuery>({ document: GetAiDataStatsByFormIdAndInviationIdNonAiDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getAIDataStatsByFormIdAndInviationIdNonAi', 'query', variables);
    },
    getAIDataStatsByFormIdAndInviationId(variables: types.GetAiDataStatsByFormIdAndInviationIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetAiDataStatsByFormIdAndInviationIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetAiDataStatsByFormIdAndInviationIdQuery>({ document: GetAiDataStatsByFormIdAndInviationIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getAIDataStatsByFormIdAndInviationId', 'query', variables);
    },
    GetCompanyAISubscriptions(variables: types.GetCompanyAiSubscriptionsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetCompanyAiSubscriptionsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetCompanyAiSubscriptionsQuery>({ document: GetCompanyAiSubscriptionsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetCompanyAISubscriptions', 'query', variables);
    },
    GetAIChatUsageBySubscriptionId(variables: types.GetAiChatUsageBySubscriptionIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetAiChatUsageBySubscriptionIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetAiChatUsageBySubscriptionIdQuery>({ document: GetAiChatUsageBySubscriptionIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetAIChatUsageBySubscriptionId', 'query', variables);
    },
    getAllUsersByQuestionIdAndInvitationId(variables?: types.GetAllUsersByQuestionIdAndInvitationIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetAllUsersByQuestionIdAndInvitationIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetAllUsersByQuestionIdAndInvitationIdQuery>({ document: GetAllUsersByQuestionIdAndInvitationIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getAllUsersByQuestionIdAndInvitationId', 'query', variables);
    },
    getAnswerByDate(variables?: types.GetAnswerByDateQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetAnswerByDateQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetAnswerByDateQuery>({ document: GetAnswerByDateDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getAnswerByDate', 'query', variables);
    },
    getAnswerByQuestionIdAndSubmissionId(variables: types.GetAnswerByQuestionIdAndSubmissionIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetAnswerByQuestionIdAndSubmissionIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetAnswerByQuestionIdAndSubmissionIdQuery>({ document: GetAnswerByQuestionIdAndSubmissionIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getAnswerByQuestionIdAndSubmissionId', 'query', variables);
    },
    getAnswerBySubmissionIdAndquestionId(variables?: types.GetAnswerBySubmissionIdAndquestionIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetAnswerBySubmissionIdAndquestionIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetAnswerBySubmissionIdAndquestionIdQuery>({ document: GetAnswerBySubmissionIdAndquestionIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getAnswerBySubmissionIdAndquestionId', 'query', variables);
    },
    GetAnsweredResult(variables?: types.GetAnsweredResultQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetAnsweredResultQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetAnsweredResultQuery>({ document: GetAnsweredResultDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetAnsweredResult', 'query', variables);
    },
    getAnswersByFormSubmissionId(variables: types.GetAnswersByFormSubmissionIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetAnswersByFormSubmissionIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetAnswersByFormSubmissionIdQuery>({ document: GetAnswersByFormSubmissionIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getAnswersByFormSubmissionId', 'query', variables);
    },
    GetAnswersByIds(variables: types.GetAnswersByIdsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetAnswersByIdsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetAnswersByIdsQuery>({ document: GetAnswersByIdsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetAnswersByIds', 'query', variables);
    },
    getAssesseeUserMappingByDate(variables?: types.GetAssesseeUserMappingByDateQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetAssesseeUserMappingByDateQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetAssesseeUserMappingByDateQuery>({ document: GetAssesseeUserMappingByDateDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getAssesseeUserMappingByDate', 'query', variables);
    },
    getAssesseeUserMappingByUserId(variables?: types.GetAssesseeUserMappingByUserIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetAssesseeUserMappingByUserIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetAssesseeUserMappingByUserIdQuery>({ document: GetAssesseeUserMappingByUserIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getAssesseeUserMappingByUserId', 'query', variables);
    },
    getAssesseeUserMappings(variables: types.GetAssesseeUserMappingsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetAssesseeUserMappingsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetAssesseeUserMappingsQuery>({ document: GetAssesseeUserMappingsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getAssesseeUserMappings', 'query', variables);
    },
    getassesseeuserbyinvitationId(variables: types.GetassesseeuserbyinvitationIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetassesseeuserbyinvitationIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetassesseeuserbyinvitationIdQuery>({ document: GetassesseeuserbyinvitationIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getassesseeuserbyinvitationId', 'query', variables);
    },
    getAssesseUserQuestionDetailByUserid(variables: types.GetAssesseUserQuestionDetailByUseridQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetAssesseUserQuestionDetailByUseridQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetAssesseUserQuestionDetailByUseridQuery>({ document: GetAssesseUserQuestionDetailByUseridDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getAssesseUserQuestionDetailByUserid', 'query', variables);
    },
    getAssessmentListForDownload(variables: types.GetAssessmentListForDownloadQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetAssessmentListForDownloadQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetAssessmentListForDownloadQuery>({ document: GetAssessmentListForDownloadDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getAssessmentListForDownload', 'query', variables);
    },
    getAssessmentList(variables: types.GetAssessmentListQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetAssessmentListQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetAssessmentListQuery>({ document: GetAssessmentListDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getAssessmentList', 'query', variables);
    },
    getAssessmentListingDetails(variables: types.GetAssessmentListingDetailsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetAssessmentListingDetailsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetAssessmentListingDetailsQuery>({ document: GetAssessmentListingDetailsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getAssessmentListingDetails', 'query', variables);
    },
    getAssessorConsultantMappingByConsultantCompanyId(variables?: types.GetAssessorConsultantMappingByConsultantCompanyIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetAssessorConsultantMappingByConsultantCompanyIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetAssessorConsultantMappingByConsultantCompanyIdQuery>({ document: GetAssessorConsultantMappingByConsultantCompanyIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getAssessorConsultantMappingByConsultantCompanyId', 'query', variables);
    },
    getAssessorConsultantMapping(variables?: types.GetAssessorConsultantMappingQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetAssessorConsultantMappingQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetAssessorConsultantMappingQuery>({ document: GetAssessorConsultantMappingDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getAssessorConsultantMapping', 'query', variables);
    },
    getAssignedQuestionDetailsByInvitationId(variables?: types.GetAssignedQuestionDetailsByInvitationIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetAssignedQuestionDetailsByInvitationIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetAssignedQuestionDetailsByInvitationIdQuery>({ document: GetAssignedQuestionDetailsByInvitationIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getAssignedQuestionDetailsByInvitationId', 'query', variables);
    },
    getAssignedQuestionUserDetailsByQuestionId(variables?: types.GetAssignedQuestionUserDetailsByQuestionIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetAssignedQuestionUserDetailsByQuestionIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetAssignedQuestionUserDetailsByQuestionIdQuery>({ document: GetAssignedQuestionUserDetailsByQuestionIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getAssignedQuestionUserDetailsByQuestionId', 'query', variables);
    },
    getCompanyDetailByName(variables?: types.GetCompanyDetailByNameQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetCompanyDetailByNameQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetCompanyDetailByNameQuery>({ document: GetCompanyDetailByNameDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getCompanyDetailByName', 'query', variables);
    },
    GetCompanyByName(variables?: types.GetCompanyByNameQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetCompanyByNameQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetCompanyByNameQuery>({ document: GetCompanyByNameDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetCompanyByName', 'query', variables);
    },
    GetCompanyByParentCompanyIdAndPlatformId(variables?: types.GetCompanyByParentCompanyIdAndPlatformIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetCompanyByParentCompanyIdAndPlatformIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetCompanyByParentCompanyIdAndPlatformIdQuery>({ document: GetCompanyByParentCompanyIdAndPlatformIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetCompanyByParentCompanyIdAndPlatformId', 'query', variables);
    },
    GetCompanyByParentCompanyIdNull(variables?: types.GetCompanyByParentCompanyIdNullQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetCompanyByParentCompanyIdNullQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetCompanyByParentCompanyIdNullQuery>({ document: GetCompanyByParentCompanyIdNullDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetCompanyByParentCompanyIdNull', 'query', variables);
    },
    getcompanyfundtypeavailability(variables?: types.GetcompanyfundtypeavailabilityQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetcompanyfundtypeavailabilityQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetcompanyfundtypeavailabilityQuery>({ document: GetcompanyfundtypeavailabilityDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getcompanyfundtypeavailability', 'query', variables);
    },
    GetCompanySubscriptionWithAllUsers(variables: types.GetCompanySubscriptionWithAllUsersQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetCompanySubscriptionWithAllUsersQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetCompanySubscriptionWithAllUsersQuery>({ document: GetCompanySubscriptionWithAllUsersDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetCompanySubscriptionWithAllUsers', 'query', variables);
    },
    getExistingCompaniesOrUsersRecordById(variables?: types.GetExistingCompaniesOrUsersRecordByIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetExistingCompaniesOrUsersRecordByIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetExistingCompaniesOrUsersRecordByIdQuery>({ document: GetExistingCompaniesOrUsersRecordByIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getExistingCompaniesOrUsersRecordById', 'query', variables);
    },
    GetCompanyWithFormInvitationAndEmailTemplates(variables?: types.GetCompanyWithFormInvitationAndEmailTemplatesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetCompanyWithFormInvitationAndEmailTemplatesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetCompanyWithFormInvitationAndEmailTemplatesQuery>({ document: GetCompanyWithFormInvitationAndEmailTemplatesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetCompanyWithFormInvitationAndEmailTemplates', 'query', variables);
    },
    getCompanyDetailByBulkId(variables?: types.GetCompanyDetailByBulkIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetCompanyDetailByBulkIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetCompanyDetailByBulkIdQuery>({ document: GetCompanyDetailByBulkIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getCompanyDetailByBulkId', 'query', variables);
    },
    getCompanyDetailById(variables?: types.GetCompanyDetailByIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetCompanyDetailByIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetCompanyDetailByIdQuery>({ document: GetCompanyDetailByIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getCompanyDetailById', 'query', variables);
    },
    getCompanyDetailByparentcompanyid(variables: types.GetCompanyDetailByparentcompanyidQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetCompanyDetailByparentcompanyidQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetCompanyDetailByparentcompanyidQuery>({ document: GetCompanyDetailByparentcompanyidDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getCompanyDetailByparentcompanyid', 'query', variables);
    },
    getcompanyidbyinvitationid(variables?: types.GetcompanyidbyinvitationidQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetcompanyidbyinvitationidQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetcompanyidbyinvitationidQuery>({ document: GetcompanyidbyinvitationidDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getcompanyidbyinvitationid', 'query', variables);
    },
    getConsultantAssessmentList(variables: types.GetConsultantAssessmentListQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetConsultantAssessmentListQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetConsultantAssessmentListQuery>({ document: GetConsultantAssessmentListDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getConsultantAssessmentList', 'query', variables);
    },
    getConsultantFormWithDetails(variables?: types.GetConsultantFormWithDetailsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetConsultantFormWithDetailsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetConsultantFormWithDetailsQuery>({ document: GetConsultantFormWithDetailsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getConsultantFormWithDetails', 'query', variables);
    },
    getConsultantDataByFormId(variables: types.GetConsultantDataByFormIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetConsultantDataByFormIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetConsultantDataByFormIdQuery>({ document: GetConsultantDataByFormIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getConsultantDataByFormId', 'query', variables);
    },
    GetConversationMessages(variables: types.GetConversationMessagesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetConversationMessagesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetConversationMessagesQuery>({ document: GetConversationMessagesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetConversationMessages', 'query', variables);
    },
    getDeclinedQuestionsCount(variables: types.GetDeclinedQuestionsCountQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetDeclinedQuestionsCountQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetDeclinedQuestionsCountQuery>({ document: GetDeclinedQuestionsCountDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getDeclinedQuestionsCount', 'query', variables);
    },
    GetDocumentLogsPaginated(variables: types.GetDocumentLogsPaginatedQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetDocumentLogsPaginatedQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetDocumentLogsPaginatedQuery>({ document: GetDocumentLogsPaginatedDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetDocumentLogsPaginated', 'query', variables);
    },
    GetDocumentLogsWithAISuggestedDocuments(variables?: types.GetDocumentLogsWithAiSuggestedDocumentsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetDocumentLogsWithAiSuggestedDocumentsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetDocumentLogsWithAiSuggestedDocumentsQuery>({ document: GetDocumentLogsWithAiSuggestedDocumentsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetDocumentLogsWithAISuggestedDocuments', 'query', variables);
    },
    GetDocumentLogsWithSources(variables: types.GetDocumentLogsWithSourcesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetDocumentLogsWithSourcesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetDocumentLogsWithSourcesQuery>({ document: GetDocumentLogsWithSourcesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetDocumentLogsWithSources', 'query', variables);
    },
    GetDocumentLogs(variables: types.GetDocumentLogsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetDocumentLogsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetDocumentLogsQuery>({ document: GetDocumentLogsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetDocumentLogs', 'query', variables);
    },
    GetEmailConfigurationByplatformId(variables?: types.GetEmailConfigurationByplatformIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetEmailConfigurationByplatformIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetEmailConfigurationByplatformIdQuery>({ document: GetEmailConfigurationByplatformIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetEmailConfigurationByplatformId', 'query', variables);
    },
    getEmailTemplateByType(variables?: types.GetEmailTemplateByTypeQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetEmailTemplateByTypeQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetEmailTemplateByTypeQuery>({ document: GetEmailTemplateByTypeDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getEmailTemplateByType', 'query', variables);
    },
    GetEmailTemplateDataByinvitationId(variables?: types.GetEmailTemplateDataByinvitationIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetEmailTemplateDataByinvitationIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetEmailTemplateDataByinvitationIdQuery>({ document: GetEmailTemplateDataByinvitationIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetEmailTemplateDataByinvitationId', 'query', variables);
    },
    GetEmailTemplateDataByEmailtype(variables?: types.GetEmailTemplateDataByEmailtypeQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetEmailTemplateDataByEmailtypeQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetEmailTemplateDataByEmailtypeQuery>({ document: GetEmailTemplateDataByEmailtypeDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetEmailTemplateDataByEmailtype', 'query', variables);
    },
    getEmailtemplateForOnboarding(variables: types.GetEmailtemplateForOnboardingQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetEmailtemplateForOnboardingQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetEmailtemplateForOnboardingQuery>({ document: GetEmailtemplateForOnboardingDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getEmailtemplateForOnboarding', 'query', variables);
    },
    getEmailtemplateForBulkProcessingDocs(variables: types.GetEmailtemplateForBulkProcessingDocsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetEmailtemplateForBulkProcessingDocsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetEmailtemplateForBulkProcessingDocsQuery>({ document: GetEmailtemplateForBulkProcessingDocsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getEmailtemplateForBulkProcessingDocs', 'query', variables);
    },
    GetExistingCompaniesNameWithUsersEmail(variables?: types.GetExistingCompaniesNameWithUsersEmailQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetExistingCompaniesNameWithUsersEmailQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetExistingCompaniesNameWithUsersEmailQuery>({ document: GetExistingCompaniesNameWithUsersEmailDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetExistingCompaniesNameWithUsersEmail', 'query', variables);
    },
    GetExistingFormInvitationEkyc(variables?: types.GetExistingFormInvitationEkycQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetExistingFormInvitationEkycQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetExistingFormInvitationEkycQuery>({ document: GetExistingFormInvitationEkycDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetExistingFormInvitationEkyc', 'query', variables);
    },
    GetExistingFormInvitationByUserAndAddressId(variables: types.GetExistingFormInvitationByUserAndAddressIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetExistingFormInvitationByUserAndAddressIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetExistingFormInvitationByUserAndAddressIdQuery>({ document: GetExistingFormInvitationByUserAndAddressIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetExistingFormInvitationByUserAndAddressId', 'query', variables);
    },
    GetExistingFormInvitation(variables: types.GetExistingFormInvitationQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetExistingFormInvitationQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetExistingFormInvitationQuery>({ document: GetExistingFormInvitationDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetExistingFormInvitation', 'query', variables);
    },
    GetDocumentsForExpiry(variables: types.GetDocumentsForExpiryQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetDocumentsForExpiryQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetDocumentsForExpiryQuery>({ document: GetDocumentsForExpiryDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetDocumentsForExpiry', 'query', variables);
    },
    getFirstDeclinedQuestionId(variables: types.GetFirstDeclinedQuestionIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetFirstDeclinedQuestionIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetFirstDeclinedQuestionIdQuery>({ document: GetFirstDeclinedQuestionIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getFirstDeclinedQuestionId', 'query', variables);
    },
    getFomfieldHirarchyNameByInvitationid(variables?: types.GetFomfieldHirarchyNameByInvitationidQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetFomfieldHirarchyNameByInvitationidQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetFomfieldHirarchyNameByInvitationidQuery>({ document: GetFomfieldHirarchyNameByInvitationidDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getFomfieldHirarchyNameByInvitationid', 'query', variables);
    },
    getFormCalc(variables?: types.GetFormCalcQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetFormCalcQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetFormCalcQuery>({ document: GetFormCalcDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getFormCalc', 'query', variables);
    },
    getFormDetailByBulkFormId(variables?: types.GetFormDetailByBulkFormIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetFormDetailByBulkFormIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetFormDetailByBulkFormIdQuery>({ document: GetFormDetailByBulkFormIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getFormDetailByBulkFormId', 'query', variables);
    },
    getFormDetailsByIndustry(variables?: types.GetFormDetailsByIndustryQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetFormDetailsByIndustryQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetFormDetailsByIndustryQuery>({ document: GetFormDetailsByIndustryDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getFormDetailsByIndustry', 'query', variables);
    },
    getformFieldsbyInvitationId(variables: types.GetformFieldsbyInvitationIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetformFieldsbyInvitationIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetformFieldsbyInvitationIdQuery>({ document: GetformFieldsbyInvitationIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getformFieldsbyInvitationId', 'query', variables);
    },
    getFormFieldsByQuestionId(variables?: types.GetFormFieldsByQuestionIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetFormFieldsByQuestionIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetFormFieldsByQuestionIdQuery>({ document: GetFormFieldsByQuestionIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getFormFieldsByQuestionId', 'query', variables);
    },
    GetFormFieldsWithSQLQuery(variables: types.GetFormFieldsWithSqlQueryQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetFormFieldsWithSqlQueryQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetFormFieldsWithSqlQueryQuery>({ document: GetFormFieldsWithSqlQueryDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetFormFieldsWithSQLQuery', 'query', variables);
    },
    getFormFormDetailsCompanyList(variables?: types.GetFormFormDetailsCompanyListQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetFormFormDetailsCompanyListQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetFormFormDetailsCompanyListQuery>({ document: GetFormFormDetailsCompanyListDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getFormFormDetailsCompanyList', 'query', variables);
    },
    getFormIntroByFormId(variables: types.GetFormIntroByFormIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetFormIntroByFormIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetFormIntroByFormIdQuery>({ document: GetFormIntroByFormIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getFormIntroByFormId', 'query', variables);
    },
    getFormIntroByInvitationId(variables: types.GetFormIntroByInvitationIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetFormIntroByInvitationIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetFormIntroByInvitationIdQuery>({ document: GetFormIntroByInvitationIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getFormIntroByInvitationId', 'query', variables);
    },
    getFormInvitationbasicDetails(variables: types.GetFormInvitationbasicDetailsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetFormInvitationbasicDetailsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetFormInvitationbasicDetailsQuery>({ document: GetFormInvitationbasicDetailsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getFormInvitationbasicDetails', 'query', variables);
    },
    getFormInvitationByFormIdAndEmailId(variables: types.GetFormInvitationByFormIdAndEmailIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetFormInvitationByFormIdAndEmailIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetFormInvitationByFormIdAndEmailIdQuery>({ document: GetFormInvitationByFormIdAndEmailIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getFormInvitationByFormIdAndEmailId', 'query', variables);
    },
    getFormInvitationByFormId(variables: types.GetFormInvitationByFormIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetFormInvitationByFormIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetFormInvitationByFormIdQuery>({ document: GetFormInvitationByFormIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getFormInvitationByFormId', 'query', variables);
    },
    getFormInvitationDetailsByCompanyId(variables: types.GetFormInvitationDetailsByCompanyIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetFormInvitationDetailsByCompanyIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetFormInvitationDetailsByCompanyIdQuery>({ document: GetFormInvitationDetailsByCompanyIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getFormInvitationDetailsByCompanyId', 'query', variables);
    },
    getFormInvitationDetailsbyId(variables: types.GetFormInvitationDetailsbyIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetFormInvitationDetailsbyIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetFormInvitationDetailsbyIdQuery>({ document: GetFormInvitationDetailsbyIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getFormInvitationDetailsbyId', 'query', variables);
    },
    getFormQuestionnaire(variables: types.GetFormQuestionnaireQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetFormQuestionnaireQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetFormQuestionnaireQuery>({ document: GetFormQuestionnaireDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getFormQuestionnaire', 'query', variables);
    },
    getFormSubmissionByInvitations(variables: types.GetFormSubmissionByInvitationsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetFormSubmissionByInvitationsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetFormSubmissionByInvitationsQuery>({ document: GetFormSubmissionByInvitationsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getFormSubmissionByInvitations', 'query', variables);
    },
    getFormSubmissionDetails(variables: types.GetFormSubmissionDetailsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetFormSubmissionDetailsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetFormSubmissionDetailsQuery>({ document: GetFormSubmissionDetailsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getFormSubmissionDetails', 'query', variables);
    },
    GetFormTemplateData(variables: types.GetFormTemplateDataQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetFormTemplateDataQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetFormTemplateDataQuery>({ document: GetFormTemplateDataDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetFormTemplateData', 'query', variables);
    },
    GetFormWithDetails(variables?: types.GetFormWithDetailsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetFormWithDetailsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetFormWithDetailsQuery>({ document: GetFormWithDetailsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetFormWithDetails', 'query', variables);
    },
    GetForms(variables: types.GetFormsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetFormsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetFormsQuery>({ document: GetFormsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetForms', 'query', variables);
    },
    formInvitationDatawithCompanyId(variables: types.FormInvitationDatawithCompanyIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.FormInvitationDatawithCompanyIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.FormInvitationDatawithCompanyIdQuery>({ document: FormInvitationDatawithCompanyIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'formInvitationDatawithCompanyId', 'query', variables);
    },
    getformInvitationdatabycustomwhere(variables: types.GetformInvitationdatabycustomwhereQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetformInvitationdatabycustomwhereQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetformInvitationdatabycustomwhereQuery>({ document: GetformInvitationdatabycustomwhereDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getformInvitationdatabycustomwhere', 'query', variables);
    },
    getFormfieldAndAnswersByinvitationId(variables: types.GetFormfieldAndAnswersByinvitationIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetFormfieldAndAnswersByinvitationIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetFormfieldAndAnswersByinvitationIdQuery>({ document: GetFormfieldAndAnswersByinvitationIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getFormfieldAndAnswersByinvitationId', 'query', variables);
    },
    getformFieldsbySubmissionId(variables: types.GetformFieldsbySubmissionIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetformFieldsbySubmissionIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetformFieldsbySubmissionIdQuery>({ document: GetformFieldsbySubmissionIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getformFieldsbySubmissionId', 'query', variables);
    },
    getFormFieldsAndAnswerDataByInvitationId(variables: types.GetFormFieldsAndAnswerDataByInvitationIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetFormFieldsAndAnswerDataByInvitationIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetFormFieldsAndAnswerDataByInvitationIdQuery>({ document: GetFormFieldsAndAnswerDataByInvitationIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getFormFieldsAndAnswerDataByInvitationId', 'query', variables);
    },
    getFormInvitationbyStatus(variables: types.GetFormInvitationbyStatusQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetFormInvitationbyStatusQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetFormInvitationbyStatusQuery>({ document: GetFormInvitationbyStatusDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getFormInvitationbyStatus', 'query', variables);
    },
    getInvitationDetails(variables: types.GetInvitationDetailsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetInvitationDetailsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetInvitationDetailsQuery>({ document: GetInvitationDetailsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getInvitationDetails', 'query', variables);
    },
    getFormResultBySubmissionId(variables?: types.GetFormResultBySubmissionIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetFormResultBySubmissionIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetFormResultBySubmissionIdQuery>({ document: GetFormResultBySubmissionIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getFormResultBySubmissionId', 'query', variables);
    },
    GetGlobalMasterByInternalRequestCompany(variables?: types.GetGlobalMasterByInternalRequestCompanyQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetGlobalMasterByInternalRequestCompanyQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetGlobalMasterByInternalRequestCompanyQuery>({ document: GetGlobalMasterByInternalRequestCompanyDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetGlobalMasterByInternalRequestCompany', 'query', variables);
    },
    GetGlobalMasterByBRSRTemplate(variables?: types.GetGlobalMasterByBrsrTemplateQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetGlobalMasterByBrsrTemplateQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetGlobalMasterByBrsrTemplateQuery>({ document: GetGlobalMasterByBrsrTemplateDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetGlobalMasterByBRSRTemplate', 'query', variables);
    },
    GetGlobalMasterByCountry(variables?: types.GetGlobalMasterByCountryQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetGlobalMasterByCountryQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetGlobalMasterByCountryQuery>({ document: GetGlobalMasterByCountryDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetGlobalMasterByCountry', 'query', variables);
    },
    GetGlobalMasterByEmailOnSubmission(variables?: types.GetGlobalMasterByEmailOnSubmissionQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetGlobalMasterByEmailOnSubmissionQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetGlobalMasterByEmailOnSubmissionQuery>({ document: GetGlobalMasterByEmailOnSubmissionDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetGlobalMasterByEmailOnSubmission', 'query', variables);
    },
    getGlobalMasterByTypeList(variables?: types.GetGlobalMasterByTypeListQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetGlobalMasterByTypeListQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetGlobalMasterByTypeListQuery>({ document: GetGlobalMasterByTypeListDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getGlobalMasterByTypeList', 'query', variables);
    },
    getGlobalMasterByType(variables: types.GetGlobalMasterByTypeQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetGlobalMasterByTypeQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetGlobalMasterByTypeQuery>({ document: GetGlobalMasterByTypeDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getGlobalMasterByType', 'query', variables);
    },
    GetGlobalMasterDatabyCityStateCountry(variables?: types.GetGlobalMasterDatabyCityStateCountryQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetGlobalMasterDatabyCityStateCountryQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetGlobalMasterDatabyCityStateCountryQuery>({ document: GetGlobalMasterDatabyCityStateCountryDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetGlobalMasterDatabyCityStateCountry', 'query', variables);
    },
    GetGlobalMasterDataForInviterFormAutoAppover(variables?: types.GetGlobalMasterDataForInviterFormAutoAppoverQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetGlobalMasterDataForInviterFormAutoAppoverQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetGlobalMasterDataForInviterFormAutoAppoverQuery>({ document: GetGlobalMasterDataForInviterFormAutoAppoverDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetGlobalMasterDataForInviterFormAutoAppover', 'query', variables);
    },
    GetGlobalMasterFormIcons(variables?: types.GetGlobalMasterFormIconsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetGlobalMasterFormIconsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetGlobalMasterFormIconsQuery>({ document: GetGlobalMasterFormIconsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetGlobalMasterFormIcons', 'query', variables);
    },
    getglobalmasterdataforfundtype(variables?: types.GetglobalmasterdataforfundtypeQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetglobalmasterdataforfundtypeQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetglobalmasterdataforfundtypeQuery>({ document: GetglobalmasterdataforfundtypeDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getglobalmasterdataforfundtype', 'query', variables);
    },
    getInputFieldFromFormId(variables: types.GetInputFieldFromFormIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetInputFieldFromFormIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetInputFieldFromFormIdQuery>({ document: GetInputFieldFromFormIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getInputFieldFromFormId', 'query', variables);
    },
    getInterimAnsweridFromAnswerid(variables: types.GetInterimAnsweridFromAnsweridQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetInterimAnsweridFromAnsweridQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetInterimAnsweridFromAnsweridQuery>({ document: GetInterimAnsweridFromAnsweridDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getInterimAnsweridFromAnswerid', 'query', variables);
    },
    getinterimcommentsbyrecommendid(variables?: types.GetinterimcommentsbyrecommendidQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetinterimcommentsbyrecommendidQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetinterimcommentsbyrecommendidQuery>({ document: GetinterimcommentsbyrecommendidDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getinterimcommentsbyrecommendid', 'query', variables);
    },
    getInterimRecommendationBySubmissionId(variables?: types.GetInterimRecommendationBySubmissionIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetInterimRecommendationBySubmissionIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetInterimRecommendationBySubmissionIdQuery>({ document: GetInterimRecommendationBySubmissionIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getInterimRecommendationBySubmissionId', 'query', variables);
    },
    getInterimScoreCalculationDetails(variables: types.GetInterimScoreCalculationDetailsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetInterimScoreCalculationDetailsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetInterimScoreCalculationDetailsQuery>({ document: GetInterimScoreCalculationDetailsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getInterimScoreCalculationDetails', 'query', variables);
    },
    getinterimwarninglogsbyInvitationId(variables: types.GetinterimwarninglogsbyInvitationIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetinterimwarninglogsbyInvitationIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetinterimwarninglogsbyInvitationIdQuery>({ document: GetinterimwarninglogsbyInvitationIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getinterimwarninglogsbyInvitationId', 'query', variables);
    },
    getInvitaionListByFormId(variables: types.GetInvitaionListByFormIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetInvitaionListByFormIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetInvitaionListByFormIdQuery>({ document: GetInvitaionListByFormIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getInvitaionListByFormId', 'query', variables);
    },
    getInvitationAndSubmissionDetailsByInvitationId(variables: types.GetInvitationAndSubmissionDetailsByInvitationIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetInvitationAndSubmissionDetailsByInvitationIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetInvitationAndSubmissionDetailsByInvitationIdQuery>({ document: GetInvitationAndSubmissionDetailsByInvitationIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getInvitationAndSubmissionDetailsByInvitationId', 'query', variables);
    },
    getinvitationcomment(variables?: types.GetinvitationcommentQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetinvitationcommentQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetinvitationcommentQuery>({ document: GetinvitationcommentDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getinvitationcomment', 'query', variables);
    },
    getInvitationCommentsByDate(variables?: types.GetInvitationCommentsByDateQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetInvitationCommentsByDateQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetInvitationCommentsByDateQuery>({ document: GetInvitationCommentsByDateDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getInvitationCommentsByDate', 'query', variables);
    },
    getInvitationDetailsById(variables?: types.GetInvitationDetailsByIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetInvitationDetailsByIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetInvitationDetailsByIdQuery>({ document: GetInvitationDetailsByIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getInvitationDetailsById', 'query', variables);
    },
    getInvitationDetailsByCompanyId(variables?: types.GetInvitationDetailsByCompanyIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetInvitationDetailsByCompanyIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetInvitationDetailsByCompanyIdQuery>({ document: GetInvitationDetailsByCompanyIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getInvitationDetailsByCompanyId', 'query', variables);
    },
    getInvitationDetailsByInviationId(variables?: types.GetInvitationDetailsByInviationIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetInvitationDetailsByInviationIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetInvitationDetailsByInviationIdQuery>({ document: GetInvitationDetailsByInviationIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getInvitationDetailsByInviationId', 'query', variables);
    },
    getinvitationSkipStatus(variables: types.GetinvitationSkipStatusQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetinvitationSkipStatusQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetinvitationSkipStatusQuery>({ document: GetinvitationSkipStatusDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getinvitationSkipStatus', 'query', variables);
    },
    getinvitationstatusandreopenlist(variables: types.GetinvitationstatusandreopenlistQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetinvitationstatusandreopenlistQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetinvitationstatusandreopenlistQuery>({ document: GetinvitationstatusandreopenlistDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getinvitationstatusandreopenlist', 'query', variables);
    },
    getInvitationStatusCounts(variables: types.GetInvitationStatusCountsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetInvitationStatusCountsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetInvitationStatusCountsQuery>({ document: GetInvitationStatusCountsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getInvitationStatusCounts', 'query', variables);
    },
    getInvitationSuggestionData(variables: types.GetInvitationSuggestionDataQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetInvitationSuggestionDataQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetInvitationSuggestionDataQuery>({ document: GetInvitationSuggestionDataDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getInvitationSuggestionData', 'query', variables);
    },
    getInvitaionListByFormIdandDate(variables: types.GetInvitaionListByFormIdandDateQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetInvitaionListByFormIdandDateQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetInvitaionListByFormIdandDateQuery>({ document: GetInvitaionListByFormIdandDateDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getInvitaionListByFormIdandDate', 'query', variables);
    },
    getInvitationListByFormId(variables: types.GetInvitationListByFormIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetInvitationListByFormIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetInvitationListByFormIdQuery>({ document: GetInvitationListByFormIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getInvitationListByFormId', 'query', variables);
    },
    getInvitedAssessmentListByCompanyId(variables: types.GetInvitedAssessmentListByCompanyIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetInvitedAssessmentListByCompanyIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetInvitedAssessmentListByCompanyIdQuery>({ document: GetInvitedAssessmentListByCompanyIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getInvitedAssessmentListByCompanyId', 'query', variables);
    },
    GetInviters(variables?: types.GetInvitersQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetInvitersQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetInvitersQuery>({ document: GetInvitersDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetInviters', 'query', variables);
    },
    CheckIsPasswordReset(variables: types.CheckIsPasswordResetQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.CheckIsPasswordResetQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.CheckIsPasswordResetQuery>({ document: CheckIsPasswordResetDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'CheckIsPasswordReset', 'query', variables);
    },
    getLastInvitationAnswerDetailsForCompanyByUserId(variables: types.GetLastInvitationAnswerDetailsForCompanyByUserIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetLastInvitationAnswerDetailsForCompanyByUserIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetLastInvitationAnswerDetailsForCompanyByUserIdQuery>({ document: GetLastInvitationAnswerDetailsForCompanyByUserIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getLastInvitationAnswerDetailsForCompanyByUserId', 'query', variables);
    },
    getLastInvitationAnswerDetailsForUserByUserId(variables: types.GetLastInvitationAnswerDetailsForUserByUserIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetLastInvitationAnswerDetailsForUserByUserIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetLastInvitationAnswerDetailsForUserByUserIdQuery>({ document: GetLastInvitationAnswerDetailsForUserByUserIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getLastInvitationAnswerDetailsForUserByUserId', 'query', variables);
    },
    getLastInvitationAnswerDetails(variables: types.GetLastInvitationAnswerDetailsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetLastInvitationAnswerDetailsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetLastInvitationAnswerDetailsQuery>({ document: GetLastInvitationAnswerDetailsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getLastInvitationAnswerDetails', 'query', variables);
    },
    getLastSubmittedInvitation(variables: types.GetLastSubmittedInvitationQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetLastSubmittedInvitationQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetLastSubmittedInvitationQuery>({ document: GetLastSubmittedInvitationDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getLastSubmittedInvitation', 'query', variables);
    },
    getLatestAnsweredQuestionId(variables?: types.GetLatestAnsweredQuestionIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetLatestAnsweredQuestionIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetLatestAnsweredQuestionIdQuery>({ document: GetLatestAnsweredQuestionIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getLatestAnsweredQuestionId', 'query', variables);
    },
    getLatestAssignedQuestionId(variables?: types.GetLatestAssignedQuestionIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetLatestAssignedQuestionIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetLatestAssignedQuestionIdQuery>({ document: GetLatestAssignedQuestionIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getLatestAssignedQuestionId', 'query', variables);
    },
    getParentCompanyMappingDetailsByCompanyId(variables?: types.GetParentCompanyMappingDetailsByCompanyIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetParentCompanyMappingDetailsByCompanyIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetParentCompanyMappingDetailsByCompanyIdQuery>({ document: GetParentCompanyMappingDetailsByCompanyIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getParentCompanyMappingDetailsByCompanyId', 'query', variables);
    },
    getParentCompanyByCompanyAndParentCompanyId(variables: types.GetParentCompanyByCompanyAndParentCompanyIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetParentCompanyByCompanyAndParentCompanyIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetParentCompanyByCompanyAndParentCompanyIdQuery>({ document: GetParentCompanyByCompanyAndParentCompanyIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getParentCompanyByCompanyAndParentCompanyId', 'query', variables);
    },
    getParentCompanyByUserAndAddressId(variables: types.GetParentCompanyByUserAndAddressIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetParentCompanyByUserAndAddressIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetParentCompanyByUserAndAddressIdQuery>({ document: GetParentCompanyByUserAndAddressIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getParentCompanyByUserAndAddressId', 'query', variables);
    },
    getParentCompanyDetailByUserId(variables?: types.GetParentCompanyDetailByUserIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetParentCompanyDetailByUserIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetParentCompanyDetailByUserIdQuery>({ document: GetParentCompanyDetailByUserIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getParentCompanyDetailByUserId', 'query', variables);
    },
    GetParentCompanyByCompanyIdNull(variables?: types.GetParentCompanyByCompanyIdNullQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetParentCompanyByCompanyIdNullQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetParentCompanyByCompanyIdNullQuery>({ document: GetParentCompanyByCompanyIdNullDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetParentCompanyByCompanyIdNull', 'query', variables);
    },
    GetPendingMakerCheckerRemarks(variables: types.GetPendingMakerCheckerRemarksQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetPendingMakerCheckerRemarksQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetPendingMakerCheckerRemarksQuery>({ document: GetPendingMakerCheckerRemarksDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetPendingMakerCheckerRemarks', 'query', variables);
    },
    getPlatformAndUserDetailsToGenerateToken(variables: types.GetPlatformAndUserDetailsToGenerateTokenQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetPlatformAndUserDetailsToGenerateTokenQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetPlatformAndUserDetailsToGenerateTokenQuery>({ document: GetPlatformAndUserDetailsToGenerateTokenDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getPlatformAndUserDetailsToGenerateToken', 'query', variables);
    },
    getPlatformApikeyByPlatformIdAndOrigin(variables: types.GetPlatformApikeyByPlatformIdAndOriginQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetPlatformApikeyByPlatformIdAndOriginQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetPlatformApikeyByPlatformIdAndOriginQuery>({ document: GetPlatformApikeyByPlatformIdAndOriginDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getPlatformApikeyByPlatformIdAndOrigin', 'query', variables);
    },
    getPostSubmissionRequiredDetails(variables: types.GetPostSubmissionRequiredDetailsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetPostSubmissionRequiredDetailsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetPostSubmissionRequiredDetailsQuery>({ document: GetPostSubmissionRequiredDetailsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getPostSubmissionRequiredDetails', 'query', variables);
    },
    getProcessingDataByIdAllTypes(variables: types.GetProcessingDataByIdAllTypesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetProcessingDataByIdAllTypesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetProcessingDataByIdAllTypesQuery>({ document: GetProcessingDataByIdAllTypesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getProcessingDataByIdAllTypes', 'query', variables);
    },
    getProcessingDataById(variables: types.GetProcessingDataByIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetProcessingDataByIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetProcessingDataByIdQuery>({ document: GetProcessingDataByIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getProcessingDataById', 'query', variables);
    },
    getProcessingDataByInvitationId(variables: types.GetProcessingDataByInvitationIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetProcessingDataByInvitationIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetProcessingDataByInvitationIdQuery>({ document: GetProcessingDataByInvitationIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getProcessingDataByInvitationId', 'query', variables);
    },
    getProgressReportbySubmissionId(variables?: types.GetProgressReportbySubmissionIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetProgressReportbySubmissionIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetProgressReportbySubmissionIdQuery>({ document: GetProgressReportbySubmissionIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getProgressReportbySubmissionId', 'query', variables);
    },
    getQuestionsFromFormId(variables: types.GetQuestionsFromFormIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetQuestionsFromFormIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetQuestionsFromFormIdQuery>({ document: GetQuestionsFromFormIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getQuestionsFromFormId', 'query', variables);
    },
    getQuestionListByInvitationId(variables?: types.GetQuestionListByInvitationIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetQuestionListByInvitationIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetQuestionListByInvitationIdQuery>({ document: GetQuestionListByInvitationIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getQuestionListByInvitationId', 'query', variables);
    },
    GetQuestionnaireDetailsForDeletion(variables: types.GetQuestionnaireDetailsForDeletionQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetQuestionnaireDetailsForDeletionQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetQuestionnaireDetailsForDeletionQuery>({ document: GetQuestionnaireDetailsForDeletionDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetQuestionnaireDetailsForDeletion', 'query', variables);
    },
    GetQuestionnaireFiltersData(variables?: types.GetQuestionnaireFiltersDataQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetQuestionnaireFiltersDataQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetQuestionnaireFiltersDataQuery>({ document: GetQuestionnaireFiltersDataDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetQuestionnaireFiltersData', 'query', variables);
    },
    GetQuestionnaireList(variables: types.GetQuestionnaireListQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetQuestionnaireListQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetQuestionnaireListQuery>({ document: GetQuestionnaireListDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetQuestionnaireList', 'query', variables);
    },
    GetQuestionnaireLogs(variables: types.GetQuestionnaireLogsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetQuestionnaireLogsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetQuestionnaireLogsQuery>({ document: GetQuestionnaireLogsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetQuestionnaireLogs', 'query', variables);
    },
    raraCompanyAccess(variables: types.RaraCompanyAccessQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.RaraCompanyAccessQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.RaraCompanyAccessQuery>({ document: RaraCompanyAccessDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'raraCompanyAccess', 'query', variables);
    },
    getvalidationandrating(variables: types.GetvalidationandratingQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetvalidationandratingQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetvalidationandratingQuery>({ document: GetvalidationandratingDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getvalidationandrating', 'query', variables);
    },
    getRecomendationBySubmissionIdAndFormfieldId(variables: types.GetRecomendationBySubmissionIdAndFormfieldIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetRecomendationBySubmissionIdAndFormfieldIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetRecomendationBySubmissionIdAndFormfieldIdQuery>({ document: GetRecomendationBySubmissionIdAndFormfieldIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getRecomendationBySubmissionIdAndFormfieldId', 'query', variables);
    },
    getRecommendationByInterimAnswerIdAndQuestionId(variables: types.GetRecommendationByInterimAnswerIdAndQuestionIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetRecommendationByInterimAnswerIdAndQuestionIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetRecommendationByInterimAnswerIdAndQuestionIdQuery>({ document: GetRecommendationByInterimAnswerIdAndQuestionIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getRecommendationByInterimAnswerIdAndQuestionId', 'query', variables);
    },
    getRecommendationListByInvitationId(variables: types.GetRecommendationListByInvitationIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetRecommendationListByInvitationIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetRecommendationListByInvitationIdQuery>({ document: GetRecommendationListByInvitationIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getRecommendationListByInvitationId', 'query', variables);
    },
    getRecommendationList(variables?: types.GetRecommendationListQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetRecommendationListQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetRecommendationListQuery>({ document: GetRecommendationListDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getRecommendationList', 'query', variables);
    },
    getRecommendationRenderFormDetails(variables: types.GetRecommendationRenderFormDetailsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetRecommendationRenderFormDetailsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetRecommendationRenderFormDetailsQuery>({ document: GetRecommendationRenderFormDetailsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getRecommendationRenderFormDetails', 'query', variables);
    },
    getReminderDetailsByInvitationId(variables: types.GetReminderDetailsByInvitationIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetReminderDetailsByInvitationIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetReminderDetailsByInvitationIdQuery>({ document: GetReminderDetailsByInvitationIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getReminderDetailsByInvitationId', 'query', variables);
    },
    getRenderFormDetails(variables: types.GetRenderFormDetailsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetRenderFormDetailsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetRenderFormDetailsQuery>({ document: GetRenderFormDetailsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getRenderFormDetails', 'query', variables);
    },
    getRenderFormFieldDetails(variables: types.GetRenderFormFieldDetailsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetRenderFormFieldDetailsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetRenderFormFieldDetailsQuery>({ document: GetRenderFormFieldDetailsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getRenderFormFieldDetails', 'query', variables);
    },
    getScoreCalculationDetails(variables: types.GetScoreCalculationDetailsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetScoreCalculationDetailsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetScoreCalculationDetailsQuery>({ document: GetScoreCalculationDetailsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getScoreCalculationDetails', 'query', variables);
    },
    getSourceFilesByInvitationId(variables?: types.GetSourceFilesByInvitationIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetSourceFilesByInvitationIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetSourceFilesByInvitationIdQuery>({ document: GetSourceFilesByInvitationIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getSourceFilesByInvitationId', 'query', variables);
    },
    getSourceDataById(variables: types.GetSourceDataByIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetSourceDataByIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetSourceDataByIdQuery>({ document: GetSourceDataByIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getSourceDataById', 'query', variables);
    },
    getSourceDataByInvitationId(variables: types.GetSourceDataByInvitationIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetSourceDataByInvitationIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetSourceDataByInvitationIdQuery>({ document: GetSourceDataByInvitationIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getSourceDataByInvitationId', 'query', variables);
    },
    getSubmittedFormToDownloadAsPDF(variables: types.GetSubmittedFormToDownloadAsPdfQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetSubmittedFormToDownloadAsPdfQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetSubmittedFormToDownloadAsPdfQuery>({ document: GetSubmittedFormToDownloadAsPdfDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getSubmittedFormToDownloadAsPDF', 'query', variables);
    },
    getsubmittedformtodownloadexcel(variables?: types.GetsubmittedformtodownloadexcelQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetsubmittedformtodownloadexcelQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetsubmittedformtodownloadexcelQuery>({ document: GetsubmittedformtodownloadexcelDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getsubmittedformtodownloadexcel', 'query', variables);
    },
    GetSuggestedDocuments(variables: types.GetSuggestedDocumentsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetSuggestedDocumentsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetSuggestedDocumentsQuery>({ document: GetSuggestedDocumentsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetSuggestedDocuments', 'query', variables);
    },
    getSuggestionByInvitationAndFormFieldDetails(variables: types.GetSuggestionByInvitationAndFormFieldDetailsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetSuggestionByInvitationAndFormFieldDetailsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetSuggestionByInvitationAndFormFieldDetailsQuery>({ document: GetSuggestionByInvitationAndFormFieldDetailsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getSuggestionByInvitationAndFormFieldDetails', 'query', variables);
    },
    getSuggestionsAndFormFieldDataByInvitationId(variables: types.GetSuggestionsAndFormFieldDataByInvitationIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetSuggestionsAndFormFieldDataByInvitationIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetSuggestionsAndFormFieldDataByInvitationIdQuery>({ document: GetSuggestionsAndFormFieldDataByInvitationIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getSuggestionsAndFormFieldDataByInvitationId', 'query', variables);
    },
    getSuggestionsDataByInvitationId(variables?: types.GetSuggestionsDataByInvitationIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetSuggestionsDataByInvitationIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetSuggestionsDataByInvitationIdQuery>({ document: GetSuggestionsDataByInvitationIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getSuggestionsDataByInvitationId', 'query', variables);
    },
    getTodayEmailData(variables?: types.GetTodayEmailDataQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetTodayEmailDataQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetTodayEmailDataQuery>({ document: GetTodayEmailDataDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getTodayEmailData', 'query', variables);
    },
    GetUserAllocationById(variables: types.GetUserAllocationByIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetUserAllocationByIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetUserAllocationByIdQuery>({ document: GetUserAllocationByIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetUserAllocationById', 'query', variables);
    },
    GetUserConversations(variables: types.GetUserConversationsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetUserConversationsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetUserConversationsQuery>({ document: GetUserConversationsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetUserConversations', 'query', variables);
    },
    getUserDetailsByInvitationId(variables: types.GetUserDetailsByInvitationIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetUserDetailsByInvitationIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetUserDetailsByInvitationIdQuery>({ document: GetUserDetailsByInvitationIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getUserDetailsByInvitationId', 'query', variables);
    },
    getParentCompanyMappingByAddressId(variables?: types.GetParentCompanyMappingByAddressIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetParentCompanyMappingByAddressIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetParentCompanyMappingByAddressIdQuery>({ document: GetParentCompanyMappingByAddressIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getParentCompanyMappingByAddressId', 'query', variables);
    },
    getUserDetailByBulkId(variables?: types.GetUserDetailByBulkIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetUserDetailByBulkIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetUserDetailByBulkIdQuery>({ document: GetUserDetailByBulkIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getUserDetailByBulkId', 'query', variables);
    },
    getUserDetailByCompanyId(variables?: types.GetUserDetailByCompanyIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetUserDetailByCompanyIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetUserDetailByCompanyIdQuery>({ document: GetUserDetailByCompanyIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getUserDetailByCompanyId', 'query', variables);
    },
    getUserDetailByEmail(variables?: types.GetUserDetailByEmailQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetUserDetailByEmailQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetUserDetailByEmailQuery>({ document: GetUserDetailByEmailDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getUserDetailByEmail', 'query', variables);
    },
    getUserDetailById(variables?: types.GetUserDetailByIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetUserDetailByIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetUserDetailByIdQuery>({ document: GetUserDetailByIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getUserDetailById', 'query', variables);
    },
    getUserDetailByParentCompanyId(variables?: types.GetUserDetailByParentCompanyIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetUserDetailByParentCompanyIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetUserDetailByParentCompanyIdQuery>({ document: GetUserDetailByParentCompanyIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getUserDetailByParentCompanyId', 'query', variables);
    },
    getUserDetailByPhone(variables?: types.GetUserDetailByPhoneQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetUserDetailByPhoneQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetUserDetailByPhoneQuery>({ document: GetUserDetailByPhoneDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getUserDetailByPhone', 'query', variables);
    },
    getvalidationWarningRulesbyInvitationId(variables?: types.GetvalidationWarningRulesbyInvitationIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetvalidationWarningRulesbyInvitationIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetvalidationWarningRulesbyInvitationIdQuery>({ document: GetvalidationWarningRulesbyInvitationIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getvalidationWarningRulesbyInvitationId', 'query', variables);
    },
    getWarninginterimdataByFormId(variables: types.GetWarninginterimdataByFormIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetWarninginterimdataByFormIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetWarninginterimdataByFormIdQuery>({ document: GetWarninginterimdataByFormIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getWarninginterimdataByFormId', 'query', variables);
    },
    getWebCurationProcessAndAIBulkDocumentProcessing(variables: types.GetWebCurationProcessAndAiBulkDocumentProcessingQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetWebCurationProcessAndAiBulkDocumentProcessingQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetWebCurationProcessAndAiBulkDocumentProcessingQuery>({ document: GetWebCurationProcessAndAiBulkDocumentProcessingDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getWebCurationProcessAndAIBulkDocumentProcessing', 'query', variables);
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;