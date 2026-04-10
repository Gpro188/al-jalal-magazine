# 🖼️ Union Logo Setup Guide

## ✅ What's New:

You can now **upload PNG/JPG logos** for each Class Union instead of just using emoji!

---

## 📋 Features Added:

### 1. **Admin Panel - Logo Upload**
- File upload field in "Create Class Union" form
- Accepts PNG and JPG formats
- Live preview before uploading
- Recommended size: 200x200px

### 2. **Automatic Storage**
- Logos uploaded to Firebase Storage
- Stored in: `union-logos/` folder
- Automatic URL generation

### 3. **Display Logic**
- If logo exists → Shows PNG logo
- If no logo → Falls back to emoji icon
- Works on login pages and throughout the app

---

## 🚀 How to Use:

### Step 1: Login as Admin
http://localhost:3002/login
- Email: admin@school.edu
- Password: Admin123!

### Step 2: Go to Manage Panel
Click **"⚙️ Manage"** or go to:
→ http://localhost:3002/dashboard/admin/manage

### Step 3: Create/Edit Union with Logo

**In "Manage Class Unions" tab:**

1. **Union Name**: Alpha Union
2. **Theme Color**: Choose from dropdown
3. **Union Icon**: Enter emoji (🦁) - this is fallback
4. **Union Logo (PNG)**: Click to upload file
   - Select your PNG/JPG logo file
   - Preview appears automatically
   - Recommended: 200x200px, transparent background

5. Click **"Create Class Union"**

✅ Done! Logo is uploaded and saved!

---

## 📸 Logo Requirements:

| Property | Recommendation |
|----------|----------------|
| **Format** | PNG (preferred) or JPG |
| **Size** | 200x200 pixels |
| **Aspect Ratio** | 1:1 (square) |
| **Background** | Transparent (PNG) or solid color |
| **File Size** | Under 500KB |
| **Quality** | High resolution for crisp display |

---

## 🎨 Where Logos Appear:

### ✅ Admin Management Panel
- Shows logo next to union name
- Displays in union list

### ✅ Login Pages
- `/login/alpha` - Shows Alpha Union logo
- Dynamic based on union data
- Falls back to emoji if no logo

### ✅ Future Locations (Coming Soon)
- Article cards
- Category pages
- Student dashboards
- Navigation elements

---

## 🔄 Updating Existing Unions:

If you already created unions without logos:

### Option A: Delete and Recreate
1. Delete the union in admin panel
2. Create new one with logo upload

### Option B: Manual Firestore Update
1. Go to Firestore Console
2. Find union document in `classUnions` collection
3. Add field: `logoUrl` (string) = [Firebase Storage URL]
4. Or use admin panel to delete and recreate

---

## 💡 Pro Tips:

1. **Prepare Logos Beforehand**
   - Have all 4 union logos ready (Alpha, Beta, Gamma, Delta)
   - Use consistent style across all unions
   - Match school branding colors

2. **Test Different Formats**
   - Try both PNG and JPG
   - PNG better for transparency
   - JPG smaller file size

3. **Optimize File Size**
   - Use tools like TinyPNG
   - Keep under 500KB
   - Faster loading = better UX

4. **Design Consistency**
   - Same dimensions for all unions
   - Similar visual style
   - Clear at small sizes

---

## 🎯 Example Workflow:

```
1. Design logos in Canva/Photoshop
   - Alpha Union: Lion logo (red theme)
   - Beta Union: Tiger logo (blue theme)
   - Gamma Union: Eagle logo (green theme)
   - Delta Union: Wolf logo (purple theme)

2. Export as PNG, 200x200px, transparent background

3. Login to admin panel

4. For each union:
   - Fill name, color, icon (emoji fallback)
   - Upload logo file
   - Preview looks good
   - Click "Create"

5. Done! All unions have professional logos!
```

---

## 🔧 Technical Details:

### Storage Structure:
```
Firebase Storage/
└── union-logos/
    ├── Alpha Union-1234567890-logo.png
    ├── Beta Union-1234567891-logo.png
    └── Gamma Union-1234567892-logo.png
```

### Firestore Data:
```javascript
classUnions/abc123 {
  name: "Alpha Union",
  color: "red-700",
  icon: "🦁",
  logoUrl: "https://firebasestorage.googleapis.com/...", // Auto-filled
  createdAt: Date
}
```

---

## ✨ Benefits:

✅ Professional appearance  
✅ Better branding  
✅ More recognizable than emoji  
✅ Consistent with school identity  
✅ Scalable (can update anytime)  

---

## 🆘 Troubleshooting:

**Logo not showing?**
- Check Firebase Storage permissions
- Verify logoUrl field in Firestore
- Clear browser cache

**Upload fails?**
- Check file size (must be under 5MB)
- Ensure PNG or JPG format
- Check Firebase Storage quota

**Logo looks blurry?**
- Use higher resolution (200x200px minimum)
- Export at actual display size
- Avoid stretching small images

---

## 📊 Next Steps:

1. Design your union logos
2. Upload them via admin panel
3. Test on login pages
4. Enjoy the professional look! 🎉

---

Your School Magazine App now supports custom union logos! 🦁🐯🦅🐺
