import { useState, useEffect, useCallback } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import useApi from './useApi'

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
  const { user } = useAuth0()
  const { apiCall, loading, error } = useApi()
  const [dreams, setDreams] = useState([])

  const fetchDreams = useCallback(async () => {
    const data = await apiCall(GET_USER_DREAMS)
    if (data) {
      setDreams(data.dreams)
    }
  }, [apiCall])

  const addDream = useCallback(
    async newDream => {
      if (!user) {
        console.error('User not authenticated or user object missing')
        return
      }

      try {
        const data = await apiCall(ADD_DREAM_MUTATION, newDream)
        if (data) {
          setDreams(prevDreams => [...prevDreams, data.addDream])
          fetchDreams() // Fetch dreams after adding a new one
        }
      } catch (err) {
        console.error('Error in addDream:', err)
      }
    },
    [apiCall, fetchDreams, user]
  )

  const updateDream = useCallback(
    async (dreamId, updatedData) => {
      const data = await apiCall(UPDATE_DREAM_MUTATION, {
        id: dreamId,
        ...updatedData
      })
      if (data) {
        // Update the dream in the local state
        setDreams(prevDreams => 
          prevDreams.map(dream => 
            dream.id === dreamId ? data.updateDream : dream
          )
        )
      }
    },
    [apiCall]
  )

  const deleteDream = useCallback(
    async (dreamId) => {
      const data = await apiCall(DELETE_DREAM_MUTATION, { dreamId })
      if (data && data.deleteDream) {
        // Remove the dream from the local state
        setDreams(prevDreams => 
          prevDreams.filter(dream => dream.id !== dreamId)
        )
      }
    },
    [apiCall]
  )

  useEffect(() => {
    fetchDreams()
  }, [fetchDreams])

  return { dreams, loading, error, addDream, updateDream, deleteDream, fetchDreams }
}
