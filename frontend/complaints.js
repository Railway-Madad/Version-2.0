const API_BASE = 'http://localhost:4000';
const currentUser = "Vedant"; //future
document.getElementById('username').value = currentUser;
document.getElementById('current-user').textContent = currentUser;

const form = document.getElementById('complaint-form');
const successMessage = document.getElementById('success-message');
const errorMessage = document.getElementById('error-message');
const viewBtn = document.getElementById('view-complaints-btn');
const complaintsTable = document.getElementById('complaints-table');
const complaintsBody = document.getElementById('complaints-body');

// submit complaint
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    successMessage.style.display = 'none';
    errorMessage.style.display = 'none';

    const formData = new FormData(form);

    try {
        console.log("done");
        const response = await fetch(`${API_BASE}/complaint/submit-complaint`, {
            method: 'POST',
            body: formData
        });
        console.log("done1");

        if (!response.ok) throw new Error('Failed to submit complaint');

        successMessage.style.display = 'block';
        form.reset();
        document.getElementById('username').value = currentUser;
    } catch (err) {
        console.log("done2");
        console.error(err);
        errorMessage.style.display = 'block';
    }
});

viewBtn.addEventListener('click', () => {
    window.location.href = 'view-complaints.html';
});