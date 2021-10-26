import axios from "axios";

/*************************
 * Action Types          *
 ************************/
export const UPDATE_HEALTH = "UPDATE_HEALTH";
export const SET_PLAYER_CHARACTER = "SET_PLAYER_CHARACTER";
export const SET_NEARBY_PLAYER_CHARACTERS = "SET_NEARBY_PLAYER_CHARACTERS";
export const SET_NEARBY_MONSTERS = "SET_NEARBY_MONSTERS";
export const CLEAR_PLAYER_STATE = "CLEAR_PLAYER_STATE";
export const UPDATE_PLAYER_CHARACTER = "UPDATE_PLAYER_CHARACTER";
export const REMOTE_PLAYER_CHANGED_SCENE = "REMOTE_PLAYER_CHANGED_SCENE";
export const SET_SELECTED_UNIT = "SET_SELECTED_UNIT";
export const MONSTER_TOOK_DAMAGE = "MONSTER_TOOK_DAMAGE";
export const PLAYER_TOOK_DAMAGE = "PLAYER_TOOK_DAMAGE";
export const REVIVE_MONSTERS = "REVIVE_MONSTERS";
export const UPDATE_LOCAL_PLAYER_POSITION = "UPDATE_LOCAL_PLAYER_POSITION";
export const REVIVE_PLAYER = "REVIVE_PLAYER";
export const PLAYER_EXP_INCREASE = "PLAYER_EXP_INCREASE";
export const SET_NEW_PLAYER_FLAG = "SET_NEW_PLAYER_FLAG";

/*************************
 * Action Creators       *
 ************************/
//--Plain actions--
export const setPlayerCharacter = (character) => {
  return {
    type: SET_PLAYER_CHARACTER,
    character
  };
};

export const updatePlayerCharacter = (updates) => {
  return {
    type: UPDATE_PLAYER_CHARACTER,
    updates
  };
};

export const setNearbyPlayers = (characters) => {
  return {
    type: SET_NEARBY_PLAYER_CHARACTERS,
    characters
  };
};

export const setNearbyMonsters = (monsters) => {
  return {
    type: SET_NEARBY_MONSTERS,
    monsters
  };
};

export const updateHealth = (health) => {
  return {
    type: UPDATE_HEALTH,
    health
  };
};

export const remotePlayerChangedScenes = (player) => {
  return {
    type: REMOTE_PLAYER_CHANGED_SCENE,
    player
  };
};

export const clearPlayerState = () => {
  return {
    type: CLEAR_PLAYER_STATE
  };
};

export const monsterTookDamage = (data) => {
  return {
    type: MONSTER_TOOK_DAMAGE,
    ...data
  };
};

export const playerTookDamage = (data) => {
  return {
    type: PLAYER_TOOK_DAMAGE,
    ...data
  };
};

export const updateLocalPlayerPosition = ({ endX: xPos, endY: yPos }) => {
  return {
    type: UPDATE_LOCAL_PLAYER_POSITION,
    data: { xPos, yPos }
  };
};

export const revivePlayer = (health) => {
  return {
    type: REVIVE_PLAYER,
    health
  };
};

export const setSelectedUnit = (unitType, id) => {
  return {
    type: SET_SELECTED_UNIT,
    unitType,
    id
  };
};

export const reviveMonsters = (monsters) => {
  return {
    type: REVIVE_MONSTERS,
    monsters
  };
};

export const playerExpIncrease = (experience) => {
  return {
    type: PLAYER_EXP_INCREASE,
    experience
  };
}

export const setNewPlayerFlag = (flag) => {
  return {
    type: SET_NEW_PLAYER_FLAG,
    flag
  };
}

//--Thunks--
export const fetchCharacterData = () => {
  return async (dispatch, getState) => {
    try {
      let state = getState();
      //if the player data is already in redux
      if (state.player.characterId !== null) {
        return state.player;
      } else {
        //fetch the player data
        const response = await axios.get(`/api/game/character`);
        dispatch(setPlayerCharacter(response.data));
        const state = getState();
        return state.player;
      }
    } catch (err) {
      console.log(err);
    }
  };
};

export const fetchNearbyPlayers = (characterId) => {
  return async (dispatch, getState) => {
    let state = getState();
    try {
      const response = await axios.get(`/api/game/character/${characterId}/nearby`);
      dispatch(setNearbyPlayers(response.data));
      state = getState();
      return state.player.nearbyPlayers;
    } catch (err) {
      console.log(err);
    }
  };
};

export const fetchNearbyMonsters = (sceneId) => {
  return async (dispatch, getState) => {
    let state = getState();
    try {
      const response = await axios.get(`/api/game/monster/scene/${sceneId}`);
      dispatch(setNearbyMonsters(response.data));
      state = getState();
      return state.player.nearbyMonsters;
    } catch (err) {
      console.log(err);
    }
  };
};

// CALL TO BACKEND TO CREATE PLAYER CHARACTER
export const createPlayerCharacter = (name, character, history) => {
  return async (dispatch) => {
    try {
      const response = await axios.post("/api/game/character", { name, character });
      dispatch(setPlayerCharacter(response.data));
      dispatch(setNewPlayerFlag(true));
      history.push("/game");
    } catch (err) {
      console.log(err);
    }
  };
};

export const logoutCharacters = (characterId) => {
  return async (dispatch) => {
    try {
      const response = await axios.put(`/api/game/character/${characterId}/logout`);
    } catch (err) {
      console.log(err);
    }
  };
};

export const heartbeat = (socket) => {
  return async (dispatch, getState) => {
    const state = getState();
    socket.emit("heartbeat", {
      userId: state.player.userId,
      characterName: state.player.name,
      characterId: state.player.characterId
      //pass in xPos, and yPos
    });
    return true;
  };
};

/*************************
 * Reducer       *
 ************************/
const initialState = {
  newUser: false,
  userId: null,
  characterId: null,
  name: "",
  nearbyPlayers: [],
  nearbyMonsters: [],
  selectedUnit: {},
  xPos: 0,
  yPos: 0,
  health: 100,
  totalHealth: 500,
  experience: 40,
  expToNextLevel: 1000,
  gold: 0,
  sceneId: 1,
  sceneName: "StarterTown",
  level: 1,
  portrait: ""
};

const clearState = {
  newUser: false,
  userId: null,
  characterId: null,
  name: "",
  nearbyPlayers: [],
  nearbyMonsters: [],
  selectedPlayer: {},
  xPos: 0,
  yPos: 0,
  health: 0,
  totalHealth: 0,
  experience: 40,
  totalExp: 0,
  gold: 0,
  sceneId: 1,
  sceneName: "StarterTown",
  level: 1,
  portrait: undefined
};

export default (state = initialState, action) => {
  switch (action.type) {
    case SET_PLAYER_CHARACTER:
      return { ...state, ...action.character};
    case SET_NEARBY_PLAYER_CHARACTERS:
      return { ...state, nearbyPlayers: action.characters };
    case SET_NEARBY_MONSTERS:
      return { ...state, nearbyMonsters: action.monsters };
    case UPDATE_HEALTH:
      return { ...state, health: action.health };
    case CLEAR_PLAYER_STATE:
      return clearState;
    case UPDATE_PLAYER_CHARACTER:
      return { ...state, ...action.updates };
    case UPDATE_LOCAL_PLAYER_POSITION: {
      return { ...state, xPos: action.data.xPos, yPos: action.data.yPos };
    }
    case SET_SELECTED_UNIT: {
      let unit;
      if (action.unitType === "monster") {
        unit = state.nearbyMonsters.filter((monster) => monster.monsterId === action.id);
        if (unit.length) {
          unit[0].unitType = "monster";
          return {
            ...state,
            selectedUnit: unit[0]
          };
        }
      } else {
        unit = state.nearbyPlayers.filter((player) => player.characterId === action.id);
        if (unit.length) {
          unit[0].unitType = "player";
          return {
            ...state,
            selectedUnit: unit[0]
          };
        }
      }
      return state;
    }
    case MONSTER_TOOK_DAMAGE: {
      let selectedUnit = state.selectedUnit;
      const { local, monster } = action;
      if (selectedUnit.unitType === "monster" && selectedUnit.monsterId === monster.id) {
        selectedUnit = { ...selectedUnit, ...monster };
      }
      let nearbyMonsters = state.nearbyMonsters.map((nearbyMonster) =>
        nearbyMonster.monsterId === monster.id
          ? Object.assign(nearbyMonster, monster)
          : nearbyMonster
      );
      return {
        ...state,
        selectedUnit,
        nearbyMonsters
      };
    }
    case PLAYER_TOOK_DAMAGE: {
      const { local, playerCharacter } = action;
      if (local) {
        return { ...state, ...playerCharacter };
      }
      let selectedUnit = state.selectedUnit;
      if (selectedUnit.unitType === "player" && selectedUnit.characterId === action.data.id) {
        selectedUnit = { ...selectedUnit, ...playerCharacter };
      }
      let nearbyPlayers = state.nearbyPlayers.map((player) =>
        player.characterId === playerCharacter.id ? Object.assign(player, playerCharacter) : player
      );
      return {
        ...state,
        selectedUnit,
        nearbyPlayers
      };
    }
    case REMOTE_PLAYER_CHANGED_SCENE: {
      const nearbyPlayers = state.nearbyPlayers.filter(
        (nearbyPlayer) => nearbyPlayer.characterId !== action.player.characterId
      );
      //add or update this player
      if (action.player.sceneId === state.sceneId) {
        nearbyPlayers.push(action.player);
        return {
          ...state,
          nearbyPlayers: nearbyPlayers
        };
      } else {
        //remove this player
        return {
          ...state,
          nearbyPlayers
        };
      }
    }
    case REVIVE_MONSTERS: {
      let selectedUnit = state.selectedUnit;
      const { monsters } = action;
      console.log(action, typeof monsters);
      if (selectedUnit.unitType === "monster") {
        for (let i = 0; i < monsters.length; i++) {
          if (selectedUnit.monsterId === monsters[i].id) {
            selectedUnit = { ...selectedUnit, ...monsters[i] };
          }
        }
      }
      let monsterMap = new Map();
      for (let i = 0; i < monsters.length; i++) {
        monsterMap.set(monsters[i].id, monsters[i]);
      }
      let nearbyMonsters = state.nearbyMonsters.map((nearbyMonster) =>
        monsterMap.has(nearbyMonster.monsterId)
          ? Object.assign(nearbyMonster, monsterMap.get(nearbyMonster.monsterId))
          : nearbyMonster
      );
      return {
        ...state,
        selectedUnit,
        nearbyMonsters
      };
    }
    case REVIVE_PLAYER:
      return {
        ...state,
        health: action.health
      };
    case PLAYER_EXP_INCREASE: {
      return {...state, experience: action.experience}
      }
    case SET_NEW_PLAYER_FLAG: {
      console.log('set new player flag', action);
      return {...state, newUser: action.flag}
    }
    default:
      return state;
  }
};
