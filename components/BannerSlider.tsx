'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Post } from '@/lib/firestore';

export default function BannerSlider({ posts }: { posts: Post[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (posts.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % posts.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [posts.length]);

  if (posts.length === 0) return null;

  const currentPost = posts[currentIndex];

  // Get text size classes based on stored settings
  const getTitleSizeClass = () => {
    switch (currentPost.titleSize) {
      case 'small': return 'text-2xl md:text-3xl';
      case 'medium': return 'text-3xl md:text-4xl';
      case 'large': return 'text-3xl md:text-5xl';
      default: return 'text-3xl md:text-5xl';
    }
  };

  const getSubtitleSizeClass = () => {
    switch (currentPost.subtitleSize) {
      case 'small': return 'text-sm md:text-base';
      case 'medium': return 'text-base md:text-lg';
      case 'large': return 'text-lg md:text-xl';
      default: return 'text-lg md:text-xl';
    }
  };

  return (
    <div className="relative h-full">
      {/* Banner Image */}
      <Link href={`/article/${currentPost.id}`}>
        <div className="relative h-full w-full cursor-pointer">
          <Image
            src={currentPost.featuredImage!}
            alt={currentPost.title}
            fill
            className="object-cover"
            priority
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          
          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white">
            <span className="inline-block bg-red-600 px-4 py-1 rounded-full text-sm font-semibold mb-4">
              {currentPost.category.union}
            </span>
            <h2 className={`font-heading font-bold mb-3 line-clamp-2 ${getTitleSizeClass()}`}>
              {currentPost.title}
            </h2>
            <p className={`opacity-90 ${getSubtitleSizeClass()}`}>by {currentPost.studentName}</p>
          </div>
        </div>
      </Link>

      {/* Navigation Dots */}
      {posts.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          {posts.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.preventDefault();
                setCurrentIndex(index);
              }}
              className={`h-3 rounded-full transition-all ${
                index === currentIndex 
                  ? 'bg-white w-8' 
                  : 'bg-white/50 w-3 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Arrow Navigation */}
      {posts.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.preventDefault();
              setCurrentIndex((prev) => (prev - 1 + posts.length) % posts.length);
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full p-3 text-white transition-all"
            aria-label="Previous slide"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              setCurrentIndex((prev) => (prev + 1) % posts.length);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full p-3 text-white transition-all"
            aria-label="Next slide"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}
