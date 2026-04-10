import { auth } from './firebaseConfig';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  Auth
} from 'firebase/auth';

// Sign up new user
export const signUp = async (email: string, password: string) => {
  try {
    if (!auth) {
      return { success: false, error: 'Auth not initialized' };
    }
    const userCredential = await createUserWithEmailAndPassword(auth as Auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Sign in existing user
export const signIn = async (email: string, password: string) => {
  try {
    if (!auth) {
      return { success: false, error: 'Auth not initialized' };
    }
    const userCredential = await signInWithEmailAndPassword(auth as Auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Sign out
export const signOut = async () => {
  try {
    if (!auth) {
      return { success: false, error: 'Auth not initialized' };
    }
    await firebaseSignOut(auth as Auth);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Listen to auth changes
export const onAuthChange = (callback: (user: User | null) => void) => {
  if (!auth) {
    console.warn('Auth not initialized');
    return () => {};
  }
  return onAuthStateChanged(auth as Auth, callback);
};

// Get current user
export const getCurrentUser = () => {
  return auth?.currentUser || null;
};
