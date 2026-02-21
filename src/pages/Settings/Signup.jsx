import { useState, useEffect } from 'react'
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext'
import { createUser } from '../../services/firebaseService'

export default function Signup() {
  const { user, loading } = useFirebaseAuth()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    picture: '',
    username: ''
  })
  const [saveLoading, setSaveLoading] = useState(false)
  const [error, setError] = useState(null)

  // Auto-populate form with user data
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.displayName?.split(' ')[0] || '',
        lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
        picture: user.photoURL || ''
      }))
    }
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!user) {
      setError('Please sign in first')
      return
    }

    try {
      setSaveLoading(true)
      setError(null)
      
      await createUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        picture: formData.picture,
        username: formData.username?.trim() || undefined
      })

      // Redirect to settings after successful signup
      window.location.href = '/settings'
    } catch (err) {
      console.error('Error creating user profile:', err)
      setError(err.message)
    } finally {
      setSaveLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please Sign In</h2>
          <p className="text-base-content/70 mb-4">You need to sign in to complete your profile</p>
          <a href="/" className="btn btn-primary">Go to Home</a>
        </div>
      </div>
    )
  }

  return (
      <div className='flex flex-col items-center justify-start min-h-screen p-6'>
        <div className='w-full max-w-2xl'>
          <div className='text-center mb-8'>
            <h1 className='text-4xl font-bold mb-4'>Complete Your Profile</h1>
            <p className='text-lg text-base-content/70'>
              Tell us a bit about yourself to get started with Dream Speak
            </p>
          </div>

          <div className='card bg-base-100 shadow-xl'>
            <div className='card-body'>
              <form onSubmit={handleSubmit} className='space-y-6'>
                {error && (
                  <div className='alert alert-error'>
                    <span>{error}</span>
                  </div>
                )}

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='label'>
                      <span className='label-text font-semibold'>First Name</span>
                    </label>
                    <input
                      type='text'
                      className='input input-bordered w-full'
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder='Enter your first name'
                      required
                    />
                  </div>

                  <div>
                    <label className='label'>
                      <span className='label-text font-semibold'>Last Name</span>
                    </label>
                    <input
                      type='text'
                      className='input input-bordered w-full'
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder='Enter your last name'
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className='label'>
                    <span className='label-text font-semibold'>Username</span>
                    <span className='label-text-alt'>Optional. Your public handle for sharing (3–30 chars)</span>
                  </label>
                  <input
                    type='text'
                    className='input input-bordered w-full'
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    placeholder='e.g. dreamer_jane'
                  />
                </div>
                <div>
                  <label className='label'>
                    <span className='label-text font-semibold'>Profile Picture URL</span>
                  </label>
                  <input
                    type='url'
                    className='input input-bordered w-full'
                    value={formData.picture}
                    onChange={(e) => handleInputChange('picture', e.target.value)}
                    placeholder='https://example.com/image.jpg'
                  />
                  <label className='label'>
                    <span className='label-text-alt'>Optional: Add a URL to your profile picture</span>
                  </label>
                </div>

                <div className='flex justify-end space-x-4 pt-4'>
                  <button
                    type='button'
                    className='btn btn-outline'
                    onClick={() => window.location.href = '/settings'}
                  >
                    Skip for Now
                  </button>
                  <button
                    type='submit'
                    className='btn btn-primary'
                    disabled={saveLoading}
                  >
                    {saveLoading ? (
                      <span className='loading loading-spinner loading-sm'></span>
                    ) : (
                      'Complete Profile'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
  )
} 