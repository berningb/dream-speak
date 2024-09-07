import React from 'react'
import Layout from '../components/Layout'
import useUsers from '../hooks/useUsers'

function User () {
  const { users, authUser, loading, error } = useUsers()

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <Layout>
      <div>
        <h1>User Page</h1>
        {users.length === 0 ? (
          <div>No users found</div>
        ) : (
          <ul>
            {users.map(user => (
              <li key={user.id}>
                <h2>
                  {user.firstName} {user.lastName}
                </h2>
                <p>{user.email}</p>
                {user.picture && (
                  <img
                    src={user.picture}
                    alt={`${user.firstName} ${user.lastName}`}
                  />
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  )
}

export default User
