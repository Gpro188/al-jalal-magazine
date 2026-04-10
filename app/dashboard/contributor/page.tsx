'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { collection, query, where, getDocs, orderBy, Firestore } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';

interface Post {
  id: string;
  title: string;
  category: {
    union: string;
    year: string;
  };
  status: string;
  createdAt: any;
  rejectionReason?: string;
}

export default function ContributorDashboard() {
  const router = useRouter();
  const { user, userData, loading, signOut } = useAuth();
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    
    if (user && userData?.role === 'contributor') {
      loadMyPosts();
    }
  }, [user, userData, loading, router]);

  const loadMyPosts = async () => {
    if (!user) return;
    
    try {
      const postsRef = collection(db as Firestore, 'posts');
      
      // Load all posts and filter client-side to avoid index issues
      const allPostsQuery = query(postsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(allPostsQuery);
      
      const postsList: Post[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Filter by authorId client-side
        if (data.authorId === user.uid) {
          postsList.push({ id: doc.id, ...data } as Post);
        }
      });
      
      console.log(`Found ${postsList.length} posts for user ${user.uid}`);
      setMyPosts(postsList);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setPostsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-700';
      case 'pending_review':
        return 'bg-yellow-100 text-yellow-700';
      case 'staff_approved':
        return 'bg-blue-100 text-blue-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return '🎉';
      case 'pending_review':
        return '⏳';
      case 'staff_approved':
        return '✅';
      case 'rejected':
        return '❌';
      default:
        return '📝';
    }
  };

  const filteredPosts = filter === 'all' 
    ? myPosts 
    : myPosts.filter(p => p.status === filter);

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
            Welcome back, {userData?.displayName || 'Contributor'}!
          </h1>
          <p className="text-gray-600">
            {userData?.classUnion || 'Student'} • {userData?.role}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Link 
            href="/submit"
            className="bg-gradient-to-r from-red-700 to-red-600 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            <h2 className="text-2xl font-bold mb-2">📝 Submit New Article</h2>
            <p className="opacity-90">Share your story with the school community</p>
          </Link>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">📊 Your Stats</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-red-700">{myPosts.length}</p>
                <p className="text-sm text-gray-600">Total</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-700">
                  {myPosts.filter(p => p.status === 'pending_review').length}
                </p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-700">
                  {myPosts.filter(p => p.status === 'published').length}
                </p>
                <p className="text-sm text-gray-600">Published</p>
              </div>
            </div>
          </div>
        </div>

        {/* My Submissions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="font-heading text-2xl font-bold text-gray-800 mb-6">
            📋 Activity History
          </h2>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-red-700 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({myPosts.length})
            </button>
            <button
              onClick={() => setFilter('pending_review')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'pending_review'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
              }`}
            >
              ⏳ Pending ({myPosts.filter(p => p.status === 'pending_review').length})
            </button>
            <button
              onClick={() => setFilter('staff_approved')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'staff_approved'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              ✅ Approved ({myPosts.filter(p => p.status === 'staff_approved').length})
            </button>
            <button
              onClick={() => setFilter('published')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'published'
                  ? 'bg-green-600 text-white'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              🎉 Published ({myPosts.filter(p => p.status === 'published').length})
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'rejected'
                  ? 'bg-red-600 text-white'
                  : 'bg-red-100 text-red-700 hover:bg-red-200'
              }`}
            >
              ❌ Rejected ({myPosts.filter(p => p.status === 'rejected').length})
            </button>
          </div>

          {postsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading your submissions...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">
                {filter === 'all' 
                  ? "You haven't submitted any articles yet." 
                  : `No ${filter.replace('_', ' ')} articles found.`}
              </p>
              <Link 
                href="/submit"
                className="inline-block bg-red-700 text-white px-6 py-3 rounded-lg hover:bg-red-800 transition-colors"
              >
                Submit Your First Article
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Title</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Union</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPosts.map((post) => (
                    <tr key={post.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-800">{post.title}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{post.category?.union || 'N/A'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(post.status)}`}>
                          {getStatusIcon(post.status)} {post.status.replace('_', ' ')}
                        </span>
                        {post.status === 'rejected' && post.rejectionReason && (
                          <p className="text-xs text-red-600 mt-1">
                            💬 {post.rejectionReason}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(post.createdAt?.toDate()).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
