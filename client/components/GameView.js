import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Game } from "../../src/Game";
import { logout } from "../store";
import Chat from "./Chat";
import Grid from "@material-ui/core/Grid";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { eventEmitter } from "../../src/event/EventEmitter";
import { fetchCharacterData, updateHealth } from "../store/player";
import io from "socket.io-client";
import { addNewMessage } from "../store/chat";
import Inventory from "./Inventory";

const useStyles = makeStyles((theme) => ({
  chatContainer: {
    display: "flex",
    justifyContent: "center"
  }
}));

export const GameView = () => {
  const dispatch = useDispatch();
  const muiClasses = useStyles(); //this is used to override material ui styles
  const [phaserLoaded, setPhaserLoaded] = useState();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    console.log("GameView useEffect");
    window.game = new Game();
    eventEmitter.addEventListener("phaserLoad", (data) => {
      dispatch(fetchCharacterData());
    });

    const newSocket = io(`http://${window.location.hostname}:1338/gameSync`, {
      withCredentials: true
    });
    setSocket(newSocket);
    newSocket.on("otherPlayerLoad", (data) => {
      eventEmitter.dispatch("otherPlayerLoad", data);
    });
    return () => newSocket.close();
  }, []);

  return (
    <div>
      <div className="top">
        <div id="phaser"></div>
        <div className="inventory">
          <h3>inventory</h3>

          <Inventory />

          <div id="logoutButton">
            <Link to="/">
              <button onClick={() => dispatch(logout())}>Logout</button>
            </Link>
          </div>
        </div>
      </div>
      <div className="worldChat">
        <Chat />
      </div>
    </div>
  );
};

{
  /* <Grid container >
      <Grid item xs={12}>
        <Link to='/'>
          <button onClick={() => dispatch(logout())}>Logout</button>
        </Link>
      </Grid>
      <Grid item xs={12} >
        <div id='phaser'></div>
      </Grid>
      <Grid item xs={12} className={muiClasses.chatContainer}>
        <Chat/>
      </Grid>
    </Grid> */
}
