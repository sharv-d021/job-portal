// -------------------- ADMIN GUARD --------------------
if (localStorage.getItem("careerhubRole") !== "admin") {
  window.location.href = "login.html";
}

// -------------------- LOAD JOBS DATA --------------------
let allJobs = [];

async function loadJobs() {
  try {
    const response = await fetch('jobs.json');
    allJobs = await response.json();
    renderJobsList();
  } catch (error) {
    console.error('Error loading jobs:', error);
    allJobs = JSON.parse(localStorage.getItem('careerhubAllJobs')) || [];
    renderJobsList();
  }
}

// -------------------- NAVIGATION --------------------
function showSection(id) {
  document.querySelectorAll(".section").forEach(s =>
    s.classList.add("hidden")
  );
  document.getElementById(id).classList.remove("hidden");
  
  if (id === 'jobs') {
    loadJobs();
  } else if (id === 'applications') {
    renderApplications();
  }
}

// -------------------- LOGOUT --------------------
function logout() {
  localStorage.removeItem("careerhubLoggedIn");
  localStorage.removeItem("careerhubRole");
  window.location.href = "login.html";
}

// -------------------- COMPANY DETAILS --------------------
function saveCompany() {
  const name = companyName.value.trim();
  const location = companyLocation.value.trim();
  const desc = companyDesc.value.trim();

  if (!name || !location || !desc) {
    alert("Please fill all company details.");
    return;
  }

  localStorage.setItem(
    "careerhubCompany",
    JSON.stringify({ name, location, desc })
  );

  alert("Company details saved.");
}

// -------------------- ADD JOB TO PORTAL --------------------
function addJobToPortal() {
  const company = document.getElementById('jobCompany').value.trim();
  const role = document.getElementById('jobRole').value.trim();
  const type = document.getElementById('jobType').value;
  const location = document.getElementById('jobLocation').value.trim();
  const field = document.getElementById('jobField').value;
  const salary = document.getElementById('jobSalary').value.trim();
  const description = document.getElementById('jobDesc').value.trim();

  // Validation
  if (!company || !role || !type || !location || !field || !salary || !description) {
    alert('Please fill all required fields!');
    return;
  }

  // Create new job object
  const newJob = {
    id: Date.now(),
    company: company,
    role: role,
    type: type,
    location: location,
    field: field,
    salary: salary,
    description: description
  };

  // Add to jobs array
  allJobs.push(newJob);
  
  // Save to localStorage (since we can't write to JSON file directly)
  localStorage.setItem('careerhubAllJobs', JSON.stringify(allJobs));

  // Clear form
  document.getElementById('jobCompany').value = '';
  document.getElementById('jobRole').value = '';
  document.getElementById('jobType').value = '';
  document.getElementById('jobLocation').value = '';
  document.getElementById('jobField').value = '';
  document.getElementById('jobSalary').value = '';
  document.getElementById('jobDesc').value = '';

  // Show success message
  showAdminNotification('Job posted successfully! ✅');

  // Refresh job list
  renderJobsList();
}

// -------------------- RENDER JOBS LIST --------------------
function renderJobsList() {
  const container = document.getElementById('jobList');
  if (!container) return;

  if (allJobs.length === 0) {
    container.innerHTML = '<p class="empty-text">No jobs posted yet.</p>';
    return;
  }

  container.innerHTML = allJobs.map(job => `
    <div class="job-card">
      <div class="job-card-header">
        <div>
          <div class="job-card-title">${job.role}</div>
          <div class="job-card-company">${job.company}</div>
        </div>
      </div>
      <div class="job-card-meta">
        <span class="job-tag">${job.type}</span>
        <span class="job-tag">${job.location}</span>
        <span class="job-tag">${job.field}</span>
        <span class="job-tag">${job.salary}</span>
      </div>
      <div class="job-card-desc">${job.description}</div>
      <div class="job-card-actions">
        <button class="btn-edit" onclick="editJob(${job.id})">✏️ Edit</button>
        <button class="btn-delete" onclick="deleteJob(${job.id})">🗑️ Delete</button>
      </div>
    </div>
  `).join('');
}

// -------------------- FILTER JOBS --------------------
function filterJobs() {
  const searchTerm = document.getElementById('searchJobs').value.toLowerCase();
  const fieldFilter = document.getElementById('filterField').value;

  const filtered = allJobs.filter(job => {
    const matchesSearch = job.role.toLowerCase().includes(searchTerm) || 
                         job.company.toLowerCase().includes(searchTerm) ||
                         job.description.toLowerCase().includes(searchTerm);
    const matchesField = !fieldFilter || job.field === fieldFilter;
    
    return matchesSearch && matchesField;
  });

  const container = document.getElementById('jobList');
  if (filtered.length === 0) {
    container.innerHTML = '<p class="empty-text">No jobs match your filters.</p>';
    return;
  }

  container.innerHTML = filtered.map(job => `
    <div class="job-card">
      <div class="job-card-header">
        <div>
          <div class="job-card-title">${job.role}</div>
          <div class="job-card-company">${job.company}</div>
        </div>
      </div>
      <div class="job-card-meta">
        <span class="job-tag">${job.type}</span>
        <span class="job-tag">${job.location}</span>
        <span class="job-tag">${job.field}</span>
        <span class="job-tag">${job.salary}</span>
      </div>
      <div class="job-card-desc">${job.description}</div>
      <div class="job-card-actions">
        <button class="btn-edit" onclick="editJob(${job.id})">✏️ Edit</button>
        <button class="btn-delete" onclick="deleteJob(${job.id})">🗑️ Delete</button>
      </div>
    </div>
  `).join('');
}

// -------------------- EDIT JOB --------------------
function editJob(jobId) {
  const job = allJobs.find(j => j.id === jobId);
  if (!job) return;

  document.getElementById('jobCompany').value = job.company;
  document.getElementById('jobRole').value = job.role;
  document.getElementById('jobType').value = job.type;
  document.getElementById('jobLocation').value = job.location;
  document.getElementById('jobField').value = job.field;
  document.getElementById('jobSalary').value = job.salary;
  document.getElementById('jobDesc').value = job.description;

  // Delete the old job
  deleteJob(jobId, true);
  
  // Scroll to form
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  showAdminNotification('Job loaded for editing. Update and post again.');
}

// -------------------- DELETE JOB --------------------
function deleteJob(jobId, silent = false) {
  if (!silent && !confirm('Are you sure you want to delete this job?')) {
    return;
  }

  allJobs = allJobs.filter(j => j.id !== jobId);
  localStorage.setItem('careerhubAllJobs', JSON.stringify(allJobs));
  
  if (!silent) {
    showAdminNotification('Job deleted successfully! 🗑️');
  }
  
  renderJobsList();
}

// -------------------- NOTIFICATION --------------------
function showAdminNotification(message) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    padding: 16px 24px;
    border-radius: 10px;
    box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3);
    z-index: 10000;
    font-weight: 600;
    animation: slideIn 0.3s ease;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(400px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(400px); opacity: 0; }
  }
`;
document.head.appendChild(style);

// -------------------- APPLICATIONS (REAL USER DATA) --------------------
function renderApplications() {
  const box = document.getElementById("applicationList");
  if (!box) return;

  let responsesJobs =
    JSON.parse(localStorage.getItem("responsesJobs")) || [];

  box.innerHTML = "";

  if (responsesJobs.length === 0) {
    box.innerHTML =
      `<p class="empty-text">No applications received yet.</p>`;
    return;
  }

  responsesJobs.forEach((job, index) => {

    let actions = "";

    if (job.response === "Pending") {
      actions = `
        <button class="action-btn"
          onclick="acceptApplication(${index})">
          Accept
        </button>
        <button class="reject-btn"
          onclick="rejectApplication(${index})">
          Reject
        </button>
      `;
    } else {
      actions = `
        <p style="color:#64748b;font-style:italic">
          Decision locked
        </p>
      `;
    }

    box.innerHTML += `
      <div style="margin-bottom:20px;">
        <strong>${job.role}</strong><br>
        <span style="color:#64748b">${job.company}</span><br>
        Status: <b>${job.response}</b><br><br>

        <button class="ghost-btn"
          onclick="viewApplicantProfile()">
          View Profile / Resume
        </button><br><br>

        ${actions}
      </div>
      <hr>
    `;
  });
}

// -------------------- VIEW PROFILE + RESUME --------------------
function viewApplicantProfile() {
  const profile =
    JSON.parse(localStorage.getItem("careerhubProfile"));

  if (!profile) {
    alert("Applicant profile not found.");
    return;
  }

  let resumeHTML = "<p><em>No resume uploaded.</em></p>";

  if (profile.resume && profile.resume.data) {
    resumeHTML = `
      <button
        style="margin-top:10px"
        onclick="openAdminResume('${profile.resume.data}')">
        View Resume (${profile.resume.name})
      </button>
    `;
  }

  showAdminOverlay(`
    <h3>Applicant Profile</h3>
    <p><strong>Name:</strong> ${profile.name || "N/A"}</p>
    <p><strong>Email:</strong> ${profile.email || "N/A"}</p>
    <p><strong>Education:</strong> ${profile.education || "Not mentioned"}</p>
    <p><strong>Skills:</strong> ${profile.skills || "Not mentioned"}</p>
    <p><strong>Bio:</strong> ${profile.bio || "Not mentioned"}</p>
    ${resumeHTML}
  `);
}

// -------------------- ACCEPT → INTERVIEW FORM --------------------
function acceptApplication(index) {
  const box = document.getElementById("applicationList");

  box.innerHTML = `
    <div class="section">
      <h3>Interview Details</h3>

      <label>Mode</label>
      <select id="intMode">
        <option value="Online">Online</option>
        <option value="Offline">Offline</option>
      </select>

      <label style="display:block;margin-top:10px">
        Location / Link
      </label>
      <input id="intLocation" placeholder="Google Meet / Office Address">

      <label style="display:block;margin-top:10px">
        Interview Date
      </label>
      <input id="intDate" type="date">

      <button style="margin-top:15px"
        onclick="saveInterview(${index})">
        Save Interview Details
      </button>

      <button class="reject-btn" style="margin-left:10px"
        onclick="renderApplications()">
        Cancel
      </button>
    </div>
  `;
}

function saveInterview(index) {
  let responsesJobs =
    JSON.parse(localStorage.getItem("responsesJobs")) || [];

  const mode = document.getElementById("intMode").value;
  const location =
    document.getElementById("intLocation").value.trim();
  const date = document.getElementById("intDate").value;

  if (!mode || !location || !date) {
    alert("Please fill all interview details.");
    return;
  }

  responsesJobs[index].response = "Interview";
  responsesJobs[index].interview = { mode, location, date };

  localStorage.setItem("responsesJobs", JSON.stringify(responsesJobs));
  renderApplications();
}

// -------------------- REJECT --------------------
function rejectApplication(index) {
  let responsesJobs =
    JSON.parse(localStorage.getItem("responsesJobs")) || [];

  responsesJobs[index].response = "Rejected";
  localStorage.setItem("responsesJobs", JSON.stringify(responsesJobs));
  renderApplications();
}


// -------------------- ADMIN OVERLAY --------------------
function showAdminOverlay(html) {
  let overlay = document.getElementById("admin-overlay");

  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "admin-overlay";
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.background = "rgba(0,0,0,0.55)";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.zIndex = "9999";
    document.body.appendChild(overlay);
  }

  overlay.innerHTML = `
    <div style="
      background:#fff;
      max-width:500px;
      width:90%;
      padding:25px;
      border-radius:12px;
      box-shadow:0 20px 40px rgba(0,0,0,0.25);
    ">
      ${html}
      <button style="margin-top:15px"
        onclick="closeAdminOverlay()">Close</button>
    </div>
  `;
}

function closeAdminOverlay() {
  const overlay = document.getElementById("admin-overlay");
  if (overlay) overlay.remove();
}


// -------------------- OPEN RESUME IN NEW TAB --------------------
function openAdminResume(base64Data) {
  const byteString = atob(base64Data.split(',')[1]);
  const mimeString = base64Data.split(',')[0].split(':')[1].split(';')[0];

  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);

  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  const blob = new Blob([ab], { type: mimeString });
  const blobUrl = URL.createObjectURL(blob);

  window.open(blobUrl, '_blank');
}



renderApplications();
// -------------------- END OF ADMIN JS --------------------
