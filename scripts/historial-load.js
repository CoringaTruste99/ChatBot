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

    chats.forEach(chat => {
      const fecha = new Date(chat.createdAt);
      const fechaStr = fecha.toLocaleString('es-MX', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const chatBtn = document.createElement('button');
      chatBtn.textContent = `${chat.title} - ${fechaStr}`;
      chatBtn.className = 'w-full text-left bg-gray-700 hover:bg-gray-600 p-3 rounded shadow text-gray-200';

      chatBtn.addEventListener('click', () => {
        // En lugar de usar localStorage, pasamos el chatId en la URL
        window.location.href = `/?chatId=${chat._id}`;
      });

      cont.appendChild(chatBtn);
    });
  } catch (error) {
    cont.innerHTML = `<p class="text-red-500">Error cargando chats: ${error.message}</p>`;
  }
}

window.addEventListener('DOMContentLoaded', cargarChats);
