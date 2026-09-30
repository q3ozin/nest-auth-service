import { authAndSetupSocket, clearTokensAndRedirect } from './WSservice.js';

// ==========================================
// ۱. دریافت داده‌های WebSocket و ایجاد عناصر DOM
// ==========================================

function renderConversations(response, currentUsername) {
  const container = document.getElementById('chat-list');
  if (!container) return;

  const conversations = Array.isArray(response) ? response : (response?.data || response?.conversations || []);
  container.innerHTML = '';

  if (conversations.length === 0) {
    container.innerHTML = '<div class="empty-state">هیچ گفتگویی یافت نشد.</div>';
    return;
  }

  const fragment = document.createDocumentFragment();

  conversations.forEach((chat) => {
    // تشخص نام طرف مقابل (اگر username1 خودمان بودیم، username2 را نشان بده و برعکس)
    const contactName = (chat.username1 === currentUsername) 
      ? chat.username2 
      : chat.username1;

    // استخراج زمان از فیلد createdAt
    const time = chat.createdAt 
      ? new Date(chat.createdAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }) 
      : '';

    const itemDiv = document.createElement('div');
    itemDiv.className = 'chat-item';
    itemDiv.dataset.chatId = chat.id;

    itemDiv.innerHTML = `
      <span class="chat-name">${contactName || 'کاربر'}</span>
      <span class="chat-time">${time}</span>
    `;

    itemDiv.addEventListener('click', () => {
      if (chat.id) window.location.href = `/chat.html?id=${chat.id}`;
    });

    fragment.appendChild(itemDiv);
  });

  container.appendChild(fragment);
}

// ==========================================
// ۲. مدیریت شنود و ارسال درخواست WebSocket
// ==========================================

function setupSocketListeners(socket, currentUsername) {
  if (!socket) return;

  const fetchConversations = () => {
    socket.emit('getConversations');
  };

  if (socket.connected) {
    fetchConversations();
  }

  socket.on('connect', fetchConversations);

  socket.on('getConversations', (data) => {
    renderConversations(data, currentUsername);
  });

  socket.on('connect_error', (error) => {
    if (error.message.includes('Unauthorized') || error.message.includes('jwt')) {
      clearTokensAndRedirect('auth.html');
    }
  });
}

// ==========================================
// ۳. راه‌اندازی برنامه
// ==========================================

async function initHome() {
  const result = await authAndSetupSocket(
    'http://localhost/api/profile',
    'http://localhost/api/auth/refresh',
    'auth.html',
    'http://localhost'
  );

  if (!result) return;

  const { socket, userData } = result;

  // نام کاربر جاری جهت تشخیص طرف مقابل
  const currentUsername = userData?.username || userData?.name;

  setupSocketListeners(socket, currentUsername);
}

initHome();