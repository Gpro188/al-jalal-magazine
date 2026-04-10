# 📚 School Magazine App - Complete Feature Documentation

## Table of Contents
1. [Core Features](#core-features)
2. [User Roles & Permissions](#user-roles--permissions)
3. [Editorial Workflow](#editorial-workflow)
4. [Technical Features](#technical-features)
5. [User Guide](#user-guide)
6. [Administrator Guide](#administrator-guide)

---

## 🎯 Core Features

### 1. Shared Login System
- **Single Sign-On** for all users (students, staff, admins)
- **Role-Based Access Control** (RBAC)
- Secure session management via Firebase Authentication
- Email/Password authentication
- Automatic session persistence

### 2. Frontend Submission Form
Students can submit articles without accessing WordPress admin!

**Form Fields:**
- ✅ Student Name (required)
- ✅ Article Title (required, min 5 characters)
- ✅ Content (required, min 100 characters)
- ✅ Class Union Category (dropdown selection)
- ✅ Academic Year (dropdown: current + next year)

**Features:**
- Real-time validation
- Auto-save as "Pending Review"
- Success confirmation message
- Redirect to student dashboard after submission

### 3. Multi-Stage Editorial Workflow

#### Stage 1: Student Submission
- Status: **Pending Review**
- Visible to: Editors and Admins
- Editable by: Student (until reviewed)

#### Stage 2: Editor Review
- Editors read and review submissions
- Can add rejection comments
- Can approve to "Staff Approved" status
- Cannot publish directly

#### Stage 3: Admin Publication
- Add featured images
- Final quality check
- Publish to live site
- Manage categories and archives

### 4. Premium Magazine Layout

#### Homepage Features:
- **Hero Section** with call-to-action
- **Featured Slider** showcasing top articles
- **Latest Articles Grid** in magazine style
- **Category Browse** by Class Union
- Responsive design for mobile/tablet/desktop

#### Design Elements:
- Professional typography (Inter + Playfair Display)
- Red gradient theme (customizable)
- Card-based article previews
- Hover effects and animations
- Featured image support

### 5. Permanent Archive System

#### Category Structure:
```
Class Unions (Parent)
├── Alpha Union
│   ├── 2024-2025
│   └── 2025-2026
├── Beta Union
│   ├── 2024-2025
│   └── 2025-2026
└── Gamma Union
    ├── 2024-2025
    └── 2025-2026
```

**Benefits:**
- ✅ Work preserved indefinitely
- ✅ Searchable by union name
- ✅ Year-based organization
- ✅ Easy navigation for alumni

### 6. Content Moderation

#### Built-in Safeguards:
- All submissions require approval
- No public posting without review
- Editor comments on rejections
- Admin final approval required

#### Optional Integration:
- Block Bad Words plugin compatibility
- Profanity filtering
- Inappropriate content detection

---

## 👥 User Roles & Permissions

### Contributor (Students)

**Can:**
- ✅ Create account and login
- ✅ Submit articles via frontend form
- ✅ View own submissions
- ✅ Track submission status
- ✅ Edit pending submissions

**Cannot:**
- ❌ Publish articles
- ❌ Approve submissions
- ❌ Access editor dashboard
- ❌ Upload featured images
- ❌ Change post status

---

### Editor (Staff/Teachers)

**Can:**
- ✅ Everything Contributors can do
- ✅ Access Editor Dashboard
- ✅ View all pending submissions
- ✅ Read full articles
- ✅ Add review comments
- ✅ Approve to "Staff Approved"
- ✅ Reject with feedback

**Cannot:**
- ❌ Publish to live site
- ❌ Upload featured images
- ❌ Manage user roles
- ❌ Delete categories

---

### Administrator

**Can:**
- ✅ Everything Editors can do
- ✅ Access Admin Dashboard
- ✅ View staff-approved posts
- ✅ Upload featured images
- ✅ Publish to live site
- ✅ Manage categories
- ✅ Create/edit/delete users
- ✅ Configure site settings
- ✅ Moderate all content

**Cannot:**
- ❌ Change system code (without developer access)

---

## 🔄 Editorial Workflow

### Visual Flow Diagram

```
Student Writes Article
        ↓
  Submit via Form
        ↓
  [Pending Review] ←───────┐
        ↓                   │
   Editor Reviews           │
     ↙       ↘              │
Approve    Reject          │
   ↓          ↓             │
[Staff     [Rejected] ─────┘
Approved]      │
   ↓           └── Student can edit & resubmit
Admin Review
        ↓
Add Featured Image
        ↓
  [Published]
        ↓
Live on Homepage
```

### Status Definitions

| Status | Who Sets It | What It Means |
|--------|-------------|---------------|
| **Pending Review** | Student (auto) | Awaiting editor review |
| **Staff Approved** | Editor | Ready for admin publication |
| **Rejected** | Editor | Needs revisions, return to student |
| **Published** | Admin | Live on website |

---

## 💻 Technical Features

### Frontend Technologies
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **React Hook Form** - Form management
- **Context API** - State management

### Backend Services
- **Firebase Authentication** - User management
- **Firestore Database** - NoSQL database
- **Firebase Storage** - Image hosting
- **Security Rules** - Role-based data access

### Performance Optimizations
- Static Site Generation (SSG)
- Client-side rendering for dashboards
- Image optimization via Next.js Image
- Lazy loading for faster page loads

### Security Features
- Firestore Security Rules
- Input validation
- XSS protection
- CSRF protection
- Role verification on all operations

---

## 📖 User Guide

### For Students (Contributors)

#### How to Submit an Article

1. **Login** at `/login`
   - Use your school email
   - Enter provided password

2. **Navigate to Submit** 
   - Click "Submit Article" in navbar
   - Or go to `/submit`

3. **Fill Out Form**
   - Enter your name
   - Write catchy title
   - Select your Class Union
   - Choose academic year
   - Write your article (min 100 chars)

4. **Review & Submit**
   - Check for errors
   - Read preview
   - Click "Submit Article"

5. **Track Status**
   - Go to "My Submissions" dashboard
   - See status: Pending/Approved/Rejected
   - Read editor feedback if rejected

#### Tips for Acceptance
- ✅ Write clearly and concisely
- ✅ Check spelling and grammar
- ✅ Stay on topic
- ✅ Avoid inappropriate content
- ✅ Meet minimum word count
- ✅ Choose correct category

---

### For Editors (Staff)

#### How to Review Submissions

1. **Access Dashboard**
   - Login as editor
   - Go to `/dashboard/editor`

2. **Review Pending Articles**
   - Click on any submission
   - Read full content
   - Check category assignment

3. **Make Decision**
   
   **To Approve:**
   - Click "Approve" button
   - Article moves to "Staff Approved"
   - Admin will publish

   **To Reject:**
   - Click "Request Changes"
   - Add specific feedback
   - Explain what needs fixing
   - Student can resubmit

4. **Track Approved Articles**
   - Monitor which get published
   - Follow up with students

#### Best Practices
- ⏱️ Review within 48 hours
- 💬 Provide constructive feedback
- ✅ Be encouraging to students
- 📝 Check for originality
- 🔍 Verify facts if needed

---

## 🔧 Administrator Guide

### Initial Setup

#### 1. Configure Firebase
- Create Firebase project
- Enable Auth, Firestore, Storage
- Deploy security rules
- Get credentials

#### 2. Create User Accounts

**Via Firebase Console:**
1. Authentication → Users → Add User
2. Create accounts for all roles
3. Note the User UID

**Add to Firestore:**
1. Firestore → users collection
2. Document ID = User UID
3. Add role field

Example:
```json
{
  "email": "admin@school.edu",
  "role": "admin",
  "displayName": "Admin Name",
  "createdAt": "2026-04-01"
}
```

#### 3. Customize Categories
Edit `app/submit/page.tsx`:
```typescript
const classUnions = [
  'Your Union 1',
  'Your Union 2',
  'Your Union 3',
];
```

#### 4. Deploy to Production
- Push to GitHub
- Deploy on Vercel
- Add environment variables
- Test workflow end-to-end

---

### Ongoing Management

#### Content Moderation
- Monitor published articles
- Review flagged content
- Update category structure yearly
- Archive old submissions

#### User Management
- Create new student accounts
- Update staff roles
- Deactivate graduated students
- Reset forgotten passwords

#### Analytics & Monitoring
- Track submission volume
- Monitor popular articles
- Check storage usage
- Review error logs

#### Yearly Maintenance
- Add new academic year category
- Archive previous year
- Update class union list
- Clean up spam/test submissions

---

## 📊 Dashboard Features

### Contributor Dashboard
- List of all submissions
- Status indicators (color-coded)
- Editor feedback display
- Quick submit new article
- Edit pending submissions

### Editor Dashboard
- Pending review queue
- Filter by category/year
- Batch actions (approve/reject)
- Comment interface
- Submission history

### Admin Dashboard
- Staff-approved queue
- Featured image uploader
- Publish button
- Category management
- User management tools

---

## 🎨 Customization Options

### Branding
- **Logo**: Replace text logo in Navbar component
- **Colors**: Edit `tailwind.config.js`
- **Fonts**: Modify Google Fonts in layout.tsx
- **Tagline**: Update homepage hero section

### Functionality
- **Categories**: Add/remove class unions
- **Form Fields**: Extend submission form
- **Workflow Stages**: Add custom statuses
- **Email Notifications**: Integrate SendGrid

### Design
- **Layout**: Modify grid structures
- **Components**: Swap Tailwind classes
- **Theme**: Change color scheme
- **Typography**: Adjust font families

---

## 🆘 Support & Resources

### Documentation
- README.md - Project overview
- QUICKSTART.md - 5-minute setup
- DEPLOYMENT_GUIDE.md - Full deployment
- FEATURES.md (this file) - Feature reference

### External Resources
- [Next.js Docs](https://nextjs.org/docs)
- [Firebase Docs](https://firebase.google.com/docs)
- [Tailwind Docs](https://tailwindcss.com/docs)
- [React Hook Form Docs](https://react-hook-form.com)

### Community Support
- GitHub Issues (for bugs)
- Stack Overflow (for questions)
- Discord communities (Next.js, Firebase)

---

## 🎉 Success Metrics

Track these to measure platform success:
- 📈 Number of active contributors
- 📝 Articles submitted per month
- ⏱️ Average review time
- ✅ Approval rate
- 👁️ Page views per article
- 🔄 Return submission rate
- 💬 Student engagement scores

---

**Built with ❤️ for Student Voices Everywhere**
