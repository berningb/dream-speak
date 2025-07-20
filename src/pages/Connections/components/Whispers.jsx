import { useState, useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import Layout from '../../../components/Layout'

export default function Whispers() {
  const [whispers, setWhispers] = useState([])
  const [loading, setLoading] = useState(true)
  const [newWhisper, setNewWhisper] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { getIdTokenClaims } = useAuth0()

  useEffect(() => {
    fetchWhispers()
  }, [])

  const fetchWhispers = async () => {
    try {
      setLoading(true)
      const token = await getIdTokenClaims()
      
      const response = await fetch('https://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.__raw}`
        },
        body: JSON.stringify({
          query: `
            query {
              allDreams {
                id
                title
                description
                date
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

      // Filter to only show public dreams (whispers)
      const publicDreams = data.data.allDreams.filter(dream => dream.isPublic)
      setWhispers(publicDreams)
    } catch (err) {
      console.error('Error fetching whispers:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitWhisper = async (e) => {
    e.preventDefault()
    if (!newWhisper.trim()) return

    try {
      setSubmitting(true)
      const token = await getIdTokenClaims()
      
      const response = await fetch('https://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.__raw}`
        },
        body: JSON.stringify({
          query: `
            mutation AddDream($title: String!, $description: String!, $isPublic: Boolean!) {
              addDream(
                title: $title
                description: $description
                isPublic: $isPublic
                date: "${new Date().toISOString()}"
              ) {
                id
                title
                description
                date
                isPublic
              }
            }
          `,
          variables: {
            title: `Whisper - ${new Date().toLocaleDateString()}`,
            description: newWhisper,
            isPublic: true
          }
        })
      })

      const data = await response.json()
      
      if (data.errors) {
        throw new Error(data.errors[0].message)
      }

      setNewWhisper('')
      fetchWhispers() // Refresh the list
    } catch (err) {
      console.error('Error submitting whisper:', err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Layout>
      <div className='flex flex-col items-center justify-start h-screen'>
        <h1 className='text-4xl font-bold text-center py-6'>Whispers</h1>
        <div className='max-w-4xl mx-auto px-4 w-full'>
          {/* Submit new whisper */}
          <div className='bg-base-200 rounded-lg p-6 mb-6'>
            <h2 className='text-2xl font-semibold mb-4'>Share a Whisper</h2>
            <p className='text-base-content/70 mb-4'>
              Share an anonymous dream fragment or thought. No personal details will be shown.
            </p>
            <form onSubmit={handleSubmitWhisper}>
              <textarea
                className='textarea textarea-bordered w-full h-32 mb-4'
                placeholder="Share a dream fragment, emotion, or thought..."
                value={newWhisper}
                onChange={(e) => setNewWhisper(e.target.value)}
                disabled={submitting}
              />
              <button 
                type='submit' 
                className='btn btn-primary'
                disabled={submitting || !newWhisper.trim()}
              >
                {submitting ? (
                  <>
                    <span className='loading loading-spinner loading-sm'></span>
                    Sharing...
                  </>
                ) : (
                  'Share Whisper'
                )}
              </button>
            </form>
          </div>

          {/* Whispers feed */}
          <div className='bg-base-200 rounded-lg p-6'>
            <h2 className='text-2xl font-semibold mb-4'>Recent Whispers</h2>
            {loading ? (
              <div className='flex justify-center items-center h-32'>
                <span className='loading loading-spinner loading-lg'></span>
              </div>
            ) : whispers.length === 0 ? (
              <div className='text-center py-8'>
                <p className='text-lg text-base-content/70'>No whispers yet. Be the first to share!</p>
              </div>
            ) : (
              <div className='space-y-4'>
                {whispers.map((whisper) => (
                  <div key={whisper.id} className='bg-base-100 rounded-lg p-4 border border-base-300'>
                    <div className='flex justify-between items-start mb-2'>
                      <span className='text-sm text-base-content/50'>Anonymous Dreamer</span>
                      <span className='text-sm text-base-content/50'>
                        {new Date(whisper.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className='text-base-content/90 mb-3'>{whisper.description}</p>
                    {whisper.tags && whisper.tags.length > 0 && (
                      <div className='flex flex-wrap gap-2'>
                        {whisper.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className='badge badge-outline badge-sm'>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
} 