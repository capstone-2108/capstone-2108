import axios from "axios";
import {eventEmitter} from '../../src/event/EventEmitter';

/*************************
 * Action Types          *
 ************************/
export const UPDATE_HEALTH = "UPDATE_HEALTH";
export const SET_PLAYER_CHARACTER = "SET_PLAYER_CHARACTER";


/*************************
 * Action Creators       *
 ************************/
//--Plain actions--
export const setPlayerCharacter = (character) => {
  return {
    type: SET_PLAYER_CHARACTER,
    character
  }
}

export const updateHealth = (health) => {
  return {
    type: UPDATE_HEALTH,
    health
  }
}

//--Thunks--
export const fetchCharacterData = () => {
  return async (dispatch, getState) => {
    let state = getState();
    try {
      const response = await axios.get(`/api/game/character/${state.player.selectedCharacterId}`);
      dispatch(setPlayerCharacter(response.data));
      state = getState();
      eventEmitter.dispatch('playerLoad', state.player);
    }
    catch(err) {
      console.log(err)
    }
  }
}

// CALL TO BACKEND TO CREATE PLAYER CHARACTER
export const createPlayerCharacter = (name, character) => {
  return async (dispatch) => {
    let state = getState()
    try {
      const response = await axios.post("/api/game/character", {name, character})
      console.log('RESPONSE', response.data)
      // Set player character id on state
      // Something like this? state.player.selectedCharacterId = response.data
    } catch(err) {
      console.log(err)
    }
  }
}



/*************************
 * Reducer       *
 ************************/
const initialState = {
  //is this the template id or a unique id for the player character?
  selectedCharacterId: 1,
  name: '',
  //?
  health: 100,
  // Are we using both health and totalHealth?
  totalHealth: 500,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case SET_PLAYER_CHARACTER:
      return {...state, ...action.character};
    case UPDATE_HEALTH:
      return {...state, health: action.health}
    default:
      return state;
  }
};
