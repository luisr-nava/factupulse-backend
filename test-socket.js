const { io } = require('socket.io-client');

const socket = io('http://localhost:3000', {
  transports: ['websocket'],
});

socket.on('connect', () => {
  console.log('✅ Conectado al servidor con ID:', socket.id);
});

socket.on('connect_error', (err) => {
  console.error('❌ Error de conexión:', err.message);
});
