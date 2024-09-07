import { useState, useEffect, useCallback } from 'react'
import { useAuth0 } from '@auth0/auth0-react'

const GET_USER_DREAMS = `
  query GetUserDreams {
    dreams {
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

const ADD_DREAM_MUTATION = `
  mutation AddDream($userId: ID!, $title: String!, $date: String!, $description: String!, $tags: [String!]!, $isPublic: Boolean!, $image: String) {
    addDream(userId: $userId, title: $title, date: $date, description: $description, tags: $tags, isPublic: $isPublic, image: $image) {
      id
      title
      date
      description
      tags
      isPublic
      image
    }
  }
`

export default function useDreams () {
  const { getIdTokenClaims, isAuthenticated } = useAuth0()
  const [dreams, setDreams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchDreams = useCallback(async () => {
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
          query: GET_USER_DREAMS
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
  }, [isAuthenticated, getIdTokenClaims])

  const addDream = useCallback(
    async newDream => {
      if (!isAuthenticated) return

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
            query: ADD_DREAM_MUTATION,
            variables: {
              userId: tokenClaims.sub,
              ...newDream
            }
          })
        })

        const { data, errors } = await response.json()
        console.log('Response data:', data)
        if (errors) throw new Error(errors[0].message)

        setDreams(prevDreams => [...prevDreams, data.addDream])
        fetchDreams() // Fetch dreams after adding a new one
      } catch (err) {
        setError(err.message)
      }
    },
    [isAuthenticated, getIdTokenClaims, fetchDreams]
  )

  useEffect(() => {
    fetchDreams()
  }, [fetchDreams])

  return { dreams, loading, error, addDream, fetchDreams }
}
