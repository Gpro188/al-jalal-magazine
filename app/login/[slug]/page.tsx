'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { collection, query, where, getDocs, Firestore } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';

interface LoginForm {
  username: string;
  password: string;
}

interface UnionData {
  id: string;
  name: string;
  color: string;
  icon: string;
  logoUrl?: string;
  username: string;
  password: string;
}

export default function UnionLoginPage() {
  const router = useRouter();
  const params = useParams();
  const { signIn, user } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [unionData, setUnionData] = useState<UnionData | null>(null);
  const [unionLoading, setUnionLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const unionSlug = params?.slug as string;

  useEffect(() => {
    if (!unionSlug) return;

    // Fetch Union data based on slug (first word of union name in lowercase)
    const fetchUnionData = async () => {
      try {
        console.log('Looking for union with slug:', unionSlug);
        const unionsRef = collection(db as Firestore, 'classUnions');
        const q = query(unionsRef);
        const querySnapshot = await getDocs(q);
        
        console.log('Total unions found:', querySnapshot.size);
        let found = false;
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          // Create slug from union name (e.g., "Alpha Union" -> "alpha")
          const slug = data.name.toLowerCase().split(' ')[0];
          
          console.log('Checking union:', data.name, '-> slug:', slug);
          
          if (slug === unionSlug) {
            console.log('✓ Found matching union:', data.name);
            setUnionData({
              id: doc.id,
              name: data.name,
              color: data.color,
              icon: data.icon || '',
              logoUrl: data.logoUrl,
              username: data.username || '',
              password: data.password || '',
            });
            found = true;
          }
        });

        if (!found) {
          console.error('✗ No union found for slug:', unionSlug);
          console.log('Available slugs from existing unions:');
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            const slug = data.name.toLowerCase().split(' ')[0];
            console.log(`  - ${data.name} -> /login/${slug}`);
          });
          setNotFound(true);
        }
      } catch (error) {
        console.error('Error fetching union data:', error);
        setNotFound(true);
      } finally {
        setUnionLoading(false);
      }
    };

    fetchUnionData();
  }, [unionSlug]);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  // Redirect if already logged in
  useEffect(() => {
    if (user && !unionLoading) {
      router.push('/dashboard/contributor');
    }
  }, [user, router, unionLoading]);

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setError('');

    try {
      // Check if username and password match the union's credentials
      if (!unionData) {
        setError('Union not found');
        setLoading(false);
        return;
      }

      if (data.username !== unionData.username || data.password !== unionData.password) {
        setError('Invalid username or password for this union');
        setLoading(false);
        return;
      }

      // If credentials match, set a session and redirect to submit page
      // Store union info in sessionStorage for the submission form
      sessionStorage.setItem('unionLogin', JSON.stringify({
        unionName: unionData.name,
        unionId: unionData.id,
        loggedInAt: new Date().toISOString()
      }));

      // Redirect to submission page
      router.push('/submit');
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (unionLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-700 mx-auto mb-4"></div>
          <p className="text-gray-900">Loading union...</p>
        </div>
      </div>
    );
  }

  if (notFound || !unionData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
            <h1 className="font-heading text-3xl font-bold mb-4 text-gray-900">
              Union Not Found
            </h1>
            <p className="text-gray-700 mb-6">
              The class union you're looking for doesn't exist or hasn't been created yet.
            </p>
            
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-2">💡 Troubleshooting:</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Check the URL - it should match the union name (e.g., /login/alpha)</li>
                <li>• The slug is the first word of the union name in lowercase</li>
                <li>• Open browser console (F12) to see available unions</li>
                <li>• Contact your administrator if the union should exist</li>
              </ul>
            </div>
            
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => router.push('/login')}
                className="bg-red-700 text-white px-6 py-2 rounded-lg hover:bg-red-800 transition-colors"
              >
                ← Back to Login Selection
              </button>
              <button
                onClick={() => window.location.reload()}
                className="bg-gray-700 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                🔄 Refresh Page
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Get color classes safely
  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string; text: string; hover: string }> = {
      'red-700': { bg: 'bg-red-100', text: 'text-red-700', hover: 'hover:bg-red-800' },
      'blue-700': { bg: 'bg-blue-100', text: 'text-blue-700', hover: 'hover:bg-blue-800' },
      'green-700': { bg: 'bg-green-100', text: 'text-green-700', hover: 'hover:bg-green-800' },
      'purple-700': { bg: 'bg-purple-100', text: 'text-purple-700', hover: 'hover:bg-purple-800' },
      'orange-700': { bg: 'bg-orange-100', text: 'text-orange-700', hover: 'hover:bg-orange-800' },
      'teal-700': { bg: 'bg-teal-100', text: 'text-teal-700', hover: 'hover:bg-teal-800' },
    };
    return colorMap[color] || colorMap['red-700'];
  };

  const colors = getColorClasses(unionData.color);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 border-t-4" style={{ borderColor: unionData.color.replace('-700', '-500') }}>
          <div className="text-center mb-8">
            <h1 className="font-heading text-3xl font-bold mb-2 text-gray-900">
              {unionData.name} - AL-JALAL
            </h1>
            <p className="text-gray-700">
              JASIA Students Union of Jamia Jalaliyya Mundakkulam
            </p>
            
            {/* Union Logo or Icon */}
            <div className="mt-6 flex justify-center">
              {unionData.logoUrl ? (
                <img 
                  src={unionData.logoUrl} 
                  alt={unionData.name} 
                  className="h-24 w-24 object-contain"
                />
              ) : unionData.icon ? (
                <div className={`inline-block ${colors.bg} ${colors.text} px-6 py-3 rounded-full font-semibold text-lg`}>
                  {unionData.icon} {unionData.name}
                </div>
              ) : (
                <div className={`inline-block ${colors.bg} ${colors.text} px-8 py-4 rounded-full font-bold text-xl`}>
                  {unionData.name}
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-900 mb-2">
                Union Username
              </label>
              <input
                type="text"
                id="username"
                {...register('username', { 
                  required: 'Username is required'
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter union username"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-500">{errors.username.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-2">
                Union Password
              </label>
              <input
                type="password"
                id="password"
                {...register('password', { 
                  required: 'Password is required'
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter union password"
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
                  : `bg-${unionData.color} ${colors.hover}`
              }`}
            >
              {loading ? 'Signing In...' : `Login to ${unionData.name}`}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-700">
            <p>Don't have {unionData.name} credentials?</p>
            <p className="text-xs mt-1">Contact your Class Union representative to get the username and password.</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
