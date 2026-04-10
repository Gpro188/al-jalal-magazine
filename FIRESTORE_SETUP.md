# 🔥 Firestore Data Setup - Copy This!

## Add These Documents to Firestore `users` Collection

Go to: https://console.firebase.google.com/project/school-magazine-app/firestore

---

## 1️⃣ Admin User Document

**Collection:** `users`  
**Document ID:** `NK9LmkRATOh9n3rfhLK6jJHBobJ2`

**Add these fields:**

```
Field 1:
- Field: email
- Type: string
- Value: admin@school.edu

Field 2:
- Field: role
- Type: string
- Value: admin

Field 3:
- Field: displayName
- Type: string
- Value: School Administrator

Field 4:
- Field: createdAt
- Type: timestamp
- Value: [Click calendar icon → Select today's date]
```

---

## 2️⃣ Editor User Document

**Collection:** `users`  
**Document ID:** `JuPDAMW8URT2eViBxmB2yd4lYGl1`

**Add these fields:**

```
Field 1:
- Field: email
- Type: string
- Value: editor@school.edu

Field 2:
- Field: role
- Type: string
- Value: editor

Field 3:
- Field: displayName
- Type: string
- Value: School Editor

Field 4:
- Field: createdAt
- Type: timestamp
- Value: [Click calendar icon → Select today's date]

Field 5 (Optional):
- Field: classUnion
- Type: string
- Value: [Leave empty for general editor, or add "Alpha Union"]
```

---

## 3️⃣ Student User Document

**Collection:** `users`  
**Document ID:** `UXwRcCUApMOyydkqKD3qV0BK2Pa2`

**Add these fields:**

```
Field 1:
- Field: email
- Type: string
- Value: student@school.edu

Field 2:
- Field: role
- Type: string
- Value: contributor

Field 3:
- Field: displayName
- Type: string
- Value: John Student

Field 4:
- Field: classUnion
- Type: string
- Value: Alpha Union

Field 5:
- Field: createdAt
- Type: timestamp
- Value: [Click calendar icon → Select today's date]
```

---

## ✅ After Adding to Firestore

### Test Login #1: Admin
1. Go to: http://localhost:3002/login
2. Email: `admin@school.edu`
3. Password: `Admin123!`
4. Should redirect to: `/dashboard/contributor`
5. Then navigate to: http://localhost:3002/dashboard/admin/manage

### Test Login #2: Editor
1. Go to: http://localhost:3002/login
2. Email: `editor@school.edu`
3. Password: `Editor123!`
4. Should redirect to: `/dashboard/editor`

### Test Login #3: Student
1. Go to: http://localhost:3002/login/alpha
2. Email: `student@school.edu`
3. Password: `Student123!`
4. Should redirect to: `/dashboard/contributor`

---

## 🎯 Quick Steps in Firestore:

1. Click **"Start collection"**
2. Name it: `users`
3. Click **"Add document"**
4. Paste Document ID (UID from above)
5. Click **"Next"**
6. Add all fields one by one
7. Click **"Save"**
8. Repeat for other 2 users

---

Done? Now test the logins! 🚀
