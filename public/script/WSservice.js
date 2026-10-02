import { io } from 'https://cdn.socket.io/4.7.5/socket.io.esm.min.js';

let socket = null;

// ==========================================
// ۱. مدیریت توکن‌ها در LocalStorage
// ==========================================

export function getTokens() {
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');

  const isValid = (t) => t && t !== 'undefined' && t !== 'null' && t.trim() !== '';

  return {
    accessToken: isValid(accessToken) ? accessToken.trim() : null,
    refreshToken: isValid(refreshToken) ? refreshToken.trim() : null,
  };
}

export function saveTokens(accessToken, refreshToken) {
  if (accessToken && accessToken !== 'undefined') {
    localStorage.setItem('accessToken', accessToken);
  }
  if (refreshToken && refreshToken !== 'undefined') {
    localStorage.setItem('refreshToken', refreshToken);
  }
}

export function clearTokensAndRedirect(loginPageUrl = 'auth.html') {
  console.warn('Clearing tokens and redirecting...');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');

  if (socket) {
    socket.disconnect();
    socket = null;
  }

  if (loginPageUrl && !window.location.pathname.endsWith(loginPageUrl)) {
    window.location.href = loginPageUrl;
  }
}

// ==========================================
// ۲. درخواست Refresh Token
// ==========================================

export async function refreshAccessToken(
  apiRefreshUrl = 'http://localhost/api/auth/refresh',
  loginPageUrl = 'auth.html'
) {
  const { refreshToken } = getTokens();

  if (!refreshToken) {
    console.warn('No refreshToken found in localStorage');
    clearTokensAndRedirect(loginPageUrl);
    return null;
  }

  try {
    const response = await fetch(apiRefreshUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: refreshToken }),
    });

    if (!response.ok) {
      throw new Error(`REFRESH_FAILED_STATUS_${response.status}`);
    }

    const result = await response.json();
    const newAccessToken = result?.data?.accessToken || result?.accessToken;

    if (newAccessToken) {
      saveTokens(newAccessToken, refreshToken);
      return newAccessToken;
    }

    throw new Error('INVALID_RESPONSE_FORMAT');

  } catch (error) {
    console.error('Refresh Token Request Failed:', error.message);
    clearTokensAndRedirect(loginPageUrl);
    return null;
  }
}

// ==========================================
// ۳. احراز هویت و دریافت Profile
// ==========================================

export async function checkAuth(
  apiProfileUrl = 'http://localhost/api/profile',
  apiRefreshUrl = 'http://localhost/api/auth/refresh',
  loginPageUrl = 'auth.html',
  redirectOnFailure = true
) {
  let { accessToken } = getTokens();

  if (!accessToken) {
    if (redirectOnFailure) {
      clearTokensAndRedirect(loginPageUrl);
    }
    return null;
  }

  try {
    let response = await fetch(apiProfileUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    // در صورت انقضای توکن
    if (response.status === 401) {
      console.warn('Access token expired. Attempting refresh...');

      const newAccessToken = await refreshAccessToken(apiRefreshUrl, loginPageUrl);

      if (!newAccessToken) return null;

      // ارسال مجدد درخواست
      response = await fetch(apiProfileUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${newAccessToken}`,
          'Content-Type': 'application/json'
        }
      });
    }

    if (!response.ok) {
      throw new Error(`Auth check failed with status ${response.status}`);
    }

    const result = await response.json();
    return result.data || result;

  } catch (error) {
    console.error('CheckAuth Error:', error.message);
    if (redirectOnFailure) {
      clearTokensAndRedirect(loginPageUrl);
    }
    return null;
  }
}

// ==========================================
// ۴. مدیریت اتصالات WebSocket (Socket.IO)
// ==========================================

export function createAuthenticatedSocket(
  serverUrl = 'http://localhost',
  apiRefreshUrl = 'http://localhost/api/auth/refresh',
  loginPageUrl = 'auth.html'
) {
  const { accessToken } = getTokens();

  if (!accessToken) {
    console.error('Socket error: No access token found.');
    return null;
  }

  if (socket && socket.connected) {
    return socket;
  }

  if (socket) {
    socket.disconnect();
  }

  socket = io(serverUrl, {
    transports: ['websocket'],
    auth: (cb) => {
      const { accessToken: latestToken } = getTokens();
      cb({ 
        token: latestToken?.startsWith('Bearer ') ? latestToken : `Bearer ${latestToken}` 
      });
    },
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect_error', async (err) => {
    console.error('WebSocket Connection Error:', err.message);

    const isAuthError = err.message.includes('Unauthorized') || 
                        err.message.includes('jwt') || 
                        err.message.includes('token') ||
                        err.message.includes('401');

    if (isAuthError) {
      console.warn('WebSocket Auth failed. Attempting to refresh token...');
      
      socket.disconnect();

      const newAccessToken = await refreshAccessToken(apiRefreshUrl, loginPageUrl);

      if (newAccessToken) {
        console.log('✅ Token refreshed successfully for WebSocket. Reconnecting...');
        socket.auth = { token: `Bearer ${newAccessToken}` };
        socket.connect();
      } else {
        console.error('Failed to refresh token for WebSocket.');
        clearTokensAndRedirect(loginPageUrl);
      }
    }
  });

  return socket;
}

// ==========================================
// ۵. راه‌اندازی همزمان Auth و WebSocket
// ==========================================

export async function authAndSetupSocket(
  apiProfileUrl = 'http://localhost/api/profile',
  apiRefreshUrl = 'http://localhost/api/auth/refresh',
  loginPageUrl = 'auth.html',
  wsServerUrl = 'http://localhost'
) {
  const userData = await checkAuth(apiProfileUrl, apiRefreshUrl, loginPageUrl, true);

  if (!userData) {
    console.warn('Auth failed. Socket will not be initialized.');
    return null;
  }

  const activeSocket = createAuthenticatedSocket(wsServerUrl, apiRefreshUrl, loginPageUrl);

  return { userData, socket: activeSocket };
}