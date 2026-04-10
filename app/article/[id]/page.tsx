'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { getPostById } from '@/lib/firestore';
import type { Post } from '@/lib/firestore';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      loadPost();
    }
  }, [params.id]);

  const loadPost = async () => {
    try {
      const postData = await getPostById(params.id as string);
      if (postData) {
        setPost(postData);
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
