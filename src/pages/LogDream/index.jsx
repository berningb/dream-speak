import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import AddDreamModal from '../../components/AddDreamModal'
import useDreams from '../../hooks/useDreams'

export default function LogDream() {
  const navigate = useNavigate()
  const { fetchDreams } = useDreams()

  useEffect(() => {
    // Open the modal automatically when the page loads
    document.getElementById('add_dream_modal').showModal()
  }, [])

  const handleAddDream = async () => {
    await fetchDreams() // Fetch dreams after adding a new one
    // Navigate back to My Dreams after successful creation
    navigate('/my-dreams')
  }

  return (
    <Layout>
      <AddDreamModal onAddDream={handleAddDream} />
      
      <div className='flex flex-col items-center justify-start h-screen'>
        <h1 className='text-4xl font-bold text-center py-6'>Log a Dream</h1>
        <div className='max-w-2xl mx-auto px-4 w-full'>
          <div className='bg-base-200 rounded-lg p-6 text-center'>
            <div className='text-6xl mb-4'>🌙</div>
            <h2 className='text-2xl font-semibold mb-4'>Create Your Dream Entry</h2>
                          <p className='text-base-content/70 mb-6'>
                The dream creation form should have opened automatically. 
                If it didn&apos;t, click the button below to start logging your dream.
              </p>
            <button
              className='btn btn-primary btn-lg'
              onClick={() => document.getElementById('add_dream_modal').showModal()}
            >
              Open Dream Form
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
} 