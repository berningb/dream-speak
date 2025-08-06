import { formatDreamDate } from '../utils'

import { useNavigate } from 'react-router-dom'

export default function DreamCard({ dream, showAuthor = true, onClick, showFavoriteButton = false, isFavorited = false, onFavoriteToggle, showCommentButton = false, onCommentClick, likedByMe = false, likeCount = 0, onLikeToggle }) {
  const navigate = useNavigate()
  
  const handleClick = () => {
    if (onClick) {
      onClick(dream)
    } else {
      // Navigate to dream page using React Router
      navigate(`/dream/${dream.id}`)
    }
  }

  const handleFavoriteClick = (e) => {
    e.stopPropagation()
    if (onFavoriteToggle) {
      onFavoriteToggle(dream.id)
    } else {
      console.log('Favorite feature coming soon!')
    }
  }

  const handleCommentClick = (e) => {
    e.stopPropagation()
    if (onCommentClick) {
      onCommentClick(dream.id)
    } else {
      // Navigate to dream page to view/add comments
      navigate(`/dream/${dream.id}`)
    }
  }

  const handleLikeClick = (e) => {
    e.stopPropagation()
    if (onLikeToggle) {
      onLikeToggle(dream.id, likedByMe)
    } else {
      console.log('Like feature coming soon!')
    }
  }

  return (
    <div 
      className={`bg-base-200 rounded-lg p-4 h-full flex flex-col relative ${onClick ? 'cursor-pointer hover:bg-base-300 transition-colors' : ''}`}
      onClick={handleClick}
    >
      {/* Top bar with date */}
      <div className='flex justify-start items-start mb-3'>
        <div className='text-sm text-base-content/50'>
          {formatDreamDate(dream.createdAt || dream.date)}
        </div>
      </div>
      
      <div className='mb-3'>
        <h3 className='text-lg font-semibold line-clamp-2'>{dream.title}</h3>
      </div>
      
      {dream.image && (
        <img 
          src={dream.image} 
          alt={dream.title}
          className='w-full h-64 object-cover rounded-lg mb-3'
        />
      )}
      
      {/* Instagram-style action buttons */}
      <div className='flex items-center gap-4 mb-3'>
        <button
          className={`btn btn-ghost btn-sm p-0 ${likedByMe ? 'text-red-500' : ''}`}
          onClick={handleLikeClick}
        >
          {likedByMe ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          )}
        </button>
        
        {showCommentButton && (
          <button
            className="btn btn-ghost btn-sm p-0"
            onClick={handleCommentClick}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>
        )}
        
        <div className="ml-auto">
          {showFavoriteButton && (
            <button
              className={`btn btn-ghost btn-sm p-0 ${isFavorited ? 'text-yellow-500' : ''}`}
              onClick={handleFavoriteClick}
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
            </button>
          )}
        </div>
      </div>
      
      {/* Like count */}
      {likeCount > 0 && (
        <div className="text-sm font-semibold mb-2">
          {likeCount} {likeCount === 1 ? 'like' : 'likes'}
        </div>
      )}
      
      <p className='text-base-content/70 mb-3 flex-grow line-clamp-3'>
        {dream.content && dream.content.length > 150 
          ? `${dream.content.substring(0, 150)}...` 
          : dream.content || dream.description || ''
        }
      </p>
      
      <div className='flex flex-wrap gap-1 mb-3'>
        {dream.mood && (
          <span className='badge badge-primary badge-sm'>{dream.mood}</span>
        )}
        {dream.tags && dream.tags.slice(0, 2).map((tag, index) => (
          <span key={index} className='badge badge-secondary badge-sm'>{tag}</span>
        ))}
      </div>
      
      {showAuthor && dream.user && (
        <div className='text-sm text-base-content/50 mt-auto'>
          Shared by: {dream.user.firstName && dream.user.lastName 
            ? `${dream.user.firstName} ${dream.user.lastName}`
            : dream.user.firstName || dream.user.email
          }
        </div>
      )}
    </div>
  )
} 