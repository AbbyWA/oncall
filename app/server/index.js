/* eslint-disable no-underscore-dangle */
import Server from 'socket.io';
import Store from 'electron-store';
import data from './data.json';
import config from '../config';
import { VisitorStatus, LeaderStatus } from '../constants';

const store = new Store();
const io = new Server(config.port, { serveClient: false });
io.origins('*:*');

class Domain {
  constructor(key, broadcastMessage, init, clearExpiredData = (x) => x) {
    this._data = store.get(key);
    this.key = key;
    this.broadcastMessage = broadcastMessage;
    this.clearExpiredData = clearExpiredData;

    if (!this._data) {
      this._data = init();
    }
  }

  handleChange() {
    store.set(this.key, this._data);
    io.emit(this.broadcastMessage, this._data);
  }

  clear() {
    this._data = this.clearExpiredData(this._data);
  }

  get data() {
    return this._data;
  }

  set data(value) {
    // this.clear();
    this._data = value;

    console.log(this.key, this._data);
    this.handleChange();
  }
}

const leaders = new Domain('leaders', 'push-leader-list', () => {
  return data.leaders.map((item) => ({
    ...item,
    status: LeaderStatus.OFFLINE,
  }));
});

const visitors = new Domain(
  'visitors',
  'push-visitor-list',
  () => {
    return leaders.data.reduce((memo, { name }) => {
      memo[name] = [];
      return memo;
    }, {});
  },
  (value) => {
    const today = new Date();
    today.setHours(0);
    today.setMinutes(0);
    today.setSeconds(0);
    Object.keys(value).forEach((key) => {
      value[key] = value[key].filter((item) => item.time > today.getTime());
    });

    return value;
  }
);
const messages = new Domain('messages', 'push-messages', () => []);

io.on('connect', (socket) => {
  socket.on('change-leader-status', ({ index, newStatus }) => {
    if (newStatus !== LeaderStatus.ONLINE) {
      visitors.data = {
        ...visitors.data,
        [leaders.data[index].name]: [],
      };
    }
    leaders.data = [
      ...leaders.data.slice(0, index),
      {
        ...leaders.data[index],
        status: newStatus,
      },
      ...leaders.data.slice(index + 1),
    ];
  });

  socket.on('pull-leader-list', () => {
    socket.emit('push-leader-list', leaders.data);
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

  function changeVisitorStatus(name, index, newStatus) {
    visitors.data = {
      ...visitors.data,
      [name]: [
        ...visitors.data[name].slice(0, index),
        {
          ...visitors.data[name][index],
          status: newStatus,
        },
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

  socket.on('add-message', ({ type, payload }) => {
    if (type === 'resolve') {
      // 修改visitor状态
      changeVisitorStatus(
        payload.name,
        payload.visitorIndex,
        VisitorStatus.RESOLVE
      );
    }

    if (type === 'reject') {
      changeVisitorStatus(
        payload.name,
        payload.visitorIndex,
        VisitorStatus.REJECT
      );
    }

    messages.data = [
      {
        type,
        payload,
        time: new Date().getTime(),
      },
      ...messages.data,
    ];
  });

  socket.on('remove-message', (index) => {
    const message = messages.data[index];
    if (message.type === 'resolve' || message.type === 'reject') {
      const { name } = message.payload;
      visitors.data = {
        ...visitors.data,
        [name]: visitors.data[name].filter(
          (item) => item.name !== message.payload.visitorName
        ),
      };
    }
    messages.data = [
      ...messages.data.slice(0, index),
      ...messages.data.slice(index + 1),
    ];
  });
});
