import { useState, useEffect } from 'react'
import { getPublicDreams, createLike, deleteLike, createFavorite, deleteFavorite, getLikes, getFavorites, canUserLike, canUserFavorite } from '../../services/firebaseService'
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext'
import Layout from '../../components/Layout'
import DreamCard from '../../components/DreamCard'
import AddDreamModal from '../../components/AddDreamModal'

export default function Explore() {
  const { isAuthenticated, loginWithGoogle, user } = useFirebaseAuth()
  const [dreams, setDreams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dreamStats, setDreamStats] = useState({}) // { dreamId: { likeCount, isLiked, isFavorited } }
  const [loadingStats, setLoadingStats] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState([])
  const [availableTags, setAvailableTags] = useState([])
  const [showAllTags, setShowAllTags] = useState(false)

  const fetchDreams = async () => {
    try {
      setLoading(true)
      console.log('🔄 Fetching public dreams...')
      const publicDreams = await getPublicDreams()
      console.log('📋 Got', publicDreams.length, 'public dreams')
      setDreams(publicDreams)
      
      // Extract all unique tags from dreams
      const allTags = new Set()
      publicDreams.forEach(dream => {
        if (dream.tags && Array.isArray(dream.tags)) {
          dream.tags.forEach(tag => allTags.add(tag))
        }
      })
      setAvailableTags(Array.from(allTags).sort())
      
      setError(null)
      
      // Note: Dream stats will be loaded by the useEffect that watches authentication
    } catch (err) {
      setError('Failed to fetch dreams')
      console.error('❌ Error fetching dreams:', err)
    } finally {
      setLoading(false)
    }
  }

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
      console.log('📋 User favorites dreamIds:', userFavorites.map(fav => fav.dreamId))
      
      // Load likes for all dreams in parallel for faster loading
      const likePromises = dreamsList.map(dream => 
        getLikes(dream.id).then(likes => ({ dreamId: dream.id, likes }))
      )
      
      const allLikes = await Promise.all(likePromises)
      
      for (const { dreamId, likes } of allLikes) {
        const userLike = likes.find(like => like.userId === user.uid)
        const userFavorite = userFavorites.find(fav => fav.dreamId === dreamId)
        
        console.log(`🔍 Debug dream ${dreamId}:`, {
          userFavorites: userFavorites.length,
          userFavorite: userFavorite,
          dreamId: dreamId,
          matchingFav: userFavorites.filter(fav => fav.dreamId === dreamId)
        })
        
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
    fetchDreams()
  }, [])

  // Load dream stats when authentication changes
  useEffect(() => {
    if (isAuthenticated && user && dreams.length > 0) {
      console.log('🔄 Auth changed - loading dream stats for authenticated user:', user.uid)
      loadDreamStats(dreams)
    }
  }, [isAuthenticated, user, dreams.length])

  const handleAddDream = async () => {
    await fetchDreams() // Refresh dreams after adding
  }

  const handleLikeToggle = async (dreamId, likedByMe) => {
    if (!isAuthenticated) {
      await loginWithGoogle()
      return
    }

    console.log('🔄 Like toggle clicked:', { dreamId, likedByMe, user: user?.uid })

    // Check if user has permission to like this dream
    const dream = dreams.find(d => d.id === dreamId)
    if (dream && dream.userId) {
      const canLike = await canUserLike(dream.userId)
      if (!canLike) {
        alert('The dream owner has restricted who can like their dreams.')
        return
      }
    }

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
        // Unlike: find the user's like record and delete it
        console.log('🔄 Fetching likes to find user like...')
        const likes = await getLikes(dreamId);
        console.log('📊 Found likes:', likes)
        const userLike = likes.find(like => like.userId === user?.uid);
        console.log('👤 User like found:', userLike)
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
        // Like: create a new like record
        console.log('🔄 Creating new like...')
        const result = await createLike({ dreamId });
        console.log('❤️ Dream liked:', dreamId, 'Result:', result);
      }
    } catch (error) {
      console.error('❌ Error toggling like:', error);
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

    // Check if user has permission to favorite this dream
    const dream = dreams.find(d => d.id === dreamId)
    if (dream && dream.userId) {
      const canFav = await canUserFavorite(dream.userId)
      if (!canFav) {
        alert('The dream owner has restricted who can favorite their dreams.')
        return
      }
    }

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
    // Navigate to dream page for comments
    window.location.href = `/dream/${dreamId}`
  }

  // Filter dreams based on search query and selected tags
  const filteredDreams = dreams.filter(dream => {
    const matchesSearch = searchQuery === '' || 
      dream.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dream.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dream.description?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesTags = selectedTags.length === 0 || 
      (dream.tags && dream.tags.some(tag => selectedTags.includes(tag)))
    
    return matchesSearch && matchesTags
  })

  const handleTagToggle = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedTags([])
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <AddDreamModal onAddDream={handleAddDream} />
      <div className='flex flex-col items-center justify-start min-h-screen p-6'>
        <div className='w-full max-w-7xl'>
          <div className='flex flex-col items-center mb-8'>
            <h1 className='text-4xl font-bold text-center mb-6'>Explore Dreams</h1>
            <button
              className='btn btn-primary btn-lg flex items-center gap-2'
              onClick={() => (window.location.href = '/new-dream')}
            >
              Share Your Dream
            </button>
          </div>

          {/* Search and Filter Section */}
          <div className='mb-8'>
            {/* Search Bar */}
            <div className='flex gap-4 mb-6'>
              <div className='flex-1 relative'>
                <input
                  type='text'
                  placeholder='Search dreams by title, content, or description...'
                  className='input input-bordered w-full pl-10'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <svg className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/50' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                </svg>
              </div>
              {(searchQuery || selectedTags.length > 0) && (
                <button
                  onClick={clearFilters}
                  className='btn btn-ghost btn-outline'
                >
                  Clear Filters
                </button>
              )}
            </div>

            {/* Tag Filters */}
            {availableTags.length > 0 && (
              <div className='mb-6'>
                <h3 className='text-lg font-semibold mb-3'>Filter by Tags</h3>
                <div className='flex flex-wrap gap-2'>
                  {/* Show first 5 tags + selected tags */}
                  {availableTags.slice(0, 5).map(tag => (
                    <button
                      key={tag}
                      onClick={() => handleTagToggle(tag)}
                      className={`badge badge-lg cursor-pointer transition-all ${
                        selectedTags.includes(tag)
                          ? 'badge-primary'
                          : 'badge-outline hover:badge-primary'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                  
                  {/* Show selected tags that aren't in the first 5 */}
                  {selectedTags
                    .filter(tag => !availableTags.slice(0, 5).includes(tag))
                    .map(tag => (
                      <button
                        key={tag}
                        onClick={() => handleTagToggle(tag)}
                        className='badge badge-lg badge-primary cursor-pointer transition-all'
                      >
                        {tag}
                      </button>
                    ))
                  }
                  
                  {/* Show more tags if there are more than 5 */}
                  {availableTags.length > 5 && (
                    <div className='flex items-center gap-2'>
                      <button
                        onClick={() => setShowAllTags(!showAllTags)}
                        className='btn btn-ghost btn-sm text-base-content/70 hover:text-base-content'
                      >
                        {showAllTags ? 'Show Less' : `Show ${availableTags.length - 5} More`}
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Collapsible section for all tags */}
                {showAllTags && availableTags.length > 5 && (
                  <div className='mt-4 p-4 bg-base-200 rounded-lg'>
                    <h4 className='text-sm font-semibold mb-3 text-base-content/70'>All Tags</h4>
                    <div className='flex flex-wrap gap-2'>
                      {availableTags.map(tag => (
                        <button
                          key={tag}
                          onClick={() => handleTagToggle(tag)}
                          className={`badge badge-lg cursor-pointer transition-all ${
                            selectedTags.includes(tag)
                              ? 'badge-primary'
                              : 'badge-outline hover:badge-primary'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Results Count */}
            <div className='text-sm text-base-content/70 mb-4'>
              Showing {filteredDreams.length} of {dreams.length} dreams
              {(searchQuery || selectedTags.length > 0) && (
                <span className='ml-2'>
                  (filtered)
                </span>
              )}
            </div>
          </div>

          {(!dreams || dreams.length === 0) ? (
            <div className='text-center'>
              <p className='text-lg mb-4'>No public dreams yet. Be the first to share!</p>
            </div>
          ) : filteredDreams.length === 0 ? (
            <div className='text-center'>
              <p className='text-lg mb-4'>No dreams match your search criteria.</p>
              <button onClick={clearFilters} className='btn btn-primary'>
                Clear Filters
              </button>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {filteredDreams.map((dream) => {
                const stats = dreamStats[dream.id] || { likeCount: 0, isLiked: false, isFavorited: false }
                const hasStats = dreamStats[dream.id] !== undefined
                
                console.log(`🌟 Dream ${dream.id} favorite state:`, { 
                  hasStats, 
                  statsFavorited: stats.isFavorited, 
                  sending: hasStats ? stats.isFavorited : false 
                })
                
                return (
                  <DreamCard
                    key={dream.id}
                    dream={dream}
                    showAuthor={true}
                    showFavoriteButton={true}
                    isFavorited={hasStats ? stats.isFavorited : false}
                    onFavoriteToggle={handleFavoriteToggle}
                    onClick={() => window.location.href = `/dream/${dream.id}`}
                    likedByMe={hasStats ? stats.isLiked : false}
                    likeCount={hasStats ? stats.likeCount : (loadingStats ? '...' : 0)}
                    onLikeToggle={handleLikeToggle}
                    showCommentButton={false}
                    onCommentClick={handleCommentClick}
                  />
                )
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
} 