import axios from "axios";

/*************************
 * Action Types          *
 ************************/
export const SET_TEMPLATES = "SET_TEMPLATES";

/*************************
 * Action Creators       *
 ************************/
export const setTemplates = (templateCharacters) => {
  return {
    type: SET_TEMPLATES,
    templateCharacters
  }
}

//--Thunks--
export const fetchTemplateCharacters = () => {
  return async (dispatch) => {
    try {
      const result = await axios.get('/api/game/templates');
      dispatch(setTemplates(result.data))
    } catch (err) {
      console.log(err)
    }
  }
}

/*************************
 * Reducer       *
 ************************/
export default function templateCharactersReducer(state = [], action) {
  switch (action.type) {
    case SET_TEMPLATES:
      return action.templateCharacters
    default:
      return state
  }
}
