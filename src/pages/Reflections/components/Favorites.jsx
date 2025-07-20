import { useState, useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import Layout from '../../../components/Layout'
import DreamCard from '../../../components/DreamCard'
import { useDatabaseFavorites } from '../../../hooks/useDatabaseFavorites'

export default function Favorites() {
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('my-favorites') // 'my-favorites', 'others-favorites'
  const [myFavorites, setMyFavorites] = useState([])
  const [othersFavorites, setOthersFavorites] = useState([])
  const { user, isLoading: auth0Loading } = useAuth0()
  const { removeFavorite, favorites, error } = useDatabaseFavorites()

  useEffect(() => {
    if (!auth0Loading && favorites.length > 0) {
      setLoading(true)
      
      // Separate user's own dreams from others' dreams
      const myDreams = favorites.filter(favorite => favorite.dream.user.id === user.sub)
      const othersDreams = favorites.filter(favorite => favorite.dream.user.id !== user.sub)
      
      setMyFavorites(myDreams.map(f => f.dream))
      setOthersFavorites(othersDreams.map(f => f.dream))
      setLoading(false)
    } else if (!auth0Loading) {
      setMyFavorites([])
      setOthersFavorites([])
      setLoading(false)
    }
  }, [favorites, auth0Loading, user?.sub])

  const handleRemoveFavorite = (dreamId) => {
    // Remove from favorites using the hook
    removeFavorite(dreamId)
    // Local state will be updated automatically via the useEffect
  }

  if (loading) {
    return (
      <Layout>
        <div className='flex flex-col items-center justify-start h-screen'>
          <h1 className='text-4xl font-bold text-center py-6'>Favorites</h1>
          <div className='max-w-6xl mx-auto px-4 w-full'>
            <div className='flex justify-center items-center h-64'>
              <span className='loading loading-spinner loading-lg'></span>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className='flex flex-col items-center justify-start h-screen'>
          <h1 className='text-4xl font-bold text-center py-6'>Favorites</h1>
          <div className='max-w-6xl mx-auto px-4 w-full'>
            <div className='alert alert-error'>
              <span>Error loading favorites: {error}</span>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className='flex flex-col items-center justify-start min-h-screen'>
        <h1 className='text-4xl font-bold text-center py-6'>⭐ Favorites</h1>
        <div className='max-w-6xl mx-auto px-4 w-full'>
          {/* Tab Navigation */}
          <div className='flex justify-center mb-8'>
            <div className='tabs tabs-boxed bg-slate-100'>
              <button 
                className={`tab ${activeTab === 'my-favorites' ? 'tab-active bg-yellow-500 text-white' : ''}`}
                onClick={() => setActiveTab('my-favorites')}
              >
                My Favorites
              </button>
              <button 
                className={`tab ${activeTab === 'others-favorites' ? 'tab-active bg-yellow-500 text-white' : ''}`}
                onClick={() => setActiveTab('others-favorites')}
              >
                                 Others&apos; Dreams I Love
              </button>
            </div>
          </div>

          {/* Content */}
          <div className='space-y-6'>
            {activeTab === 'my-favorites' ? (
              <div>
                <div className='flex justify-between items-center mb-6'>
                  <h2 className='text-2xl font-semibold text-slate-800'>My Favorite Dreams</h2>
                  <span className='text-slate-600 bg-slate-100 px-3 py-1 rounded-full text-sm font-medium'>
                    {myFavorites.length} favorite{myFavorites.length !== 1 ? 's' : ''}
                  </span>
                </div>
                
                {myFavorites.length === 0 ? (
                  <div className='text-center py-12 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-200'>
                    <div className='text-6xl mb-4'>⭐</div>
                    <p className='text-lg text-slate-700 mb-2'>No favorites yet</p>
                    <p className='text-slate-600 mb-4'>Start adding dreams to your favorites to see them here</p>
                    <button className='btn btn-warning bg-gradient-to-r from-yellow-500 to-orange-600 border-0 hover:from-yellow-600 hover:to-orange-700'>
                      Explore Dreams
                    </button>
                  </div>
                ) : (
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                    {myFavorites.map((dream) => (
                      <div key={dream.id} className='relative group'>
                        <DreamCard 
                          dream={dream} 
                          showAuthor={false}
                        />
                        <button 
                          className='absolute top-2 right-2 btn btn-sm btn-circle btn-error opacity-0 group-hover:opacity-100 transition-opacity'
                          onClick={() => handleRemoveFavorite(dream.id)}
                          title='Remove from favorites'
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className='flex justify-between items-center mb-6'>
                  <h2 className='text-2xl font-semibold text-slate-800'>Dreams I Love from Others</h2>
                  <span className='text-slate-600 bg-slate-100 px-3 py-1 rounded-full text-sm font-medium'>
                    {othersFavorites.length} favorite{othersFavorites.length !== 1 ? 's' : ''}
                  </span>
                </div>
                
                {othersFavorites.length === 0 ? (
                  <div className='text-center py-12 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200'>
                    <div className='text-6xl mb-4'>💜</div>
                    <p className='text-lg text-slate-700 mb-2'>No favorites from others yet</p>
                    <p className='text-slate-600 mb-4'>Explore public dreams and add them to your favorites</p>
                    <button className='btn btn-secondary bg-gradient-to-r from-purple-500 to-pink-600 border-0 hover:from-purple-600 hover:to-pink-700'>
                      Explore Public Dreams
                    </button>
                  </div>
                ) : (
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                    {othersFavorites.map((dream) => (
                      <div key={dream.id} className='relative group'>
                        <DreamCard 
                          dream={dream} 
                          showAuthor={true}
                        />
                        <button 
                          className='absolute top-2 right-2 btn btn-sm btn-circle btn-error opacity-0 group-hover:opacity-100 transition-opacity'
                          onClick={() => handleRemoveFavorite(dream.id)}
                          title='Remove from favorites'
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Help Section */}
          <div className='mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200'>
            <h3 className='text-xl font-semibold mb-4 text-slate-800'>💡 How to Use Favorites</h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <h4 className='font-medium text-slate-700'>Adding Favorites</h4>
                <ul className='text-sm text-slate-600 space-y-1'>
                  <li>• Click the ⭐ button on any dream card</li>
                  <li>• Your favorites will appear here</li>
                  <li>• Quick access to your most loved dreams</li>
                </ul>
              </div>
              <div className='space-y-2'>
                <h4 className='font-medium text-slate-700'>Managing Favorites</h4>
                <ul className='text-sm text-slate-600 space-y-1'>
                  <li>• Hover over cards to see remove button</li>
                  <li>• Organize your personal dream collection</li>
                  <li>• Separate your dreams from others you love</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
} 