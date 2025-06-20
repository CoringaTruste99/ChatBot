const socket = io();
let currentChatId = localStorage.getItem('chatId');

socket.on('connect', () => {
  console.log('✅ Socket conectado con id:', socket.id);

  if (currentChatId) {
    socket.emit('loadChat', currentChatId);
  } else {
    socket.emit('newChat');
  }
});

socket.on('chatCreated', (chat) => {
  currentChatId = chat._id;
  localStorage.setItem('chatId', currentChatId); // Para futuras visitas
  chatContainer.innerHTML = '';
});

socket.on('previousMessages', (messages) => {
  messages.forEach(mostrarMensaje);
});

const chatContainer = document.getElementById('chat');
const formContainer = document.getElementById('form');
const inputMessage = document.getElementById('inputMessage');

// 🟡 Obtener chatId desde la URL
function getChatIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('chatId');
}

// 🔄 Mostrar mensajes en la UI
function mostrarMensaje(m) {
  const div = document.createElement('div');
  div.className = m.from === 'user' ? 'flex justify-end my-2' : 'flex justify-start my-2';
  div.innerHTML = `
    <span class="${
      m.from === 'user' ? 'bg-gray-800 text-white' : 'bg-gray-300 text-gray-800'
    } px-4 py-2 rounded-lg max-w-xs break-words shadow-md">
      ${m.text}
    </span>
  `;
  chatContainer.appendChild(div);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// 📦 Cuando se recibe un nuevo chat (nuevo o cargado)
socket.on('chatCreated', (chat) => {
  currentChatId = chat._id;
  chatContainer.innerHTML = '';
});

// 📜 Cargar historial de mensajes
socket.on('previousMessages', (messages) => {
  console.log('📜 Historial recibido:', messages.length, 'mensajes');
  messages.forEach(mostrarMensaje);
});

// 💬 Mensaje nuevo recibido
socket.on('message', (message) => {
  console.log('📥 Mensaje recibido:', message);
  mostrarMensaje(message);
});

// 📤 Enviar mensaje nuevo
formContainer.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = inputMessage.value.trim();
  if (!text || !currentChatId) return;

  socket.emit('newMessage', { from: 'user', text, chatId: currentChatId });
  inputMessage.value = '';
});

// 🔄 Al iniciar, cargar chat por ID o crear uno nuevo
const existingChatId = getChatIdFromURL();
if (existingChatId) {
  socket.emit('loadChat', existingChatId);
} else {
  socket.emit('newChat');
}
