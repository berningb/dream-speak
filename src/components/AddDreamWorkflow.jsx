import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { IoClose } from 'react-icons/io5'
import { createDream } from '../services/firebaseService'
import { describeDream } from '../services/deepseekService'
import SpeechMicButton from './SpeechMicButton'
import { isValidCalendarDateKey } from '../utils'

const initialFormState = {
  title: '',
  content: '',
  date: new Date().toISOString().split('T')[0],
  tags: [],
  isPublic: false,
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

function AddDreamWorkflow({ onAddDream, initialDate, onClose, dialogId = 'add_dream_modal' }) {
  const [saveLoading, setSaveLoading] = useState(false)
  const [enhanceLoading, setEnhanceLoading] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState(initialFormState)
  const descriptionTextareaRef = useRef(null)
  const dialogRef = useRef(null)

  const busy = saveLoading || enhanceLoading

  const AUTOSIZE_DESC_MAX = 520

  useLayoutEffect(() => {
    const el = descriptionTextareaRef.current
    if (!el) return
    el.style.height = 'auto'
    const natural = el.scrollHeight
    const minPx = 128
    const h = Math.min(Math.max(natural, minPx), AUTOSIZE_DESC_MAX)
    el.style.height = `${h}px`
    el.style.overflowY = natural > AUTOSIZE_DESC_MAX ? 'auto' : 'hidden'
  }, [formData.content])

  useEffect(() => {
    if (!initialDate || !isValidCalendarDateKey(initialDate)) return
    setFormData((prev) => ({ ...prev, date: initialDate }))
  }, [initialDate])

  useEffect(() => {
    const el = dialogRef.current
    if (!el || !onClose) return
    const handler = () => onClose()
    el.addEventListener('close', handler)
    return () => el.removeEventListener('close', handler)
  }, [onClose])

  const handleEnhanceWithAI = async () => {
    const title = formData.title?.trim()
    const content = formData.content?.trim()
    if (!title && !content) {
      setError('Add a title or some description first, then AI can enhance it.')
      return
    }
    setError(null)
    setEnhanceLoading(true)
    try {
      const input = [title && `Title: ${title}`, content].filter(Boolean).join('\n\n')
      const enhanced = await describeDream(input)
      setFormData((prev) => ({ ...prev, content: enhanced.trim() }))
    } catch (err) {
      setError(err.message)
    } finally {
      setEnhanceLoading(false)
    }
  }

  const handleSave = async () => {
    setSaveLoading(true)
    setError(null)
    try {
      const dream = {
        title: formData.title || 'Untitled Dream',
        content: formData.content || '',
        date: new Date(formData.date).toISOString(),
        tags: formData.tags,
        isPublic: formData.isPublic,
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
      dialogRef.current?.close()
      onAddDream()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaveLoading(false)
    }
  }

  const handleClose = () => {
    dialogRef.current?.close()
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <dialog ref={dialogRef} id={dialogId} className="modal p-4">
      <div className="modal-box max-w-3xl w-full max-h-[min(90vh,920px)] p-0 relative overflow-hidden rounded-2xl border border-white/10 bg-base-200 shadow-2xl shadow-black/40 ring-1 ring-white/5">
        <div className="flex max-h-[min(90vh,920px)] flex-col bg-gradient-to-b from-base-300/90 to-base-200">
          <div className="flex-shrink-0 border-b border-base-content/10 bg-base-300/40 px-5 py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="font-semibold text-lg tracking-tight text-base-content">Dream workflow</h3>
                <p className="mt-1 text-sm text-base-content/70">
                  Write your dream below. Enhance with AI updates the description in place. Use the mic to dictate.
                </p>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-circle btn-ghost shrink-0 text-base-content/80 hover:bg-base-content/10"
                onClick={handleClose}
                aria-label="Close"
              >
                <IoClose className="text-xl" />
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {error && (
              <div className="alert alert-error text-sm rounded-xl border border-error/30">
                <span className="flex-1">{error}</span>
                <button type="button" className="btn btn-ghost btn-xs btn-square shrink-0" onClick={() => setError(null)} aria-label="Dismiss">
                  ×
                </button>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="label">
                  <span className="label-text">Title</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered input-sm w-full border-base-content/15 bg-base-300/80"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Dream title"
                  disabled={busy}
                />
              </div>
              <div>
                <div className="label flex items-center justify-between gap-2 py-0">
                  <span className="label-text">Description</span>
                  <SpeechMicButton
                    onAppend={(chunk) =>
                      setFormData((prev) => ({
                        ...prev,
                        content: prev.content ? `${prev.content.trim()} ${chunk}` : chunk
                      }))
                    }
                    disabled={busy}
                  />
                </div>
                <textarea
                  ref={descriptionTextareaRef}
                  className="textarea textarea-bordered textarea-sm textarea-quiet-focus mt-1 w-full min-h-32 resize-none border-base-content/15 bg-base-300/80 leading-snug"
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  disabled={busy}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text">Date</span>
                  </label>
                  <input
                    type="date"
                    className="input input-bordered input-sm w-full border-base-content/15 bg-base-300/80"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    disabled={busy}
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Mood</span>
                  </label>
                  <select
                    className="select select-bordered select-sm w-full border-base-content/15 bg-base-300/80"
                    value={formData.mood}
                    onChange={(e) => handleInputChange('mood', e.target.value)}
                    disabled={busy}
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
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={formData.isPublic}
                    onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                    disabled={busy}
                  />
                  <span className="text-sm">Make public</span>
                </label>
              </div>
              <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:flex-wrap sm:items-center">
                <button
                  type="button"
                  className="btn btn-outline btn-primary btn-sm sm:order-1"
                  onClick={handleEnhanceWithAI}
                  disabled={busy}
                >
                  {enhanceLoading ? (
                    <>
                      <span className="loading loading-spinner loading-sm" /> Enhancing…
                    </>
                  ) : (
                    'Enhance with AI'
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm flex-1 sm:order-2 sm:min-w-[8rem]"
                  onClick={handleSave}
                  disabled={busy}
                >
                  {saveLoading ? <span className="loading loading-spinner loading-sm" /> : 'Save dream'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="submit" className="absolute inset-0 cursor-default bg-transparent" aria-label="Close dialog">
          <span className="sr-only">Close</span>
        </button>
      </form>
    </dialog>
  )
}

export default AddDreamWorkflow
