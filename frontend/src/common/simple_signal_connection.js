import _ from 'lodash';


export default class SimpleSignalConnection {
  constructor() {
    this.callbacks = {};
  }

  on(e, callback) {
    this.callbacks[e] = this.callbacks[e] || [];
    this.callbacks[e].push(callback);
  }

  emit(e) {
    let params = _.rest(arguments);
    _.each(this.callbacks[e], (func) => {
      func.apply(this, params);
    }, this);
  }

  getSessionid() {
    return 'sessionId'
  }

  disconnect() {/* do nothing */}
}
