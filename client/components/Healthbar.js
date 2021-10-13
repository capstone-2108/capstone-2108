import React from "react";
import { useSelector } from "react-redux";

const Healthbar = () => {
  const player = useSelector((state) => state.player);
  const ratio = player.health / player.totalHealth;
  const healthWidth = 300 * ratio;

  let healthStyle = "";

  if (healthWidth <= 30) {
    healthStyle = {
      background: "rgb(87,0,0)",
      background:
        "linear-gradient(180deg, rgba(87,0,0,0.6362920168067228) 0%, rgba(252,18,4,0.921086356466877) 46%, rgba(87,0,0,1) 88%, rgba(252,70,107,0.47629140378548895) 100%)",
      width: `${healthWidth}px`,
      height: "20px"
    };
  } else if (healthWidth >= 30 && healthWidth <= 60) {
    healthStyle = {
      background: "rgb(159,159,3)",
      background:
        "linear-gradient(180deg, rgba(159,159,0,1) 0%, rgba(255,255,0,1) 48%, rgba(159,159,0,1) 88%)",
      width: `${healthWidth}px`,
      height: "20px"
    };
  } else {
    healthStyle = {
      background: "rgb(14,106,0)",
      background:
        "linear-gradient(180deg, rgba(14,106,0,1) 0%, rgba(50,205,50,1) 48%, rgba(14,106,0,1) 88%)",
      width: `${healthWidth}px`,
      height: "20px"
    };
  }

  return (
    <div>
      <div className="player">
        <img src="b7c6549290654353cdcf3c0db0d7b38d.png" width="20px" height="20px" />
        <h3 id="playerName">{player.name}</h3>
      </div>
      <div className="health">
        <div>
          <h4 className="whiteText">HP</h4>
        </div>

        <div
          style={{
            backgroundColor: "black",
            width: "280px",
            height: "20px",
            margin: "5px"
          }}>
          <div style={healthStyle}></div>
        </div>
      </div>
    </div>
  );
};

export default Healthbar;
