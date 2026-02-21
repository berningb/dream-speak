import { useState, useEffect } from 'react'
import { getNotificationSettings, updateNotificationSettings } from '../services/firebaseService'
import { useFirebaseAuth } from '../contexts/FirebaseAuthContext'

export default function NotificationSettings({ onClose }) {
  const { user } = useFirebaseAuth()
  const [settings, setSettings] = useState({
    notifyOnComment: true,
    notifyOnLike: false,
    weeklyDigest: false
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await getNotificationSettings()
        setSettings(data)
      } catch (err) {
        console.error('Error loading notification settings:', err)
        setError('Failed to load notification settings')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadSettings()
    }
  }, [user])

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      await updateNotificationSettings(settings)
      onClose?.()
    } catch (err) {
      console.error('Error saving notification settings:', err)
      setError('Failed to save notification settings')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  if (loading) {
    return (
      <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
        <div className='bg-base-100 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-auto'>
          <div className='flex justify-center items-center h-32'>
            <span className='loading loading-spinner loading-lg'></span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-base-100 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-auto'>
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-2xl font-bold'>Notification Settings</h2>
          <button className='btn btn-ghost btn-sm' onClick={onClose}>
            <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
            </svg>
          </button>
        </div>

        <p className='text-base-content/70 mb-6'>
          Configure your notification preferences. Actual notification delivery will be available in a future update.
        </p>

        {error && (
          <div className='alert alert-error mb-4'>
            <span>{error}</span>
          </div>
        )}

        <div className='space-y-6'>
          <label className='cursor-pointer label justify-between'>
            <span className='label-text'>Notify when someone comments on your dreams</span>
            <input
              type='checkbox'
              className='toggle toggle-primary'
              checked={settings.notifyOnComment}
              onChange={(e) => handleChange('notifyOnComment', e.target.checked)}
            />
          </label>
          <label className='cursor-pointer label justify-between'>
            <span className='label-text'>Notify when someone likes your dreams</span>
            <input
              type='checkbox'
              className='toggle toggle-primary'
              checked={settings.notifyOnLike}
              onChange={(e) => handleChange('notifyOnLike', e.target.checked)}
            />
          </label>
          <label className='cursor-pointer label justify-between'>
            <span className='label-text'>Weekly dream digest (summary of your recent dreams)</span>
            <input
              type='checkbox'
              className='toggle toggle-primary'
              checked={settings.weeklyDigest}
              onChange={(e) => handleChange('weeklyDigest', e.target.checked)}
            />
          </label>
        </div>

        <div className='flex gap-2 mt-8'>
          <button className='btn btn-primary' onClick={handleSave} disabled={saving}>
            {saving ? <span className='loading loading-spinner loading-sm'></span> : 'Save Settings'}
          </button>
          <button className='btn btn-outline' onClick={onClose} disabled={saving}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
