import React from "react";
import { useSelector } from "react-redux";

const SelectedPlayerInfo = () => {
  const selectedUnit = useSelector((state) => state.player.selectedUnit);
  console.log("selectedUnit", selectedUnit);
  const ratio = selectedUnit.health / selectedUnit.totalHealth;
  const healthWidth = 150 * ratio;
  // const expWidth = (selectedUnit.experience / 100) * 150;

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

  // if (selectedUnit.gold) {
  return (
    <div className="OtherCharacterInfo">
      <div className="selectedPlayerName">
        <h3 id="otherPlayerName">{selectedUnit.name}</h3>
      </div>
      <div className="selected-details">
        <div className="selectedBar">
          <div className="otherPlayerImg">
            <img src="goldcircle.png" width="50px" height="50px" />
            <img src={selectedUnit.portrait} className="otherPortrait"/>
          </div>
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
        </div>
      </div>
    </div>
  );
  // } else {
  //   return (
  //     <div className="monster">
  //       <div className="monster-info">
  //         <div className="player">
  //           <h3 id="otherPlayerName">{selectedUnit.name}</h3>
  //         </div>
  //
  //         <div
  //           style={{
  //             backgroundColor: "black",
  //             width: "150px",
  //             height: "12px"
  //           }}>
  //           <div style={healthStyle}>
  //             <div className="monsterHp">
  //               <h4 className="whiteText">HP</h4>
  //             </div>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }
};
export default SelectedPlayerInfo;
