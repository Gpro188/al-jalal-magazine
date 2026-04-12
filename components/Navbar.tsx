'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { user, userData, signOut, isAdmin, isEditor, isContributor } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="font-heading text-2xl font-bold text-red-700">
            അൽ ജലാൽ
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-gray-700 hover:text-red-700 transition-colors">
              Home
            </Link>
            
            {!user ? (
              <>
                <Link 
                  href="/login" 
                  className="text-gray-700 hover:text-red-700 transition-colors"
                >
                  Staff/Admin Login
                </Link>
                <Link 
                  href="/submit" 
                  className="bg-red-700 text-white px-5 py-2 rounded-full hover:bg-red-800 transition-colors"
                >
                  Submit Article
                </Link>
              </>
            ) : (
              <>
                {/* Dashboard link based on role */}
                {isAdmin() && (
                  <>
                    <Link href="/dashboard/admin" className="text-gray-700 hover:text-red-700">
                      Admin Dashboard
                    </Link>
                    <Link href="/dashboard/admin/manage" className="text-red-700 hover:text-red-800 font-medium">
                      ⚙️ Manage
                    </Link>
                  </>
                )}
                {isEditor() && !isAdmin() && (
                  <Link href="/dashboard/editor" className="text-gray-700 hover:text-red-700">
                    Editor Dashboard
                  </Link>
                )}
                {isContributor() && (
                  <Link href="/dashboard/contributor" className="text-gray-700 hover:text-red-700">
                    My Submissions
                  </Link>
                )}
                
                <Link href="/submit" className="bg-red-700 text-white px-5 py-2 rounded-full hover:bg-red-800 transition-colors">
                  New Submission
                </Link>
                
                <button 
                  onClick={() => signOut()}
                  className="text-gray-700 hover:text-red-700 transition-colors"
                >
                  Logout ({userData?.role})
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={toggleMobileMenu}
              className="text-gray-700 focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-3">
              <Link 
                href="/" 
                className="text-gray-700 hover:text-red-700 transition-colors py-2"
                onClick={closeMobileMenu}
              >
                Home
              </Link>
              
              {!user ? (
                <>
                  <Link 
                    href="/login" 
                    className="text-gray-700 hover:text-red-700 transition-colors py-2"
                    onClick={closeMobileMenu}
                  >
                    Staff/Admin Login
                  </Link>
                  <Link 
                    href="/submit" 
                    className="bg-red-700 text-white px-5 py-2 rounded-full hover:bg-red-800 transition-colors text-center"
                    onClick={closeMobileMenu}
                  >
                    Submit Article
                  </Link>
                </>
              ) : (
                <>
                  {/* Dashboard link based on role */}
                  {isAdmin() && (
                    <>
                      <Link 
                        href="/dashboard/admin" 
                        className="text-gray-700 hover:text-red-700 py-2"
                        onClick={closeMobileMenu}
                      >
                        Admin Dashboard
                      </Link>
                      <Link 
                        href="/dashboard/admin/manage" 
                        className="text-red-700 hover:text-red-800 font-medium py-2"
                        onClick={closeMobileMenu}
                      >
                        ⚙️ Manage
                      </Link>
                    </>
                  )}
                  {isEditor() && !isAdmin() && (
                    <Link 
                      href="/dashboard/editor" 
                      className="text-gray-700 hover:text-red-700 py-2"
                      onClick={closeMobileMenu}
                    >
                      Editor Dashboard
                    </Link>
                  )}
                  {isContributor() && (
                    <Link 
                      href="/dashboard/contributor" 
                      className="text-gray-700 hover:text-red-700 py-2"
                      onClick={closeMobileMenu}
                    >
                      My Submissions
                    </Link>
                  )}
                  
                  <Link 
                    href="/submit" 
                    className="bg-red-700 text-white px-5 py-2 rounded-full hover:bg-red-800 transition-colors text-center"
                    onClick={closeMobileMenu}
                  >
                    New Submission
                  </Link>
                  
                  <button 
                    onClick={() => {
                      signOut();
                      closeMobileMenu();
                    }}
                    className="text-gray-700 hover:text-red-700 transition-colors py-2 text-left"
                  >
                    Logout ({userData?.role})
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
