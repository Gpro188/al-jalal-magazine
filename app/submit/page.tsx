'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/context/AuthContext';
import { createPost, updatePostStatus } from '@/lib/firestore';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface FormData {
  title: string;
  content: string;
  studentName: string;
  year: string;
}

interface Union {
  id: string;
  name: string;
  color: string;
  icon: string;
  logoUrl?: string;
}

// Component to display union selection cards
function UnionSelectionCards() {
  const router = useRouter();
  const [unions, setUnions] = useState<Union[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUnions();
  }, []);

  const fetchUnions = async () => {
    try {
      console.log('[Submit Page] Fetching unions from Firestore...');
      const unionsRef = collection(db, 'classUnions');
      const querySnapshot = await getDocs(unionsRef);
      console.log('[Submit Page] Total unions found:', querySnapshot.size);
      
      const unionsList: Union[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('[Submit Page] Union:', data.name, '- Username:', data.username);
        unionsList.push({ id: doc.id, ...data } as Union);
      });
      
      setUnions(unionsList);
      
      if (unionsList.length === 0) {
        console.warn('[Submit Page] ⚠️ No unions found in database.');
      } else {
        console.log(`[Submit Page] ✅ Loaded ${unionsList.length} union(s)`);
      }
    } catch (error: any) {
      console.error('[Submit Page] ❌ Error fetching unions:', error);
      console.error('[Submit Page] Error code:', error?.code);
      console.error('[Submit Page] Error message:', error?.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading unions...</p>
      </div>
    );
  }

  if (unions.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-3">🏛️</div>
        <p className="text-gray-500 mb-2">No Class Unions available yet.</p>
        <p className="text-sm text-gray-600 mb-4">Contact your administrator.</p>
        <button
          onClick={fetchUnions}
          className="text-sm bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          🔄 Refresh Unions
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {unions.map((union) => {
        const slug = union.name.toLowerCase().split(' ')[0];
        const loginUrl = `/login/${slug}`;
        
        return (
          <a
            key={union.id}
            href={loginUrl}
            className="flex flex-col items-center justify-center p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-red-300 hover:shadow-md transition-all transform hover:-translate-y-1"
          >
            {union.logoUrl ? (
              <img 
                src={union.logoUrl} 
                alt={union.name}
                className="h-16 w-16 object-contain mb-3"
              />
            ) : union.icon ? (
              <span className="text-4xl mb-3">{union.icon}</span>
            ) : (
              <div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center mb-3">
                <span className="text-2xl font-bold text-gray-600">
                  {union.name.charAt(0)}
                </span>
              </div>
            )}
            <span className="font-semibold text-gray-900 text-sm text-center">
              {union.name}
            </span>
            <span className="text-xs text-gray-500 mt-1">Click to login</span>
          </a>
        );
      })}
    </div>
  );
}

export default function SubmitPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, userData, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [unionLogin, setUnionLogin] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>();

  // Check for union login from session
  useEffect(() => {
    const storedLogin = sessionStorage.getItem('unionLogin');
    if (storedLogin) {
      setUnionLogin(JSON.parse(storedLogin));
    } else {
      // No union login, redirect to main login
      router.push('/login');
    }
  }, [router]);

  // Check for edit mode
  useEffect(() => {
    const editMode = searchParams.get('edit') === 'true';
    if (editMode) {
      setIsEditMode(true);
      const editingData = sessionStorage.getItem('editingPost');
      if (editingData) {
        const data = JSON.parse(editingData);
        reset({
          title: data.title,
          content: data.content,
          studentName: data.studentName,
          year: data.year
        });
        setEditingPostId(data.postId);
      }
    }
  }, [searchParams, reset]);

  // Get user's class union from union login session
  const userUnion = unionLogin?.unionName || null;

  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear + 1];

  const onSubmit = async (data: FormData) => {
    if (!unionLogin) {
      setError('You must be logged in through your Class Union to submit an article');
      return;
    }

    if (!userUnion) {
      setError('Your session is not assigned to a Class Union. Please login again.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      let result;
      
      if (isEditMode && editingPostId) {
        // Update existing rejected article
        result = await updatePostStatus(editingPostId, 'pending_review', {
          title: data.title,
          content: data.content,
          studentName: data.studentName,
        });
        
        if (result.success) {
          sessionStorage.removeItem('editingPost');
        }
      } else {
        // Create new article
        result = await createPost({
          title: data.title,
          content: data.content,
          studentName: data.studentName,
          category: {
            union: userUnion,
            year: data.year,
          },
          status: 'pending_review',
          authorId: unionLogin.unionId,
        });
      }

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/submit');
        }, 2000);
      } else {
        setError(result.error || 'Failed to submit article');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('unionLogin');
    router.push('/login');
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

  // If no union login session, show union selection
  if (!unionLogin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="font-heading text-4xl font-bold mb-4 text-gray-900">
                Submit Your Article
              </h1>
              <p className="text-xl text-gray-700 mb-2">
                AL-JALAL Magazine - JASIA Students Union
              </p>
              <p className="text-gray-600">
                Please login through your Class Union to submit articles
              </p>
            </div>

            {/* Union Selection Cards */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8">
              <h3 className="font-heading text-lg font-bold text-gray-900 mb-3">
                🏛️ Select Your Class Union to Login
              </h3>
              <p className="text-sm text-gray-700 mb-4">
                Choose your Class Union below to login and submit your article:
              </p>
              
              <UnionSelectionCards />
              
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => window.location.reload()}
                  className="text-sm bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 transition-colors"
                >
                  🔄 Refresh Page
                </button>
                <a
                  href="/login"
                  className="text-sm bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 transition-colors"
                >
                  🔗 Go to Main Login Page
                </a>
              </div>
              
              <p className="text-xs text-gray-700 mt-4">
                Don't see your union? Contact your administrator to get the correct login link.
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6">
              <h3 className="font-semibold text-gray-900 mb-2">ℹ️ How to Submit:</h3>
              <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
                <li>Click on your Class Union above</li>
                <li>Enter the username and password provided by your union representative</li>
                <li>Fill in your article details</li>
                <li>Click "Submit Article"</li>
                <li><strong>Important:</strong> Logout when finished so others can use the computer</li>
              </ol>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header with Union Info and Logout */}
          {unionLogin && (
            <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="bg-red-700 text-white rounded-full h-10 w-10 flex items-center justify-center font-bold">
                    {userUnion ? userUnion.charAt(0) : 'U'}
                  </div>
                  <div>
                    <h2 className="font-heading text-lg font-bold text-gray-900">
                      {unionLogin.unionName}
                    </h2>
                    <p className="text-xs text-gray-600">Logged in • Ready to submit articles</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push('/union-activity')}
                    className="bg-white border border-blue-300 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
                  >
                    📊 View Activity
                  </button>
                  <button
                    onClick={handleLogout}
                    className="bg-white border border-red-300 text-red-700 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                  >
                    🚪 Logout
                  </button>
                </div>
              </div>
            </div>
          )}

          <h1 className="font-heading text-4xl font-bold mb-2 text-gray-900">
            {isEditMode ? 'Edit & Resubmit Article' : 'Submit Your Article'}
          </h1>
          <p className="text-gray-700 mb-8">
            {isEditMode 
              ? 'Update your rejected article and resubmit for review.' 
              : 'Share your story with the school community. All submissions are reviewed before publication.'}
          </p>

          {success ? (
            <div className="bg-green-50 border-l-4 border-green-400 p-6 text-center">
              <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <h2 className="font-heading text-2xl font-bold text-green-800 mb-2">
                {isEditMode ? 'Article Resubmitted Successfully!' : 'Article Submitted Successfully!'}
              </h2>
              <p className="text-green-700">
                {isEditMode 
                  ? 'Your updated article is now pending review again.' 
                  : 'Your article is now pending review. You can submit another article or logout.'}
              </p>
              <button
                onClick={() => {
                  setSuccess(false);
                  if (isEditMode) {
                    setIsEditMode(false);
                    setEditingPostId(null);
                    reset({ title: '', content: '', studentName: '', year: '' });
                  }
                }}
                className="mt-4 bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-800 transition-colors"
              >
                ➕ Submit Another Article
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Student Name */}
              <div>
                <label htmlFor="studentName" className="block text-sm font-medium text-gray-900 mb-2">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="studentName"
                  {...register('studentName', { required: 'Student name is required' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="John Doe"
                />
                {errors.studentName && (
                  <p className="mt-1 text-sm text-red-500">{errors.studentName.message}</p>
                )}
              </div>

              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-900 mb-2">
                  Article Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  {...register('title', { 
                    required: 'Title is required',
                    minLength: { value: 5, message: 'Title must be at least 5 characters' }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="The Story of My Journey"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
                )}
              </div>

              {/* Class Union - Auto-assigned from user profile */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class Union
                </label>
                {userUnion ? (
                  <div className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
                    {userUnion} <span className="text-green-600 text-xs">✓ (Auto-assigned)</span>
                  </div>
                ) : (
                  <div className="w-full px-4 py-2 bg-red-50 border border-red-300 rounded-lg text-red-700">
                    No Class Union assigned to your account
                  </div>
                )}
              </div>

              {/* Year */}
              <div>
                <label htmlFor="year" className="block text-sm font-medium text-gray-900 mb-2">
                  Academic Year <span className="text-red-500">*</span>
                </label>
                <select
                  id="year"
                  {...register('year', { required: 'Please select a year' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Select Year</option>
                  {years.map((year) => (
                    <option key={year} value={year.toString()}>{year}-{year + 1}</option>
                  ))}
                </select>
                {errors.year && (
                  <p className="mt-1 text-sm text-red-500">{errors.year.message}</p>
                )}
              </div>

              {/* Content */}
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-900 mb-2">
                  Article Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="content"
                  rows={12}
                  {...register('content', { 
                    required: 'Content is required',
                    minLength: { value: 100, message: 'Article must be at least 100 characters' }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-vertical"
                  placeholder="Write your article here..."
                />
                {errors.content && (
                  <p className="mt-1 text-sm text-red-500">{errors.content.message}</p>
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
                disabled={isSubmitting}
                className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
                  isSubmitting 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-red-700 hover:bg-red-800'
                }`}
              >
                {isSubmitting 
                  ? (isEditMode ? 'Resubmitting...' : 'Submitting...') 
                  : (isEditMode ? 'Resubmit Article' : 'Submit Article')}
              </button>

              <p className="text-sm text-gray-500 text-center">
                Your submission will be reviewed by our editorial team before publication.
              </p>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
