'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getPublishedPosts } from '@/lib/firestore';
import type { Post } from '@/lib/firestore';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BannerSlider from '@/components/BannerSlider';

export default function Home() {
  const [publishedPosts, setPublishedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [bannerPosts, setBannerPosts] = useState<Post[]>([]);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const posts = await getPublishedPosts();
      setPublishedPosts(posts);
      
      // Filter active banners
      const now = new Date();
      const activeBanners = posts.filter(post => {
        if (!post.isBanner || !post.bannerEnd || !post.featuredImage) return false;
        
        try {
          const bannerEnd = post.bannerEnd.toDate ? post.bannerEnd.toDate() : new Date(post.bannerEnd.seconds * 1000);
          const bannerStart = post.bannerStart?.toDate ? post.bannerStart.toDate() : new Date(0);
          
          return now >= bannerStart && now <= bannerEnd;
        } catch (error) {
          return false;
        }
      });
      
      setBannerPosts(activeBanners);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-red-700 via-red-600 to-red-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="font-heading text-5xl md:text-7xl font-bold mb-4">
              AL-JALAL
            </h1>
            <p className="text-xl md:text-2xl font-light mb-2">
              JASIA STUDENTS UNION OF JAMIA JALALIYYA MUNDAKKULAM
            </p>
            <p className="text-lg md:text-xl font-light mb-8 opacity-90">
              Celebrating Student Voices & Creative Excellence
            </p>
            <Link 
              href="/submit"
              className="inline-block bg-white text-red-700 font-semibold px-8 py-3 rounded-full hover:bg-gray-100 transition-colors shadow-lg"
            >
              Submit Your Article
            </Link>
          </div>
        </div>
      </header>

      {/* Banner Slider */}
      {!loading && bannerPosts.length > 0 && (
        <section className="relative h-[500px] bg-black">
          <BannerSlider posts={bannerPosts} />
        </section>
      )}

      {/* Latest Articles Grid */}
      <main className="container mx-auto px-4 py-12">
        <h2 className="font-heading text-4xl font-bold mb-8 text-center text-gray-800">
          Latest Articles
        </h2>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-700"></div>
          </div>
        ) : publishedPosts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No articles published yet.</p>
            <Link href="/submit" className="text-red-700 hover:underline mt-2 inline-block">
              Be the first to submit!
            </Link>
          </div>
        ) : (
          <div className="magazine-grid">
            {publishedPosts.map((post) => (
              <ArticleCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

function ArticleCard({ post }: { post: Post }) {
  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  return (
    <Link href={`/article/${post.id}`}>
      <article className="article-card group cursor-pointer bg-white rounded-lg shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
        {post.featuredImage ? (
          <div className="relative h-56 w-full overflow-hidden">
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Category Badge on Image */}
            <div className="absolute top-4 left-4">
              <span className="bg-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg">
                {post.category.union}
              </span>
            </div>
            
            {/* Read More Indicator */}
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="bg-white text-gray-800 text-sm font-semibold px-4 py-2 rounded-full shadow-lg">
                Read More →
              </span>
            </div>
          </div>
        ) : (
          <div className="h-56 w-full bg-gradient-to-br from-red-500 via-red-600 to-red-700 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
            </div>
            <span className="text-white text-7xl font-heading font-bold opacity-40 relative z-10">
              {post.title.charAt(0)}
            </span>
          </div>
        )}
        
        <div className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-red-100 text-red-700 text-xs font-semibold px-3 py-1 rounded-full">
              {post.category.union}
            </span>
            <span className="text-gray-500 text-xs">{post.category.year}</span>
            {post.publishedAt && (
              <span className="text-gray-400 text-xs ml-auto">
                {formatDate(post.publishedAt)}
              </span>
            )}
          </div>
          
          <h3 className="font-heading text-2xl font-bold mb-3 text-gray-800 group-hover:text-red-700 transition-colors line-clamp-2 leading-tight">
            {post.title}
          </h3>
          
          <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
            {post.content.substring(0, 150)}...
          </p>
          
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span className="font-medium">{post.studentName}</span>
            <time>{formatDate(post.createdAt)}</time>
          </div>
        </div>
      </article>
    </Link>
  );
}
