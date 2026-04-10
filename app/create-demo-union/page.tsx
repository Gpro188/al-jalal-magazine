'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, serverTimestamp, Firestore } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function CreateDemoUnionPage() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(false);
  const [error, setError] = useState('');
  const [unionData, setUnionData] = useState<any>(null);

  const createDemoUnion = async () => {
    setCreating(true);
    setError('');

    try {
      console.log('Creating demo union...');
      
      const demoUnion = {
        name: 'Demo Union',
        username: 'demo2024',
        password: 'Demo@123',
        color: 'red-700',
        icon: '🎓',
        createdAt: serverTimestamp(),
      };

      console.log('Union data:', demoUnion);

      const docRef = await addDoc(collection(db as Firestore, 'classUnions'), demoUnion);
      
      console.log('Demo union created with ID:', docRef.id);

      setUnionData({
        id: docRef.id,
        ...demoUnion,
      });

      setCreated(true);
    } catch (error: any) {
      console.error('Error creating demo union:', error);
      setError(`Failed to create demo union: ${error.message}`);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="font-heading text-3xl font-bold mb-4 text-gray-900">
              🔧 Create Demo Union
            </h1>
            <p className="text-gray-700 mb-6">
              This page will create a demo Class Union in your Firestore database so you can test the login system.
            </p>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {created && unionData ? (
              <div className="space-y-6">
                <div className="bg-green-50 border-l-4 border-green-400 p-6">
                  <h2 className="font-heading text-xl font-bold text-green-800 mb-4">
                    ✅ Demo Union Created Successfully!
                  </h2>
                  
                  <div className="bg-white border border-green-300 rounded-lg p-4 space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Union Name:</p>
                      <p className="font-semibold text-gray-900">{unionData.name}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Username:</p>
                        <code className="block bg-gray-100 px-3 py-2 rounded font-mono text-green-700 font-bold">
                          {unionData.username}
                        </code>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Password:</p>
                        <code className="block bg-gray-100 px-3 py-2 rounded font-mono text-green-700 font-bold">
                          {unionData.password}
                        </code>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Login URL:</p>
                      <a 
                        href="/login/demo"
                        className="block bg-blue-100 px-3 py-2 rounded text-blue-700 hover:bg-blue-200 transition-colors"
                      >
                        http://localhost:3000/login/demo
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <a
                    href="/login/demo"
                    className="flex-1 bg-red-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-800 transition-colors text-center"
                  >
                    🔗 Test Login Now
                  </a>
                  <button
                    onClick={() => router.push('/login')}
                    className="flex-1 bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                  >
                    🏠 Go to Login Page
                  </button>
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">📋 How to Use:</h3>
                  <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                    <li>Click "Test Login Now" above</li>
                    <li>Enter Username: <code className="bg-gray-100 px-2 py-0.5 rounded">demo2024</code></li>
                    <li>Enter Password: <code className="bg-gray-100 px-2 py-0.5 rounded">Demo@123</code></li>
                    <li>Click "Login to Demo Union"</li>
                    <li>You'll be redirected to submit article page</li>
                  </ol>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Demo Union Details:</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li><strong>Union Name:</strong> Demo Union</li>
                    <li><strong>Username:</strong> demo2024</li>
                    <li><strong>Password:</strong> Demo@123</li>
                    <li><strong>Color:</strong> Red</li>
                    <li><strong>Icon:</strong> 🎓</li>
                    <li><strong>Login URL:</strong> /login/demo</li>
                  </ul>
                </div>

                <button
                  onClick={createDemoUnion}
                  disabled={creating}
                  className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
                    creating
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-700 hover:bg-green-800'
                  }`}
                >
                  {creating ? 'Creating Demo Union...' : '✅ Create Demo Union'}
                </button>

                <div className="text-center">
                  <button
                    onClick={() => router.push('/login')}
                    className="text-gray-700 hover:text-gray-900 underline"
                  >
                    ← Back to Login Page
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
