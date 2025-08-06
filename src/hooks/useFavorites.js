import { useState, useEffect } from 'react';
import { useFirebaseAuth } from '../contexts/FirebaseAuthContext';
import { 
  getFavorites, 
  createFavorite, 
  deleteFavorite,
  createNote,
  updateNote,
  deleteNote
} from '../services/firebaseService';

export default function useFavorites() {
  const { user, isAuthenticated } = useFirebaseAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFavorites = async () => {
    if (!isAuthenticated || !user) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const userFavorites = await getFavorites();
      setFavorites(userFavorites);
      setError(null);
    } catch (err) {
      console.error('Error fetching favorites:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (dreamId) => {
    try {
      const existingFavorite = favorites.find(fav => fav.dreamId === dreamId);
      
      if (existingFavorite) {
        // Remove favorite
        await deleteFavorite(existingFavorite.id);
        setFavorites(prev => prev.filter(fav => fav.id !== existingFavorite.id));
        return false;
      } else {
        // Add favorite
        const newFavorite = await createFavorite({ dreamId });
        setFavorites(prev => [...prev, newFavorite]);
        return true;
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      throw err;
    }
  };

  const saveNote = async (favoriteId, content) => {
    try {
      const note = await createNote({ favoriteId, content });
      
      // Update the favorite with the new note
      setFavorites(prev => prev.map(fav => 
        fav.id === favoriteId 
          ? { ...fav, note } 
          : fav
      ));
      
      return note;
    } catch (err) {
      console.error('Error saving note:', err);
      throw err;
    }
  };

  const updateExistingNote = async (noteId, content) => {
    try {
      const updatedNote = await updateNote(noteId, { content });
      
      // Update the favorite with the updated note
      setFavorites(prev => prev.map(fav => 
        fav.note?.id === noteId 
          ? { ...fav, note: updatedNote } 
          : fav
      ));
      
      return updatedNote;
    } catch (err) {
      console.error('Error updating note:', err);
      throw err;
    }
  };

  const removeNote = async (noteId) => {
    try {
      await deleteNote(noteId);
      
      // Remove the note from the favorite
      setFavorites(prev => prev.map(fav => 
        fav.note?.id === noteId 
          ? { ...fav, note: null } 
          : fav
      ));
    } catch (err) {
      console.error('Error removing note:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [isAuthenticated, user]);

  return {
    favorites,
    loading,
    error,
    toggleFavorite,
    saveNote,
    updateNote: updateExistingNote,
    removeNote,
    refetchFavorites: fetchFavorites
  };
} 