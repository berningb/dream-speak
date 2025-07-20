import { useState, useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import Layout from '../../components/Layout'
import { formatFullDate } from '../../utils'

export default function Settings() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    picture: ''
  })
  const [saveLoading, setSaveLoading] = useState(false)
  const { getIdTokenClaims, user: auth0User } = useAuth0()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true)
        const token = await getIdTokenClaims()
        
        const response = await fetch('http://localhost:4000/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token.__raw}`
          },
          body: JSON.stringify({
            query: `
              query {
                dreams {
                  id
                  title
                  isPublic
                }
              }
            `
          })
        })

        const data = await response.json()
        
        if (data.errors) {
          throw new Error(data.errors[0].message)
        }

        // Get user info from Auth0 and combine with dream data
        const userInfo = {
          id: auth0User?.sub,
          email: auth0User?.email,
          firstName: auth0User?.given_name || '',
          lastName: auth0User?.family_name || '',
          picture: auth0User?.picture || '',
          createdAt: auth0User?.updated_at,
          dreams: data.data.dreams || []
        }
        
        setUser(userInfo)
        setEditForm({
          firstName: userInfo.firstName,
          lastName: userInfo.lastName,
          picture: userInfo.picture
        })
      } catch (err) {
        console.error('Error fetching user:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (auth0User) {
      fetchUser()
    }
  }, [getIdTokenClaims, auth0User])

  const handleSave = async () => {
    try {
      setSaveLoading(true)
      const token = await getIdTokenClaims()
      
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.__raw}`
        },
        body: JSON.stringify({
          query: `
            mutation UpdateUser($firstName: String, $lastName: String, $picture: String) {
              updateUser(firstName: $firstName, lastName: $lastName, picture: $picture) {
                id
                firstName
                lastName
                picture
                email
              }
            }
          `,
          variables: editForm
        })
      })

      const data = await response.json()
      
      if (data.errors) {
        throw new Error(data.errors[0].message)
      }

      setUser(prev => ({ ...prev, ...data.data.updateUser }))
      setIsEditing(false)
    } catch (err) {
      console.error('Error updating user:', err)
      setError(err.message)
    } finally {
      setSaveLoading(false)
    }
  }

  const handleCancel = () => {
    setEditForm({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      picture: user?.picture || ''
    })
    setIsEditing(false)
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return
    }

    try {
      setSaveLoading(true)
      const token = await getIdTokenClaims()
      
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.__raw}`
        },
        body: JSON.stringify({
          query: `
            mutation DeleteUser($auth0Id: String!) {
              deleteUser(auth0Id: $auth0Id)
            }
          `,
          variables: { auth0Id: user?.id }
        })
      })

      const data = await response.json()
      
      if (data.errors) {
        throw new Error(data.errors[0].message)
      }

      // Redirect to home or logout
      window.location.href = '/'
    } catch (err) {
      console.error('Error deleting user:', err)
      setError(err.message)
    } finally {
      setSaveLoading(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className='flex flex-col items-center justify-start h-screen'>
          <h1 className='text-4xl font-bold text-center py-6'>Profile & Settings</h1>
          <div className='max-w-4xl mx-auto px-4 w-full'>
            <div className='flex justify-center items-center h-64'>
              <span className='loading loading-spinner loading-lg'></span>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className='flex flex-col items-center justify-start h-screen'>
          <h1 className='text-4xl font-bold text-center py-6'>Profile & Settings</h1>
          <div className='max-w-4xl mx-auto px-4 w-full'>
            <div className='alert alert-error'>
              <span>Error loading profile: {error}</span>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className='flex flex-col items-center justify-start h-screen'>
        <h1 className='text-4xl font-bold text-center py-6'>Profile & Settings</h1>
        <div className='max-w-4xl mx-auto px-4 w-full'>
          
          {/* Profile Section */}
          <div className='bg-base-200 rounded-lg p-6 mb-6'>
            <div className='flex justify-between items-center mb-6'>
              <h2 className='text-2xl font-semibold'>Profile Information</h2>
              {!isEditing && (
                <button 
                  className='btn btn-primary'
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </button>
              )}
            </div>

            {isEditing ? (
              <div className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='label'>
                      <span className='label-text'>First Name</span>
                    </label>
                    <input 
                      type='text' 
                      className='input input-bordered w-full'
                      value={editForm.firstName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className='label'>
                      <span className='label-text'>Last Name</span>
                    </label>
                    <input 
                      type='text' 
                      className='input input-bordered w-full'
                      value={editForm.lastName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <label className='label'>
                    <span className='label-text'>Profile Picture URL</span>
                  </label>
                  <input 
                    type='url' 
                    className='input input-bordered w-full'
                    value={editForm.picture}
                    onChange={(e) => setEditForm(prev => ({ ...prev, picture: e.target.value }))}
                    placeholder='https://example.com/image.jpg'
                  />
                </div>
                <div className='flex gap-2'>
                  <button 
                    className='btn btn-primary'
                    onClick={handleSave}
                    disabled={saveLoading}
                  >
                    {saveLoading ? <span className='loading loading-spinner loading-sm'></span> : 'Save Changes'}
                  </button>
                  <button 
                    className='btn btn-outline'
                    onClick={handleCancel}
                    disabled={saveLoading}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='flex items-center space-x-4'>
                  <div className='avatar'>
                    <div className='w-16 h-16 rounded-full'>
                      <img src={user?.picture || '/default-avatar.png'} alt='Profile' />
                    </div>
                  </div>
                  <div>
                    <h3 className='text-lg font-semibold'>
                      {user?.firstName && user?.lastName 
                        ? `${user.firstName} ${user.lastName}`
                        : user?.email
                      }
                    </h3>
                    <p className='text-base-content/70'>{user?.email}</p>
                    <p className='text-sm text-base-content/50'>
                      Member since {user?.createdAt ? formatFullDate(user.createdAt) : 'Unknown'}
                    </p>
                  </div>
                </div>
                <div className='space-y-2'>
                  <div className='flex justify-between'>
                    <span className='text-base-content/70'>Total Dreams:</span>
                    <span className='font-semibold'>{user?.dreams?.length || 0}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-base-content/70'>Public Dreams:</span>
                    <span className='font-semibold'>
                      {user?.dreams?.filter(dream => dream.isPublic).length || 0}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-base-content/70'>Private Dreams:</span>
                    <span className='font-semibold'>
                      {user?.dreams?.filter(dream => !dream.isPublic).length || 0}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Settings Grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='bg-base-200 rounded-lg p-6'>
              <h2 className='text-xl font-semibold mb-4'>Privacy</h2>
              <p className='text-base-content/70 mb-4'>
                Control who can see your dreams and data
              </p>
              <button className='btn btn-secondary w-full'>Privacy Settings</button>
            </div>
            
            <div className='bg-base-200 rounded-lg p-6'>
              <h2 className='text-xl font-semibold mb-4'>Notifications</h2>
              <p className='text-base-content/70 mb-4'>
                Configure email and app notifications
              </p>
              <button className='btn btn-accent w-full'>Notification Settings</button>
            </div>
            
            <div className='bg-base-200 rounded-lg p-6'>
              <h2 className='text-xl font-semibold mb-4'>Export Data</h2>
              <p className='text-base-content/70 mb-4'>
                Download your dream data and account information
              </p>
              <button className='btn btn-outline w-full'>Export Data</button>
            </div>
            
            <div className='bg-base-200 rounded-lg p-6'>
              <h2 className='text-xl font-semibold mb-4 text-error'>Danger Zone</h2>
              <p className='text-base-content/70 mb-4'>
                Permanently delete your account and all data
              </p>
              <button 
                className='btn btn-error w-full'
                onClick={handleDeleteAccount}
                disabled={saveLoading}
              >
                {saveLoading ? <span className='loading loading-spinner loading-sm'></span> : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
} 