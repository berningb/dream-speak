import { useState, useEffect } from 'react'
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext'
import { useBackendUser } from '../../hooks/useUsers'
import {
  getFriends,
  getPendingFriendRequests,
  getSentFriendRequests,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  getUser,
  getUserByUsername
} from '../../services/firebaseService'
import { getDisplayHandle } from '../../utils'

export default function Connections() {
  const { user, isAuthenticated, loginWithGoogle } = useFirebaseAuth()
  const { backendUser } = useBackendUser()
  const [friends, setFriends] = useState([])
  const [pending, setPending] = useState([])
  const [sent, setSent] = useState([])
  const [loading, setLoading] = useState(true)
  const [addInput, setAddInput] = useState('')
  const [addError, setAddError] = useState(null)
  const [addLoading, setAddLoading] = useState(false)

  const fetch = async () => {
    if (!isAuthenticated || !user) return
    try {
      setLoading(true)
      const [f, p, s] = await Promise.all([
        getFriends(),
        getPendingFriendRequests(),
        getSentFriendRequests()
      ])
      setFriends(f)
      setPending(p)
      setSent(s)
    } catch (err) {
      console.error('Error fetching connections:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetch()
  }, [isAuthenticated, user])

  const resolveHandleToUserId = async (input) => {
    const trimmed = input.trim()
    const match = trimmed.match(/\/user\/([a-zA-Z0-9_-]+)/)
    const handle = match ? match[1] : trimmed
    if (!handle) return null
    if (handle.length >= 20 && handle.length <= 50) {
      const u = await getUser(handle)
      return u?.id || null
    }
    const byUsername = await getUserByUsername(handle)
    return byUsername?.id || null
  }

  const handleAddFriend = async () => {
    const friendId = await resolveHandleToUserId(addInput)
    if (!friendId) {
      setAddError('Enter a username or profile URL')
      return
    }
    if (friendId === user?.uid) {
      setAddError('Cannot add yourself')
      return
    }
    try {
      setAddLoading(true)
      setAddError(null)
      const targetUser = await getUser(friendId)
      if (!targetUser) {
        setAddError('User not found')
        return
      }
      await sendFriendRequest(friendId)
      setAddInput('')
      await fetch()
    } catch (err) {
      setAddError(err.message || 'Failed to send request')
    } finally {
      setAddLoading(false)
    }
  }

  const handleAccept = async (requestId) => {
    try {
      await acceptFriendRequest(requestId)
      await fetch()
    } catch (err) {
      console.error('Error accepting:', err)
    }
  }

  const handleReject = async (requestId) => {
    try {
      await rejectFriendRequest(requestId)
      await fetch()
    } catch (err) {
      console.error('Error rejecting:', err)
    }
  }

  const handleRemoveFriend = async (friendId) => {
    try {
      await removeFriend(friendId)
      await fetch()
    } catch (err) {
      console.error('Error removing friend:', err)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[60vh] p-6'>
        <h1 className='text-3xl font-bold mb-4'>Connections</h1>
        <p className='text-base-content/70 mb-6'>Sign in to manage your friends and connections.</p>
        <button className='btn btn-primary' onClick={loginWithGoogle}>Sign In with Google</button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-[40vh]'>
        <span className='loading loading-spinner loading-lg'></span>
      </div>
    )
  }

  return (
    <div className='container mx-auto p-6'>
      <h1 className='text-3xl font-bold mb-6'>Connections</h1>
      <p className='text-base-content/70 mb-8'>
        Manage your friends. Friends can see and interact with content you share with "friends only."
      </p>

      <div className='bg-base-200 rounded-lg p-6 mb-8'>
        <h2 className='text-xl font-semibold mb-3'>Add Friend</h2>
        <p className='text-sm text-base-content/70 mb-4'>
          Share your profile so others can add you: <a href={backendUser?.username ? `/user/${backendUser.username}` : `/user/${user?.uid}`} className='link'>{window.location.origin}/user/{backendUser?.username || user?.uid}</a>
        </p>
        <p className='text-sm text-base-content/70 mb-4'>
          Add a friend by their username (e.g. dreamer_jane) or profile URL.
        </p>
        <div className='flex gap-2 flex-wrap'>
          <input
            type='text'
            className='input input-bordered flex-1 min-w-[200px]'
            value={addInput}
            onChange={(e) => { setAddInput(e.target.value); setAddError(null); }}
            placeholder='Username or profile URL'
          />
          <button className='btn btn-primary' onClick={handleAddFriend} disabled={addLoading}>
            {addLoading ? <span className='loading loading-spinner loading-sm'></span> : 'Send Request'}
          </button>
        </div>
        {addError && <p className='text-error text-sm mt-2'>{addError}</p>}
      </div>

      <PendingWithUsers requests={pending} onAccept={handleAccept} onReject={handleReject} />

      <SentWithUsers requests={sent} />

      <div className='bg-base-200 rounded-lg p-6'>
        <h2 className='text-xl font-semibold mb-4'>Friends ({friends.length})</h2>
        {friends.length === 0 ? (
          <p className='text-base-content/70'>No friends yet. Add friends using their username or profile URL.</p>
        ) : (
          <ul className='space-y-2'>
            {friends.map((f) => (
              <li key={f.id} className='flex items-center justify-between py-2 border-b border-base-300'>
                <span>{f.username ? `@${f.username}` : getDisplayHandle(f)}</span>
                <button className='btn btn-sm btn-ghost text-error' onClick={() => handleRemoveFriend(f.id)}>Remove</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function SentWithUsers({ requests }) {
  const [users, setUsers] = useState({})
  useEffect(() => {
    if (requests.length === 0) return
    const load = async () => {
      const map = {}
      for (const req of requests) {
        const u = await getUser(req.toUserId)
        map[req.id] = u
      }
      setUsers(map)
    }
    load()
  }, [requests])
  if (requests.length === 0) return null
  return (
    <div className='bg-base-200 rounded-lg p-6 mb-8'>
      <h2 className='text-xl font-semibold mb-4'>Sent Requests</h2>
      <ul className='space-y-2'>
        {requests.map((req) => {
          const toUser = users[req.id]
          const name = toUser ? (toUser.username ? `@${toUser.username}` : getDisplayHandle(toUser)) : req.toUserId
          return (
            <li key={req.id} className='flex items-center justify-between py-2 border-b border-base-300'>
              <span>Request to {name}</span>
              <span className='badge badge-ghost'>Pending</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function PendingWithUsers({ requests, onAccept, onReject }) {
  const [users, setUsers] = useState({})
  useEffect(() => {
    if (requests.length === 0) return
    const load = async () => {
      const map = {}
      for (const req of requests) {
        const u = await getUser(req.fromUserId)
        map[req.id] = u
      }
      setUsers(map)
    }
    load()
  }, [requests])
  if (requests.length === 0) return null
  return (
    <div className='bg-base-200 rounded-lg p-6 mb-8'>
      <h2 className='text-xl font-semibold mb-4'>Pending Requests</h2>
      <ul className='space-y-2'>
        {requests.map((req) => {
          const fromUser = users[req.id]
          const name = fromUser ? (fromUser.username ? `@${fromUser.username}` : getDisplayHandle(fromUser)) : req.fromUserId
          return (
            <li key={req.id} className='flex items-center justify-between py-2 border-b border-base-300'>
              <span>{name}</span>
              <div className='flex gap-2'>
                <button className='btn btn-sm btn-primary' onClick={() => onAccept(req.id)}>Accept</button>
                <button className='btn btn-sm btn-ghost' onClick={() => onReject(req.id)}>Reject</button>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
