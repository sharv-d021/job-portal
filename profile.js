if (!localStorage.getItem('careerhubLoggedIn')) {
  window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', () => {

  // ---- LOAD PROFILE SAFELY ----
  const storedUser =
    JSON.parse(localStorage.getItem('careerhubUser')) || {};
  let profile =
    JSON.parse(localStorage.getItem('careerhubProfile')) || {
      name: storedUser.username || '',
      email: storedUser.email || '',
      birthdate: '',
      education: '',
      skills: '',
      bio: '',
      photo: '',
      resume: null
    };

  // ---- ELEMENTS ----
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

  // ---- FILL DATA ----
  nameEl.value = profile.name;
  emailEl.value = profile.email;
  birthEl.value = profile.birthdate;
  eduEl.value = profile.education;
  skillEl.value = profile.skills;
  bioEl.value = profile.bio;
  if (profile.photo) photoEl.src = profile.photo;

  // ---- RESUME PREVIEW ----
  if (profile.resume) {
    resumeNameEl.textContent = profile.resume.name;
    viewResumeEl.style.display = 'inline-block';
    viewResumeEl.onclick = (e) => {
      e.preventDefault();
      openResume(profile.resume.data);
    };
  }

  function openResume(base64Data) {
    const byteString = atob(base64Data.split(',')[1]);
    const mimeString = base64Data.split(',')[0].split(':')[1].split(';')[0];

    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    const blob = new Blob([ab], { type: mimeString });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  }

  // ---- UPLOAD RESUME ----
  uploadResumeBtn.addEventListener('click', () => resumeInput.click());

  resumeInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      profile.resume = {
        name: file.name,
        data: reader.result
      };

      localStorage.setItem(
        'careerhubProfile',
        JSON.stringify(profile)
      );

      resumeNameEl.textContent = file.name;
      viewResumeEl.style.display = 'inline-block';
      viewResumeEl.onclick = (e) => {
        e.preventDefault();
        openResume(profile.resume.data);
      };

      resumeNameEl.classList.add('field-glow');
      setTimeout(() =>
        resumeNameEl.classList.remove('field-glow'), 1200);
    };

    reader.readAsDataURL(file);
  });

  // ---- PROFILE PHOTO ----
  editBtn.addEventListener('click', () => uploadEl.click());

  uploadEl.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      profile.photo = reader.result;
      photoEl.src = reader.result;
      localStorage.setItem(
        'careerhubProfile',
        JSON.stringify(profile)
      );
    };
    reader.readAsDataURL(file);
  });

  // ---- SAVE PROFILE ----
  saveBtn.addEventListener('click', () => {
    profile = {
      ...profile,
      name: nameEl.value.trim(),
      email: emailEl.value.trim(),
      birthdate: birthEl.value,
      education: eduEl.value.trim(),
      skills: skillEl.value.trim(),
      bio: bioEl.value.trim()
    };

    localStorage.setItem(
      'careerhubProfile',
      JSON.stringify(profile)
    );

    card.classList.add('profile-pulse');
    saveBtn.textContent = '✅ Saved!';
    setTimeout(() => {
      saveBtn.textContent = 'Save Profile';
      card.classList.remove('profile-pulse');
    }, 1500);
  });
});

// ---- LOGOUT ----
document.getElementById('logout-btn')?.addEventListener('click', (e) => {
  e.preventDefault();
  if (confirm("Are you sure you want to log out?")) {
    localStorage.removeItem('careerhubLoggedIn');
    window.location.href = 'login.html';
  }
});
