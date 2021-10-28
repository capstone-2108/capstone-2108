const { Server } = require("socket.io");
const server = require("../app");
const { requireSocketToken } = require("./socket-middleware");
const io = new Server(server);
const { PlayerCharacter, Location, Npc, User } = require("../db");
const { transformToPayload } = require("../db/models/PlayerCharacter");
const chalk = require("chalk");

const worldChat = io.of("/worldChat");
const gameSync = io.of("/gameSync");

function initSocketServer() {
  initWorldChat();
  initGameSync();
}

function initWorldChat() {
  worldChat.use(requireSocketToken);
  worldChat.on("connection", async (socket) => {
    try {
      socket.on("sendMessage", (message) => {
        socket.broadcast.emit("newMessage", message);
      });

      socket.on("connect_error", (error) => {
        console.log("worldChat namespace connect error!");
        console.log(error);
      });
      if (socket.user) {
        console.log(`${socket.user.firstName} has connected to world chat!`);
      }
    } catch (err) {
      console.log(err);
    }
  });
}

function initGameSync() {
  //todo: should probably setup a channel for each scene
  gameSync.use(requireSocketToken);
  gameSync.on("connection", async (socket) => {
    socket.on("connect_error", (error) => {
      console.log("gameSync namespace connect error!");
      console.log(error);
    });

    //when players move we receive this event, we should emit an event to all clients to let
    //them know that this player has moved
    socket.on('localPlayerPositionChanged', async (data) => {
      //let other clients know this this player has moved
      if(!socket.user.loggedIn) {
        await socket.user.flagLoggedIn();
      }
      socket.broadcast.emit('remotePlayerPositionChanged', data);
    });

    socket.on("playerChangedScenes", async (data) => {
      try {
        const playerCharacter = await PlayerCharacter.getCharacter(data.characterId);
        await playerCharacter.location.update({
          sceneId: data.sceneId,
          xPos: data.xPos,
          yPos: data.yPos,
          spawnX: data.xPos,
          spawnY: data.yPos,
        });
        await playerCharacter.reload();
        const characterPayload = transformToPayload(playerCharacter);
        //let the world know that this player has moved to a new scene
        socket.broadcast.emit("remotePlayerChangedScenes", characterPayload);
      } catch (err) {
        console.log(err);
      }
    });

    // we'll receive heartbeats from players to let us know they are still logged in
    // heartbeats are sent out when a player logs in, and on request from the server
    socket.on(
      "heartbeat",
      //{ userId, characterName, characterId, characterXPos, characterYPos }
      async (data) => {
        console.log("Received heart beat for ", data.characterName);
        try {
          await socket.user.flagLoggedIn();
          const player = await PlayerCharacter.getCharacter(data.characterId);
          await player.location.update({ xPos: data.characterXPos, yPos: data.characterYPos });
        }
        catch(err) {
          console.log(err);
        }


      }
    );

    //a client is letting us know that a monster is requesting to aggro a player
    socket.on("monsterAggroedPlayer", async ({ monsterId, playerCharacterId }) => {
      let msg = chalk.red(
        `Monster ${monsterId} requesting to aggro player ${playerCharacterId} -- `
      );
      try {
        const canAggro = await Npc.setAggroOn(monsterId, playerCharacterId);
        if (canAggro) {
          //send a message to the requester that the monster can aggro them
          msg += chalk.redBright("AGGRO TIME!");
          socket.emit("monsterCanAggroPlayer", { monsterId, canAggro: true });
        } else {
          socket.emit("monsterCanAggroPlayer", { monsterId, canAggro: false });
          msg += chalk.cyan("Nope");
        }
        console.log(msg);
      } catch (err) {
        console.log(err);
      }
    });

    socket.on("monsterControlDirections", (data) => {
      socket.broadcast.emit("monsterFollowDirections", data);
    });

    //a controlling monster is requesting us to broadcast a message to controlled monsters to reset aggro
    socket.on("monsterRequestResetAggro", async (monsterId) => {
      console.log(chalk.yellow(`Monster ${monsterId} aggro reset`));
      try {
        await Npc.resetAggro(monsterId);
        socket.broadcast.emit("monsterControlResetAggro", monsterId);
      } catch (err) {
        console.log(err);
      }
    });

    //broadcast that a player hit a monster
    socket.on("monsterTookDamage", async (data) => {
      // console.log(chalk.red(`Monster ${data.monsterId} has been hit`));
      console.log('monster damage', data);
      try {
        const monster = await Npc.applyDamage(data.monsterId, data.damage);
        if (!monster.isAlive) {
          const player = await PlayerCharacter.findByPk(data.playerCharacterId);
          await player.update({ experience: (player.experience += 10) });
          socket.emit("playerExpIncrease", player.experience);
        }

        socket.broadcast.emit("monsterTookDamage", {
          monster,
          local: false
        });
        socket.emit("monsterTookDamage", {
          monster,
          local: true
        });
      } catch (err) {
        console.log(err);
      }
    });

    socket.on("playerTookDamage", async (data) => {
      // console.log(chalk.red(`Player ${data.characterId} has been hit`));
      console.log(data);
      try {
        const playerCharacter = await PlayerCharacter.applyDamage(data.characterId, data.damage);
        socket.broadcast.emit("playerTookDamage", {
          playerCharacter,
          local: false
        });
        socket.emit("playerTookDamage", {
          playerCharacter,
          local: true
        });
      } catch (err) {
        console.log(err);
      }
    });

    socket.on("updateMonsterDBPosition", async (data) => {
      console.log('updating monster position', data);
      try {
        const monster = await Npc.getMonster(data.monsterId);
        await monster.location.update({xPos: data.xPos, yPos: data.yPos});
      }
      catch(err) {
        console.log(err);
      }
    });

    socket.on('healthIntervalIncrease', async (characterId) => {
      try {
        const player = await PlayerCharacter.findByPk(characterId)
        if (player.health + 10 > player.totalHealth) {
          await player.update({ health: player.totalHealth })
        } else {
          await player.update({ health: player.health += 10 })
        }
        socket.emit("healthIntervalIncrease", player.health)
      } catch (error) {
        console.log(error)
      }
    })
  });
}


function initHeartbeat() {
  setInterval(async () => {
    try {
      const players = await PlayerCharacter.getStaleLoggedInUsers();
      let i = 0;
      let len = players.length;
      for(i; i < len; i++) {
        const player = players[i];
        console.log(chalk.red(`Logging out ${player.name} due to inactivity`));
        await User.logout(player.user.id);
        worldChat.emit('newMessage', {
            channel: 'world',
            message: {
              name: 'WORLD',
              message: player.name + ' has been logged out by the server!'
            }
        });
        const [rowsUpdated, monsters] = await PlayerCharacter.resetAggroOnPlayerCharacter(player.id);
        monsters.forEach(monster => gameSync.emit('monsterControlResetAggro', monster.id));
        gameSync.emit('remotePlayerLogout', player.id);
      }
    }
    catch (err) {
      console.log(err);
    }
  }, 15000);
  setInterval(() => {
    console.log(chalk.bgMagenta('Sending out heart beat check'));
    gameSync.emit('heartbeatCheck');
  }, 10000);
}

//brings dead monsters back to life
function initLazarusPit() {
  setInterval(async () => {
    try {
      const deadMonsters = await Npc.resurrectDeadMonsters();
      if (deadMonsters.length) {
        console.log(chalk.bgBlue("Reviving Monsters"));
        const revivedMonsters = deadMonsters.map((monster) => ({
          id: monster.id,
          health: monster.health,
          totalHealth: monster.totalHealth,
          xPos: monster.location.spawnX,
          yPos: monster.location.spawnY
        }));
        console.log(revivedMonsters);
        gameSync.emit("reviveMonsters", revivedMonsters);
      }
    } catch (err) {
      console.log(chalk.bgRed("ERROR REVIVING MONSTERS"));
      console.log(err);
    }
  }, 5000);
}

module.exports = {
  initSocketServer,
  gameSync,
  worldChat,
  initHeartbeat,
  initLazarusPit,
};
