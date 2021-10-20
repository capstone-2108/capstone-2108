import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { logout } from "../store";
import Chat from "./Chat";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { eventEmitter } from "../../src/event/EventEmitter";

import Ui from "./Ui";

import { InitSubscriptionsToPhaser } from "../sync/phaserSync";
import { logoutCharacters } from "../store/player";

const useStyles = makeStyles((theme) => ({
  chatContainer: {
    display: "flex",
    justifyContent: "center"
  }
}));

export const GameView = () => {
  const dispatch = useDispatch();
  const muiClasses = useStyles(); //this is used to override material ui styles
  const player = useSelector((state) => state.player);

  const doLogout = () => {
    dispatch(logoutCharacters(player.characterId));
    dispatch(logout());
    eventEmitter.emit("localPlayerLogout");
  };

  const enableKeys = () => {
    eventEmitter.emit('enableKeyEvents');
  }

  return (
    <div className="layout">
      <InitSubscriptionsToPhaser />
      <div className="left">
        <div onClick={enableKeys} id="phaser"></div>
        <div className="worldChat">
          <Chat />
        </div>
      </div>
      <div className="ui">
        <div>
          <Ui />
        </div>

        <div>
          <Link to="/select">
            <button id="characterButton">CHARACTERS</button>
          </Link>
          <Link to="/">
            <button onClick={doLogout} id="logoutButton">
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
