import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { eventEmitter } from "../../src/event/EventEmitter";
import Ui from "./Ui";
import { InitSubscriptionsToPhaser } from "../sync/phaserSync";
import HowToPlay from "./HowToPlay";

const useStyles = makeStyles((theme) => ({
  chatContainer: {
    display: "flex",
    justifyContent: "center"
  }
}));

export const GameView = (props) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const muiClasses = useStyles(); //this is used to override material ui styles
  const player = useSelector((state) => state.player);
  const [popUp, setPopUp] = useState(false);

  //if a new player, set popUp to true
  useEffect(() => {
    if (location.state && location.state.newUser) {
      setPopUp(true);
    };
  }, []);

  const handleClose = () => {
    setPopUp(false)
  }


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
      {popUp && <HowToPlay handleClose={handleClose}/>}
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
