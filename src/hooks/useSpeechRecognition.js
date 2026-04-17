import { useCallback, useEffect, useRef, useState } from 'react'

export function getSpeechRecognitionConstructor() {
  if (typeof window === 'undefined') return null
  return window.SpeechRecognition || window.webkitSpeechRecognition || null
}

/**
 * Browser speech-to-text (Web Speech API). Works best in Chrome and Edge.
 * @param {object} options
 * @param {(text: string) => void} options.onFinal - Called with each finalized phrase chunk.
 * @param {string} [options.lang='en-US']
 */
export function useSpeechRecognition({ onFinal, lang = 'en-US' }) {
  const onFinalRef = useRef(onFinal)
  useEffect(() => {
    onFinalRef.current = onFinal
  }, [onFinal])

  const [listening, setListening] = useState(false)
  const [supported, setSupported] = useState(false)
  const [speechError, setSpeechError] = useState(null)
  const recRef = useRef(null)

  useEffect(() => {
    const Ctor = getSpeechRecognitionConstructor()
    if (!Ctor) {
      setSupported(false)
      return
    }
    setSupported(true)
    const recognition = new Ctor()
    recognition.continuous = true
    recognition.interimResults = false
    recognition.lang = lang

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        if (event.results[i].isFinal) {
          const t = event.results[i][0].transcript.trim()
          if (t) onFinalRef.current?.(t)
        }
      }
    }

    recognition.onerror = (e) => {
      if (e.error === 'aborted' || e.error === 'no-speech') return
      setSpeechError(e.error || 'error')
      setListening(false)
    }

    recognition.onend = () => {
      setListening(false)
    }

    recRef.current = recognition
    return () => {
      try {
        recognition.abort()
      } catch (_) {}
      recRef.current = null
    }
  }, [lang])

  const start = useCallback(() => {
    if (!recRef.current) return
    setSpeechError(null)
    try {
      recRef.current.start()
      setListening(true)
    } catch (_) {
      try {
        recRef.current.stop()
      } catch (__) {}
      try {
        recRef.current.start()
        setListening(true)
      } catch (e) {
        setSpeechError('start-failed')
        setListening(false)
      }
    }
  }, [])

  const stop = useCallback(() => {
    if (!recRef.current) return
    try {
      recRef.current.stop()
    } catch (_) {}
    setListening(false)
  }, [])

  const toggle = useCallback(() => {
    if (listening) stop()
    else start()
  }, [listening, start, stop])

  return {
    supported,
    listening,
    speechError,
    start,
    stop,
    toggle,
    clearError: () => setSpeechError(null)
  }
}
