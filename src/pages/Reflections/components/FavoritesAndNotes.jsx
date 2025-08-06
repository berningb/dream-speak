import { useState } from 'react';
import { useFirebaseAuth } from '../../../contexts/FirebaseAuthContext';
import useFavorites from '../../../hooks/useFavorites';
import Layout from '../../../components/Layout';

export default function FavoritesAndNotes() {
  const { isAuthenticated } = useFirebaseAuth();
  const { favorites, loading, saveNote, updateNote, removeNote } = useFavorites();
  const [selectedFavorite, setSelectedFavorite] = useState(null);
  const [noteContent, setNoteContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-2xl font-bold mb-4">Please sign in to view favorites</h1>
        </div>
      </Layout>
    );
  }

  const handleSaveNote = async () => {
    if (!selectedFavorite || !noteContent.trim()) return;

    try {
      if (selectedFavorite.note) {
        await updateNote(selectedFavorite.note.id, noteContent);
      } else {
        await saveNote(selectedFavorite.id, noteContent);
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const handleDeleteNote = async () => {
    if (!selectedFavorite?.note) return;

    try {
      await removeNote(selectedFavorite.note.id);
      
      // Update the selected favorite to remove the note
      setSelectedFavorite(prev => prev ? { ...prev, note: null } : null);
      setNoteContent('');
      setIsEditing(false);
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Favorites & Notes</h1>
        
        {favorites.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-4">No favorites yet!</h2>
            <p className="text-gray-600 mb-6">Favorite some dreams to add personal notes.</p>
            <a href="/explore" className="btn btn-primary">Explore Dreams</a>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Favorites List */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Your Favorites</h2>
              <div className="space-y-4">
                {favorites.map((favorite) => (
                  <div 
                    key={favorite.id}
                    className={`card bg-base-100 shadow-md cursor-pointer border-2 ${
                      selectedFavorite?.id === favorite.id ? 'border-primary' : 'border-transparent'
                    }`}
                    onClick={() => {
                      setSelectedFavorite(favorite);
                      setNoteContent(favorite.note?.content || '');
                      setIsEditing(false);
                    }}
                  >
                    <div className="card-body p-4">
                      <h3 className="card-title text-lg">{favorite.dream?.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {favorite.dream?.content}
                      </p>
                      {favorite.note && (
                        <div className="badge badge-secondary">Has Note</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Note Editor */}
            <div>
              {selectedFavorite ? (
                <div className="card bg-base-100 shadow-md">
                  <div className="card-body">
                                         <h2 className="card-title">
                       Notes for &ldquo;{selectedFavorite.dream?.title}&rdquo;
                     </h2>
                    
                    {isEditing ? (
                      <div className="space-y-4">
                        <textarea
                          className="textarea textarea-bordered w-full h-64"
                          placeholder="Write your notes here..."
                          value={noteContent}
                          onChange={(e) => setNoteContent(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <button 
                            className="btn btn-primary"
                            onClick={handleSaveNote}
                          >
                            Save Note
                          </button>
                          <button 
                            className="btn btn-outline"
                            onClick={() => {
                              setIsEditing(false);
                              setNoteContent(selectedFavorite.note?.content || '');
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {noteContent ? (
                          <div className="whitespace-pre-wrap bg-base-200 p-4 rounded-lg">
                            {noteContent}
                          </div>
                        ) : (
                          <div className="text-gray-500 italic">No notes yet</div>
                        )}
                        <div className="flex gap-2">
                          <button 
                            className="btn btn-primary"
                            onClick={() => setIsEditing(true)}
                          >
                            {noteContent ? 'Edit Note' : 'Add Note'}
                          </button>
                          {noteContent && (
                            <button 
                              className="btn btn-error"
                              onClick={handleDeleteNote}
                            >
                              Delete Note
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="card bg-base-100 shadow-md">
                  <div className="card-body text-center">
                    <h2 className="card-title justify-center">Select a Favorite</h2>
                    <p>Choose a favorite dream to view or edit its notes.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
} 