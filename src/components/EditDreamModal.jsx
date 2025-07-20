import { useState, useEffect } from 'react'
import { IoClose } from 'react-icons/io5'

export default function EditDreamModal({ dream, isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    mood: '',
    emotions: [],
    colors: [],
    people: [],
    places: [],
    things: [],
    role: false
  })

  // Initialize form data when dream prop changes
  useEffect(() => {
    if (dream) {
      setFormData({
        title: dream.title || '',
        description: dream.description || '',
        mood: dream.mood || '',
        emotions: dream.emotions || [],
        colors: dream.colors || [],
        people: dream.people || [],
        places: dream.places || [],
        things: dream.things || [],
        role: dream.role || false
      })
    }
  }, [dream])

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await onSave(dream.id, formData)
      onClose()
    } catch (error) {
      console.error('Error updating dream:', error)
    }
  }

  if (!isOpen || !dream) return null

  return (
    <dialog id="edit_dream_modal" className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-lg">Edit Dream</h3>
          <button 
            className="btn btn-sm btn-circle btn-ghost"
            onClick={onClose}
          >
            <IoClose />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">
              <span className="label-text">Dream Title</span>
            </label>
            <input 
              type="text" 
              className="input input-bordered w-full" 
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter dream title..."
              required
            />
          </div>
          
          <div>
            <label className="label">
              <span className="label-text">Description</span>
            </label>
            <textarea 
              className="textarea textarea-bordered w-full h-32" 
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your dream..."
            />
          </div>
          
          <div>
            <label className="label">
              <span className="label-text">Mood</span>
            </label>
            <select 
              className="select select-bordered w-full"
              value={formData.mood}
              onChange={(e) => handleInputChange('mood', e.target.value)}
            >
              <option value="">Select mood...</option>
              <option value="Peaceful">Peaceful</option>
              <option value="Exciting">Exciting</option>
              <option value="Scary">Scary</option>
              <option value="Confusing">Confusing</option>
              <option value="Happy">Happy</option>
              <option value="Sad">Sad</option>
              <option value="Wonder">Wonder</option>
              <option value="Curious">Curious</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">
                <span className="label-text">Emotions (comma-separated)</span>
              </label>
              <input 
                type="text" 
                className="input input-bordered w-full" 
                value={formData.emotions.join(', ')}
                onChange={(e) => handleArrayChange('emotions', e.target.value)}
                placeholder="joy, fear, excitement..."
              />
            </div>
            
            <div>
              <label className="label">
                <span className="label-text">Colors (comma-separated)</span>
              </label>
              <input 
                type="text" 
                className="input input-bordered w-full" 
                value={formData.colors.join(', ')}
                onChange={(e) => handleArrayChange('colors', e.target.value)}
                placeholder="blue, red, green..."
              />
            </div>
            
            <div>
              <label className="label">
                <span className="label-text">People (comma-separated)</span>
              </label>
              <input 
                type="text" 
                className="input input-bordered w-full" 
                value={formData.people.join(', ')}
                onChange={(e) => handleArrayChange('people', e.target.value)}
                placeholder="friend, stranger, family..."
              />
            </div>
            
            <div>
              <label className="label">
                <span className="label-text">Places (comma-separated)</span>
              </label>
              <input 
                type="text" 
                className="input input-bordered w-full" 
                value={formData.places.join(', ')}
                onChange={(e) => handleArrayChange('places', e.target.value)}
                placeholder="home, school, forest..."
              />
            </div>
            
            <div>
              <label className="label">
                <span className="label-text">Things (comma-separated)</span>
              </label>
              <input 
                type="text" 
                className="input input-bordered w-full" 
                value={formData.things.join(', ')}
                onChange={(e) => handleArrayChange('things', e.target.value)}
                placeholder="car, book, phone..."
              />
            </div>
            
            <div>
              <label className="label">
                <span className="label-text">Role</span>
              </label>
              <div className="flex items-center gap-4 mt-2">
                <label className="label cursor-pointer">
                  <input 
                    type="radio" 
                    name="role" 
                    className="radio radio-primary" 
                    checked={formData.role === true}
                    onChange={() => handleInputChange('role', true)}
                  />
                  <span className="label-text ml-2">Main character</span>
                </label>
                <label className="label cursor-pointer">
                  <input 
                    type="radio" 
                    name="role" 
                    className="radio radio-primary" 
                    checked={formData.role === false}
                    onChange={() => handleInputChange('role', false)}
                  />
                  <span className="label-text ml-2">Supporting</span>
                </label>
              </div>
            </div>
          </div>
          
          <div className="modal-action">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </div>
      
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  )
} 