import React, {useState} from 'react';
import {useDispatch} from 'react-redux';
import {sendMessage} from '../store/chat';

export const NewChatEntry = (props) => {
  const [messageEntry, setMessageEntry] = useState('');
  const dispatch = useDispatch();
  const handleSend = (evt) => {
    if(evt.key === 'Enter') {
      dispatch(sendMessage(evt.target.value))
      // socket.emit('sendMessage', evt.target.value);
      setMessageEntry('');
    }
  }
  const handleTyping = (evt) => {
    setMessageEntry(evt.target.value);
  }

  return (
    <div>
      <input className="new-chat-message" value={messageEntry} onChange={handleTyping} onKeyPress={handleSend}/>
    </div>
  )
}