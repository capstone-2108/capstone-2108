export default class StateMachine {
  constructor(context, name = "default", debug = false) {
    this.context = context;
    this.name = name; //the name of this state machine
    this.currentState = null;
    this.states = new Map();
    this.isSwitchingState = false;
    this.stateQueue = [];
    this.previousState = null;
    this.currentStateStage = "enter";
    this.debug = debug;
    this.stateLock = false;
  }

  get previousStateName() {
    if (!this.previousState) {
      return "";
    }

    return this.previousState.name;
  }

  get currentStateName() {
    if (!this.currentState) {
      return "";
    }
    return this.currentState.name;
  }

  isCurrentState(name) {
    return !this.currentState ? false : this.currentState.name === name;
  }

  stateStartsWidth(partialName) {
    return this.currentState.name.startsWith(partialName);
  }

  /**
   *
   * @param {string} name //the name of the state
   * @param {{}} config
   * @returns {StateMachine}
   */
  addState(name, config) {
    this.states.set(name, {
      name,
      onEnter: config.onEnter ? config.onEnter.bind(this.context) : undefined,
      onUpdate: config.onUpdate ? config.onUpdate.bind(this.context) : undefined,
      onExit: config.onExit ? config.onExit.bind(this.context) : undefined,
    });
    return this;
  }

  setState(name, data) {
    //state doesn't exist
    if(this.stateLock) { return;}
    if (!this.states.has(name)) {
      console.log(`Changing to unknown state: ${name}`);
      return;
    }
    //we're already in this state
    if (this.isCurrentState(name)) {
      return;
    }

    // state is in the process of switching, so queue up this state to play after
    if (this.isSwitchingState) {
      this.stateQueue.push(name);
      return;
    }
    this.isSwitchingState = true;
    if (this.debug) {
      console.log(
        `State Machine ${this.name} is switching from ${
          this.currentState ? this.currentState.name : "none"
        } to ${name}`
      );
    }
    //if we have a current state, and it has an onExit, then lets call that before moving on to the new state
    if (this.currentState && this.currentState.onExit) {
      this.currentState.onExit();
      this.currentStateStage = "exit";
    }

    this.previousState = this.currentState; //save the previous state in case we need it for something
    this.currentState = this.states.get(name); //set the new state -- could be undefined if this state hasn't been defined

    //call the onEnter of the newState if it exists
    if (this.currentState.onEnter) {
      this.currentState.onEnter();
      this.currentStateStage = "enter";
    }
    this.isSwitchingState = false;
  }

  update(time, delta) {
    if (this.stateQueue.length > 0) {
      this.setState(this.stateQueue.shift());
      return;
    }
    if (this.currentState && this.currentState.onUpdate) {
      this.currentState.onUpdate(time, delta);
      this.currentStateStage = "update";
    }
  }
}
