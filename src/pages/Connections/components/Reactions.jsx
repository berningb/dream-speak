import { useState, useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import Layout from '../../../components/Layout'

export default function Reactions() {
  const [myPublicDreams, setMyPublicDreams] = useState([])
  const [loading, setLoading] = useState(true)
  const { getIdTokenClaims } = useAuth0()

  useEffect(() => {
    fetchMyPublicDreams()
  }, [])

  const fetchMyPublicDreams = async () => {
    try {
      setLoading(true)
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

      // Filter to only show public dreams
      const publicDreams = data.data.dreams.filter(dream => dream.isPublic)
      setMyPublicDreams(publicDreams)
    } catch (err) {
      console.error('Error fetching my public dreams:', err)
    } finally {
      setLoading(false)
    }
  }

  const getReactionEmoji = (mood) => {
    const reactions = {
      'Happy': '😊',
      'Exciting': '🎉',
      'Curious': '🤔',
      'Scary': '😱',
      'Sad': '😢',
      'Confusing': '🤷‍♂️',
      'Wonder': '✨',
      'Peaceful': '😌'
    }
    return reactions[mood] || '💭'
  }

  return (
    <Layout>
      <div className='flex flex-col items-center justify-start h-screen'>
        <h1 className='text-4xl font-bold text-center py-6'>Reactions</h1>
        <div className='max-w-4xl mx-auto px-4 w-full'>
          <div className='bg-base-200 rounded-lg p-6 mb-6'>
            <h2 className='text-2xl font-semibold mb-4'>Your Shared Dreams</h2>
            <p className='text-base-content/70 mb-4'>
              See how the community responds to your shared dreams and insights.
            </p>
          </div>

          {loading ? (
            <div className='flex justify-center items-center h-64'>
              <span className='loading loading-spinner loading-lg'></span>
            </div>
          ) : myPublicDreams.length === 0 ? (
            <div className='bg-base-200 rounded-lg p-8 text-center'>
              <h3 className='text-xl font-semibold mb-4'>No Shared Dreams Yet</h3>
              <p className='text-base-content/70 mb-6'>
                Share your dreams publicly to see community reactions and insights.
              </p>
              <button className='btn btn-primary'>Share Your First Dream</button>
            </div>
          ) : (
            <div className='space-y-6'>
              {myPublicDreams.map((dream) => (
                <div key={dream.id} className='bg-base-200 rounded-lg p-6'>
                  <div className='flex justify-between items-start mb-4'>
                    <div>
                      <h3 className='text-xl font-semibold mb-2'>{dream.title}</h3>
                      <p className='text-base-content/70 text-sm'>
                        Shared on {new Date(dream.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className='text-4xl'>
                      {getReactionEmoji(dream.mood)}
                    </div>
                  </div>
                  
                  <p className='text-base-content/90 mb-4 line-clamp-3'>
                    {dream.description}
                  </p>
                  
                  {dream.tags && dream.tags.length > 0 && (
                    <div className='flex flex-wrap gap-2 mb-4'>
                      {dream.tags.map((tag, index) => (
                        <span key={index} className='badge badge-outline'>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* Mock reactions - in a real app, these would come from the database */}
                  <div className='border-t border-base-300 pt-4'>
                    <h4 className='font-semibold mb-3'>Community Reactions</h4>
                    <div className='space-y-3'>
                      <div className='flex items-center gap-3'>
                        <div className='avatar placeholder'>
                          <div className='bg-neutral text-neutral-content rounded-full w-8'>
                            <span className='text-xs'>JD</span>
                          </div>
                        </div>
                        <div className='flex-1'>
                          <p className='text-sm'>
                            <span className='font-medium'>DreamerJD</span> reacted with 
                            <span className='text-2xl ml-1'>✨</span>
                          </p>
                          <p className='text-xs text-base-content/60'>
                            &ldquo;This resonates with my own experiences. Beautiful imagery!&rdquo;
                          </p>
                        </div>
                      </div>
                      
                      <div className='flex items-center gap-3'>
                        <div className='avatar placeholder'>
                          <div className='bg-primary text-primary-content rounded-full w-8'>
                            <span className='text-xs'>ML</span>
                          </div>
                        </div>
                        <div className='flex-1'>
                          <p className='text-sm'>
                            <span className='font-medium'>MoonLover</span> reacted with 
                            <span className='text-2xl ml-1'>🤔</span>
                          </p>
                          <p className='text-xs text-base-content/60'>
                            &ldquo;I&apos;ve had similar dreams. Wonder what this means?&rdquo;
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
} 