import React from "react";
import { useSelector } from "react-redux";

const Gold = () => {
  const player = useSelector((state) => state.player);
  const gold = player.gold;
  return (
    <div className="gold">
      <h3>{gold}</h3>
      <img
        src="https://i.pinimg.com/originals/f9/da/09/f9da09a345b352d9f6cd4e59f66197c4.png"
        width="15px"
        height="15px"
      />
    </div>
  );
};

export default Gold;
