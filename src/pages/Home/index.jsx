import { useState, useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import DreamCard from '../../components/DreamCard'

export default function Home() {
  const [recentDreams, setRecentDreams] = useState([])
  const [loading, setLoading] = useState(true)
  const { getIdTokenClaims } = useAuth0()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchRecentDreams = async () => {
      try {
        const token = await getIdTokenClaims()
        
        const response = await fetch('http://localhost:4000/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token.__raw}`
          },
          body: JSON.stringify({
            query: `
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
            `
          })
        })

        const data = await response.json()
        
        if (data.errors) {
          throw new Error(data.errors[0].message)
        }

        // Get the 3 most recent dreams
        const recent = data.data.dreams.slice(0, 3)
        setRecentDreams(recent)
      } catch (err) {
        console.error('Error fetching recent dreams:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchRecentDreams()
  }, [getIdTokenClaims])

  return (
    <Layout>
      <div className='flex flex-col items-center justify-start h-screen'>
        <h1 className='text-4xl font-bold text-center py-6'>Welcome to Dream Speak</h1>
        <div className='max-w-4xl mx-auto px-4 w-full'>
          <div className='bg-base-200 rounded-lg p-6 mb-6'>
            <h2 className='text-2xl font-semibold mb-4'>Quick Actions</h2>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
              <button 
                className='btn btn-primary'
                onClick={() => navigate('/log')}
              >
                Log a Dream
              </button>
              <button 
                className='btn btn-secondary'
                onClick={() => navigate('/my-dreams')}
              >
                View My Dreams
              </button>
              <button 
                className='btn btn-accent'
                onClick={() => navigate('/explore')}
              >
                Explore Dreams
              </button>
              <button 
                className='btn btn-outline'
                onClick={() => navigate('/reflections')}
              >
                Reflections
              </button>
            </div>
          </div>
          
          <div className='bg-base-200 rounded-lg p-6'>
            <h2 className='text-2xl font-semibold mb-4'>Recent Dreams</h2>
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
        </div>
      </div>
    </Layout>
  )
} 