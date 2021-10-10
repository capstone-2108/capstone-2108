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
  message.message.id = Date.now() + '-' + message.message.name
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
      let channelMessages = state.messages[action.message.channel];
      //only keep the last 30 messages
      let newMessages = channelMessages.length >= 30 ? channelMessages.slice(10) : [...channelMessages]
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
