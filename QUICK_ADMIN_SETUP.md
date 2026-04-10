# 🚀 Quick Admin-Only Setup

## Step 1: Create ONLY Admin Account in Firebase

### A. Firebase Authentication
1. Go to: https://console.firebase.google.com/project/school-magazine-app/authentication/users
2. Click **"Add user"**
3. Email: `admin@school.edu`
4. Password: `Admin123!`
5. Click **"Add user"**
6. **COPY THE UID** (User ID)

### B. Firestore Database
1. Go to: https://console.firebase.google.com/project/school-magazine-app/firestore
2. Click **"Start collection"** or **"Add collection"**
3. Collection ID: `users`
4. Click **"Add document"**
5. Document ID: Paste the Admin UID you copied
6. Add these 4 fields:

```
Field 1:
  Name: email
  Type: string
  Value: admin@school.edu

Field 2:
  Name: role
  Type: string
  Value: admin

Field 3:
  Name: displayName
  Type: string
  Value: School Administrator

Field 4:
  Name: createdAt
  Type: timestamp
  Value: [Click calendar icon → Select today]
```

7. Click **"Save"**

---

## Step 2: Login to Admin Panel

1. Open: http://localhost:3002/login
2. Email: `admin@school.edu`
3. Password: `Admin123!`
4. Click **"Sign In"**
5. After login, click **"⚙️ Manage"** in navbar
   OR go to: http://localhost:3002/dashboard/admin/manage

---

## Step 3: Add Class Unions (Through Admin Panel)

Once in the admin panel:

### Tab 1: "Manage Class Unions"

1. Fill in the form:
   - **Union Name**: `Alpha Union`
   - **Theme Color**: Choose Red 🔴
   - **Union Icon**: `🦁`
   
2. Click **"Create Class Union"**

3. Repeat for other unions:
   - Beta Union (Blue 🔵, 🐯)
   - Gamma Union (Green 🟢, 🦅)
   - Delta Union (Purple 🟣, 🐺)

✅ Done! Your class unions are created automatically in Firestore!

---

## Step 4: Add Editors (Through Admin Panel)

### Tab 2: "Manage Editors"

1. Fill in the form:
   - **Email**: `editor@school.edu`
   - **Password**: `Editor123!` (min 6 characters)
   - **Display Name**: `Mr. Smith`
   - **Assign to Union**: Choose from dropdown (or leave empty for general editor)

2. Click **"Create Editor Account"**

✅ Done! The editor account is created automatically in Firebase Auth AND Firestore!

**The editor can now:**
- Login at: http://localhost:3002/login
- Access editor dashboard
- Review articles based on their union assignment

---

## Step 5: Add Students (Manual Firestore or Bulk Upload)

Students need to be added manually or via bulk upload:

### Option A: Manual (Few Students)
1. Go to Firebase Authentication
2. Add student user (e.g., `student@school.edu` / `Student123!`)
3. Copy UID
4. Go to Firestore → users collection
5. Add document with:
   - email: student@school.edu
   - role: contributor
   - displayName: John Student
   - classUnion: Alpha Union
   - createdAt: Today

### Option B: Bulk Upload (Many Students)
Use Firebase CLI or import CSV tool

---

## ✅ Summary

**What You Created Manually:**
- ✅ 1 Admin account (Firebase Auth + Firestore)

**What Admin Panel Creates Automatically:**
- ✅ Class Unions (no manual work!)
- ✅ Editor accounts (no manual work!)

**What Still Needs Manual Work:**
- ⚠️ Student accounts (add via Firebase Console or bulk upload)

---

## 🎯 Benefits of This Approach

✅ Only create 1 manual account (admin)  
✅ Use admin panel for everything else  
✅ No need to manually edit Firestore for editors/unions  
✅ Web interface is easier than Firebase Console  

---

## 🔗 Quick Links

- Admin Panel: http://localhost:3002/dashboard/admin/manage
- Main Login: http://localhost:3002/login
- Firebase Auth: https://console.firebase.google.com/project/school-magazine-app/authentication/users
- Firestore: https://console.firebase.google.com/project/school-magazine-app/firestore

---

Ready? Start with Step 1! 🚀
