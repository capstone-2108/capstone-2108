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

let store;
if(process.env.NODE_ENV === "development") {
  const middleware = composeWithDevTools(
    applyMiddleware(thunkMiddleware, createLogger({collapsed: true}))
  );
  store = createStore(reducer, middleware);
}
else {
  store = createStore(reducer, applyMiddleware(thunkMiddleware));
}


export default store;
export * from "./auth";
