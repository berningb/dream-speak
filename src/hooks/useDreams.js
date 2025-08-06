import { useState, useEffect } from 'react';
import { useFirebaseAuth } from '../contexts/FirebaseAuthContext';
import { getDreams, getMyDreams, createDream, updateDream, deleteDream } from '../services/firebaseService';

export default function useDreams() {
  const { user, isAuthenticated } = useFirebaseAuth();
  const [dreams, setDreams] = useState([]);
  const [myDreams, setMyDreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all public dreams
  const fetchAllDreams = async () => {
    try {
      setLoading(true);
      const allDreams = await getDreams();
      // Filter for public dreams only
      const publicDreams = allDreams.filter(dream => dream.isPublic);
      setDreams(publicDreams);
      setError(null);
    } catch (err) {
      console.error('Error fetching dreams:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's own dreams
  const fetchMyDreams = async () => {
    if (!isAuthenticated || !user) {
      setMyDreams([]);
      return;
    }

    try {
      setLoading(true);
      const userDreams = await getMyDreams();
      setMyDreams(userDreams);
      setError(null);
    } catch (err) {
      console.error('Error fetching my dreams:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Create a new dream
  const addDream = async (dreamData) => {
    try {
      const newDream = await createDream(dreamData);
      
      // Update local state
      if (dreamData.isPublic) {
        setDreams(prev => [newDream, ...prev]);
      }
      setMyDreams(prev => [newDream, ...prev]);
      
      return newDream;
    } catch (err) {
      console.error('Error creating dream:', err);
      throw err;
    }
  };

  // Update an existing dream
  const editDream = async (dreamId, dreamData) => {
    try {
      const updatedDream = await updateDream(dreamId, dreamData);
      
      // Update local state
      setDreams(prev => prev.map(dream => 
        dream.id === dreamId ? updatedDream : dream
      ));
      setMyDreams(prev => prev.map(dream => 
        dream.id === dreamId ? updatedDream : dream
      ));
      
      return updatedDream;
    } catch (err) {
      console.error('Error updating dream:', err);
      throw err;
    }
  };

  // Delete a dream
  const removeDream = async (dreamId) => {
    try {
      await deleteDream(dreamId);
      
      // Update local state
      setDreams(prev => prev.filter(dream => dream.id !== dreamId));
      setMyDreams(prev => prev.filter(dream => dream.id !== dreamId));
    } catch (err) {
      console.error('Error deleting dream:', err);
      throw err;
    }
  };

  // Fetch dreams on component mount
  useEffect(() => {
    fetchAllDreams();
  }, []);

  // Fetch user's dreams when authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchMyDreams();
    } else {
      setMyDreams([]);
    }
  }, [isAuthenticated, user]);

  return {
    dreams,
    myDreams,
    loading,
    error,
    addDream,
    editDream,
    removeDream,
    refetchDreams: fetchAllDreams,
    refetchMyDreams: fetchMyDreams
  };
}
