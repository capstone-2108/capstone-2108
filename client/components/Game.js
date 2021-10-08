import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import Game from "../../src/index";
import { logout } from "../store";

export const GameView = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    window.game = new Game();
  });
  return (
    <div id="phaser">
      <h1>Hello From the Game Component</h1>
      <Link to="/">
        <button onClick={() => dispatch(logout())}>Logout</button>
      </Link>
    </div>
  );
};
