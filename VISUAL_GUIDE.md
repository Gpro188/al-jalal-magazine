# 🎨 Visual Design Guide - School Magazine App

## Overview

This document provides a visual reference for the School Magazine Web App's design and user interface.

---

## 🏠 Homepage Layout

### Hero Section
```
┌─────────────────────────────────────────────┐
│                                             │
│         SCHOOL MAGAZINE                     │
│   Celebrating Student Voices & Creative     │
│            Excellence                       │
│                                             │
│      [ Submit Your Article ]                │
│                                             │
└─────────────────────────────────────────────┘
```
- **Background**: Red gradient (from-red-700 via-red-600 to-red-800)
- **Text**: White, centered
- **CTA Button**: White with red text, rounded
- **Typography**: Playfair Display for heading, Inter for body

---

### Featured Slider Section
```
┌─────────────────────────────────────────────┐
│           FEATURED STORIES                  │
│                                             │
│  ┌───────────────────────────────────┐     │
│  │                                   │     │
│  │    [Featured Article Image]       │     │
│  │                                   │     │
│  │  Alpha Union • 2026               │     │
│  │  "My Journey Through High School" │     │
│  │  By John Doe                      │     │
│  │                                   │     │
│  │  ◄ ● ○ ○ ○ ○ ►                    │     │
│  └───────────────────────────────────┘     │
│                                             │
└─────────────────────────────────────────────┘
```
- Full-width image slider
- Navigation arrows on sides
- Dot indicators at bottom
- Text overlay with gradient

---

### Latest Articles Grid
```
┌─────────────────────────────────────────────┐
│            LATEST ARTICLES                  │
│                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ [Image]  │  │ [Image]  │  │ [Image]  │  │
│  │          │  │          │  │          │  │
│  │ Alpha    │  │ Beta     │  │ Gamma    │  │
│  │ Title..  │  │ Title..  │  │ Title..  │  │
│  │ Excerpt  │  │ Excerpt  │  │ Excerpt  │  │
│  │ John D.  │  │ Jane S.  │  │ Bob M.   │  │
│  └──────────┘  └──────────┘  └──────────┘  │
│                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ [Image]  │  │ [Image]  │  │ [Image]  │  │
│  │ ...      │  │ ...      │  │ ...      │  │
│  └──────────┘  └──────────┘  └──────────┘  │
│                                             │
└─────────────────────────────────────────────┘
```
- Responsive grid (auto-fill, minmax(300px, 1fr))
- Card-based design
- Hover effects (scale up, shadow)
- Category badges

---

### Browse by Class Union
```
┌─────────────────────────────────────────────┐
│      BROWSE BY CLASS UNION                  │
│                                             │
│  ┌──────────┐  ┌──────────┐                │
│  │  Alpha   │  │  Beta    │                │
│  │  Union   │  │  Union   │                │
│  └──────────┘  └──────────┘                │
│                                             │
│  ┌──────────┐  ┌──────────┐                │
│  │  Gamma   │  │  Delta   │                │
│  │  Union   │  │  Union   │                │
│  └──────────┘  └──────────┘                │
│                                             │
└─────────────────────────────────────────────┘
```
- Gray background section
- Clickable cards
- Clean typography

---

## 📝 Submission Form

### Form Layout
```
┌─────────────────────────────────────────────┐
│      SUBMIT YOUR ARTICLE                    │
│  Share your story with the school community │
│                                             │
│  Your Name *                                │
│  ┌─────────────────────────────────────┐   │
│  │ John Doe                            │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Article Title *                            │
│  ┌─────────────────────────────────────┐   │
│  │ My School Experience                │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Class Union *        Academic Year *      │
│  ┌───────────────┐   ┌───────────────┐    │
│  │ Select Union ▼│   │ Select Year ▼ │    │
│  └───────────────┘   └───────────────┘    │
│                                             │
│  Article Content *                          │
│  ┌─────────────────────────────────────┐   │
│  │                                     │   │
│  │  Write your article here...         │   │
│  │                                     │   │
│  │                                     │   │
│  │                                     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│      [ Submit Article ]                     │
│                                             │
└─────────────────────────────────────────────┘
```

### Form Features
- Clean white background
- Rounded input fields
- Red accent colors
- Required field indicators (*)
- Real-time validation messages
- Success/error states

---

## 🔐 Login Page

```
┌─────────────────────────────────────────────┐
│                                             │
│          WELCOME BACK                       │
│    Sign in to access your dashboard         │
│                                             │
│  Email Address                              │
│  ┌─────────────────────────────────────┐   │
│  │ student@school.edu                  │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Password                                   │
│  ┌─────────────────────────────────────┐   │
│  │ ••••••••                            │   │
│  └─────────────────────────────────────┘   │
│                                             │
│      [ Sign In ]                            │
│                                             │
│  Don't have an account?                     │
│  Contact your school administrator          │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 📊 Dashboard Views

### Contributor Dashboard (Students)
```
┌─────────────────────────────────────────────┐
│  MY SUBMISSIONS                             │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ Title              Status    Date   │   │
│  ├─────────────────────────────────────┤   │
│  │ My Story      ⏳ Pending   Apr 1    │   │
│  │ School Life   ✅ Approved  Mar 15   │   │
│  │ Sports Day    ❌ Rejected  Mar 1    │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  [ + New Submission ]                       │
└─────────────────────────────────────────────┘
```

### Editor Dashboard
```
┌─────────────────────────────────────────────┐
│  PENDING REVIEW (5)                         │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ "My Journey" - John Doe             │   │
│  │ Alpha Union • 500 words             │   │
│  │ [Read] [Approve] [Request Changes]  │   │
│  ├─────────────────────────────────────┤   │
│  │ "Sports Victory" - Jane Smith       │   │
│  │ Beta Union • 350 words              │   │
│  │ [Read] [Approve] [Request Changes]  │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

### Admin Dashboard
```
┌─────────────────────────────────────────────┐
│  STAFF APPROVED (3)                         │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ "Academic Excellence" - Bob Johnson │   │
│  │ Gamma Union                         │   │
│  │ [Upload Image] [Publish]            │   │
│  ├─────────────────────────────────────┤   │
│  │ "Creative Arts" - Alice Williams    │   │
│  │ Delta Union                         │   │
│  │ [Upload Image] [Publish]            │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

---

## 🎨 Color Palette

### Primary Colors
```
Red-700: #b91c1c  (Primary buttons, accents)
Red-600: #dc2626  (Hover states)
Red-500: #ef4444  (Highlights)
```

### Neutral Colors
```
Gray-800: #1f2937  (Footer, dark text)
Gray-700: #374151  (Secondary text)
Gray-600: #4b5563  (Body text)
Gray-500: #6b7280  (Muted text)
Gray-100: #f3f4f6  (Light backgrounds)
Gray-50:  #f9fafb  (Page background)
White:    #ffffff  (Cards, inputs)
```

### Status Colors
```
Green:  Success, Approved, Published
Yellow: Pending, Waiting review
Red:    Rejected, Errors, Delete
Blue:   Info, Draft
```

---

## 📱 Responsive Breakpoints

### Mobile (< 768px)
- Single column layout
- Hamburger menu
- Stacked form fields
- Full-width cards

### Tablet (768px - 1024px)
- Two-column grid
- Visible navigation
- Side-by-side form fields
- Larger card images

### Desktop (> 1024px)
- Three-column grid
- Full navigation bar
- Optimal reading width
- Enhanced hover effects

---

## 🖱️ Interactive States

### Buttons
```
Default:  bg-red-700 text-white
Hover:    bg-red-800 shadow-md
Active:   bg-red-900 scale-95
Disabled: bg-gray-400 cursor-not-allowed
```

### Cards
```
Default:  shadow-md
Hover:    shadow-xl scale-105
```

### Input Fields
```
Default:  border-gray-300
Focus:    border-transparent ring-2 ring-red-500
Error:    border-red-500
```

---

## ✨ Animations

### Fade In
- Page load: `opacity-0 → opacity-100`
- Duration: 300ms
- Easing: ease-in-out

### Slide Up
- Cards on hover: `translate-y-0 → translate-y-[-4px]`
- Duration: 200ms

### Scale
- Images on hover: `scale-100 → scale-110`
- Duration: 300ms

### Spinner
- Loading: continuous rotation
- Duration: 1s per rotation

---

## 🖼️ Image Styling

### Featured Images
- Aspect ratio: 16:9
- Object fit: cover
- Rounded corners: 8px
- Shadow: lg

### Thumbnails
- Size: 150x150px
- Border radius: 4px
- Grayscale until hover

### Author Avatars
- Circular: 50% border-radius
- Size: 40x40px
- Border: 2px solid white

---

## 📏 Typography Scale

### Headings (Playfair Display)
```
h1: 4xl (2.25rem) - Hero titles
h2: 3xl (1.875rem) - Section headers
h3: 2xl (1.5rem) - Card titles
h4: xl (1.25rem) - Subsections
```

### Body (Inter)
```
Large: lg (1.125rem) - Lead paragraphs
Base: base (1rem) - Regular text
Small: sm (0.875rem) - Captions, labels
XSmall: xs (0.75rem) - Footnotes
```

---

## 🎯 Design Principles

1. **Clean & Professional** - Magazine aesthetic
2. **Student-Friendly** - Easy to navigate
3. **Accessible** - WCAG compliant colors
4. **Responsive** - Works on all devices
5. **Fast** - Optimized loading
6. **Consistent** - Unified design language

---

## 📐 Spacing System

Based on Tailwind's spacing scale:
```
xs:  0.25rem (4px)
sm:  0.5rem (8px)
md:  1rem (16px)
lg:  1.5rem (24px)
xl:  2rem (32px)
2xl: 3rem (48px)
```

---

This visual guide ensures consistent design across all pages and components of the School Magazine Web App!
