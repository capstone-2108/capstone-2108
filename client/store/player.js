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
      //Not sure this should be running yet
      eventEmitter.dispatch('playerLoad', state.player);
    }
    catch(err) {
      console.log(err)
    }
  }
}

// CREATE CHARACTER IN PLAYERCHARACTER TABLE
// export const createPlayerCharacter




/*************************
 * Reducer       *
 ************************/
const initialState = {
  //is this the template id or a unique id for the player character?
  selectedCharacterId: 1,
  name: '',
  //?
  health: 100
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
