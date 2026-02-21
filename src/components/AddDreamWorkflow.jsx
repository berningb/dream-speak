import { useState, useRef, useEffect } from 'react'
import { IoClose } from 'react-icons/io5'
import { createDream, uploadDreamImage } from '../services/firebaseService'
import { chatWithDeepSeek, extractDreamFromConversation } from '../services/deepseekService'
import { generateDreamImage } from '../services/imageService'

const DREAM_CHAT_SYSTEM = `You are a warm, supportive dream journal assistant. Your job is to help the user capture their dream in rich detail through a natural conversation.

Ask thoughtful follow-up questions to draw out:
- The overall mood and emotions
- Key people, places, and objects
- Colors and sensory details
- Whether it felt like a sweet dream, lucid dream, or nightmare
- Any standout symbols or meaningful moments

Keep your responses concise (2-4 sentences). Ask one or two questions at a time. Be curious and non-judgmental. When they seem to have shared enough, you can offer to help formulate their dream entry.`

const initialFormState = {
  title: '',
  content: '',
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
  type: 'sweet',
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
}

function AddDreamWorkflow({ onAddDream, initialDreamType = 'sweet' }) {
  const [step, setStep] = useState('chat')
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState(initialFormState)
  const [imageGenerating, setImageGenerating] = useState(false)
  const chatEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])
  useEffect(() => { if (step === 'chat') inputRef.current?.focus() }, [step])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMsg = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    setError(null)

    try {
      const chatMessages = [
        { role: 'system', content: DREAM_CHAT_SYSTEM },
        ...messages,
        userMsg
      ]
      const reply = await chatWithDeepSeek(chatMessages)
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleFormulate = async () => {
    if (messages.length < 2) {
      setError('Share a bit more about your dream first.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const extracted = await extractDreamFromConversation(messages)
      setFormData(prev => ({
        ...prev,
        ...extracted,
        date: prev.date,
        isPublic: prev.isPublic,
        tags: extracted.tags?.length ? extracted.tags : (extracted.type ? [extracted.type] : ['dream'])
      }))
      setStep('review')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateImage = async () => {
    const prompt = formData.content || formData.title || 'A dream scene'
    setImageGenerating(true)
    setError(null)
    try {
      const imageUrl = await generateDreamImage(prompt)
      if (imageUrl) setFormData(prev => ({ ...prev, image: imageUrl }))
    } catch (err) {
      setError(err.message)
    } finally {
      setImageGenerating(false)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    setError(null)
    try {
      let imageUrl = formData.image || null
      if (imageUrl?.startsWith('data:')) {
        try {
          imageUrl = await uploadDreamImage(imageUrl)
        } catch (err) {
          setError('Failed to upload image. ' + err.message)
          setLoading(false)
          return
        }
      }
      const dream = {
        title: formData.title || 'Untitled Dream',
        content: formData.content || '',
        date: new Date(formData.date).toISOString(),
        tags: formData.tags,
        isPublic: formData.isPublic,
        image: imageUrl,
        mood: formData.mood || null,
        emotions: formData.emotions,
        colors: formData.colors,
        role: formData.role,
        people: formData.people,
        places: formData.places,
        things: formData.things,
        type: formData.type,
        sereneElements: formData.sereneElements,
        positiveSymbols: formData.positiveSymbols,
        realityChecks: formData.realityChecks,
        controlLevel: formData.controlLevel,
        techniques: formData.techniques,
        clarity: formData.clarity,
        intensity: formData.intensity,
        trigger: formData.trigger,
        resolution: formData.resolution,
        wokeUp: formData.wokeUp
      }
      await createDream(dream)
      document.getElementById('add_dream_modal')?.close()
      onAddDream()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    document.getElementById('add_dream_modal')?.close()
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <dialog id="add_dream_modal" className="modal">
      <div className="modal-box max-w-3xl w-[95vw] p-0 relative border border-slate-200 shadow-2xl bg-transparent">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900">
          <div className="bg-gradient-to-br from-sky-400/15 to-blue-400/5 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 text-white flex-shrink-0 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-xl text-white">✨ Dream Workflow</h3>
                  <p className="text-slate-300 text-sm">
                    {step === 'chat' && 'Describe your dream. DeepSeek will help you capture the details.'}
                    {step === 'review' && 'Review and edit, then generate an image and save.'}
                  </p>
                </div>
                <button
                  className="btn btn-sm btn-circle btn-ghost hover:bg-slate-700"
                  onClick={handleClose}
                >
                  <IoClose className="text-xl" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {error && (
                <div className="alert alert-error text-sm">
                  <span>{error}</span>
                  <button type="button" onClick={() => setError(null)}>×</button>
                </div>
              )}

              {step === 'chat' && (
                <>
                  <div className="space-y-3">
                    {messages.length === 0 && (
                      <div className="text-slate-300 text-sm italic">
                        Start by telling me about your dream. I will ask a few questions to help you remember and capture it better.
                      </div>
                    )}
                    {messages.map((m, i) => (
                      <div
                        key={i}
                        className={`chat ${m.role === 'user' ? 'chat-end' : 'chat-start'}`}
                      >
                        <div
                          className={`chat-bubble ${m.role === 'user' ? 'chat-bubble-primary' : 'bg-slate-700'}`}
                        >
                          {m.content}
                        </div>
                      </div>
                    ))}
                    {loading && (
                      <div className="chat chat-start">
                        <div className="chat-bubble bg-slate-700">
                          <span className="loading loading-dots loading-sm" />
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  <div className="flex gap-2 sticky bottom-0 bg-slate-900/95 pt-2">
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Describe your dream..."
                      className="input input-bordered flex-1 bg-slate-800 border-slate-600 text-white"
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                      disabled={loading}
                    />
                    <button
                      className="btn btn-primary"
                      onClick={sendMessage}
                      disabled={loading || !input.trim()}
                    >
                      Send
                    </button>
                    {messages.length >= 2 && (
                      <button
                        className="btn btn-outline btn-success"
                        onClick={handleFormulate}
                        disabled={loading}
                      >
                        Formulate dream
                      </button>
                    )}
                  </div>
                </>
              )}

              {step === 'review' && (
                <div className="space-y-4">
                  <div>
                    <label className="label"><span className="label-text">Title</span></label>
                    <input
                      type="text"
                      className="input input-bordered w-full bg-slate-800 border-slate-600 text-white"
                      value={formData.title}
                      onChange={e => handleInputChange('title', e.target.value)}
                      placeholder="Dream title"
                    />
                  </div>
                  <div>
                    <label className="label"><span className="label-text">Description</span></label>
                    <textarea
                      className="textarea textarea-bordered w-full h-32 bg-slate-800 border-slate-600 text-white"
                      value={formData.content}
                      onChange={e => handleInputChange('content', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label"><span className="label-text">Date</span></label>
                      <input
                        type="date"
                        className="input input-bordered w-full bg-slate-800 border-slate-600 text-white"
                        value={formData.date}
                        onChange={e => handleInputChange('date', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="label"><span className="label-text">Mood</span></label>
                      <select
                        className="select select-bordered w-full bg-slate-800 border-slate-600 text-white"
                        value={formData.mood}
                        onChange={e => handleInputChange('mood', e.target.value)}
                      >
                        <option value="">Select mood</option>
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
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="checkbox"
                        checked={formData.isPublic}
                        onChange={e => handleInputChange('isPublic', e.target.checked)}
                      />
                      <span className="text-sm">Make public</span>
                    </label>
                  </div>
                  <div className="border border-slate-600 rounded-lg p-4 bg-slate-800/50">
                    <label className="label"><span className="label-text font-medium">Dream image</span></label>
                    {formData.image ? (
                      <div className="mt-2">
                        <img
                          src={formData.image}
                          alt="Dream"
                          className="rounded-lg max-h-96 w-full object-contain bg-slate-800/50"
                        />
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm mt-2"
                          onClick={() => handleInputChange('image', '')}
                        >
                          Remove image
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-primary mt-2"
                        onClick={handleGenerateImage}
                        disabled={imageGenerating}
                      >
                        {imageGenerating ? (
                          <><span className="loading loading-spinner loading-sm" /> Generating...</>
                        ) : (
                          <>🖼️ Generate image with AI</>
                        )}
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2 pt-4">
                    <button
                      className="btn btn-ghost"
                      onClick={() => setStep('chat')}
                    >
                      Back to chat
                    </button>
                    <button
                      className="btn btn-primary flex-1"
                      onClick={handleSave}
                      disabled={loading}
                    >
                      {loading ? <span className="loading loading-spinner loading-sm" /> : '✨ Save dream'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="button" onClick={handleClose}>close</button>
      </form>
    </dialog>
  )
}

export default AddDreamWorkflow
