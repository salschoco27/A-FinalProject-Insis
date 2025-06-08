// Fungsi umum untuk toggle pesan error / success
function showMessage(id, message, isError = true) {
  const el = document.getElementById(id);
  el.textContent = message;
  el.classList.remove('d-none');
  if (isError) {
    el.classList.remove('alert-success');
    el.classList.add('alert-danger');
  } else {
    el.classList.remove('alert-danger');
    el.classList.add('alert-success');
  }
}

// Login form handling
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        showMessage('loginError', data.error || 'Login failed');
        return;
      }

      // Simpan token ke localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', username);

      // Redirect ke dashboard atau halaman selanjutnya (kalau sudah dibuat)
      alert('Login berhasil!');
      // Contoh redirect: window.location.href = '/dashboard.html';

    } catch (err) {
      showMessage('loginError', 'Network error');
    }
  });
}

// Register form handling
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('registerUsername').value.trim();
    const password = document.getElementById('registerPassword').value.trim();

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        showMessage('registerError', data.error || 'Register failed');
        return;
      }

      showMessage('registerSuccess', 'Register berhasil! Silakan login.', false);
      // Reset form
      registerForm.reset();

    } catch (err) {
      showMessage('registerError', 'Network error');
    }
  });
}
