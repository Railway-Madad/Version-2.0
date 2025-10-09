const API_BASE = "http://localhost:4000";
const token = localStorage.getItem('token');
let currentUser = {};

if (!token) {
  window.location.href = "login.html";
} else {
  fetch(`${API_BASE}/user/profile`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(res => {
    if (!res.ok) throw new Error('Failed to fetch profile');
    return res.json();
  })
  .then(data => {
    currentUser = data.user || {};
    document.getElementById('username').value = currentUser.username;
    document.getElementById('current-user').textContent = currentUser.username;
  })
  .catch(() => {
    window.location.href = "login.html";
  });
}

document.getElementById('emergencyForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = {
    username: document.getElementById('username').value,
    trainNumber: document.getElementById('trainNumber').value,
    seatNumber: document.getElementById('seatNumber').value,
  };

  try {
    const res = await fetch(`${API_BASE}/emergency/postEmg`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const result = await res.json();
    document.getElementById('result').innerText = result.message || result.error;
  } catch (err) {
    document.getElementById('result').innerText = 'Something went wrong!';
  }
});
