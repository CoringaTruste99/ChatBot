async function cargarChats() {
  const cont = document.getElementById('historial');
  cont.innerHTML = '<p class="text-gray-400">Cargando chats...</p>';

  try {
    const res = await fetch('/api/chats');
    if (!res.ok) throw new Error('Error al obtener chats');

    const chats = await res.json();

    if (chats.length === 0) {
      cont.innerHTML = '<p class="text-gray-400">No hay chats guardados aún.</p>';
      return;
    }

    cont.innerHTML = ''; // Limpiar contenedor

    for (const chat of chats) {
      const fecha = new Date(chat.createdAt);
      const fechaStr = fecha.toLocaleString('es-MX', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      // Obtener el primer mensaje de usuario para preview
      let preview = 'Chat nuevo';
      try {
        const resMsg = await fetch(`/api/chats/${chat._id}/messages`);
        if (resMsg.ok) {
          const messages = await resMsg.json();
          const firstUserMsg = messages.find(m => m.from === 'user');
          if (firstUserMsg && firstUserMsg.text) {
            preview = firstUserMsg.text;
          }
        }
      } catch {
        // ignore error, preview queda como "Chat nuevo"
      }

      // Crear el botón
      const chatBtn = document.createElement('button');
      chatBtn.className = `
        w-full text-left bg-gray-700 hover:bg-gray-600 p-3 rounded shadow text-gray-200
        flex flex-col
      `;

      // Estructura con preview y fecha separados
      chatBtn.innerHTML = `
        <p class="text-sm text-gray-300 truncate" title="${preview}">${preview}</p>
        <p class="text-xs text-gray-400 mt-1">${fechaStr}</p>
      `;

      chatBtn.addEventListener('click', () => {
        window.location.href = `/?chatId=${chat._id}`;
      });

      cont.appendChild(chatBtn);
    }
  } catch (error) {
    cont.innerHTML = `<p class="text-red-500">Error cargando chats: ${error.message}</p>`;
  }
}

window.addEventListener('DOMContentLoaded', cargarChats);
