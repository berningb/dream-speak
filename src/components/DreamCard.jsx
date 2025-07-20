import { formatDreamDate } from '../utils'

export default function DreamCard({ dream, showAuthor = true, onClick }) {
  const handleClick = () => {
    if (onClick) {
      onClick(dream)
    }
  }

  return (
    <div 
      className={`bg-base-200 rounded-lg p-4 h-full flex flex-col ${onClick ? 'cursor-pointer hover:bg-base-300 transition-colors' : ''}`}
      onClick={handleClick}
    >
      <div className='flex justify-between items-start mb-3'>
        <h3 className='text-lg font-semibold line-clamp-2'>{dream.title}</h3>
        <div className='text-sm text-base-content/50 flex-shrink-0 ml-2'>
          {formatDreamDate(dream.date)}
        </div>
      </div>
      
      {dream.image && (
        <img 
          src={dream.image} 
          alt={dream.title}
          className='w-full h-40 object-cover rounded-lg mb-3'
        />
      )}
      
      <p className='text-base-content/70 mb-3 flex-grow line-clamp-3'>
        {dream.description.length > 150 
          ? `${dream.description.substring(0, 150)}...` 
          : dream.description
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