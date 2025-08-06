import { useState, useEffect } from 'react'
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext'
import Layout from '../../components/Layout'
import PrivacySettings from '../../components/PrivacySettings'
import { formatFullDate } from '../../utils'
import { getMyDreams, updateUser, debugUserDocument } from '../../services/firebaseService'

export default function Settings() {
  const { user, loading, error, updateUserProfile } = useFirebaseAuth()
  const [mutationError, setMutationError] = useState(null);
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    picture: ''
  })
  const [saveLoading, setSaveLoading] = useState(false)
  const [dreamCount, setDreamCount] = useState(0);
  const [publicDreamCount, setPublicDreamCount] = useState(0);
  const [privateDreamCount, setPrivateDreamCount] = useState(0);
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);

  // Sync editForm with user when loaded
  useEffect(() => {
    if (user) {
      setEditForm({
        firstName: user.displayName?.split(' ')[0] || '',
        lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
        picture: user.photoURL || ''
      })
    }
  }, [user])

  useEffect(() => {
    async function fetchDreams() {
      try {
        const dreams = await getMyDreams();
        if (dreams) {
          setDreamCount(dreams.length);
          setPublicDreamCount(dreams.filter(d => d.isPublic).length);
          setPrivateDreamCount(dreams.filter(d => !d.isPublic).length);
        }
      } catch (err) {
        console.error('Error fetching dreams:', err);
      }
    }
    if (user) {
      fetchDreams();
    }
  }, [user]);

  const handleSave = async () => {
    try {
      setSaveLoading(true)
      
      console.log('🚀 Starting save operation with data:', editForm);
      
      // Debug user document before save
      await debugUserDocument();
      
      // Update user profile in Firestore
      const result = await updateUser({
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        picture: editForm.picture
      });
      
      console.log('✅ Firestore save operation result:', result);
      
      // Update Firebase Auth profile to keep in sync
      await updateUserProfile({
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        picture: editForm.picture
      });
      
      console.log('✅ Firebase Auth profile updated');
      
      // Debug user document after save
      await debugUserDocument();

      setIsEditing(false)
      setMutationError(null)
    } catch (err) {
      console.error('Error updating user:', err)
      setMutationError(err.message)
    } finally {
      setSaveLoading(false)
    }
  }
  
  const handleDebugUser = async () => {
    const result = await debugUserDocument();
    alert(`User Document Debug:\nExists: ${result.exists}\nData: ${JSON.stringify(result.data, null, 2)}`);
  }

  const handleCancel = () => {
    setEditForm({
      firstName: user?.displayName?.split(' ')[0] || '',
      lastName: user?.displayName?.split(' ').slice(1).join(' ') || '',
      picture: user?.photoURL || ''
    })
    setIsEditing(false)
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return
    }

    try {
      setSaveLoading(true)
      
      // This part of the logic needs to be adapted for Firebase Auth deletion
      // For now, we'll just show an error as there's no direct Auth0 ID in Firebase Auth
      throw new Error('Account deletion is not yet implemented for Firebase Auth.');

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
                      value={user?.email || ''}
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
                  <button 
                    className='btn btn-info btn-sm'
                    onClick={handleDebugUser}
                  >
                    Debug User Data
                  </button>
                </div>
              </div>
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='flex items-center space-x-4'>
                  <div className='avatar'>
                    <div className='w-16 h-16 rounded-full'>
                      <img src={user?.photoURL || '/default-avatar.png'} alt='Profile' />
                    </div>
                  </div>
                  <div>
                    <h3 className='text-lg font-semibold'>
                      {user?.displayName 
                        ? `${user.displayName}`.trim()
                        : user?.email
                      }
                    </h3>
                    <p className='text-base-content/70'>{user?.email}</p>
                    <p className='text-sm text-base-content/50'>
                      Member since {user?.metadata?.creationTime ? formatFullDate(user.metadata.creationTime) : 'Unknown'}
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
              <button 
                className='btn btn-secondary w-full'
                onClick={() => setShowPrivacySettings(true)}
              >
                Privacy Settings
              </button>
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
      
      {/* Privacy Settings Modal */}
      {showPrivacySettings && (
        <PrivacySettings onClose={() => setShowPrivacySettings(false)} />
      )}
    </Layout>
  )
} 