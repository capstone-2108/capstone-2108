import React, {useEffect, useState} from 'react';
import io from 'socket.io-client';
import {NewMessageEntry} from './NewMessageEntry';
import {useDispatch, useSelector} from 'react-redux';
import {addNewMessage} from '../store/worldChat';

const Chat = (props) => {
  const [socket, setSocket] = useState(null);
  const messages = useSelector(state => state.worldChat.messages);
  const dispatch = useDispatch();

  useEffect(() => {
    const newSocket = io(`http://${window.location.hostname}:1338/worldChat`, {withCredentials: true});
    setSocket(newSocket);
    newSocket.on('newMessage', (message) => {
      dispatch(addNewMessage(message));
    });
    return () => newSocket.close();
  }, []);

  return (
    <div className='App'>
      <header className='app-header'>
        React Chat
      </header>
      {socket ? (
        <div className='chat-container'>

        </div>
      ) : (
        <div>Not Connected</div>
      )}
      <NewMessageEntry socket={socket}/>
    </div>
  );
}


export default Chat;