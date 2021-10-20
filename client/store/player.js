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
export const SET_SELECTED_PLAYER = "SET_SELECTED_PLAYER";
export const REMOTE_PLAYER_CHANGED_SCENE = "REMOTE_PLAYER_CHANGED_SCENE";
export const SET_SELECTED_MONSTER = "SET_SELECTED_MONSTER";

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

export const setSelectedPlayer = (character) => {
  return {
    type: SET_SELECTED_PLAYER,
    character
  };
};

export const setSelectedMonster = (monster) => {
  return {
    type: SET_SELECTED_MONSTER,
    monster
  };
};

export const remotePlayerChangedScenes = (player) => {
  return {
    type: REMOTE_PLAYER_CHANGED_SCENE,
    player
  };
};

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

export const fetchRemoteCharacterData = (id) => {
  return async (dispatch, getState) => {
    try {
      const response = await axios.get(`/api/game/character/${id}`);
      dispatch(setSelectedPlayer(response.data));
      const state = getState();
      return state.player;
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

export const clearPlayerState = () => {
  return {
    type: CLEAR_PLAYER_STATE
  };
};

export const fetchSeletedMonster = (id) => {
  return async (dispatch, getState) => {
    try {
      const response = await axios.get(`/api/game/monster/${id}`);
      dispatch(setSelectedMonster(response.data));
      let state = getState();
      return state.player.selectedMonster;
    } catch (error) {
      console.log(err);
    }
  };
};

/*************************
 * Reducer       *
 ************************/
const initialState = {
  userId: null,
  characterId: null,
  name: "",
  nearbyPlayers: [],
  nearbyMonsters: [],
  selectedPlayer: {},
  selectedMonster: {},
  xPos: 0,
  yPos: 0,
  health: 100,
  totalHealth: 500,
  experience: 40,
  totalExp: 120,
  gold: 0,
  sceneId: 1,
  sceneName: "StarterTown",
  level: 1,
  portrait: "/assets/characters/character-protrait-emotes-2/Fox_frame.png"
};

const clearState = {
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
      return { ...state, ...action.character };
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
    case SET_SELECTED_PLAYER:
      return { ...state, selectedPlayer: action.character };
    case SET_SELECTED_MONSTER:
      return { ...state, selectedPlayer: action.monster };
    case REMOTE_PLAYER_CHANGED_SCENE: {
      const nearbyPlayers = state.nearbyPlayers.filter(
        (nearbyPlayer) => nearbyPlayer.characterId !== action.player.characterId
      );
      //add or update this player
      if (action.player.sceneId === state.sceneId) {
        nearbyPlayers.push(action.player);
        return {
          ...state, nearbyPlayers: nearbyPlayers
        }
      } else { //remove this player
        return {
          ...state,
          nearbyPlayers
        }
      }
    }
    default:
      return state;
  }
};
