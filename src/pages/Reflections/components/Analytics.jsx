import { useState, useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import Layout from '../../../components/Layout'

export default function Analytics({ onBack }) {
  const [dreams, setDreams] = useState([])
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

  // Analytics calculations
  const totalDreams = dreams.length
  const dreamsThisMonth = dreams.filter(dream => {
    const dreamDate = new Date(dream.date)
    const now = new Date()
    return dreamDate.getMonth() === now.getMonth() && dreamDate.getFullYear() === now.getFullYear()
  }).length

  // Mood analysis
  const moodCounts = dreams.reduce((acc, dream) => {
    if (dream.mood) {
      acc[dream.mood] = (acc[dream.mood] || 0) + 1
    }
    return acc
  }, {})

  // Most common emotions
  const allEmotions = dreams.flatMap(dream => dream.emotions || [])
  const emotionCounts = allEmotions.reduce((acc, emotion) => {
    acc[emotion] = (acc[emotion] || 0) + 1
    return acc
  }, {})
  const topEmotions = Object.entries(emotionCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)

  // Most common colors
  const allColors = dreams.flatMap(dream => dream.colors || [])
  const colorCounts = allColors.reduce((acc, color) => {
    acc[color] = (acc[color] || 0) + 1
    return acc
  }, {})
  const topColors = Object.entries(colorCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)

  // Most common places
  const allPlaces = dreams.flatMap(dream => dream.places || [])
  const placeCounts = allPlaces.reduce((acc, place) => {
    acc[place] = (acc[place] || 0) + 1
    return acc
  }, {})
  const topPlaces = Object.entries(placeCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)

  // Dream frequency by month (last 6 months)
  const getMonthName = (date) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short' })
  }

  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const month = date.getMonth()
    const year = date.getFullYear()
    
    const count = dreams.filter(dream => {
      const dreamDate = new Date(dream.date)
      return dreamDate.getMonth() === month && dreamDate.getFullYear() === year
    }).length

    return {
      month: getMonthName(date),
      count
    }
  }).reverse()

  if (loading) {
    return (
      <Layout>
        <div className='flex flex-col items-center justify-start h-screen'>
          <div className='w-full max-w-6xl mx-auto px-4 mb-4'>
            <button 
              onClick={onBack}
              className='btn btn-outline btn-sm mb-4'
            >
              ← Back to Reflections
            </button>
          </div>
          <h1 className='text-4xl font-bold text-center py-6'>Dream Analytics</h1>
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
          <div className='w-full max-w-6xl mx-auto px-4 mb-4'>
            <button 
              onClick={onBack}
              className='btn btn-outline btn-sm mb-4'
            >
              ← Back to Reflections
            </button>
          </div>
          <h1 className='text-4xl font-bold text-center py-6'>Dream Analytics</h1>
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
        <div className='w-full max-w-6xl mx-auto px-4 mb-4'>
          <button 
            onClick={onBack}
            className='btn btn-outline btn-sm mb-4'
          >
            ← Back to Reflections
          </button>
        </div>
        <h1 className='text-4xl font-bold text-center py-6'>Dream Analytics</h1>
        <div className='max-w-6xl mx-auto px-4 w-full'>
          {/* Overview Stats */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
            <div className='bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200'>
              <div className='text-2xl font-bold text-blue-800'>{totalDreams}</div>
              <div className='text-blue-600'>Total Dreams</div>
            </div>
            <div className='bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200'>
              <div className='text-2xl font-bold text-green-800'>{dreamsThisMonth}</div>
              <div className='text-green-600'>This Month</div>
            </div>
            <div className='bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200'>
              <div className='text-2xl font-bold text-purple-800'>{Object.keys(moodCounts).length}</div>
              <div className='text-purple-600'>Unique Moods</div>
            </div>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
            {/* Dream Frequency Chart */}
            <div className='bg-white rounded-xl p-6 border border-slate-200 shadow-lg'>
              <h3 className='text-xl font-semibold mb-4 text-slate-800'>Dream Frequency (Last 6 Months)</h3>
              <div className='space-y-3'>
                {monthlyData.map(({ month, count }) => (
                  <div key={month} className='flex items-center gap-4'>
                    <div className='w-16 text-sm font-medium text-slate-600'>{month}</div>
                    <div className='flex-1 bg-slate-200 rounded-full h-4'>
                      <div 
                        className='bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full transition-all'
                        style={{ width: `${Math.max((count / Math.max(...monthlyData.map(d => d.count))) * 100, 10)}%` }}
                      ></div>
                    </div>
                    <div className='w-8 text-sm font-medium text-slate-600'>{count}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mood Distribution */}
            <div className='bg-white rounded-xl p-6 border border-slate-200 shadow-lg'>
              <h3 className='text-xl font-semibold mb-4 text-slate-800'>Mood Distribution</h3>
              {Object.keys(moodCounts).length > 0 ? (
                <div className='space-y-3'>
                  {Object.entries(moodCounts)
                    .sort(([,a], [,b]) => b - a)
                    .map(([mood, count]) => (
                      <div key={mood} className='flex items-center gap-4'>
                        <div className='flex-1 text-sm font-medium text-slate-700'>{mood}</div>
                        <div className='flex-1 bg-slate-200 rounded-full h-3'>
                          <div 
                            className='bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all'
                            style={{ width: `${(count / Math.max(...Object.values(moodCounts))) * 100}%` }}
                          ></div>
                        </div>
                        <div className='w-8 text-sm font-medium text-slate-600'>{count}</div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className='text-slate-500 text-center py-8'>No mood data available</p>
              )}
            </div>

            {/* Top Emotions */}
            <div className='bg-white rounded-xl p-6 border border-slate-200 shadow-lg'>
              <h3 className='text-xl font-semibold mb-4 text-slate-800'>Most Common Emotions</h3>
              {topEmotions.length > 0 ? (
                <div className='space-y-3'>
                  {topEmotions.map(([emotion, count]) => (
                    <div key={emotion} className='flex items-center justify-between p-3 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg border border-pink-200'>
                      <span className='font-medium text-slate-700'>{emotion}</span>
                      <span className='bg-pink-100 text-pink-800 px-2 py-1 rounded-full text-sm font-medium'>{count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className='text-slate-500 text-center py-8'>No emotion data available</p>
              )}
            </div>

            {/* Top Colors */}
            <div className='bg-white rounded-xl p-6 border border-slate-200 shadow-lg'>
              <h3 className='text-xl font-semibold mb-4 text-slate-800'>Most Common Colors</h3>
              {topColors.length > 0 ? (
                <div className='space-y-3'>
                  {topColors.map(([color, count]) => (
                    <div key={color} className='flex items-center justify-between p-3 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200'>
                      <span className='font-medium text-slate-700'>{color}</span>
                      <span className='bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-sm font-medium'>{count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className='text-slate-500 text-center py-8'>No color data available</p>
              )}
            </div>

            {/* Top Places */}
            <div className='bg-white rounded-xl p-6 border border-slate-200 shadow-lg lg:col-span-2'>
              <h3 className='text-xl font-semibold mb-4 text-slate-800'>Most Common Places</h3>
              {topPlaces.length > 0 ? (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
                  {topPlaces.map(([place, count]) => (
                    <div key={place} className='flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200'>
                      <span className='font-medium text-slate-700 truncate'>{place}</span>
                      <span className='bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-sm font-medium ml-2'>{count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className='text-slate-500 text-center py-8'>No place data available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
} 