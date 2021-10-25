const { Server } = require("socket.io");
const server = require("../app");
const { requireSocketToken } = require("./socket-middleware");
const io = new Server(server);
const { PlayerCharacter, Location, Npc, User} = require("../db");
const { transformToPayload } = require("../db/models/PlayerCharacter");
const chalk = require("chalk");

const worldChat = io.of("/worldChat");
const gameSync = io.of("/gameSync");
const heartBeats = {};

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
    socket.on("playerPositionChanged", (data) => {
      //let other clients know this this player has moved
      // console.log("playerPositionChanged", data);
      socket.broadcast.emit("remotePlayerPositionChanged", data);
    });

    socket.on("playerChangedScenes", async (data) => {
      try {
        const playerCharacter = await PlayerCharacter.getCharacter(data.characterId);
        await playerCharacter.location.update({
          sceneId: data.sceneId,
          xPos: data.xPos,
          yPos: data.yPos
        });
        await playerCharacter.reload();
        const characterPayload = transformToPayload(playerCharacter);
        //let the world know that this player has moved to a new scene
        socket.broadcast.emit("remotePlayerChangedScenes", characterPayload);
      } catch (err) {
        console.log(err);
      }
    });

    //we'll receive heartbeats from players to let us know they are still logged in
    //heartbeats are sent out when a player logs in, and on request from the server
    socket.on("heartbeat", async ({ userId, characterName, characterId }) => {
      console.log("Received heart beat for " + characterName);
      heartBeats[characterId] = {
        userId,
        characterName,
        lastSeen: Date.now()
      };
    });

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
      console.log(chalk.red(`Monster ${data.monsterId} has been hit`));
      console.log(data);
      try {
        const [updatedCols, metadata] = await Npc.applyDamage(data.monsterId, data.damage);
        socket.broadcast.emit("monsterTookDamage", updatedCols[0]);
        socket.emit("monsterTookDamage", {...updatedCols[0], local:true});
      } catch (err) {
        console.log(err);
      }
    });

    socket.on("playerTookDamage", async (data) => {
      console.log(chalk.red(`Player ${data.characterId} has been hit`));
      console.log(data);
      try {
        const [updatedCols, metadata] = await PlayerCharacter.applyDamage(data.characterId, data.damage);
        socket.broadcast.emit("playerTookDamage", updatedCols[0]);
        socket.emit("playerTookDamage", {...updatedCols[0], local: true});
      } catch (err) {
        console.log(err);
      }
    });
  });
}

function initHeartbeat() {
  setInterval(async () => {
    try {
      for (const [characterId, heartBeatInfo] of Object.entries(heartBeats)) {
        const { characterName, lastSeen, userId } = heartBeatInfo;
        if (Date.now() - lastSeen > 12000) {
          await User.logout(userId);
          console.log(`Logging out ${characterName} due to inactivity`);
          worldChat.emit("newMessage", {
            channel: "world",
            message: {
              name: "WORLD",
              message: characterName + " has been logged out by the server!"
            }
          });
          //@todo if a monster is aggroed on a person who's been logged out, we should cancel that aggro
          console.log('characterId', characterId);
          const aggroedMonsters = await PlayerCharacter.resetAggroOnPlayerCharacter(characterId);
          console.log('aggroedMonsters', aggroedMonsters);
          aggroedMonsters.forEach(monster => gameSync.emit('monsterControlResetAggro', monster.id));
          gameSync.emit("remotePlayerLogout", characterId);
          delete heartBeats[characterId];
        }
      }
      console.log("Sending out heart beat check");
      gameSync.emit("heartbeatCheck");
    } catch (err) {
      console.log(err);
    }
  }, 5000);

  setInterval( async () => {
    //log out anyone who is logged in but not registered with a heartbeat
    //@todo: implement this
  })
}

module.exports = {
  initSocketServer,
  gameSync,
  worldChat,
  initHeartbeat
};
