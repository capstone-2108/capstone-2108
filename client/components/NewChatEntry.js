import React, { useState } from "react";
import {useDispatch, useSelector} from 'react-redux';
import { sendMessage } from "../store/chat";

export const NewChatEntry = (props) => {
  const [messageEntry, setMessageEntry] = useState("");
  const player = useSelector(state => state.player);
  const dispatch = useDispatch();
  const {socket} = props;
  // const handleSend = (evt) => {
  //   evt.stopPropagation();
  //   if(evt.key === 'Enter') {
  //     dispatch(sendMessage(evt.target.value))
  //     // socket.emit('sendMessage', evt.target.value);
  //     setMessageEntry('');
  //   }
  // }
  const handleTyping = (evt) => {
    setMessageEntry(evt.target.value);
  };

  const sendMessage = (evt) => {
    evt.stopPropagation();
    if (evt.key === "Enter") {
      socket.emit("sendMessage", {
        channel: "world",
        message: {
          name: player.name,
          message: evt.target.value
        }
      });
      setMessageEntry("");
    }
  };

  return (
    <div>
      <input
        className="new-chat-message"
        value={messageEntry}
        onChange={handleTyping}
        onKeyPress={sendMessage}
      />
    </div>
  );
};
