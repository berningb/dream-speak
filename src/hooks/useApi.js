import { useState, useEffect, useCallback } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { getApiUrl } from '../utils'

export default function useApi() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { getIdTokenClaims, isAuthenticated, isLoading: auth0Loading } = useAuth0()

  const apiCall = useCallback(async (query, variables = {}) => {
    // Don't make API calls if Auth0 is still loading or user is not authenticated
    if (auth0Loading || !isAuthenticated) {
      return null
    }

    try {
      setLoading(true)
      setError(null)
      
      const tokenClaims = await getIdTokenClaims()
      if (!tokenClaims || !tokenClaims.__raw) {
        throw new Error('Token not available')
      }

      const response = await fetch(getApiUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenClaims.__raw}`
        },
        body: JSON.stringify({
          query,
          variables
        })
      })

      const data = await response.json()
      
      if (data.errors) {
        throw new Error(data.errors[0].message)
      }

      return data.data
    } catch (err) {
      setError(err.message)
      console.error('API call error:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [auth0Loading, isAuthenticated, getIdTokenClaims])

  // Set loading to false when Auth0 is done loading and user is not authenticated
  useEffect(() => {
    if (!auth0Loading && !isAuthenticated) {
      setLoading(false)
    }
  }, [auth0Loading, isAuthenticated])

  return {
    apiCall,
    loading: auth0Loading || loading,
    error,
    isAuthenticated
  }
} 