/* eslint-disable react/prop-types */
import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter, Route, Switch } from "react-router-dom";
import { Login, Signup } from "./components/AuthForm";
import { whoAmI } from "./store";
import { GameView } from "./components/GameView";
import Chat from './components/Chat';
import SelectCharacter from './components/SelectCharacter';
import EditCharacter from './components/EditCharacter';
import HowToPlay from "./components/HowToPlay";

/**
 * COMPONENT
 */
class Routes extends Component {
  componentDidMount() {
    this.props.loadInitialData();
  }

  render() {
    const { isLoggedIn, isAdmin } = this.props;

    return (
      <Switch>
        <Route exact path="/" component={Login} />
        <Route exact path="/signup" component={Signup} />
        <Route exact path="/game" component={GameView} />
        <Route exact path="/select" component={SelectCharacter} />
        <Route path="/select/:id" component={EditCharacter} />
        <Route exact path="/howToPlay" component={HowToPlay} />
      </Switch>
    );
  }
}

/**
 * CONTAINER
 */
const mapState = (state) => {
  return {
    isLoggedIn: state.auth.loggedIn
  };
};

const mapDispatch = (dispatch) => {
  return {
    async loadInitialData() {
      await dispatch(whoAmI());
    }
  };
};

// The `withRouter` wrapper makes sure that updates are not blocked
// when the url changes
export default withRouter(connect(mapState, mapDispatch)(Routes));
