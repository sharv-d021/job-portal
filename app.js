// ---------------- GLOBAL VARS ----------------
let jobsData = [];
let appliedJobs = JSON.parse(localStorage.getItem('appliedJobs')) || [];
let responsesJobs = JSON.parse(localStorage.getItem('responsesJobs')) || [];
let favoriteJobs = JSON.parse(localStorage.getItem('favoriteJobs')) || [];
let savedSearches = JSON.parse(localStorage.getItem('savedSearches')) || [];

// ---------------- HELPERS ----------------
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

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
      const jsonJobs = await res.json();
      
      // Merge with admin-added jobs from localStorage
      const adminJobs = JSON.parse(localStorage.getItem('careerhubAllJobs')) || [];
      jobsData = [...jsonJobs, ...adminJobs];

      populateFilters();
      renderJobs(jobsData);
      renderRecommendations();
    } catch (e) {
      console.error('jobs.json fetch failed', e);
      // Fallback to localStorage only
      jobsData = JSON.parse(localStorage.getItem('careerhubAllJobs')) || [];
      populateFilters();
      renderJobs(jobsData);
      renderRecommendations();
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
  $('#filter-experience')?.addEventListener('change', applyAllFilters);

  // -------- FILTER ACTIONS --------
  $('#clear-filters')?.addEventListener('click', clearAllFilters);
  $('#save-search')?.addEventListener('click', saveCurrentSearch);

  // -------- SEARCH SUGGESTIONS --------
  const searchInput = $('#search');
  const suggestionsContainer = $('#search-suggestions');
  
  searchInput?.addEventListener('input', debounce(() => {
    const query = searchInput.value.toLowerCase();
    if (query.length > 1) {
      showSearchSuggestions(query);
    } else {
      hideSearchSuggestions();
    }
  }, 300));

  // -------- FAVORITES PAGE --------
  if (document.querySelector('.favorites-list')) {
    renderFavorites();
  }

  // -------- DASHBOARD PAGE --------
  if (document.querySelector('.dashboard-stats')) {
    renderDashboard();
  }
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
    const favorited = favoriteJobs.some(f => f.id === job.id);

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

      <div class="job-actions">
        <button class="btn-apply" ${applied ? 'disabled' : ''}>
          ${applied ? 'Applied' : 'Apply'}
        </button>
        <button class="btn-favorite" onclick="toggleFavorite(${job.id})">
          ${favorited ? '⭐' : '☆'}
        </button>
      </div>
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
  const exp = $('#filter-experience')?.value || '';

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
      const num = parseInt(j.salary.replace(/[^\d]/g, ''));
      if (num < min || num > max) return false;
    }

    if (exp) {
      // Simple experience level mapping based on salary
      const salaryNum = parseInt(j.salary.replace(/[^\d]/g, ''));
      if (exp === 'entry' && salaryNum > 40000) return false;
      if (exp === 'mid' && (salaryNum < 25000 || salaryNum > 70000)) return false;
      if (exp === 'senior' && salaryNum < 50000) return false;
      if (exp === 'lead' && salaryNum < 60000) return false;
    }

    return true;
  });
}

function applyAllFilters() {
  renderJobs(filteredFromCurrentFilters());
}

// ---------------- NEW ENHANCEMENT FUNCTIONS ----------------

function clearAllFilters() {
  $('#search').value = '';
  $('#filter-location').value = '';
  $('#filter-type').value = '';
  $('#filter-field').value = '';
  $('#filter-salary').value = '';
  $('#filter-experience').value = '';
  renderJobs(jobsData);
  showToast('Filters cleared');
}

function saveCurrentSearch() {
  const currentFilters = {
    search: $('#search')?.value || '',
    location: $('#filter-location')?.value || '',
    type: $('#filter-type')?.value || '',
    field: $('#filter-field')?.value || '',
    salary: $('#filter-salary')?.value || '',
    experience: $('#filter-experience')?.value || '',
    timestamp: new Date().toISOString()
  };
  
  savedSearches.push(currentFilters);
  localStorage.setItem('savedSearches', JSON.stringify(savedSearches));
  showToast('Search saved successfully');
}

function showSearchSuggestions(query) {
  const suggestionsContainer = $('#search-suggestions');
  if (!suggestionsContainer) return;
  
  const suggestions = jobsData
    .filter(job => 
      job.role.toLowerCase().includes(query) || 
      job.company.toLowerCase().includes(query)
    )
    .slice(0, 5);
  
  if (suggestions.length === 0) {
    hideSearchSuggestions();
    return;
  }
  
  suggestionsContainer.innerHTML = suggestions.map(job => 
    `<div class="suggestion-item" onclick="selectSuggestion('${job.role}', '${job.company}')">
      <strong>${job.role}</strong> at ${job.company}
    </div>`
  ).join('');
  
  suggestionsContainer.style.display = 'block';
}

function hideSearchSuggestions() {
  const suggestionsContainer = $('#search-suggestions');
  if (suggestionsContainer) {
    suggestionsContainer.style.display = 'none';
  }
}

function selectSuggestion(role, company) {
  $('#search').value = role;
  hideSearchSuggestions();
  renderJobs(filteredFromCurrentFilters());
}

function toggleFavorite(jobId) {
  const job = jobsData.find(j => j.id === jobId);
  if (!job) return;
  
  const index = favoriteJobs.findIndex(f => f.id === jobId);
  if (index > -1) {
    favoriteJobs.splice(index, 1);
    showToast('Removed from favorites');
  } else {
    favoriteJobs.push(job);
    showToast('Added to favorites');
  }
  
  localStorage.setItem('favoriteJobs', JSON.stringify(favoriteJobs));
  renderJobs(filteredFromCurrentFilters());
}

function renderFavorites() {
  const area = document.querySelector('.favorites-list');
  if (!area) return;

  area.innerHTML = '';

  if (favoriteJobs.length === 0) {
    area.innerHTML = '<p style="color:var(--muted);padding:18px">No favorite jobs yet.</p>';
    return;
  }

  favoriteJobs.forEach(job => {
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

      <div class="job-actions">
        <button class="btn-apply" ${applied ? 'disabled' : ''}>
          ${applied ? 'Applied' : 'Apply'}
        </button>
        <button class="btn-favorite" onclick="toggleFavorite(${job.id})">
          ⭐
        </button>
      </div>
    `;

    card.querySelector('.btn-apply')
      .addEventListener('click', () => handleApply(job));

    area.appendChild(card);
  });
}

function renderRecommendations() {
  const container = document.getElementById('recommended-jobs');
  if (!container) return;
  
  const userProfile = JSON.parse(localStorage.getItem('careerhubProfile')) || {};
  const userField = userProfile.preferredField || '';
  const userLocation = userProfile.preferredLocation || '';
  
  let recommendations = jobsData.filter(job => {
    if (appliedJobs.some(a => a.id === job.id)) return false;
    if (favoriteJobs.some(f => f.id === job.id)) return false;
    
    if (userField && job.field.toLowerCase().includes(userField.toLowerCase())) return true;
    if (userLocation && job.location.toLowerCase().includes(userLocation.toLowerCase())) return true;
    
    return Math.random() < 0.1; // 10% random recommendations
  }).slice(0, 3);
  
  container.innerHTML = recommendations.map(job => `
    <div class="recommendation-card">
      <h4>${job.role}</h4>
      <p>${job.company}</p>
      <span class="tag">${job.location}</span>
      <button onclick="toggleFavorite(${job.id})" class="ghost-btn">⭐ Save</button>
    </div>
  `).join('');
}

// ---------------- DASHBOARD FUNCTIONS ----------------

function renderDashboard() {
  const responses = JSON.parse(localStorage.getItem('responsesJobs')) || [];
  const applied = JSON.parse(localStorage.getItem('appliedJobs')) || [];
  const favorites = JSON.parse(localStorage.getItem('favoriteJobs')) || [];
  
  // Update stats
  document.getElementById('total-applied').textContent = applied.length;
  document.getElementById('favorites-count').textContent = favorites.length;
  
  const pending = responses.filter(r => r.response === 'Pending').length;
  const interviews = responses.filter(r => r.response === 'Interview').length;
  
  document.getElementById('pending-count').textContent = pending;
  document.getElementById('interview-count').textContent = interviews;
  
  // Render status chart
  renderStatusChart(responses);
  
  // Render fields chart
  renderFieldsChart(applied);
  
  // Render recent activity
  renderRecentActivity(applied, responses);
}

function renderStatusChart(responses) {
  const statusCounts = {
    'Pending': responses.filter(r => r.response === 'Pending').length,
    'Interview': responses.filter(r => r.response === 'Interview').length,
    'Rejected': responses.filter(r => r.response === 'Rejected').length
  };
  
  const total = responses.length || 1;
  
  const pendingBar = document.querySelector('.bar.pending');
  const interviewBar = document.querySelector('.bar.interview');
  const rejectedBar = document.querySelector('.bar.rejected');
  
  if (pendingBar) pendingBar.style.width = `${(statusCounts['Pending'] / total) * 100}%`;
  if (interviewBar) interviewBar.style.width = `${(statusCounts['Interview'] / total) * 100}%`;
  if (rejectedBar) rejectedBar.style.width = `${(statusCounts['Rejected'] / total) * 100}%`;
}

function renderFieldsChart(applied) {
  const fieldCounts = {};
  applied.forEach(job => {
    fieldCounts[job.field] = (fieldCounts[job.field] || 0) + 1;
  });
  
  const sortedFields = Object.entries(fieldCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);
  
  const container = document.querySelector('.field-stats');
  if (!container) return;
  
  container.innerHTML = sortedFields.map(([field, count]) => `
    <div class="field-item">
      <span class="field-name">${field}</span>
      <div class="field-bar">
        <div class="bar-fill" style="width: ${(count / applied.length) * 100}%"></div>
      </div>
      <span class="field-count">${count}</span>
    </div>
  `).join('');
}

function renderRecentActivity(applied, responses) {
  const activities = [];
  
  // Add applied jobs
  applied.forEach(job => {
    activities.push({
      type: 'applied',
      role: job.role,
      company: job.company,
      date: new Date().toISOString() // In real app, this would be actual application date
    });
  });
  
  // Add responses
  responses.forEach(job => {
    activities.push({
      type: 'response',
      role: job.role,
      company: job.company,
      response: job.response,
      date: new Date().toISOString() // In real app, this would be actual response date
    });
  });
  
  // Sort by date (newest first) and take last 5
  activities.sort((a, b) => new Date(b.date) - new Date(a.date));
  const recentActivities = activities.slice(0, 5);
  
  const container = document.getElementById('activity-log');
  if (!container) return;
  
  container.innerHTML = recentActivities.map(activity => `
    <div class="activity-item">
      <div class="activity-icon">
        ${activity.type === 'applied' ? '📝' : '📧'}
      </div>
      <div class="activity-content">
        <div class="activity-title">
          ${activity.type === 'applied' ? 'Applied to' : 'Response from'} ${activity.role} at ${activity.company}
        </div>
        <div class="activity-detail">
          ${activity.response ? `Status: ${activity.response}` : 'Application submitted'}
        </div>
        <div class="activity-date">
          ${new Date(activity.date).toLocaleDateString()}
        </div>
      </div>
    </div>
  `).join('');
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
