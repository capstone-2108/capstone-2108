export class EventEmitter {
  constructor() {
    this.events = {};
  }

  subscribe(eventName, callback) {
    if (this.events[eventName]) { this.events[eventName].push(callback); }
    else { this.events[eventName] = [callback]; }

    //returns a function which unsubscribes from this event
    return () => {
      if (this.events[eventName]) {
        const indexOfCallback = this.events[eventName].indexOf(callback);
        if (indexOfCallback !== -1) {
          this.events[eventName].splice(indexOfCallback, 1);
        }
      }
    };
  }

  emit(eventName, data) {
    if (this.events[eventName]) {
      let i = 0; let len = this.events[eventName].length;
      for (; i < len; i++) {this.events[eventName][i](data);}
    }
  }

  unsubscribeAll() {
    this.events = {};
  }
}

export const eventEmitter = new EventEmitter();
