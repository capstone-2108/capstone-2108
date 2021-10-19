import axios from "axios";

/*************************
 * Action Types          *
 ************************/
export const SET_SELECTED_MONSTER = "SET_SELECTED_MONSTER";

/*************************
 * Action Creators       *
 ************************/

export const setSelectedMonster = (monster) => {
  return {
    type: SET_SELECTED_MONSTER,
    monster
  }
}

//--THUNKS--//

export const fetchSeletedMonster = (id) => {
  return async (dispatch, getState) => {
    try {
      const response = await axios.get(`/api/game/monster/${id}`)
      dispatch(setSelectedMonster(response.data))
      const state = getState()
      return state.monster
    } catch (error) {
      console.log(err)
    }
  }
}


/*************************
 * Reducer       *
 ************************/

const initialState = {
  id: 1,
  health: 200,
}

export default (state = initialState, action) => {
  switch (action.type) {
    case SET_SELECTED_MONSTER:
      return { ...state, ...action.monster }
    default:
      return state
  }
}
