import Layout from '../../components/Layout'

export default function Reflections() {
  return (
    <Layout>
      <div className='flex flex-col items-center justify-start h-screen'>
        <h1 className='text-4xl font-bold text-center py-6'>Dream Insights</h1>
        <p className='text-slate-600 text-center mb-8 max-w-2xl'>
          Discover patterns, track your dream journey, and reflect on your experiences
        </p>
        <div className='max-w-6xl mx-auto px-4'>
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
              <a 
                href='/reflections/analytics'
                className='btn btn-primary w-full bg-gradient-to-r from-blue-500 to-indigo-600 border-0 hover:from-blue-600 hover:to-indigo-700'
              >
                View Analytics
              </a>
            </div>
            
            <div className='bg-gradient-to-br from-yellow-50 to-orange-100 rounded-xl p-6 border border-yellow-200 shadow-lg hover:shadow-xl transition-all'>
              <div className='text-3xl mb-4'>⭐📝</div>
              <h2 className='text-xl font-semibold mb-4 text-slate-800'>Favorites & Notes</h2>
              <p className='text-slate-600 mb-4'>
                View your favorite dreams and write personal notes with markdown support
              </p>
              <ul className='text-sm text-slate-600 mb-6 space-y-2'>
                <li>• Your favorite dreams</li>
                <li>• Loved dreams from others</li>
                <li>• Personal notes with markdown</li>
                <li>• Dream interpretations</li>
              </ul>
              <a 
                href='/reflections/favorites'
                className='btn btn-warning w-full bg-gradient-to-r from-yellow-500 to-orange-600 border-0 hover:from-yellow-600 hover:to-orange-700'
              >
                View Favorites & Notes
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
} 