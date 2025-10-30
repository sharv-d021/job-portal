if (!localStorage.getItem('careerhubLoggedIn')) {
  window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', () => {
  const storedUser = JSON.parse(localStorage.getItem('careerhubUser')) || {};
  const storedProfile = JSON.parse(localStorage.getItem('careerhubProfile')) || {};

  const profile = {
    name: storedProfile.name || storedUser.username || '',
    email: storedProfile.email || storedUser.email || '',
    education: storedProfile.education || '',
    skills: storedProfile.skills || '',
    bio: storedProfile.bio || '',
    photo: storedProfile.photo || ''
  };

  const nameEl = document.getElementById('fullName');
  const emailEl = document.getElementById('email');
  const eduEl = document.getElementById('education');
  const skillEl = document.getElementById('skills');
  const bioEl = document.getElementById('bio');
  const photoEl = document.getElementById('photoPreview');
  const uploadEl = document.getElementById('profilePhoto');
  const editBtn = document.getElementById('edit-photo-btn');
  const saveBtn = document.getElementById('saveProfile');
  const card = document.querySelector('.profile-card');

  nameEl.value = profile.name;
  emailEl.value = profile.email;
  eduEl.value = profile.education;
  skillEl.value = profile.skills;
  bioEl.value = profile.bio;
  if (profile.photo) photoEl.src = profile.photo;

  editBtn?.addEventListener('click', () => uploadEl.click());

  uploadEl?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      photoEl.src = reader.result;
      photoEl.classList.add('flash-glow');
      setTimeout(() => photoEl.classList.remove('flash-glow'), 1200);
      localStorage.setItem('careerhubProfile', JSON.stringify({ ...profile, photo: reader.result }));
    };
    reader.readAsDataURL(file);
  });

  [nameEl, emailEl, eduEl, skillEl, bioEl].forEach((field) => {
    field.addEventListener('change', () => {
      field.classList.add('field-glow');
      setTimeout(() => field.classList.remove('field-glow'), 1200);
    });
  });

  saveBtn.addEventListener('click', () => {
    const updated = {
      ...profile,
      name: nameEl.value.trim(),
      email: emailEl.value.trim(),
      education: eduEl.value.trim(),
      skills: skillEl.value.trim(),
      bio: bioEl.value.trim(),
      photo: photoEl.src
    };
    localStorage.setItem('careerhubProfile', JSON.stringify(updated));

    card.classList.add('profile-pulse');
    saveBtn.textContent = '✅ Saved!';
    saveBtn.style.background = 'linear-gradient(90deg, #c084fc, #93c5fd)';

    setTimeout(() => {
      saveBtn.textContent = 'Save Profile';
      card.classList.remove('profile-pulse');
    }, 1500);
  });
});


// Logout logic with confirmation
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const confirmLogout = confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      localStorage.removeItem('careerhubLoggedIn');
      window.location.href = 'login.html';
    }
  });
}

