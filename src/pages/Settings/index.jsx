import { useState, useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useBackendUser } from '../../hooks/useUsers.jsx'
import Layout from '../../components/Layout'
import { formatFullDate, getApiUrl } from '../../utils'
import useApi from '../../hooks/useApi';

export default function Settings() {
  const { getIdTokenClaims } = useAuth0()
  const { backendUser, loading, error, refreshBackendUser } = useBackendUser()
  const [mutationError, setMutationError] = useState(null);
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    picture: ''
  })
  const [saveLoading, setSaveLoading] = useState(false)
  const { apiCall } = useApi();
  const [dreamCount, setDreamCount] = useState(0);
  const [publicDreamCount, setPublicDreamCount] = useState(0);
  const [privateDreamCount, setPrivateDreamCount] = useState(0);

  // Sync editForm with backendUser when loaded
  useEffect(() => {
    if (backendUser) {
      setEditForm({
        firstName: backendUser.firstName || '',
        lastName: backendUser.lastName || '',
        picture: backendUser.picture || ''
      })
    }
  }, [backendUser])

  useEffect(() => {
    async function fetchDreams() {
      const data = await apiCall(`query { dreams { id isPublic } }`);
      if (data && data.dreams) {
        setDreamCount(data.dreams.length);
        setPublicDreamCount(data.dreams.filter(d => d.isPublic).length);
        setPrivateDreamCount(data.dreams.filter(d => !d.isPublic).length);
      }
    }
    fetchDreams();
  }, [apiCall]);

  const handleSave = async () => {
    try {
      setSaveLoading(true)
      const token = await getIdTokenClaims()
      
      const response = await fetch(getApiUrl(), {
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

      // Refetch backend user after update
      await refreshBackendUser()
      setIsEditing(false)
    } catch (err) {
      console.error('Error updating user:', err)
      setMutationError(err.message)
    } finally {
      setSaveLoading(false)
    }
  }

  const handleCancel = () => {
    setEditForm({
      firstName: backendUser?.firstName || '',
      lastName: backendUser?.lastName || '',
      picture: backendUser?.picture || ''
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
      
      const response = await fetch(getApiUrl(), {
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
          variables: { auth0Id: backendUser?.id }
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
      setMutationError(err.message)
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
                      <span className='label-text'>Email (read-only)</span>
                    </label>
                    <input
                      type='email'
                      className='input input-bordered w-full bg-gray-100 cursor-not-allowed'
                      value={backendUser?.email || ''}
                      readOnly
                      tabIndex={-1}
                    />
                  </div>
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
                      <img src={backendUser?.picture || '/default-avatar.png'} alt='Profile' />
                    </div>
                  </div>
                  <div>
                    <h3 className='text-lg font-semibold'>
                      {backendUser?.firstName || backendUser?.lastName 
                        ? `${backendUser?.firstName || ''} ${backendUser?.lastName || ''}`.trim()
                        : backendUser?.email
                      }
                    </h3>
                    <p className='text-base-content/70'>{backendUser?.email}</p>
                    <p className='text-sm text-base-content/50'>
                      Member since {backendUser?.createdAt ? formatFullDate(backendUser.createdAt) : 'Unknown'}
                    </p>
                  </div>
                </div>
                <div className='space-y-2'>
                  <div className='flex justify-between'>
                    <span className='text-base-content/70'>Total Dreams:</span>
                    <span className='font-semibold'>{dreamCount}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-base-content/70'>Public Dreams:</span>
                    <span className='font-semibold'>{publicDreamCount}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-base-content/70'>Private Dreams:</span>
                    <span className='font-semibold'>{privateDreamCount}</span>
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
          {/* Show mutation error if present */}
          {mutationError && (
            <div className='alert alert-error mb-4'>
              <span>{mutationError}</span>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
} 