if (!localStorage.getItem('careerhubLoggedIn')) {
  window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', () => {
  const storedUser = JSON.parse(localStorage.getItem('careerhubUser')) || {};
  const storedProfile = JSON.parse(localStorage.getItem('careerhubProfile')) || {};

  const profile = {
  name: storedProfile.name || storedUser.username || '',
  email: storedProfile.email || storedUser.email || '',
  birthdate: storedProfile.birthdate || '',
  education: storedProfile.education || '',
  skills: storedProfile.skills || '',
  bio: storedProfile.bio || '',
  photo: storedProfile.photo || '',
  resume: storedProfile.resume || null
};


  const nameEl = document.getElementById('fullName');
  const emailEl = document.getElementById('email');
  const birthEl = document.getElementById('birthdate');
  const eduEl = document.getElementById('education');
  const skillEl = document.getElementById('skills');
  const bioEl = document.getElementById('bio');
  const photoEl = document.getElementById('photoPreview');
  const uploadEl = document.getElementById('profilePhoto');
  const editBtn = document.getElementById('edit-photo-btn');
  const saveBtn = document.getElementById('saveProfile');
  const card = document.querySelector('.profile-card');
  const resumeInput = document.getElementById('resumeUpload');
  const uploadResumeBtn = document.getElementById('upload-resume-btn');
  const resumeNameEl = document.getElementById('resume-name');
  const viewResumeEl = document.getElementById('view-resume');


  nameEl.value = profile.name;
  emailEl.value = profile.email;
  birthEl.value = profile.birthdate;
  eduEl.value = profile.education;
  skillEl.value = profile.skills;
  bioEl.value = profile.bio;
  if (profile.photo) photoEl.src = profile.photo;

  if (profile.resume) {
  resumeNameEl.textContent = profile.resume.name;
  viewResumeEl.style.display = 'inline-block';

  viewResumeEl.onclick = (e) => {
    e.preventDefault();
    openResume(profile.resume.data, profile.resume.name);
  };
}


function openResume(base64Data, fileName) {
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


uploadResumeBtn.addEventListener('click', () => {
  resumeInput.click();
});

resumeInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const resumeData = {
      name: file.name,
      data: reader.result
    };

    profile.resume = resumeData;
    localStorage.setItem('careerhubProfile', JSON.stringify(profile));

    resumeNameEl.textContent = file.name;
    viewResumeEl.addEventListener('click', (e) => {
  e.preventDefault();
  openResume(profile.resume.data, profile.resume.name);
});

    resumeNameEl.classList.add('field-glow');
    setTimeout(() => resumeNameEl.classList.remove('field-glow'), 1200);
  };

  reader.readAsDataURL(file);
});

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

  [nameEl, emailEl, birthEl, eduEl, skillEl, bioEl].forEach((field) => {
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
      birthdate: birthEl.value,
      education: eduEl.value.trim(),
      skills: skillEl.value.trim(),
      bio: bioEl.value.trim(),
      photo: photoEl.src,
      resume: profile.resume
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

