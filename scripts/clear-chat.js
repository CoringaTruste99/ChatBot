document.addEventListener('DOMContentLoaded', () => {
  const clearBtn = document.getElementById('clearChat');
  const chat = document.getElementById('chat');

  if (clearBtn && chat) {
    clearBtn.addEventListener('click', () => {
      // 1. Limpiar el contenido visual del chat
      chat.innerHTML = '';

      // 2. Borrar el chatId almacenado en localStorage
      localStorage.removeItem('chatId');

      // 3. Recargar para iniciar un nuevo chat limpio
      location.reload();
    });
  }
});
