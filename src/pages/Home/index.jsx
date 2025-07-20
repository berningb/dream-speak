import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import Layout from '../../components/Layout'
import DreamCard from '../../components/DreamCard'
import useApi from '../../hooks/useApi'

export default function Home() {
  const [recentDreams, setRecentDreams] = useState([])
  const { apiCall, loading, error } = useApi()
  const { isAuthenticated } = useAuth0()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchRecentDreams = async () => {
      // Only fetch dreams if user is authenticated
      if (!isAuthenticated) return

      const data = await apiCall(`
        query {
          dreams {
            id
            title
            description
            date
            image
            isPublic
            tags
            mood
            emotions
            colors
            user {
              id
              email
              firstName
              lastName
            }
          }
        }
      `)

      if (data) {
        // Get the 3 most recent dreams
        const recent = data.dreams.slice(0, 3)
        setRecentDreams(recent)
      }
    }

    fetchRecentDreams()
  }, [apiCall, isAuthenticated])

  return (
    <Layout>
      <div className='flex flex-col items-center justify-start h-screen'>
        <h1 className='text-4xl font-bold text-center py-6'>Welcome to Dream Speak</h1>
        <div className='max-w-4xl mx-auto px-4 w-full'>
          <div className='bg-base-200 rounded-lg p-6 mb-6'>
            <h2 className='text-2xl font-semibold mb-4'>Quick Actions</h2>
            <div className='flex justify-center'>
              <button 
                className='btn btn-primary btn-lg'
                onClick={() => navigate('/explore')}
              >
                Explore Dreams
              </button>
            </div>
          </div>
          
          {/* Only show Recent Dreams section if user is authenticated */}
          {isAuthenticated && (
            <div className='bg-base-200 rounded-lg p-6'>
              <h2 className='text-2xl font-semibold mb-4'>Recent Dreams</h2>
              {error && (
                <div className='alert alert-error mb-4'>
                  <span>Error loading dreams: {error}</span>
                </div>
              )}
              {loading ? (
                <div className='flex justify-center items-center h-32'>
                  <span className='loading loading-spinner loading-lg'></span>
                </div>
              ) : recentDreams.length === 0 ? (
                <div className='text-center py-8'>
                  <p className='text-lg text-base-content/70 mb-4'>
                    No dreams logged yet. Start your dream journey today!
                  </p>
                  <button 
                    className='btn btn-primary'
                    onClick={() => navigate('/log')}
                  >
                    Log Your First Dream
                  </button>
                </div>
              ) : (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                  {recentDreams.map((dream) => (
                    <DreamCard 
                      key={dream.id} 
                      dream={dream} 
                      showAuthor={false}
                      onClick={() => navigate(`/dream/${dream.id}`)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
} 