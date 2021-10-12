import React from "react";
import { fetchCharacterData, updateHealth } from "../store/player";

const Inventory = () => {
  return (
    <div>
      <div>
        <h3>health:</h3>
        <div className="rectangle" />
      </div>
    </div>
  );
};

export default Inventory;
