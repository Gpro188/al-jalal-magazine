'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { collection, getDocs, query, orderBy, Firestore } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface Union {
  id: string;
  name: string;
  color: string;
  icon: string;
  createdAt: any;
}

export default function AdminUnionsPage() {
  const router = useRouter();
  const { user, userData, loading } = useAuth();
  const [unions, setUnions] = useState<Union[]>([]);

  useEffect(() => {
    if (!loading && (!user || userData?.role !== 'admin')) {
      router.push('/login');
    }
    
    if (user && userData?.role === 'admin') {
      fetchUnions();
    }
  }, [user, userData, loading, router]);

  const fetchUnions = async () => {
    try {
      const unionsRef = collection(db as Firestore, 'classUnions');
      const q = query(unionsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const unionsList: Union[] = [];
      querySnapshot.forEach((doc) => {
        unionsList.push({ id: doc.id, ...doc.data() } as Union);
      });
      setUnions(unionsList);
    } catch (error) {
      console.error('Error fetching unions:', error);
    }
  };

  const getColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      'red-700': 'bg-red-100 text-red-700 border-red-300',
      'blue-700': 'bg-blue-100 text-blue-700 border-blue-300',
      'green-700': 'bg-green-100 text-green-700 border-green-300',
      'purple-700': 'bg-purple-100 text-purple-700 border-purple-300',
      'orange-700': 'bg-orange-100 text-orange-700 border-orange-300',
      'teal-700': 'bg-teal-100 text-teal-700 border-teal-300',
    };
    return colorMap[color] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('✅ Login link copied to clipboard!');
  };

  if (loading || !user || userData?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-heading text-4xl font-bold text-gray-900 mb-2">
              🏛️ Class Union Login Portals
            </h1>
            <p className="text-gray-700">
              Share these secure login links with students from each Class Union
            </p>
          </div>

          {/* Info Card */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-900">
                  <strong>Admin Only:</strong> These login portals are hidden from the main navigation. 
                  Share the specific link with each Class Union's students.
                </p>
              </div>
            </div>
          </div>

          {/* Unions List */}
          {unions.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-500 mb-4">No Class Unions created yet</p>
              <button
                onClick={() => router.push('/dashboard/admin/manage')}
                className="bg-red-700 text-white px-6 py-2 rounded-lg hover:bg-red-800 transition-colors"
              >
                ➕ Create Your First Union
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {unions.map((union) => {
                const loginUrl = `${window.location.origin}/login/${union.name.toLowerCase().split(' ')[0]}`;
                const colorClass = getColorClass(union.color);
                
                return (
                  <div
                    key={union.id}
                    className="bg-white rounded-lg shadow-md p-6 border-l-4"
                    style={{ borderColor: union.color.replace('-700', '-500') }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-4xl">{union.icon}</span>
                        <div>
                          <h3 className="font-heading text-2xl font-bold text-gray-900">
                            {union.name}
                          </h3>
                          <p className="text-sm text-gray-700 mt-1">
                            Theme: {union.color}
                          </p>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => copyToClipboard(loginUrl)}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors ${colorClass}`}
                      >
                        📋 Copy Login Link
                      </button>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-700 mb-2">Login URL:</p>
                      <code className="block bg-gray-100 px-4 py-2 rounded text-sm text-gray-900 break-all">
                        {loginUrl}
                      </code>
                      <p className="text-xs text-gray-700 mt-2">
                        💡 Share this link with {union.name} students
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick Actions */}
          <div className="mt-8 flex gap-4">
            <button
              onClick={() => router.push('/dashboard/admin/manage')}
              className="flex-1 bg-red-700 text-white py-3 rounded-lg font-semibold hover:bg-red-800 transition-colors"
            >
              ⚙️ Manage Unions & Editors
            </button>
            <button
              onClick={() => router.push('/dashboard/admin')}
              className="flex-1 bg-gray-700 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              ← Back to Admin Dashboard
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
