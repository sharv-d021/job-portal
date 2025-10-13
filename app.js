// ==============================
// CareerHub JS – Final Fixed Version
// ==============================

let jobsData = [];
let appliedJobs = JSON.parse(localStorage.getItem("appliedJobs")) || [];
let responsesJobs = JSON.parse(localStorage.getItem("responsesJobs")) || [];

const filters = {
  location: document.getElementById("filter-location"),
  type: document.getElementById("filter-type"),
  field: document.getElementById("filter-field"),
  salary: document.getElementById("filter-salary"),
  search: document.getElementById("search")
};

document.addEventListener("DOMContentLoaded", () => {
  // Theme toggle
  const themeToggle = document.getElementById("theme-toggle");
  themeToggle?.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    document.body.classList.toggle("light");
  });

  // Navigation buttons
  document.getElementById("home-page-btn")?.addEventListener("click", () => (window.location = "index.html"));
  document.getElementById("applied-page-btn")?.addEventListener("click", () => (window.location = "applied.html"));
  document.getElementById("responses-page-btn")?.addEventListener("click", () => (window.location = "responses.html"));

  // Index page: fetch jobs & render
  const listArea = document.querySelector(".list-area");
  if (listArea) {
    fetch("jobs.json")
      .then(res => res.json())
      .then(data => {
        jobsData = data;
        populateFilters();
        renderJobsCards(jobsData);
      });
  }

  // Filters
  Object.values(filters).forEach(f => {
    f?.addEventListener("input", () => renderJobsCards(getFilteredJobs()));
  });

  // Applied & responses page initial render
  renderAppliedJobs();
  renderResponses();
});

// ==============================
// Populate filters (index.html)
// ==============================
function populateFilters() {
  if (!filters.location) return;
  const locations = [...new Set(jobsData.map(j => j.location))];
  const types = [...new Set(jobsData.map(j => j.type))];
  const fields = [...new Set(jobsData.map(j => j.field))];

  locations.forEach(l => {
    let opt = document.createElement("option");
    opt.value = l;
    opt.innerText = l;
    filters.location.appendChild(opt);
  });
  types.forEach(t => {
    let opt = document.createElement("option");
    opt.value = t;
    opt.innerText = t;
    filters.type.appendChild(opt);
  });
  fields.forEach(f => {
    let opt = document.createElement("option");
    opt.value = f;
    opt.innerText = f;
    filters.field.appendChild(opt);
  });
}

// ==============================
// Render Jobs Cards (Index.html)
// ==============================
function renderJobsCards(list) {
  const listArea = document.querySelector(".list-area");
  if (!listArea) return;
  listArea.innerHTML = "";

  list.forEach(job => {
    const isApplied = appliedJobs.some(j => j.id === job.id);
    const card = document.createElement("div");
    card.className = "job-item card fade-in";
    card.innerHTML = `
      <div class="title">${job.role}</div>
      <div class="company">${job.company}</div>
      <div class="meta">
        <span class="tag">${job.type}</span>
        <span class="tag">${job.location}</span>
        <span class="tag">${job.field}</span>
        <span class="tag">${job.salary}</span>
      </div>
      <p>${job.description}</p>
      <button class="btn-apply" ${isApplied ? "disabled" : ""}>${isApplied ? "Applied" : "Apply Now"}</button>
    `;
    card.querySelector(".btn-apply")?.addEventListener("click", () => applyJob(job));
    listArea.appendChild(card);
  });
}

// ==============================
// Apply Job
// ==============================
function applyJob(job) {
  if (appliedJobs.some(j => j.id === job.id)) return;

  appliedJobs.push(job);
  localStorage.setItem("appliedJobs", JSON.stringify(appliedJobs));
  alert("Job Applied!");
  renderJobsCards(getFilteredJobs());

  // Simulate company response after delay
  setTimeout(() => {
    const response = { ...job, response: Math.random() > 0.5 ? "Accepted" : "Pending" };
    responsesJobs.push(response);
    localStorage.setItem("responsesJobs", JSON.stringify(responsesJobs));
  }, 2000);
}

// ==============================
// Filter logic
// ==============================
function getFilteredJobs() {
  return jobsData.filter(j => {
    let match = true;
    if (filters.location?.value) match = match && j.location === filters.location.value;
    if (filters.type?.value) match = match && j.type === filters.type.value;
    if (filters.field?.value) match = match && j.field === filters.field.value;
    if (filters.salary?.value) {
      const [min, max] = filters.salary.value.split("-").map(Number);
      const salNum = Number(j.salary.replace(/[^\d]/g, ""));
      match = match && salNum >= min && salNum <= max;
    }
    if (filters.search?.value) {
      const s = filters.search.value.toLowerCase();
      match = match && (j.role.toLowerCase().includes(s) || j.company.toLowerCase().includes(s));
    }
    return match;
  });
}

// ==============================
// Render Applied Jobs (Applied.html)
// ==============================
function renderAppliedJobs() {
  const appliedList = document.querySelector(".applied-list");
  appliedJobs = JSON.parse(localStorage.getItem("appliedJobs")) || [];
  if (!appliedList) return;
  appliedList.innerHTML = "";

  if (appliedJobs.length === 0) {
    appliedList.innerHTML = "<p>No jobs applied yet.</p>";
    return;
  }

  appliedJobs.forEach(job => {
    const card = document.createElement("div");
    card.className = "job-item card fade-in";
    card.innerHTML = `
      <div class="title">${job.role}</div>
      <div class="company">${job.company}</div>
      <div class="meta">
        <span class="tag">${job.type}</span>
        <span class="tag">${job.location}</span>
        <span class="tag">${job.field}</span>
        <span class="tag">${job.salary}</span>
      </div>
    `;
    appliedList.appendChild(card);
  });
}

// ==============================
// Render Responses (Responses.html)
// ==============================
function renderResponses() {
  const responsesList = document.querySelector(".responses-list");
  responsesJobs = JSON.parse(localStorage.getItem("responsesJobs")) || [];
  if (!responsesList) return;
  responsesList.innerHTML = "";

  const validResponses = responsesJobs.filter(r => appliedJobs.some(a => a.id === r.id));

  if (validResponses.length === 0) {
    responsesList.innerHTML = "<p>No responses yet.</p>";
    return;
  }

  validResponses.forEach(job => {
    const card = document.createElement("div");
    card.className = "job-item card fade-in";
    card.innerHTML = `
      <div class="title">${job.role}</div>
      <div class="company">${job.company}</div>
      <div class="meta">Response: <b>${job.response || "Pending"}</b></div>
    `;
    responsesList.appendChild(card);
  });
}
