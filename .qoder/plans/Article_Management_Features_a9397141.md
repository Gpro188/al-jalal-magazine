# Article Management Features Implementation

## Overview
Add three major features:
1. **Rejected article editing** in union portal
2. **Admin publish workflow** with read article, cover image upload, and banner settings
3. **Homepage banner slider** with time-based expiry and featured articles below

---

## Task 1: Rejected Article Editing (Union Portal)

### File: `app/union-activity/page.tsx`

**Current State:**
- Shows rejected articles with rejection reason
- No edit functionality

**Changes:**
1. Add "Edit" button for rejected articles only
2. When clicked, redirect to `/submit?edit={postId}` with article data pre-filled
3. Store rejected article data in sessionStorage for editing

**Implementation:**
```typescript
// Add to Activity interface
interface Activity {
  // ... existing fields
  content?: string; // Add content field
}

// Add edit handler
const handleEditRejected = (activity: Activity) => {
  sessionStorage.setItem('editingPost', JSON.stringify({
    postId: activity.id,
    title: activity.title,
    content: activity.content,
    studentName: activity.studentName,
    year: activity.year
  }));
  router.push('/submit?edit=true');
};

// Add edit button in activity card (only for rejected status)
{activity.status === 'rejected' && (
  <button
    onClick={() => handleEditRejected(activity)}
    className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
  >
    ✏️ Edit & Resubmit
  </button>
)}
```

### File: `app/submit/page.tsx`

**Changes:**
1. Check for `?edit=true` query parameter
2. Load editing data from sessionStorage
3. Pre-fill form with existing article data
4. On submit, update existing post instead of creating new one
5. Reset status to 'pending_review'

**Implementation:**
```typescript
// Check for edit mode
const searchParams = useSearchParams();
const isEditMode = searchParams.get('edit') === 'true';

// Load editing data
useEffect(() => {
  if (isEditMode) {
    const editingData = sessionStorage.getItem('editingPost');
    if (editingData) {
      const data = JSON.parse(editingData);
      // Pre-fill form using reset() from react-hook-form
      reset({
        title: data.title,
        content: data.content,
        studentName: data.studentName,
        year: data.year
      });
      setEditingPostId(data.postId);
    }
  }
}, [isEditMode]);

// Modify onSubmit to handle update
if (isEditMode && editingPostId) {
  const { updatePostStatus } = await import('@/lib/firestore');
  await updatePostStatus(editingPostId, 'pending_review', {
    title: data.title,
    content: data.content,
    studentName: data.studentName,
    updatedAt: new Date()
  });
}
```

---

## Task 2: Admin Publish Workflow

### File: `app/dashboard/admin/page.tsx`

**Current State:**
- Shows approved and published posts lists
- No publish button, no read article option, no banner management

**Changes:**
1. Add "Read Article" button to expand and view full article content
2. Add "Publish" button for approved articles
3. Add "Set Banner" option when publishing with:
   - Banner image upload
   - Banner start datetime
   - Banner end datetime
4. Add banner management section

**Implementation:**

```typescript
// Add new state
const [selectedPost, setSelectedPost] = useState<Post | null>(null);
const [showReadModal, setShowReadModal] = useState(false);
const [showPublishModal, setShowPublishModal] = useState(false);
const [bannerImage, setBannerImage] = useState<File | null>(null);
const [bannerStart, setBannerStart] = useState('');
const [bannerEnd, setBannerEnd] = useState('');

// Read Article Modal
{showReadModal && selectedPost && (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <h2>{selectedPost.title}</h2>
      <p>{selectedPost.content}</p>
      {/* Publish and Banner options */}
      <button onClick={() => openPublishModal(selectedPost)}>
        Publish & Set Banner
      </button>
    </div>
  </div>
)}

// Publish handler with banner
const handlePublish = async (postId: string, setAsBanner: boolean) => {
  const updateData: any = {
    status: 'published',
    publishedAt: new Date()
  };
  
  if (setAsBanner && bannerImage) {
    // Upload banner image
    const { uploadFeaturedImage } = await import('@/lib/firestore');
    const uploadResult = await uploadFeaturedImage(bannerImage, postId);
    
    if (uploadResult.success) {
      updateData.featuredImage = uploadResult.url;
      updateData.isBanner = true;
      updateData.bannerStart = new Date(bannerStart);
      updateData.bannerEnd = new Date(bannerEnd);
    }
  }
  
  await updatePostStatus(postId, 'published', updateData);
};
```

**UI Additions to Approved Posts List:**
```typescript
{(activeTab === 'approved' ? approvedPosts : publishedPosts).map((post) => (
  <div key={post.id}>
    {/* Existing post info */}
    
    {activeTab === 'approved' && (
      <div className="flex gap-3 mt-4">
        <button onClick={() => openReadModal(post)}>
          📖 Read Article
        </button>
        <button onClick={() => handleQuickPublish(post.id)}>
          ✅ Publish (No Banner)
        </button>
      </div>
    )}
    
    {/* Show banner info if published with banner */}
    {post.isBanner && (
      <div className="mt-2 text-sm text-purple-700">
        🎯 Banner until: {new Date(post.bannerEnd).toLocaleString()}
      </div>
    )}
  </div>
))}
```

---

## Task 3: Homepage Banner Slider

### File: `app/page.tsx`

**Current State:**
- Shows FeaturedSlider component for posts with featuredImage
- No banner-specific logic or expiry handling

**Changes:**
1. Query posts with `isBanner: true` and active banner time
2. Display banner slider at top (only active banners)
3. Below banner, show all published articles grid
4. Filter out expired banners automatically

**Implementation:**

```typescript
const [bannerPosts, setBannerPosts] = useState<Post[]>([]);
const [regularPosts, setRegularPosts] = useState<Post[]>([]);

const loadPosts = async () => {
  const allPublished = await getPublishedPosts();
  const now = new Date();
  
  // Filter active banners
  const activeBanners = allPublished.filter(post => {
    if (!post.isBanner || !post.bannerEnd) return false;
    const bannerEnd = post.bannerEnd.toDate ? post.bannerEnd.toDate() : new Date(post.bannerEnd);
    const bannerStart = post.bannerStart?.toDate ? post.bannerStart.toDate() : new Date(0);
    return now >= bannerStart && now <= bannerEnd;
  });
  
  // Regular posts (exclude active banners or show all)
  setBannerPosts(activeBanners);
  setRegularPosts(allPublished);
};

// Render
return (
  <div>
    {/* Banner Slider - Only if active banners exist */}
    {bannerPosts.length > 0 && (
      <section className="relative h-[500px] bg-black">
        <BannerSlider posts={bannerPosts} />
      </section>
    )}
    
    {/* Regular Articles Grid */}
    <main className="container mx-auto px-4 py-12">
      <h2>Latest Articles</h2>
      <div className="magazine-grid">
        {regularPosts.map(post => <ArticleCard key={post.id} post={post} />)}
      </div>
    </main>
  </div>
);
```

### New File: `components/BannerSlider.tsx`

**Create new component for banner slider:**

```typescript
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Post } from '@/lib/firestore';

export default function BannerSlider({ posts }: { posts: Post[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-slide every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % posts.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [posts.length]);

  if (posts.length === 0) return null;

  const currentPost = posts[currentIndex];

  return (
    <div className="relative h-full">
      {/* Banner Image */}
      <Link href={`/article/${currentPost.id}`}>
        <div className="relative h-full w-full">
          <Image
            src={currentPost.featuredImage!}
            alt={currentPost.title}
            fill
            className="object-cover"
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          
          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-12 text-white">
            <span className="bg-red-600 px-4 py-1 rounded-full text-sm font-semibold">
              {currentPost.category.union}
            </span>
            <h2 className="font-heading text-4xl font-bold mt-4 mb-2">
              {currentPost.title}
            </h2>
            <p className="text-lg opacity-90">{currentPost.studentName}</p>
          </div>
        </div>
      </Link>

      {/* Navigation Dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        {posts.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-3 w-3 rounded-full transition-all ${
              index === currentIndex ? 'bg-white w-8' : 'bg-white/50'
            }`}
          />
        ))}
      </div>

      {/* Arrow Navigation */}
      <button
        onClick={() => setCurrentIndex((prev) => (prev - 1 + posts.length) % posts.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 rounded-full p-3"
      >
        ←
      </button>
      <button
        onClick={() => setCurrentIndex((prev) => (prev + 1) % posts.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 rounded-full p-3"
      >
        →
      </button>
    </div>
  );
}
```

---

## Task 4: Update Firestore Types

### File: `lib/firestore.ts`

**Add banner fields to Post interface:**

```typescript
export interface Post {
  // ... existing fields
  featuredImage?: string;
  isBanner?: boolean;
  bannerStart?: Timestamp;
  bannerEnd?: Timestamp;
}
```

---

## Task 5: Create Article Detail Page

### New File: `app/article/[id]/page.tsx`

**Create article detail page to display full article when clicked:**

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { getPostById } from '@/lib/firestore';
import type { Post } from '@/lib/firestore';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ArticlePage() {
  const params = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPost();
  }, [params.id]);

  const loadPost = async () => {
    const postData = await getPostById(params.id as string);
    setPost(postData);
    setLoading(false);
  };

  if (loading) return <LoadingState />;
  if (!post) return <NotFoundState />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Image */}
      {post.featuredImage && (
        <div className="relative h-[400px] w-full">
          <Image src={post.featuredImage} alt={post.title} fill className="object-cover" />
        </div>
      )}

      {/* Article Content */}
      <article className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="font-heading text-5xl font-bold mb-4">{post.title}</h1>
        
        <div className="flex items-center gap-4 mb-8 text-gray-600">
          <span className="font-semibold">{post.studentName}</span>
          <span>•</span>
          <span>{post.category.union}</span>
          <span>•</span>
          <time>{formatDate(post.createdAt)}</time>
        </div>

        <div className="prose prose-lg max-w-none">
          {post.content.split('\n').map((paragraph, idx) => (
            <p key={idx} className="mb-4">{paragraph}</p>
          ))}
        </div>
      </article>

      <Footer />
    </div>
  );
}
```

---

## Task 6: Update Firestore Indexes

### File: `firestore.indexes.json`

**Add required indexes:**

```json
{
  "indexes": [
    {
      "collectionGroup": "posts",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "isBanner", "order": "ASCENDING" },
        { "fieldPath": "bannerEnd", "order": "DESCENDING" }
      ]
    }
  ]
}
```

---

## Implementation Order

1. **Update Post interface** with banner fields (Task 4)
2. **Add rejected article editing** to union-activity and submit pages (Task 1)
3. **Add admin publish workflow** with read modal and banner upload (Task 2)
4. **Create BannerSlider component** (Task 3)
5. **Create article detail page** (Task 5)
6. **Update homepage** with banner logic (Task 3)
7. **Deploy Firestore indexes** (Task 6)

---

## Key Features Summary

- Students can edit and resubmit rejected articles
- Admin can read full articles before publishing
- Admin can upload cover/banner images during publish
- Time-based banner system with auto-expiry
- Homepage shows active banner slider at top
- Regular articles grid below banner
- Click any article to view full detail page
- Banner auto-rotates every 5 seconds with navigation
