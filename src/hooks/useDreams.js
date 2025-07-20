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
  mutation AddDream($title: String!, $date: String!, $description: String!, $tags: [String!]!, $isPublic: Boolean!, $image: String, $mood: String, $emotions: [String], $colors: [String], $role: Boolean, $people: [String], $places: [String], $things: [String]) {
    addDream(
      title: $title, 
      date: $date, 
      description: $description, 
      tags: $tags, 
      isPublic: $isPublic, 
      image: $image, 
      mood: $mood, 
      emotions: $emotions, 
      colors: $colors, 
      role: $role, 
      people: $people, 
      places: $places, 
      things: $things
    ) {
      id
      title
      date
      description
      tags
      isPublic
      image
      mood
      emotions
      colors
      role
      people
      places
      things
    }
  }
`

const UPDATE_DREAM_MUTATION = `
  mutation UpdateDream($id: ID!, $title: String!, $description: String!, $mood: String, $emotions: [String], $colors: [String], $role: Boolean, $people: [String], $places: [String], $things: [String]) {
    updateDream(
      id: $id,
      title: $title,
      description: $description,
      mood: $mood,
      emotions: $emotions,
      colors: $colors,
      role: $role,
      people: $people,
      places: $places,
      things: $things
    ) {
      id
      title
      date
      description
      tags
      isPublic
      image
      mood
      emotions
      colors
      role
      people
      places
      things
    }
  }
`

const DELETE_DREAM_MUTATION = `
  mutation DeleteDream($dreamId: ID!) {
    deleteDream(dreamId: $dreamId)
  }
`


export default function useDreams () {
  const { getIdTokenClaims, isAuthenticated, user, isLoading: auth0Loading } = useAuth0()
  const [dreams, setDreams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchDreams = useCallback(async () => {
    if (!isAuthenticated || auth0Loading) return

    console.log(user)

    setLoading(true)
    try {
      const tokenClaims = await getIdTokenClaims()
      if (!tokenClaims || !tokenClaims.__raw) {
        throw new Error('Token not available')
      }
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
  }, [isAuthenticated, auth0Loading, getIdTokenClaims, user])

  const addDream = useCallback(
    async newDream => {
      if (!isAuthenticated || !user || auth0Loading) {
        console.error('User not authenticated or user object missing')
        console.log('isAuthenticated:', isAuthenticated)
        console.log('user:', user)
        console.log('auth0Loading:', auth0Loading)
        return
      }

      try {
        const tokenClaims = await getIdTokenClaims()
        if (!tokenClaims || !tokenClaims.__raw) {
          throw new Error('Token not available')
        }
        const token = tokenClaims.__raw

        console.log('Adding dream with user:', user)
        console.log('Dream data:', newDream)
        console.log('Token available:', !!token)
        console.log('Token length:', token ? token.length : 0)

        const response = await fetch('http://localhost:4000/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` // Use the token here
          },
          body: JSON.stringify({
            query: ADD_DREAM_MUTATION,
            variables: {
              ...newDream
            }
          })
        })

        const { data, errors } = await response.json()
        console.log('Response data:', data)
        console.log('Response errors:', errors)
        if (errors) {
          console.error('GraphQL errors:', errors)
          throw new Error(errors[0].message)
        }

        setDreams(prevDreams => [...prevDreams, data.addDream])
        fetchDreams() // Fetch dreams after adding a new one
      } catch (err) {
        console.error('Error in addDream:', err)
        setError(err.message)
      }
    },
    [isAuthenticated, auth0Loading, getIdTokenClaims, fetchDreams, user]
  )

  const updateDream = useCallback(
    async (dreamId, updatedData) => {
      if (!isAuthenticated || auth0Loading) return

      try {
        const tokenClaims = await getIdTokenClaims()
        if (!tokenClaims || !tokenClaims.__raw) {
          throw new Error('Token not available')
        }
        const token = tokenClaims.__raw

        const response = await fetch('http://localhost:4000/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            query: UPDATE_DREAM_MUTATION,
            variables: {
              id: dreamId,
              ...updatedData
            }
          })
        })

        const { data, errors } = await response.json()
        console.log('Update response data:', data)
        if (errors) throw new Error(errors[0].message)

        // Update the dream in the local state
        setDreams(prevDreams => 
          prevDreams.map(dream => 
            dream.id === dreamId ? data.updateDream : dream
          )
        )
      } catch (err) {
        setError(err.message)
        throw err
      }
    },
    [isAuthenticated, auth0Loading, getIdTokenClaims]
  )

  const deleteDream = useCallback(
    async (dreamId) => {
      if (!isAuthenticated || auth0Loading) return

      try {
        const tokenClaims = await getIdTokenClaims()
        if (!tokenClaims || !tokenClaims.__raw) {
          throw new Error('Token not available')
        }
        const token = tokenClaims.__raw

        const response = await fetch('http://localhost:4000/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            query: DELETE_DREAM_MUTATION,
            variables: {
              dreamId
            }
          })
        })

        const { data, errors } = await response.json()
        console.log('Delete response data:', data)
        if (errors) throw new Error(errors[0].message)

        if (data.deleteDream) {
          // Remove the dream from the local state
          setDreams(prevDreams => 
            prevDreams.filter(dream => dream.id !== dreamId)
          )
        }
      } catch (err) {
        setError(err.message)
        throw err
      }
    },
    [isAuthenticated, auth0Loading, getIdTokenClaims]
  )

  useEffect(() => {
    if (!auth0Loading) {
      fetchDreams()
    }
  }, [fetchDreams, auth0Loading])

  return { dreams, loading, error, addDream, updateDream, deleteDream, fetchDreams }
}
