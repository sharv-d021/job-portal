// global vars
let jobsData = [];
let appliedJobs = JSON.parse(localStorage.getItem('appliedJobs')) || [];
let responsesJobs = JSON.parse(localStorage.getItem('responsesJobs')) || [];

// helpers
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));
const showToast = (msg) => {
  const t = $('#toast'); if(!t) return;
  t.textContent = msg; t.classList.add('show');
  setTimeout(()=> t.classList.remove('show'), 1800);
};

// theme
const savedTheme = localStorage.getItem('careerhubTheme');
document.body.classList.add(savedTheme === 'dark' ? 'theme-dark' : 'theme-light');

document.addEventListener('DOMContentLoaded', async () => {

  // theme toggle
  $('#theme-toggle')?.addEventListener('click', () => {
    const body = document.body;
    const isDark = body.classList.toggle('theme-dark');
    body.classList.toggle('theme-light', !isDark);
    localStorage.setItem('careerhubTheme', isDark ? 'dark' : 'light');
  });

  // fetch jobs only on index
  if(document.querySelector('.list-area') &&
     !document.querySelector('.applied-list') &&
     !document.querySelector('.responses-list')) {
    try {
      const res = await fetch('jobs.json');
      jobsData = await res.json();
      populateFilters();
      renderJobs(jobsData);
    } catch (e) {
      console.error(e);
    }
  }

  if(document.querySelector('.applied-list')) renderApplied();
  if(document.querySelector('.responses-list')) renderResponses();
});

// ---------- filters ----------
function populateFilters(){
  const locs = [...new Set(jobsData.map(j=>j.location))];
  const types = [...new Set(jobsData.map(j=>j.type))];
  const fields = [...new Set(jobsData.map(j=>j.field))];
  const add = (id, arr) => {
    const s = document.getElementById(id); if(!s) return;
    arr.forEach(v => {
      const o = document.createElement('option');
      o.value = v; o.textContent = v; s.appendChild(o);
    });
  };
  add('filter-location', locs);
  add('filter-type', types);
  add('filter-field', fields);
}

// ---------- render jobs ----------
function renderJobs(list){
  const area = document.querySelector('.list-area');
  if(!area) return;
  area.innerHTML = '';

  if(!list || list.length === 0){
    area.innerHTML = `<p style="color:var(--muted)">No jobs found.</p>`;
    return;
  }

  list.forEach(job => {
    const applied = appliedJobs.some(a => a.id === job.id);
    const card = document.createElement('article');
    card.className = 'job-item card';
    card.innerHTML = `
      <div class="title">${job.role}</div>
      <div class="company">${job.company}</div>
      <p>${job.description}</p>
      <button class="btn-apply" ${applied?'disabled':''}>
        ${applied?'Applied':'Apply'}
      </button>
    `;
    card.querySelector('.btn-apply')?.addEventListener('click', ()=> handleApply(job));
    area.appendChild(card);
  });
}

// ---------- apply ----------
function handleApply(job){
  if(appliedJobs.some(a => a.id === job.id)){
    showToast('Already applied'); return;
  }

  appliedJobs.push(job);
  localStorage.setItem('appliedJobs', JSON.stringify(appliedJobs));

  // create response entry
  responsesJobs.push({
    ...job,
    response: "Pending",
    interview: null
  });
  localStorage.setItem('responsesJobs', JSON.stringify(responsesJobs));

  showToast('Applied ✔');
}

// ---------- applied page ----------
function renderApplied(){
  const area = document.querySelector('.applied-list');
  if(!area) return;
  appliedJobs = JSON.parse(localStorage.getItem('appliedJobs')) || [];

  if(appliedJobs.length === 0){
    area.innerHTML = '<p style="color:var(--muted)">No applied jobs.</p>';
    return;
  }

  area.innerHTML = '';
  appliedJobs.forEach(job => {
    const card = document.createElement('article');
    card.className = 'job-item card';
    card.innerHTML = `
      <div class="title">${job.role}</div>
      <div class="company">${job.company}</div>
      <p>${job.description}</p>
    `;
    area.appendChild(card);
  });
}

// ---------- responses + interview ----------
function renderResponses(){
  const area = document.querySelector('.responses-list');
  if(!area) return;

  responsesJobs = JSON.parse(localStorage.getItem('responsesJobs')) || [];
  area.innerHTML = '';

  if(responsesJobs.length === 0){
    area.innerHTML = '<p style="color:var(--muted)">No responses yet.</p>';
    return;
  }

  responsesJobs.forEach(job => {
    let interviewHTML = '';

    if(job.response === 'Interview'){
      if(job.interview){
        interviewHTML = `
          <div style="margin-top:10px;padding:10px;border-left:4px solid #0b6b4a">
            <strong>Interview Details</strong><br>
            Mode: ${job.interview.mode}<br>
            Location: ${job.interview.location}<br>
            Date: ${job.interview.date || 'To be informed'}
          </div>
        `;
      } else {
        interviewHTML = `
          <p style="color:#b45309;margin-top:8px">
            Interview details will be shared soon.
          </p>
        `;
      }
    }

    const card = document.createElement('article');
    card.className = 'job-item card';
    card.innerHTML = `
      <div class="title">${job.role}</div>
      <div class="company">${job.company}</div>
      <strong>Status:</strong> ${job.response}
      ${interviewHTML}
    `;
    area.appendChild(card);
  });
}

// ---------- auth guard ----------
if(!localStorage.getItem('careerhubLoggedIn')){
  window.location.href = 'login.html';
}
