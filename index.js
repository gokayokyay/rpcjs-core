import './cycle';

export const PROCEDURES = {
  CREATE_ELEMENT: 'CREATE_ELEMENT',
  REMOVE_ELEMENT: 'REMOVE_ELEMENT'
};

export class RPCEngineBase {
  constructor() {
    this.socket = null;
    this.elements = [];
    this.pendingResponses = []; 
  }

  static createEventObject(elementKey, event) {
    return {
      elementKey,
      event: RPCEngineBase.serializeEvent(event)
    }
  }
  static serializeEvent(e) {
    const obj = {};
    for (let k in e) {
      obj[k] = e[k];
    }
    return JSON.decycle(obj);
  }

  _sendPendingResponses() {
    while(this.pendingResponses.length) {
      this._respond(this.pendingResponses.pop());      
    }
  }

  _respond(value) {
    try {
      const obj = JSON.stringify(value);
      this.socket.send(obj);
    } catch (err) {
      console.error(err);
    }
  }

  respond(value) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this._respond(value);
    } else {
      this.pendingResponses.push(value);
    }
  }

  initialize(socket) {
    this.socket = socket;
    if (this.socket.readyState !== WebSocket.OPEN) {
      this.socket.onopen = () => {
        this._sendPendingResponses();
      };
    }
    this.socket.onmessage = msg => this.handleSocketMessages(msg);
  }

  handleProcedure(procedure) {
    throw new Error('NOT IMPLEMENTED');
  }

  handleSocketMessages(message) {
    const { data: procedure } = message;
    console.log(procedure);
    this.handleProcedure(JSON.parse(procedure));
  }

  respondEvent(event) {
    this.respond(event);
  }

}
