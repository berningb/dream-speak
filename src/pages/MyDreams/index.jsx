import { IoAdd } from 'react-icons/io5'
import { useNavigate } from 'react-router-dom'
import AddDreamWorkflow from '../../components/AddDreamWorkflow'
import DreamCard from '../../components/DreamCard'
import { useState, useEffect } from 'react'
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext'
import { getMyDreamsPaginated, createLike, deleteLike, createFavorite, deleteFavorite, getLikes, getFavorites, deleteDream } from '../../services/firebaseService'
import Comments from '../../components/Comments'

const DreamItem = ({ dream, isFavorited, onFavoriteToggle, likedByMe, likeCount, onLikeToggle, onCommentClick, onEditClick, onDeleteClick, currentUserId }) => {
  const navigate = useNavigate()
  return (
    <DreamCard 
      dream={dream} 
      showAuthor={false}
      showFavoriteButton={true}
      isFavorited={isFavorited}
      onFavoriteToggle={onFavoriteToggle}
      onClick={() => navigate(`/dream/${dream.id}`)}
      likedByMe={likedByMe}
      likeCount={likeCount}
      onLikeToggle={onLikeToggle}
      showCommentButton={false}
      onCommentClick={onCommentClick}
      showEditButton={true}
      onEditClick={onEditClick}
      showDeleteButton={true}
      onDeleteClick={onDeleteClick}
      currentUserId={currentUserId}
    />
  )
}

export default function MyDreams () {
  const navigate = useNavigate()
  const { isAuthenticated, loginWithGoogle, user } = useFirebaseAuth()
  const [dreams, setDreams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [selectedDreamId, setSelectedDreamId] = useState(null)
  const [dreamStats, setDreamStats] = useState({}) // { dreamId: { likeCount, isLiked, isFavorited } }
  const [loadingStats, setLoadingStats] = useState(false)
  const [lastDoc, setLastDoc] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  const fetchDreams = async (append = false) => {
    try {
      if (append) {
        setLoadingMore(true)
      } else {
        setLoading(true)
      }
      const { dreams: newDreams, lastDoc: nextLastDoc, hasMore: more } = await getMyDreamsPaginated(24, append ? lastDoc : null)
      setDreams(prev => append ? [...prev, ...newDreams] : newDreams)
      setLastDoc(nextLastDoc)
      setHasMore(more)
      setError(null)
    } catch (err) {
      setError('Failed to fetch dreams')
      console.error('Error fetching dreams:', err)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const loadMore = () => fetchDreams(true)

  const loadDreamStats = async (dreamsList) => {
    if (!user) {
      console.log('❌ No user, skipping loadDreamStats')
      return
    }
    
    console.log('🔄 Loading dream stats for', dreamsList.length, 'dreams, user:', user.uid)
    setLoadingStats(true)
    
    try {
      const stats = {}
      const userFavorites = await getFavorites()
      console.log('📋 User favorites count:', userFavorites.length)
      
      // Load likes for all dreams in parallel for faster loading
      const likePromises = dreamsList.map(dream => 
        getLikes(dream.id).then(likes => ({ dreamId: dream.id, likes }))
      )
      
      const allLikes = await Promise.all(likePromises)
      
      for (const { dreamId, likes } of allLikes) {
        const userLike = likes.find(like => like.userId === user.uid)
        const userFavorite = userFavorites.find(fav => fav.dreamId === dreamId)
        
        stats[dreamId] = {
          likeCount: likes.length,
          isLiked: !!userLike,
          isFavorited: !!userFavorite
        }
        
        console.log(`📊 Dream ${dreamId}: ${likes.length} likes, user liked: ${!!userLike}, favorited: ${!!userFavorite}`)
      }
      
      console.log('✅ Final dream stats:', stats)
      setDreamStats(stats)
    } catch (error) {
      console.error('❌ Error loading dream stats:', error)
    } finally {
      setLoadingStats(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchDreams()
    }
  }, [isAuthenticated])

  // Load dream stats when authentication changes or dreams are loaded
  useEffect(() => {
    if (isAuthenticated && user && dreams.length > 0) {
      console.log('🔄 Auth changed - loading dream stats for authenticated user:', user.uid)
      loadDreamStats(dreams)
    }
  }, [isAuthenticated, user, dreams.length])

  const handleLikeToggle = async (dreamId, likedByMe) => {
    if (!isAuthenticated) {
      await loginWithGoogle()
      return
    }

    console.log('🔄 Like toggle clicked:', { dreamId, likedByMe, user: user?.uid })

    // Update UI immediately for better UX
    setDreamStats(prev => ({
      ...prev,
      [dreamId]: {
        ...prev[dreamId],
        isLiked: !likedByMe,
        likeCount: likedByMe ? (prev[dreamId]?.likeCount || 1) - 1 : (prev[dreamId]?.likeCount || 0) + 1
      }
    }))

    try {
      if (likedByMe) {
        // Find the user's like record to get the correct ID
        const likes = await getLikes(dreamId);
        const userLike = likes.find(like => like.userId === user?.uid);
        if (userLike) {
          await deleteLike(userLike.id);
          console.log('✅ Dream unliked:', dreamId);
        } else {
          console.log('⚠️ No user like found to delete')
          // Revert UI change if delete failed
          setDreamStats(prev => ({
            ...prev,
            [dreamId]: {
              ...prev[dreamId],
              isLiked: likedByMe,
              likeCount: (prev[dreamId]?.likeCount || 0) + 1
            }
          }))
        }
      } else {
        await createLike({ dreamId });
        console.log('❤️ Dream liked:', dreamId);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert UI change on error
      setDreamStats(prev => ({
        ...prev,
        [dreamId]: {
          ...prev[dreamId],
          isLiked: likedByMe,
          likeCount: likedByMe ? (prev[dreamId]?.likeCount || 0) + 1 : (prev[dreamId]?.likeCount || 1) - 1
        }
      }))
    }
  }

  const handleFavoriteToggle = async (dreamId) => {
    if (!isAuthenticated) {
      await loginWithGoogle()
      return
    }

    const currentlyFavorited = dreamStats[dreamId]?.isFavorited || false

    // Update UI immediately
    setDreamStats(prev => ({
      ...prev,
      [dreamId]: {
        ...prev[dreamId],
        isFavorited: !currentlyFavorited
      }
    }))

    try {
      if (currentlyFavorited) {
        // Unfavorite: find and delete the user's favorite record
        const userFavorites = await getFavorites()
        const userFavorite = userFavorites.find(fav => fav.dreamId === dreamId)
        if (userFavorite) {
          await deleteFavorite(userFavorite.id)
          console.log('✅ Dream unfavorited:', dreamId);
        }
      } else {
        // Only create favorite if user doesn't already have one for this dream
        const userFavorites = await getFavorites()
        const existingFavorite = userFavorites.find(fav => fav.dreamId === dreamId)
        
        if (!existingFavorite) {
          await createFavorite({ dreamId });
          console.log('⭐ Dream favorited:', dreamId);
        } else {
          console.log('⚠️ Dream already favorited, skipping');
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Revert UI change on error
      setDreamStats(prev => ({
        ...prev,
        [dreamId]: {
          ...prev[dreamId],
          isFavorited: currentlyFavorited
        }
      }))
    }
  }

  const handleCommentClick = (dreamId) => {
    if (!isAuthenticated) {
      loginWithGoogle()
      return
    }
    setSelectedDreamId(dreamId)
    setCommentsOpen(true)
  }

  const handleEditDream = (dream) => {
    navigate(`/dream/${dream.id}?edit=1`)
  }

  const handleDeleteDream = async (dreamId) => {
    if (!window.confirm('Are you sure you want to delete this dream? This action cannot be undone.')) {
      return
    }

    try {
      await deleteDream(dreamId)
      console.log('✅ Dream deleted:', dreamId)
      // Refresh dreams list
      await fetchDreams()
    } catch (error) {
      console.error('Error deleting dream:', error)
      alert('Failed to delete dream. Please try again.')
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <span className="loading loading-spinner loading-lg"></span>
    </div>
  )

  const openAddModal = () => document.getElementById('add_dream_modal')?.showModal()

  return (
    <>
      <AddDreamWorkflow onAddDream={fetchDreams} initialDreamType='sweet' />
      <div className='flex flex-col items-center justify-start min-h-screen p-6'>
        <div className='w-full max-w-7xl'>
          <div className='flex flex-col items-center mb-8'>
            <h1 className='text-4xl font-bold text-center mb-6'>My Dreams</h1>
            <button
              className='btn btn-primary btn-lg flex items-center gap-2'
              onClick={openAddModal}
            >
              <IoAdd size={20} />
              New Dream
            </button>
          </div>

          {!isAuthenticated ? (
            <div className='text-center'>
              <p className='text-lg mb-4'>Please sign in to view your dreams</p>
              <button className='btn btn-primary' onClick={loginWithGoogle}>
                Sign In
              </button>
            </div>
          ) : dreams.length === 0 ? (
            <div className='text-center'>
              <p className='text-lg mb-4'>No dreams found. Start by logging your first dream!</p>
            </div>
          ) : (
            <>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {dreams.map((dream) => {
                  const stats = dreamStats[dream.id] || { likeCount: 0, isLiked: false, isFavorited: false }
                  const hasStats = dreamStats[dream.id] !== undefined
                  
                  return (
                    <DreamItem 
                      key={dream.id} 
                      dream={dream}
                      isFavorited={hasStats ? stats.isFavorited : false}
                      onFavoriteToggle={handleFavoriteToggle}
                      likedByMe={hasStats ? stats.isLiked : false}
                      likeCount={hasStats ? stats.likeCount : (loadingStats ? '...' : 0)}
                      onLikeToggle={handleLikeToggle}
                      onCommentClick={handleCommentClick}
                      onEditClick={handleEditDream}
                      onDeleteClick={handleDeleteDream}
                      currentUserId={user?.uid}
                    />
                  )
                })}
              </div>
              {hasMore && (
                <div className='flex justify-center mt-8'>
                  <button
                    className='btn btn-outline btn-wide'
                    onClick={loadMore}
                    disabled={loadingMore}
                  >
                    {loadingMore ? (
                      <>
                        <span className='loading loading-spinner loading-sm' />
                        Loading...
                      </>
                    ) : (
                      'Load More Dreams'
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Comments Modal */}
      {commentsOpen && (
        <div className='modal modal-open'>
          <div className='modal-box'>
            <div className='modal-action'>
              <button 
                className='btn'
                onClick={() => setCommentsOpen(false)}
              >
                Close
              </button>
            </div>
            <Comments dreamId={selectedDreamId} />
          </div>
        </div>
      )}
    </>
  )
} 