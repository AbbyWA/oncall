import Server from 'socket.io';
import Store from 'electron-store';
import data from './data.json';

const io = new Server(8900, { serveClient: false });
io.origins('*:*');

io.on('connect', (socket) => {
  console.log('connect!!!');

  socket.on('pull-leader-list', () => {
    console.log('pull-leader-list');
    socket.emit('push-leader-list', data.leaders);
    io.emit('push-leader-list', data.leaders);
  });
});

const store = new Store();
console.log('unicorn', store.get('unicorn'));

store.set('unicorn', '🦄');
store.delete('unicorn');
