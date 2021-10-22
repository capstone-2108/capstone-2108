import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { eventEmitter } from "../../src/event/EventEmitter";
import Ui from "./Ui";
import { InitSubscriptionsToPhaser } from "../sync/phaserSync";

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

  const enableKeys = () => {
    eventEmitter.emit("enableKeyEvents");
  };

  return (
    <div className="layout">
      <InitSubscriptionsToPhaser />
      <div className="left">
        <div onClick={enableKeys} id="phaser"></div>
      </div>
      <div className="ui">
        <div>
          <Ui />
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
