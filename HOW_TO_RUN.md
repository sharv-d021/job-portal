# CareerHub - How to Run

## Quick Start

### Option 1: Using Python HTTP Server (Recommended)
```bash
python -m http.server 8000
```
Then open: http://localhost:8000

### Option 2: Using Live Server Extension
1. Install "Live Server" extension in VS Code
2. Right-click on `index.html` or `login.html`
3. Select "Open with Live Server"

### Option 3: Direct File Opening
Simply double-click `login.html` to open in your browser
(Note: Some features may not work due to CORS restrictions)

## Login Credentials

### User Account
- Email: `user@example.com`
- Password: `password`

### Admin Account
- Email: `admin@example.com`
- Password: `admin123`

## Features

### For Users:
- Browse and search jobs
- Apply to jobs
- Save favorites
- Track applications
- View dashboard with analytics
- Manage profile

### For Admins:
- Post new jobs
- Edit/delete jobs
- View applications
- Accept/reject applications
- Schedule interviews
- View applicant profiles

## Adding Jobs (Admin)

1. Login with admin credentials
2. Click "Manage Vacancies" in sidebar
3. Fill in the job posting form:
   - Company Name
   - Job Role
   - Job Type (Full-time/Internship/etc.)
   - Location
   - Field/Industry
   - Salary Range
   - Description
4. Click "Post Job"
5. Jobs will appear on the main job portal immediately

## Notes

- Jobs added by admin are stored in localStorage
- Original jobs are in `jobs.json`
- Both sources are merged and displayed to users
- All user data (applications, favorites) is stored in localStorage
