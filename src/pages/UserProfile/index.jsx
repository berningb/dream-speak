import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext'
import { getUser, getUserByUsername, sendFriendRequest, areFriends, getPublicDreams } from '../../services/firebaseService'
import { getDisplayHandle } from '../../utils'

export default function UserProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user: currentUser, isAuthenticated, loginWithGoogle } = useFirebaseAuth()
  const [profileUser, setProfileUser] = useState(null)
  const [dreams, setDreams] = useState([])
  const [isFriend, setIsFriend] = useState(false)
  const [requestSent, setRequestSent] = useState(false)
  const [loading, setLoading] = useState(true)
  const [addLoading, setAddLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      if (!id) return
      try {
        setLoading(true)
        let u = await getUser(id)
        if (!u && id.length <= 30) u = await getUserByUsername(id)
        setProfileUser(u)
        if (!u) return
        const all = await getPublicDreams()
        setDreams(all.filter(d => d.userId === u.id))
        if (isAuthenticated && currentUser?.uid !== id) {
          const friends = await areFriends(currentUser.uid, id)
          setIsFriend(friends)
        }
      } catch (err) {
        console.error('Error loading profile:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, isAuthenticated, currentUser?.uid])

  const handleAddFriend = async () => {
    if (!isAuthenticated) {
      await loginWithGoogle()
      return
    }
    if (!profileUser?.id) return
    try {
      setAddLoading(true)
      await sendFriendRequest(profileUser.id)
      setRequestSent(true)
    } catch (err) {
      console.error('Error sending request:', err)
    } finally {
      setAddLoading(false)
    }
  }

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-[40vh]'>
        <span className='loading loading-spinner loading-lg'></span>
      </div>
    )
  }

  if (!profileUser) {
    return (
      <div className='container mx-auto p-6'>
        <h1 className='text-2xl font-bold'>User not found</h1>
        <button className='btn btn-ghost mt-4' onClick={() => navigate(-1)}>Go back</button>
      </div>
    )
  }

  const name = profileUser.username ? `@${profileUser.username}` : getDisplayHandle(profileUser)
  const profileShareUrl = profileUser.username
    ? `${window.location.origin}/user/${profileUser.username}`
    : `${window.location.origin}/user/${profileUser.id}`

  return (
    <div className='container mx-auto p-6'>
      <div className='flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8'>
        <div className='avatar'>
          <div className='w-24 h-24 rounded-full'>
            <img src={profileUser.picture || '/default-avatar.png'} alt={name} />
          </div>
        </div>
        <div className='flex-1'>
          <h1 className='text-3xl font-bold'>{name}</h1>
          <p className='text-base-content/70 mt-1'>{dreams.length} public dreams</p>
          {isAuthenticated && currentUser?.uid !== profileUser.id && !isFriend && !requestSent && (
            <button
              className='btn btn-primary mt-4'
              onClick={handleAddFriend}
              disabled={addLoading}
            >
              {addLoading ? <span className='loading loading-spinner loading-sm'></span> : 'Add Friend'}
            </button>
          )}
          {requestSent && <p className='text-success mt-4'>Friend request sent</p>}
          {isFriend && <p className='text-base-content/70 mt-4'>Friends</p>}
        </div>
      </div>
      <p className='text-sm text-base-content/60 mb-6'>
        Share your profile: {window.location.origin}/user/{id}
      </p>
      <h2 className='text-xl font-semibold mb-4'>Public Dreams</h2>
      {dreams.length === 0 ? (
        <p className='text-base-content/70'>No public dreams yet.</p>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          {dreams.map((d) => (
            <div
              key={d.id}
              className='card bg-base-200 cursor-pointer hover:bg-base-300'
              onClick={() => navigate(`/dream/${d.id}`)}
            >
              <div className='card-body p-4'>
                <h3 className='font-semibold'>{d.title || 'Untitled'}</h3>
                <p className='text-sm text-base-content/70 line-clamp-2'>{d.content || d.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
