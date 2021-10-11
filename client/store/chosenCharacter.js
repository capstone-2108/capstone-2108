import axios from "axios";

/*************************
 * Action Types          *
 ************************/
export const SET_CHOSEN_CHARACTER = "SET_CHOSEN_CHARACTER";

/*************************
 * Action Creators       *
 ************************/
// ACTION CREATOR TO SET CHOSEN TEMPLATE CHARACTER
export const setChosenCharacter = (chosenCharacter) => {
console.log('in setchosen character')
  return {
    type: SET_CHOSEN_CHARACTER,
    chosenCharacter
  };
};

/*************************
 * Reducer       *
 ************************/
export default function templateCharactersReducer(state = {}, action) {
  switch (action.type) {
    case SET_CHOSEN_CHARACTER:
      return action.chosenCharacter;
    default:
      return state;
  }
}
