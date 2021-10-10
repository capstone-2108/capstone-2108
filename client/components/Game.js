import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Game } from "../../src/Game";
import { logout } from "../store";

export const GameView = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    window.game = new Game();
  }, []);

  return (
    <div>
      <div className="top">
        <div id="phaser"></div>
        <div className="inventory">
          <h3>inventory</h3>
          <div id="logoutButton">
            <Link to="/">
              <button onClick={() => dispatch(logout())}>Logout</button>
            </Link>
          </div>
        </div>
      </div>

      <div className="worldChat">world chat</div>
    </div>
  );
};
