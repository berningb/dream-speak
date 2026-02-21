import { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  getRedirectResult,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  deleteUser,
  reauthenticateWithPopup,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { auth } from '../firebase';
import { invalidateAllDreams, invalidateLists } from '../services/dreamCacheService';

const FirebaseAuthContext = createContext();

export const useFirebaseAuth = () => {
  const context = useContext(FirebaseAuthContext);
  if (!context) {
    throw new Error('useFirebaseAuth must be used within a FirebaseAuthProvider');
  }
  return context;
};

export const FirebaseAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe;
    let mounted = true;

    const initAuth = async () => {
      try {
        await getRedirectResult(auth);
      } catch (err) {
        console.error('Redirect sign-in error:', err);
      }

      if (mounted) {
        unsubscribe = onAuthStateChanged(auth, (authUser) => {
          if (!authUser) {
            invalidateAllDreams();
            invalidateLists();
          }
          setUser(authUser);
          setLoading(false);
        });
      }
    };

    initAuth();
    return () => {
      mounted = false;
      unsubscribe?.();
    };
  }, []);

  const login = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  };

  const signup = async (email, password, displayName) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(result.user, { displayName });
    }
    return result.user;
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result.user;
  };

  const logout = async () => {
    invalidateAllDreams();
    invalidateLists();
    await signOut(auth);
  };

  const deleteAccount = async (password = null) => {
    if (!auth.currentUser) throw new Error('Not authenticated');
    const provider = auth.currentUser.providerData?.[0]?.providerId;
    try {
      if (provider === 'google.com') {
        await reauthenticateWithPopup(auth.currentUser, new GoogleAuthProvider());
      } else if (provider === 'password' && password) {
        const cred = EmailAuthProvider.credential(auth.currentUser.email, password);
        await reauthenticateWithCredential(auth.currentUser, cred);
      } else if (provider === 'password') {
        throw new Error('Please enter your password to confirm account deletion.');
      } else {
        throw new Error('Re-authentication is required. Please sign out and sign in again, then try deleting your account.');
      }
      await deleteUser(auth.currentUser);
    } catch (err) {
      if (err.code === 'auth/requires-recent-login') {
        throw new Error('Please sign out and sign in again, then try deleting your account.');
      }
      throw err;
    }
  };

  const updateUserProfile = async (profileData) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    const updateData = {};
    
    // Update displayName if firstName or lastName provided
    if (profileData.firstName || profileData.lastName) {
      const firstName = profileData.firstName || '';
      const lastName = profileData.lastName || '';
      updateData.displayName = `${firstName} ${lastName}`.trim();
    }
    
    // Update photoURL if picture provided
    if (profileData.picture) {
      updateData.photoURL = profileData.picture;
    }

    if (Object.keys(updateData).length > 0) {
      await updateProfile(user, updateData);
      console.log('✅ Firebase Auth profile updated:', updateData);
    }
  };

  const value = {
    user,
    loading,
    login,
    signup,
    loginWithGoogle,
    logout,
    updateUserProfile,
    deleteAccount,
    isAuthenticated: !!user
  };

  return (
    <FirebaseAuthContext.Provider value={value}>
      {children}
    </FirebaseAuthContext.Provider>
  );
}; 