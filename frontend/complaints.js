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

// view complaints
viewBtn.addEventListener('click', async () => {
    try {
        const response = await fetch(`${API_BASE}/complaint/api/complaints/user/${currentUser}`);
        if (!response.ok) throw new Error('Failed to fetch complaints');

        const complaints = await response.json();
        complaintsBody.innerHTML = '';

        if (complaints.length === 0) {
            complaintsBody.innerHTML = '<tr><td colspan="7">No complaints found.</td></tr>';
        } else {
            complaints.forEach(c => {
                const createdAt = new Date(c.createdAt).toLocaleString();
                complaintsBody.innerHTML += `
                    <tr id="complaint-${c._id}">
                        <td>${c._id}</td>
                        <td>${c.pnr}</td>
                        <td>${c.description}</td>
                        <td>${c.issueDomain}</td>
                        <td>${c.status}</td>
                        <td>${createdAt}</td>
                        <td>
                            <button class="delete-btn" data-id="${c._id}">Delete</button>
                        </td>
                    </tr>
                `;
            });

            // delete functionality
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const id = e.target.dataset.id;
                    if (!confirm('Delete this complaint?')) return;

                    try {
                        const res = await fetch(`${API_BASE}/complaint/${id}`, { method: 'DELETE' });
                        if (!res.ok) throw new Error('Failed to delete complaint');
                        document.getElementById(`complaint-${id}`).remove();
                        alert('Deleted successfully');
                    } catch (err) {
                        console.error(err);
                        alert('Delete failed');
                    }
                });
            });
        }

        complaintsTable.style.display = 'table';
    } catch (err) {
        console.error(err);
        complaintsBody.innerHTML = '<tr><td colspan="7">Error loading complaints.</td></tr>';
        complaintsTable.style.display = 'table';
    }
});
