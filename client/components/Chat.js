import React, {useEffect, useState} from 'react';
import io from 'socket.io-client';
import {NewChatEntry} from './NewChatEntry';
import {useDispatch, useSelector} from 'react-redux';
import {addNewMessage} from '../store/chat';
import ChatHistory from './ChatHistory';
import Grid from '@material-ui/core/Grid';

const Chat = (props) => {
  const [socket, setSocket] = useState(null);
  const messages = useSelector(state => state.chat.messages.world);
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
      {socket ? (
        <Grid container>
          <Grid item>
            <ChatHistory/>
            <NewChatEntry socket={socket}/>
          </Grid>
        </Grid>
      ) : (
        <div>Not Connected</div>
      )}
    </div>
  );
}


export default Chat;