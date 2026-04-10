# 🚀 Complete Setup Guide - School Magazine App

## Step-by-Step Instructions to Create All User Accounts

---

## 📋 PART 1: Create Users in Firebase Authentication

### Step 1: Go to Firebase Console
1. Open: https://console.firebase.google.com/
2. Click on your project: **school-magazine-app**

---

### Step 2: Add Admin User

1. Click **"Authentication"** in left sidebar
2. Click **"Get started"** (if first time) or **"Users"** tab
3. Click **"Add user"** button (top right)
4. Fill in:
   - **Email:** `admin@school.edu`
   - **Password:** `Admin123!` (or your choice)
   - **Password:** (confirm same password)
5. Click **"Add user"**
6. **IMPORTANT:** Copy the **User UID** (looks like: `abc123xyz...`)
   - Write it down, you'll need it!

---

### Step 3: Add Editor User

1. Click **"Add user"** again
2. Fill in:
   - **Email:** `editor@school.edu`
   - **Password:** `Editor123!`
   - **Password:** (confirm)
3. Click **"Add user"**
4. **Copy the User UID** for this user too!

---

### Step 4: Add Student User (Alpha Union)

1. Click **"Add user"** again
2. Fill in:
   - **Email:** `student@school.edu`
   - **Password:** `Student123!`
   - **Password:** (confirm)
3. Click **"Add user"**
4. **Copy the User UID**

---

## 📋 PART 2: Add User Data to Firestore

### Step 1: Go to Firestore Database

1. In Firebase Console, click **"Firestore Database"** in left sidebar
2. If no database exists, click **"Create database"**
   - Choose **"Start in test mode"** (for now)
   - Choose a location (any is fine)
   - Click **"Enable"**

---

### Step 2: Create Admin Document

1. Click **"Start collection"**
2. Collection ID: `users`
3. Document ID: Paste the **Admin UID** you copied
4. Click **"Next"** then add fields:

**Add these 4 fields:**

| Field Name | Type | Value |
|------------|------|-------|
| `email` | string | `admin@school.edu` |
| `role` | string | `admin` |
| `displayName` | string | `School Administrator` |
| `createdAt` | timestamp | Click calendar → Select today |

5. Click **"Save"**

---

### Step 3: Create Editor Document

1. In `users` collection, click **"Add document"**
2. Document ID: Paste the **Editor UID**
3. Click **"Next"** then add fields:

| Field Name | Type | Value |
|------------|------|-------|
| `email` | string | `editor@school.edu` |
| `role` | string | `editor` |
| `displayName` | string | `School Editor` |
| `createdAt` | timestamp | Today's date |
| `classUnion` | string | *(leave empty for general editor)* |

4. Click **"Save"**

---

### Step 4: Create Student Document

1. In `users` collection, click **"Add document"**
2. Document ID: Paste the **Student UID**
3. Click **"Next"** then add fields:

| Field Name | Type | Value |
|------------|------|-------|
| `email` | string | `student@school.edu` |
| `role` | string | `contributor` |
| `displayName` | string | `John Student` |
| `createdAt` | timestamp | Today's date |
| `classUnion` | string | `Alpha Union` |

4. Click **"Save"**

---

## 📋 PART 3: Create Class Unions (Optional but Recommended)

### Option A: Create via Admin Dashboard (After Login)

Once you login as admin, you can create unions there easily!

### Option B: Create Manually in Firestore

1. In Firestore, click **"Add collection"**
2. Collection ID: `classUnions`
3. Click **"Add document"** → Auto-ID (leave as auto-generated)
4. Add fields:

**Alpha Union:**
| Field Name | Type | Value |
|------------|------|-------|
| `name` | string | `Alpha Union` |
| `color` | string | `red-700` |
| `icon` | string | `🦁` |
| `createdAt` | timestamp | Today |

**Beta Union:**
| Field Name | Type | Value |
|------------|------|-------|
| `name` | string | `Beta Union` |
| `color` | string | `blue-700` |
| `icon` | string | `🐯` |
| `createdAt` | timestamp | Today |

**Gamma Union:**
| Field Name | Type | Value |
|------------|------|-------|
| `name` | string | `Gamma Union` |
| `color` | string | `green-700` |
| `icon` | string | `🦅` |
| `createdAt` | timestamp | Today |

**Delta Union:**
| Field Name | Type | Value |
|------------|------|-------|
| `name` | string | `Delta Union` |
| `color` | string | `purple-700` |
| `icon` | string | `🐺` |
| `createdAt` | timestamp | Today |

---

## 📋 PART 4: Test All Login Portals

### 🔹 Test 1: Admin Login

1. Open browser: `http://localhost:3002/login`
2. Enter:
   - Email: `admin@school.edu`
   - Password: `Admin123!`
3. Click **"Sign In"**
4. You should see: **Admin Dashboard**
5. Click **"⚙️ Manage"** to go to admin management panel

**What Admin Can Do:**
- ✅ Create/delete Class Unions
- ✅ Create/delete Editors
- ✅ Manage everything
- ✅ Access: `/dashboard/admin/manage`

---

### 🔹 Test 2: Editor Login

1. Open browser: `http://localhost:3002/login`
2. Enter:
   - Email: `editor@school.edu`
   - Password: `Editor123!`
3. Click **"Sign In"**
4. You should see: **Editor Dashboard**

**What Editor Can Do:**
- ✅ Review articles
- ✅ Approve/reject submissions
- ✅ Access: `/dashboard/editor`

---

### 🔹 Test 3: Student Login (Alpha Union)

1. Open browser: `http://localhost:3002/login/alpha`
2. Enter:
   - Email: `student@school.edu`
   - Password: `Student123!`
3. Click **"Sign In to Alpha Union"**
4. You should see: **Contributor Dashboard**

**What Student Can Do:**
- ✅ Submit articles
- ✅ View own submissions
- ✅ Access: `/dashboard/contributor`

---

## 📋 PART 5: Verify Everything Works

### ✅ Checklist:

- [ ] Created 3 users in Firebase Authentication
- [ ] Added 3 documents to Firestore `users` collection
- [ ] Created Class Unions (manually or via admin panel)
- [ ] Tested admin login at `/login`
- [ ] Tested editor login at `/login`
- [ ] Tested student login at `/login/alpha`
- [ ] Verified admin can access `/dashboard/admin/manage`
- [ ] Verified editor can access `/dashboard/editor`
- [ ] Verified student can access `/dashboard/contributor`

---

## 🔧 Troubleshooting

### Issue: "Page not found" (404)
**Solution:** Make sure you're using the correct URLs:
- Admin: `http://localhost:3002/dashboard/admin/manage`
- Editor: `http://localhost:3002/dashboard/editor`
- Student: `http://localhost:3002/dashboard/contributor`

### Issue: "Invalid email or password"
**Solution:** 
- Check you're using exact email from Firebase
- Verify password matches what you set
- Check caps lock is off

### Issue: Redirected to login immediately
**Solution:**
- Check Firestore has correct `role` field
- Verify UID matches between Auth and Firestore
- Clear browser cache and try again

### Issue: Can't see admin options
**Solution:**
- Verify `role: "admin"` in Firestore exactly
- Logout and login again
- Check browser console for errors

---

## 🎯 Quick Reference

### Login URLs:
| Portal | URL | Credentials |
|--------|-----|-------------|
| Staff/Admin | `http://localhost:3002/login` | admin@school.edu / Admin123! |
| Alpha Union | `http://localhost:3002/login/alpha` | student@school.edu / Student123! |
| Beta Union | `http://localhost:3002/login/beta` | (create similar to alpha) |
| Gamma Union | `http://localhost:3002/login/gamma` | (create similar to alpha) |
| Delta Union | `http://localhost:3002/login/delta` | (create similar to alpha) |

### Dashboard URLs:
| Role | Dashboard URL |
|------|---------------|
| Admin | `/dashboard/admin/manage` |
| Editor | `/dashboard/editor` |
| Student | `/dashboard/contributor` |

---

## 🎉 You're Done!

Your School Magazine App is now fully set up with:
- ✅ Admin account to manage everything
- ✅ Editor account to review articles
- ✅ Student account to submit articles
- ✅ Class Unions ready to use

Start by logging in as admin and creating more editors or unions as needed!

---

**Need Help?**
Check the other guides:
- `ADMIN_MANAGEMENT_GUIDE.md` - How to use admin panel
- `UNION_SYSTEM_SUMMARY.md` - Understanding class unions
- `QUICKSTART.md` - Quick start guide
