import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addNewMessage, sendMessage } from "../store/chat";
import { eventEmitter } from "../../src/event/EventEmitter";

export const NewChatEntry = (props) => {
  const [messageEntry, setMessageEntry] = useState("");
  const player = useSelector((state) => state.player);
  const dispatch = useDispatch();
  const { socket } = props;
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

  const disablePhaserEvents = (evt) => {
    console.log('test');
    eventEmitter.emit("disabledEvents");
  };

  const sendMessage = (evt) => {
    evt.stopPropagation();
    if (evt.key === "Enter") {
      const message = {
        channel: "world",
        message: {
          name: player.name,
          message: evt.target.value
        }
      };
      socket.emit("sendMessage", message);
      dispatch(addNewMessage(message));
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
        onSelect={disablePhaserEvents}
      />
    </div>
  );
};
