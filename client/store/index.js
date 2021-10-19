import { createStore, combineReducers, applyMiddleware } from "redux";
import { createLogger } from "redux-logger";
import thunkMiddleware from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension";
import auth from "./auth";
import chat from './chat';
import player from './player';
import templateCharacters from "./templateCharacters";
import chosenCharacter from "./chosenCharacter";
// import monster from "./monster";


const reducer = combineReducers({
  auth,
  chat,
  player,
  templateCharacters,
  chosenCharacter,
  // monster
});
const middleware = composeWithDevTools(
  applyMiddleware(thunkMiddleware, createLogger({ collapsed: true }))
);
const store = createStore(reducer, middleware);

export default store;
export * from "./auth";
