import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Game } from "../../src/Game";
import { logout } from "../store";
import Chat from "./Chat";
import Grid from "@material-ui/core/Grid";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { eventEmitter } from "../../src/event/EventEmitter";
import { fetchCharacterData, fetchNearbyPlayers, updateHealth } from "../store/player";
import io from "socket.io-client";
import { addNewMessage } from "../store/chat";
import Inventory from "./Inventory";
import {InitSubscriptionsToPhaser} from '../sync/phaserSync';

const useStyles = makeStyles((theme) => ({
  chatContainer: {
    display: "flex",
    justifyContent: "center"
  }
}));

export const GameView = () => {
  const dispatch = useDispatch();
  const muiClasses = useStyles(); //this is used to override material ui styles

  return (
    <div className="layout">
      <InitSubscriptionsToPhaser/>
      <div className="left">
        <div id="phaser"></div>
        <div className="worldChat">
          <Chat />
        </div>
      </div>
      <div className="inventory">
        <div>
          <Inventory />
        </div>

        <div>
          <Link to="/select">
            <button id="characterButton">CHARACTERS</button>
          </Link>
          <Link to="/">
            <button onClick={() => dispatch(logout())} id="logoutButton">
              QUIT
            </button>
          </Link>
        </div>
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
