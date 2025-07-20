import { useState, useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'

export default function useFavorites() {
  const [favorites, setFavorites] = useState(new Set())
  const { user } = useAuth0()

  // Load favorites from localStorage on mount
  useEffect(() => {
    if (user?.sub) {
      const storedFavorites = localStorage.getItem(`favorites_${user.sub}`)
      if (storedFavorites) {
        try {
          setFavorites(new Set(JSON.parse(storedFavorites)))
        } catch (error) {
          console.error('Error loading favorites from localStorage:', error)
        }
      }
    }
  }, [user?.sub])

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    if (user?.sub) {
      localStorage.setItem(`favorites_${user.sub}`, JSON.stringify([...favorites]))
    }
  }, [favorites, user?.sub])

  const toggleFavorite = (dreamId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(dreamId)) {
        newFavorites.delete(dreamId)
      } else {
        newFavorites.add(dreamId)
      }
      return newFavorites
    })
  }

  const isFavorited = (dreamId) => {
    return favorites.has(dreamId)
  }

  const getFavorites = () => {
    return favorites
  }

  const removeFavorite = (dreamId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      newFavorites.delete(dreamId)
      return newFavorites
    })
  }

  return {
    favorites,
    toggleFavorite,
    isFavorited,
    getFavorites,
    removeFavorite
  }
} 