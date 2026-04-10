'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { collection, query, where, getDocs, Firestore } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';

interface LoginForm {
  email: string;
  password: string;
}

interface UnionData {
  name: string;
  color: string;
  icon: string;
  logoUrl?: string;
}

export default function AlphaLoginPage() {
  const router = useRouter();
  const { signIn, user } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [unionData, setUnionData] = useState<UnionData | null>(null);
  const [unionLoading, setUnionLoading] = useState(true);

  useEffect(() => {
    // Fetch Alpha Union data
    const fetchUnionData = async () => {
      try {
        const unionsRef = collection(db as Firestore, 'classUnions');
        const q = query(unionsRef, where('name', '==', 'Alpha Union'));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const data = querySnapshot.docs[0].data();
          setUnionData({
            name: data.name,
            color: data.color,
            icon: data.icon,
            logoUrl: data.logoUrl,
          });
        } else {
          // Default fallback
          setUnionData({
            name: 'Alpha Union',
            color: 'red-700',
            icon: '🦁',
            logoUrl: undefined,
          });
        }
      } catch (error) {
        console.error('Error fetching union data:', error);
        setUnionData({
          name: 'Alpha Union',
          color: 'red-700',
          icon: '🦁',
          logoUrl: undefined,
        });
      } finally {
        setUnionLoading(false);
      }
    };

    fetchUnionData();
  }, []);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  // Redirect if already logged in
  if (user) {
    router.push('/dashboard/contributor');
  }

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setError('');

    try {
      const result = await signIn(data.email, data.password);
      
      if (result.success) {
        router.push('/dashboard/contributor');
      } else {
        setError(result.error || 'Invalid email or password');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 border-t-4" style={{ borderTopColor: unionData?.color ? `var(--${unionData.color})` : 'border-red-700' }}>
          <div className="text-center mb-8">
            <h1 className="font-heading text-3xl font-bold mb-2 text-gray-900">
              {unionData?.name || 'Alpha Union'} - AL-JALAL
            </h1>
            <p className="text-gray-700">
              JASIA Students Union of Jamia Jalaliyya Mundakkulam
            </p>
            
            {/* Union Logo or Icon */}
            <div className="mt-6 flex justify-center">
              {unionLoading ? (
                <div className="h-20 w-20 animate-pulse bg-gray-200 rounded-full"></div>
              ) : unionData?.logoUrl ? (
                <img 
                  src={unionData.logoUrl} 
                  alt={unionData.name} 
                  className="h-24 w-24 object-contain"
                />
              ) : unionData?.icon ? (
                <div className={`inline-block bg-${unionData?.color || 'red-100'} text-${unionData?.color || 'red-700'} px-6 py-3 rounded-full font-semibold text-lg`}>
                  {unionData?.icon} {unionData?.name}
                </div>
              ) : (
                <div className={`inline-block bg-${unionData?.color || 'red-100'} text-${unionData?.color || 'red-700'} px-8 py-4 rounded-full font-bold text-xl`}>
                  {unionData?.name}
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                Student Email
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
                placeholder="student@school.edu"
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
              {loading ? 'Signing In...' : 'Sign In to Alpha Union'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-700">
            <p>Don't have an Alpha Union account?</p>
            <p className="text-xs mt-1">Contact your Class Union representative to get your login credentials.</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
