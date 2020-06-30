import Client from 'socket.io-client';
import config from './config';

const client = new Client(`http://${config.server}:${config.port}`);

client.on('connect', () => {
  // eslint-disable-next-line no-console
  console.log('connect');
});

export default client;
