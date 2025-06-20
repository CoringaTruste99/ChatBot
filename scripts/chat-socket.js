const socket = io();
const chatContainer = document.getElementById('chat');
const formContainer = document.getElementById('form');
const inputMessage = document.getElementById('inputMessage');

let currentChatId = null;

function getChatIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('chatId');
}

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

socket.on('chatCreated', (chat) => {
  console.log('chatCreated event:', chat);
  currentChatId = chat._id || chat.id;
  console.log('currentChatId set to:', currentChatId);
  localStorage.setItem('chatId', currentChatId);
  chatContainer.innerHTML = '';
});

socket.on('previousMessages', (messages) => {
  chatContainer.innerHTML = '';
  console.log('previousMessages event:', messages);
  messages.forEach(mostrarMensaje);
});

socket.on('message', (message) => {
  if (message.chatId && message.chatId !== currentChatId) return; // Solo mensajes del chat activo
  console.log('message event:', message);
  mostrarMensaje(message);
});

formContainer.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = inputMessage.value.trim();
  console.log('Intentando enviar mensaje:', text, 'con chatId:', currentChatId);
  
  if (!text) {
    console.warn('No hay texto para enviar');
    return;
  }
  
  if (!currentChatId) {
    console.warn('No hay chat seleccionado o cargado');
    return;
  }
  
  socket.emit('newMessage', { from: 'user', text, chatId: currentChatId });
  inputMessage.value = '';
  inputMessage.focus();
});

socket.on('connect', () => {
  console.log('Socket conectado con id:', socket.id);
  const urlChatId = getChatIdFromURL();
  const storedChatId = localStorage.getItem('chatId');

  if (urlChatId) {
    console.log('Cargando chat desde URL:', urlChatId);
    currentChatId = urlChatId;
    socket.emit('loadChat', urlChatId);
  } else if (storedChatId) {
    console.log('Cargando chat desde localStorage:', storedChatId);
    currentChatId = storedChatId;
    socket.emit('loadChat', storedChatId);
  } else {
    console.log('Creando nuevo chat...');
    socket.emit('newChat', { title: 'Chat nuevo' });
  }
});
