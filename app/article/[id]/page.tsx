'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { getPostById, likePost, unlikePost, hasUserLiked } from '@/lib/firestore';
import type { Post } from '@/lib/firestore';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    // Get or create user ID for tracking likes
    let storedUserId = localStorage.getItem('magazineUserId');
    if (!storedUserId) {
      storedUserId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('magazineUserId', storedUserId);
    }
    setUserId(storedUserId);
    
    if (params.id) {
      loadPost();
    }
  }, [params.id]);

  const loadPost = async () => {
    try {
      const postData = await getPostById(params.id as string);
      if (postData) {
        setPost(postData);
        setLikeCount(postData.likes || 0);
        setLiked(hasUserLiked(postData, userId));
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Error loading post:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!post || likeLoading) return;
    
    setLikeLoading(true);
    try {
      if (liked) {
        // Unlike
        const result = await unlikePost(post.id!, userId);
        if (result.success) {
          setLiked(false);
          setLikeCount(prev => Math.max(prev - 1, 0));
        }
      } else {
        // Like
        const result = await likePost(post.id!, userId);
        if (result.success) {
          setLiked(true);
          setLikeCount(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setLikeLoading(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
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

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-bold mb-4">Article Not Found</h1>
          <button
            onClick={() => router.push('/')}
            className="bg-red-700 text-white px-6 py-3 rounded-lg hover:bg-red-800"
          >
            Go Home
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Image */}
      {post.featuredImage ? (
        <div className="relative h-[400px] md:h-[500px] w-full">
          <Image
            src={post.featuredImage}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      ) : (
        <div className="h-[300px] md:h-[400px] w-full bg-gradient-to-br from-red-700 to-red-900 flex items-center justify-center">
          <span className="text-white text-8xl font-heading font-bold opacity-30">
            {post.title.charAt(0)}
          </span>
        </div>
      )}

      {/* Article Content */}
      <article className="container mx-auto px-4 py-12 max-w-4xl -mt-20 relative z-10">
        <div className="bg-white rounded-lg shadow-xl p-8 md:p-12">
          {/* Category Badge */}
          <div className="mb-6">
            <span className="bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-semibold">
              {post.category.union}
            </span>
          </div>

          {/* Title */}
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-6 text-gray-900 leading-tight">
            {post.title}
          </h1>
          
          {/* Author Info */}
          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-red-700 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {post.studentName.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{post.studentName}</p>
                <p className="text-sm text-gray-600">Year {post.category.year}</p>
              </div>
            </div>
            <div className="ml-auto text-gray-500 text-sm">
              <time>{formatDate(post.createdAt)}</time>
            </div>
          </div>

          {/* Article Body */}
          <div className="prose prose-lg max-w-none">
            {post.content.split('\n').map((paragraph, idx) => (
              paragraph.trim() && (
                <p key={idx} className="mb-4 text-gray-800 leading-relaxed">
                  {paragraph}
                </p>
              )
            ))}
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            {/* Like Button */}
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={handleLike}
                disabled={likeLoading}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${
                  liked
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600'
                } ${likeLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <svg
                  className={`w-6 h-6 ${liked ? 'fill-current' : 'fill-none stroke-current'}`}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                <span className="text-lg">{likeCount}</span>
                <span>{liked ? 'Liked' : 'Like'}</span>
              </button>
              {likeCount > 0 && (
                <span className="text-gray-500 text-sm">
                  {likeCount} {likeCount === 1 ? 'student' : 'students'} liked this article
                </span>
              )}
            </div>

            <button
              onClick={() => router.push('/')}
              className="bg-red-700 text-white px-6 py-3 rounded-lg hover:bg-red-800 transition-colors font-semibold"
            >
              ← Back to All Articles
            </button>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
}
