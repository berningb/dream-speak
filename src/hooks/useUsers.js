import { useState, useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { gql } from 'graphql-tag'

// Query to fetch all users
const GET_ALL_USERS = gql`
  query {
    users {
      id
      firstName
      lastName
      email
      picture
    }
  }
`

// Query to fetch authenticated user by authID
const GET_AUTH_USER = gql`
  query ($authID: String!) {
    user(authID: $authID) {
      id
      firstName
      lastName
      email
      picture
    }
  }
`

export default function useUsers () {
  const { getIdTokenClaims, isAuthenticated, user } = useAuth0()
  const [users, setUsers] = useState([])
  const [authUser, setAuthUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchUsers = async () => {
      if (!isAuthenticated) return

      setLoading(true)
      try {
        const tokenClaims = await getIdTokenClaims()
        const token = tokenClaims.__raw

        const response = await fetch('http://localhost:4000/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            query: GET_ALL_USERS.loc.source.body
          })
        })

        const { data, errors } = await response.json()
        if (errors) throw new Error(errors[0].message)

        setUsers(data.users)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    const fetchAuthUser = async () => {
      if (!isAuthenticated || !user) return

      setLoading(true)
      try {
        const tokenClaims = await getIdTokenClaims()
        const token = tokenClaims.__raw

        const response = await fetch('http://localhost:4000/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            query: GET_AUTH_USER.loc.source.body,
            variables: { authID: user.sub }
          })
        })

        const { data, errors } = await response.json()
        if (errors) throw new Error(errors[0].message)

        setAuthUser(data.user) // Adjusted to match the new query
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
    fetchAuthUser()
  }, [isAuthenticated, getIdTokenClaims, user])

  return { users, authUser, loading, error }
}
