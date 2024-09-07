import { useState, useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import gql from 'graphql-tag'
import useUsers from './useUsers'

// Query to fetch dreams associated with the authenticated user
const GET_USER_DREAMS = gql`
  query GetUserDreams($where: DreamWhereInput) {
    dreams(where: $where) {
      id
      title
      date
      description
      image
      isPublic
      tags
      user {
        id
      }
    }
  }
`

export default function useDreams () {
  const { getIdTokenClaims, isAuthenticated } = useAuth0()
  const [dreams, setDreams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const { authUser } = useUsers()

  useEffect(() => {
    const fetchDreams = async () => {
      if (!isAuthenticated || !authUser) return

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
            query: GET_USER_DREAMS.loc.source.body,
            variables: { where: { user: { id: authUser.id } } }
          })
        })

        const { data, errors } = await response.json()
        if (errors) throw new Error(errors[0].message)

        setDreams(data.dreams)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchDreams()
  }, [isAuthenticated, authUser, getIdTokenClaims])

  return { dreams, loading, error }
}
