import React from "react";
import { fetchCharacterData, updateHealth } from "../store/player";
import Healthbar from "./Healthbar";
import Gold from "./Gold";
const Inventory = () => {
  return (
    <div>
      <h3>hi</h3>
      <Healthbar />
      <Gold />
    </div>
  );
};

export default Inventory;
