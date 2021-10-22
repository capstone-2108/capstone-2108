import React from "react";
import { useSelector } from "react-redux";
import PlayerInfo from "./PlayerInfo";
import Gold from "./Gold";
import SelectedPlayerInfo from "./SelectedPlayerInfo";
import Chat from "./Chat";
import { logout } from "../store";
import { logoutCharacters } from "../store/player";
import { Link } from "react-router-dom";

const Ui = () => {
  const player = useSelector((state) => state.player);
  const currentScene = player.scene;
  const items = 16;
  const doLogout = () => {
    dispatch(logoutCharacters(player.characterId));
    dispatch(logout());
    eventEmitter.emit("localPlayerLogout");
  };
  return (
    <div>
      <PlayerInfo />
      {/* <Gold /> */}
      {player.selectedPlayer.id ? <SelectedPlayerInfo /> : <div />}

      <div className="itemList">
        {Array.from(Array(items), (e, i) => {
          return (
            <div className="item">
              {i === 0 ? <img src="minecraft_sword.png" width="50px" height="50px" /> : ""}
            </div>
          );
        })}
      </div>
      <div className="currentScene">{currentScene}</div>
      <Link to="/">
        <button onClick={doLogout} id="logoutButton">
          QUIT
        </button>
      </Link>
      <div className="worldChat">
        <Chat />
      </div>
    </div>
  );
};

export default Ui;
