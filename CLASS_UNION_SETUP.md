# 🦁 Class Union Portal Setup Guide

## Overview

Your School Magazine now has **dedicated portals for each Class Union**! Students login through their Union portal, and articles are automatically categorized.

---

## 🎯 How It Works

### Old System (❌):
- Generic login page
- Students manually select Class Union from dropdown
- Risk of wrong selection

### New System (✅):
- Each Union has its own branded portal (`/login/alpha`, `/login/beta`, etc.)
- Students login with Union-specific credentials
- Articles **automatically tagged** to that Union
- No manual selection needed!

---

## 📁 File Structure

```
app/login/
├── page.tsx              # Default login (generic)
├── alpha/page.tsx        # Alpha Union Portal ✅ CREATED
├── beta/page.tsx         # Beta Union Portal (copy & customize)
├── gamma/page.tsx        # Gamma Union Portal (copy & customize)
└── delta/page.tsx        # Delta Union Portal (copy & customize)
```

---

## 🔧 Step 1: Create Additional Union Portals

I've already created **Alpha Union Portal**. Now create portals for other unions:

### Copy Alpha Portal Template:

1. Copy file: `app/login/alpha/page.tsx`
2. Paste as: `app/login/beta/page.tsx`
3. Edit the file and change:
   - Title: "Beta Union Portal"
   - Color scheme: Change `red-700` to `blue-700`
   - Icon: Change 🦁 to your Beta Union icon
   - Links at bottom remain the same

### Example for Beta Union:

```typescript
// In app/login/beta/page.tsx

<h1 className="font-heading text-3xl font-bold mb-2 text-gray-800">
  Beta Union Portal
</h1>
<p className="text-gray-600">
  Sign in to submit your articles
</p>
<div className="mt-4 inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-semibold text-sm">
  🐯 Beta Union  {/* Change icon */}
</div>

// Change button color to blue
className="bg-blue-700 hover:bg-blue-800"

// Update links at bottom to point to all unions including alpha
<a href="/login/alpha" className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm">
  Alpha Union
</a>
```

Repeat for **Gamma**, **Delta**, and any other unions!

---

## 👥 Step 2: Create User Accounts with Union Assignment

### In Firebase Console:

1. Go to: https://console.firebase.google.com/project/school-magazine-app/authentication/users

2. **Create student accounts for EACH union:**

#### Alpha Union Students:
```
Email: alpha.student1@school.edu
Password: Alpha123!

Email: alpha.student2@school.edu
Password: Alpha123!
```

#### Beta Union Students:
```
Email: beta.student1@school.edu
Password: Beta123!

Email: beta.student2@school.edu
Password: Beta123!
```

(Continue for Gamma, Delta, etc.)

---

### Add Union Assignment to Firestore:

This is the **CRITICAL STEP** that auto-assigns the Union!

1. Go to: https://console.firebase.google.com/project/school-magazine-app/firestore/data

2. Click on `users` collection

3. For **EACH student**, create/update their document:

#### Example for Alpha Student:
- **Document ID:** (Student's Firebase Auth UID)
- **Fields:**
  ```
  email: string → alpha.student1@school.edu
  role: string → contributor
  displayName: string → John Doe
  classUnion: string → Alpha Union  ← THIS IS THE KEY FIELD!
  createdAt: timestamp → today
  ```

#### Example for Beta Student:
- **Document ID:** (Student's UID)
- **Fields:**
  ```
  email: beta.student1@school.edu
  role: contributor
  displayName: Jane Smith
  classUnion: Beta Union  ← Different Union!
  createdAt: today
  ```

---

## 🎨 Step 3: Customize Each Portal (Optional)

Make each Union portal unique!

### Alpha Union (Red Theme):
- Primary color: Red (`red-700`)
- Icon: 🦁 Lion
- Mascot imagery

### Beta Union (Blue Theme):
- Primary color: Blue (`blue-700`)
- Icon: 🐯 Tiger
- Different mascot

### Gamma Union (Green Theme):
- Primary color: Green (`green-700`)
- Icon: 🦅 Eagle
- Unique branding

### Delta Union (Purple Theme):
- Primary color: Purple (`purple-700`)
- Icon: 🐺 Wolf
- Custom colors

To change colors, find and replace in each portal's page.tsx:
- `red-700` → `blue-700`
- `bg-red-100` → `bg-blue-100`
- `text-red-700` → `text-blue-700`

---

## ✅ Step 4: Test the System

### Test Alpha Union Student:

1. Go to: http://localhost:3002/login/alpha
2. Login with: `alpha.student1@school.edu` / `Alpha123!`
3. Click "Submit Article"
4. **Verify:** Class Union field shows "Alpha Union ✓ (Auto-assigned)"
5. Submit an article
6. Check Firestore: Article should have `category.union: "Alpha Union"`

### Test Beta Union Student:

1. Go to: http://localhost:3002/login/beta
2. Login with: `beta.student1@school.edu` / `Beta123!`
3. Submit article
4. **Verify:** Auto-tagged as "Beta Union"

---

## 📊 Benefits of This System

✅ **No Manual Selection** - Union auto-assigned from user profile  
✅ **Branded Experience** - Each Union feels unique  
✅ **Easy Navigation** - Direct links to each portal  
✅ **Organized Database** - Clean categorization  
✅ **Pride & Identity** - Unions can compete healthily  

---

## 🔗 Quick Links

Once all portals are created:

- **Alpha Union:** http://localhost:3002/login/alpha
- **Beta Union:** http://localhost:3002/login/beta
- **Gamma Union:** http://localhost:3002/login/gamma
- **Delta Union:** http://localhost:3002/login/delta
- **Generic Login:** http://localhost:3002/login (for staff/admin)

---

## 🎯 What Students See

When an Alpha Union student logins:

1. They see "Alpha Union Portal" with red theme
2. Login with their Alpha credentials
3. Go to submit form
4. **Class Union field shows:** "Alpha Union ✓ (Auto-assigned)"
5. They only fill: Name, Title, Content, Year
6. Article automatically saved under "Alpha Union" category

---

## 📝 Admin Dashboard View

Editors/Admins can filter by Union:
- "Show me all Alpha Union articles"
- "Show me all Beta Union articles"
- Compare submission rates between unions

---

## 🚀 Next Steps

1. ✅ Create Beta, Gamma, Delta portals (copy Alpha template)
2. ✅ Create student accounts for each union
3. ✅ Add `classUnion` field to each user's Firestore document
4. ✅ Test login and submission flow
5. ✅ Customize colors/icons for each union
6. ✅ Share portal links with students

---

## 💡 Pro Tips

- Use **email patterns** like `alpha.*@school.edu` for easy identification
- Create a **landing page** with all Union portal links
- Add **Union mascots/logos** to each portal page
- Consider **Union-specific categories** within submissions (Sports, Arts, etc.)
- Track **Union competition** - most articles published per month!

---

**Your Class Union system is ready!** 🎉

Start by creating the Beta Union portal (copy Alpha's file and customize).
