import React from 'react';

const ChatMessage = (props) => {
  const {message} = props;
  return (
    <div className="chat-message">{message.name}: {message.message}</div>
  );
}

export default ChatMessage;