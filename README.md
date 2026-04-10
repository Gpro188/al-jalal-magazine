# School Magazine App

A modern Next.js + Firebase web application for school magazine publishing with multi-stage editorial workflow.

## 🚀 Features

- **Shared Login System** - Firebase Authentication with role-based access control
- **Frontend Submission Form** - Easy article submission for students
- **Editorial Workflow** - Multi-stage review process (Pending → Staff Approved → Published)
- **Premium Magazine Layout** - Beautiful Tailwind CSS design
- **Permanent Archive** - Category system with Class Union > Year structure
- **Free Deployment** - Optimized for Vercel + Firebase free tier

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), Tailwind CSS
- **Backend**: Firebase Auth, Firestore Database, Firebase Storage
- **State Management**: React Context API
- **Forms**: React Hook Form
- **Deployment**: Vercel (Free tier)

## 📋 Prerequisites

1. Node.js 18+ installed
2. Firebase account (free)
3. Vercel account (free)
4. Git installed

## 🏗️ Setup Instructions

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Authentication** (Email/Password)
4. Enable **Firestore Database**
5. Enable **Storage**
6. Get your Firebase config from Project Settings

### Step 3: Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Step 4: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
school-magazine-app/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── dashboard/         # User dashboards
│   ├── submit/            # Submission form
│   ├── login/             # Login page
│   └── page.tsx           # Homepage
├── components/            # Reusable components
├── lib/                   # Utilities & Firebase config
├── context/               # React Context providers
└── types/                 # TypeScript types
```

## 👥 User Roles

### Contributor (Students)
- Submit articles via frontend form
- View own submissions
- Status: `pending_review`

### Editor (Staff)
- Review pending submissions
- Add rejection comments
- Approve to `staff_approved`

### Admin
- View staff approved posts
- Add featured images
- Publish to live site

## 🔐 Firestore Security Rules

Deploy these rules in Firebase Console → Firestore → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isContributor() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'contributor';
    }
    
    function isEditor() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'editor';
    }
    
    function isAdmin() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    // Posts collection
    match /posts/{postId} {
      // Anyone can read published posts
      allow read: if true;
      
      // Contributors can create posts
      allow create: if isAuthenticated() && 
                       request.resource.data.status == 'pending_review' &&
                       request.resource.data.authorId == request.auth.uid;
      
      // Only owner can update their own pending posts
      allow update: if (isOwner(resource.data.authorId) && 
                        resource.data.status == 'pending_review' &&
                        request.resource.data.status == 'pending_review') ||
                     (isEditor() && 
                      (request.resource.data.status == 'staff_approved' || 
                       request.resource.data.status == 'rejected'));
      
      // Only admin can publish
      allow update: if isAdmin() && 
                       request.resource.data.status == 'published';
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if false; // Only server-side creation
    }
  }
}
```

## 🚀 Deployment to Vercel

### Method 1: Git Integration (Recommended)

1. Push your code to GitHub/GitLab
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Add environment variables
5. Deploy!

### Method 2: Vercel CLI

```bash
npm install -g vercel
vercel login
vercel
```

Add environment variables in Vercel dashboard:
- Go to Project Settings → Environment Variables
- Add all `NEXT_PUBLIC_FIREBASE_*` variables

## 📊 Database Structure

### Collections

#### `posts`
```typescript
{
  title: string;
  content: string;
  studentName: string;
  category: {
    union: string;      // e.g., "Alpha Union"
    year: string;       // e.g., "2026"
  };
  status: 'pending_review' | 'staff_approved' | 'published' | 'rejected';
  authorId: string;
  rejectionComments?: string;
  featuredImage?: string;  // Firebase Storage URL
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

#### `users`
```typescript
{
  email: string;
  role: 'contributor' | 'editor' | 'admin';
  displayName: string;
  createdAt: timestamp;
}
```

## 🎨 Customization

### Theme Colors
Edit `tailwind.config.js` to change the color scheme.

### Fonts
The app uses Inter and Playfair Display from Google Fonts. Edit `app/layout.tsx` to customize.

## 🆘 Troubleshooting

### Firebase Connection Issues
- Verify environment variables are correct
- Check Firebase console for errors
- Ensure Firestore and Storage are enabled

### Deployment Errors
- Build locally first: `npm run build`
- Check Vercel logs for errors
- Verify all environment variables are set

## 📝 License

MIT License - Feel free to use this for your school!

---

**Built with ❤️ using Next.js + Firebase**
