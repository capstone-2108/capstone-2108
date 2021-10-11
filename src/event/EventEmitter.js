export class EventEmitter {
  constructor() {
    this.events = {};
  }

  subscribe(eventName, callback) {
    console.log("addingEvent", eventName);
    if (this.events[eventName]) { this.events[eventName].push(callback); }
    else { this.events[eventName] = [callback]; }

    //returns a function which unsubscribes from this event
    return function unsubscribe() {
      if (this.events[eventName]) {
        const indexOfCallback = this.events[eventName].indexOf(callback);
        if (indexOfCallback !== -1) {
          this.events[eventName] = this.events[eventName].splice(indexOfCallback, 1);
        }
      }
    };
  }

  emit(eventName, data) {
    if (this.events[eventName]) {
      console.log("dispatchingEvent", eventName);
      let i = 0; let len = this.events[eventName].length;
      for (; i < len; i++) {this.events[eventName][i](data);}
    }
  }
}

export const eventEmitter = new EventEmitter();
