import { useState, useEffect } from 'react'
import { formatDreamDate, loadedImageUrls, getDisplayHandle } from '../utils'
import { useNavigate, Link } from 'react-router-dom'

export default function DreamCard({ dream, showAuthor = true, onClick, showFavoriteButton = false, isFavorited = false, onFavoriteToggle, showCommentButton = false, onCommentClick, showLikeButton = true, likedByMe = false, likeCount = 0, onLikeToggle, showEditButton = false, onEditClick, showDeleteButton = false, onDeleteClick, currentUserId }) {
  const navigate = useNavigate()
  const imageSrc = dream.image || '/dream-placeholder.svg'
  const alreadyLoaded = loadedImageUrls.has(imageSrc)
  const [imageLoaded, setImageLoaded] = useState(alreadyLoaded)

  useEffect(() => {
    if (loadedImageUrls.has(imageSrc)) {
      setImageLoaded(true)
      return
    }
    setImageLoaded(false)

    const maxWait = 15000
    const bail = setTimeout(() => setImageLoaded(true), maxWait)
    return () => clearTimeout(bail)
  }, [imageSrc])
  
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

  const handleEditClick = (e) => {
    e.stopPropagation()
    if (onEditClick) {
      onEditClick(dream)
    }
  }

  const handleDeleteClick = (e) => {
    e.stopPropagation()
    if (onDeleteClick) {
      onDeleteClick(dream.id)
    }
  }

  const likeColorClass = 'text-primary'
  const descriptionSnippet = dream.content || dream.description || ''
  const truncatedDesc = descriptionSnippet.length > 400 ? `${descriptionSnippet.substring(0, 400)}...` : descriptionSnippet
  const isOwner = dream.userId === currentUserId
  const canShowEdit = showEditButton && isOwner
  const canShowDelete = showDeleteButton && isOwner

  return (
    <div 
      className={`group rounded-lg overflow-hidden bg-base-200 border border-base-300 aspect-[4/5] relative transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 hover:-translate-y-1 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={handleClick}
    >
      {/* Image - fills the card */}
      <div className='absolute inset-0'>
        {/* Breathing skeleton + spinner while image loads */}
        {!imageLoaded && (
          <div className='absolute inset-0 bg-base-300 animate-skeleton-breathe flex items-center justify-center'>
            <div className='relative'>
              <div className='w-14 h-14 rounded-full border-2 border-base-content/20 border-t-primary animate-spin' />
              <span className='absolute inset-0 flex items-center justify-center text-2xl'>🌙</span>
            </div>
          </div>
        )}
        <img 
          src={imageSrc} 
          alt={dream.title}
          className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'} group-hover:scale-105`}
          onLoad={() => {
            loadedImageUrls.add(imageSrc)
            setImageLoaded(true)
          }}
          onError={() => setImageLoaded(true)}
        />
        {/* Dark overlay on hover - blackens image so text is readable */}
        <div className='absolute inset-0 bg-black/0 group-hover:bg-black/70 transition-colors duration-300 flex flex-col justify-end p-4'>
          {/* Top bar: date and actions - subtle bar for visibility on any image */}
          <div className='absolute top-0 left-0 right-0 flex justify-between items-start p-3 bg-gradient-to-b from-black/40 to-transparent'>
            <span className='text-xs text-white font-medium drop-shadow-md'>{formatDreamDate(dream.createdAt || dream.date)}</span>
            <div className='flex items-center gap-0' onClick={(e) => e.stopPropagation()}>
              {showLikeButton && (
                <button className={`btn btn-ghost btn-xs p-0.5 min-h-0 h-auto text-white/90 hover:text-white ${likedByMe ? likeColorClass : ''}`} onClick={handleLikeClick}>
                  {likedByMe ? <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg> : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>}</button>
              )}
              {showCommentButton && (
                <button className="btn btn-ghost btn-xs p-0.5 min-h-0 h-auto text-white/90 hover:text-white" onClick={handleCommentClick}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                </button>
              )}
              {showFavoriteButton && (
                <button className={`btn btn-ghost btn-xs p-0.5 min-h-0 h-auto text-white/90 hover:text-white ${isFavorited ? 'text-yellow-400' : ''}`} onClick={handleFavoriteClick}>
                  {isFavorited ? <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg> : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>}</button>
              )}
              {(canShowEdit || canShowDelete) && (
                <div className="dropdown dropdown-end">
                  <div tabIndex={0} role="button" className="btn btn-ghost btn-xs text-white/90 hover:text-white" onClick={(e) => e.stopPropagation()}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                  </div>
                  <ul tabIndex={0} className="dropdown-content menu menu-sm z-[1] mt-2 p-2 shadow bg-base-100 rounded-box w-32">
                    {canShowEdit && <li><button onClick={handleEditClick} className="flex items-center gap-2"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>Edit</button></li>}
                    {canShowDelete && <li><button onClick={handleDeleteClick} className="flex items-center gap-2 text-red-500"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>Delete</button></li>}
                  </ul>
                </div>
              )}
            </div>
          </div>
          {/* Hover content: title and description - visible as overlay darkens, ~40% of card */}
          <div className='opacity-0 group-hover:opacity-100 transition-opacity duration-300 min-h-[40%] flex flex-col'>
            <h3 className='text-white font-semibold text-lg line-clamp-2 mb-2 drop-shadow-md shrink-0'>{dream.title}</h3>
            <p className='text-white/90 text-sm line-clamp-6 drop-shadow-md'>{truncatedDesc}</p>
            {likeCount > 0 && <p className='text-white/80 text-xs mt-2'>{likeCount} {likeCount === 1 ? 'like' : 'likes'}</p>}
            {showAuthor && dream.user && (
              <p className='text-white/70 text-xs mt-1'>
                Shared by{' '}
                <Link to={`/user/${dream.user.username || dream.user.id}`} onClick={(e) => e.stopPropagation()} className='text-white/90 hover:text-white underline decoration-white/50'>
                  {dream.user.username ? `@${dream.user.username}` : getDisplayHandle(dream.user)}
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 