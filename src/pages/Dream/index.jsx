import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext'
import { getDream, createComment, getComments, createLike, deleteLike, createFavorite, deleteFavorite, getLikes, getFavorites, canUserComment, canUserLike, canUserFavorite, deleteComment, updateComment } from '../../services/firebaseService'
import Layout from '../../components/Layout'
import { formatDreamDate } from '../../utils'

export default function Dream() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, loginWithGoogle, user } = useFirebaseAuth()
  const [dream, setDream] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [isFavorited, setIsFavorited] = useState(false)
  const [userLikeId, setUserLikeId] = useState(null)
  const [userFavoriteId, setUserFavoriteId] = useState(null)
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editingCommentText, setEditingCommentText] = useState('')

  useEffect(() => {
    const fetchDream = async () => {
      try {
        setLoading(true)
        const dreamData = await getDream(id)
        if (dreamData) {
          setDream(dreamData)
          // Fetch comments for this dream
          const commentsData = await getComments(id)
          setComments(commentsData || [])
          
          // Load like/favorite state if user is authenticated
          if (isAuthenticated) {
            await loadLikeFavoriteState()
          }
        } else {
          setError('Dream not found')
        }
      } catch (err) {
        console.error('Error fetching dream:', err)
        setError('Failed to load dream')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchDream()
    }
  }, [id, isAuthenticated])

  const loadLikeFavoriteState = async () => {
    try {
      // Load likes to check if user liked this dream
      const likes = await getLikes(id)
      const userLike = likes.find(like => like.userId === user?.uid)
      setIsLiked(!!userLike)
      setUserLikeId(userLike?.id || null)
      setLikeCount(likes.length)

      // Load favorites to check if user favorited this dream  
      const favorites = await getFavorites()
      const userFavorite = favorites.find(fav => fav.dreamId === id)
      setIsFavorited(!!userFavorite)
      setUserFavoriteId(userFavorite?.id || null)
    } catch (error) {
      console.error('Error loading like/favorite state:', error)
    }
  }

  const handleLike = async () => {
    if (!isAuthenticated) {
      await loginWithGoogle()
      return
    }

    // Check if user has permission to like this dream
    if (dream && dream.userId) {
      const canLike = await canUserLike(dream.userId)
      if (!canLike) {
        alert('The dream owner has restricted who can like their dreams.')
        return
      }
    }

    try {
      if (isLiked && userLikeId) {
        console.log('Attempting to delete like with ID:', userLikeId)
        await deleteLike(userLikeId)
        setIsLiked(false)
        setUserLikeId(null)
        setLikeCount(prev => Math.max(0, prev - 1))
        console.log('✅ Dream unliked')
      } else {
        const newLike = await createLike({ dreamId: id })
        console.log('New like created:', newLike)
        setIsLiked(true)
        setUserLikeId(newLike.id)
        setLikeCount(prev => prev + 1)
        console.log('❤️ Dream liked, stored ID:', newLike.id)
      }
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      await loginWithGoogle()
      return
    }

    // Check if user has permission to favorite this dream
    if (dream && dream.userId) {
      const canFav = await canUserFavorite(dream.userId)
      if (!canFav) {
        alert('The dream owner has restricted who can favorite their dreams.')
        return
      }
    }

    try {
      if (isFavorited && userFavoriteId) {
        await deleteFavorite(userFavoriteId)
        setIsFavorited(false)
        setUserFavoriteId(null)
        console.log('✅ Removed from favorites')
      } else {
        const newFavorite = await createFavorite({ dreamId: id })
        setIsFavorited(true)
        setUserFavoriteId(newFavorite.id)
        console.log('⭐ Added to favorites')
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  const handleSubmitComment = async (e) => {
    e.preventDefault()
    
    if (!isAuthenticated) {
      await loginWithGoogle()
      return
    }

    if (!newComment.trim()) return

    // Check if user has permission to comment on this dream
    if (dream && dream.userId) {
      const canComment = await canUserComment(dream.userId)
      if (!canComment) {
        alert('The dream owner has restricted who can comment on their dreams.')
        return
      }
    }

    try {
      setSubmitting(true)
      await createComment({
        content: newComment,
        dreamId: id
      })
      
      // Refresh comments
      const updatedComments = await getComments(id)
      setComments(updatedComments || [])
      setNewComment('')
    } catch (err) {
      console.error('Error creating comment:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return
    }

    try {
      await deleteComment(commentId)
      
      // Refresh comments
      const updatedComments = await getComments(id)
      setComments(updatedComments || [])
      console.log('✅ Comment deleted')
    } catch (err) {
      console.error('Error deleting comment:', err)
      alert('Failed to delete comment. Please try again.')
    }
  }

  const handleEditComment = (comment) => {
    setEditingCommentId(comment.id)
    setEditingCommentText(comment.content)
  }

  const handleSaveEditComment = async (commentId) => {
    if (!editingCommentText.trim()) return

    try {
      await updateComment(commentId, { content: editingCommentText })
      
      // Refresh comments
      const updatedComments = await getComments(id)
      setComments(updatedComments || [])
      setEditingCommentId(null)
      setEditingCommentText('')
      console.log('✅ Comment updated')
    } catch (err) {
      console.error('Error updating comment:', err)
      alert('Failed to update comment. Please try again.')
    }
  }

  const handleCancelEdit = () => {
    setEditingCommentId(null)
    setEditingCommentText('')
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

  if (error || !dream) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Dream Not Found</h2>
            <p className="text-base-content/70 mb-4">{error || 'This dream could not be loaded'}</p>
            <button className="btn btn-primary" onClick={() => navigate('/explore')}>
              Back to Explore
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className='flex flex-col items-center justify-start min-h-screen p-6'>
        <div className='w-full max-w-4xl'>
          <div className='mb-6'>
            <button 
              className='btn btn-outline mb-4'
              onClick={() => navigate(-1)}
            >
              ← Back
            </button>
          </div>

          <div className='card bg-base-100 shadow-xl'>
            <div className='card-body'>
              <div className='flex justify-between items-start mb-4'>
                <h1 className='text-3xl font-bold'>{dream.title}</h1>
                <div className='text-sm text-base-content/50'>
                  {formatDreamDate(dream.createdAt || dream.date)}
                </div>
              </div>

              {dream.image && (
                <img 
                  src={dream.image} 
                  alt={dream.title}
                  className='w-full h-64 object-cover rounded-lg mb-6'
                />
              )}

              <div className='prose max-w-none mb-6'>
                <p className='text-lg leading-relaxed'>{dream.content}</p>
              </div>

              {dream.tags && dream.tags.length > 0 && (
                <div className='flex flex-wrap gap-2 mb-6'>
                  {dream.tags.map((tag, index) => (
                    <span key={index} className='badge badge-outline'>{tag}</span>
                  ))}
                </div>
              )}

              {dream.mood && (
                <div className='mb-6'>
                  <span className='font-semibold'>Mood: </span>
                  <span className='badge badge-primary'>{dream.mood}</span>
                </div>
              )}

              {/* Action buttons */}
              <div className='flex items-center gap-6 mb-6'>
                <button
                  className={`btn btn-ghost btn-sm flex items-center gap-2 ${isLiked ? 'text-red-500' : ''}`}
                  onClick={handleLike}
                >
                  {isLiked ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  )}
                  <span>{isLiked ? 'Unlike' : 'Like'}</span>
                  {likeCount > 0 && <span className="text-xs opacity-60">({likeCount})</span>}
                </button>
                
                <button
                  className={`btn btn-ghost btn-sm flex items-center gap-2 ${isFavorited ? 'text-yellow-500' : ''}`}
                  onClick={handleFavorite}
                >
                  {isFavorited ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  )}
                  <span>{isFavorited ? 'Unfavorite' : 'Favorite'}</span>
                </button>
              </div>

              {/* Comments Section */}
              <div className='border-t pt-6'>
                <h3 className='text-xl font-semibold mb-4'>Comments</h3>
                
                {!isAuthenticated ? (
                  <div className='text-center py-8'>
                    <p className='text-base-content/70 mb-4'>Sign in to leave a comment</p>
                    <button 
                      className='btn btn-primary'
                      onClick={loginWithGoogle}
                    >
                      Sign in with Google
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitComment} className='mb-6'>
                    <div className='flex gap-2'>
                      <input
                        type='text'
                        className='input input-bordered flex-1'
                        placeholder='Add a comment...'
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        disabled={submitting}
                      />
                      <button 
                        type='submit' 
                        className='btn btn-primary'
                        disabled={submitting || !newComment.trim()}
                      >
                        {submitting ? (
                          <span className='loading loading-spinner loading-sm'></span>
                        ) : (
                          'Comment'
                        )}
                      </button>
                    </div>
                  </form>
                )}

                <div className='space-y-4'>
                  {comments.length === 0 ? (
                    <p className='text-base-content/70 text-center py-4'>No comments yet. Be the first to comment!</p>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className='bg-base-200 rounded-lg p-4'>
                        <div className='flex justify-between items-start mb-2'>
                          <span className='font-semibold'>{comment.user?.displayName || 'Anonymous'}</span>
                          <div className='flex items-center gap-2'>
                            <span className='text-sm text-base-content/50'>
                              {comment.createdAt?.seconds 
                                ? formatDreamDate(new Date(comment.createdAt.seconds * 1000).toISOString())
                                : 'Just now'
                              }
                              {comment.updatedAt && comment.updatedAt.seconds !== comment.createdAt?.seconds && (
                                <span className='ml-1 text-xs'>(edited)</span>
                              )}
                            </span>
                            {isAuthenticated && (
                              <div className='flex gap-1'>
                                {(comment.userId === user?.uid) && (
                                  <button
                                    className='btn btn-ghost btn-xs'
                                    onClick={() => handleEditComment(comment)}
                                    title='Edit comment'
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </button>
                                )}
                                {(comment.userId === user?.uid || dream?.userId === user?.uid) && (
                                  <button
                                    className='btn btn-ghost btn-xs text-red-500 hover:text-red-700'
                                    onClick={() => handleDeleteComment(comment.id)}
                                    title='Delete comment'
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        {editingCommentId === comment.id ? (
                          <div className='flex gap-2'>
                            <input
                              type='text'
                              className='input input-bordered input-sm flex-1'
                              value={editingCommentText}
                              onChange={(e) => setEditingCommentText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleSaveEditComment(comment.id)
                                } else if (e.key === 'Escape') {
                                  handleCancelEdit()
                                }
                              }}
                              autoFocus
                            />
                            <button
                              className='btn btn-primary btn-sm'
                              onClick={() => handleSaveEditComment(comment.id)}
                              disabled={!editingCommentText.trim()}
                            >
                              Save
                            </button>
                            <button
                              className='btn btn-ghost btn-sm'
                              onClick={handleCancelEdit}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <p>{comment.content}</p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
} 