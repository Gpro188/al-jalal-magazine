'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy, Firestore } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface Post {
  id: string;
  title: string;
  content: string;
  studentName: string;
  status: string;
  category: any;
  authorId: string;
  createdAt: any;
}

export default function DebugPostsPage() {
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [pendingPosts, setPendingPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [queryError, setQueryError] = useState('');

  useEffect(() => {
    fetchAllPosts();
  }, []);

  const fetchAllPosts = async () => {
    try {
      console.log('Fetching all posts...');
      
      // Get ALL posts
      const postsRef = collection(db as Firestore, 'posts');
      const allSnapshot = await getDocs(postsRef);
      
      const postsList: Post[] = [];
      allSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('Post found:', {
          id: doc.id,
          title: data.title,
          status: data.status,
          studentName: data.studentName,
          category: data.category,
        });
        postsList.push({ id: doc.id, ...data } as Post);
      });

      console.log(`Total posts found: ${postsList.length}`);
      setAllPosts(postsList);

      // Try to query pending_review posts
      try {
        console.log('\nTrying to query pending_review posts...');
        const pendingQuery = query(
          postsRef,
          where('status', '==', 'pending_review')
        );
        
        const pendingSnapshot = await getDocs(pendingQuery);
        const pendingList: Post[] = [];
        
        pendingSnapshot.forEach((doc) => {
          const data = doc.data();
          console.log('Pending post:', data.title);
          pendingList.push({ id: doc.id, ...data } as Post);
        });

        console.log(`Pending posts found via query: ${pendingList.length}`);
        setPendingPosts(pendingList);
        setQueryError('');
      } catch (err: any) {
        console.error('Error querying pending posts:', err);
        setQueryError(`Query Error: ${err.message} (Code: ${err.code})`);
        
        // Fallback: filter manually
        const manualPending = postsList.filter(p => p.status === 'pending_review');
        console.log(`Manual filter found ${manualPending.length} pending posts`);
        setPendingPosts(manualPending);
      }
    } catch (error: any) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleString();
    } catch {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-700"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h1 className="font-heading text-3xl font-bold mb-2">🔍 Debug Posts</h1>
            <p className="text-gray-600">Check all posts in the database</p>
            <button
              onClick={fetchAllPosts}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              🔄 Refresh
            </button>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <p className="text-4xl font-bold text-blue-700">{allPosts.length}</p>
              <p className="text-gray-600">Total Posts</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <p className="text-4xl font-bold text-yellow-700">
                {allPosts.filter(p => p.status === 'pending_review').length}
              </p>
              <p className="text-gray-600">Pending Review</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <p className="text-4xl font-bold text-green-700">
                {allPosts.filter(p => p.status === 'published' || p.status === 'staff_approved').length}
              </p>
              <p className="text-gray-600">Published/Approved</p>
            </div>
          </div>

          {/* Query Error */}
          {queryError && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <p className="text-red-700 font-semibold">⚠️ Query Error</p>
              <p className="text-red-600 text-sm mt-1">{queryError}</p>
              <p className="text-gray-700 text-sm mt-2">
                💡 This usually means Firestore index is being created. Wait 1-2 minutes and refresh.
              </p>
            </div>
          )}

          {/* All Posts */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="font-heading text-2xl font-bold mb-4">📄 All Posts ({allPosts.length})</h2>
            
            {allPosts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No posts found in database
              </div>
            ) : (
              <div className="space-y-4">
                {allPosts.map((post) => (
                  <div key={post.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{post.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        post.status === 'pending_review' ? 'bg-yellow-100 text-yellow-800' :
                        post.status === 'staff_approved' ? 'bg-blue-100 text-blue-800' :
                        post.status === 'published' ? 'bg-green-100 text-green-800' :
                        post.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {post.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <p>👤 <strong>Student:</strong> {post.studentName}</p>
                      <p>🏛️ <strong>Union:</strong> {post.category?.union || 'N/A'}</p>
                      <p>📅 <strong>Year:</strong> {post.category?.year || 'N/A'}</p>
                      <p>🆔 <strong>ID:</strong> {post.authorId}</p>
                      <p>🕒 <strong>Created:</strong> {formatTimestamp(post.createdAt)}</p>
                    </div>
                    <div className="mt-2 bg-gray-50 p-2 rounded">
                      <p className="text-xs text-gray-500 line-clamp-2">{post.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Posts (What Editor Should See) */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="font-heading text-2xl font-bold mb-4">⏳ Pending Review Posts ({pendingPosts.length})</h2>
            <p className="text-sm text-gray-600 mb-4">
              These are the posts that should appear in the editor dashboard
            </p>
            
            {pendingPosts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No pending posts found
              </div>
            ) : (
              <div className="space-y-4">
                {pendingPosts.map((post) => (
                  <div key={post.id} className="border-2 border-yellow-300 rounded-lg p-4 bg-yellow-50">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{post.title}</h3>
                    <p className="text-sm text-gray-600">
                      by {post.studentName} • {post.category?.union}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
