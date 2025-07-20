import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { IoArrowBack, IoPencil, IoTrash } from 'react-icons/io5'
import Layout from '../../components/Layout'
import useDreams from '../../hooks/useDreams'
import EditDreamModal from '../../components/EditDreamModal'
import { formatFullDate } from '../../utils'

export default function Dream() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { dreams, loading, error, updateDream, deleteDream } = useDreams()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  
  // Find the specific dream by ID
  const dream = dreams?.find(d => d.id === id)

  const handleEditDream = async (dreamId, updatedData) => {
    try {
      await updateDream(dreamId, updatedData)
    } catch (error) {
      console.error('Error updating dream:', error)
      throw error
    }
  }

  const handleDeleteDream = async () => {
    try {
      await deleteDream(dream.id)
      navigate('/my-dreams')
    } catch (error) {
      console.error('Error deleting dream:', error)
    }
  }
  
  if (loading) return (
    <Layout>
      <div className='flex items-center justify-center min-h-screen'>
        <div className='loading loading-spinner loading-lg'></div>
      </div>
    </Layout>
  )
  
  if (error) return (
    <Layout>
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <div className='text-6xl mb-4'>❌</div>
          <h2 className='text-2xl font-semibold mb-2'>Error Loading Dream</h2>
          <p className='text-base-content/70'>{error}</p>
        </div>
      </div>
    </Layout>
  )
  
  if (!dream) return (
    <Layout>
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <div className='text-6xl mb-4'>🔍</div>
          <h2 className='text-2xl font-semibold mb-2'>Dream Not Found</h2>
          <p className='text-base-content/70 mb-6'>The dream you&apos;re looking for doesn&apos;t exist</p>
          <button className='btn btn-primary' onClick={() => navigate('/my-dreams')}>
            Back to My Dreams
          </button>
        </div>
      </div>
    </Layout>
  )

  return (
    <Layout>
      <div className='min-h-screen p-6'>
        <div className='max-w-4xl mx-auto'>
          {/* Header */}
          <div className='flex items-center justify-between mb-8'>
            <button 
              className='btn btn-ghost btn-sm flex items-center gap-2'
              onClick={() => navigate('/my-dreams')}
            >
              <IoArrowBack />
              Back to Dreams
            </button>
            
            <div className='flex gap-2'>
              <button 
                className='btn btn-outline btn-sm flex items-center gap-2'
                onClick={() => setIsEditModalOpen(true)}
              >
                <IoPencil />
                Edit
              </button>
              <button 
                className='btn btn-error btn-sm flex items-center gap-2'
                onClick={() => setIsDeleteModalOpen(true)}
              >
                <IoTrash />
                Delete
              </button>
            </div>
          </div>

          {/* Dream Content */}
          <div className='bg-base-200 rounded-lg p-8 shadow-lg'>
            <div className='mb-8'>
              <h1 className='text-4xl font-bold mb-4 text-primary'>{dream.title}</h1>
              
              <div className='flex flex-wrap gap-4 mb-6'>
                {dream.mood && (
                  <div className='flex items-center gap-2'>
                    <span className='text-sm font-medium text-base-content/70'>Mood:</span>
                    <span className='badge badge-primary badge-lg'>{dream.mood}</span>
                  </div>
                )}
                
                {dream.role !== undefined && (
                  <div className='flex items-center gap-2'>
                    <span className='text-sm font-medium text-base-content/70'>Role:</span>
                    <span className={`badge badge-lg ${dream.role ? 'badge-secondary' : 'badge-outline'}`}>
                      {dream.role ? 'Main character' : 'Supporting character'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Dream Details */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
              {/* Left Column */}
              <div className='space-y-6'>
                {dream.emotions && dream.emotions.length > 0 && (
                  <div>
                    <h3 className='text-lg font-semibold mb-3 flex items-center gap-2'>
                      <span className='text-2xl'>😊</span>
                      Emotions
                    </h3>
                    <div className='flex flex-wrap gap-2'>
                      {dream.emotions.map((emotion, index) => (
                        <span key={index} className='badge badge-accent badge-lg'>{emotion}</span>
                      ))}
                    </div>
                  </div>
                )}
                
                {dream.colors && dream.colors.length > 0 && (
                  <div>
                    <h3 className='text-lg font-semibold mb-3 flex items-center gap-2'>
                      <span className='text-2xl'>🎨</span>
                      Colors
                    </h3>
                    <div className='flex flex-wrap gap-2'>
                      {dream.colors.map((color, index) => (
                        <span key={index} className='badge badge-outline badge-lg'>{color}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className='space-y-6'>
                {dream.people && dream.people.length > 0 && (
                  <div>
                    <h3 className='text-lg font-semibold mb-3 flex items-center gap-2'>
                      <span className='text-2xl'>👥</span>
                      People
                    </h3>
                    <div className='flex flex-wrap gap-2'>
                      {dream.people.map((person, index) => (
                        <span key={index} className='badge badge-info badge-lg'>{person}</span>
                      ))}
                    </div>
                  </div>
                )}
                
                {dream.places && dream.places.length > 0 && (
                  <div>
                    <h3 className='text-lg font-semibold mb-3 flex items-center gap-2'>
                      <span className='text-2xl'>🏛️</span>
                      Places
                    </h3>
                    <div className='flex flex-wrap gap-2'>
                      {dream.places.map((place, index) => (
                        <span key={index} className='badge badge-success badge-lg'>{place}</span>
                      ))}
                    </div>
                  </div>
                )}
                
                {dream.things && dream.things.length > 0 && (
                  <div>
                    <h3 className='text-lg font-semibold mb-3 flex items-center gap-2'>
                      <span className='text-2xl'>🔮</span>
                      Things
                    </h3>
                    <div className='flex flex-wrap gap-2'>
                      {dream.things.map((thing, index) => (
                        <span key={index} className='badge badge-warning badge-lg'>{thing}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Dream Description */}
            {dream.description && (
              <div className='mt-8 pt-8 border-t border-base-300'>
                <h3 className='text-lg font-semibold mb-4 flex items-center gap-2'>
                  <span className='text-2xl'>📝</span>
                  Dream Description
                </h3>
                <div className='bg-base-100 rounded-lg p-6'>
                  <p className='text-base leading-relaxed'>{dream.description}</p>
                </div>
              </div>
            )}

            {/* Dream Date */}
            {dream.createdAt && (
              <div className='mt-6 text-center'>
                <span className='text-sm text-base-content/50'>
                  Dream recorded on {formatFullDate(dream.createdAt)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <EditDreamModal
        dream={dream}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleEditDream}
      />

      {/* Delete Confirmation Modal */}
      <dialog id="delete_dream_modal" className={`modal ${isDeleteModalOpen ? 'modal-open' : ''}`}>
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">Delete Dream</h3>
          <p className="mb-6">Are you sure you want to delete &quot;{dream?.title}&quot;? This action cannot be undone.</p>
          <div className="modal-action">
            <button 
              className="btn btn-outline" 
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </button>
            <button 
              className="btn btn-error" 
              onClick={handleDeleteDream}
            >
              Delete Dream
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={() => setIsDeleteModalOpen(false)}>close</button>
        </form>
      </dialog>
    </Layout>
  )
} 