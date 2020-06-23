import Server from 'socket.io';
import Store from 'electron-store';
import data from './data.json';

const store = new Store();
const io = new Server(8900, { serveClient: false });
io.origins('*:*');
let visitors = store.get('visitors');

function visitorsChange() {
  store.set('visitors', visitors);
  io.emit('push-visitor-list', visitors);
}
if (!visitors) {
  visitors = data.leaders.reduce((memo, { name }) => {
    memo[name] = [];
    return memo;
  }, {});
  visitorsChange();
}

io.on('connect', (socket) => {
  socket.on('pull-leader-list', () => {
    socket.emit('push-leader-list', data.leaders);
  });

  socket.on('pull-visitor-list', () => {
    socket.emit('push-visitor-list', visitors);
  });

  socket.on('add-visitor-by-name', ({ name, payload }) => {
    visitors[name].unshift(payload);
    visitorsChange();
  });

  socket.on('delete-visitor-by-name', ({ name, index }) => {
    visitors[name] = [
      ...visitors[name].slice(0, index),
      ...visitors[name].slice(index + 1),
    ];
    visitorsChange();
  });
});
