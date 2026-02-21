import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext'
import { getFavorites, deleteFavorite, getLikes, createLike, deleteLike, canUserLike, canUserFavorite } from '../../services/firebaseService'
import DreamCard from '../../components/DreamCard'

export default function Favorites() {
  const { isAuthenticated, loginWithGoogle, user } = useFirebaseAuth()
  const navigate = useNavigate()
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dreamStats, setDreamStats] = useState({})

  const fetchFavorites = async () => {
    if (!isAuthenticated || !user) {
      setFavorites([])
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const data = await getFavorites()
      setFavorites(data)
      setError(null)
    } catch (err) {
      console.error('Error fetching favorites:', err)
      setError('Failed to load favorites')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFavorites()
  }, [isAuthenticated, user])

  useEffect(() => {
    async function loadStats() {
      if (!user || favorites.length === 0) return
      const dreamsList = favorites.map(f => f.dream).filter(Boolean)
      if (dreamsList.length === 0) return
      try {
        const stats = {}
        const likePromises = dreamsList.map(dream =>
          getLikes(dream.id).then(likes => ({ dreamId: dream.id, likes }))
        )
        const allLikes = await Promise.all(likePromises)
        for (const { dreamId, likes } of allLikes) {
          const userLike = likes.find(l => l.userId === user.uid)
          stats[dreamId] = {
            likeCount: likes.length,
            isLiked: !!userLike,
            isFavorited: true
          }
        }
        setDreamStats(stats)
      } catch (e) {
        console.warn('Error loading dream stats:', e)
      }
    }
    loadStats()
  }, [user, favorites])

  const handleLikeToggle = async (dreamId, likedByMe) => {
    if (!isAuthenticated) {
      await loginWithGoogle()
      return
    }
    const favorite = favorites.find(f => f.dream?.id === dreamId)
    const dream = favorite?.dream
    if (dream?.userId) {
      const canLike = await canUserLike(dream.userId)
      if (!canLike) {
        alert('The dream owner has restricted who can like their dreams.')
        return
      }
    }
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
        const likes = await getLikes(dreamId)
        const userLike = likes.find(l => l.userId === user?.uid)
        if (userLike) await deleteLike(userLike.id)
      } else {
        await createLike({ dreamId })
      }
    } catch (e) {
      console.error('Error toggling like:', e)
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
    const favorite = favorites.find(f => f.dream?.id === dreamId)
    if (!favorite) return
    const dream = favorite.dream
    if (dream?.userId) {
      const canFav = await canUserFavorite(dream.userId)
      if (!canFav) {
        alert('The dream owner has restricted who can favorite their dreams.')
        return
      }
    }
    try {
      await deleteFavorite(favorite.id)
      setFavorites(prev => prev.filter(f => f.id !== favorite.id))
      setDreamStats(prev => {
        const next = { ...prev }
        delete next[dreamId]
        return next
      })
    } catch (e) {
      console.error('Error removing favorite:', e)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[60vh] p-6'>
        <h1 className='text-3xl font-bold mb-4'>Your Favorites</h1>
        <p className='text-base-content/70 mb-6'>Sign in to view and manage your favorite dreams.</p>
        <button className='btn btn-primary' onClick={loginWithGoogle}>Sign In with Google</button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-[40vh]'>
        <span className='loading loading-spinner loading-lg'></span>
      </div>
    )
  }

  if (error) {
    return (
      <div className='container mx-auto p-6'>
        <div className='alert alert-error'>{error}</div>
      </div>
    )
  }

  const validFavorites = favorites.filter(f => f.dream)

  return (
    <div className='container mx-auto p-6'>
      <h1 className='text-3xl font-bold mb-6'>Your Favorites</h1>
      <p className='text-base-content/70 mb-8'>
        {validFavorites.length === 0
          ? 'No favorites yet. Explore dreams and add some to your collection.'
          : `${validFavorites.length} favorite${validFavorites.length === 1 ? '' : 's'}`}
      </p>

      {validFavorites.length === 0 ? (
        <button className='btn btn-primary' onClick={() => navigate('/explore')}>
          Explore Dreams
        </button>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
          {validFavorites.map((fav) => {
            const dream = fav.dream
            const stats = dreamStats[dream.id] || { likeCount: 0, isLiked: false, isFavorited: true }
            return (
              <div key={fav.id} className='relative'>
                <DreamCard
                  dream={dream}
                  showAuthor={true}
                  showFavoriteButton={true}
                  isFavorited={true}
                  onFavoriteToggle={() => handleFavoriteToggle(dream.id)}
                  onClick={() => navigate(`/dream/${dream.id}`)}
                  likedByMe={stats.isLiked}
                  likeCount={stats.likeCount}
                  onLikeToggle={(id, liked) => handleLikeToggle(id, liked)}
                  showCommentButton={false}
                />
                {fav.note?.content && (
                  <div className='mt-2 p-3 bg-base-200 rounded-lg text-sm'>
                    <span className='font-medium'>Your note: </span>
                    {fav.note.content}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
