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

    if (usernameElem) usernameElem.value = currentUser.username;
    if (currentUserElem) currentUserElem.textContent = currentUser.username;

    await loadComplaints();
  } catch (err) {
    console.error(err);
    window.location.href = "login.html";
  }
}

// load complaints and show progress bar
async function loadComplaints() {
  if (!currentUser) return;

  try {
    const response = await fetch(
      `${API_BASE}/complaint/api/complaints/user/${currentUser.username}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) throw new Error("Failed to fetch complaints");

    const complaints = await response.json();
    complaintsBody.innerHTML = "";

    if (complaints.length === 0) {
      complaintsBody.innerHTML =
        '<tr><td colspan="7">No complaints found.</td></tr>';
      return;
    }

    complaints.forEach((c) => {
      const createdAt = new Date(c.createdAt).toLocaleString();
      const currentTime = Date.now();
      const complaintTime = new Date(c.createdAt).getTime();
      const timeDiff = currentTime - complaintTime;
      const oneHour = 60 * 60 * 1000;

      // progress towards "Important" (0–100%)
      let progressPercent = Math.min((timeDiff / oneHour) * 100, 100);

      if (timeDiff > oneHour && c.status === "Pending") {
        c.status = "Important";
      }

      const bgColor =
        c.status === "Resolved"
          ? "#13b013ff"
          : c.status === "Important"
          ? "#f8f8a4ff"
          : "#c81121ff";

      // complaint row + progress bar
      complaintsBody.innerHTML += `
        <tr id="complaint-${c._id}">
          <td>${c._id}</td>
          <td>${c.pnr}</td>
          <td>${c.description}</td>
          <td>${c.issueDomain}</td>
          <td>${c.status}</td>
          <td>${createdAt}</td>
          <td style="background-color:${bgColor};">
        <button class="delete-btn" data-id="${c._id}" ${c.status === "Resolved" ? "disabled" : ""}>Delete</button>
          </td>
        </tr>
        
        <tr>
          <td colspan="7">
        <div style="background:#e0e0e0;height:8px;border-radius:4px;overflow:hidden;margin-top:4px;">
          <div style="
            width:${progressPercent}%;
            height:100%;
            background:${
          c.status === "Important" ? "#f8f8a4ff" : "#4caf50"
            };
            transition:width 0.5s ease;
          "></div>
        </div>
        <small style="font-size:12px;color:#555;">
          ${
            c.status === "Important"
          ? " Marked as Important"
          : `Progress to Important: ${progressPercent.toFixed(1)}%`
          }
        </small>
          </td>
        </tr>
      `;
    });

    // delete complaint
    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const id = e.target.dataset.id;
        if (!confirm("Delete this complaint?")) return;

        try {
          const res = await fetch(`${API_BASE}/complaint/api/complaints/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!res.ok) {
            const text = await res.text();
            throw new Error(`Failed to delete complaint: ${res.status} ${text}`);
          }

          const row = document.getElementById(`complaint-${id}`);
          if (row) {
            row.nextElementSibling?.remove(); // remove progress bar row
            row.remove();
          }

          alert("Deleted successfully");
        } catch (err) {
          console.error(err);
          alert(`Delete failed: ${err.message}`);
        }
      });
    });

    complaintsTable.style.display = "table";
  } catch (err) {
    console.error(err);
    complaintsBody.innerHTML =
      '<tr><td colspan="7">Error loading complaints.</td></tr>';
    complaintsTable.style.display = "table";
  }
}

// Start
fetchProfile();

// Auto-refresh progress bar every minute
setInterval(loadComplaints, 60 * 1000);
