import React from "react";
import { useSelector } from "react-redux";

const PlayerInfo = () => {
  const player = useSelector((state) => state.player);
  const ratio = player.health / player.totalHealth;
  const healthWidth = 200 * ratio;
  const expWidth = (player.experience / player.totalExp) * 200;

  let healthStyle = "";

  if (healthWidth <= 40) {
    healthStyle = {
      background: "rgb(87,0,0)",
      background:
        "linear-gradient(180deg, rgba(87,0,0,0.6362920168067228) 0%, rgba(252,18,4,0.921086356466877) 46%, rgba(87,0,0,1) 88%, rgba(252,70,107,0.47629140378548895) 100%)",
      width: `${healthWidth}px`,
      height: "20px"
    };
  } else if (healthWidth >= 40 && healthWidth <= 120) {
    healthStyle = {
      background: "rgb(105,105,0);",
      background:
        "linear-gradient(0deg, rgba(105,105,0,1) 0%, rgba(255,255,0,1) 48%, rgba(105,105,0,1) 100%)",
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
    <div className="playerInfo">
      <div className="player">
        <h3 id="playerName">{player.name}</h3>
      </div>
      <div className="playerDetails">
        <div className="playerImg" style={{ width: "80px", height: "80px" }}>
          <img src="goldRing.png" width="78px" height="78px" />
          <img src={player.portrait} className="portrait" />
        </div>
        <div className="bars">
          <div className="bar">
            <div className="hp">
              <h4 className="whiteText">HP</h4>
            </div>

            <div
              style={{
                backgroundColor: "black",
                width: "200px",
                height: "20px"
              }}>
              <div style={healthStyle}>
                {" "}
                <div className="barRatioMp">{`${player.health}/${player.totalHealth}`}</div>
              </div>
            </div>
          </div>

          <div className="bar">
            <div className="exp">
              <h4 className="whiteText">EXP</h4>
            </div>
            <div
              style={{
                backgroundColor: "black",
                width: "200px",
                height: "20px"
              }}>
              <div
                style={{
                  background: "rgb(0,0,96)",
                  background:
                    "linear-gradient(0deg, rgba(0,0,96,1) 0%, rgba(93,93,255,1) 48%, rgba(0,0,220,1) 100%)",
                  width: `${expWidth}px`,
                  height: "20px"
                }}>
                <div className="barRatioEx">{`${player.experience}/${player.totalExp}`}</div>
              </div>
            </div>
          </div>
        </div>

        {/* <div className="levelRing">
          <img src="goldRing.png" width="35px" height="35px" />
        </div> */}
        {/* <h3 className="level">{player.level}</h3> */}
      </div>
    </div>
  );
};

export default PlayerInfo;
