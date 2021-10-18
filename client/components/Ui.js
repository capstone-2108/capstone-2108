import React from "react";
import { useSelector } from "react-redux";
import PlayerInfo from "./PlayerInfo";
import Gold from "./Gold";
import SelectedPlayerInfo from "./SelectedPlayerInfo";

const Ui = () => {
  const player = useSelector((state) => state.player);
  const currentScene = player.scene;
  const items = 16;
  return (
    <div>
      <PlayerInfo />
      <Gold />
      <SelectedPlayerInfo />

      <div className="itemList">
        {Array.from(Array(items), (e, i) => {
          return (
            <div className="item">
              {i === 0 ? <img src="minecraft_sword.png" width="50px" height="50px" /> : ""}
              {i === 1 ? <img src="Torch.png" width="60px" height="60px" /> : ""}
            </div>
          );
        })}
      </div>
      <div className="currentScene">{currentScene}</div>
    </div>
  );
};

export default Ui;
