import Layout from '../../components/Layout'
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext'

export default function Home() {
  const { isAuthenticated, loginWithGoogle } = useFirebaseAuth()

  return (
    <Layout>
      <div className='flex flex-col items-center justify-center min-h-screen p-6'>
        <div className='text-center max-w-4xl'>
          <h1 className='text-6xl font-bold mb-8'>Dream Speak</h1>
          <p className='text-xl mb-8'>
            Share your dreams, connect with others, and explore the world of dreams together.
          </p>
          
          {!isAuthenticated ? (
            <div className='space-y-4'>
              <button 
                className='btn btn-primary btn-lg'
                onClick={loginWithGoogle}
              >
                Get Started
              </button>
              <p className='text-base-content/70'>
                Sign in to start sharing your dreams
              </p>
            </div>
          ) : (
            <div className='flex flex-col sm:flex-row gap-8 justify-center items-center'>
              <a href='/my-dreams' className='btn btn-primary btn-lg'>
                View My Dreams
              </a>
              <a href='/explore' className='btn btn-outline btn-lg'>
                Explore Dreams
              </a>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}