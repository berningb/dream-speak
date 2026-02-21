import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext'
import { getPublicDreamsPaginated, getUser } from '../../services/firebaseService'
import DreamCard from '../../components/DreamCard'

export default function Home() {
  const { isAuthenticated, loginWithGoogle } = useFirebaseAuth()
  const [dreams, setDreams] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDreams = async () => {
      try {
        const { dreams: publicDreams } = await getPublicDreamsPaginated(10)
        try {
          const userIds = [...new Set(publicDreams.map(d => d.userId).filter(Boolean))]
          const users = await Promise.all(userIds.map(uid => getUser(uid)))
          const userMap = Object.fromEntries(users.filter(Boolean).map(u => [u.id, u]))
          setDreams(publicDreams.map(d => ({ ...d, user: d.userId ? userMap[d.userId] : null })))
        } catch {
          setDreams(publicDreams)
        }
      } catch (err) {
        console.error('Error fetching dreams:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchDreams()
  }, [])

  const handleLikeOrFavorite = () => {
    loginWithGoogle()
  }

  return (
    <div className='flex flex-col min-h-screen px-4 sm:px-6 md:px-8 py-8'>
      <div className='flex flex-col items-center justify-center flex-grow'>
        <div className='text-center max-w-4xl w-full'>
          <div className='flex flex-col sm:flex-row items-center justify-center mb-6 gap-4'>
            <span className='text-6xl sm:text-8xl'>🌙</span>
            <h1 className='text-4xl sm:text-6xl font-bold'>DreamSpeak</h1>
          </div>
          <p className='text-xl sm:text-2xl mb-4 text-primary font-medium px-4'>
            Where dreams come alive through shared stories
          </p>
          <p className='text-base sm:text-lg mb-8 text-base-content/80 max-w-2xl mx-auto px-4'>
            A safe space to explore your subconscious, connect with fellow dreamers, and discover the hidden meanings 
            in your nightly adventures. Every dream has a story worth sharing. Why not share yours today?
          </p>
          <p className='text-sm mb-8 text-base-content/60 italic px-4'>
            ✨ Discover dreams, find connections, explore the subconscious together ✨
          </p>
          
          {!isAuthenticated ? (
            <div className='space-y-4 px-4'>
              <button 
                className='btn btn-primary btn-lg w-full sm:w-auto'
                onClick={loginWithGoogle}
              >
                🌟 Begin Your Dream Journey
              </button>
              <p className='text-base-content/70'>
                Join our community of dreamers and start sharing your stories
              </p>
            </div>
          ) : (
            <div className='flex flex-col sm:flex-row gap-4 sm:gap-8 justify-center items-center px-4'>
              <Link to='/my-dreams' className='btn btn-primary btn-lg w-full sm:w-auto'>
                📖 My Dream Journal
              </Link>
              <Link to='/explore' className='btn btn-outline btn-lg w-full sm:w-auto'>
                🔍 Discover Dreams
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className='mt-16 max-w-6xl mx-auto w-full'>
        <h2 className='text-2xl font-bold mb-6 text-center'>Explore Dreams</h2>
        {loading ? (
          <div className='flex justify-center py-12'>
            <span className='loading loading-spinner loading-lg' />
          </div>
        ) : (
          <>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {dreams.map((dream) => (
                <DreamCard
                  key={dream.id}
                  dream={dream}
                  showAuthor={true}
                  showLikeButton={!isAuthenticated}
                  showFavoriteButton={!isAuthenticated}
                  onLikeToggle={!isAuthenticated ? handleLikeOrFavorite : undefined}
                  onFavoriteToggle={!isAuthenticated ? handleLikeOrFavorite : undefined}
                  likedByMe={false}
                  likeCount={0}
                />
              ))}
            </div>
            <div className='text-center mt-8'>
              {!isAuthenticated ? (
                <button
                  className='btn btn-primary btn-outline'
                  onClick={loginWithGoogle}
                >
                  View more dreams
                </button>
              ) : (
                <Link to='/explore' className='btn btn-primary btn-outline'>
                  View more dreams
                </Link>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}