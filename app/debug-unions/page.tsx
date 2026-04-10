'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface Union {
  id: string;
  name: string;
  color: string;
  icon: string;
  logoUrl?: string;
  createdAt: any;
}

export default function DebugUnionsPage() {
  const router = useRouter();
  const { user, userData, loading } = useAuth();
  const [unions, setUnions] = useState<Union[]>([]);
  const [loadingUnions, setLoadingUnions] = useState(true);

  useEffect(() => {
    // Allow anyone to view this debug page
    fetchUnions();
  }, []);

  const fetchUnions = async () => {
    try {
      console.log('Fetching all unions from Firestore...');
      const unionsRef = collection(db, 'classUnions');
      const querySnapshot = await getDocs(unionsRef);
      
      console.log('Total unions found:', querySnapshot.size);
      
      const unionsList: Union[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('Union document:', doc.id, data);
        unionsList.push({ id: doc.id, ...data } as Union);
      });
      
      setUnions(unionsList);
    } catch (error) {
      console.error('Error fetching unions:', error);
    } finally {
      setLoadingUnions(false);
    }
  };

  const getLoginUrl = (unionName: string) => {
    const slug = unionName.toLowerCase().split(' ')[0];
    return `/login/${slug}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-heading text-4xl font-bold text-gray-900 mb-2">
              🔍 Union Debug Page
            </h1>
            <p className="text-gray-700">
              View all Class Unions in the database and their login URLs
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={fetchUnions}
              className="bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition-colors"
            >
              🔄 Refresh Data
            </button>
            <button
              onClick={() => router.push('/dashboard/admin/manage')}
              className="bg-red-700 text-white px-6 py-2 rounded-lg hover:bg-red-800 transition-colors"
            >
              ⚙️ Manage Unions
            </button>
            <button
              onClick={() => router.push('/login')}
              className="bg-gray-700 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              🏠 Main Login
            </button>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">📋 How to Use:</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• This page shows all unions stored in Firestore</li>
              <li>• Click "Test Login" to try the union's login page</li>
              <li>• The slug is generated from the first word of the union name (lowercase)</li>
              <li>• If a union is missing, create it in the Admin Management page</li>
            </ul>
          </div>

          {/* Unions List */}
          {loadingUnions ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading unions...</p>
            </div>
          ) : unions.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-500 mb-4">No Class Unions found in the database</p>
              <button
                onClick={() => router.push('/dashboard/admin/manage')}
                className="bg-red-700 text-white px-6 py-2 rounded-lg hover:bg-red-800 transition-colors"
              >
                ➕ Create Your First Union
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {unions.map((union) => {
                const loginUrl = getLoginUrl(union.name);
                const fullUrl = `${window.location.origin}${loginUrl}`;
                
                return (
                  <div
                    key={union.id}
                    className="bg-white rounded-lg shadow-md p-6 border-l-4"
                    style={{ borderColor: union.color.replace('-700', '-500') }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        {union.logoUrl ? (
                          <img 
                            src={union.logoUrl} 
                            alt={union.name}
                            className="h-16 w-16 object-contain"
                          />
                        ) : union.icon ? (
                          <span className="text-4xl">{union.icon}</span>
                        ) : (
                          <div className="h-16 w-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-2xl font-bold text-gray-600">
                              {union.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        
                        <div>
                          <h3 className="font-heading text-xl font-bold text-gray-900">
                            {union.name}
                          </h3>
                          <p className="text-sm text-gray-700 mt-1">
                            Color: {union.color}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Document ID: {union.id}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <a
                          href={loginUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition-colors text-sm"
                        >
                          🔗 Test Login
                        </a>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(fullUrl);
                            alert('✅ URL copied to clipboard!');
                          }}
                          className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors text-sm"
                        >
                          📋 Copy URL
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-700 mb-2">Login URL:</p>
                      <code className="block bg-gray-100 px-4 py-2 rounded text-sm text-gray-900 break-all">
                        {fullUrl}
                      </code>
                      <p className="text-xs text-gray-500 mt-2">
                        Slug: <strong>{union.name.toLowerCase().split(' ')[0]}</strong>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Debug Info */}
          <div className="mt-8 bg-gray-100 rounded-lg p-6">
            <h3 className="font-heading text-lg font-bold text-gray-900 mb-4">
              🔧 Technical Information
            </h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p><strong>Total Unions:</strong> {unions.length}</p>
              <p><strong>Current User:</strong> {user ? user.email : 'Not logged in'}</p>
              <p><strong>User Role:</strong> {userData?.role || 'N/A'}</p>
              <p><strong>Firebase Project:</strong> {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
