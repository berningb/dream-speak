import { useState, useEffect, useCallback } from 'react'
import { useAuth0 } from '@auth0/auth0-react'

const TOGGLE_FAVORITE_MUTATION = `
  mutation ToggleFavorite($dreamId: ID!) {
    toggleFavorite(dreamId: $dreamId)
  }
`

const GET_USER_FAVORITES = `
  query GetUserFavorites {
    userFavorites {
      id
      dreamId
      createdAt
      dream {
        id
        title
        description
        date
        image
        isPublic
        tags
        mood
        emotions
        colors
        user {
          id
          auth0Id
          email
          firstName
          lastName
          picture
        }
      }
    }
  }
`

export default function useDatabaseFavorites() {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { getIdTokenClaims, isAuthenticated, isLoading: auth0Loading } = useAuth0()

  const fetchFavorites = useCallback(async () => {
    if (!isAuthenticated || auth0Loading) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const tokenClaims = await getIdTokenClaims()
      if (!tokenClaims || !tokenClaims.__raw) {
        throw new Error('Token not available')
      }

      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenClaims.__raw}`
        },
        body: JSON.stringify({
          query: GET_USER_FAVORITES
        })
      })

      const { data, errors } = await response.json()
      if (errors) throw new Error(errors[0].message)

      setFavorites(data.userFavorites)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, auth0Loading, getIdTokenClaims])

  const toggleFavorite = useCallback(async (dreamId) => {
    if (!isAuthenticated || auth0Loading) return

    try {
      const tokenClaims = await getIdTokenClaims()
      if (!tokenClaims || !tokenClaims.__raw) {
        throw new Error('Token not available')
      }

      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenClaims.__raw}`
        },
        body: JSON.stringify({
          query: TOGGLE_FAVORITE_MUTATION,
          variables: { dreamId }
        })
      })

      const { data, errors } = await response.json()
      if (errors) throw new Error(errors[0].message)

      // Refresh favorites after toggle
      await fetchFavorites()
      
      return data.toggleFavorite
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [isAuthenticated, auth0Loading, getIdTokenClaims, fetchFavorites])

  const isFavorited = useCallback((dreamId) => {
    return favorites.some(favorite => favorite.dreamId === dreamId)
  }, [favorites])

  const getFavorites = useCallback(() => {
    return favorites
  }, [favorites])

  const removeFavorite = useCallback(async (dreamId) => {
    await toggleFavorite(dreamId)
  }, [toggleFavorite])

  useEffect(() => {
    if (!auth0Loading) {
      fetchFavorites()
    }
  }, [fetchFavorites, auth0Loading])

  return {
    favorites,
    loading,
    error,
    toggleFavorite,
    isFavorited,
    getFavorites,
    removeFavorite,
    fetchFavorites
  }
} 