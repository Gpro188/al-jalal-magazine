# 🚀 Quick Start Guide - School Magazine App

## Get Started in 5 Minutes!

### Step 1: Install Dependencies (2 minutes)
```bash
npm install
```

### Step 2: Setup Firebase (1 minute)
1. Go to https://console.firebase.google.com/
2. Create a new project
3. Enable Authentication (Email/Password)
4. Enable Firestore Database
5. Enable Storage
6. Copy your Firebase config

### Step 3: Configure Environment (1 minute)
```bash
# Copy example file
copy .env.example .env.local

# Edit .env.local with your Firebase credentials
```

### Step 4: Run Development Server (30 seconds)
```bash
npm run dev
```

Open http://localhost:3000

---

## Deploy to Production (Free!)

### Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
# Create repo on github.com, then:
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### Deploy on Vercel
1. Go to https://vercel.com
2. Import your GitHub repository
3. Add environment variables from `.env.local`
4. Click Deploy!

**That's it!** Your site is live! 🎉

---

## Create Test Users

### In Firebase Console → Authentication:
1. Click "Add user"
2. Create these accounts:

**Admin:**
- Email: `admin@school.edu`
- Password: `Admin123!`

**Editor:**
- Email: `editor@school.edu`  
- Password: `Editor123!`

**Student:**
- Email: `student@school.edu`
- Password: `Student123!`

### In Firebase Console → Firestore Database:
1. Create collection: `users`
2. Add documents with user UIDs:

```json
{
  "email": "admin@school.edu",
  "role": "admin",
  "displayName": "Admin User",
  "createdAt": "April 1, 2026"
}
```

Repeat for each user with their respective roles.

---

## Test the Full Workflow

1. **Login as Student** → Submit article
2. **Login as Editor** → Approve article  
3. **Login as Admin** → Publish article
4. **Visit Homepage** → See published article!

---

## Common Commands

```bash
# Development
npm run dev          # Start dev server

# Build & Deploy
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
```

---

## Project Structure

```
school-magazine-app/
├── app/                    # Next.js pages
│   ├── page.tsx           # Homepage
│   ├── submit/page.tsx    # Submission form
│   ├── login/page.tsx     # Login page
│   └── dashboard/         # User dashboards
├── components/            # React components
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   └── FeaturedSlider.tsx
├── context/              # React Context
│   └── AuthContext.tsx   # Authentication
├── lib/                  # Utilities
│   ├── firebaseConfig.js # Firebase setup
│   ├── auth.ts          # Auth helpers
│   └── firestore.ts     # Database functions
├── firestore.rules       # Security rules
└── storage.rules         # Storage rules
```

---

## Need Help?

📖 **Full Documentation**: See `DEPLOYMENT_GUIDE.md`
🔥 **Firebase Docs**: https://firebase.google.com/docs
⚡ **Next.js Docs**: https://nextjs.org/docs
🎨 **Tailwind Docs**: https://tailwindcss.com/docs

---

## Features ✨

✅ **Shared Login System** - Firebase Authentication
✅ **Frontend Submission Form** - Easy for students
✅ **Editorial Workflow** - Pending → Approved → Published
✅ **Role-Based Access** - Contributor, Editor, Admin
✅ **Premium Design** - Tailwind CSS magazine layout
✅ **Featured Slider** - Highlight best articles
✅ **Permanent Archive** - Organized by Class Union + Year
✅ **Mobile Responsive** - Works on all devices
✅ **FREE Hosting** - Vercel + Firebase free tier

---

**Happy Publishing! 📚**
