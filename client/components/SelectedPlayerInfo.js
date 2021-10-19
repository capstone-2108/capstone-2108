import React from "react";
import { useSelector } from "react-redux";

const SelectedPlayerInfo = () => {
  const selectedPlayer = useSelector((state) => state.player.selectedPlayer);
  const ratio = selectedPlayer.health / 500;
  const healthWidth = 150 * ratio;
  const expWidth = (selectedPlayer.experience / 100) * 150;

  console.log("selected**", selectedPlayer);

  let healthStyle = "";

  if (healthWidth <= 30) {
    healthStyle = {
      background: "rgb(87,0,0)",
      background:
        "linear-gradient(180deg, rgba(87,0,0,0.6362920168067228) 0%, rgba(252,18,4,0.921086356466877) 46%, rgba(87,0,0,1) 88%, rgba(252,70,107,0.47629140378548895) 100%)",
      width: `${healthWidth}px`,
      height: "12px"
    };
  } else if (healthWidth >= 30 && healthWidth <= 60) {
    healthStyle = {
      background: "rgb(105,105,0);",
      background:
        "linear-gradient(0deg, rgba(105,105,0,1) 0%, rgba(255,255,0,1) 48%, rgba(105,105,0,1) 100%)",
      width: `${healthWidth}px`,
      height: "12px"
    };
  } else {
    healthStyle = {
      background: "rgb(14,106,0)",
      background:
        "linear-gradient(180deg, rgba(14,106,0,1) 0%, rgba(50,205,50,1) 48%, rgba(14,106,0,1) 88%)",
      width: `${healthWidth}px`,
      height: "12px"
    };
  }
  return (
    <div className="OtherCharacterInfo">
      <div className="player">
        {selectedPlayer.name ? (
          <h3 id="otherPlayerName">{selectedPlayer.name}</h3>
        ) : (
          <h3 id="anonymous">?</h3>
        )}
      </div>
      <div className="playerDetails">
        <div className="playerImg">
          <img src="goldRing.png" width="50px" height="50px" />
          {selectedPlayer.portrait ? (
            <img src={selectedPlayer.portrait} className="otherPortrait" />
          ) : (
            <img src="question.png" className="otherPortrait" />
          )}
        </div>
        <div className="otherLevelRing">
          <img src="goldRing.png" width="35px" height="35px" />
        </div>
        {selectedPlayer.level ? (
          <h3 className="otherLevel">{selectedPlayer.level}</h3>
        ) : (
          <h3 className="otherLevel">0</h3>
        )}

        <div className="bars">
          <div className="otherBar">
            <div className="hp">
              <h4 className="whiteText">HP</h4>
            </div>
            <div
              style={{
                backgroundColor: "black",
                width: "150px",
                height: "12px"
              }}>
              <div style={healthStyle}></div>
            </div>
          </div>
          <div className="otherBar">
            <div className="exp">
              <h4 className="whiteText">EXP</h4>
            </div>
            <div
              style={{
                backgroundColor: "black",
                width: "150px",
                height: "12px"
              }}>
              <div
                style={{
                  background: "rgb(0,0,96)",
                  background:
                    "linear-gradient(0deg, rgba(0,0,96,1) 0%, rgba(93,93,255,1) 48%, rgba(0,0,250,1) 100%)",
                  width: `${expWidth}px`,
                  height: "12px"
                }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SelectedPlayerInfo;
