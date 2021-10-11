export class EventEmitter {
  constructor() {
    this.events = {};
  }

  addEventListener(eventName, callback) {
    console.log("addingEvent", eventName);
    if (this.events[eventName]) {
      this.events[eventName].push(callback);
    } else {
      this.events[eventName] = [callback];
    }
  }

  dispatch(eventName, data) {
    if (this.events[eventName]) {
      console.log("dispatchingEvent", eventName);
      let i = 0;
      let len = this.events[eventName].length;
      for (; i < len; i++) {
        this.events[eventName][i](data);
      }
    }
  }
}

export const eventEmitter = new EventEmitter();
