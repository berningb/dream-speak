import { useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Layout from '../../../components/Layout'
import useDatabaseFavorites from '../../../hooks/useDatabaseFavorites'

const SAVE_NOTE_MUTATION = `
  mutation SaveNote($dreamId: ID!, $content: String!) {
    saveNote(dreamId: $dreamId, content: $content) {
      id
      content
      createdAt
      updatedAt
      dream {
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
          auth0Id
          email
          firstName
          lastName
          picture
        }
      }
    }
  }
`

const GET_NOTE_QUERY = `
  query GetNote($dreamId: ID!) {
    note(dreamId: $dreamId) {
      id
      content
      createdAt
      updatedAt
      dream {
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
          auth0Id
          email
          firstName
          lastName
          picture
        }
      }
    }
  }
`

export default function FavoritesAndNotes() {
  const [selectedDream, setSelectedDream] = useState(null)
  const [noteContent, setNoteContent] = useState('')
  const [currentNote, setCurrentNote] = useState(null)
  const [saving, setSaving] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const { user, getIdTokenClaims } = useAuth0()
  const { favorites, loading: favoritesLoading, error: favoritesError, removeFavorite } = useDatabaseFavorites()

  // Separate user's own dreams from others' dreams
  const myFavorites = favorites.filter(favorite => favorite.dream.user.auth0Id === user?.sub).map(f => f.dream)
  const othersFavorites = favorites.filter(favorite => favorite.dream.user.auth0Id !== user?.sub).map(f => f.dream)

  const handleDreamSelect = async (dream) => {
    setSelectedDream(dream)
    setNoteContent('')
    setCurrentNote(null)
    
    // Load existing note for this dream
    try {
      const tokenClaims = await getIdTokenClaims()
      if (!tokenClaims || !tokenClaims.__raw) {
        throw new Error('Token not available')
      }

      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenClaims.__raw}`
        },
        body: JSON.stringify({
          query: GET_NOTE_QUERY,
          variables: { dreamId: dream.id }
        })
      })

      const { data, errors } = await response.json()
      if (errors) throw new Error(errors[0].message)

      if (data.note) {
        setCurrentNote(data.note)
        setNoteContent(data.note.content)
      }
    } catch (err) {
      console.error('Error loading note:', err)
    }
  }

  const handleSaveNote = async () => {
    if (!selectedDream || !noteContent.trim()) return
    
    setSaving(true)
    try {
      const tokenClaims = await getIdTokenClaims()
      if (!tokenClaims || !tokenClaims.__raw) {
        throw new Error('Token not available')
      }

      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenClaims.__raw}`
        },
        body: JSON.stringify({
          query: SAVE_NOTE_MUTATION,
          variables: { 
            dreamId: selectedDream.id, 
            content: noteContent 
          }
        })
      })

      const { data, errors } = await response.json()
      if (errors) throw new Error(errors[0].message)

      setCurrentNote(data.saveNote)
      alert('Note saved successfully!')
    } catch (err) {
      console.error('Error saving note:', err)
      alert('Error saving note: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleRemoveFavorite = (dreamId) => {
    removeFavorite(dreamId)
    if (selectedDream?.id === dreamId) {
      setSelectedDream(null)
      setNoteContent('')
      setCurrentNote(null)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (favoritesLoading) {
    return (
      <Layout>
        <div className='flex flex-col items-center justify-start h-screen'>
          <h1 className='text-4xl font-bold text-center py-6'>⭐ Favorites & Notes</h1>
          <div className='max-w-6xl mx-auto px-4 w-full'>
            <div className='flex justify-center items-center h-64'>
              <span className='loading loading-spinner loading-lg'></span>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  if (favoritesError) {
    return (
      <Layout>
        <div className='flex flex-col items-center justify-start h-screen'>
          <h1 className='text-4xl font-bold text-center py-6'>⭐ Favorites & Notes</h1>
          <div className='max-w-6xl mx-auto px-4 w-full'>
            <div className='alert alert-error'>
              <span>Error loading favorites: {favoritesError}</span>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className='flex flex-col items-center justify-start min-h-screen'>
        <h1 className='text-4xl font-bold text-center py-6'>⭐ Favorites & Notes</h1>
        <div className='max-w-7xl mx-auto px-4 w-full'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
            {/* Left Side - Favorites List */}
            <div className='space-y-6'>
              {/* My Favorites */}
              <div className='bg-base-100 rounded-xl p-6 border border-base-300 shadow-lg'>
                <div className='flex justify-between items-center mb-4'>
                  <h3 className='text-xl font-semibold text-base-content'>My Favorite Dreams</h3>
                  <span className='text-base-content/70 bg-base-200 px-3 py-1 rounded-full text-sm font-medium'>
                    {myFavorites.length} favorite{myFavorites.length !== 1 ? 's' : ''}
                  </span>
                </div>
                
                {myFavorites.length === 0 ? (
                  <div className='text-center py-8 bg-gradient-to-br from-warning/20 to-error/20 rounded-xl border border-warning/30'>
                    <div className='text-4xl mb-2'>⭐</div>
                    <p className='text-base-content mb-2'>No favorites yet</p>
                    <p className='text-base-content/70 text-sm'>Start adding dreams to your favorites</p>
                  </div>
                ) : (
                  <div className='space-y-3 max-h-64 overflow-y-auto'>
                    {myFavorites.map((dream) => (
                      <div 
                        key={dream.id}
                        className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                          selectedDream?.id === dream.id 
                            ? 'border-primary bg-primary/10 shadow-md' 
                            : 'border-base-300 hover:border-base-400'
                        }`}
                        onClick={() => handleDreamSelect(dream)}
                      >
                        <div className='flex justify-between items-start mb-2'>
                          <h4 className='font-semibold text-base-content'>{dream.title}</h4>
                          <span className='text-sm text-base-content/60'>{formatDate(dream.date)}</span>
                        </div>
                        <p className='text-sm text-base-content/70 line-clamp-2 mb-2'>{dream.description}</p>
                        <div className='flex justify-between items-center'>
                          <div className='flex flex-wrap gap-1'>
                            {dream.mood && (
                              <span className='bg-primary/20 text-primary text-xs px-2 py-1 rounded-full'>
                                {dream.mood}
                              </span>
                            )}
                          </div>
                          <button 
                            className='btn btn-sm btn-circle btn-error opacity-0 group-hover:opacity-100 transition-opacity'
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemoveFavorite(dream.id)
                            }}
                            title='Remove from favorites'
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Others' Favorites */}
              <div className='bg-base-100 rounded-xl p-6 border border-base-300 shadow-lg'>
                <div className='flex justify-between items-center mb-4'>
                  <h3 className='text-xl font-semibold text-base-content'>Dreams I Love from Others</h3>
                  <span className='text-base-content/70 bg-base-200 px-3 py-1 rounded-full text-sm font-medium'>
                    {othersFavorites.length} favorite{othersFavorites.length !== 1 ? 's' : ''}
                  </span>
                </div>
                
                {othersFavorites.length === 0 ? (
                  <div className='text-center py-8 bg-gradient-to-br from-secondary/20 to-accent/20 rounded-xl border border-secondary/30'>
                    <div className='text-4xl mb-2'>💜</div>
                    <p className='text-base-content mb-2'>No favorites from others yet</p>
                    <p className='text-base-content/70 text-sm'>Explore public dreams and add them to your favorites</p>
                  </div>
                ) : (
                  <div className='space-y-3 max-h-64 overflow-y-auto'>
                    {othersFavorites.map((dream) => (
                      <div 
                        key={dream.id}
                        className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                          selectedDream?.id === dream.id 
                            ? 'border-primary bg-primary/10 shadow-md' 
                            : 'border-base-300 hover:border-base-400'
                        }`}
                        onClick={() => handleDreamSelect(dream)}
                      >
                        <div className='flex justify-between items-start mb-2'>
                          <h4 className='font-semibold text-base-content'>{dream.title}</h4>
                          <span className='text-sm text-base-content/60'>{formatDate(dream.date)}</span>
                        </div>
                        <p className='text-sm text-base-content/70 line-clamp-2 mb-2'>{dream.description}</p>
                        <div className='flex justify-between items-center'>
                          <div className='flex flex-wrap gap-1'>
                            {dream.mood && (
                              <span className='bg-primary/20 text-primary text-xs px-2 py-1 rounded-full'>
                                {dream.mood}
                              </span>
                            )}
                          </div>
                          <div className='text-xs text-base-content/60'>
                            by {dream.user.firstName || dream.user.email}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Side - Notes Editor */}
            <div className='bg-base-100 rounded-xl p-6 border border-base-300 shadow-lg'>
              <div className='flex justify-between items-center mb-4'>
                <h3 className='text-xl font-semibold text-base-content'>📝 Personal Notes</h3>
                <div className='flex gap-2'>
                  <div className='dropdown dropdown-end'>
                    <div tabIndex={0} role='button' className='btn btn-sm btn-outline btn-primary' title='Writing Prompts'>
                      💭 Prompts
                    </div>
                    <div tabIndex={0} className='dropdown-content z-[1] menu p-4 shadow-lg bg-base-100 rounded-box w-80 border border-base-300'>
                      <h4 className='font-semibold mb-3 text-base-content'>💭 Writing Prompts</h4>
                      <div className='space-y-3'>
                        <div>
                          <h5 className='font-medium text-base-content text-sm mb-1'>Interpretation</h5>
                          <ul className='text-xs text-base-content/70 space-y-1'>
                            <li>• What do you think this dream means?</li>
                            <li>• How does it relate to your current life?</li>
                            <li>• What emotions did it bring up?</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className='font-medium text-base-content text-sm mb-1'>Reflection</h5>
                          <ul className='text-xs text-base-content/70 space-y-1'>
                            <li>• What patterns do you notice?</li>
                            <li>• How has this dream affected you?</li>
                            <li>• What insights can you take from it?</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='dropdown dropdown-end'>
                    <div tabIndex={0} role='button' className='btn btn-sm btn-outline btn-secondary' title='Markdown Tips'>
                      📝 Markdown
                    </div>
                    <div tabIndex={0} className='dropdown-content z-[1] menu p-4 shadow-lg bg-base-100 rounded-box w-80 border border-base-300'>
                      <h4 className='font-semibold mb-3 text-base-content'>📝 Markdown Tips</h4>
                      <div className='space-y-3'>
                        <div>
                          <h5 className='font-medium text-base-content text-sm mb-1'>Text Formatting</h5>
                          <ul className='text-xs text-base-content/70 space-y-1'>
                            <li>• **Bold text** for emphasis</li>
                            <li>• *Italic text* for subtle emphasis</li>
                            <li>• ~~Strikethrough~~ for corrections</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className='font-medium text-base-content text-sm mb-1'>Structure</h5>
                          <ul className='text-xs text-base-content/70 space-y-1'>
                            <li>• # Main heading</li>
                            <li>• ## Sub heading</li>
                            <li>• ### Section heading</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className='font-medium text-base-content text-sm mb-1'>Lists & Quotes</h5>
                          <ul className='text-xs text-base-content/70 space-y-1'>
                            <li>• - Bullet points</li>
                            <li>• 1. Numbered lists</li>
                            <li>• &gt; Blockquotes for important thoughts</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {selectedDream ? (
                <div>
                  {/* Selected Dream Info */}
                  <div className='mb-6 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/20'>
                    <h4 className='font-semibold text-base-content mb-2'>{selectedDream.title}</h4>
                    <p className='text-sm text-base-content/70 mb-3'>{selectedDream.description}</p>
                    <div className='flex flex-wrap gap-2 mb-2'>
                      {selectedDream.mood && (
                        <span className='bg-primary/20 text-primary text-xs px-2 py-1 rounded-full'>
                          {selectedDream.mood}
                        </span>
                      )}
                      {selectedDream.emotions?.slice(0, 3).map((emotion, index) => (
                        <span key={index} className='bg-secondary/20 text-secondary text-xs px-2 py-1 rounded-full'>
                          {emotion}
                        </span>
                      ))}
                    </div>
                    <div className='text-xs text-base-content/60'>
                      {formatDate(selectedDream.date)}
                      {selectedDream.user.auth0Id !== user?.sub && (
                        <span> • by {selectedDream.user.firstName || selectedDream.user.email}</span>
                      )}
                    </div>
                  </div>

                  {/* Notes Editor */}
                  <div className='space-y-4'>
                    <div className='flex gap-2 mb-4'>
                      <button 
                        className={`btn btn-sm ${!previewMode ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setPreviewMode(false)}
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        className={`btn btn-sm ${previewMode ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setPreviewMode(true)}
                      >
                        👁️ Preview
                      </button>
                    </div>

                    {!previewMode ? (
                      <div>
                        <label className='label'>
                          <span className='label-text font-medium'>Your Reflections</span>
                        </label>
                        <textarea
                          className='textarea textarea-bordered w-full h-64 bg-base-100 border-base-300 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none font-mono text-sm'
                          placeholder='Write your thoughts, interpretations, or personal insights about this dream...

# Use Markdown
- **Bold text** for emphasis
- *Italic text* for subtle emphasis
- ## Headers for organization
- - Bullet points for lists
- > Blockquotes for important thoughts

What does this dream mean to you?'
                          value={noteContent}
                          onChange={(e) => setNoteContent(e.target.value)}
                        />
                      </div>
                    ) : (
                      <div className='border border-base-300 rounded-lg p-4 h-64 overflow-y-auto bg-base-200'>
                        {noteContent ? (
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            className='prose prose-sm max-w-none'
                          >
                            {noteContent}
                          </ReactMarkdown>
                        ) : (
                          <p className='text-base-content/60 italic'>No content to preview</p>
                        )}
                      </div>
                    )}

                    <div className='flex gap-3'>
                      <button 
                        className='btn btn-primary bg-gradient-to-r from-purple-500 to-pink-600 border-0 hover:from-purple-600 hover:to-pink-700'
                        onClick={handleSaveNote}
                        disabled={!noteContent.trim() || saving}
                      >
                        {saving ? (
                          <>
                            <span className='loading loading-spinner loading-xs'></span>
                            Saving...
                          </>
                        ) : (
                          '💾 Save Note'
                        )}
                      </button>
                      <button 
                        className='btn btn-outline'
                        onClick={() => setNoteContent('')}
                        disabled={saving}
                      >
                        Clear
                      </button>
                    </div>

                    {currentNote && (
                      <div className='mt-4 p-3 bg-green-50 border border-green-200 rounded-lg'>
                        <p className='text-sm text-green-700'>
                          💾 Last saved: {formatDate(currentNote.updatedAt)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className='text-center py-12'>
                  <div className='text-6xl mb-4'>📝</div>
                  <p className='text-lg text-base-content mb-2'>Select a dream to start writing</p>
                  <p className='text-base-content/70'>Choose a dream from your favorites to add your personal reflections and interpretations</p>
                </div>
              )}
            </div>
          </div>


        </div>
      </div>
    </Layout>
  )
} 