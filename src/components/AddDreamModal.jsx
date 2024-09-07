import React, { useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import useDreams from '../hooks/useDreams'

function AddDreamModal ({ onAddDream }) {
  const { addDream } = useDreams()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [tags, setTags] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [image, setImage] = useState('')

  const handleSubmit = async e => {
    e.preventDefault()

    const newDream = {
      title,
      description,
      date: new Date(date).toISOString(),
      tags: tags.split(',').map(tag => tag.trim()),
      isPublic,
      image: image || null
    }

    try {
      await addDream(newDream)
      document.getElementById('add_dream_modal').close()
      onAddDream() // Call the onAddDream function after adding a new dream
    } catch (err) {
      console.error('Error adding dream:', err)
    }
  }

  return (
    <dialog id='add_dream_modal' className='modal'>
      <div className='modal-box'>
        <h3 className='font-bold text-lg'>Add a New Dream</h3>
        <form onSubmit={handleSubmit}>
          <div className='py-4'>
            <label>Title</label>
            <input
              type='text'
              className='input input-bordered w-full'
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>
          <div className='py-4'>
            <label>Description</label>
            <textarea
              className='textarea textarea-bordered w-full'
              value={description}
              onChange={e => setDescription(e.target.value)}
            ></textarea>
          </div>
          <div className='py-4'>
            <label>Date</label>
            <input
              type='date'
              className='input input-bordered w-full'
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>
          <div className='py-4'>
            <label>Tags</label>
            <input
              type='text'
              className='input input-bordered w-full'
              value={tags}
              onChange={e => setTags(e.target.value)}
            />
          </div>
          <div className='py-4'>
            <label>Public</label>
            <input
              type='checkbox'
              className='checkbox'
              checked={isPublic}
              onChange={e => setIsPublic(e.target.checked)}
            />
          </div>
          <div className='py-4'>
            <label>Image</label>
            <input
              type='text'
              className='input input-bordered w-full'
              value={image}
              onChange={e => setImage(e.target.value)}
            />
          </div>
          <div className='modal-action'>
            <button type='submit' className='btn'>
              Save
            </button>
            <button
              type='button'
              className='btn'
              onClick={() => document.getElementById('add_dream_modal').close()}
            >
              Close
            </button>
          </div>
        </form>
      </div>
    </dialog>
  )
}

export default AddDreamModal
