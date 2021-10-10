import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Game } from "../../src/Game";
import { logout } from "../store";
import Chat from "./Chat";
import Grid from "@material-ui/core/Grid";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {eventEmitter} from '../../src/event/EventEmitter';

const useStyles = makeStyles((theme) => ({
  chatContainer: {
    display: "flex",
    justifyContent: "center"
  }
}));

export const GameView = () => {
  const dispatch = useDispatch();
  const muiClasses = useStyles(); //this is used to override material ui styles


  useEffect(() => {
    window.game = new Game();
    eventEmitter.addEventListener('test', () => {console.log('test!')})

  }, []);

  test() {

  }

  return (
    <div>
      <button onClick={test}>Send to game</button>
      <div className="top">
        <div id="phaser"></div>
        <div className="inventory">
          <h3>inventory</h3>
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
