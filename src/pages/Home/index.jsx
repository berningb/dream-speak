import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import Layout from '../../components/Layout'

export default function Home() {
  const { isAuthenticated, loginWithRedirect } = useAuth0()
  const navigate = useNavigate()
  const [showMessage, setShowMessage] = useState(false)

  useEffect(() => {
    // Fade in the message after a short delay
    const timer = setTimeout(() => setShowMessage(true), 200)
    return () => clearTimeout(timer)
  }, [])

  return (
    <Layout>
      {/* Removed dreamy background shapes for a cleaner look */}
      <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden">
        {/* Main message */}
        <div className={`z-10 flex flex-col items-center transition-opacity duration-1000 ${showMessage ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h1 className="text-5xl md:text-6xl font-extrabold text-center text-primary drop-shadow-lg mb-6 tracking-tight">
            DreamSpeak
          </h1>
          <p className="text-xl md:text-2xl text-center text-secondary max-w-2xl mb-8 font-medium">
            Where dreams become stories, and everyone has a voice. <span className="text-accent">Log, share, and explore the world of dreams.</span>
          </p>
          <div className="flex flex-col items-center gap-4">
            {isAuthenticated ? (
              <button
                className="btn btn-primary btn-lg px-8 py-3 text-lg shadow-lg hover:scale-105 transition-transform"
                onClick={() => navigate('/explore')}
              >
                Explore Dreams
              </button>
            ) : (
              <button
                className="btn btn-accent btn-lg px-8 py-3 text-lg shadow-lg hover:scale-105 transition-transform"
                onClick={() => loginWithRedirect()}
              >
                Get Started
              </button>
            )}
          </div>
        </div>
        {/* Scroll down indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center opacity-70 animate-bounce">
          <span className="text-2xl text-primary">↓</span>
          <span className="text-xs text-accent mt-1">Scroll to explore</span>
        </div>
      </div>
    </Layout>
  )
}