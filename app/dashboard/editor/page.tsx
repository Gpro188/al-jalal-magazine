'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { collection, query, where, getDocs, updateDoc, doc, orderBy, Firestore } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';

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
  rejectionReason?: string;
  publishedAt?: any;
}

export default function EditorDashboard() {
  const router = useRouter();
  const { user, userData, loading } = useAuth();
  const [pendingPosts, setPendingPosts] = useState<Post[]>([]);
  const [approvedPosts, setApprovedPosts] = useState<Post[]>([]);
  const [rejectedPosts, setRejectedPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    
    if (user && (userData?.role === 'editor' || userData?.role === 'admin')) {
      loadAllPosts();
    }
  }, [user, userData, loading, router]);

  const loadAllPosts = async () => {
    try {
      console.log('Loading all editor posts...');
      const postsRef = collection(db as Firestore, 'posts');
      
      // Load all posts and filter client-side to avoid index issues
      const allPostsQuery = query(postsRef, orderBy('createdAt', 'desc'));
      const allPostsSnapshot = await getDocs(allPostsQuery);
      
      const pendingList: Post[] = [];
      const approvedList: Post[] = [];
      const rejectedList: Post[] = [];
      
      allPostsSnapshot.forEach((doc) => {
        const data = doc.data();
        const post = { id: doc.id, ...data } as Post;
        
        // Filter by union if editor is assigned to specific union
        const isAssignedUnion = !userData?.classUnion || 
                               data.category?.union === userData.classUnion;
        
        if (isAssignedUnion) {
          if (data.status === 'pending_review') {
            pendingList.push(post);
          } else if (data.status === 'staff_approved') {
            approvedList.push(post);
          } else if (data.status === 'rejected') {
            rejectedList.push(post);
          }
        }
      });
      
      console.log(`Found ${pendingList.length} pending, ${approvedList.length} approved, ${rejectedList.length} rejected`);
      setPendingPosts(pendingList);
      setApprovedPosts(approvedList);
      setRejectedPosts(rejectedList);
    } catch (error: any) {
      console.error('Error loading posts:', error);
      console.error('Error code:', error?.code);
      console.error('Error message:', error?.message);
    } finally {
      setPostsLoading(false);
    }
  };

  const handleApprove = async (postId: string) => {
    if (!confirm('Are you sure you want to approve this article?')) {
      return;
    }

    setActionLoading(true);
    try {
      console.log('Approving post:', postId);
      const postRef = doc(db as Firestore, 'posts', postId);
      await updateDoc(postRef, {
        status: 'staff_approved',
        publishedAt: new Date(),
        reviewedBy: user?.uid || 'union-editor',
        reviewedAt: new Date()
      });
      
      console.log('Post approved successfully');
      alert('✅ Article approved successfully! It will be published by an admin.');
      await loadAllPosts(); // Refresh all lists
    } catch (error: any) {
      console.error('Error approving post:', error);
      console.error('Error code:', error?.code);
      console.error('Error message:', error?.message);
      alert(`❌ Failed to approve article: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (postId: string) => {
    const reason = prompt('Enter rejection reason (required):');
    if (!reason || reason.trim() === '') {
      alert('Rejection reason is required');
      return;
    }
    
    setActionLoading(true);
    try {
      console.log('Rejecting post:', postId, 'Reason:', reason);
      const postRef = doc(db as Firestore, 'posts', postId);
      await updateDoc(postRef, {
        status: 'rejected',
        rejectedAt: new Date(),
        reviewedBy: user?.uid || 'union-editor',
        rejectionReason: reason.trim()
      });
      
      console.log('Post rejected successfully');
      alert('❌ Article rejected');
      await loadAllPosts(); // Refresh all lists
    } catch (error: any) {
      console.error('Error rejecting post:', error);
      console.error('Error code:', error?.code);
      console.error('Error message:', error?.message);
      alert(`❌ Failed to reject article: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const viewPost = (post: Post) => {
    setSelectedPost(post);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPost(null);
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
            Editor Dashboard
          </h1>
          <p className="text-gray-600">
            {userData?.displayName || 'Editor'} 
            {userData?.classUnion && ` • ${userData.classUnion}`}
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">📋 Pending Review</h2>
            <p className="text-4xl font-bold text-yellow-700">{pendingPosts.length}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">✅ Approved</h2>
            <p className="text-4xl font-bold text-green-700">{approvedPosts.length}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">❌ Rejected</h2>
            <p className="text-4xl font-bold text-red-700">{rejectedPosts.length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-300">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'pending'
                ? 'text-red-700 border-b-2 border-red-700'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            ⏳ Pending ({pendingPosts.length})
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'approved'
                ? 'text-green-700 border-b-2 border-green-700'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            ✅ Approved ({approvedPosts.length})
          </button>
          <button
            onClick={() => setActiveTab('rejected')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'rejected'
                ? 'text-red-700 border-b-2 border-red-700'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            ❌ Rejected ({rejectedPosts.length})
          </button>
        </div>

        {/* Articles List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="font-heading text-2xl font-bold text-gray-800 mb-6">
            {activeTab === 'pending' && 'Articles Pending Review'}
            {activeTab === 'approved' && 'Approved Articles'}
            {activeTab === 'rejected' && 'Rejected Articles'}
          </h2>

          {postsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading articles...</p>
            </div>
          ) : activeTab === 'pending' && pendingPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">🎉 No articles pending review!</p>
              <p className="text-gray-400 text-sm">Check back later for new submissions.</p>
            </div>
          ) : activeTab === 'approved' && approvedPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No approved articles yet.</p>
            </div>
          ) : activeTab === 'rejected' && rejectedPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No rejected articles.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {(activeTab === 'pending' ? pendingPosts : activeTab === 'approved' ? approvedPosts : rejectedPosts).map((post) => (
                <div 
                  key={post.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow bg-white"
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
                      post.status === 'pending_review' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                      post.status === 'staff_approved' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                      'bg-red-100 text-red-800 border-red-300'
                    }`}>
                      {post.status === 'pending_review' && '⏳ Pending Review'}
                      {post.status === 'staff_approved' && '✅ Approved'}
                      {post.status === 'rejected' && '❌ Rejected'}
                    </span>
                  </div>
                  
                  {/* Article Preview */}
                  <div className="bg-gray-50 border-l-4 border-gray-300 p-4 mb-4">
                    <p className="text-gray-700 line-clamp-3">
                      {post.content?.substring(0, 200)}...
                    </p>
                  </div>

                  {/* Rejection Reason */}
                  {post.rejectionReason && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                      <p className="text-sm text-red-800">
                        <strong>Rejection Reason:</strong> {post.rejectionReason}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons - Only for pending */}
                  {activeTab === 'pending' && (
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => viewPost(post)}
                        className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center gap-2"
                      >
                        📖 Read Full Article
                      </button>
                      <button
                        onClick={() => handleApprove(post.id)}
                        disabled={actionLoading}
                        className={`px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 ${
                          actionLoading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        ✅ Approve
                      </button>
                      <button
                        onClick={() => handleReject(post.id)}
                        disabled={actionLoading}
                        className={`px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 ${
                          actionLoading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-red-600 text-white hover:bg-red-700'
                        }`}
                      >
                        ❌ Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Article Reading Modal */}
      {showModal && selectedPost && (
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
                  onClick={closeModal}
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
              {/* Article Content */}
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
                  onClick={() => {
                    handleApprove(selectedPost.id);
                    closeModal();
                  }}
                  disabled={actionLoading}
                  className={`flex-1 px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 ${
                    actionLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  ✅ Approve & Publish
                </button>
                <button
                  onClick={() => {
                    handleReject(selectedPost.id);
                    closeModal();
                  }}
                  disabled={actionLoading}
                  className={`flex-1 px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 ${
                    actionLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  ❌ Reject
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
