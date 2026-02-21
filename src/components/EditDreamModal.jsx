import { useState, useEffect } from 'react'
import { IoClose } from 'react-icons/io5'
import { generateDreamImage } from '../services/imageService'

export default function EditDreamModal({ dream, isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    mood: '',
    emotions: [],
    colors: [],
    people: [],
    places: [],
    things: [],
    role: false
  })
  const [imageGenerating, setImageGenerating] = useState(false)
  const [imageError, setImageError] = useState(null)
  const [saving, setSaving] = useState(false)

  // Initialize form data when dream prop changes
  useEffect(() => {
    if (dream) {
      setFormData({
        title: dream.title || '',
        description: dream.description || dream.content || '',
        image: dream.image || '',
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

  const handleGenerateImage = async () => {
    const prompt = formData.description || formData.title || 'A dream scene'
    setImageGenerating(true)
    setImageError(null)
    try {
      const imageUrl = await generateDreamImage(prompt)
      if (imageUrl) handleInputChange('image', imageUrl)
    } catch (err) {
      setImageError(err.message)
    } finally {
      setImageGenerating(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave(dream.id, formData)
      onClose()
    } catch (error) {
      console.error('Error updating dream:', error)
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen || !dream) return null

  return (
    <dialog id="edit_dream_modal" className="modal modal-open">
      <div className="modal-box max-w-2xl p-0 overflow-hidden shadow-2xl border border-base-300/50">
        <div className="px-8 pt-8 pb-6 bg-gradient-to-b from-base-200/50 to-transparent border-b border-base-300/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">✨</span>
              <h3 className="text-xl font-semibold tracking-tight">Edit Dream</h3>
            </div>
            <button 
              className="btn btn-ghost btn-sm btn-circle hover:bg-base-300/50 transition-colors"
              onClick={onClose}
              aria-label="Close"
            >
              <IoClose className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-6 overflow-y-auto max-h-[70vh]">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-base-content/80 mb-1.5">Dream Title</label>
              <input 
                type="text" 
                className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all" 
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Give your dream a name..."
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-base-content/80 mb-1.5">Description</label>
              <textarea 
                className="textarea textarea-bordered w-full h-28 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all" 
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe what you experienced..."
              />
            </div>

            <div className="rounded-xl p-5 bg-base-200/40 border border-base-300/40">
              <label className="block text-sm font-medium text-base-content/80 mb-3">Dream Image</label>
              {formData.image ? (
                <div>
                  <img
                    src={formData.image}
                    alt="Dream"
                    className="rounded-lg max-h-64 w-full object-cover object-center"
                  />
                  <button
                    type="button"
                    className="mt-3 text-sm text-base-content/60 hover:text-error transition-colors"
                    onClick={() => handleInputChange('image', '')}
                  >
                    Remove image
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="w-full py-4 px-4 rounded-lg border-2 border-dashed border-base-300 hover:border-primary/40 hover:bg-primary/5 transition-all flex items-center justify-center gap-2 text-base-content/70 hover:text-primary"
                  onClick={handleGenerateImage}
                  disabled={imageGenerating}
                >
                  {imageGenerating ? (
                    <><span className="loading loading-spinner loading-sm" /> Generating image...</>
                  ) : (
                    <>🖼️ Generate image with AI</>
                  )}
                </button>
              )}
              {imageError && (
                <p className="text-error text-sm mt-2">{imageError}</p>
              )}
            </div>
            
            <div className="flex flex-wrap gap-3 items-center">
              <label className="text-sm font-medium text-base-content/80">Mood</label>
              <select 
                className="select select-bordered flex-1 min-w-[140px] focus:outline-none focus:ring-2 focus:ring-primary/30"
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
              {formData.mood && (
                <span className="badge badge-outline badge-sm text-primary border-primary/40">{formData.mood}</span>
              )}
            </div>

            <div className="pt-2 border-t border-base-300/40">
              <h4 className="text-sm font-medium text-base-content/60 uppercase tracking-wider mb-4">Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-base-content/70 mb-1">Emotions</label>
                  <input 
                    type="text" 
                    className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-primary/30" 
                    value={formData.emotions.join(', ')}
                    onChange={(e) => handleArrayChange('emotions', e.target.value)}
                    placeholder="joy, fear, excitement"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-base-content/70 mb-1">Colors</label>
                  <input 
                    type="text" 
                    className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-primary/30" 
                    value={formData.colors.join(', ')}
                    onChange={(e) => handleArrayChange('colors', e.target.value)}
                    placeholder="blue, red, green"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-base-content/70 mb-1">People</label>
                  <input 
                    type="text" 
                    className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-primary/30" 
                    value={formData.people.join(', ')}
                    onChange={(e) => handleArrayChange('people', e.target.value)}
                    placeholder="friend, stranger, family"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-base-content/70 mb-1">Places</label>
                  <input 
                    type="text" 
                    className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-primary/30" 
                    value={formData.places.join(', ')}
                    onChange={(e) => handleArrayChange('places', e.target.value)}
                    placeholder="home, school, forest"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-base-content/70 mb-1">Things</label>
                  <input 
                    type="text" 
                    className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-primary/30" 
                    value={formData.things.join(', ')}
                    onChange={(e) => handleArrayChange('things', e.target.value)}
                    placeholder="car, book, phone"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-base-content/70 mb-2">Your role</label>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="radio" 
                        name="role" 
                        className="radio radio-primary" 
                        checked={formData.role === true}
                        onChange={() => handleInputChange('role', true)}
                      />
                      <span className="text-sm group-hover:text-primary transition-colors">Main character</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="radio" 
                        name="role" 
                        className="radio radio-primary" 
                        checked={formData.role === false}
                        onChange={() => handleInputChange('role', false)}
                      />
                      <span className="text-sm group-hover:text-primary transition-colors">Supporting</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-base-300/40">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary min-w-[120px]" disabled={saving}>
              {saving ? (
                <>
                  <span className="loading loading-spinner loading-sm" />
                  Saving
                </>
              ) : (
                'Save Changes'
              )}
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