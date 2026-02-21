import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  deleteField,
  setDoc,
  query, 
  where, 
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, listAll, deleteObject } from 'firebase/storage';
import { db, auth, storage } from '../firebase';
import { getCachedDream, setCachedDream, invalidateDream, invalidateLists, getCachedList, setCachedList } from './dreamCacheService';

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

// Helper: upload base64/data URL image to Storage, return public URL
export const uploadDreamImage = async (dataUrl, dreamId = 'new') => {
  if (!dataUrl || !dataUrl.startsWith('data:')) return null
  const userId = checkAuth()
  const [header, base64] = dataUrl.split(',')
  const mime = header.match(/data:([^;]+)/)?.[1] || 'image/png'
  const ext = mime.includes('png') ? 'png' : 'jpeg'
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  const blob = new Blob([bytes], { type: mime })
  const path = `dreams/${userId}/${dreamId}-${Date.now()}.${ext}`
  const storageRef = ref(storage, path)
  await uploadBytes(storageRef, blob)
  return getDownloadURL(storageRef)
}

// Dreams collection
const dreamsCollection = 'dreams';
const usersCollection = 'users';
const notesCollection = 'notes';
const commentsCollection = 'comments';
const likesCollection = 'likes';
const favoritesCollection = 'favorites';
const friendRequestsCollection = 'friendRequests';
const friendsCollection = 'friends';

function normalizeUsername(s) {
  return (s || '').toLowerCase().replace(/[^a-z0-9_]/g, '');
}

function validateUsername(username) {
  const norm = normalizeUsername(username);
  if (norm.length < 3 || norm.length > 30) return { ok: false, error: 'Username must be 3–30 characters' };
  if (!/^[a-z0-9_]+$/.test(norm)) return { ok: false, error: 'Username can only contain letters, numbers, and underscores' };
  return { ok: true, normalized: norm };
}

export const getUserByUsername = async (username) => {
  try {
    const { ok, normalized } = validateUsername(username);
    if (!ok || !normalized) return null;
    const usersRef = collection(db, usersCollection);
    const q = query(usersRef, where('username', '==', normalized));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...d.data() };
  } catch (error) {
    console.error('Error getting user by username:', error);
    return null;
  }
};

// User operations
export const createUser = async (userData) => {
  try {
    const userId = checkAuth();
    const payload = { ...userData };
    const rawUsername = payload.username;
    delete payload.username;
    let username = null;
    if (rawUsername?.trim()) {
      const v = validateUsername(rawUsername);
      if (!v.ok) throw new Error(v.error);
      username = v.normalized;
    }

    return await retryOperation(async () => {
      const userRef = doc(db, usersCollection, userId);
      await setDoc(userRef, {
        ...payload,
        ...(username && { username }),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
      return { id: userId, ...userData, ...(username && { username }) };
    });
  } catch (error) {
    console.error('Error creating user:', error);
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
    const payload = { ...userData };
    const rawUsername = payload.username;
    delete payload.username;
    if (rawUsername !== undefined) {
      payload.username = rawUsername?.trim() ? (() => {
        const v = validateUsername(rawUsername);
        if (!v.ok) throw new Error(v.error);
        return v.normalized;
      })() : deleteField();
    }
    return await retryOperation(async () => {
      const userRef = doc(db, usersCollection, userId);
      await setDoc(userRef, { ...payload, updatedAt: serverTimestamp() }, { merge: true });
      return { id: userId, ...userData };
    });
  } catch (error) {
    console.error('Error updating user:', error);
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
      invalidateLists();
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
    const userId = checkAuth();
    const cached = getCachedFullList('myDreams', userId);
    if (cached !== null) return cached;
    const dreamsRef = collection(db, dreamsCollection);
    const q = query(
      dreamsRef, 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const dreams = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
    }));
    setCachedFullList('myDreams', dreams, userId);
    return dreams;
  } catch (error) {
    console.error('Error getting my dreams:', error);
    // If index doesn't exist, try a simpler query
    if (error.code === 'failed-precondition') {
      try {
        const userId = checkAuth();
        const dreamsRef = collection(db, dreamsCollection);
        const q = query(dreamsRef, where('userId', '==', userId));
        const querySnapshot = await getDocs(q);
        const dreams = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
        }));
        setCachedFullList('myDreams', dreams, userId);
        return dreams;
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
    const cached = getCachedFullList('publicDreams');
    if (cached !== null) return cached;
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
    
    dreams.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateB - dateA;
    });
    setCachedFullList('publicDreams', dreams);
    return dreams;
  } catch (error) {
    console.error('❌ Error getting public dreams:', error);
    // Return empty array instead of throwing to avoid breaking the UI
    return [];
  }
};

const PAGE_SIZE = 24;

const mapDreamDoc = (docSnap) => {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
  };
};

export const getMyDreamsPaginated = async (pageSize = PAGE_SIZE, lastDoc = null) => {
  try {
    const userId = checkAuth();
    const cached = getCachedList('myDreams', pageSize, lastDoc, null, userId);
    if (cached !== null) return cached;
    const dreamsRef = collection(db, dreamsCollection);
    const constraints = [
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      ...(lastDoc ? [startAfter(lastDoc)] : []),
      limit(pageSize + 1)
    ];
    const q = query(dreamsRef, ...constraints);
    const querySnapshot = await getDocs(q);
    const docs = querySnapshot.docs;
    const hasMore = docs.length > pageSize;
    const dreams = (hasMore ? docs.slice(0, pageSize) : docs).map(mapDreamDoc);
    const newLastDoc = dreams.length > 0 ? docs[dreams.length - 1] : null;
    const result = { dreams, lastDoc: newLastDoc, hasMore };
    setCachedList('myDreams', pageSize, lastDoc, null, result, userId);
    dreams.forEach(d => setCachedDream(d.id, d));
    return result;
  } catch (error) {
    if (error.code === 'failed-precondition') {
      try {
        const userId = checkAuth();
        const dreamsRef = collection(db, dreamsCollection);
        const q = query(dreamsRef, where('userId', '==', userId));
        const querySnapshot = await getDocs(q);
        const dreams = querySnapshot.docs.map(mapDreamDoc);
        dreams.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const result = { dreams, lastDoc: null, hasMore: false };
        setCachedList('myDreams', pageSize, null, null, result, userId);
        dreams.forEach(d => setCachedDream(d.id, d));
        return result;
      } catch (fallbackError) {
        console.error('Fallback paginated query failed:', fallbackError);
        return { dreams: [], lastDoc: null, hasMore: false };
      }
    }
    console.error('Error getting my dreams paginated:', error);
    throw error;
  }
};

export const getPublicDreamsPaginated = async (pageSize = PAGE_SIZE, lastDoc = null, tagFilter = null) => {
  const cached = getCachedList('publicDreams', pageSize, lastDoc, tagFilter);
  if (cached !== null) return cached;
  const dreamsRef = collection(db, dreamsCollection);
  const baseConstraints = [
    where('isPublic', '==', true),
    ...(tagFilter && tagFilter.length > 0 ? [where('tags', 'array-contains-any', tagFilter.slice(0, 10))] : []),
    orderBy('createdAt', 'desc'),
    ...(lastDoc ? [startAfter(lastDoc)] : []),
    limit(pageSize + 1)
  ];
  try {
    const q = query(dreamsRef, ...baseConstraints);
    const querySnapshot = await getDocs(q);
    const docs = querySnapshot.docs;
    const hasMore = docs.length > pageSize;
    const dreams = (hasMore ? docs.slice(0, pageSize) : docs).map(mapDreamDoc);
    const newLastDoc = dreams.length > 0 ? docs[dreams.length - 1] : null;
    const result = { dreams, lastDoc: newLastDoc, hasMore };
    setCachedList('publicDreams', pageSize, lastDoc, tagFilter, result);
    dreams.forEach(d => setCachedDream(d.id, d));
    return result;
  } catch (error) {
    if (error.code === 'failed-precondition' || error.code === 9) {
      try {
        const q = query(dreamsRef, where('isPublic', '==', true));
        const querySnapshot = await getDocs(q);
        const dreams = querySnapshot.docs.map(mapDreamDoc);
        dreams.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const filtered = tagFilter?.length > 0
          ? dreams.filter(d => d.tags && tagFilter.some(t => d.tags.includes(t)))
          : dreams;
        const result = { dreams: filtered, lastDoc: null, hasMore: false };
        setCachedList('publicDreams', pageSize, null, tagFilter, result);
        filtered.forEach(d => setCachedDream(d.id, d));
        return result;
      } catch (fallbackError) {
        console.error('Fallback public dreams paginated failed:', fallbackError);
        return { dreams: [], lastDoc: null, hasMore: false };
      }
    }
    console.error('❌ Error getting public dreams paginated:', error);
    return { dreams: [], lastDoc: null, hasMore: false };
  }
};

export const getDream = async (dreamId) => {
  try {
    const cached = getCachedDream(dreamId);
    if (cached !== null) return cached;

    const dreamRef = doc(db, dreamsCollection, dreamId);
    const dreamSnap = await getDoc(dreamRef);
    if (dreamSnap.exists()) {
      const data = dreamSnap.data();
      const dream = {
        id: dreamSnap.id,
        ...data,
        // Convert Firestore timestamps to ISO strings (same as getMyDreams)
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      };
      setCachedDream(dreamId, dream);
      return dream;
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
    invalidateDream(dreamId);
    invalidateLists();
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
    invalidateDream(dreamId);
    invalidateLists();
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

export const getNotificationSettings = async () => {
  try {
    const userId = checkAuth();
    const userRef = doc(db, usersCollection, userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const data = userSnap.data();
      return data.notificationSettings || {
        notifyOnComment: true,
        notifyOnLike: false,
        weeklyDigest: false
      };
    }
    return { notifyOnComment: true, notifyOnLike: false, weeklyDigest: false };
  } catch (error) {
    console.error('Error getting notification settings:', error);
    throw error;
  }
};

export const updateNotificationSettings = async (notificationSettings) => {
  try {
    const userId = checkAuth();
    const userRef = doc(db, usersCollection, userId);
    await updateDoc(userRef, {
      notificationSettings,
      updatedAt: serverTimestamp()
    });
    return notificationSettings;
  } catch (error) {
    console.error('Error updating notification settings:', error);
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

// Friends
export const areFriends = async (userIdA, userIdB) => {
  if (!userIdA || !userIdB || userIdA === userIdB) return false;
  try {
    const [id1, id2] = [userIdA, userIdB].sort();
    const friendRef = doc(db, friendsCollection, `${id1}_${id2}`);
    const snap = await getDoc(friendRef);
    return snap.exists();
  } catch (error) {
    console.error('Error checking friendship:', error);
    return false;
  }
};

export const sendFriendRequest = async (toUserId) => {
  const fromUserId = checkAuth();
  if (fromUserId === toUserId) throw new Error('Cannot send request to yourself');
  const requestsRef = collection(db, friendRequestsCollection);
  const existing = await getDocs(query(requestsRef, where('fromUserId', '==', fromUserId), where('toUserId', '==', toUserId)));
  if (!existing.empty) throw new Error('Friend request already sent');
  const alreadyFriends = await areFriends(fromUserId, toUserId);
  if (alreadyFriends) throw new Error('Already friends');
  await addDoc(requestsRef, {
    fromUserId,
    toUserId,
    status: 'pending',
    createdAt: serverTimestamp()
  });
};

export const acceptFriendRequest = async (requestId) => {
  const userId = checkAuth();
  const reqRef = doc(db, friendRequestsCollection, requestId);
  const reqSnap = await getDoc(reqRef);
  if (!reqSnap.exists()) throw new Error('Request not found');
  const data = reqSnap.data();
  if (data.toUserId !== userId) throw new Error('Not your request to accept');
  if (data.status !== 'pending') throw new Error('Request already handled');
  const [id1, id2] = [data.fromUserId, data.toUserId].sort();
  await updateDoc(reqRef, { status: 'accepted', updatedAt: serverTimestamp() });
  await setDoc(doc(db, friendsCollection, `${id1}_${id2}`), {
    userId1: id1,
    userId2: id2,
    createdAt: serverTimestamp()
  });
};

export const rejectFriendRequest = async (requestId) => {
  const userId = checkAuth();
  const reqRef = doc(db, friendRequestsCollection, requestId);
  const reqSnap = await getDoc(reqRef);
  if (!reqSnap.exists()) throw new Error('Request not found');
  const data = reqSnap.data();
  if (data.toUserId !== userId) throw new Error('Not your request to reject');
  await updateDoc(reqRef, { status: 'rejected', updatedAt: serverTimestamp() });
};

export const removeFriend = async (friendId) => {
  const userId = checkAuth();
  const [id1, id2] = [userId, friendId].sort();
  const friendRef = doc(db, friendsCollection, `${id1}_${id2}`);
  const snap = await getDoc(friendRef);
  if (!snap.exists()) throw new Error('Not friends');
  await deleteDoc(friendRef);
};

export const getFriends = async () => {
  const userId = checkAuth();
  const friendsRef = collection(db, friendsCollection);
  const q1 = query(friendsRef, where('userId1', '==', userId));
  const q2 = query(friendsRef, where('userId2', '==', userId));
  const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
  const ids = new Set();
  snap1.docs.forEach(d => ids.add(d.data().userId2));
  snap2.docs.forEach(d => ids.add(d.data().userId1));
  const users = await Promise.all([...ids].map(uid => getUser(uid)));
  return users.filter(Boolean);
};

export const getPendingFriendRequests = async () => {
  const userId = checkAuth();
  const ref = collection(db, friendRequestsCollection);
  const q = query(ref, where('toUserId', '==', userId), where('status', '==', 'pending'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getSentFriendRequests = async () => {
  const userId = checkAuth();
  const ref = collection(db, friendRequestsCollection);
  const q = query(ref, where('fromUserId', '==', userId), where('status', '==', 'pending'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
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
        return await areFriends(dreamOwnerId, userId);
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
        return await areFriends(dreamOwnerId, userId);
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
    const firestoreUser = await getUser(userId);
    
    return await retryOperation(async () => {
      const commentRef = await addDoc(collection(db, commentsCollection), {
        ...commentData,
        userId,
        user: privacySettings.anonymousMode ? {
          id: 'anonymous',
          displayName: 'Anonymous',
          email: null,
          photoURL: null,
          username: null,
          isAnonymous: true
        } : {
          id: auth.currentUser.uid,
          displayName: auth.currentUser.displayName || 'Anonymous',
          email: auth.currentUser.email,
          photoURL: auth.currentUser.photoURL,
          username: firestoreUser?.username || null,
          firstName: firestoreUser?.firstName || null,
          lastName: firestoreUser?.lastName || null,
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

// Delete all user data and account (call after re-authentication)
export const deleteAllUserData = async () => {
  const userId = checkAuth();
  const BATCH_SIZE = 500;

  const deleteQueryBatch = async (collRef, q) => {
    const snapshot = await getDocs(q);
    const docs = snapshot.docs;
    for (let i = 0; i < docs.length; i += BATCH_SIZE) {
      const batch = writeBatch(db);
      docs.slice(i, i + BATCH_SIZE).forEach(d => batch.delete(d.ref));
      await batch.commit();
    }
  };

  const myDreams = await getMyDreams();
  for (const dream of myDreams) {
    const commentsRef = collection(db, commentsCollection);
    const commentsQ = query(commentsRef, where('dreamId', '==', dream.id));
    const commentsSnap = await getDocs(commentsQ);
    if (!commentsSnap.empty) {
      const batch = writeBatch(db);
      commentsSnap.docs.forEach(d => batch.delete(d.ref));
      await batch.commit();
    }
    const likesRef = collection(db, likesCollection);
    const likesQ = query(likesRef, where('dreamId', '==', dream.id));
    const likesSnap = await getDocs(likesQ);
    if (!likesSnap.empty) {
      const batch = writeBatch(db);
      likesSnap.docs.forEach(d => batch.delete(d.ref));
      await batch.commit();
    }
  }

  const dreamsRef = collection(db, dreamsCollection);
  const favoritesRef = collection(db, favoritesCollection);
  const notesRef = collection(db, notesCollection);
  const commentsRef = collection(db, commentsCollection);
  const likesRef = collection(db, likesCollection);
  const friendRequestsRef = collection(db, friendRequestsCollection);
  const friendsRef = collection(db, friendsCollection);
  const folderRef = ref(storage, `dreams/${userId}`);
  try {
    const result = await listAll(folderRef);
    await Promise.all(result.items.map((itemRef) => deleteObject(itemRef)));
  } catch (storageErr) {
    if (storageErr.code !== 'storage/object-not-found') console.warn('Storage cleanup:', storageErr);
  }

  await deleteQueryBatch(dreamsRef, query(dreamsRef, where('userId', '==', userId)));
  await deleteQueryBatch(friendRequestsRef, query(friendRequestsRef, where('fromUserId', '==', userId)));
  await deleteQueryBatch(friendRequestsRef, query(friendRequestsRef, where('toUserId', '==', userId)));
  const [f1, f2] = await Promise.all([
    getDocs(query(friendsRef, where('userId1', '==', userId))),
    getDocs(query(friendsRef, where('userId2', '==', userId)))
  ]);
  for (const d of [...f1.docs, ...f2.docs]) await deleteDoc(d.ref);
  await deleteQueryBatch(favoritesRef, query(favoritesRef, where('userId', '==', userId)));
  await deleteQueryBatch(notesRef, query(notesRef, where('userId', '==', userId)));
  await deleteQueryBatch(commentsRef, query(commentsRef, where('userId', '==', userId)));
  await deleteQueryBatch(likesRef, query(likesRef, where('userId', '==', userId)));
  await deleteDoc(doc(db, usersCollection, userId));
};

// Export user data (dreams, favorites, notes, comments, likes) as JSON
export const exportUserData = async () => {
  try {
    const userId = checkAuth();
    const userDoc = await getDoc(doc(db, usersCollection, userId));
    const userData = userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null;

    const dreams = await getMyDreams();
    const favorites = await getFavorites();
    const notes = await getNotes();

    const commentsRef = collection(db, commentsCollection);
    const commentsQuery = query(commentsRef, where('userId', '==', userId));
    const commentsSnapshot = await getDocs(commentsQuery);
    const comments = commentsSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

    const likesRef = collection(db, likesCollection);
    const likesQuery = query(likesRef, where('userId', '==', userId));
    const likesSnapshot = await getDocs(likesQuery);
    const likes = likesSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

    const exportPayload = {
      exportedAt: new Date().toISOString(),
      user: userData ? {
        id: userData.id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: auth.currentUser?.email || null
      } : null,
      dreams,
      favorites,
      notes,
      comments,
      likes
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dreamspeak-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('❌ Error exporting user data:', error);
    throw error;
  }
}; 