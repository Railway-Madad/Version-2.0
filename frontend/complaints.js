const API_BASE = 'http://localhost:4000';

const form = document.getElementById('complaint-form');
const successMessage = document.getElementById('success-message');
const errorMessage = document.getElementById('error-message');
const viewBtn = document.getElementById('view-complaints-btn');
const complaintsTable = document.getElementById('complaints-table');
const complaintsBody = document.getElementById('complaints-body');
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
        currentUser = data.user || "";
        document.getElementById('username').value = currentUser.username;
        console.log(currentUser);
        console.log(currentUser.username);
        document.getElementById('current-user').textContent = currentUser.username;
    })
    .catch(() => {
        window.location.href = "login.html";
    });
}
document.getElementById('username').value = currentUser.username;
document.getElementById('current-user').textContent = currentUser.username;


// submit complaint
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    successMessage.style.display = 'none';
    errorMessage.style.display = 'none';

    const formData = new FormData(form);
//pass the token in header
    try {
        console.log("done");
        const response = await fetch(`${API_BASE}/complaint/submit-complaint`, {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log("done1");

        if (!response.ok) throw new Error('Failed to submit complaint');

        successMessage.style.display = 'block';
        form.reset();
        document.getElementById('username').value = currentUser.username;
    } catch (err) {
        console.log("done2");
        console.error(err);
        errorMessage.style.display = 'block';
    }
});

viewBtn.addEventListener('click', () => {
    window.location.href = 'view-complaints.html';
});