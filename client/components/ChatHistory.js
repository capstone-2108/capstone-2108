import React from 'react';
import {useSelector} from 'react-redux';
import ChatMessage from './ChatMessage';

const ChatHistory = (props) => {
  const messages = useSelector(state => state.chat.messages.world);
  const messageDivs = [];
  let i = messages.length-1; //cache the message length, yes i'm micro optimizing ;)
  let curIdx = 0;
  for(; i >=0; i--) {
    const message = messages[i];
    messageDivs[curIdx++] = <ChatMessage key={message.id} message={message}/>
  }
  return (
    <div id='chat_history'>
      {messageDivs}
    </div>
  );
};

export default ChatHistory;