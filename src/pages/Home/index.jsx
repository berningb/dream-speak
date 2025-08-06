import Layout from '../../components/Layout'
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext'

export default function Home() {
  const { isAuthenticated, loginWithGoogle } = useFirebaseAuth()

  return (
    <Layout>
      <div className='flex flex-col items-center justify-center min-h-screen p-6'>
        <div className='text-center max-w-4xl'>
          <div className='flex items-center justify-center mb-6'>
            <span className='text-8xl mr-4'>🌙</span>
            <h1 className='text-6xl font-bold'>DreamSpeak</h1>
          </div>
          <p className='text-2xl mb-4 text-primary font-medium'>
            Where dreams come alive through shared stories
          </p>
          <p className='text-lg mb-8 text-base-content/80 max-w-2xl mx-auto'>
            A safe space to explore your subconscious, connect with fellow dreamers, and discover the hidden meanings 
            in your nightly adventures. Every dream has a story worth sharing.
          </p>
          <p className='text-sm mb-8 text-base-content/60 italic'>
            ✨ Sweet dreams await - start sharing your journey tonight ✨
          </p>
          
          {!isAuthenticated ? (
            <div className='space-y-4'>
              <button 
                className='btn btn-primary btn-lg'
                onClick={loginWithGoogle}
              >
                🌟 Begin Your Dream Journey
              </button>
              <p className='text-base-content/70'>
                Join our community of dreamers and start sharing your stories
              </p>
            </div>
          ) : (
            <div className='flex flex-col sm:flex-row gap-8 justify-center items-center'>
              <a href='/my-dreams' className='btn btn-primary btn-lg'>
                📖 My Dream Journal
              </a>
              <a href='/explore' className='btn btn-outline btn-lg'>
                🔍 Discover Dreams
              </a>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}