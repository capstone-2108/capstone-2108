import axios from "axios";
import {clearPlayerState, logoutCharacters} from './player';
/***********************
 * STATES        *
 ***********************/
export const LOGGED_IN = true;
export const NOT_LOGGED_IN = false;

/***********************
 * ACTION TYPES        *
 ***********************/
const LOGIN = "LOGIN";
export const LOGOUT = "LOGOUT";
const SET_INFO = "GET_INFO";
const LOGIN_SUCCESS = "LOGIN_SUCCESS";

/***********************
 * ACTION CREATORS     *
 ***********************/
const setLoggedIn = (firstName, lastName, email) => ({ type: LOGIN, firstName, lastName, email });
const setLoggedOut = () => ({ type: LOGOUT, firstName: "Guest" });
const setInfo = ({ firstName, lastName, email }) => ({
  type: SET_INFO,
  payload: { firstName, lastName, email }
});
export const loginSuccess = (bool) => ({ type: LOGIN_SUCCESS, bool });

/**
 * THUNK CREATORS
 */
export const authenticate = (method, credentials) => {
  return async (dispatch, getState) => {
    try {
      const response = await axios.post(`/auth/${method}`, credentials);
      if (response.data.loggedIn) {
        dispatch(loginSuccess(true));
        dispatch(setLoggedIn(response.data.firstName, response.data.lastName, response.data.email));
        return true;
      } else {
        console.log("Failed to authenticate");
        dispatch(loginSuccess(false));
        //@todo failed to authenticate
        return false;
      }
    } catch (err) {
      // alert("Email/Password Incorrect")
      dispatch(loginSuccess(false));
      console.log(err);
    } finally {
    }
  };
};

export const logout = () => {
  return async (dispatch, getState) => {
    try {
      const response = await axios.get("/auth/logout");
      if (!response.data.loggedIn) {
        dispatch(setLoggedOut());
        dispatch(loginSuccess(false));
        dispatch(clearPlayerState());

      } else {
        console.log("Failed to logout");
        //@todo failed to logout
      }
    } catch (err) {
      console.log(err);
    }
  };
};

export const whoAmI = () => {
  return async (dispatch, getState) => {
    try {
      const response = await axios.get("/auth/whoAmI");
      if (response.data.loggedIn) {
        // @todo cleanup
        dispatch(setLoggedIn(response.data.firstName, response.data.lastName, response.data.email));
      } else {
        console.log("Failed to authenticate");
        //@todo failed to authenticate
      }
    } catch (err) {
      console.log(err);
    } finally {
    }
  };
};

export const getInfo = () => {
  return async (dispatch) => {
    try {
      const { data } = await axios.get("/auth/info");
      dispatch(setInfo(data.user));
    } catch (err) {
      console.log(err);
    }
  };
};

/***********************
 * REDUCER             *
 ***********************/
const initialState = {
  firstName: "Guest",
  lastName: "",
  email: "",
  loggedIn: NOT_LOGGED_IN,
  loginSuccess: true,
  error: false
};

export default (state = initialState, action) => {
  switch (action.type) {
    case LOGIN:
      return {
        ...state,
        loggedIn: LOGGED_IN,
        firstName: action.firstName,
        lastName: action.lastName,
        email: action.email
      };
    case LOGOUT:
      return { ...state, loggedIn: NOT_LOGGED_IN, firstName: "Guest", lastName: "", email: "" };
    case SET_INFO:
      return { ...state, ...action.payload };
    case LOGIN_SUCCESS:
      return { ...state, loginSuccess: action.bool };
    default:
      return state;
  }
};
