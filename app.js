const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const conectarDB = require('./scripts/db.js');
const Chat = require('./models/chat.js');
const Message = require('./models/message.js');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 3000;

// Conexión a MongoDB
conectarDB();

// Middlewares
app.use(express.json());
app.use(express.static('static'));
app.use('/scripts', express.static(__dirname + '/scripts'));
app.use('/templates', express.static(__dirname + '/templates'));

// Rutas HTML
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/templates/index.html');
});

app.get('/historial', (req, res) => {
  res.sendFile(__dirname + '/templates/historial.html');
});

// API para obtener todos los chats
app.get('/api/chats', async (req, res) => {
  try {
    const chats = await Chat.find().sort({ createdAt: -1 });
    res.json(chats);
  } catch (error) {
    console.error('Error al obtener chats:', error);
    res.status(500).json({ error: 'Error al obtener chats' });
  }
});

// API para obtener mensajes de un chat específico
app.get('/api/chats/:chatId/messages', async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId).populate('messages');
    if (!chat) return res.status(404).json({ error: 'Chat no encontrado' });
    res.json(chat.messages);
  } catch (error) {
    console.error('Error al obtener mensajes:', error);
    res.status(500).json({ error: 'Error al obtener mensajes' });
  }
});

// Socket.IO
io.on('connection', (socket) => {
  socket.currentChatId = null;
  let chatStarted = false;

  // Crear un nuevo chat
  async function createNewChat(title = 'Chat nuevo') {
    const newChat = new Chat({ title });
    await newChat.save();

    socket.currentChatId = newChat._id.toString();
    chatStarted = false;

    socket.emit('chatCreated', newChat);
    socket.emit('previousMessages', []);
  }

  // Cargar un chat existente (desde historial)
  socket.on('loadChat', async (chatId) => {
    try {
      const chat = await Chat.findById(chatId);
      if (!chat) return;

      socket.currentChatId = chatId;
      chatStarted = true;

      socket.emit('chatCreated', chat);
      const messages = await Message.find({ chatId }).sort({ createdAt: 1 });
      socket.emit('previousMessages', messages);
    } catch (error) {
      console.error('❌ Error cargando chat:', error);
    }
  });

  // Crear nuevo chat manualmente desde frontend
  socket.on('newChat', async (data) => {
    const title = data?.title || 'Chat nuevo';
    await createNewChat(title);
  });

  // Enviar nuevo mensaje
  socket.on('newMessage', async (data) => {
    try {
      const { from, text } = data;
      const chatId = data.chatId || socket.currentChatId;

      if (!from || !text || !chatId) return;

      // Registrar primer mensaje
      if (!chatStarted) {
        await Chat.findByIdAndUpdate(chatId, { startedAt: new Date() });
        chatStarted = true;
      }

      const userMessage = new Message({ chatId, from, text });
      await userMessage.save();

      await Chat.findByIdAndUpdate(chatId, {
        $push: { messages: userMessage._id }
      });

      socket.emit('message', userMessage);
      socket.broadcast.emit('message', userMessage);

      if (from === 'user') {
        const botMessage = new Message({ chatId, from: 'bot', text: 'Hola 👋' });
        await botMessage.save();

        await Chat.findByIdAndUpdate(chatId, {
          $push: { messages: botMessage._id }
        });

        io.emit('message', botMessage);
      }
    } catch (error) {
      console.error('❌ Error enviando mensaje:', error);
      socket.emit('message', {
        from: 'bot',
        text: 'Ups, algo salió mal. Intenta más tarde.',
      });
    }
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
