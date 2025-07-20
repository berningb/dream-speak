
import Layout from '../../../components/Layout'

export default function Circles() {

  // Mock data for dream circles
  const dreamCircles = [
    {
      id: 1,
      name: 'Lucid Dreamers',
      description: 'A community focused on lucid dreaming techniques and experiences',
      memberCount: 156,
      category: 'Technique',
      tags: ['lucid', 'awareness', 'control'],
      isJoined: false
    },
    {
      id: 2,
      name: 'Nightmare Support',
      description: 'A safe space to share and process recurring nightmares',
      memberCount: 89,
      category: 'Support',
      tags: ['nightmares', 'healing', 'support'],
      isJoined: true
    },
    {
      id: 3,
      name: 'Dream Artists',
      description: 'Creative souls who express their dreams through art and writing',
      memberCount: 234,
      category: 'Creative',
      tags: ['art', 'creativity', 'expression'],
      isJoined: false
    },
    {
      id: 4,
      name: 'Astral Travelers',
      description: 'Exploring out-of-body experiences and astral projection',
      memberCount: 67,
      category: 'Spiritual',
      tags: ['astral', 'spiritual', 'consciousness'],
      isJoined: false
    },
    {
      id: 5,
      name: 'Dream Journaling',
      description: 'Daily dream journaling practices and techniques',
      memberCount: 312,
      category: 'Practice',
      tags: ['journaling', 'daily', 'reflection'],
      isJoined: true
    },
    {
      id: 6,
      name: 'Recurring Dreams',
      description: 'Understanding and interpreting recurring dream patterns',
      memberCount: 178,
      category: 'Analysis',
      tags: ['recurring', 'patterns', 'interpretation'],
      isJoined: false
    }
  ]

  const handleJoinCircle = (circleId) => {
    // In a real app, this would make an API call
    console.log('Joining circle:', circleId)
  }

  const handleLeaveCircle = (circleId) => {
    // In a real app, this would make an API call
    console.log('Leaving circle:', circleId)
  }

  return (
    <Layout>
      <div className='flex flex-col items-center justify-start h-screen'>
        <h1 className='text-4xl font-bold text-center py-6'>Dream Circles</h1>
        <div className='max-w-6xl mx-auto px-4 w-full'>
          <div className='bg-base-200 rounded-lg p-6 mb-6'>
            <h2 className='text-2xl font-semibold mb-4'>Join Dream Communities</h2>
            <p className='text-base-content/70 mb-4'>
              Connect with like-minded dreamers in specialized communities. Share experiences, 
              learn techniques, and explore the depths of your subconscious together.
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {dreamCircles.map((circle) => (
              <div key={circle.id} className='bg-base-200 rounded-lg p-6 border border-base-300'>
                <div className='flex justify-between items-start mb-4'>
                  <div>
                    <h3 className='text-xl font-semibold mb-2'>{circle.name}</h3>
                    <span className='badge badge-primary badge-sm'>{circle.category}</span>
                  </div>
                  <div className='text-right'>
                    <p className='text-sm text-base-content/70'>{circle.memberCount} members</p>
                  </div>
                </div>
                
                <p className='text-base-content/90 mb-4'>{circle.description}</p>
                
                <div className='flex flex-wrap gap-2 mb-4'>
                  {circle.tags.map((tag, index) => (
                    <span key={index} className='badge badge-outline badge-sm'>
                      {tag}
                    </span>
                  ))}
                </div>
                
                <button
                  className={`btn w-full ${
                    circle.isJoined 
                      ? 'btn-outline btn-error' 
                      : 'btn-primary'
                  }`}
                  onClick={() => 
                    circle.isJoined 
                      ? handleLeaveCircle(circle.id)
                      : handleJoinCircle(circle.id)
                  }
                >
                  {circle.isJoined ? 'Leave Circle' : 'Join Circle'}
                </button>
              </div>
            ))}
          </div>

          <div className='mt-8 bg-base-200 rounded-lg p-6'>
            <h3 className='text-xl font-semibold mb-4'>Create Your Own Circle</h3>
            <p className='text-base-content/70 mb-4'>
              Can&apos;t find the right community? Start your own dream circle and invite others to join.
            </p>
            <button className='btn btn-secondary'>Create New Circle</button>
          </div>
        </div>
      </div>
    </Layout>
  )
} 