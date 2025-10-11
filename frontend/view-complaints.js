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

      let progressPercent = Math.min((timeDiff / oneHour) * 100, 100);

      if (timeDiff > oneHour && c.status === "Pending") {
        c.status = "Important";
      }

      let buttonColor = "";
      let progressBarColor = "";
      let progressWidth = 0;

      if (c.status === "Resolved") {
        buttonColor = "#13b013ff";
        progressBarColor = "#13b013ff"; 
        progressWidth = 100;
      } else if (c.status === "Important") {
        buttonColor = "#f8f8a4ff";
        progressBarColor = "#f8f8a4ff"; 
        progressWidth = 100; // Full when important
      } else {
        buttonColor = "#c81121ff"; 
        progressBarColor = "#df1515ff"; 
        progressWidth = progressPercent;
      }

      // complaint row + progress bar
      complaintsBody.innerHTML += `
        <tr id="complaint-${c._id}">
          <td>${c._id}</td>
          <td>${c.pnr}</td>
          <td>${c.description}</td>
          <td>${c.issueDomain}</td>
          <td>${c.status}</td>
          <td>${createdAt}</td>
          <td>
            <button 
              class="delete-btn" 
              data-id="${c._id}" 
              ${c.status === "Resolved" ? "disabled" : ""}
              style="
                background-color: ${buttonColor};
                color: ${c.status === "Resolved" ? "#fff" : c.status === "Important" ? "#000" : "#fff"};
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: ${c.status === "Resolved" ? "not-allowed" : "pointer"};
                font-weight: 600;
                opacity: ${c.status === "Resolved" ? "0.6" : "1"};
              "
            >
              Delete
            </button>
          </td>
        </tr>
        
        <tr>
          <td colspan="7" style="padding: 0 8px 12px 8px;">
            <div style="background:#e0e0e0;height:10px;border-radius:5px;overflow:hidden;margin-top:4px;">
              <div style="
                width:${progressWidth}%;
                height:100%;
                background:${progressBarColor};
                transition:width 0.5s ease;
                border-radius:5px;
              "></div>
            </div>
            <small style="font-size:12px;color:#555;margin-top:4px;display:block;">
              ${
                c.status === "Resolved"
                  ? "✓ Complaint Resolved - 100% Complete"
                  : c.status === "Important"
                  ? "⚠ Marked as Important - Requires Immediate Attention"
                  : `Progress to Important: ${progressPercent.toFixed(1)}% (${Math.max(0, Math.ceil((oneHour - timeDiff) / 60000))} min remaining)`
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
            row.nextElementSibling?.remove();
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

fetchProfile();

// progress bar every minute
setInterval(loadComplaints, 60 * 1000);