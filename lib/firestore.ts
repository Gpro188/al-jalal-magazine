import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  QueryConstraint,
  Firestore
} from 'firebase/firestore';
import { FirebaseStorage } from 'firebase/storage';
import { db, storage } from './firebaseConfig';

export type PostStatus = 'pending_review' | 'staff_approved' | 'published' | 'rejected';

export interface Post {
  id?: string;
  title: string;
  content: string;
  studentName: string;
  category: {
    union: string;
    year: string;
  };
  status: PostStatus;
  authorId: string;
  rejectionComments?: string;
  rejectionReason?: string;
  featuredImage?: string;
  isBanner?: boolean;
  bannerStart?: Timestamp;
  bannerEnd?: Timestamp;
  publishedAt?: Timestamp;
  titleSize?: 'small' | 'medium' | 'large';
  subtitleSize?: 'small' | 'medium' | 'large';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Create a new post (Contributor)
export const createPost = async (postData: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; postId?: string; error?: string }> => {
  try {
    const docRef = await addDoc(collection(db as Firestore, 'posts'), {
      ...postData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return { success: true, postId: docRef.id };
  } catch (error: any) {
    console.error('Error creating post:', error);
    return { success: false, error: error.message };
  }
};

// Update post status (Editor/Admin)
export const updatePostStatus = async (
  postId: string, 
  status: PostStatus,
  additionalData?: Partial<Post>
): Promise<{ success: boolean; error?: string }> => {
  try {
    const postRef = doc(db as Firestore, 'posts', postId);
    const updateData: any = {
      status,
      updatedAt: Timestamp.now(),
      ...additionalData,
    };
    
    await updateDoc(postRef, updateData);
    return { success: true };
  } catch (error: any) {
    console.error('Error updating post:', error);
    return { success: false, error: error.message };
  }
};

// Get posts by status
export const getPostsByStatus = async (status: PostStatus): Promise<Post[]> => {
  try {
    const q = query(
      collection(db as Firestore, 'posts'),
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const posts: Post[] = [];
    
    querySnapshot.forEach((doc) => {
      posts.push({ id: doc.id, ...doc.data() } as Post);
    });
    
    return posts;
  } catch (error) {
    console.error('Error getting posts:', error);
    return [];
  }
};

// Get posts by author ID
export const getPostsByAuthor = async (authorId: string): Promise<Post[]> => {
  try {
    const q = query(
      collection(db as Firestore, 'posts'),
      where('authorId', '==', authorId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const posts: Post[] = [];
    
    querySnapshot.forEach((doc) => {
      posts.push({ id: doc.id, ...doc.data() } as Post);
    });
    
    return posts;
  } catch (error) {
    console.error('Error getting posts:', error);
    return [];
  }
};

// Get published posts for homepage
export const getPublishedPosts = async (limit?: number): Promise<Post[]> => {
  try {
    // Load all posts and filter client-side to avoid index issues
    const q = query(collection(db as Firestore, 'posts'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const posts: Post[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.status === 'published') {
        posts.push({ id: doc.id, ...data } as Post);
      }
    });
    
    // Apply limit if specified
    if (limit && limit > 0) {
      return posts.slice(0, limit);
    }
    
    return posts;
  } catch (error) {
    console.error('Error getting published posts:', error);
    return [];
  }
};

// Get single post by ID
export const getPostById = async (postId: string): Promise<Post | null> => {
  try {
    const docRef = doc(db as Firestore, 'posts', postId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Post;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting post:', error);
    return null;
  }
};

// Upload featured image to Firebase Storage
export const uploadFeaturedImage = async (file: File, postId: string): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    console.log('=== IMAGE UPLOAD START ===');
    console.log('Post ID:', postId);
    console.log('File name:', file.name);
    console.log('File size:', file.size, 'bytes');
    console.log('File type:', file.type);
    
    const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
    const { storage: firestoreStorage } = await import('./firebaseConfig');
    
    if (!firestoreStorage) {
      return { success: false, error: 'Storage is not initialized' };
    }
    
    console.log('Storage object:', firestoreStorage ? 'OK' : 'NULL');
    console.log('Storage bucket:', (firestoreStorage as FirebaseStorage).app.options.storageBucket);
    
    const storagePath = `featured-images/${postId}-${Date.now()}-${file.name}`;
    console.log('Storage path:', storagePath);
    
    const storageRef = ref(firestoreStorage as FirebaseStorage, storagePath);
    console.log('Storage reference created');
    
    // Add timeout to prevent hanging
    const uploadPromise = uploadBytes(storageRef, file);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Upload timed out after 30 seconds')), 30000)
    );
    
    console.log('Starting upload with 30s timeout...');
    await Promise.race([uploadPromise, timeoutPromise]);
    
    console.log('Upload complete! Getting download URL...');
    const url = await getDownloadURL(storageRef);
    console.log('Download URL:', url);
    console.log('=== IMAGE UPLOAD SUCCESS ===');
    
    return { success: true, url };
  } catch (error: any) {
    console.error('=== IMAGE UPLOAD FAILED ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Server response:', error.serverResponse);
    console.error('Full error:', error);
    return { success: false, error: error.message || 'Unknown upload error' };
  }
};
