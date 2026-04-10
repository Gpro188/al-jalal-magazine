'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { collection, getDocs, Firestore } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';

interface LoginForm {
  email: string;
  password: string;
}

interface Union {
  id: string;
  name: string;
  color: string;
  icon: string;
  logoUrl?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { signIn, user, userData } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [unions, setUnions] = useState<Union[]>([]);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [selectedUnion, setSelectedUnion] = useState<Union | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  // Fetch unions on load
  useEffect(() => {
    fetchUnions();
  }, []);

  const fetchUnions = async () => {
    try {
      console.log('Fetching unions from Firestore...');
      const unionsRef = collection(db as Firestore, 'classUnions');
      const querySnapshot = await getDocs(unionsRef);
      console.log('Total unions found:', querySnapshot.size);
      
      const unionsList: Union[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('Union:', data.name, '- Slug:', data.name.toLowerCase().split(' ')[0]);
        unionsList.push({ id: doc.id, ...data } as Union);
      });
      
      setUnions(unionsList);
      
      if (unionsList.length === 0) {
        console.warn('⚠️ No unions found in database.');
        console.log('💡 Tip: Create unions at /dashboard/admin/manage');
      } else {
        console.log(`✅ Loaded ${unionsList.length} union(s)`);
      }
    } catch (error) {
      console.error('❌ Error fetching unions:', error);
    }
  };

  // Redirect if already logged in
  useEffect(() => {
    if (user && userData) {
      if (userData.role === 'admin') {
        router.push('/dashboard/admin/manage');
      } else if (userData.role === 'editor') {
        router.push('/dashboard/editor');
      } else if (userData.role === 'contributor') {
        router.push('/dashboard/contributor');
      }
    }
  }, [user, userData, router]);

  const handleUnionClick = (union: Union) => {
    // Redirect to the dynamic union login page
    const slug = union.name.toLowerCase().split(' ')[0];
    router.push(`/login/${slug}`);
  };

  const handleBackToUnions = () => {
    setShowLoginForm(false);
    setSelectedUnion(null);
    setError('');
  };

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setError('');

    try {
      const result = await signIn(data.email, data.password);
      
      if (result.success) {
        // Redirect will happen in useEffect based on role
      } else {
        setError(result.error || 'Invalid email or password');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Show login form if union selected or editor/admin login
  if (showLoginForm) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
            {/* Back Button */}
            <button
              onClick={handleBackToUnions}
              className="mb-4 text-gray-700 hover:text-gray-900 flex items-center gap-2"
            >
              ← Back to Unions
            </button>

            <div className="text-center mb-6">
              {selectedUnion ? (
                <>
                  {selectedUnion.logoUrl ? (
                    <img 
                      src={selectedUnion.logoUrl} 
                      alt={selectedUnion.name} 
                      className="h-20 w-20 object-contain mx-auto mb-4"
                    />
                  ) : selectedUnion.icon ? (
                    <div className="text-5xl mb-4">{selectedUnion.icon}</div>
                  ) : null}
                  <h1 className="font-heading text-2xl font-bold mb-2 text-gray-900">
                    {selectedUnion.name} Login
                  </h1>
                  <p className="text-gray-700 text-sm">
                    AL-JALAL Magazine - JASIA Students Union
                  </p>
                </>
              ) : (
                <>
                  <h1 className="font-heading text-2xl font-bold mb-2 text-gray-900">
                    Editor/Staff Login
                  </h1>
                  <p className="text-gray-700 text-sm">
                    AL-JALAL Magazine Portal
                  </p>
                </>
              )}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="your-email@school.edu"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="••••••••"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4">
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-red-700 hover:bg-red-800'
                }`}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-700">
              <p>Don't have an account?</p>
              <p className="text-xs mt-1">Contact your Class Union representative or school administrator.</p>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // Show Union Selection
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-heading text-4xl font-bold mb-4 text-gray-900">
              AL-JALAL Magazine
            </h1>
            <p className="text-xl text-gray-700 mb-2">
              JASIA Students Union of Jamia Jalaliyya Mundakkulam
            </p>
            <p className="text-gray-600">
              Select your Class Union to login and start writing!
            </p>
          </div>

          {/* Union Cards Grid */}
          {unions.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <div className="text-6xl mb-4">🏛️</div>
              <h3 className="font-heading text-xl font-bold text-gray-900 mb-2">
                No Class Unions Available Yet
              </h3>
              <p className="text-gray-700 mb-4">
                The administrator hasn't created any Class Unions yet.
              </p>
              
              <div className="flex gap-4 justify-center mb-6">
                <button
                  onClick={fetchUnions}
                  className="bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition-colors"
                >
                  🔄 Refresh Unions
                </button>
                <a
                  href="/debug-unions"
                  className="bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-800 transition-colors"
                >
                  🔍 Debug Page
                </a>
              </div>
              
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 text-left max-w-md mx-auto">
                <p className="text-sm text-gray-700 mb-2"><strong>For Administrators:</strong></p>
                <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                  <li>Login as admin</li>
                  <li>Go to Dashboard → Manage</li>
                  <li>Create Class Unions with usernames/passwords</li>
                  <li>Share credentials with union representatives</li>
                </ol>
              </div>
              
              <div className="mt-4 text-xs text-gray-500">
                <p>💡 After creating a union, click "Refresh Unions" or reload this page</p>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {unions.map((union) => {
                const slug = union.name.toLowerCase().split(' ')[0];
                const loginUrl = `/login/${slug}`;
                
                return (
                  <a
                    key={union.id}
                    href={loginUrl}
                    className="block bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all transform hover:-translate-y-1 border-t-4"
                    style={{ borderTopColor: union.color.includes('-') ? `var(--${union.color})` : '#dc2626' }}
                  >
                    <div className="text-center">
                      {union.logoUrl ? (
                        <img 
                          src={union.logoUrl} 
                          alt={union.name} 
                          className="h-20 w-20 object-contain mx-auto mb-4"
                        />
                      ) : union.icon ? (
                        <div className="text-5xl mb-4">{union.icon}</div>
                      ) : (
                        <div className="h-20 w-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                          <span className="text-2xl font-bold text-gray-600">
                            {union.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <h3 className="font-heading text-xl font-bold text-gray-900 mb-2">
                        {union.name}
                      </h3>
                      <p className="text-sm text-gray-700">
                        Click to login
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        URL: /login/{slug}
                      </p>
                    </div>
                  </a>
                );
              })}
            </div>
          )}

          {/* Editor/Staff Login Link */}
          <div className="text-center">
            <button
              onClick={() => setShowLoginForm(true)}
              className="inline-block bg-gray-800 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-900 transition-colors"
            >
              🔑 Editor/Staff Login
            </button>
            <p className="text-sm text-gray-600 mt-2">
              For editors and administrators
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
