import Client from 'socket.io-client';

// const client = new Client('http://localhost:8900');
 const client = new Client('http://192.168.16.8:8900');

client.on('connect', () => {
  // eslint-disable-next-line no-console
  console.log('connect');
});

export default client;
