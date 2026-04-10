'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { collection, query, where, getDocs, orderBy, Timestamp, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import { updatePostStatus, uploadFeaturedImage } from '@/lib/firestore';

interface Post {
  id: string;
  title: string;
  content: string;
  studentName: string;
  category: {
    union: string;
    year: string;
  };
  status: string;
  createdAt: any;
  publishedAt?: any;
  featuredImage?: string;
  isBanner?: boolean;
  bannerStart?: any;
  bannerEnd?: any;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, userData, loading, isAdmin } = useAuth();
  const [approvedPosts, setApprovedPosts] = useState<Post[]>([]);
  const [publishedPosts, setPublishedPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'approved' | 'published'>('approved');
  
  // Modal states
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showReadModal, setShowReadModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  
  // Banner states
  const [setAsBanner, setSetAsBanner] = useState(false);
  const [bannerImageUrl, setBannerImageUrl] = useState<string>('');
  const [bannerPreview, setBannerPreview] = useState<string>('');
  const [bannerStart, setBannerStart] = useState('');
  const [bannerEnd, setBannerEnd] = useState('');
  const [publishing, setPublishing] = useState(false);
  
  // Cover image state (for normal publish)
  const [coverImageUrl, setCoverImageUrl] = useState<string>('');
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [showCoverUpload, setShowCoverUpload] = useState(false);
  
  // Text size options
  const [titleSize, setTitleSize] = useState<'small' | 'medium' | 'large'>('large');
  const [subtitleSize, setSubtitleSize] = useState<'small' | 'medium' | 'large'>('medium');

  useEffect(() => {
    if (!loading && (!user || !isAdmin())) {
      router.push('/login');
    }
    
    if (user && isAdmin()) {
      loadPosts();
    }
  }, [user, userData, loading, router, isAdmin]);

  const loadPosts = async () => {
    try {
      console.log('Loading admin posts...');
      const postsRef = collection(db, 'posts');
      
      // Load all posts and filter client-side to avoid index issues
      const allPostsQuery = query(postsRef, orderBy('createdAt', 'desc'));
      const allPostsSnapshot = await getDocs(allPostsQuery);
      
      const approvedList: Post[] = [];
      const publishedList: Post[] = [];
      
      allPostsSnapshot.forEach((doc) => {
        const data = doc.data();
        const post = { id: doc.id, ...data } as Post;
        
        if (data.status === 'staff_approved') {
          approvedList.push(post);
        } else if (data.status === 'published') {
          publishedList.push(post);
        }
      });
      
      console.log(`Found ${approvedList.length} approved, ${publishedList.length} published posts`);
      setApprovedPosts(approvedList);
      setPublishedPosts(publishedList);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setPostsLoading(false);
    }
  };

  // Read article handler
  const handleReadArticle = (post: Post) => {
    setSelectedPost(post);
    setShowReadModal(true);
  };

  // Open publish modal
  const openPublishModal = (post: Post) => {
    setSelectedPost(post);
    setSetAsBanner(false);
    setBannerImageUrl('');
    setBannerPreview('');
    // Default banner times
    const now = new Date();
    const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    setBannerStart(now.toISOString().slice(0, 16));
    setBannerEnd(endDate.toISOString().slice(0, 16));
    setShowPublishModal(true);
    setShowReadModal(false);
  };

  // Handle banner image URL change
  const handleBannerUrlChange = (url: string) => {
    setBannerImageUrl(url);
    setBannerPreview(url);
  };

  // Handle cover image URL change
  const handleCoverUrlChange = (url: string) => {
    setCoverImageUrl(url);
    setCoverPreview(url);
  };

  // Quick publish without banner
  const handleQuickPublish = async (postId: string) => {
    // Show cover upload option first
    setShowCoverUpload(true);
    setSelectedPost(approvedPosts.find(p => p.id === postId) || null);
  };

  // Complete quick publish with optional cover
  const completeQuickPublish = async () => {
    if (!selectedPost) return;

    setPublishing(true);
    try {
      console.log('Starting publish for post:', selectedPost.id);
      const updateData: any = {
        publishedAt: Timestamp.now(),
      };

      // Use cover image URL if provided
      if (coverImageUrl.trim()) {
        updateData.featuredImage = coverImageUrl.trim();
        console.log('Using cover image URL:', coverImageUrl);
      }

      console.log('Updating post status to published...');
      await updatePostStatus(selectedPost.id, 'published', updateData);
      console.log('Post published successfully');
      
      if (coverImageUrl.trim()) {
        alert('✅ Article published successfully with cover image!');
      } else {
        alert('✅ Article published successfully!');
      }
      
      // Reset and close
      setShowCoverUpload(false);
      setSelectedPost(null);
      setCoverImageUrl('');
      setCoverPreview('');
      
      // Reload posts in background (don't await)
      loadPosts().then(() => {
        console.log('Posts reloaded successfully');
      }).catch((error) => {
        console.error('Failed to reload posts:', error);
      });
    } catch (error: any) {
      console.error('Error publishing:', error);
      alert('❌ Failed to publish: ' + error.message);
    } finally {
      setPublishing(false);
      console.log('Publishing state reset');
    }
  };

  // Publish with banner
  const handlePublishWithBanner = async () => {
    if (!selectedPost) return;

    setPublishing(true);
    try {
      console.log('Starting banner publish for post:', selectedPost.id);
      const updateData: any = {
        publishedAt: Timestamp.now(),
        titleSize,
        subtitleSize,
      };

      if (setAsBanner && bannerImageUrl.trim()) {
        updateData.featuredImage = bannerImageUrl.trim();
        updateData.isBanner = true;
        updateData.bannerStart = Timestamp.fromDate(new Date(bannerStart));
        updateData.bannerEnd = Timestamp.fromDate(new Date(bannerEnd));
        console.log('Using banner image URL:', bannerImageUrl);
      }

      console.log('Updating post status to published...');
      await updatePostStatus(selectedPost.id, 'published', updateData);
      console.log('Post published successfully');
      
      alert('✅ Article published successfully!' + (setAsBanner ? ' Banner set.' : ''));
      
      // Reset and close
      setShowPublishModal(false);
      setSelectedPost(null);
      setBannerImageUrl('');
      setBannerPreview('');
      setSetAsBanner(false);
      setTitleSize('large');
      setSubtitleSize('medium');
      
      // Reload posts in background (don't await)
      loadPosts().then(() => {
        console.log('Posts reloaded successfully');
      }).catch((error) => {
        console.error('Failed to reload posts:', error);
      });
    } catch (error: any) {
      console.error('Error publishing with banner:', error);
      alert('❌ Failed to publish: ' + error.message);
    } finally {
      setPublishing(false);
      console.log('Publishing state reset');
    }
  };

  // Delete post handler
  const handleDeletePost = async (postId: string, postTitle: string, postStatus: string) => {
    const confirmMessage = `Are you sure you want to delete "${postTitle}"?\n\nThis action cannot be undone!`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      console.log('Deleting post:', postId);
      await deleteDoc(doc(db, 'posts', postId));
      alert('✅ Article deleted successfully!');
      
      // Reload posts
      await loadPosts();
    } catch (error: any) {
      console.error('Error deleting post:', error);
      alert('❌ Failed to delete article: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="font-heading text-3xl font-bold text-gray-800 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            {userData?.displayName || 'Administrator'}
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Manage Panel */}
          <Link 
            href="/dashboard/admin/manage"
            className="bg-gradient-to-r from-red-700 to-red-600 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            <h2 className="text-2xl font-bold mb-2">⚙️ Manage</h2>
            <p className="opacity-90">Create unions & editors</p>
          </Link>

          {/* View All Articles */}
          <Link 
            href="/"
            className="bg-white border-2 border-red-700 text-red-700 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h2 className="text-2xl font-bold mb-2">📰 View Articles</h2>
            <p className="text-gray-600">Browse published articles</p>
          </Link>

          {/* Submit Article */}
          <Link 
            href="/submit"
            className="bg-white border-2 border-red-700 text-red-700 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h2 className="text-2xl font-bold mb-2">📝 Submit Article</h2>
            <p className="text-gray-600">Create new content</p>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">✅ Approved (Awaiting Publication)</h2>
            <p className="text-4xl font-bold text-blue-700">{approvedPosts.length}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">🎉 Published</h2>
            <p className="text-4xl font-bold text-green-700">{publishedPosts.length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-300">
          <button
            onClick={() => setActiveTab('approved')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'approved'
                ? 'text-blue-700 border-b-2 border-blue-700'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            ✅ Approved ({approvedPosts.length})
          </button>
          <button
            onClick={() => setActiveTab('published')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'published'
                ? 'text-green-700 border-b-2 border-green-700'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            🎉 Published ({publishedPosts.length})
          </button>
        </div>

        {/* Posts List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="font-heading text-2xl font-bold text-gray-800 mb-6">
            {activeTab === 'approved' && 'Approved Articles (Awaiting Publication)'}
            {activeTab === 'published' && 'Published Articles'}
          </h2>

          {postsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading posts...</p>
            </div>
          ) : activeTab === 'approved' && approvedPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No approved articles awaiting publication.</p>
            </div>
          ) : activeTab === 'published' && publishedPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No published articles yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {(activeTab === 'approved' ? approvedPosts : publishedPosts).map((post) => (
                <div 
                  key={post.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow bg-gray-50"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{post.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          👤 {post.studentName}
                        </span>
                        <span className="flex items-center gap-1">
                          🏛️ {post.category?.union}
                        </span>
                        <span className="flex items-center gap-1">
                          📅 Year {post.category?.year}
                        </span>
                      </div>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${
                      activeTab === 'approved' 
                        ? 'bg-blue-100 text-blue-800 border-blue-300'
                        : 'bg-green-100 text-green-800 border-green-300'
                    }`}>
                      {activeTab === 'approved' && '✅ Approved'}
                      {activeTab === 'published' && '🎉 Published'}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-500 mb-4">
                    🕒 {post.publishedAt ? new Date(post.publishedAt.toDate()).toLocaleString() : 'N/A'}
                  </div>

                  {/* Action buttons for approved posts */}
                  {activeTab === 'approved' && (
                    <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleReadArticle(post)}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                      >
                        📖 Read Article
                      </button>
                      <button
                        onClick={() => handleQuickPublish(post.id)}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                      >
                        ✅ Publish (No Banner)
                      </button>
                      <button
                        onClick={() => openPublishModal(post)}
                        className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                      >
                        🎯 Publish with Banner
                      </button>
                      <button
                        onClick={() => handleDeletePost(post.id, post.title, post.status)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold"
                        title="Delete Article"
                      >
                        🗑️
                      </button>
                    </div>
                  )}

                  {/* Action buttons for published posts */}
                  {activeTab === 'published' && (
                    <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200">
                      <Link
                        href={`/article/${post.id}`}
                        target="_blank"
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-center"
                      >
                        🔗 View Article
                      </Link>
                      <button
                        onClick={() => handleDeletePost(post.id, post.title, post.status)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold"
                        title="Delete Article"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  )}

                  {/* Show banner info if published with banner */}
                  {activeTab === 'published' && post.isBanner && post.bannerEnd && (
                    <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <p className="text-sm text-purple-800 font-semibold">
                        🎯 Banner Active
                      </p>
                      <p className="text-xs text-purple-700 mt-1">
                        Ends: {new Date(post.bannerEnd.toDate()).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Admin Permissions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="font-heading text-2xl font-bold text-gray-800 mb-4">
            Your Admin Permissions
          </h2>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-center gap-2">
              <span className="text-green-600">✅</span>
              Create and delete Class Unions
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✅</span>
              Create and remove Editors
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✅</span>
              Assign editors to specific unions
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✅</span>
              Review and approve all articles
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✅</span>
              Access full management dashboard
            </li>
          </ul>
        </div>
      </main>

      {/* Read Article Modal */}
      {showReadModal && selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h2 className="font-heading text-3xl font-bold mb-2">{selectedPost.title}</h2>
                  <div className="flex items-center gap-4 text-sm text-blue-100">
                    <span>👤 {selectedPost.studentName}</span>
                    <span>🏛️ {selectedPost.category?.union}</span>
                    <span>📅 Year {selectedPost.category?.year}</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowReadModal(false)}
                  className="text-white hover:text-gray-200 transition-colors ml-4"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="prose max-w-none mb-6">
                <div className="bg-gray-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
                  <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-wrap">
                    {selectedPost.content}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleQuickPublish(selectedPost.id)}
                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                  ✅ Publish (No Banner)
                </button>
                <button
                  onClick={() => openPublishModal(selectedPost)}
                  className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                >
                  🎯 Publish with Banner
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Publish with Banner Modal */}
      {showPublishModal && selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-heading text-2xl font-bold mb-1">Publish with Banner</h2>
                  <p className="text-sm text-purple-100">{selectedPost.title}</p>
                </div>
                <button
                  onClick={() => {
                    setShowPublishModal(false);
                    setSetAsBanner(false);
                    setBannerImageUrl('');
                    setBannerPreview('');
                  }}
                  className="text-white hover:text-gray-200 transition-colors ml-4"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Banner Toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="setAsBanner"
                  checked={setAsBanner}
                  onChange={(e) => setSetAsBanner(e.target.checked)}
                  className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="setAsBanner" className="text-lg font-semibold text-gray-800">
                  🎯 Set as Banner Article
                </label>
              </div>

              {setAsBanner && (
                <>
                  {/* Banner Image URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Banner Image URL *
                    </label>
                    <input
                      type="url"
                      value={bannerImageUrl}
                      onChange={(e) => handleBannerUrlChange(e.target.value)}
                      placeholder="https://example.com/banner.jpg"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                    {bannerPreview && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-600 mb-2">Preview:</p>
                        <img 
                          src={bannerPreview} 
                          alt="Banner preview" 
                          className="h-40 w-full object-cover rounded-lg border border-gray-300"
                          onError={() => setBannerPreview('')}
                        />
                      </div>
                    )}
                  </div>

                  {/* Banner Start Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Banner Start Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={bannerStart}
                      onChange={(e) => setBannerStart(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {/* Banner End Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Banner End Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={bannerEnd}
                      onChange={(e) => setBannerEnd(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Banner will automatically expire after this time
                    </p>
                  </div>

                  {/* Text Size Options */}
                  <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                    <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                      🔤 Text Size Settings
                    </h4>
                    
                    {/* Title Size */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title Size
                      </label>
                      <div className="flex gap-2">
                        {(['small', 'medium', 'large'] as const).map((size) => (
                          <button
                            key={size}
                            onClick={() => setTitleSize(size)}
                            className={`flex-1 py-2 px-3 rounded-lg border-2 transition-all ${
                              titleSize === size
                                ? 'border-purple-600 bg-purple-50 text-purple-700 font-semibold'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            <div className={
                              size === 'small' ? 'text-sm' : size === 'medium' ? 'text-base' : 'text-lg'
                            }>
                              {size.charAt(0).toUpperCase() + size.slice(1)}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Subtitle Size */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subtitle/Description Size
                      </label>
                      <div className="flex gap-2">
                        {(['small', 'medium', 'large'] as const).map((size) => (
                          <button
                            key={size}
                            onClick={() => setSubtitleSize(size)}
                            className={`flex-1 py-2 px-3 rounded-lg border-2 transition-all ${
                              subtitleSize === size
                                ? 'border-purple-600 bg-purple-50 text-purple-700 font-semibold'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            <div className={
                              size === 'small' ? 'text-xs' : size === 'medium' ? 'text-sm' : 'text-base'
                            }>
                              {size.charAt(0).toUpperCase() + size.slice(1)}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowPublishModal(false);
                    setSetAsBanner(false);
                    setBannerImageUrl('');
                    setBannerPreview('');
                  }}
                  className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePublishWithBanner}
                  disabled={publishing || (setAsBanner && !bannerImageUrl.trim())}
                  className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors ${
                    publishing || (setAsBanner && !bannerImageUrl.trim())
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  {publishing ? 'Publishing...' : 'Publish Article'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cover Image Upload Modal (for quick publish) */}
      {showCoverUpload && selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-teal-600 text-white p-6 rounded-t-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-heading text-2xl font-bold mb-1">Publish Article</h2>
                  <p className="text-sm text-green-100">{selectedPost.title}</p>
                </div>
                <button
                  onClick={() => {
                    setShowCoverUpload(false);
                    setCoverImageUrl('');
                    setCoverPreview('');
                    setSelectedPost(null);
                  }}
                  className="text-white hover:text-gray-200 transition-colors ml-4"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                <p className="text-sm text-blue-900">
                  <strong>💡 Tip:</strong> Add an image URL to make your article more attractive! You can use images from:
                </p>
                <ul className="text-sm text-blue-800 mt-2 ml-4 list-disc">
                  <li>Unsplash: <a href="https://unsplash.com" target="_blank" className="underline">unsplash.com</a></li>
                  <li>Pexels: <a href="https://pexels.com" target="_blank" className="underline">pexels.com</a></li>
                  <li>Any direct image URL (ends with .jpg, .png, .webp)</li>
                </ul>
              </div>

              {/* Cover Image URL Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📷 Cover Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={coverImageUrl}
                  onChange={(e) => handleCoverUrlChange(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Paste a direct link to an image
                </p>
                {coverPreview && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-600 mb-2">Preview:</p>
                    <img 
                      src={coverPreview} 
                      alt="Cover preview" 
                      className="h-48 w-full object-cover rounded-lg border border-gray-300"
                      onError={() => setCoverPreview('')}
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowCoverUpload(false);
                    setCoverImageUrl('');
                    setCoverPreview('');
                    setSelectedPost(null);
                  }}
                  className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={completeQuickPublish}
                  disabled={publishing}
                  className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors ${
                    publishing
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {publishing ? 'Publishing...' : (coverImageUrl.trim() ? 'Publish with Cover' : 'Publish Without Cover')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
