import { useState } from 'react'
import { IoClose } from 'react-icons/io5'
import { createDream } from '../services/firebaseService'

function AddDreamModal ({ onAddDream }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    tags: [],
    isPublic: false,
    image: '',
    mood: '',
    emotions: [],
    colors: [],
    role: false,
    people: [],
    places: [],
    things: []
  })

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleArrayChange = (field, value) => {
    const array = value.split(',').map(item => item.trim()).filter(item => item)
    setFormData(prev => ({
      ...prev,
      [field]: array
    }))
  }

  const handleSubmit = async e => {
    e.preventDefault()

    const newDream = {
      title: formData.title,
      content: formData.description, // Firebase uses 'content' instead of 'description'
      date: new Date(formData.date).toISOString(),
      tags: formData.tags,
      isPublic: formData.isPublic,
      image: formData.image || null,
      mood: formData.mood || null,
      emotions: formData.emotions,
      colors: formData.colors,
      role: formData.role,
      people: formData.people,
      places: formData.places,
      things: formData.things
    }

    try {
      await createDream(newDream)
      // Reset form
      setFormData({
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        tags: [],
        isPublic: false,
        image: '',
        mood: '',
        emotions: [],
        colors: [],
        role: false,
        people: [],
        places: [],
        things: []
      })
      document.getElementById('add_dream_modal').close()
      onAddDream() // Call the onAddDream function after adding a new dream
    } catch (err) {
      console.error('Error adding dream:', err)
    }
  }

  const handleClose = () => {
    document.getElementById('add_dream_modal').close()
    // Call onAddDream to handle navigation if needed
    onAddDream()
  }

  return (
    <dialog id='add_dream_modal' className='modal'>
      <div className='modal-box max-w-7xl w-[95vw] max-h-[95vh] overflow-y-auto bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-200 shadow-2xl'>
        {/* Header */}
        <div className='flex items-center justify-between mb-8 pb-4 border-b border-slate-200'>
          <div>
            <h3 className='font-bold text-2xl text-slate-800 mb-1'>✨ Add a New Dream</h3>
            <p className='text-slate-600 text-sm'>Capture the magic of your dream world</p>
          </div>
          <button 
            className='btn btn-sm btn-circle btn-ghost hover:bg-slate-200 transition-colors'
            onClick={handleClose}
          >
            <IoClose className='text-xl' />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className='space-y-8'>
          {/* Basic Information Section */}
          <div className='space-y-6'>
            <h4 className='text-lg font-semibold text-slate-700 border-l-4 border-blue-500 pl-4'>Basic Information</h4>
            
            <div className='space-y-4'>
              <div>
                <label className='label'>
                  <span className='label-text font-medium text-slate-700'>Dream Title *</span>
                </label>
                <input
                  type='text'
                  className='input input-bordered w-full bg-white border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all'
                  value={formData.title}
                  onChange={e => handleInputChange('title', e.target.value)}
                  placeholder='Enter a captivating title for your dream...'
                  required
                />
              </div>
              
              <div>
                <label className='label'>
                  <span className='label-text font-medium text-slate-700'>Description</span>
                </label>
                <textarea
                  className='textarea textarea-bordered w-full h-40 bg-white border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none'
                  value={formData.description}
                  onChange={e => handleInputChange('description', e.target.value)}
                  placeholder='Describe your dream in detail... What happened? How did it feel? What did you see?'
                />
              </div>
              
              <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                <div>
                  <label className='label'>
                    <span className='label-text font-medium text-slate-700'>Date</span>
                  </label>
                  <input
                    type='date'
                    className='input input-bordered w-full bg-white border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all'
                    value={formData.date}
                    onChange={e => handleInputChange('date', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className='label'>
                    <span className='label-text font-medium text-slate-700'>Mood</span>
                  </label>
                  <select 
                    className='select select-bordered w-full bg-white border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all'
                    value={formData.mood}
                    onChange={e => handleInputChange('mood', e.target.value)}
                  >
                    <option value=''>Select the overall mood...</option>
                    <option value='Peaceful'>😌 Peaceful</option>
                    <option value='Exciting'>🎉 Exciting</option>
                    <option value='Scary'>😱 Scary</option>
                    <option value='Confusing'>🤔 Confusing</option>
                    <option value='Happy'>😊 Happy</option>
                    <option value='Sad'>😢 Sad</option>
                    <option value='Wonder'>🤩 Wonder</option>
                    <option value='Curious'>🧐 Curious</option>
                  </select>
                </div>

                <div>
                  <label className='label'>
                    <span className='label-text font-medium text-slate-700'>Image URL (optional)</span>
                  </label>
                  <input
                    type='url'
                    className='input input-bordered w-full bg-white border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all'
                    value={formData.image}
                    onChange={e => handleInputChange('image', e.target.value)}
                    placeholder='https://example.com/image.jpg'
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Dream Elements Section */}
          <div className='space-y-6'>
            <h4 className='text-lg font-semibold text-slate-700 border-l-4 border-purple-500 pl-4'>Dream Elements</h4>
            
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
              <div>
                <label className='label'>
                  <span className='label-text font-medium text-slate-700'>Emotions</span>
                  <span className='label-text-alt text-slate-500'>comma-separated</span>
                </label>
                <input
                  type='text'
                  className='input input-bordered w-full bg-white border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all'
                  value={formData.emotions.join(', ')}
                  onChange={e => handleArrayChange('emotions', e.target.value)}
                  placeholder='joy, fear, excitement, wonder...'
                />
              </div>
              
              <div>
                <label className='label'>
                  <span className='label-text font-medium text-slate-700'>Colors</span>
                  <span className='label-text-alt text-slate-500'>comma-separated</span>
                </label>
                <input
                  type='text'
                  className='input input-bordered w-full bg-white border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all'
                  value={formData.colors.join(', ')}
                  onChange={e => handleArrayChange('colors', e.target.value)}
                  placeholder='blue, red, golden, purple...'
                />
              </div>
              
              <div>
                <label className='label'>
                  <span className='label-text font-medium text-slate-700'>People</span>
                  <span className='label-text-alt text-slate-500'>comma-separated</span>
                </label>
                <input
                  type='text'
                  className='input input-bordered w-full bg-white border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all'
                  value={formData.people.join(', ')}
                  onChange={e => handleArrayChange('people', e.target.value)}
                  placeholder='friend, stranger, family, yourself...'
                />
              </div>
              
              <div>
                <label className='label'>
                  <span className='label-text font-medium text-slate-700'>Places</span>
                  <span className='label-text-alt text-slate-500'>comma-separated</span>
                </label>
                <input
                  type='text'
                  className='input input-bordered w-full bg-white border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all'
                  value={formData.places.join(', ')}
                  onChange={e => handleArrayChange('places', e.target.value)}
                  placeholder='home, forest, school, space...'
                />
              </div>
              
              <div>
                <label className='label'>
                  <span className='label-text font-medium text-slate-700'>Things</span>
                  <span className='label-text-alt text-slate-500'>comma-separated</span>
                </label>
                <input
                  type='text'
                  className='input input-bordered w-full bg-white border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all'
                  value={formData.things.join(', ')}
                  onChange={e => handleArrayChange('things', e.target.value)}
                  placeholder='car, book, phone, magical object...'
                />
              </div>

              <div>
                <label className='label'>
                  <span className='label-text font-medium text-slate-700'>Tags</span>
                  <span className='label-text-alt text-slate-500'>comma-separated</span>
                </label>
                <input
                  type='text'
                  className='input input-bordered w-full bg-white border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all'
                  value={formData.tags.join(', ')}
                  onChange={e => handleArrayChange('tags', e.target.value)}
                  placeholder='fantasy, adventure, lucid, recurring...'
                />
              </div>
              
              <div>
                <label className='label'>
                  <span className='label-text font-medium text-slate-700'>Your Role</span>
                </label>
                <div className='flex items-center gap-6 mt-3 p-4 bg-slate-50 rounded-lg border border-slate-200'>
                  <label className='label cursor-pointer flex items-center gap-3'>
                    <input 
                      type='radio' 
                      name='role' 
                      className='radio radio-primary' 
                      checked={formData.role === true}
                      onChange={() => handleInputChange('role', true)}
                    />
                    <span className='label-text font-medium'>Main character</span>
                  </label>
                  <label className='label cursor-pointer flex items-center gap-3'>
                    <input 
                      type='radio' 
                      name='role' 
                      className='radio radio-primary' 
                      checked={formData.role === false}
                      onChange={() => handleInputChange('role', false)}
                    />
                    <span className='label-text font-medium'>Supporting role</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy Section */}
          <div className='space-y-4'>
            <h4 className='text-lg font-semibold text-slate-700 border-l-4 border-green-500 pl-4'>Privacy Settings</h4>
            
            <div className='flex items-center gap-4 p-4 bg-green-50 rounded-lg border border-green-200'>
              <input
                type='checkbox'
                className='checkbox checkbox-primary'
                checked={formData.isPublic}
                onChange={e => handleInputChange('isPublic', e.target.checked)}
              />
              <div>
                <span className='label-text font-medium text-slate-700'>Make this dream public</span>
                <p className='text-sm text-slate-600 mt-1'>Other users can discover and interact with your dream</p>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className='flex items-center justify-end gap-4 pt-6 border-t border-slate-200'>
            <button 
              type='button' 
              className='btn btn-outline btn-lg px-8 hover:bg-slate-100 transition-colors'
              onClick={handleClose}
            >
              Cancel
            </button>
            <button 
              type='submit' 
              className='btn btn-primary btn-lg px-8 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 shadow-lg hover:shadow-xl transition-all'
            >
              ✨ Save Dream
            </button>
          </div>
        </form>
      </div>
      
      <form method='dialog' className='modal-backdrop'>
        <button onClick={handleClose}>close</button>
      </form>
    </dialog>
  )
}

export default AddDreamModal
