import React from "react";
import { useSelector, useDispatch } from "react-redux";
import PlayerInfo from "./PlayerInfo";
import SelectedPlayerInfo from "./SelectedPlayerInfo";
import Chat from "./Chat";
import { logout } from "../store";
import { logoutCharacters } from "../store/player";
import { Link } from "react-router-dom";
import { eventEmitter } from "../../src/event/EventEmitter";
import { makeStyles, Button } from "@material-ui/core";

const useStyles = makeStyles(() => ({
  btn: {
    fontFamily: "Cinzel Decorative",
    textDecoration: "none",
    backgroundColor: "#77963f",
    color: "#f5f3e6",
    "&:hover": {
      backgroundColor: "#5555fc"
    },
    textTransform: "lowercase"
  }
}));

const Ui = () => {
  const dispatch = useDispatch();
  const classes = useStyles();
  const player = useSelector((state) => state.player);
  const currentScene = player.sceneName;
  const items = 4;
  const doLogout = () => {
    dispatch(logoutCharacters(player.characterId));
    dispatch(logout());
    eventEmitter.emit("localPlayerLogout");
  };
  return (
    <div className="dashboard">
      <PlayerInfo />
      {/* <Gold /> */}
      {player.selectedUnit.name ? <SelectedPlayerInfo /> : <div style={{ height: "59px" }}></div>}

      <div className="itemList">
        {Array.from(Array(items), (e, i) => {
          return (
            <div className="item" key={i}>
              {i === 0 ? <img src="minecraft_sword.png" width="50px" height="50px" /> : ""}
            </div>
          );
        })}
      </div>
      <div className="currentScene">{currentScene}</div>
      <div className="quit">
        <Link to="/" style={{ textDecoration: "none" }}>
          <Button onClick={doLogout} className={classes.btn}>
            QUIT
          </Button>
        </Link>
      </div>
      <div className="worldChat">
        <Chat />
      </div>
    </div>
  );
};

export default Ui;
