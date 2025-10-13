

// This code is fixed by tahzeeb the legend,he is the best coder in the world
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
  // Theme toggle with persistence
  const themeToggle = document.getElementById("theme-toggle");
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    document.body.classList.remove("light", "dark");
    document.body.classList.add(savedTheme);
  }
  themeToggle?.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    document.body.classList.toggle("light");
    const newTheme = document.body.classList.contains("dark") ? "dark" : "light";
    localStorage.setItem("theme", newTheme);
  });

  // Navigation buttons
  document.getElementById("home-page-btn")?.addEventListener("click", () => (window.location = "index.html"));
  document.getElementById("applied-page-btn")?.addEventListener("click", () => (window.location = "applied.html"));
  document.getElementById("responses-page-btn")?.addEventListener("click", () => (window.location = "responses.html"));

  // Use pathname to determine current page (robust if different HTML names)
  const path = window.location.pathname.split("/").pop().toLowerCase();
  const isIndex = path === "" || path === "index.html" || path === "home.html";
  const isAppliedPage = path === "applied.html" || !!document.querySelector(".applied-list");
  const isResponsesPage = path === "responses.html" || !!document.querySelector(".responses-list");

  
  if (isIndex) {
    const listArea = document.querySelector(".list-area");
    if (listArea) {
      fetch("jobs.json")
        .then(res => res.json())
        .then(data => {
          jobsData = data;
          populateFilters();
          renderJobsCards(jobsData);
        })
        .catch(() => {
          listArea.innerHTML = "<p>Failed to load jobs. Please try again later.</p>";
        });
    }
  }

  // Filters (only attach if filter elements exist)
  Object.values(filters).forEach(f => {
    f?.addEventListener("input", () => renderJobsCards(getFilteredJobs()));
  });

  // Add Reset Filters button if on index.html
  if (isIndex && filters.location && !document.getElementById("reset-filters-btn")) {
    const resetBtn = document.createElement("button");
    resetBtn.id = "reset-filters-btn";
    resetBtn.textContent = "Reset Filters";
    resetBtn.style.marginLeft = "10px";
    filters.location.parentElement?.appendChild(resetBtn);
    resetBtn.addEventListener("click", () => {
      Object.values(filters).forEach(f => { if (f) f.value = ""; });
      renderJobsCards(jobsData);
    });
  }

  // Render applied & responses only on their pages
  if (isAppliedPage) renderAppliedJobs();
  if (isResponsesPage) renderResponses();

  // Periodically refresh responses page if present
  if (isResponsesPage) {
    setInterval(renderResponses, 3000);
  }
});
// ...existing code...

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
  // Always reload appliedJobs from localStorage to avoid stale data
  appliedJobs = JSON.parse(localStorage.getItem("appliedJobs")) || [];
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
  // Always reload appliedJobs from localStorage to avoid race conditions
  appliedJobs = JSON.parse(localStorage.getItem("appliedJobs")) || [];
  if (appliedJobs.some(j => j.id === job.id)) return;

  appliedJobs.push(job);
  localStorage.setItem("appliedJobs", JSON.stringify(appliedJobs));
  alert("Job Applied!");

  // Re-render index (if present) and applied page (if present)
  const path = window.location.pathname.split("/").pop().toLowerCase();
  const isIndex = path === "" || path === "index.html" || path === "home.html";
  const isAppliedPage = path === "applied.html" || !!document.querySelector(".applied-list");
  if (isIndex) renderJobsCards(getFilteredJobs());
  if (isAppliedPage) renderAppliedJobs();

  // Simulate company response after delay
  setTimeout(() => {
    // Always reload responsesJobs from localStorage to avoid race conditions
    responsesJobs = JSON.parse(localStorage.getItem("responsesJobs")) || [];
    const response = { ...job, response: Math.random() > 0.5 ? "Accepted" : "Pending" };
    // Prevent duplicate responses
    if (!responsesJobs.some(r => r.id === job.id)) {
      responsesJobs.push(response);
      localStorage.setItem("responsesJobs", JSON.stringify(responsesJobs));
      // update responses page if visible
      if (!!document.querySelector(".responses-list")) renderResponses();
    }
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
      // Support salary filter with or without commas/currency
      const [min, max] = filters.salary.value.split("-").map(s => Number(s.replace(/[^\d]/g, "")));
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
  if (!appliedList) return;
  appliedList.innerHTML = "";

  // Reload stored applied jobs
  const stored = JSON.parse(localStorage.getItem("appliedJobs")) || [];

  if (stored.length === 0) {
    appliedList.innerHTML = "<p>No jobs applied yet.</p>";
    return;
  }

  // Determine whether stored items are full job objects or just ids
  let displayJobs = [];
  const first = stored[0];
  const looksLikeFull = first && (first.role || first.company || first.description);

  if (looksLikeFull) {
    // stored contains full job objects
    displayJobs = stored;
  } else {
    // stored contains ids (or mixed): resolve from jobsData when available, otherwise skip missing
    const ids = stored.map(s => (typeof s === "object" && s.id) ? s.id : s);
    displayJobs = jobsData.length ? jobsData.filter(j => ids.includes(j.id)) : [];
    // if jobsData not loaded and stored has objects with minimal info, try to render them directly
    if (displayJobs.length === 0 && stored.some(s => typeof s === "object")) {
      displayJobs = stored.filter(s => s && s.id).map(s => s);
    }
  }

  // Deduplicate by id
  displayJobs = displayJobs.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);

  if (displayJobs.length === 0) {
    appliedList.innerHTML = "<p>No jobs applied yet.</p>";
    return;
  }

  displayJobs.forEach(job => {
    const card = document.createElement("div");
    card.className = "job-item card fade-in";
    card.innerHTML = `
      <div class="title">${job.role}</div>
      <div class="company">${job.company}</div>
      <div class="meta">
        <span class="tag">${job.type || ""}</span>
        <span class="tag">${job.location || ""}</span>
        <span class="tag">${job.field || ""}</span>
        <span class="tag">${job.salary || ""}</span>
      </div>
      <p>${job.description || ""}</p>
    `;
    appliedList.appendChild(card);
  });
}

// ==============================
// Render Responses (Responses.html)
// ==============================
function renderResponses() {
  const responsesList = document.querySelector(".responses-list");
  if (!responsesList) return;
  responsesList.innerHTML = "";
  responsesJobs = JSON.parse(localStorage.getItem("responsesJobs")) || [];
  appliedJobs = JSON.parse(localStorage.getItem("appliedJobs")) || [];

  const validResponses = responsesJobs.filter(r => appliedJobs.some(a => a.id === r.id) || (typeof appliedJobs[0] !== 'object' && appliedJobs.includes(r.id)));

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
