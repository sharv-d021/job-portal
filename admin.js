// -------------------- ADMIN GUARD --------------------
if (localStorage.getItem("careerhubRole") !== "admin") {
  window.location.href = "login.html";
}

// -------------------- NAVIGATION --------------------
function showSection(id) {
  document.querySelectorAll(".section").forEach(s =>
    s.classList.add("hidden")
  );
  document.getElementById(id).classList.remove("hidden");
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

// -------------------- DEMO JOB MANAGEMENT --------------------
let demoJobs = JSON.parse(localStorage.getItem("careerhubJobs")) || [];

function addJob() {
  const title = jobTitle.value.trim();
  const desc = jobDesc.value.trim();

  if (!title || !desc) {
    alert("Please fill all job fields before adding.");
    return;
  }

  demoJobs.push({ id: Date.now(), title, desc });
  localStorage.setItem("careerhubJobs", JSON.stringify(demoJobs));

  jobTitle.value = "";
  jobDesc.value = "";
  renderDemoJobs();
}

function removeJob(id) {
  demoJobs = demoJobs.filter(j => j.id !== id);
  localStorage.setItem("careerhubJobs", JSON.stringify(demoJobs));
  renderDemoJobs();
}

function renderDemoJobs() {
  const list = document.getElementById("jobList");
  if (!list) return;

  list.innerHTML = "";

  if (demoJobs.length === 0) {
    list.innerHTML =
      `<p class="empty-text">No demo vacancies added.</p>`;
    return;
  }

  demoJobs.forEach(j => {
    list.innerHTML += `
      <li>
        ${j.title}
        <button onclick="removeJob(${j.id})">Remove</button>
      </li>
    `;
  });
}
renderDemoJobs();

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
