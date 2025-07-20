import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'

export default function Connections() {
  const [activeTab, setActiveTab] = useState('overview')
  const navigate = useNavigate()

  const handleTabClick = (tab) => {
    setActiveTab(tab)
    switch (tab) {
      case 'whispers':
        navigate('/connections/whispers')
        break
      case 'reactions':
        navigate('/connections/reactions')
        break
      case 'circles':
        navigate('/connections/circles')
        break
      default:
        break
    }
  }

  return (
    <Layout>
      <div className='flex flex-col items-center justify-start h-screen'>
        <h1 className='text-4xl font-bold text-center py-6'>Connections</h1>
        <div className='max-w-4xl mx-auto px-4 w-full'>
          {/* Navigation tabs */}
          <div className='tabs tabs-boxed justify-center mb-6'>
            <button 
              className={`tab ${activeTab === 'overview' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button 
              className={`tab ${activeTab === 'whispers' ? 'tab-active' : ''}`}
              onClick={() => handleTabClick('whispers')}
            >
              Whispers
            </button>
            <button 
              className={`tab ${activeTab === 'reactions' ? 'tab-active' : ''}`}
              onClick={() => handleTabClick('reactions')}
            >
              Reactions
            </button>
            <button 
              className={`tab ${activeTab === 'circles' ? 'tab-active' : ''}`}
              onClick={() => handleTabClick('circles')}
            >
              Dream Circles
            </button>
          </div>

          {/* Overview content */}
          {activeTab === 'overview' && (
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              <div className='bg-base-200 rounded-lg p-6'>
                <h2 className='text-xl font-semibold mb-4'>Whispers</h2>
                <p className='text-base-content/70 mb-4'>
                  Anonymous dream sharing and responses
                </p>
                <button 
                  className='btn btn-primary w-full'
                  onClick={() => handleTabClick('whispers')}
                >
                  View Whispers
                </button>
              </div>
              
              <div className='bg-base-200 rounded-lg p-6'>
                <h2 className='text-xl font-semibold mb-4'>Reactions</h2>
                <p className='text-base-content/70 mb-4'>
                  See how others respond to your shared dreams
                </p>
                <button 
                  className='btn btn-secondary w-full'
                  onClick={() => handleTabClick('reactions')}
                >
                  View Reactions
                </button>
              </div>
              
              <div className='bg-base-200 rounded-lg p-6'>
                <h2 className='text-xl font-semibold mb-4'>Dream Circles</h2>
                <p className='text-base-content/70 mb-4'>
                  Join dream sharing groups and communities
                </p>
                <button 
                  className='btn btn-accent w-full'
                  onClick={() => handleTabClick('circles')}
                >
                  Find Circles
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
} 