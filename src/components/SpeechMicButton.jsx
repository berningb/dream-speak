import { IoMic, IoMicOutline } from 'react-icons/io5'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'

const errorHint = (code) => {
  if (code === 'not-allowed') return 'Microphone blocked. Allow access in your browser settings.'
  if (code === 'service-not-allowed') return 'Speech recognition is not allowed on this page.'
  if (code === 'network') return 'Network error. Check your connection.'
  if (code === 'start-failed') return 'Could not start listening. Try again.'
  return code ? `Speech: ${code}` : ''
}

/**
 * Toggle dictation; appends finalized phrases via onAppend(text).
 */
export default function SpeechMicButton({ onAppend, disabled, className = '' }) {
  const { supported, listening, speechError, toggle, clearError } = useSpeechRecognition({
    onFinal: (chunk) => onAppend(chunk)
  })

  const title = !supported
    ? 'Voice input needs Chrome, Edge, or Safari (limited)'
    : speechError
      ? errorHint(speechError)
      : listening
        ? 'Stop dictation'
        : 'Speak instead of typing'

  if (!supported) {
    return (
      <button
        type="button"
        className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-base-content/20 bg-base-300/50 text-base-content/35 ${className}`}
        disabled
        title={title}
        aria-label="Voice input not available"
      >
        <IoMicOutline className="h-6 w-6" />
      </button>
    )
  }

  return (
    <button
      type="button"
      className={`
        inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 transition-colors
        focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-offset-2 focus-visible:ring-offset-base-200
        disabled:pointer-events-none disabled:opacity-40
        ${listening
          ? 'border-primary bg-primary/20 text-primary shadow-[0_0_12px_rgba(56,189,248,0.25)]'
          : 'border-primary/55 bg-base-100/90 text-primary hover:border-primary hover:bg-primary/15'
        }
        ${className}
      `}
      onClick={() => {
        clearError()
        toggle()
      }}
      disabled={disabled}
      title={title}
      aria-pressed={listening}
      aria-label={listening ? 'Stop dictation' : 'Start dictation'}
    >
      {listening ? <IoMic className="h-6 w-6 animate-pulse" /> : <IoMicOutline className="h-6 w-6" />}
    </button>
  )
}
