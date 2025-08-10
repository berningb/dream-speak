import { useState, useEffect } from 'react'
import { IoClose } from 'react-icons/io5'
import { createDream } from '../services/firebaseService'

function AddDreamModal ({ onAddDream, initialDreamType = 'normal' }) {
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
    things: [],
    type: initialDreamType,
    // Normal-specific
    sereneElements: [],
    positiveSymbols: [],
    // Lucid-specific
    realityChecks: [],
    controlLevel: 'Medium', // Low | Medium | High
    techniques: [],
    clarity: '3', // 1-5
    // Nightmare-specific
    intensity: 5,
    trigger: '',
    resolution: '',
    wokeUp: false
  })

  // Keep the form type in sync and add helpful defaults
  useEffect(() => {
    setFormData(prev => {
      const tagByType = { normal: 'normal', lucid: 'lucid', nightmare: 'nightmare' }
      const moodByType = { normal: 'Peaceful', lucid: 'Curious', nightmare: 'Scary' }
      const nextTags = Array.from(new Set([...(prev.tags || []), tagByType[initialDreamType]]))
      return {
        ...prev,
        type: initialDreamType,
        tags: nextTags,
        mood: prev.mood || moodByType[initialDreamType]
      }
    })
  }, [initialDreamType])

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
      things: formData.things,
       type: formData.type,
      // Normal-specific
      sereneElements: formData.sereneElements,
      positiveSymbols: formData.positiveSymbols,
      // Lucid-specific
      realityChecks: formData.realityChecks,
      controlLevel: formData.controlLevel,
      techniques: formData.techniques,
      clarity: formData.clarity,
      // Nightmare-specific
      intensity: formData.intensity,
      trigger: formData.trigger,
      resolution: formData.resolution,
      wokeUp: formData.wokeUp
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
        things: [],
         type: initialDreamType,
        sereneElements: [],
        positiveSymbols: [],
        realityChecks: [],
        controlLevel: 'Medium',
        techniques: [],
        clarity: '3',
        intensity: 5,
        trigger: '',
        resolution: '',
        wokeUp: false
      })
      document.getElementById('add_dream_modal').close()
      onAddDream() // Call the onAddDream function after adding a new dream
    } catch (err) {
      console.error('Error adding dream:', err)
    }
  }

  const handleClose = () => {
    document.getElementById('add_dream_modal').close()
  }

  // Theming helpers
  const isNormal = formData.type === 'sweet'
  const isLucid = formData.type === 'lucid'
  const isNightmare = formData.type === 'nightmare'

  // Legacy class names kept for minimal edits; values no longer used for background
  const headerBorder = isNormal ? 'border-blue-500' : isLucid ? 'border-emerald-500' : 'border-violet-500'
  const elementsBorder = isNormal ? 'border-sky-500' : isLucid ? 'border-emerald-500' : 'border-violet-500'
  const submitBtn = isNormal
    ? 'from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700'
    : isLucid
    ? 'from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700'
    : 'from-violet-500 to-fuchsia-600 hover:from-violet-600 hover:to-fuchsia-700'

  const sectionIcon = '✦'
  const neutralIcon = '✦'
  const typeOverlay = isLucid
    ? 'from-emerald-400/15 to-green-400/5'
    : isNightmare
    ? 'from-violet-400/15 to-fuchsia-400/5'
    : 'from-sky-400/15 to-blue-400/5'

  return (
    <dialog id='add_dream_modal' className='modal'>
      <div className={`modal-box max-w-7xl w-[95vw] p-0 relative border border-slate-200 shadow-2xl bg-transparent`} style={{ padding: 0 }}> 
        <div className='bg-gradient-to-br from-slate-800 to-slate-900'>
          <div className={`bg-gradient-to-br ${typeOverlay} max-h-[95vh] overflow-y-auto`}> 
            <div className='p-4 text-white'>
        {/* Header */}
        <div className='flex items-center justify-between mb-4 pb-3 border-b border-slate-200'>
          <div>
            <h3 className='font-bold text-2xl text-white mb-1'>✨ Add a New Dream</h3>
            <p className='text-slate-300 text-sm'>Capture the magic of your dream world</p>
            
          </div>
          <button 
            className='btn btn-sm btn-circle btn-ghost hover:bg-slate-200 transition-colors'
            onClick={handleClose}
          >
            <IoClose className='text-xl' />
          </button>
            </div>
        
        <form onSubmit={handleSubmit} className='space-y-6 px-4 pb-4 text-white'>
          {/* Basic Information Section */}
          <div className='space-y-6'>
            <h4 className='text-lg font-semibold text-white flex items-center gap-2'>
              <span className='text-xl'>{sectionIcon}</span>
              Basic Information
            </h4>
            <hr className='border-slate-700' />
            
            <div className='space-y-4'>
              <div>
                <label className='label'>
                  <span className='label-text font-medium text-white'>Dream Title *</span>
                </label>
                <input
                  type='text'
                   className={`input input-bordered w-full bg-white border-slate-300 focus:ring-2 transition-all ${isNormal ? 'focus:border-sky-500 focus:ring-sky-200' : isLucid ? 'focus:border-emerald-500 focus:ring-emerald-200' : 'focus:border-violet-500 focus:ring-violet-200'}`}
                  value={formData.title}
                  onChange={e => handleInputChange('title', e.target.value)}
                  placeholder='Enter a captivating title for your dream...'
                  required
                />
              </div>
              
              <div>
                <label className='label'>
                  <span className='label-text font-medium text-white'>Description</span>
                </label>
                <textarea
                  className={`textarea textarea-bordered w-full h-40 bg-white border-slate-300 focus:ring-2 transition-all resize-none ${isNormal ? 'focus:border-sky-500 focus:ring-sky-200' : isLucid ? 'focus:border-emerald-500 focus:ring-emerald-200' : 'focus:border-violet-500 focus:ring-violet-200'}`}
                  value={formData.description}
                  onChange={e => handleInputChange('description', e.target.value)}
                  placeholder='Describe your dream in detail... What happened? How did it feel? What did you see?'
                />
              </div>
              
              <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                <div>
                  <label className='label'>
                    <span className='label-text font-medium text-white'>Date</span>
                  </label>
                  <input
                    type='date'
                   className={`input input-bordered w-full bg-white border-slate-300 focus:ring-2 transition-all ${isNormal ? 'focus:border-sky-500 focus:ring-sky-200' : isLucid ? 'focus:border-emerald-500 focus:ring-emerald-200' : 'focus:border-violet-500 focus:ring-violet-200'}`}
                    value={formData.date}
                    onChange={e => handleInputChange('date', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className='label'>
                    <span className='label-text font-medium text-white'>Mood</span>
                  </label>
                  <select 
                   className={`select select-bordered w-full bg-white border-slate-300 focus:ring-2 transition-all ${isNormal ? 'focus:border-sky-500 focus:ring-sky-200' : isLucid ? 'focus:border-emerald-500 focus:ring-emerald-200' : 'focus:border-violet-500 focus:ring-violet-200'}`}
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
                    <span className='label-text font-medium text-white'>Image URL (optional)</span>
                  </label>
                  <input
                    type='url'
                   className={`input input-bordered w-full bg-white border-slate-300 focus:ring-2 transition-all ${isNormal ? 'focus:border-sky-500 focus:ring-sky-200' : isLucid ? 'focus:border-emerald-500 focus:ring-emerald-200' : 'focus:border-violet-500 focus:ring-violet-200'}`}
                    value={formData.image}
                    onChange={e => handleInputChange('image', e.target.value)}
                    placeholder='https://example.com/image.jpg'
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Dream Details (Type-specific) */}
          {isLucid && (
            <div className='space-y-6'>
              <h4 className='text-lg font-semibold text-white flex items-center gap-2'>
                <span className='text-xl'>{sectionIcon}</span>
                Lucid Details
              </h4>
              <hr className='border-slate-700' />
              <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                <div>
                  <label className='label'>
                    <span className='label-text font-medium text-white'>Reality Checks</span>
                    <span className='label-text-alt text-slate-300'>comma-separated</span>
                  </label>
                  <input
                    type='text'
                    className={`input input-bordered w-full bg-white border-slate-300 focus:ring-2 transition-all ${isLucid ? 'focus:border-emerald-500 focus:ring-emerald-200' : ''}`}
                    value={formData.realityChecks.join(', ')}
                    onChange={e => handleArrayChange('realityChecks', e.target.value)}
                    placeholder='finger through palm, clock check, breathing...'
                  />
                </div>
                <div>
                  <label className='label'>
                    <span className='label-text font-medium text-white'>Control Level</span>
                  </label>
                  <select
                    className={`select select-bordered w-full bg-white border-slate-300 focus:ring-2 transition-all ${isLucid ? 'focus:border-emerald-500 focus:ring-emerald-200' : ''}`}
                    value={formData.controlLevel}
                    onChange={e => handleInputChange('controlLevel', e.target.value)}
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
                <div>
                  <label className='label'>
                    <span className='label-text font-medium text-white'>Techniques Used</span>
                    <span className='label-text-alt text-slate-300'>comma-separated</span>
                  </label>
                  <input
                    type='text'
                    className={`input input-bordered w-full bg-white border-slate-300 focus:ring-2 transition-all ${isLucid ? 'focus:border-emerald-500 focus:ring-emerald-200' : ''}`}
                    value={formData.techniques.join(', ')}
                    onChange={e => handleArrayChange('techniques', e.target.value)}
                    placeholder='WILD, MILD, reality checks...'
                  />
                </div>
                <div>
                  <label className='label'>
                    <span className='label-text font-medium text-slate-700'>Clarity</span>
                  </label>
                  <input
                    type='range'
                    min='1'
                    max='5'
                    value={formData.clarity}
                    onChange={e => handleInputChange('clarity', e.target.value)}
                    className='range range-emerald'
                  />
                  <div className='w-full flex justify-between text-xs opacity-60 px-1'>
                    <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isNightmare && (
            <div className='space-y-6'>
              <h4 className='text-lg font-semibold text-white flex items-center gap-2'>
                <span className='text-xl'>{sectionIcon}</span>
                Nightmare Details
              </h4>
              <hr className='border-slate-700' />
              <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                <div>
                  <label className='label'>
                    <span className='label-text font-medium text-white'>Intensity</span>
                  </label>
                  <input
                    type='range'
                    min='1'
                    max='10'
                    value={formData.intensity}
                    onChange={e => handleInputChange('intensity', Number(e.target.value))}
                    className='range range-violet'
                  />
                  <div className='w-full flex justify-between text-xs opacity-60 px-1'>
                    <span>1</span><span>5</span><span>10</span>
                  </div>
                </div>
                <div>
                  <label className='label'>
                    <span className='label-text font-medium text-white'>Main Trigger</span>
                  </label>
                  <input
                    type='text'
                    className='input input-bordered w-full bg-white border-slate-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all'
                    value={formData.trigger}
                    onChange={e => handleInputChange('trigger', e.target.value)}
                    placeholder='chase, fall, exam, darkness...'
                  />
                </div>
                <div>
                  <label className='label'>
                    <span className='label-text font-medium text-white'>Resolution</span>
                  </label>
                  <input
                    type='text'
                    className='input input-bordered w-full bg-white border-slate-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all'
                    value={formData.resolution}
                    onChange={e => handleInputChange('resolution', e.target.value)}
                    placeholder='faced it, woke up, transformed, escaped...'
                  />
                </div>
                <div className='flex items-center gap-3'>
                  <input
                    type='checkbox'
                    className='checkbox checkbox-secondary'
                    checked={formData.wokeUp}
                    onChange={e => handleInputChange('wokeUp', e.target.checked)}
                  />
                  <span className='label-text font-medium text-white'>I woke up suddenly</span>
                </div>
              </div>
            </div>
          )}

          {isNormal && (
            <div className='space-y-6'>
              <h4 className='text-lg font-semibold text-white flex items-center gap-2'>
                <span className='text-xl'>{sectionIcon}</span>
                Sweet Dream Details
              </h4>
              <hr className='border-slate-700' />
              <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                <div>
                  <label className='label'>
                    <span className='label-text font-medium text-white'>Serene Elements</span>
                    <span className='label-text-alt text-slate-500'>comma-separated</span>
                  </label>
                  <input
                    type='text'
                    className='input input-bordered w-full bg-white border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all'
                    value={formData.sereneElements.join(', ')}
                    onChange={e => handleArrayChange('sereneElements', e.target.value)}
                    placeholder='ocean, meadow, stars, gentle rain...'
                  />
                </div>
                <div>
                  <label className='label'>
                    <span className='label-text font-medium text-white'>Positive Symbols</span>
                    <span className='label-text-alt text-slate-500'>comma-separated</span>
                  </label>
                  <input
                    type='text'
                    className='input input-bordered w-full bg-white border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all'
                    value={formData.positiveSymbols.join(', ')}
                    onChange={e => handleArrayChange('positiveSymbols', e.target.value)}
                    placeholder='sunrise, music, flight, friends...'
                  />
                </div>
              </div>
            </div>
          )}

          {/* Dream Elements Section (moved below details) */}
          <div className='space-y-6'>
            <h4 className='text-lg font-semibold text-white flex items-center gap-2'>
              <span className='text-xl'>{neutralIcon}</span>
              Dream Elements
            </h4>
            <hr className='border-slate-700' />
            
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
              <div>
                <label className='label'>
                    <span className='label-text font-medium text-white'>Emotions</span>
                  <span className='label-text-alt text-slate-300'>comma-separated</span>
                </label>
                <input
                  type='text'
                   className={`input input-bordered w-full bg-white border-slate-300 focus:ring-2 transition-all ${isNormal ? 'focus:border-sky-500 focus:ring-sky-200' : isLucid ? 'focus:border-emerald-500 focus:ring-emerald-200' : 'focus:border-violet-500 focus:ring-violet-200'}`}
                  value={formData.emotions.join(', ')}
                  onChange={e => handleArrayChange('emotions', e.target.value)}
                  placeholder='joy, fear, excitement, wonder...'
                />
              </div>
              
              <div>
                <label className='label'>
                    <span className='label-text font-medium text-white'>Colors</span>
                  <span className='label-text-alt text-slate-300'>comma-separated</span>
                </label>
                <input
                  type='text'
                   className={`input input-bordered w-full bg-white border-slate-300 focus:ring-2 transition-all ${isNormal ? 'focus:border-sky-500 focus:ring-sky-200' : isLucid ? 'focus:border-emerald-500 focus:ring-emerald-200' : 'focus:border-violet-500 focus:ring-violet-200'}`}
                  value={formData.colors.join(', ')}
                  onChange={e => handleArrayChange('colors', e.target.value)}
                  placeholder='blue, red, golden, purple...'
                />
              </div>
              
              <div>
                <label className='label'>
                    <span className='label-text font-medium text-white'>People</span>
                  <span className='label-text-alt text-slate-300'>comma-separated</span>
                </label>
                <input
                  type='text'
                   className={`input input-bordered w-full bg-white border-slate-300 focus:ring-2 transition-all ${isNormal ? 'focus:border-sky-500 focus:ring-sky-200' : isLucid ? 'focus:border-emerald-500 focus:ring-emerald-200' : 'focus:border-violet-500 focus:ring-violet-200'}`}
                  value={formData.people.join(', ')}
                  onChange={e => handleArrayChange('people', e.target.value)}
                  placeholder='friend, stranger, family, yourself...'
                />
              </div>
              
              <div>
                <label className='label'>
                    <span className='label-text font-medium text-white'>Places</span>
                  <span className='label-text-alt text-slate-300'>comma-separated</span>
                </label>
                <input
                  type='text'
                   className={`input input-bordered w-full bg-white border-slate-300 focus:ring-2 transition-all ${isNormal ? 'focus:border-sky-500 focus:ring-sky-200' : isLucid ? 'focus:border-emerald-500 focus:ring-emerald-200' : 'focus:border-violet-500 focus:ring-violet-200'}`}
                  value={formData.places.join(', ')}
                  onChange={e => handleArrayChange('places', e.target.value)}
                  placeholder='home, forest, school, space...'
                />
              </div>
              
              <div>
                <label className='label'>
                    <span className='label-text font-medium text-white'>Things</span>
                  <span className='label-text-alt text-slate-300'>comma-separated</span>
                </label>
                <input
                  type='text'
                   className={`input input-bordered w-full bg-white border-slate-300 focus:ring-2 transition-all ${isNormal ? 'focus:border-sky-500 focus:ring-sky-200' : isLucid ? 'focus;border-emerald-500 focus:ring-emerald-200' : 'focus:border-violet-500 focus:ring-violet-200'}`}
                  value={formData.things.join(', ')}
                  onChange={e => handleArrayChange('things', e.target.value)}
                  placeholder='car, book, phone, magical object...'
                />
              </div>

              <div>
                <label className='label'>
                  <span className='label-text font-medium text-white'>Tags</span>
                  <span className='label-text-alt text-slate-300'>comma-separated</span>
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
                  <span className='label-text font-medium text-white'>Your Role</span>
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
            <h4 className='text-lg font-semibold text-white flex items-center gap-2'>
              <span className='text-xl'>✦</span>
              Privacy Settings
            </h4>
            <hr className='border-slate-700' />
            
            <div className='p-4 rounded-lg border border-slate-600 bg-slate-800/40'>
              <label className='flex items-start gap-3 cursor-pointer select-none'>
                <input
                  type='checkbox'
                  className='checkbox checkbox-primary checkbox-lg'
                  checked={formData.isPublic}
                  onChange={e => handleInputChange('isPublic', e.target.checked)}
                />
                <div>
                  <span className='font-medium text-white'>Make this dream public</span>
                  <p className='text-sm text-slate-300 mt-1'>Other users can discover and interact with your dream</p>
                </div>
              </label>
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
              className={`btn btn-primary btn-lg px-8 bg-gradient-to-r ${submitBtn} border-0 shadow-lg hover:shadow-xl transition-all`}
            >
              ✨ Save Dream
            </button>
          </div>
        </form>
            </div>
          </div>
        </div>
      </div>
      
      <form method='dialog' className='modal-backdrop'>
        <button onClick={handleClose}>close</button>
      </form>
    </dialog>
  )
}

export default AddDreamModal
