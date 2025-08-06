import Layout from '../../components/Layout'

export default function Connections() {
  return (
    <Layout>
      <div className='flex flex-col items-center justify-center min-h-screen p-6'>
        <div className='text-center max-w-2xl'>
          <div className='mb-8'>
            <span className='text-8xl mb-4 block'>🌙</span>
            <h1 className='text-4xl font-bold mb-4'>Connections</h1>
          </div>
          
          <div className='bg-base-200 rounded-lg p-8 mb-8'>
            <h2 className='text-2xl font-semibold mb-4 text-base-content/80'>Coming Soon</h2>
            <p className='text-lg mb-6 text-base-content/70'>
              We&apos;re building amazing ways for dreamers to connect and share experiences.
            </p>
            
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6'>
              <div className='text-center p-4 rounded-lg bg-base-300'>
                <div className='text-3xl mb-2'>💬</div>
                <h3 className='font-semibold mb-2'>Whispers</h3>
                <p className='text-sm text-base-content/60'>Anonymous dream sharing</p>
              </div>
              
              <div className='text-center p-4 rounded-lg bg-base-300'>
                <div className='text-3xl mb-2'>❤️</div>
                <h3 className='font-semibold mb-2'>Reactions</h3>
                <p className='text-sm text-base-content/60'>See responses to your dreams</p>
              </div>
              
              <div className='text-center p-4 rounded-lg bg-base-300'>
                <div className='text-3xl mb-2'>👥</div>
                <h3 className='font-semibold mb-2'>Dream Circles</h3>
                <p className='text-sm text-base-content/60'>Join dream communities</p>
              </div>
            </div>
            
            <p className='text-base-content/60 italic'>
              Stay tuned for these exciting features that will bring dreamers together!
            </p>
          </div>
          
          <button 
            onClick={() => window.history.back()}
            className='btn btn-primary'
          >
            ← Go Back
          </button>
        </div>
      </div>
    </Layout>
  )
} 