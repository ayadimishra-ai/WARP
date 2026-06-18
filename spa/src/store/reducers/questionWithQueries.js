
import { QUESTION_WITH_QUERY, QUESTION_WITH_QUERY_Comments, QUESTION_WITH_QUERY_COUNT, QUESTION_WITH_QUERY_IFRAME, QUESTION_WITH_QUERY_QwcLoader, QUESTION_WITH_QUERY_QwcOpen, QUESTION_WITH_QUERY_SHOW, QUESTION_WITH_QUERY_TITLE } from '../actions/actionTypes';


const initialState = {
    questionWithQueriesData: {
        commonDialog: {
            isOpened: false,
        }
    },
    popupTitle: "",
    iFrameLoader2: true,
    count: 0,
    show: false,
    QwcLoader:false,
    QwcOpen:false,
    QuestionsWithComments:'Q'
};

const questionWithQueriesReducer = (state = initialState, action) => {

    switch (action.type) {

        case QUESTION_WITH_QUERY:
            return { ...state, questionWithQueriesData: action.payload };
        case QUESTION_WITH_QUERY_COUNT:
            return { ...state, count: action.payload };
        case QUESTION_WITH_QUERY_IFRAME:
            return { ...state, iFrameLoader2: action.payload };
        case QUESTION_WITH_QUERY_TITLE:
            return { ...state, popupTitle: action.payload };
        case QUESTION_WITH_QUERY_SHOW:
            return { ...state, show: action.payload };
        case QUESTION_WITH_QUERY_QwcLoader:
            return { ...state, QwcLoader: action.payload };
        case QUESTION_WITH_QUERY_QwcOpen:
            return { ...state, QwcOpen: action.payload };
            case QUESTION_WITH_QUERY_Comments:
                return { ...state, QuestionsWithComments: action.payload };
        default:
            return state;
    }
};

export default questionWithQueriesReducer;
