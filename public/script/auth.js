import { checkAuth, saveTokens } from './WSservice.js';

async function initAuthCheck() {
  const userData = await checkAuth(
    'http://localhost/api/profile',
    'http://localhost/api/auth/refresh',
    'auth.html'
  );

  if (userData) {
    window.location.href = '/home.html';
  }
}

initAuthCheck();

// ۲. عناصر DOM و مدیریت تب‌ها
const loginTab = document.getElementById('loginTab');
const registerTab = document.getElementById('registerTab');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

function toggleAuthMode(isLogin) {
  loginTab.classList.toggle('active', isLogin);
  registerTab.classList.toggle('active', !isLogin);
  loginForm.classList.toggle('active-form', isLogin);
  registerForm.classList.toggle('active-form', !isLogin);

  if (isLogin) {
    registerForm.reset();
  } else {
    loginForm.reset();
  }
}

loginTab.addEventListener('click', () => toggleAuthMode(true));
registerTab.addEventListener('click', () => toggleAuthMode(false));

// ۳. فرم ورود (Login)
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const payload = {
    username: document.getElementById('loginUsername').value.trim(),
    password: document.getElementById('loginPassword').value,
  };

  try {
    const response = await fetch('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const resData = await response.json();

    if (!response.ok) {
      const errorMsg = Array.isArray(resData.message)
        ? resData.message.join(' | ')
        : (resData.message || 'خطا در ورود');
      throw new Error(errorMsg);
    }

    const authData = resData.data || resData;

    if (authData && authData.accessToken && authData.refreshToken) {
      saveTokens(authData.accessToken, authData.refreshToken);
      // alert(`${authData.username || payload.username} : ورود موفقیت‌آمیز بود`);
      loginForm.reset();
      window.location.href = '/home.html';
    } else {
      throw new Error('توکن‌ها از سرور دریافت نشدند!');
    }

  } catch (error) {
    console.error('Login error:', error);
    alert(`خطا: ${error.message}`);
  }
});

// ۴. فرم ثبت‌نام (Register)
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const payload = {
    username: document.getElementById('regUsername').value.trim(),
    email: document.getElementById('regEmail').value.trim(),
    password: document.getElementById('regPassword').value,
  };

  try {
    const response = await fetch('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const resData = await response.json();

    if (!response.ok) {
      const errorMsg = Array.isArray(resData.message)
        ? resData.message.join(' | ')
        : (resData.message || 'خطا در ثبت‌نام');
      throw new Error(errorMsg);
    }

    const authData = resData.data || resData;

    if (authData && authData.accessToken && authData.refreshToken) {
      saveTokens(authData.accessToken, authData.refreshToken);
      // alert(`${authData.username || payload.username} : ثبت‌نام موفقیت‌آمیز بود`);
      registerForm.reset();
      window.location.href = '/home.html';
    } else {
      alert(`${payload.username} : ثبت‌نام موفقیت‌آمیز بود. لطفاً وارد شوید.`);
      registerForm.reset();
      toggleAuthMode(true);
    }

  } catch (error) {
    console.error('Register error:', error);
    alert(`خطا: ${error.message}`);
  }
});