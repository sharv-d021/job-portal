// ---------------- GLOBAL VARS ----------------
let jobsData = [];
let appliedJobs = JSON.parse(localStorage.getItem('appliedJobs')) || [];
let responsesJobs = JSON.parse(localStorage.getItem('responsesJobs')) || [];

// ---------------- HELPERS ----------------
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

const showToast = (msg) => {
  const t = $('#toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 1800);
};

// ---------------- THEME ----------------
const savedTheme = localStorage.getItem('careerhubTheme');
document.body.classList.add(savedTheme === 'dark' ? 'theme-dark' : 'theme-light');

// ---------------- DOM READY ----------------
document.addEventListener('DOMContentLoaded', async () => {

  // -------- AUTH GUARD --------
  if (!localStorage.getItem('careerhubLoggedIn')) {
    window.location.href = 'login.html';
    return;
  }

  // -------- THEME TOGGLE --------
  $('#theme-toggle')?.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('theme-dark');
    document.body.classList.toggle('theme-light', !isDark);
    localStorage.setItem('careerhubTheme', isDark ? 'dark' : 'light');
  });

  // -------- MODAL CONTROLS --------
  const modal = $('#job-modal');
  $('#modal-close')?.addEventListener('click', () => modal?.removeAttribute('open'));
  $('#modal-close-2')?.addEventListener('click', () => modal?.removeAttribute('open'));

  // -------- INDEX PAGE --------
  if (
    document.querySelector('.list-area') &&
    !document.querySelector('.applied-list') &&
    !document.querySelector('.responses-list')
  ) {
    try {
      const res = await fetch('jobs.json');
      jobsData = await res.json();

      populateFilters();
      renderJobs(jobsData);
    } catch (e) {
      console.error('jobs.json fetch failed', e);
    }
  }

  // -------- APPLIED PAGE --------
  if (document.querySelector('.applied-list')) {
    renderApplied();
  }

  // -------- RESPONSES PAGE --------
  if (document.querySelector('.responses-list')) {
    renderResponses();
  }

  // -------- SEARCH --------
  $('#search')?.addEventListener('input', () => {
    renderJobs(filteredFromCurrentFilters());
  });

  // -------- FILTERS --------
  $('#filter-location')?.addEventListener('change', applyAllFilters);
  $('#filter-type')?.addEventListener('change', applyAllFilters);
  $('#filter-field')?.addEventListener('change', applyAllFilters);
  $('#filter-salary')?.addEventListener('change', applyAllFilters);
});

// ---------------- FILTER POPULATION ----------------
function populateFilters() {
  const locs = [...new Set(jobsData.map(j => j.location))];
  const types = [...new Set(jobsData.map(j => j.type))];
  const fields = [...new Set(jobsData.map(j => j.field))];

  const addOpts = (id, arr) => {
    const sel = document.getElementById(id);
    if (!sel) return;
    arr.forEach(v => {
      const o = document.createElement('option');
      o.value = v;
      o.textContent = v;
      sel.appendChild(o);
    });
  };

  addOpts('filter-location', locs);
  addOpts('filter-type', types);
  addOpts('filter-field', fields);
}

// ---------------- JOB RENDER ----------------
function renderJobs(list) {
  const area = document.querySelector('.list-area');
  if (!area) return;

  area.innerHTML = '';

  if (!list || list.length === 0) {
    area.innerHTML =
      '<p style="color:var(--muted);padding:18px">No jobs found.</p>';
    return;
  }

  list.forEach(job => {
    const applied = appliedJobs.some(a => a.id === job.id);

    const card = document.createElement('article');
    card.className = 'job-item card';

    card.innerHTML = `
      <div class="title">${job.role}</div>
      <div class="company">${job.company}</div>

      <div class="meta">
        <div class="tag">${job.type}</div>
        <div class="tag">${job.location}</div>
        <div class="tag">${job.salary}</div>
      </div>

      <p>${job.description}</p>

      <button class="btn-apply" ${applied ? 'disabled' : ''}>
        ${applied ? 'Applied' : 'Apply'}
      </button>
    `;

    card.querySelector('.btn-apply')
      .addEventListener('click', () => handleApply(job));

    area.appendChild(card);
  });
}

// ---------------- APPLY JOB (CRITICAL SAFE LOGIC) ----------------
function handleApply(job) {
  if (appliedJobs.some(a => a.id === job.id)) {
    showToast('Already applied');
    return;
  }

  // appliedJobs
  appliedJobs.push(job);
  localStorage.setItem('appliedJobs', JSON.stringify(appliedJobs));

  // responsesJobs (SAFE MERGE)
  let responses =
    JSON.parse(localStorage.getItem('responsesJobs')) || [];

  if (!responses.some(r => r.id === job.id)) {
    responses.push({
      ...job,
      response: 'Pending',
      interview: null
    });
  }

  localStorage.setItem('responsesJobs', JSON.stringify(responses));

  showToast('Applied ✔');
  renderJobs(filteredFromCurrentFilters());
}

// ---------------- FILTER LOGIC ----------------
function filteredFromCurrentFilters() {
  const q = $('#search')?.value.toLowerCase() || '';
  const loc = $('#filter-location')?.value || '';
  const typ = $('#filter-type')?.value || '';
  const fld = $('#filter-field')?.value || '';
  const sal = $('#filter-salary')?.value || '';

  return jobsData.filter(j => {

    if (q && !(
      j.role.toLowerCase().includes(q) ||
      j.company.toLowerCase().includes(q)
    )) return false;

    if (loc && j.location !== loc) return false;
    if (typ && j.type !== typ) return false;
    if (fld && j.field !== fld) return false;

    if (sal) {
      const [min, max] = sal.split('-').map(Number);
      const num = parseInt(j.salary);
      if (num < min || num > max) return false;
    }

    return true;
  });
}

function applyAllFilters() {
  renderJobs(filteredFromCurrentFilters());
}

// ---------------- APPLIED PAGE ----------------
function renderApplied() {
  const area = document.querySelector('.applied-list');
  if (!area) return;

  const applied =
    JSON.parse(localStorage.getItem('appliedJobs')) || [];

  area.innerHTML = '';

  if (applied.length === 0) {
    area.innerHTML =
      '<p style="color:var(--muted);padding:18px">No applied jobs yet.</p>';
    return;
  }

  applied.forEach(job => {
    const card = document.createElement('article');
    card.className = 'job-item card';

    card.innerHTML = `
      <div class="title">${job.role}</div>
      <div class="company">${job.company}</div>

      <div class="meta">
        <div class="tag">${job.type}</div>
        <div class="tag">${job.location}</div>
        <div class="tag">${job.salary}</div>
      </div>

      <p>${job.description}</p>
    `;

    area.appendChild(card);
  });
}

// ---------------- RESPONSES PAGE ----------------
// ---------------- RESPONSES PAGE ----------------
function renderResponses() {
  const area = document.querySelector('.responses-list');
  if (!area) return;

  const responses =
    JSON.parse(localStorage.getItem('responsesJobs')) || [];

  area.innerHTML = '';

  if (responses.length === 0) {
    area.innerHTML =
      '<p style="color:var(--muted);padding:18px">No responses yet.</p>';
    return;
  }

  responses.forEach(job => {

    let interviewHTML = '';

    if (job.response === 'Interview' && job.interview) {
      interviewHTML = `
        <div style="margin-top:10px;font-size:13px;color:var(--muted)">
          <div><strong>Mode:</strong> ${job.interview.mode || '-'}</div>
          <div><strong>Date:</strong> ${job.interview.date || '-'}</div>
          <div><strong>Location:</strong> ${job.interview.location || '-'}</div>
          ${job.interview.note
            ? `<div><strong>Note:</strong> ${job.interview.note}</div>`
            : ''}
        </div>
      `;
    }

    const card = document.createElement('article');
    card.className = 'job-item card';

    card.innerHTML = `
      <div style="display:flex;justify-content:space-between">
        <div>
          <div class="title">${job.role}</div>
          <div class="company">${job.company}</div>
        </div>
        <div style="font-weight:700">
          ${job.response || 'Pending'}
        </div>
      </div>

      ${interviewHTML}
    `;

    area.appendChild(card);
  });
}
