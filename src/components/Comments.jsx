import { useState, useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'

export default function Comments({ dreamId, isOpen, onClose }) {
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [replyTo, setReplyTo] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [loading, setLoading] = useState(false)
  const { user } = useAuth0()

  // Mock comments data - in a real app, this would come from the API
  const mockComments = [
    {
      id: '1',
      text: 'This dream feels so familiar! I had something similar last week.',
      author: {
        id: 'user1',
        firstName: 'Sarah',
        lastName: 'Johnson',
        picture: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face'
      },
      createdAt: new Date(Date.now() - 86400000), // 1 day ago
      likes: 3,
      likedBy: ['user2', 'user3'],
      replies: [
        {
          id: 'reply1',
          text: 'I agree! There\'s something universal about this imagery.',
          author: {
            id: 'user2',
            firstName: 'Mike',
            lastName: 'Chen',
            picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face'
          },
          createdAt: new Date(Date.now() - 43200000), // 12 hours ago
          likes: 1,
          likedBy: ['user1']
        }
      ]
    },
    {
      id: '2',
      text: 'The colors you mentioned are really interesting. Blue often represents calmness and peace.',
      author: {
        id: 'user3',
        firstName: 'Emma',
        lastName: 'Davis',
        picture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face'
      },
      createdAt: new Date(Date.now() - 172800000), // 2 days ago
      likes: 5,
      likedBy: ['user1', 'user2', 'user4'],
      replies: []
    }
  ]

  useEffect(() => {
    if (isOpen) {
      // In a real app, fetch comments from API
      setComments(mockComments)
    }
  }, [isOpen, dreamId])

  const handleSubmitComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setLoading(true)
    try {
      // In a real app, this would make an API call
      const comment = {
        id: Date.now().toString(),
        text: newComment,
        author: {
          id: user.sub,
          firstName: user.given_name || user.name?.split(' ')[0] || 'User',
          lastName: user.family_name || user.name?.split(' ').slice(1).join(' ') || '',
          picture: user.picture
        },
        createdAt: new Date(),
        likes: 0,
        likedBy: [],
        replies: []
      }

      setComments(prev => [comment, ...prev])
      setNewComment('')
    } catch (error) {
      console.error('Error posting comment:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReply = async (e, parentCommentId) => {
    e.preventDefault()
    if (!replyText.trim()) return

    setLoading(true)
    try {
      // In a real app, this would make an API call
      const reply = {
        id: Date.now().toString(),
        text: replyText,
        author: {
          id: user.sub,
          firstName: user.given_name || user.name?.split(' ')[0] || 'User',
          lastName: user.family_name || user.name?.split(' ').slice(1).join(' ') || '',
          picture: user.picture
        },
        createdAt: new Date(),
        likes: 0,
        likedBy: []
      }

      setComments(prev => prev.map(comment => 
        comment.id === parentCommentId 
          ? { ...comment, replies: [...comment.replies, reply] }
          : comment
      ))
      setReplyText('')
      setReplyTo(null)
    } catch (error) {
      console.error('Error posting reply:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLikeComment = (commentId, isReply = false, parentId = null) => {
    if (isReply && parentId) {
      setComments(prev => prev.map(comment => 
        comment.id === parentId 
          ? {
              ...comment,
              replies: comment.replies.map(reply => 
                reply.id === commentId 
                  ? {
                      ...reply,
                      likes: reply.likedBy.includes(user.sub) 
                        ? reply.likes - 1 
                        : reply.likes + 1,
                      likedBy: reply.likedBy.includes(user.sub)
                        ? reply.likedBy.filter(id => id !== user.sub)
                        : [...reply.likedBy, user.sub]
                    }
                  : reply
              )
            }
          : comment
      ))
    } else {
      setComments(prev => prev.map(comment => 
        comment.id === commentId 
          ? {
              ...comment,
              likes: comment.likedBy.includes(user.sub) 
                ? comment.likes - 1 
                : comment.likes + 1,
              likedBy: comment.likedBy.includes(user.sub)
                ? comment.likedBy.filter(id => id !== user.sub)
                : [...comment.likedBy, user.sub]
            }
          : comment
      ))
    }
  }

  const formatTimeAgo = (date) => {
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
          {comments.length === 0 ? (
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
                      src={comment.author.picture} 
                      alt={comment.author.firstName}
                      className='w-10 h-10 rounded-full object-cover'
                    />
                    <div className='flex-1'>
                      <div className='flex items-center space-x-2 mb-2'>
                        <span className='font-semibold text-slate-800'>
                          {comment.author.firstName} {comment.author.lastName}
                        </span>
                        <span className='text-sm text-slate-500'>
                          {formatTimeAgo(comment.createdAt)}
                        </span>
                      </div>
                      <p className='text-slate-700 mb-3'>{comment.text}</p>
                      <div className='flex items-center space-x-4'>
                        <button 
                          className={`flex items-center space-x-1 text-sm transition-colors ${
                            comment.likedBy.includes(user.sub)
                              ? 'text-red-500 font-medium'
                              : 'text-slate-500 hover:text-red-500'
                          }`}
                          onClick={() => handleLikeComment(comment.id)}
                        >
                          <span>{comment.likedBy.includes(user.sub) ? '❤️' : '🤍'}</span>
                          <span>{comment.likes}</span>
                        </button>
                        <button 
                          className='text-sm text-slate-500 hover:text-blue-500 transition-colors'
                          onClick={() => setReplyTo(comment.id)}
                        >
                          💬 Reply
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Reply Form */}
                  {replyTo === comment.id && (
                    <div className='mt-4 pl-12'>
                      <form onSubmit={(e) => handleSubmitReply(e, comment.id)}>
                        <div className='flex space-x-2'>
                          <input
                            type='text'
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder='Write a reply...'
                            className='flex-1 input input-bordered input-sm'
                            disabled={loading}
                          />
                          <button 
                            type='submit' 
                            className='btn btn-primary btn-sm'
                            disabled={loading || !replyText.trim()}
                          >
                            {loading ? 'Posting...' : 'Reply'}
                          </button>
                          <button 
                            type='button'
                            className='btn btn-ghost btn-sm'
                            onClick={() => {
                              setReplyTo(null)
                              setReplyText('')
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Replies */}
                  {comment.replies.length > 0 && (
                    <div className='mt-4 space-y-3 pl-12'>
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className='bg-white rounded-lg p-3 border border-slate-200'>
                          <div className='flex items-start space-x-3'>
                            <img 
                              src={reply.author.picture} 
                              alt={reply.author.firstName}
                              className='w-8 h-8 rounded-full object-cover'
                            />
                            <div className='flex-1'>
                              <div className='flex items-center space-x-2 mb-1'>
                                <span className='font-semibold text-sm text-slate-800'>
                                  {reply.author.firstName} {reply.author.lastName}
                                </span>
                                <span className='text-xs text-slate-500'>
                                  {formatTimeAgo(reply.createdAt)}
                                </span>
                              </div>
                              <p className='text-sm text-slate-700 mb-2'>{reply.text}</p>
                              <button 
                                className={`flex items-center space-x-1 text-xs transition-colors ${
                                  reply.likedBy.includes(user.sub)
                                    ? 'text-red-500 font-medium'
                                    : 'text-slate-500 hover:text-red-500'
                                }`}
                                onClick={() => handleLikeComment(reply.id, true, comment.id)}
                              >
                                <span>{reply.likedBy.includes(user.sub) ? '❤️' : '🤍'}</span>
                                <span>{reply.likes}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Comment Form */}
        <div className='p-6 border-t border-slate-200'>
          <form onSubmit={handleSubmitComment}>
            <div className='flex space-x-3'>
              <img 
                src={user.picture} 
                alt={user.name}
                className='w-10 h-10 rounded-full object-cover'
              />
              <div className='flex-1'>
                <input
                  type='text'
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder='Share your thoughts on this dream...'
                  className='input input-bordered w-full'
                  disabled={loading}
                />
              </div>
              <button 
                type='submit' 
                className='btn btn-primary'
                disabled={loading || !newComment.trim()}
              >
                {loading ? 'Posting...' : 'Post'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 