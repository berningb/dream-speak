import { useState, useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import Layout from '../../../components/Layout'

export default function Notes() {
  const [dreams, setDreams] = useState([])
  const [selectedDream, setSelectedDream] = useState(null)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { getIdTokenClaims } = useAuth0()

  useEffect(() => {
    const fetchDreams = async () => {
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
                allDreams {
                  id
                  title
                  description
                  date
                  mood
                  emotions
                  colors
                  people
                  places
                  things
                  tags
                }
              }
            `
          })
        })

        const data = await response.json()
        
        if (data.errors) {
          throw new Error(data.errors[0].message)
        }

        setDreams(data.data.allDreams)
      } catch (err) {
        console.error('Error fetching dreams:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchDreams()
  }, [getIdTokenClaims])

  const handleDreamSelect = (dream) => {
    setSelectedDream(dream)
    // In a real app, you'd load existing notes for this dream
    setNotes('')
  }

  const handleSaveNotes = () => {
    if (!selectedDream || !notes.trim()) return
    
    // In a real app, you'd save this to the database
    console.log('Saving notes for dream:', selectedDream.id, notes)
    
    // For now, just show a success message
    alert('Notes saved! (This would be saved to the database in a real app)')
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <Layout>
        <div className='flex flex-col items-center justify-start h-screen'>
          <h1 className='text-4xl font-bold text-center py-6'>Personal Notes</h1>
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
          <h1 className='text-4xl font-bold text-center py-6'>Personal Notes</h1>
          <div className='max-w-6xl mx-auto px-4 w-full'>
            <div className='alert alert-error'>
              <span>Error loading dreams: {error}</span>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className='flex flex-col items-center justify-start min-h-screen'>
        <h1 className='text-4xl font-bold text-center py-6'>Personal Notes</h1>
        <div className='max-w-6xl mx-auto px-4 w-full'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
            {/* Dream Selection */}
            <div className='bg-white rounded-xl p-6 border border-slate-200 shadow-lg'>
              <h3 className='text-xl font-semibold mb-4 text-slate-800'>Select a Dream</h3>
              <div className='space-y-3 max-h-96 overflow-y-auto'>
                {dreams.length === 0 ? (
                  <p className='text-slate-500 text-center py-8'>No dreams available</p>
                ) : (
                  dreams.map((dream) => (
                    <div 
                      key={dream.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                        selectedDream?.id === dream.id 
                          ? 'border-purple-300 bg-purple-50 shadow-md' 
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                      onClick={() => handleDreamSelect(dream)}
                    >
                      <div className='flex justify-between items-start mb-2'>
                        <h4 className='font-semibold text-slate-800'>{dream.title}</h4>
                        <span className='text-sm text-slate-500'>{formatDate(dream.date)}</span>
                      </div>
                      <p className='text-sm text-slate-600 line-clamp-2'>{dream.description}</p>
                      {dream.mood && (
                        <div className='mt-2'>
                          <span className='inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full'>
                            {dream.mood}
                          </span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Notes Editor */}
            <div className='bg-white rounded-xl p-6 border border-slate-200 shadow-lg'>
              <h3 className='text-xl font-semibold mb-4 text-slate-800'>Write Your Notes</h3>
              
              {selectedDream ? (
                <div>
                  <div className='mb-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200'>
                    <h4 className='font-semibold text-slate-800 mb-2'>{selectedDream.title}</h4>
                    <p className='text-sm text-slate-600 mb-2'>{selectedDream.description}</p>
                    <div className='flex flex-wrap gap-2'>
                      {selectedDream.mood && (
                        <span className='bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full'>
                          {selectedDream.mood}
                        </span>
                      )}
                      {selectedDream.emotions?.slice(0, 3).map((emotion, index) => (
                        <span key={index} className='bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full'>
                          {emotion}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className='space-y-4'>
                    <div>
                      <label className='label'>
                        <span className='label-text font-medium'>Your Reflections</span>
                      </label>
                      <textarea
                        className='textarea textarea-bordered w-full h-48 bg-white border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all resize-none'
                        placeholder='Write your thoughts, interpretations, or personal insights about this dream...'
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>

                    <div className='flex gap-3'>
                      <button 
                        className='btn btn-primary bg-gradient-to-r from-purple-500 to-pink-600 border-0 hover:from-purple-600 hover:to-pink-700'
                        onClick={handleSaveNotes}
                        disabled={!notes.trim()}
                      >
                        💾 Save Notes
                      </button>
                      <button 
                        className='btn btn-outline'
                        onClick={() => setNotes('')}
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className='text-center py-12'>
                  <div className='text-6xl mb-4'>📝</div>
                  <p className='text-lg text-slate-700 mb-2'>Select a dream to start writing</p>
                  <p className='text-slate-500'>Choose a dream from the list to add your personal reflections and interpretations</p>
                </div>
              )}
            </div>
          </div>

          {/* Writing Prompts */}
          <div className='mt-8 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200'>
            <h3 className='text-xl font-semibold mb-4 text-slate-800'>💡 Writing Prompts</h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <h4 className='font-medium text-slate-700'>Interpretation</h4>
                <ul className='text-sm text-slate-600 space-y-1'>
                  <li>• What do you think this dream means?</li>
                  <li>• How does it relate to your current life?</li>
                  <li>• What emotions did it bring up?</li>
                </ul>
              </div>
              <div className='space-y-2'>
                <h4 className='font-medium text-slate-700'>Reflection</h4>
                <ul className='text-sm text-slate-600 space-y-1'>
                  <li>• What patterns do you notice?</li>
                  <li>• How has this dream affected you?</li>
                  <li>• What insights can you take from it?</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
} 