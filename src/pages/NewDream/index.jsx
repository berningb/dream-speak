import { useCallback, useState } from 'react'
import Layout from '../../components/Layout'
import AddDreamModal from '../../components/AddDreamModal'
import DreamCard from '../../components/DreamCard'

export default function NewDream () {
  const [selectedType, setSelectedType] = useState('sweet') // sweet | lucid | nightmare
  const openAddModal = useCallback(() => {
    document.getElementById('add_dream_modal')?.showModal()
  }, [])

  const handleAfterAdd = useCallback(() => {
    // After finishing or closing, go back to My Dreams
    window.location.href = '/my-dreams'
  }, [])

  const cards = [
    { 
      id: 'good', 
      title: 'Sweet Dream', 
      type: 'sweet', 
      content: 'A calm, peaceful experience where everything feels right. Perfect for finding comfort.',
      createdAt: new Date()
    },
    { 
      id: 'bad', 
      title: 'Wild Nightmare', 
      type: 'nightmare', 
      content: 'Intense and sometimes frightening. Great for exploring deep-seated fears.',
      createdAt: new Date()
    },
    { 
      id: 'lucid', 
      title: 'Lucid Adventure', 
      type: 'lucid', 
      content: 'A conscious journey where you take the lead. Document your awareness.',
      createdAt: new Date()
    }
  ]

  return (
    <Layout>
      <AddDreamModal onAddDream={handleAfterAdd} initialDreamType={selectedType} />
      <div className='flex flex-col items-center justify-start min-h-screen p-6'>
        <div className='w-full max-w-6xl'>
          <div className='flex items-center justify-between mb-8'>
            <div>
              <h1 className='text-4xl font-bold mb-2'>Start a New Dream</h1>
              <p className='text-base-content/60'>Pick a vibe to inspire your entry. You can change details after.</p>
            </div>
            <a href='/my-dreams' className='btn btn-ghost'>Back to My Dreams</a>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            {cards.map((dream) => (
              <div 
                key={dream.id} 
                className="transform transition-transform hover:scale-[1.02]"
              >
                <DreamCard 
                  dream={dream} 
                  showAuthor={false}
                  showLikeButton={false}
                  onClick={(selectedDream) => {
                    setSelectedType(selectedDream.type)
                    openAddModal()
                  }}
                />
              </div>
            ))}
          </div>

          <div className='mt-12 flex items-center justify-center gap-4'>
            <button className='btn btn-primary btn-lg' onClick={() => { setSelectedType('sweet'); openAddModal(); }}>
              Just start writing
            </button>
            <a href='/my-dreams' className='btn btn-ghost btn-lg'>Cancel</a>
          </div>
        </div>
      </div>
    </Layout>
  )
}


