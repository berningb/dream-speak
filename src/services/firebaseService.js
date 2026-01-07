import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  setDoc,
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth } from '../firebase';

// Helper function to check authentication
const checkAuth = () => {
  if (!auth.currentUser) {
    throw new Error('User not authenticated. Please log in.');
  }
  return auth.currentUser.uid;
};

// Helper function to retry operations with exponential backoff
const retryOperation = async (operation, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      const delay = Math.pow(2, attempt) * 1000;
      console.log(`Retrying operation in ${delay}ms (attempt ${attempt}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Dreams collection
const dreamsCollection = 'dreams';
const usersCollection = 'users';
const notesCollection = 'notes';
const commentsCollection = 'comments';
const likesCollection = 'likes';
const favoritesCollection = 'favorites';

// User operations
export const createUser = async (userData) => {
  try {
    const userId = checkAuth();
    
    // Use retry logic for the write operation
    return await retryOperation(async () => {
      const userRef = doc(db, usersCollection, userId);
      await setDoc(userRef, {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      return { id: userId, ...userData };
    });
  } catch (error) {
    console.error('Error creating user:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
};

export const debugUserDocument = async () => {
  try {
    const userId = checkAuth();
    console.log('🔍 Debugging user document for:', userId);
    
    const userRef = doc(db, usersCollection, userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data();
      console.log('✅ User document exists:', userData);
      return { exists: true, data: userData };
    } else {
      console.log('❌ User document does not exist');
      return { exists: false, data: null };
    }
  } catch (error) {
    console.error('❌ Error debugging user document:', error);
    return { exists: false, error: error.message };
  }
};

export const getUser = async (userId) => {
  try {
    const userRef = doc(db, usersCollection, userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
};

export const updateUser = async (userData) => {
  try {
    const userId = checkAuth();
    console.log('🔄 Starting updateUser operation:', { userId, userData });
    
    // Use retry logic for the write operation
    return await retryOperation(async () => {
      const userRef = doc(db, usersCollection, userId);
      console.log('📝 Writing to Firestore:', { collection: usersCollection, userId, data: userData });
      
      await setDoc(userRef, {
        ...userData,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      console.log('✅ Firestore write successful');
      
      // Verify the write by reading it back
      const updatedDoc = await getDoc(userRef);
      if (updatedDoc.exists()) {
        console.log('✅ Document verified in Firestore:', updatedDoc.data());
      } else {
        console.log('❌ Document not found after write');
      }
      
      return { id: userId, ...userData };
    });
  } catch (error) {
    console.error('❌ Error updating user:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
};

// Dream operations
export const createDream = async (dreamData) => {
  try {
    // Check authentication first
    const userId = checkAuth();
    
    // Use retry logic for the write operation
    return await retryOperation(async () => {
      const dreamRef = await addDoc(collection(db, dreamsCollection), {
        ...dreamData,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return { id: dreamRef.id, ...dreamData };
    });
  } catch (error) {
    console.error('Error creating dream:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
};

export const getDreams = async () => {
  try {
    const dreamsRef = collection(db, dreamsCollection);
    const q = query(dreamsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting dreams:', error);
    throw error;
  }
};

export const getMyDreams = async () => {
  try {
    const dreamsRef = collection(db, dreamsCollection);
    const q = query(
      dreamsRef, 
      where('userId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Convert Firestore timestamps to ISO strings
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
    }));
  } catch (error) {
    console.error('Error getting my dreams:', error);
    // If index doesn't exist, try a simpler query
    if (error.code === 'failed-precondition') {
      try {
        const dreamsRef = collection(db, dreamsCollection);
        const q = query(dreamsRef, where('userId', '==', auth.currentUser.uid));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
        }));
      } catch (fallbackError) {
        console.error('Fallback query also failed:', fallbackError);
        return []; // Return empty array instead of throwing
      }
    }
    return []; // Return empty array instead of throwing
  }
};

export const getPublicDreams = async () => {
  try {
    const dreamsRef = collection(db, dreamsCollection);
    const q = query(
      dreamsRef, 
      where('isPublic', '==', true)
      // Temporarily removed orderBy to avoid index requirement
      // orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    // Sort in JavaScript instead
    const dreams = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Convert Firestore timestamps to ISO strings
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
    }));
    
    // Sort by createdAt in descending order (newest first)
    return dreams.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateB - dateA;
    });
  } catch (error) {
    console.error('❌ Error getting public dreams:', error);
    // Return empty array instead of throwing to avoid breaking the UI
    return [];
  }
};

export const getDream = async (dreamId) => {
  try {
    const dreamRef = doc(db, dreamsCollection, dreamId);
    const dreamSnap = await getDoc(dreamRef);
    if (dreamSnap.exists()) {
      const data = dreamSnap.data();
      return { 
        id: dreamSnap.id, 
        ...data,
        // Convert Firestore timestamps to ISO strings (same as getMyDreams)
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting dream:', error);
    throw error;
  }
};

export const updateDream = async (dreamId, dreamData) => {
  try {
    const dreamRef = doc(db, dreamsCollection, dreamId);
    await updateDoc(dreamRef, {
      ...dreamData,
      updatedAt: serverTimestamp()
    });
    return { id: dreamId, ...dreamData };
  } catch (error) {
    console.error('Error updating dream:', error);
    throw error;
  }
};

export const deleteDream = async (dreamId) => {
  try {
    const dreamRef = doc(db, dreamsCollection, dreamId);
    await deleteDoc(dreamRef);
    return { id: dreamId };
  } catch (error) {
    console.error('Error deleting dream:', error);
    throw error;
  }
};

// Note operations
export const createNote = async (noteData) => {
  try {
    const userId = checkAuth();
    
    return await retryOperation(async () => {
      const noteRef = await addDoc(collection(db, notesCollection), {
        ...noteData,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return { id: noteRef.id, ...noteData };
    });
  } catch (error) {
    console.error('❌ Error creating note:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
};

export const updateNote = async (noteId, noteData) => {
  try {
    checkAuth(); // Ensure user is authenticated
    
    return await retryOperation(async () => {
      const noteRef = doc(db, notesCollection, noteId);
      await updateDoc(noteRef, {
        ...noteData,
        updatedAt: serverTimestamp()
      });
      
      return { id: noteId, ...noteData };
    });
  } catch (error) {
    console.error('❌ Error updating note:', error);
    throw error;
  }
};

export const deleteNote = async (noteId) => {
  try {
    checkAuth(); // Ensure user is authenticated
    
    return await retryOperation(async () => {
      const noteRef = doc(db, notesCollection, noteId);
      await deleteDoc(noteRef);
    });
  } catch (error) {
    console.error('❌ Error deleting note:', error);
    throw error;
  }
};

// Privacy Settings operations
export const getUserPrivacySettings = async (userId = null) => {
  try {
    const targetUserId = userId || checkAuth();
    const userRef = doc(db, usersCollection, targetUserId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data();
      return userData.privacySettings || {
        // Default privacy settings
        profileVisibility: 'public', // 'public', 'friends', 'private'
        dreamVisibility: 'public', // 'public', 'friends', 'private'
        allowComments: 'everyone', // 'everyone', 'friends', 'none'
        allowLikes: 'everyone', // 'everyone', 'friends', 'none'
        allowFavorites: 'everyone', // 'everyone', 'friends', 'none'
        showInSearch: true,
        anonymousMode: false,
        showJoinDate: true,
        showDreamCount: true,
        allowDirectMessages: 'everyone' // 'everyone', 'friends', 'none'
      };
    }
    
    // Return default settings if user doesn't exist
    return {
      profileVisibility: 'public',
      dreamVisibility: 'public',
      allowComments: 'everyone',
      allowLikes: 'everyone',
      allowFavorites: 'everyone',
      showInSearch: true,
      anonymousMode: false,
      showJoinDate: true,
      showDreamCount: true,
      allowDirectMessages: 'everyone'
    };
  } catch (error) {
    console.error('❌ Error getting privacy settings:', error);
    throw error;
  }
};

export const updatePrivacySettings = async (privacySettings) => {
  try {
    const userId = checkAuth();
    
    return await retryOperation(async () => {
      const userRef = doc(db, usersCollection, userId);
      await updateDoc(userRef, {
        privacySettings,
        updatedAt: serverTimestamp()
      });
      
      return privacySettings;
    });
  } catch (error) {
    console.error('❌ Error updating privacy settings:', error);
    throw error;
  }
};

// Privacy check functions
export const canUserComment = async (dreamOwnerId, requestingUserId = null) => {
  try {
    const userId = requestingUserId || checkAuth();
    if (userId === dreamOwnerId) return true; // Owner can always comment on their own dreams
    
    const ownerSettings = await getUserPrivacySettings(dreamOwnerId);
    
    switch (ownerSettings.allowComments) {
      case 'everyone':
        return true;
      case 'friends':
        // TODO: Implement friends system
        return false;
      case 'none':
        return false;
      default:
        return true;
    }
  } catch (error) {
    console.error('❌ Error checking comment permissions:', error);
    return false;
  }
};

export const canUserLike = async (dreamOwnerId, requestingUserId = null) => {
  try {
    const userId = requestingUserId || checkAuth();
    if (userId === dreamOwnerId) return true; // Owner can always like their own dreams
    
    const ownerSettings = await getUserPrivacySettings(dreamOwnerId);
    
    switch (ownerSettings.allowLikes) {
      case 'everyone':
        return true;
      case 'friends':
        // TODO: Implement friends system
        return false;
      case 'none':
        return false;
      default:
        return true;
    }
  } catch (error) {
    console.error('❌ Error checking like permissions:', error);
    return false;
  }
};

export const canUserFavorite = async (dreamOwnerId, requestingUserId = null) => {
  try {
    const userId = requestingUserId || checkAuth();
    if (userId === dreamOwnerId) return true; // Owner can always favorite their own dreams
    
    const ownerSettings = await getUserPrivacySettings(dreamOwnerId);
    
    switch (ownerSettings.allowFavorites) {
      case 'everyone':
        return true;
      case 'friends':
        // TODO: Implement friends system
        return false;
      case 'none':
        return false;
      default:
        return true;
    }
  } catch (error) {
    console.error('❌ Error checking favorite permissions:', error);
    return false;
  }
};

export const getNotes = async () => {
  try {
    const userId = checkAuth();
    const notesRef = collection(db, notesCollection);
    const q = query(
      notesRef, 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('❌ Error getting notes:', error);
    throw error;
  }
};

// Favorite operations
export const createFavorite = async (favoriteData) => {
  try {
    const userId = checkAuth();
    
    // Get user's privacy settings to check for anonymous mode
    const privacySettings = await getUserPrivacySettings(userId);
    
    return await retryOperation(async () => {
      const favoriteRef = await addDoc(collection(db, favoritesCollection), {
        ...favoriteData,
        userId,
        user: privacySettings.anonymousMode ? {
          id: 'anonymous',
          displayName: 'Anonymous',
          isAnonymous: true
        } : {
          id: auth.currentUser.uid,
          displayName: auth.currentUser.displayName || 'Anonymous',
          isAnonymous: false
        },
        createdAt: serverTimestamp()
      });
      
      return { id: favoriteRef.id, ...favoriteData };
    });
  } catch (error) {
    console.error('❌ Error creating favorite:', error);
    throw error;
  }
};

export const deleteFavorite = async (favoriteId) => {
  try {
    checkAuth(); // Ensure user is authenticated
    
    return await retryOperation(async () => {
      const favoriteRef = doc(db, favoritesCollection, favoriteId);
      await deleteDoc(favoriteRef);
    });
  } catch (error) {
    console.error('❌ Error deleting favorite:', error);
    throw error;
  }
};

export const getFavorites = async () => {
  try {
    const userId = checkAuth();
    const favoritesRef = collection(db, favoritesCollection);
    const q = query(
      favoritesRef, 
      where('userId', '==', userId)
      // Temporarily removed orderBy to avoid index requirement
      // orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    // Get the basic favorite records
    const favorites = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Fetch dream data and notes for each favorite
    const favoritesWithData = await Promise.all(
      favorites.map(async (favorite) => {
        try {
          // Fetch the dream data
          const dream = await getDream(favorite.dreamId);
          
          // Fetch notes for this favorite
          const notesRef = collection(db, notesCollection);
          const notesQuery = query(
            notesRef,
            where('favoriteId', '==', favorite.id),
            where('userId', '==', userId)
          );
          const notesSnapshot = await getDocs(notesQuery);
          const note = notesSnapshot.docs.length > 0 ? {
            id: notesSnapshot.docs[0].id,
            ...notesSnapshot.docs[0].data()
          } : null;
          
          return {
            ...favorite,
            dream,
            note
          };
        } catch (error) {
          console.warn(`Failed to fetch data for favorite ${favorite.id}:`, error);
          return {
            ...favorite,
            dream: null,
            note: null
          };
        }
      })
    );
    
    // Sort by createdAt in descending order
    return favoritesWithData.sort((a, b) => {
      const dateA = a.createdAt?.seconds || 0;
      const dateB = b.createdAt?.seconds || 0;
      return dateB - dateA;
    });
  } catch (error) {
    console.error('❌ Error getting favorites:', error);
    throw error;
  }
};

// Comment operations
export const createComment = async (commentData) => {
  try {
    const userId = checkAuth();
    
    // Get user's privacy settings to check for anonymous mode
    const privacySettings = await getUserPrivacySettings(userId);
    
    return await retryOperation(async () => {
      const commentRef = await addDoc(collection(db, commentsCollection), {
        ...commentData,
        userId,
        user: privacySettings.anonymousMode ? {
          id: 'anonymous',
          displayName: 'Anonymous',
          email: null,
          photoURL: null,
          isAnonymous: true
        } : {
          id: auth.currentUser.uid,
          displayName: auth.currentUser.displayName || 'Anonymous',
          email: auth.currentUser.email,
          photoURL: auth.currentUser.photoURL,
          isAnonymous: false
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return { id: commentRef.id, ...commentData };
    });
  } catch (error) {
    console.error('❌ Error creating comment:', error);
    throw error;
  }
};

export const deleteComment = async (commentId) => {
  try {
    checkAuth(); // Ensure user is authenticated
    
    return await retryOperation(async () => {
      const commentRef = doc(db, commentsCollection, commentId);
      await deleteDoc(commentRef);
    });
  } catch (error) {
    console.error('❌ Error deleting comment:', error);
    throw error;
  }
};

export const canUserDeleteComment = async (comment, dreamOwnerId, requestingUserId = null) => {
  try {
    const userId = requestingUserId || checkAuth();
    
    // User can delete their own comments
    if (comment.userId === userId) return true;
    
    // Dream owner can delete comments on their own dreams
    if (dreamOwnerId === userId) return true;
    
    // Anonymous users can't delete comments (unless they're the dream owner)
    return false;
  } catch (error) {
    console.error('❌ Error checking delete comment permissions:', error);
    return false;
  }
};

export const updateComment = async (commentId, commentData) => {
  try {
    checkAuth(); // Ensure user is authenticated
    
    return await retryOperation(async () => {
      const commentRef = doc(db, commentsCollection, commentId);
      await updateDoc(commentRef, {
        ...commentData,
        updatedAt: serverTimestamp()
      });
      
      return { id: commentId, ...commentData };
    });
  } catch (error) {
    console.error('❌ Error updating comment:', error);
    throw error;
  }
};

export const canUserEditComment = async (comment, requestingUserId = null) => {
  try {
    const userId = requestingUserId || checkAuth();
    
    // User can only edit their own comments
    if (comment.userId === userId) return true;
    
    // Anonymous users can't edit comments
    return false;
  } catch (error) {
    console.error('❌ Error checking edit comment permissions:', error);
    return false;
  }
};

export const getComments = async (dreamId) => {
  try {
    const commentsRef = collection(db, commentsCollection);
    const q = query(
      commentsRef, 
      where('dreamId', '==', dreamId)
      // Temporarily removed orderBy to avoid index requirement
      // orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    // Sort in JavaScript instead
    const comments = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    // Sort by createdAt in descending order
    return comments.sort((a, b) => {
      const dateA = a.createdAt?.seconds || 0;
      const dateB = b.createdAt?.seconds || 0;
      return dateB - dateA;
    });
  } catch (error) {
    console.error('❌ Error getting comments:', error);
    throw error;
  }
};

// Like operations
export const createLike = async (likeData) => {
  try {
    const userId = checkAuth();
    
    // Get user's privacy settings to check for anonymous mode
    const privacySettings = await getUserPrivacySettings(userId);
    
    return await retryOperation(async () => {
      const likeRef = await addDoc(collection(db, likesCollection), {
        ...likeData,
        userId,
        user: privacySettings.anonymousMode ? {
          id: 'anonymous',
          displayName: 'Anonymous',
          isAnonymous: true
        } : {
          id: auth.currentUser.uid,
          displayName: auth.currentUser.displayName || 'Anonymous',
          isAnonymous: false
        },
        createdAt: serverTimestamp()
      });
      
      return { id: likeRef.id, ...likeData };
    });
  } catch (error) {
    console.error('❌ Error creating like:', error);
    throw error;
  }
};

export const deleteLike = async (likeId) => {
  try {
    checkAuth(); // Ensure user is authenticated
    
    return await retryOperation(async () => {
      const likeRef = doc(db, likesCollection, likeId);
      await deleteDoc(likeRef);
    });
  } catch (error) {
    console.error('❌ Error deleting like:', error);
    throw error;
  }
};

export const getLikes = async (dreamId) => {
  try {
    const likesRef = collection(db, likesCollection);
    const q = query(
      likesRef, 
      where('dreamId', '==', dreamId)
      // Temporarily removed orderBy to avoid index requirement
      // orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    // Sort in JavaScript instead
    const likes = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    // Sort by createdAt in descending order
    return likes.sort((a, b) => {
      const dateA = a.createdAt?.seconds || 0;
      const dateB = b.createdAt?.seconds || 0;
      return dateB - dateA;
    });
  } catch (error) {
    console.error('❌ Error getting likes:', error);
    throw error;
  }
}; 