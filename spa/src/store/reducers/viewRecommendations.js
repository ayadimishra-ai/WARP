
import { VIEW_RECOMMENDATIONS_BUTTON_OPEN, VIEW_RECOMMENDATIONS_BUTTON_CLOSE, VIEW_RECOMMENDATIONS_BUTTON_URL } from '../actions/actionTypes';
const initialState = {
    url: "",
    recommendationBtn:false
};

const viewRecommendationsReducer = (state = initialState, action) => {

    switch (action.type) {
        case VIEW_RECOMMENDATIONS_BUTTON_OPEN:
            return { ...state, recommendationBtn: action.payload };
        case VIEW_RECOMMENDATIONS_BUTTON_CLOSE:
            return { ...state, recommendationBtn: action.payload };
        case VIEW_RECOMMENDATIONS_BUTTON_URL:
            return { ...state, url: action.payload };
        default:
            return state;
    }
};

export default viewRecommendationsReducer;