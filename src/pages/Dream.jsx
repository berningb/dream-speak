import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import useDreams from '../hooks/useDreams'

export default function Dream () {
  const { id } = useParams()
  const { dreams } = useDreams()
  const [dream, setDream] = useState(null)

  useEffect(() => {
    const foundDream = dreams.find(d => d.id === id)
    setDream(foundDream)
  }, [id, dreams])

  if (!dream) return <div>Loading...</div>

  return (
    <Layout>
      <div className='dream-page'>
        <h1>{dream.title}</h1>
        <p>{dream.description}</p>
        <p>{dream.date}</p>
        {dream.image && <img src={dream.image} alt={dream.title} />}
      </div>
    </Layout>
  )
}
