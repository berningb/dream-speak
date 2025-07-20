import { IoAdd } from 'react-icons/io5'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import useDreams from '../../hooks/useDreams'
import AddDreamModal from '../../components/AddDreamModal'
import DreamCard from '../../components/DreamCard'
import { useDatabaseFavorites } from '../../hooks/useDatabaseFavorites'

const DreamItem = ({ dream, isFavorited, onFavoriteToggle }) => {
  const navigate = useNavigate()

  return (
    <DreamCard 
      dream={dream} 
      showAuthor={false}
      showFavoriteButton={true}
      isFavorited={isFavorited}
      onFavoriteToggle={onFavoriteToggle}
      onClick={() => navigate(`/dream/${dream.id}`)}
    />
  )
}

export default function MyDreams () {
  const { dreams, loading, error, fetchDreams } = useDreams()
  const { isFavorited, toggleFavorite } = useDatabaseFavorites()

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  const handleAddDream = async () => {
    await fetchDreams() // Fetch dreams after adding a new one
    // Stay on the same page when adding from My Dreams
  }

  console.log(dreams)
  return (
    <Layout>
      <AddDreamModal onAddDream={handleAddDream} />

      <div className='flex flex-col items-center justify-start min-h-screen p-6'>
        <div className='w-full max-w-7xl'>
          <div className='flex flex-col items-center mb-8'>
            <h1 className='text-4xl font-bold text-center mb-6'>My Dreams</h1>
            <button
              className='btn btn-primary btn-lg flex items-center gap-2'
              onClick={() => document.getElementById('add_dream_modal').showModal()}
            >
              <IoAdd className='text-xl' />
              Add Dream
            </button>
          </div>
          
          {dreams.length === 0 ? (
            <div className='text-center py-12'>
              <div className='text-6xl mb-4'>🌙</div>
              <h2 className='text-2xl font-semibold mb-2'>No dreams yet</h2>
              <p className='text-base-content/70 mb-6'>Start your dream journal by adding your first dream</p>
              <button
                className='btn btn-primary'
                onClick={() => document.getElementById('add_dream_modal').showModal()}
              >
                Log Your First Dream
              </button>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {dreams.map(dream => (
                <DreamItem 
                  key={dream.id} 
                  dream={dream} 
                  isFavorited={isFavorited(dream.id)}
                  onFavoriteToggle={toggleFavorite}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
} 