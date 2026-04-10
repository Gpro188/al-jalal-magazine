# ⚙️ Admin Management Dashboard - User Guide

## Overview

The **Admin Management Dashboard** allows administrators to easily manage Class Unions and Editor accounts directly from the web interface - **no manual Firestore editing required!**

---

## 🎯 Accessing the Dashboard

### As an Admin:
1. Login with admin credentials
2. Click **"⚙️ Manage"** in the navbar
   OR go to: http://localhost:3002/dashboard/admin/manage

---

## 🏛️ Tab 1: Manage Class Unions

### Create New Class Union

**Fill out the form:**

1. **Union Name** (required)
   - Example: "Alpha Union", "Beta Union"
   
2. **Theme Color**
   - Choose from 6 colors:
     - 🔴 Red
     - 🔵 Blue
     - 🟢 Green
     - 🟣 Purple
     - 🟠 Orange
     - 🩵 Teal

3. **Union Icon/Mascot**
   - Use emoji: 🦁 🐯 🦅 🐺
   - Or short text: "A", "B"
   - This appears on login portals

4. Click **"Create Class Union"**

✅ **Result:** Union is instantly available for:
- Student assignments
- Portal creation
- Article categorization

---

### View Existing Unions

**Right panel shows:**
- All created Class Unions
- Their icons and colors
- Delete button for each

**To delete a Union:**
1. Click **"Delete"** button
2. Confirm deletion
3. ⚠️ Warning: This removes the Union category but keeps student accounts

---

## ✏️ Tab 2: Manage Editors

### Create New Editor Account

**Fill out the form:**

1. **Email Address** (required)
   - Example: `editor@school.edu` or `john.smith@school.edu`

2. **Temporary Password** (required)
   - Minimum 6 characters
   - Editor can change this later

3. **Display Name** (required)
   - Example: "Mr. John Smith", "Ms. Johnson"

4. **Assign to Union** (optional)
   - Leave empty = General Editor (all unions)
   - Select specific union = Union-specific Editor
   - Example: Assign to "Alpha Union" only

5. Click **"Create Editor Account"**

✅ **Result:** 
- Firebase Auth account created
- Firestore user document added
- Editor can immediately login

---

### View Current Editors

**List shows:**
- Editor name and email
- Assigned Union (if any)
- Remove button

**To remove an Editor:**
1. Click **"Remove"** button
2. Confirm deletion
3. Editor access revoked immediately

---

## 📋 Common Tasks

### Task 1: Add a New Class Union

```
1. Go to Manage Dashboard
2. Click "Manage Class Unions" tab
3. Enter: "Delta Union"
4. Select: Purple color
5. Enter icon: 🐺
6. Click "Create"
7. Done! ✅
```

---

### Task 2: Create Editor for Specific Union

```
1. Go to Manage Dashboard
2. Click "Manage Editors" tab
3. Email: alpha.editor@school.edu
4. Password: TempPass123
5. Name: Mr. Anderson
6. Assign to: Alpha Union
7. Click "Create"
8. Done! ✅

Editor can now:
- Login at /login/alpha
- Review ONLY Alpha Union articles
```

---

### Task 3: Create General Editor (All Unions)

```
1. Go to Manage Dashboard
2. Click "Manage Editors" tab
3. Email: chief.editor@school.edu
4. Password: ChiefEdit123
5. Name: Dr. Williams
6. Assign to: [Leave empty - All Unions]
7. Click "Create"
8. Done! ✅

Editor can:
- Review ALL union submissions
- Access general editor dashboard
```

---

## 🔐 Permissions & Access

### Admin Can:
✅ Create/delete Class Unions  
✅ Create/delete Editors  
✅ Assign editors to specific unions  
✅ View all unions and editors  
✅ Manage everything  

### Editor Can:
✅ Review submissions (based on assignment)  
✅ Approve/reject articles  
❌ Cannot create unions  
❌ Cannot manage users  

---

## 💡 Pro Tips

### 1. Naming Conventions

**For Editors:**
- `union.editor@school.edu` - Union-specific
- `editor@school.edu` - General editor
- `chief.editor@school.edu` - Head editor

**For Unions:**
- Use consistent naming: "Alpha Union" not "Alpha" then "ALPHA"
- Keep it school-appropriate

---

### 2. Organization Strategy

**Option A: General Editors**
- Create few editors without union assignment
- They review all submissions from all unions
- Good for small schools

**Option B: Union-Specific Editors**
- Create separate editor for each union
- Each handles their own union's articles
- Good for large schools with many unions

**Option C: Hybrid**
- 1-2 general editors (head staff)
- Union-specific editors (student teachers)
- Best of both worlds

---

### 3. Security Best Practices

- ✅ Use strong temporary passwords
- ✅ Tell editors to change password after first login
- ✅ Remove editors who graduate/leave
- ✅ Regularly review editor list
- ✅ Don't share admin credentials

---

## 🆘 Troubleshooting

### Issue: Can't create Union
**Solution:** Make sure you're logged in as admin

### Issue: Editor can't login
**Solutions:**
- Verify email spelling
- Check password meets requirements (6+ chars)
- Ensure Firestore document was created

### Issue: Editor assigned to wrong Union
**Solution:** 
1. Delete the editor account
2. Create new one with correct union assignment
3. Or manually edit in Firebase Console → Firestore

---

## 📊 What Gets Created

### When You Create a Union:

**Firestore Collection:** `classUnions`
```javascript
{
  name: "Alpha Union",
  color: "red-700",
  icon: "🦁",
  createdAt: Date
}
```

---

### When You Create an Editor:

**Firebase Authentication:**
- Email/password account created
- UID generated automatically

**Firestore Collection:** `users`
```javascript
{
  email: "editor@school.edu",
  role: "editor",
  displayName: "Mr. John Smith",
  classUnion: "Alpha Union", // optional
  createdAt: Date
}
```

---

## 🎯 Next Steps After Setup

Once you've created Unions and Editors:

1. **Share portal links** with students:
   - `/login/alpha` - Alpha Union students
   - `/login/beta` - Beta Union students
   - etc.

2. **Train editors** on how to:
   - Login to their portal
   - Access editor dashboard
   - Review and approve articles

3. **Monitor activity**:
   - Check submission rates per union
   - Review editor approval times
   - Track published articles

---

## 📝 Quick Reference

| Action | Location | Time |
|--------|----------|------|
| Create Union | Manage → Unions tab | 1 min |
| Create Editor | Manage → Editors tab | 2 min |
| Delete Union | Manage → Unions tab | 30 sec |
| Remove Editor | Manage → Editors tab | 30 sec |
| View All Data | Both tabs | Anytime |

---

## 🔗 Related Features

- **Student Assignment**: Assign students to unions via Firebase Console or bulk upload
- **Article Management**: Editors review articles in their dashboard
- **Union Portals**: Each union gets branded login page

---

**Your Admin Management Dashboard is ready!** 🎉

Start by creating your Class Unions, then add Editors to manage submissions!
