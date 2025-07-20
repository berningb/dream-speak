import { useState } from 'react'
import Layout from '../../components/Layout'
import Analytics from './components/Analytics'
import Notes from './components/Notes'

export default function Reflections() {
  const [activeView, setActiveView] = useState('landing') // 'landing', 'analytics', 'notes'

  if (activeView === 'analytics') {
    return <Analytics />
  }

  if (activeView === 'notes') {
    return <Notes />
  }

  return (
    <Layout>
      <div className='flex flex-col items-center justify-start h-screen'>
        <h1 className='text-4xl font-bold text-center py-6'>Dream Insights</h1>
        <p className='text-slate-600 text-center mb-8 max-w-2xl'>
          Discover patterns, track your dream journey, and reflect on your experiences
        </p>
        <div className='max-w-4xl mx-auto px-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 border border-blue-200 shadow-lg hover:shadow-xl transition-all'>
              <div className='text-3xl mb-4'>📊</div>
              <h2 className='text-xl font-semibold mb-4 text-slate-800'>Dream Analytics</h2>
              <p className='text-slate-600 mb-4'>
                Visualize your dream patterns with charts, frequency analysis, and mood tracking
              </p>
              <ul className='text-sm text-slate-600 mb-6 space-y-2'>
                <li>• Dream frequency over time</li>
                <li>• Mood and emotion patterns</li>
                <li>• Recurring themes and symbols</li>
                <li>• Color and place analysis</li>
              </ul>
              <button 
                className='btn btn-primary w-full bg-gradient-to-r from-blue-500 to-indigo-600 border-0 hover:from-blue-600 hover:to-indigo-700'
                onClick={() => setActiveView('analytics')}
              >
                View Analytics
              </button>
            </div>
            
            <div className='bg-gradient-to-br from-purple-50 to-pink-100 rounded-xl p-6 border border-purple-200 shadow-lg hover:shadow-xl transition-all'>
              <div className='text-3xl mb-4'>📝</div>
              <h2 className='text-xl font-semibold mb-4 text-slate-800'>Personal Notes</h2>
              <p className='text-slate-600 mb-4'>
                Write reflections, interpretations, and personal insights about your dreams
              </p>
              <ul className='text-sm text-slate-600 mb-6 space-y-2'>
                <li>• Dream interpretations</li>
                <li>• Personal reflections</li>
                <li>• Life connections</li>
                <li>• Growth insights</li>
              </ul>
              <button 
                className='btn btn-secondary w-full bg-gradient-to-r from-purple-500 to-pink-600 border-0 hover:from-purple-600 hover:to-pink-700'
                onClick={() => setActiveView('notes')}
              >
                Write Notes
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
} 