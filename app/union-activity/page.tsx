'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface Activity {
  id: string;
  type: 'submission' | 'approval' | 'rejection';
  title: string;
  studentName: string;
  status: string;
  timestamp: any;
  union: string;
  year: string;
  rejectionReason?: string;
  content?: string;
}

export default function UnionActivityPage() {
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [unionLogin, setUnionLogin] = useState<any>(null);
  const [filter, setFilter] = useState<'all' | 'pending_review' | 'staff_approved' | 'published' | 'rejected'>('all');

  useEffect(() => {
    // Check if logged in via union
    const storedLogin = sessionStorage.getItem('unionLogin');
    if (!storedLogin) {
      router.push('/login');
      return;
    }

    const loginData = JSON.parse(storedLogin);
    setUnionLogin(loginData);

    // Fetch activities for this union
    fetchActivities(loginData.unionName);
  }, [router]);

  const fetchActivities = async (unionName: string) => {
    try {
      console.log('Fetching activities for union:', unionName);
      const postsRef = collection(db, 'posts');
      
      // Load all posts and filter client-side to avoid index issues
      const allPostsQuery = query(postsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(allPostsQuery);
      
      const activitiesList: Activity[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        // Filter by union client-side
        if (data.category?.union === unionName) {
          activitiesList.push({
            id: doc.id,
            type: getActivityType(data.status),
            title: data.title || 'Untitled',
            studentName: data.studentName || 'Anonymous',
            status: data.status,
            timestamp: data.createdAt,
            union: data.category?.union || 'Unknown',
            year: data.category?.year || 'Unknown',
            rejectionReason: data.rejectionReason,
            content: data.content,
          });
        }
      });

      console.log(`Found ${activitiesList.length} activities for ${unionName}`);
      setActivities(activitiesList);
    } catch (error: any) {
      console.error('Error fetching activities:', error);
      console.error('Error code:', error?.code);
      console.error('Error message:', error?.message);
    } finally {
      setLoading(false);
    }
  };

  const getActivityType = (status: string): 'submission' | 'approval' | 'rejection' => {
    if (status === 'pending_review') return 'submission';
    if (status === 'published' || status === 'staff_approved') return 'approval';
    if (status === 'rejected') return 'rejection';
    return 'submission';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'staff_approved':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'published':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_review':
        return '⏳';
      case 'staff_approved':
        return '✅';
      case 'published':
        return '🎉';
      case 'rejected':
        return '❌';
      default:
        return '📝';
    }
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return 'Unknown date';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'Unknown date';
    }
  };

  const filteredActivities = filter === 'all' 
    ? activities 
    : activities.filter(a => a.status === filter);

  const handleLogout = () => {
    sessionStorage.removeItem('unionLogin');
    router.push('/login');
  };

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
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-700 to-orange-600 text-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="font-heading text-3xl font-bold mb-2">
                  {unionLogin?.unionName} - Activity History
                </h1>
                <p className="text-red-100">
                  Track all article submissions and their status
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => router.push('/submit')}
                  className="bg-white text-red-700 px-4 py-2 rounded-lg font-semibold hover:bg-red-50 transition-colors"
                >
                  ➕ New Article
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-red-800 text-white px-4 py-2 rounded-lg hover:bg-red-900 transition-colors"
                >
                  🚪 Logout
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <p className="text-3xl font-bold text-gray-900">{activities.length}</p>
              <p className="text-sm text-gray-600">Total</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <p className="text-3xl font-bold text-yellow-700">
                {activities.filter(a => a.status === 'pending_review').length}
              </p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <p className="text-3xl font-bold text-green-700">
                {activities.filter(a => a.status === 'published').length}
              </p>
              <p className="text-sm text-gray-600">Published</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <p className="text-3xl font-bold text-red-700">
                {activities.filter(a => a.status === 'rejected').length}
              </p>
              <p className="text-sm text-gray-600">Rejected</p>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-red-700 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({activities.length})
              </button>
              <button
                onClick={() => setFilter('pending_review')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'pending_review'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                }`}
              >
                ⏳ Pending ({activities.filter(a => a.status === 'pending_review').length})
              </button>
              <button
                onClick={() => setFilter('staff_approved')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'staff_approved'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                ✅ Approved ({activities.filter(a => a.status === 'staff_approved').length})
              </button>
              <button
                onClick={() => setFilter('published')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'published'
                    ? 'bg-green-600 text-white'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                🎉 Published ({activities.filter(a => a.status === 'published').length})
              </button>
              <button
                onClick={() => setFilter('rejected')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'rejected'
                    ? 'bg-red-600 text-white'
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                }`}
              >
                ❌ Rejected ({activities.filter(a => a.status === 'rejected').length})
              </button>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="font-heading text-2xl font-bold text-gray-900 mb-6">
              📋 Activity Timeline
            </h2>

            {filteredActivities.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <p className="text-gray-500 text-lg">No activities found</p>
                <button
                  onClick={() => router.push('/submit')}
                  className="mt-4 bg-red-700 text-white px-6 py-2 rounded-lg hover:bg-red-800 transition-colors"
                >
                  Submit Your First Article
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredActivities.map((activity, index) => (
                  <div
                    key={activity.id}
                    className="border-l-4 border-red-700 pl-4 pb-4 relative"
                  >
                    {/* Timeline dot */}
                    <div className="absolute -left-3 top-0 h-6 w-6 rounded-full bg-red-700 border-4 border-white"></div>
                    
                    <div className="bg-gray-50 rounded-lg p-4 ml-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-lg">
                            {activity.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            by <span className="font-semibold">{activity.studentName}</span>
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(activity.status)}`}>
                          {getStatusIcon(activity.status)} {activity.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-3">
                        <span className="flex items-center gap-1">
                          🕒 {formatTimestamp(activity.timestamp)}
                        </span>
                        <span className="flex items-center gap-1">
                          📅 {activity.year}
                        </span>
                        {activity.rejectionReason && (
                          <span className="text-red-600">
                            💬 {activity.rejectionReason}
                          </span>
                        )}
                      </div>

                      {/* Edit button for rejected articles */}
                      {activity.status === 'rejected' && (
                        <button
                          onClick={() => handleEditRejected(activity)}
                          className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold flex items-center gap-2"
                        >
                          ✏️ Edit & Resubmit
                        </button>
                      )}
                    </div>
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
