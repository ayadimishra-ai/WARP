import * as actionTypes from '../actions/actionTypes';

const initialState = {
  refresh: false,
  uploadActivityCode: null,
  uploadAIActivityCode: null
};

const BulkUploadReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.REFRESH_IFRAME:
      return { ...state, refresh: !state.refresh };

    case actionTypes.UPLOAD_ACTIVITY_CODE:
      return { ...state, uploadActivityCode: action.payload };

    case actionTypes.UPLOAD_AI_ACTIVITY_CODE:
      return { ...state, uploadAIActivityCode: action.payload };

    default:
      return state;
  }
};

export default BulkUploadReducer;