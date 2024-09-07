import React, { useState } from 'react'
import { IoAdd } from 'react-icons/io5'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import useDreams from '../hooks/useDreams'
import AddDreamModal from '../components/AddDreamModal'

const DreamItem = ({ dream }) => {
  const navigate = useNavigate()

  return (
    <div className='dream-item' onClick={() => navigate(`/dream/${dream.id}`)}>
      <h2>{dream.title}</h2>
    </div>
  )
}

export default function MyDreams () {
  const { dreams, loading, error, fetchDreams } = useDreams()

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  const handleAddDream = async () => {
    await fetchDreams() // Fetch dreams after adding a new one
  }

  console.log(dreams)
  return (
    <Layout>
      <AddDreamModal onAddDream={handleAddDream} />

      <div className='flex flex-col items-center justify-start h-screen'>
        <h1 className='text-4xl font-bold text-center py-6'>My Dreams</h1>
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full max-w-2xl'>
          {dreams.map(dream => (
            <DreamItem key={dream.id} dream={dream} />
          ))}
        </div>
      </div>
    </Layout>
  )
}
