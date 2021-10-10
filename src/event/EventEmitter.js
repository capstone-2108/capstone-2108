export class EventEmitter {
  constructor() {
    this.events = {};
  }
  addEventListener(eventName, callback) {
    if(this.events[eventName]) {
      this.events[eventName].push(callback);
    }
    else {
      this.events[eventName] = [callback];
    }
  }

  dispatch(eventName, data) {
    let i = 0;
    let len = this.events[eventName];
    for(;i< this.events[eventName]; i++) {
      (this.events[eventName][i])(data);
    }
  }
}

export const eventEmitter = new EventEmitter();

