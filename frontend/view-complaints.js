const API_BASE = "http://localhost:4000";
const token = localStorage.getItem("token");
let currentUser = null;

if (!token) {
  window.location.href = "login.html";
}

const complaintsTable = document.getElementById("complaints-table");
const complaintsBody = document.getElementById("complaints-body");
const usernameElem = document.getElementById("username");
const currentUserElem = document.getElementById("current-user");

// fetch user profile first
async function fetchProfile() {
  try {
    const res = await fetch(`${API_BASE}/user/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Failed to fetch profile");

    const data = await res.json();
    currentUser = data.user;

    // set username and UI
    if (usernameElem) usernameElem.value = currentUser.username;
    if (currentUserElem) currentUserElem.textContent = currentUser.username;

    // load complaints after profile is ready
    await loadComplaints();
  } catch (err) {
    console.error(err);
    window.location.href = "login.html"; // redirect if auth fails
  }
}

// get complaints
async function loadComplaints() {
  if (!currentUser) return;

  try {
    // Use userId if backend expects authenticated user
    const response = await fetch(
      `${API_BASE}/complaint/api/complaints/user/${currentUser.username}`, // OR backend route that uses req.userId
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) throw new Error("Failed to fetch complaints");

    const complaints = await response.json();
    complaintsBody.innerHTML = "";

    if (complaints.length === 0) {
      complaintsBody.innerHTML =
        '<tr><td colspan="6">No complaints found.</td></tr>';
    } else {
      complaints.forEach((c) => {
        const createdAt = new Date(c.createdAt).toLocaleString();
        complaintsBody.innerHTML += `
                    <tr id="complaint-${c._id}">
                        <td>${c._id}</td>
                        <td>${c.pnr}</td>
                        <td>${c.description}</td>
                        <td>${c.issueDomain}</td>
                        <td>${c.status}</td>
                        <td>${createdAt}</td>
                        <td style="background-color: ${
                          c.status === "Resolved" ? "#e4d8d9" : "#c81121ff"
                        };">
                            <button class="delete-btn" data-id="${
                              c._id
                            }">Delete</button>
                        </td>
                    </tr>
                `;
      });
      //delete
      document.querySelectorAll(".delete-btn").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
          const id = e.target.dataset.id;
          if (!confirm("Delete this complaint?")) return;

          try {
            const res = await fetch(
              `${API_BASE}/complaint/api/complaints/${id}`,
              {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            // Log status & response text for debugging
            if (!res.ok) {
              const text = await res.text();
              throw new Error(
                `Failed to delete complaint: ${res.status} ${text}`
              );
            }

            // Remove row from table
            const row = document.getElementById(`complaint-${id}`);
            if (row) row.remove();

            alert("Deleted successfully");
          } catch (err) {
            console.error(err);
            alert(`Delete failed: ${err.message}`);
          }
        });
      });
    }

    complaintsTable.style.display = "table";
  } catch (err) {
    console.error(err);
    complaintsBody.innerHTML =
      '<tr><td colspan="6">Error loading complaints.</td></tr>';
    complaintsTable.style.display = "table";
  }
}

// start
fetchProfile();
