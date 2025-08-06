import Layout from '../../components/Layout'
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext'

export default function Home() {
  const { isAuthenticated, loginWithGoogle } = useFirebaseAuth()

  return (
    <Layout>
      <div className='flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 md:px-8 py-8'>
        <div className='text-center max-w-4xl w-full'>
          <div className='flex flex-col sm:flex-row items-center justify-center mb-6 gap-4'>
            <span className='text-6xl sm:text-8xl'>🌙</span>
            <h1 className='text-4xl sm:text-6xl font-bold'>DreamSpeak</h1>
          </div>
          <p className='text-xl sm:text-2xl mb-4 text-primary font-medium px-4'>
            Where dreams come alive through shared stories
          </p>
          <p className='text-base sm:text-lg mb-8 text-base-content/80 max-w-2xl mx-auto px-4'>
            A safe space to explore your subconscious, connect with fellow dreamers, and discover the hidden meanings 
            in your nightly adventures. Every dream has a story worth sharing. Why not share yours today?
          </p>
          <p className='text-sm mb-8 text-base-content/60 italic px-4'>
            ✨ Discover dreams, find connections, explore the subconscious together ✨
          </p>
          
          {!isAuthenticated ? (
            <div className='space-y-4 px-4'>
              <button 
                className='btn btn-primary btn-lg w-full sm:w-auto'
                onClick={loginWithGoogle}
              >
                🌟 Begin Your Dream Journey
              </button>
              <p className='text-base-content/70'>
                Join our community of dreamers and start sharing your stories
              </p>
            </div>
          ) : (
            <div className='flex flex-col sm:flex-row gap-4 sm:gap-8 justify-center items-center px-4'>
              <a href='/my-dreams' className='btn btn-primary btn-lg w-full sm:w-auto'>
                📖 My Dream Journal
              </a>
              <a href='/explore' className='btn btn-outline btn-lg w-full sm:w-auto'>
                🔍 Discover Dreams
              </a>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}