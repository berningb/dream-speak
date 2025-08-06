import { useState, useEffect, createContext, useContext } from 'react';
import { useFirebaseAuth } from '../contexts/FirebaseAuthContext';
import { getUser, createUser } from '../services/firebaseService';

const BackendUserContext = createContext();

export const useBackendUser = () => {
  const context = useContext(BackendUserContext);
  if (!context) {
    throw new Error('useBackendUser must be used within a BackendUserProvider');
  }
  return context;
};

export const BackendUserProvider = ({ children }) => {
  const [backendUser, setBackendUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user: firebaseUser, isAuthenticated } = useFirebaseAuth();

  const fetchBackendUser = async () => {
    if (!isAuthenticated || !firebaseUser) {
      setBackendUser(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log("[BackendUserProvider] Fetching user data for:", firebaseUser.uid);
      
      // Try to get existing user from Firestore
      const userData = await getUser(firebaseUser.uid);
      
      if (userData) {
        console.log("[BackendUserProvider] User found:", userData);
        setBackendUser(userData);
      } else {
        console.log("[BackendUserProvider] User not found, creating new user");
        // Create user if doesn't exist
        const newUser = await createUser({
          firstName: firebaseUser.displayName?.split(' ')[0] || '',
          lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
          email: firebaseUser.email,
          picture: firebaseUser.photoURL || ''
        });
        setBackendUser(newUser);
      }
      
      setError(null);
    } catch (err) {
      console.error('[BackendUserProvider] Error fetching/creating user:', err);
      setError(err.message);
      setBackendUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackendUser();
  }, [isAuthenticated, firebaseUser]);

  const refetchUser = () => {
    fetchBackendUser();
  };

  const value = {
    backendUser,
    loading,
    error,
    refetchUser
  };

  return (
    <BackendUserContext.Provider value={value}>
      {children}
    </BackendUserContext.Provider>
  );
};

export const useUsers = () => {
  const { user } = useFirebaseAuth();
  
  // For Firebase, the user is already available from the auth context
  // We can expand this if we need to fetch additional user data
  return {
    user,
    loading: false,
    error: null
  };
};
