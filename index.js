const { Server } = require('socket.io');
const http = require('http');

// Criando instancia do servidor
const server = http.createServer();

// Criando instancia do socket
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000', 
    methods: ['GET', 'POST']
  },
  transports: ['websocket', 'polling'] 
});

const users = {};


io.on('connection', (socket) => {
  console.log('Novo usuário conectado:', socket.id);

  // Registra o nome do usuário
  socket.on('user_joined', (username) => {
    users[socket.id] = username; 
    io.emit('user_list', Object.values(users)); 
    io.emit('message', {
      user: 'Sistema',
      text: `${username} entrou no chat`
    });
  });

  // Envia a mensagem
  socket.on('send_message', (data) => {
    io.emit('message', {
      user: users[socket.id],
      text: data.text
    });
  });

  // Registra a saída do usuário
  socket.on('disconnect', () => {
    const username = users[socket.id];
    if (username) {
      delete users[socket.id];
      io.emit('user_list', Object.values(users)); 
      io.emit('message', {
        user: 'Sistema',
        text: `${username} saiu do chat`
      });
    }
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Servidor Socket.IO rodando na porta ${PORT}`);
}).on('error', (err) => {
  console.error('Erro no servidor:', err);
});
