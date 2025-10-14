// Simple, robust app.js for the new look.
// Assumes jobs.json present and each job already has a unique `id`.

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

// DOM ready
document.addEventListener('DOMContentLoaded', async () => {

  console.log("1")
  // theme
  const themeToggle = $('#theme-toggle');
  themeToggle?.addEventListener('click', ()=> {
    
  console.log("22")
    document.body.classList.toggle('theme-light');
    document.body.classList.toggle('theme-dark');
  });

  // nav
  $('#home-page-btn')?.addEventListener('click', ()=> location.href='index.html');
  $('#applied-page-btn')?.addEventListener('click', ()=> location.href='applied.html');
  $('#responses-page-btn')?.addEventListener('click', ()=> location.href='responses.html');

  // modal controls
  const modal = $('#job-modal');
  const modalContent = $('#modal-content');
  const modalClose = $('#modal-close');
  const modalClose2 = $('#modal-close-2');
  modalClose?.addEventListener('click', ()=> modal.removeAttribute('open'));
  modalClose2?.addEventListener('click', ()=> modal.removeAttribute('open'));

  // fetch only if index has list-area
  if(document.querySelector('.list-area') && !document.querySelector('.applied-list') && !document.querySelector('.responses-list')) {
    try {
      const res = await fetch('jobs.json');
      jobsData = await res.json();
      populateFilters();
      renderJobs(jobsData);
    } catch (e) {
      console.error('jobs.json fetch failed', e);
    }
  }

  // If page has applied-list, render from localStorage
  if(document.querySelector('.applied-list')) {
    renderApplied();
  }

  // If page has responses-list, render from localStorage
  if(document.querySelector('.responses-list')) {
    renderResponses();
  }

  // search filter bind
  $('#search')?.addEventListener('input', (e)=> {
    const q = e.target.value.toLowerCase();
    const filtered = jobsData.filter(j => j.role.toLowerCase().includes(q) || j.company.toLowerCase().includes(q));
    renderJobs(filtered);
  });

  // filter selects
  $('#filter-location')?.addEventListener('change', applyAllFilters);
  $('#filter-type')?.addEventListener('change', applyAllFilters);
  $('#filter-field')?.addEventListener('change', applyAllFilters);
  $('#filter-salary')?.addEventListener('change', applyAllFilters);

}); // DOMContentLoaded end

// ---------- populate filters ----------
function populateFilters(){
  const locs = [...new Set(jobsData.map(j=>j.location))].sort();
  const types = [...new Set(jobsData.map(j=>j.type))].sort();
  const fields = [...new Set(jobsData.map(j=>j.field))].sort();

  const addOpts = (selId, arr) => {
    const sel = document.getElementById(selId); if(!sel) return;
    arr.forEach(v => {
      const o = document.createElement('option'); o.value = v; o.textContent = v; sel.appendChild(o);
    });
  };
  addOpts('filter-location', locs);
  addOpts('filter-type', types);
  addOpts('filter-field', fields);
}

// ---------- render job cards (index) ----------
function renderJobs(list){
  const area = document.querySelector('.list-area');
  if(!area) return;
  area.innerHTML = '';
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
        <div class="tag">${job.field}</div>
        <div class="tag">${job.salary}</div>
      </div>
      <p>${job.description}</p>
      <div style="display:flex;gap:10px;margin-top:12px;align-items:center">
        <button class="btn-apply" ${applied ? 'disabled':''}>${applied ? 'Applied':'Apply'}</button>
        <button class="ghost-btn view-details">Details</button>
      </div>
    `;
    // open modal on Details
    card.querySelector('.view-details')?.addEventListener('click', ()=> openModal(job));
    card.querySelector('.btn-apply')?.addEventListener('click', ()=> handleApply(job));
    area.appendChild(card);
  });
}

// ---------- open modal ----------
function openModal(job){
  const modal = $('#job-modal'); if(!modal) return;
  const c = $('#modal-content'); if(!c) return;
  c.innerHTML = `
    <h3 style="margin:0 0 8px">${job.role} <span style="font-weight:600;color:var(--muted);font-size:13px"> — ${job.company}</span></h3>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin:8px 0">
      <div class="tag">${job.type}</div>
      <div class="tag">${job.location}</div>
      <div class="tag">${job.field}</div>
      <div class="tag">${job.salary}</div>
    </div>
    <p style="color:var(--muted);line-height:1.5">${job.description}</p>
  `;
  $('#modal-apply')?.replaceWith(createApplyButton(job));
  modal.setAttribute('open','');
}

// create apply button in modal (keeps event)
function createApplyButton(job){
  const btn = document.createElement('button');
  btn.id = 'modal-apply';
  btn.className = 'primary-btn';
  btn.textContent = appliedJobs.some(a=>a.id===job.id) ? 'Applied' : 'Apply';
  if(appliedJobs.some(a=>a.id===job.id)) btn.disabled = true;
  btn.addEventListener('click', ()=> handleApply(job));
  return btn;
}

// ---------- apply handler ----------
function handleApply(job){
  // require job.id present in jobs.json
  if(!job.id){
    showToast('This job is not valid (missing id).'); return;
  }
  if(appliedJobs.some(a => a.id === job.id)){
    showToast('Already applied'); return;
  }
  appliedJobs.push(job);
  localStorage.setItem('appliedJobs', JSON.stringify(appliedJobs));
  showToast('Applied ✔');
  // update responses (simulate)
  setTimeout(()=> {
    const resp = {...job, response: Math.random()>0.5 ? 'Interview' : 'Pending'};
    responsesJobs.push(resp);
    localStorage.setItem('responsesJobs', JSON.stringify(responsesJobs));
  }, 1000);
  // re-render index list if present
  if(document.querySelector('.list-area')) {
    const qL = document.querySelectorAll('.btn-apply');
    // small delay to allow UI update
    setTimeout(()=> {
      applyUIRefresh(job.id);
    }, 120);
  }
}

// mark applied buttons disabled in UI
function applyUIRefresh(id){
  $$('.job-item.card').forEach(card => {
    const title = card.querySelector('.title')?.textContent || '';
    // find job in jobsData matching title and company maybe? safer to refresh full list
  });
  // easiest: re-render filtered list
  renderJobs(filteredFromCurrentFilters());
}

// get current filters and filter jobsData
function filteredFromCurrentFilters(){
  const loc = $('#filter-location')?.value || '';
  const typ = $('#filter-type')?.value || '';
  const fld = $('#filter-field')?.value || '';
  const sal = $('#filter-salary')?.value || '';
  const q = $('#search')?.value?.toLowerCase() || '';

  return jobsData.filter(j => {
    if(loc && j.location !== loc) return false;
    if(typ && j.type !== typ) return false;
    if(fld && j.field !== fld) return false;
    if(sal){
      const [min,max] = sal.split('-').map(Number);
      const salNum = Number(String(j.salary).replace(/[^\d]/g,''));
      if(salNum < min || salNum > max) return false;
    }
    if(q && !(String(j.role).toLowerCase().includes(q) || String(j.company).toLowerCase().includes(q))) return false;
    return true;
  });
}

// ---------- apply page render ----------
function renderApplied(){
  const area = document.querySelector('.applied-list');
  if(!area) return;
  appliedJobs = JSON.parse(localStorage.getItem('appliedJobs')) || [];
  area.innerHTML = '';
  if(appliedJobs.length === 0){
    area.innerHTML = '<p style="color:var(--muted);padding:18px">No applied roles yet.</p>'; return;
  }
  appliedJobs.forEach(job => {
    const card = document.createElement('article');
    card.className = 'job-item card';
    card.innerHTML = `
      <div class="title">${job.role}</div>
      <div class="company">${job.company}</div>
      <div class="meta">
        <div class="tag">${job.type}</div>
        <div class="tag">${job.location}</div>
        <div class="tag">${job.field}</div>
        <div class="tag">${job.salary}</div>
      </div>
      <p style="color:var(--muted)">${job.description}</p>
    `;
    // allow clicking to open modal with same UI
    card.addEventListener('click', ()=> openModal(job));
    area.appendChild(card);
  });
}

// ---------- responses render ----------
function renderResponses(){
  const area = document.querySelector('.responses-list');
  if(!area) return;
  responsesJobs = JSON.parse(localStorage.getItem('responsesJobs')) || [];
  appliedJobs = JSON.parse(localStorage.getItem('appliedJobs')) || [];
  area.innerHTML = '';
  // only show responses for which user had applied (safety)
  const valid = responsesJobs.filter(r => appliedJobs.some(a=>a.id===r.id));
  if(valid.length === 0){
    area.innerHTML = '<p style="color:var(--muted);padding:18px">No responses yet.</p>'; return;
  }
  valid.forEach(job => {
    const card = document.createElement('article');
    card.className = 'job-item card';
    card.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <div class="title">${job.role}</div>
          <div class="company" style="font-size:13px;color:var(--muted)">${job.company}</div>
        </div>
        <div style="text-align:right">
          <div style="font-weight:700;color:${job.response==='Interview'?'#0b6b4a':'#b45309'}">${job.response}</div>
          <div style="font-size:12px;color:var(--muted);margin-top:6px">Updated just now</div>
        </div>
      </div>
    `;
    card.addEventListener('click', ()=> openModal(job));
    area.appendChild(card);
  });
}
