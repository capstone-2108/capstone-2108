import React, { useEffect } from 'react'
import Game from '../../src/index'

export const GameView = () => {
  useEffect(() => {
    window.game = new Game();
  })
  return (
    <div id="phaser">
      <h1>Hello From the Game Component</h1>
    </div>
  )
}

