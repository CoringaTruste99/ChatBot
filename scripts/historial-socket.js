// scripts/historial-socket.js
const socket = io();
const historial = document.getElementById('historial');

socket.on('previousMessages', (messages) => {
  messages.forEach(msg => {
    const div = document.createElement('div');
    div.className = `flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`;
    div.innerHTML = `
      <span class="${msg.from === 'user' ? 'bg-gray-700' : 'bg-gray-600'} px-4 py-2 rounded-lg text-sm max-w-sm break-words text-gray-100">
        <strong>${msg.from === 'user' ? 'Tú' : 'Bot'}:</strong> ${msg.text}
      </span>`;
    historial.appendChild(div);
  });
});
