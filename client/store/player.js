import axios from "axios";
import { eventEmitter } from "../../src/event/EventEmitter";

/*************************
 * Action Types          *
 ************************/
export const UPDATE_HEALTH = "UPDATE_HEALTH";
export const SET_PLAYER_CHARACTER = "SET_PLAYER_CHARACTER";
export const SET_NEARBY_PLAYER_CHARACTERS = "SET_NEARBY_PLAYER_CHARACTERS";
export const CLEAR_PLAYER_STATE = "CLEAR_PLAYER_STATE";

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

//--Plain actions--
export const setNearbyPlayers = (characters) => {
  return {
    type: SET_NEARBY_PLAYER_CHARACTERS,
    characters
  };
};

export const updateHealth = (health) => {
  return {
    type: UPDATE_HEALTH,
    health
  };
};

//--Thunks--
export const fetchCharacterData = () => {
  return async (dispatch, getState) => {
    let state = getState();
    console.log("STATE", state);
    try {
      //if the player has already been set on redux
      // AKA this is a new user who just signed up
      if (state.player.characterId !== null) {
        eventEmitter.emit("playerLoad", state.player);
        return state.player.characterId;
      } else {
        //go find this user's player character and then set it on state
        //then load
        const response = await axios.get(`/api/game/character`);
        dispatch(setPlayerCharacter(response.data));
        state = getState();
        //This actually starts the load of the player character into Phaser
        eventEmitter.emit("playerLoad", state.player);
        return response.data.characterId;
      }
    } catch (err) {
      console.log(err);
    }
  };
};

/**
 * fetches players in the same scene as this player
 * @returns {(function(*, *): Promise<void>)|*}
 */
export const fetchNearbyPlayers = (characterId) => {
  return async (dispatch, getState) => {
    let state = getState();
    try {
      const response = await axios.get(`/api/game/character/${characterId}/nearby`);
      dispatch(setNearbyPlayers(response.data));
      state = getState();
      eventEmitter.emit("nearbyPlayerLoad", response.data);
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

export const clearPlayerState = () => {
  return {
    type: CLEAR_PLAYER_STATE
  };
};

/*************************
 * Reducer       *
 ************************/
const initialState = {
  userId: null,
  characterId: null,
  name: "",
  health: 100,
  nearbyPlayers: [],
  xPos: 0,
  yPos: 0,
  totalHealth: 500,
  gold: 0,
  //Change to sceneName
  scene: "village"
};

const clearState = {
  userId: null,
  characterId: null,
  name: "",
  health: null,
  nearbyPlayers: [],
  xPos: 0,
  yPos: 0,
  totalHealth: null,
  gold: 0,
  //Change to sceneName
  scene: null
};

export default (state = initialState, action) => {
  switch (action.type) {
    case SET_PLAYER_CHARACTER:
      return { ...state, ...action.character };
    case SET_NEARBY_PLAYER_CHARACTERS:
      return { ...state, nearbyPlayers: action.characters };
    case UPDATE_HEALTH:
      return { ...state, health: action.health };
    case CLEAR_PLAYER_STATE:
      return clearState;
    default:
      return state;
  }
};
