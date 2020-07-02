/* eslint-disable no-underscore-dangle */
import Server from 'socket.io';
import Store from 'electron-store';
import data from './data.json';
import config from '../config';
import { VisitorStatus } from '../constants';

const store = new Store();
const io = new Server(config.port, { serveClient: false });
io.origins('*:*');

class Domain {
  constructor(key, broadcastMessage, init) {
    this._data = store.get(key);
    this.key = key;
    this.broadcastMessage = broadcastMessage;

    if (!this._data) {
      this._data = init();
    }
  }

  handleChange() {
    store.set(this.key, this._data);
    io.emit(this.broadcastMessage, this._data);
  }

  get data() {
    return this._data;
  }

  set data(value) {
    this._data = value;

    console.log(this.key, this._data);
    this.handleChange();
  }
}

const visitors = new Domain('visitors', 'push-visitor-list', () => {
  return data.leaders.reduce((memo, { name }) => {
    memo[name] = [];
    return memo;
  }, {});
});
const messages = new Domain('messages', 'push-messages', () => []);

io.on('connect', (socket) => {
  socket.on('pull-leader-list', () => {
    socket.emit('push-leader-list', data.leaders);
  });

  // visiters
  socket.on('pull-visitor-list', () => {
    socket.emit('push-visitor-list', visitors.data);
  });

  socket.on('add-visitor-by-name', ({ name, payload }) => {
    visitors.data = {
      ...visitors.data,
      [name]: [payload, ...visitors.data[name]],
    };
  });

  function deleteVisitorByName(name, index) {
    visitors.data = {
      ...visitors.data,
      [name]: [
        ...visitors.data[name].slice(0, index),
        ...visitors.data[name].slice(index + 1),
      ],
    };
  }

  socket.on('delete-visitor-by-name', ({ name, index }) => {
    deleteVisitorByName(name, index);
  });

  // messages
  socket.on('pull-messages', () => {
    socket.emit('push-messages', messages.data);
  });

  socket.on('add-message', ({ type, payload: { name, visitorIndex } }) => {
    let message = '';
    if (type === 'call') {
      message = `${name} 呼叫秘书。`;
    }

    if (type === 'resolve') {
      visitors.data = {
        ...visitors.data,
        [name]: [
          ...visitors.data[name].slice(0, visitorIndex),
          {
            ...visitors.data[name][visitorIndex],
            status: VisitorStatus.RESOLVE,
          },
          ...visitors.data[name].slice(visitorIndex + 1),
        ],
      };
      message = `${name} 需要接见 ${visitors.data[name][visitorIndex].name}。`;
      // deleteVisitorByName(name, visitorIndex);
    }

    if (type === 'reject') {
      visitors.data = {
        ...visitors.data,
        [name]: [
          ...visitors.data[name].slice(0, visitorIndex),
          {
            ...visitors.data[name][visitorIndex],
            status: VisitorStatus.REJECT,
          },
          ...visitors.data[name].slice(visitorIndex + 1),
        ],
      };
      message = `${name} 拒绝接见 ${visitors.data[name][visitorIndex].name}。`;
      // deleteVisitorByName(name, visitorIndex);
    }

    if (!message) return;
    message = `[${new Date().toLocaleString()}] ${message}`;
    messages.data = [message, ...messages.data];
  });

  socket.on('remove-message', (index) => {
    messages.data = [
      ...messages.data.slice(0, index),
      ...messages.data.slice(index + 1),
    ];
  });
});
