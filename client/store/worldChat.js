import axios from "axios";

/*************************
 * Action Types          *
 ************************/
export const SEND_WORLDCHAT_MESSAGE = "SEND_WORLDCHAT_MESSAGE";
export const ADD_NEW_MESSAGE = "ADD_NEW_MESSAGE";

/*************************
 * Action Creators       *
 ************************/
//--Plain actions--
export const addNewMessage = (message) => {
  return {
    type: ADD_NEW_MESSAGE,
    message
  }
}

//--Thunks--
export const sendMessage = (message) => {
  return async (dispatch) => {
    try {
      const response = await axios.post(`/api/chat/world`, {message});
      if(response.status === 200) {
        dispatch(addNewMessage(response.data));
      }
    } catch (err) {
      console.log(err);
    }
  };
};




/*************************
 * Reducer       *
 ************************/
const initialState = {
  messages: {
    world: []
  }
};

export default (state = initialState, action) => {
  switch (action.type) {
    case ADD_NEW_MESSAGE:
      const newMessages = [...state.messages[action.message.channel]];
      newMessages.push(action.message.message);
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.message.channel]: newMessages
        },
      }
    default:
      return state;
  }
};
