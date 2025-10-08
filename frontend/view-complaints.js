const API_BASE = "http://localhost:4000";
document.getElementById("current-user").textContent = currentUser;

const complaintsTable = document.getElementById("complaints-table");
const complaintsBody = document.getElementById("complaints-body");
let currentUser = "";
if (!token) {
  window.location.href = "login.html";
} else {
  fetch(`${API_BASE}/user/profile`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to fetch profile");
      return res.json();
    })
    .then((data) => {
      currentUser = data.user || "";
      document.getElementById("username").value = currentUser.username;
      document.getElementById("current-user").textContent = currentUser.username;
    })
    .catch(() => {
      window.location.href = "login.html";
    });
}

async function loadComplaints() {
  try {
    const response = await fetch(
      `${API_BASE}/complaint/api/complaints/user/${currentUser}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
                    <tr>
                        <td>${c._id}</td>
                        <td>${c.pnr}</td>
                        <td>${c.description}</td>
                        <td>${c.issueDomain}</td>
                        <td>${c.status}</td>
                        <td>${createdAt}</td>
                        <td background-color: ${
                          c.status === "Resolved" ? "#e4d8d9ff" : "#bc0b1aff"
                        };">
                            <button class="delete-btn" data-id="${
                              c._id
                            }">Delete</button>
                        </td>
                    </tr>
                `;
      });
      //delete shit
      document.querySelectorAll(".delete-btn").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
          const id = e.target.dataset.id;
          if (!confirm("Delete this complaint?")) return;

          try {
            const res = await fetch(
              `${API_BASE}/complaint/api/complaints/${id}`,
              {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            if (!res.ok) throw new Error("Failed to delete complaint");
            document.getElementById(`complaint-${id}`).remove();
            alert("Deleted successfully");
          } catch (err) {
            console.error(err);
            alert("Delete failed");
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

window.onload = loadComplaints;
