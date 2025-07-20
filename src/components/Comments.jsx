import { useState, useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'

const GET_COMMENTS_QUERY = `
  query GetComments($dreamId: ID!) {
    comments(dreamId: $dreamId) {
      id
      content
      user {
        id
        firstName
        lastName
        picture
      }
      createdAt
      likeCount
      likedByMe
      replies {
        id
        content
        user {
          id
          firstName
          lastName
          picture
        }
        createdAt
        likeCount
        likedByMe
      }
    }
  }
`

const ADD_COMMENT_MUTATION = `
  mutation AddComment($dreamId: ID!, $content: String!, $parentId: ID) {
    addComment(dreamId: $dreamId, content: $content, parentId: $parentId) {
      id
      content
      user {
        id
        firstName
        lastName
        picture
      }
      createdAt
      likeCount
      likedByMe
      replies {
        id
        content
        user {
          id
          firstName
          lastName
          picture
        }
        createdAt
        likeCount
        likedByMe
      }
    }
  }
`

const LIKE_COMMENT_MUTATION = `
  mutation LikeComment($commentId: ID!) {
    likeComment(commentId: $commentId)
  }
`

const UNLIKE_COMMENT_MUTATION = `
  mutation UnlikeComment($commentId: ID!) {
    unlikeComment(commentId: $commentId)
  }
`

export default function Comments({ dreamId, isOpen, onClose }) {
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [replyTo, setReplyTo] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)
  const { getIdTokenClaims } = useAuth0()
  // const { backendUser } = useBackendUser() // Not used

  const fetchComments = async () => {
    setLoading(true)
    try {
      const tokenClaims = await getIdTokenClaims()
      const response = await fetch('https://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenClaims.__raw}`
        },
        body: JSON.stringify({
          query: GET_COMMENTS_QUERY,
          variables: { dreamId }
        })
      })
      const { data, errors } = await response.json()
      if (errors) throw new Error(errors[0].message)
      setComments(data.comments)
    } catch (err) {
      console.error('Error fetching comments:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen && dreamId) {
      fetchComments()
    }
  }, [isOpen, dreamId])

  const handleSubmitComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return
    setLoading(true)
    setErrorMsg(null)
    try {
      const tokenClaims = await getIdTokenClaims()
      const response = await fetch('https://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenClaims.__raw}`
        },
        body: JSON.stringify({
          query: ADD_COMMENT_MUTATION,
          variables: { dreamId, content: newComment }
        })
      })
      const { errors } = await response.json()
      if (errors) throw new Error(errors[0].message)
      setNewComment('')
      fetchComments()
    } catch (error) {
      setErrorMsg(error.message || 'Failed to post comment')
      setTimeout(() => setErrorMsg(null), 4000)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReply = async (e, parentCommentId) => {
    e.preventDefault()
    if (!replyText.trim()) return
    setLoading(true)
    try {
      const tokenClaims = await getIdTokenClaims()
      const response = await fetch('https://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenClaims.__raw}`
        },
        body: JSON.stringify({
          query: ADD_COMMENT_MUTATION,
          variables: { dreamId, content: replyText, parentId: parentCommentId }
        })
      })
      const { errors } = await response.json()
      if (errors) throw new Error(errors[0].message)
      setReplyText('')
      setReplyTo(null)
      fetchComments()
    } catch (error) {
      console.error('Error posting reply:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLikeComment = async (commentId, likedByMe) => {
    setLoading(true)
    setErrorMsg(null)
    try {
      const tokenClaims = await getIdTokenClaims()
      const response = await fetch('https://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenClaims.__raw}`
        },
        body: JSON.stringify({
          query: likedByMe ? UNLIKE_COMMENT_MUTATION : LIKE_COMMENT_MUTATION,
          variables: { commentId }
        })
      })
      const { errors } = await response.json()
      if (errors) throw new Error(errors[0].message)
      fetchComments()
    } catch (error) {
      setErrorMsg(error.message || 'Failed to like/unlike comment')
      setTimeout(() => setErrorMsg(null), 4000)
    } finally {
      setLoading(false)
    }
  }

  const formatTimeAgo = (date) => {
    console.log('date', date)
    const now = new Date()
    const diff = now - new Date(date)
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-xl max-w-2xl w-full max-h-[80vh] flex flex-col'>
        {/* Header */}
        <div className='flex justify-between items-center p-6 border-b border-slate-200'>
          <h2 className='text-2xl font-bold text-slate-800'>💬 Comments</h2>
          <button 
            className='btn btn-ghost btn-circle'
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        {/* Comments List */}
        <div className='flex-1 overflow-y-auto p-6 space-y-6'>
          {loading ? (
            <div className='text-center py-8'>
              <span className='loading loading-spinner loading-lg'></span>
            </div>
          ) : comments.length === 0 ? (
            <div className='text-center py-8'>
              <div className='text-4xl mb-4'>💭</div>
              <p className='text-slate-600'>No comments yet. Be the first to share your thoughts!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className='space-y-4'>
                {/* Main Comment */}
                <div className='bg-slate-50 rounded-lg p-4'>
                  <div className='flex items-start space-x-3'>
                    <img 
                      src={comment.user.picture} 
                      alt={comment.user.firstName}
                      className='w-10 h-10 rounded-full object-cover'
                    />
                    <div className='flex-1'>
                      <div className='flex items-center space-x-2 mb-2'>
                        <span className='font-semibold text-slate-800'>
                          {comment.user.firstName} {comment.user.lastName}
                        </span>
                        <span className='text-sm text-slate-500'>
                          {formatTimeAgo(comment.createdAt)}
                        </span>
                      </div>
                      <p className='text-slate-700 mb-3'>{comment.content}</p>
                      <div className='flex items-center space-x-4'>
                        <button 
                          className={`flex items-center space-x-1 text-sm transition-colors ${
                            comment.likedByMe
                              ? 'text-red-500 font-medium'
                              : 'text-slate-500 hover:text-red-500'
                          }`}
                          onClick={() => handleLikeComment(comment.id, comment.likedByMe)}
                        >
                          <span>{comment.likedByMe ? '❤️' : '🤍'}</span>
                          <span>{comment.likeCount}</span>
                        </button>
                        <button 
                          className='text-sm text-slate-500 hover:text-blue-500 transition-colors'
                          onClick={() => setReplyTo(comment.id)}
                        >
                          💬 Reply
                        </button>
                      </div>
                      {/* Replies */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className='mt-4 pl-6 border-l-2 border-slate-200 space-y-4'>
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className='flex items-start space-x-3'>
                              <img 
                                src={reply.user.picture} 
                                alt={reply.user.firstName}
                                className='w-8 h-8 rounded-full object-cover'
                              />
                              <div className='flex-1'>
                                <div className='flex items-center space-x-2 mb-1'>
                                  <span className='font-semibold text-slate-800 text-sm'>
                                    {reply.user.firstName} {reply.user.lastName}
                                  </span>
                                  <span className='text-xs text-slate-500'>
                                    {formatTimeAgo(reply.createdAt)}
                                  </span>
                                </div>
                                <p className='text-slate-700 mb-2 text-sm'>{reply.content}</p>
                                <button 
                                  className={`flex items-center space-x-1 text-xs transition-colors ${
                                    reply.likedByMe
                                      ? 'text-red-500 font-medium'
                                      : 'text-slate-500 hover:text-red-500'
                                  }`}
                                  onClick={() => handleLikeComment(reply.id, reply.likedByMe)}
                                >
                                  <span>{reply.likedByMe ? '❤️' : '🤍'}</span>
                                  <span>{reply.likeCount}</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {/* Reply Form */}
                      {replyTo === comment.id && (
                        <form className='mt-4 flex items-center space-x-2' onSubmit={e => handleSubmitReply(e, comment.id)}>
                          <input 
                            type='text'
                            className='input input-bordered input-sm flex-1'
                            placeholder='Write a reply...'
                            value={replyText}
                            onChange={e => setReplyText(e.target.value)}
                            disabled={loading}
                          />
                          <button className='btn btn-primary btn-sm' type='submit' disabled={loading || !replyText.trim()}>
                            Reply
                          </button>
                          <button className='btn btn-ghost btn-sm' type='button' onClick={() => setReplyTo(null)}>
                            Cancel
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {errorMsg && (
          <div className='alert alert-error mb-4'>
            <span>{errorMsg}</span>
          </div>
        )}
        {/* Add Comment Form */}
        <form className='p-6 border-t border-slate-200 flex items-center space-x-2' onSubmit={handleSubmitComment}>
          <input 
            type='text'
            className='input input-bordered flex-1'
            placeholder='Add a comment...'
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            disabled={loading}
          />
          <button className='btn btn-primary' type='submit' disabled={loading || !newComment.trim()}>
            Comment
          </button>
        </form>
      </div>
    </div>
  )
} 