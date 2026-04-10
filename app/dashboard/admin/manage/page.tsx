'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { collection, addDoc, getDocs, query, where, updateDoc, doc, deleteDoc, serverTimestamp, Firestore, setDoc } from 'firebase/firestore';
import { FirebaseStorage } from 'firebase/storage';
import { Auth } from 'firebase/auth';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebaseConfig';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface Union {
  id: string;
  name: string;
  color: string;
  icon: string;
  logoUrl?: string; // PNG logo URL
  username: string; // Shared username for union
  password: string; // Shared password for union
  createdAt: any;
}

interface User {
  id: string;
  email: string;
  role: string;
  displayName: string;
  classUnion?: string; // Single union (legacy)
  classUnions?: string[]; // Multiple unions (new)
}

export default function AdminManagePage() {
  const router = useRouter();
  const { user, userData, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'unions' | 'editors'>('unions');
  
  // State for Unions
  const [unions, setUnions] = useState<Union[]>([]);
  const [newUnionName, setNewUnionName] = useState('');
  const [newUnionColor, setNewUnionColor] = useState('red-700');
  const [newUnionIcon, setNewUnionIcon] = useState(''); // Empty by default - optional
  const [newUnionLogo, setNewUnionLogo] = useState<string>('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [newUnionUsername, setNewUnionUsername] = useState('');
  const [newUnionPassword, setNewUnionPassword] = useState('');
  
  // State for Editors
  const [editors, setEditors] = useState<User[]>([]);
  const [newEditorEmail, setNewEditorEmail] = useState('');
  const [newEditorPassword, setNewEditorPassword] = useState('');
  const [newEditorName, setNewEditorName] = useState('');
  const [assignedUnions, setAssignedUnions] = useState<string[]>([]); // Multiple unions

  useEffect(() => {
    if (!loading && (!user || userData?.role !== 'admin')) {
      router.push('/login');
    }
    
    if (user && userData?.role === 'admin') {
      fetchUnions();
      fetchEditors();
    }
  }, [user, userData, loading, router]);

  const fetchUnions = async () => {
    try {
      const unionsRef = collection(db as Firestore, 'classUnions');
      const q = query(unionsRef);
      const querySnapshot = await getDocs(q);
      const unionsList: Union[] = [];
      querySnapshot.forEach((doc) => {
        unionsList.push({ id: doc.id, ...doc.data() } as Union);
      });
      setUnions(unionsList);
    } catch (error) {
      console.error('Error fetching unions:', error);
    }
  };

  const fetchEditors = async () => {
    try {
      const usersRef = collection(db as Firestore, 'users');
      const q = query(usersRef, where('role', '==', 'editor'));
      const querySnapshot = await getDocs(q);
      const editorsList: User[] = [];
      querySnapshot.forEach((doc) => {
        editorsList.push({ id: doc.id, ...doc.data() } as User);
      });
      setEditors(editorsList);
    } catch (error) {
      console.error('Error fetching editors:', error);
    }
  };

  const handleCreateUnion = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newUnionName.trim()) {
      alert('Please enter a Union name');
      return;
    }

    if (!newUnionUsername.trim()) {
      alert('Please enter a Username for this union');
      return;
    }

    if (!newUnionPassword || newUnionPassword.length < 4) {
      alert('Password must be at least 4 characters');
      return;
    }

    try {
      let logoUrl = '';
      
      // Upload logo if provided
      if (logoFile) {
        console.log('Uploading logo file:', logoFile.name);
        const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
        const storage = (await import('@/lib/firebaseConfig')).storage as FirebaseStorage | undefined;
        
        if (!storage) {
          throw new Error('Storage is not initialized');
        }
        
        const storageRef = ref(storage, `union-logos/${newUnionName}-${Date.now()}-${logoFile.name}`);
        console.log('Storage reference created:', storageRef.fullPath);
        await uploadBytes(storageRef, logoFile);
        console.log('Logo uploaded successfully');
        logoUrl = await getDownloadURL(storageRef);
        console.log('Logo URL:', logoUrl);
      }

      console.log('Creating union document with:', {
        name: newUnionName,
        color: newUnionColor,
        icon: newUnionIcon,
        username: newUnionUsername,
        logoUrl: logoUrl || 'none'
      });

      const unionData: any = {
        name: newUnionName,
        color: newUnionColor,
        icon: newUnionIcon,
        username: newUnionUsername,
        password: newUnionPassword, // Store password (consider encryption in production)
        createdAt: serverTimestamp(),
      };

      // Only add logoUrl if it exists
      if (logoUrl) {
        unionData.logoUrl = logoUrl;
      }

      console.log('Final union data:', unionData);

      await addDoc(collection(db as Firestore, 'classUnions'), unionData);
      
      console.log('Union created successfully!');
      alert('✅ Class Union created successfully!\n\nLogin Credentials:\nUsername: ' + newUnionUsername + '\nPassword: ' + newUnionPassword);
      setNewUnionName('');
      setNewUnionColor('red-700');
      setNewUnionIcon(''); // Clear to empty
      setNewUnionLogo('');
      setLogoFile(null);
      setNewUnionUsername('');
      setNewUnionPassword('');
      fetchUnions();
    } catch (error: any) {
      console.error('Error creating union:', error);
      console.error('Error code:', error?.code);
      console.error('Error message:', error?.message);
      
      // Show more specific error messages
      let errorMessage = '❌ Failed to create Union\n\n';
      
      if (error?.code === 'permission-denied') {
        errorMessage += 'Permission denied. Please check:\n';
        errorMessage += '- You are logged in as an admin\n';
        errorMessage += '- Firestore rules are deployed\n';
        errorMessage += '- Storage rules are deployed (if uploading logo)';
      } else if (error?.code === 'storage/unauthorized') {
        errorMessage += 'Storage permission denied. Please check:\n';
        errorMessage += '- You are logged in as an admin\n';
        errorMessage += '- Storage rules are deployed for union-logos folder';
      } else if (error?.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Unknown error. Check browser console for details.';
      }
      
      alert(errorMessage);
    }
  };

  const handleDeleteUnion = async (unionId: string) => {
    if (!confirm('Are you sure? This will not delete student accounts but will remove the Union category.')) {
      return;
    }

    try {
      await deleteDoc(doc(db as Firestore, 'classUnions', unionId));
      alert('✅ Union deleted successfully!');
      fetchUnions();
    } catch (error) {
      console.error('Error deleting union:', error);
      alert('❌ Failed to delete Union');
    }
  };

  const handleCreateEditor = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newEditorEmail || !newEditorPassword || !newEditorName) {
      alert('Please fill all fields');
      return;
    }

    try {
      let uid: string;
      
      // Try to create Firebase Auth account
      try {
        if (!auth) {
          throw new Error('Auth is not initialized');
        }
        const userCredential = await createUserWithEmailAndPassword(auth as Auth, newEditorEmail, newEditorPassword);
        uid = userCredential.user.uid;
      } catch (authError: any) {
        // If email already exists, sign in to get the UID
        if (authError.code === 'auth/email-already-in-use') {
          console.log('Email already exists, signing in to get UID...');
          const { signInWithEmailAndPassword } = await import('firebase/auth');
          const userCredential = await signInWithEmailAndPassword(auth as Auth, newEditorEmail, newEditorPassword);
          uid = userCredential.user.uid;
          
          // Check if user document already exists
          const { doc, getDoc } = await import('firebase/firestore');
          const userDocRef = doc(db as Firestore, 'users', uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            alert('⚠️ An editor with this email already exists in the system!');
            return;
          }
          // If document doesn't exist, continue to create it below
        } else {
          throw authError;
        }
      }

      // Create or update Firestore user document with multiple unions support
      const userData: any = {
        email: newEditorEmail,
        role: 'editor',
        displayName: newEditorName,
        classUnions: assignedUnions.length > 0 ? assignedUnions : [], // Array of unions
        createdAt: new Date(),
      };

      // Keep legacy field for backward compatibility
      if (assignedUnions.length === 1) {
        userData.classUnion = assignedUnions[0];
      } else if (assignedUnions.length === 0) {
        userData.classUnion = 'All Unions';
      }

      // Use setDoc instead of addDoc to handle both create and update
      const { doc, setDoc } = await import('firebase/firestore');
      await setDoc(doc(db as Firestore, 'users', uid), userData);

      alert('✅ Editor account created successfully!');
      setNewEditorEmail('');
      setNewEditorPassword('');
      setNewEditorName('');
      setAssignedUnions([]);
      fetchEditors();
    } catch (error: any) {
      console.error('Error creating editor:', error);
      alert(`❌ Failed to create Editor: ${error.message}`);
    }
  };

  const handleDeleteEditor = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this Editor?')) {
      return;
    }

    try {
      await deleteDoc(doc(db as Firestore, 'users', userId));
      alert('✅ Editor removed successfully!');
      fetchEditors();
    } catch (error) {
      console.error('Error deleting editor:', error);
      alert('❌ Failed to delete Editor');
    }
  };

  if (loading || !user || userData?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-700 mx-auto mb-4"></div>
          <p className="text-gray-700">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-heading text-4xl font-bold text-gray-900 mb-2">
              Admin Management Dashboard
            </h1>
            <p className="text-gray-700 mb-4">
              Manage Class Unions and Editor accounts
            </p>
            <button
              onClick={() => router.push('/dashboard/admin/unions')}
              className="bg-green-700 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-800 transition-colors"
            >
              🔗 View All Union Login Links
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b border-gray-300">
            <button
              onClick={() => setActiveTab('unions')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'unions'
                  ? 'text-red-700 border-b-2 border-red-700'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              🏛️ Manage Class Unions
            </button>
            <button
              onClick={() => setActiveTab('editors')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'editors'
                  ? 'text-red-700 border-b-2 border-red-700'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              ✏️ Manage Editors
            </button>
          </div>

          {/* Manage Class Unions Tab */}
          {activeTab === 'unions' && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Create Union Form */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="font-heading text-2xl font-bold text-gray-900 mb-4">
                  ➕ Create New Class Union
                </h2>
                <form onSubmit={handleCreateUnion} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Union Name *
                    </label>
                    <input
                      type="text"
                      value={newUnionName}
                      onChange={(e) => setNewUnionName(e.target.value)}
                      placeholder="e.g., Alpha Union"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Union Username * (for students to login)
                    </label>
                    <input
                      type="text"
                      value={newUnionUsername}
                      onChange={(e) => setNewUnionUsername(e.target.value)}
                      placeholder="e.g., alpha2024"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                    <p className="text-xs text-gray-700 mt-1">Students will use this username to login</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Union Password * (min 4 characters)
                    </label>
                    <input
                      type="text"
                      value={newUnionPassword}
                      onChange={(e) => setNewUnionPassword(e.target.value)}
                      placeholder="e.g., Alpha@123"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                    <p className="text-xs text-gray-700 mt-1">Share this password with union students</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Theme Color
                    </label>
                    <select
                      value={newUnionColor}
                      onChange={(e) => setNewUnionColor(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    >
                      <option value="red-700">🔴 Red</option>
                      <option value="blue-700">🔵 Blue</option>
                      <option value="green-700">🟢 Green</option>
                      <option value="purple-700">🟣 Purple</option>
                      <option value="orange-700">🟠 Orange</option>
                      <option value="teal-700">🩵 Teal</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Union Icon/Mascot (Optional)
                    </label>
                    <input
                      type="text"
                      value={newUnionIcon}
                      onChange={(e) => setNewUnionIcon(e.target.value)}
                      placeholder="🦁 (optional)"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                    <p className="text-xs text-gray-700 mt-1">Use emoji or short text as fallback (optional)</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Union Logo (PNG)
                    </label>
                    <input
                      type="file"
                      accept="image/png, image/jpeg"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setLogoFile(file);
                        if (file) {
                          setNewUnionLogo(URL.createObjectURL(file));
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                    <p className="text-xs text-gray-700 mt-1">Upload PNG or JPG logo (recommended: 200x200px)</p>
                    
                    {/* Logo Preview */}
                    {newUnionLogo && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-600 mb-2">Preview:</p>
                        <img 
                          src={newUnionLogo} 
                          alt="Logo preview" 
                          className="h-20 w-20 object-contain border border-gray-300 rounded-lg bg-white p-2"
                        />
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-red-700 text-white py-3 rounded-lg font-semibold hover:bg-red-800 transition-colors"
                  >
                    Create Class Union
                  </button>
                </form>
              </div>

              {/* Existing Unions List */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="font-heading text-2xl font-bold text-gray-900 mb-4">
                  📋 Existing Class Unions
                </h2>
                {unions.length === 0 ? (
                  <p className="text-gray-700 text-center py-8">No Class Unions yet</p>
                ) : (
                  <div className="space-y-3">
                    {unions.map((union) => (
                      <div
                        key={union.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {/* Show logo if available, otherwise show icon or just name */}
                            {union.logoUrl ? (
                              <img 
                                src={union.logoUrl} 
                                alt={union.name} 
                                className="h-12 w-12 object-contain border border-gray-300 rounded-lg bg-white p-1"
                              />
                            ) : union.icon ? (
                              <span className="text-2xl">{union.icon}</span>
                            ) : (
                              <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                <span className="text-xs text-gray-500 font-semibold">{union.name.charAt(0)}</span>
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-gray-900">{union.name}</p>
                              <p className="text-xs text-gray-700">Color: {union.color}</p>
                            </div>
                          </div>
                          
                          {/* Credentials Box */}
                          <div className="bg-white border border-gray-300 rounded p-2 mt-2">
                            <p className="text-xs font-semibold text-gray-700 mb-1">🔑 Login Credentials:</p>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-gray-600">Username:</span>
                                <code className="ml-2 bg-gray-100 px-2 py-1 rounded font-mono">{union.username}</code>
                              </div>
                              <div>
                                <span className="text-gray-600">Password:</span>
                                <code className="ml-2 bg-gray-100 px-2 py-1 rounded font-mono">{union.password}</code>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => handleDeleteUnion(union.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium ml-4"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Manage Editors Tab */}
          {activeTab === 'editors' && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Create Editor Form */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="font-heading text-2xl font-bold text-gray-900 mb-4">
                  ➕ Create New Editor Account
                </h2>
                <form onSubmit={handleCreateEditor} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={newEditorEmail}
                      onChange={(e) => setNewEditorEmail(e.target.value)}
                      placeholder="editor@school.edu"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Temporary Password *
                    </label>
                    <input
                      type="password"
                      value={newEditorPassword}
                      onChange={(e) => setNewEditorPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Display Name *
                    </label>
                    <input
                      type="text"
                      value={newEditorName}
                      onChange={(e) => setNewEditorName(e.target.value)}
                      placeholder="Mr. John Smith"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Assign to Unions (Optional)
                    </label>
                    <div className="border border-gray-300 rounded-lg p-4 max-h-48 overflow-y-auto">
                      {unions.length === 0 ? (
                        <p className="text-sm text-gray-500">No unions available. Create some first!</p>
                      ) : (
                        <div className="space-y-2">
                          {/* All Unions option */}
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={assignedUnions.length === 0}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setAssignedUnions([]); // Clear = All Unions
                                }
                              }}
                              className="h-4 w-4 text-red-700 focus:ring-red-500 border-gray-300 rounded"
                            />
                            <span className="text-sm font-medium text-gray-900">🌟 All Unions (General Editor)</span>
                          </label>
                          
                          {/* Individual unions */}
                          {unions.map((union) => (
                            <label key={union.id} className="flex items-center gap-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={assignedUnions.includes(union.name)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setAssignedUnions([...assignedUnions, union.name]);
                                  } else {
                                    setAssignedUnions(assignedUnions.filter(u => u !== union.name));
                                  }
                                }}
                                className="h-4 w-4 text-red-700 focus:ring-red-500 border-gray-300 rounded"
                              />
                              <span className="text-sm text-gray-700">
                                {union.icon || '🏛️'} {union.name}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-700 mt-1">
                      Select one or more unions, or leave all unchecked for general editor (all unions)
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-red-700 text-white py-3 rounded-lg font-semibold hover:bg-red-800 transition-colors"
                  >
                    Create Editor Account
                  </button>
                </form>
              </div>

              {/* Existing Editors List */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="font-heading text-2xl font-bold text-gray-900 mb-4">
                  👥 Current Editors
                </h2>
                {editors.length === 0 ? (
                  <p className="text-gray-700 text-center py-8">No editors yet</p>
                ) : (
                  <div className="space-y-3">
                    {editors.map((editor) => (
                      <div
                        key={editor.id}
                        className="p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-semibold text-gray-900">{editor.displayName}</p>
                            <p className="text-sm text-gray-900">{editor.email}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteEditor(editor.id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Remove
                          </button>
                        </div>
                        {editor.classUnion && (
                          <p className="text-xs text-gray-700">
                            Assigned to: {editor.classUnion}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
