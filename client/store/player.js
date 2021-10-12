import axios from "axios";
import { eventEmitter } from "../../src/event/EventEmitter";

/*************************
 * Action Types          *
 ************************/
export const UPDATE_HEALTH = "UPDATE_HEALTH";
export const SET_PLAYER_CHARACTER = "SET_PLAYER_CHARACTER";
export const SET_NEARBY_PLAYER_CHARACTERS = "SET_NEARBY_PLAYER_CHARACTERS";

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
//@todo: once character select is done, remove the default value
export const fetchCharacterData = (characterId = 1) => {
  return async (dispatch, getState) => {
    let state = getState();
    try {
      const response = await axios.get(`/api/game/character/${characterId}`);
      dispatch(setPlayerCharacter(response.data));
      state = getState();
      eventEmitter.emit("playerLoad", state.player);
      return response.data.characterId;
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
};

export default (state = initialState, action) => {
  switch (action.type) {
    case SET_PLAYER_CHARACTER:
      return { ...state, ...action.character };
    case SET_NEARBY_PLAYER_CHARACTERS:
      return { ...state, nearbyPlayers: action.characters };
    case UPDATE_HEALTH:
      return { ...state, health: action.health };
    default:
      return state;
  }
};
