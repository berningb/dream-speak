import { useCallback, useState } from 'react'
import Layout from '../../components/Layout'
import AddDreamModal from '../../components/AddDreamModal'

import dreamGood from '../../images/dream_good_tran.png'
import dreamBad from '../../images/dream_bad_tran.png'
import dreamLucid from '../../images/dream_lucid_tran.png'

export default function NewDream () {
  const [selectedType, setSelectedType] = useState('sweet') // sweet | lucid | nightmare
  const openAddModal = useCallback(() => {
    document.getElementById('add_dream_modal')?.showModal()
  }, [])

  const handleAfterAdd = useCallback(() => {
    // After finishing or closing, go back to My Dreams
    window.location.href = '/my-dreams'
  }, [])

  const cards = [
    { key: 'good', label: 'Sweet Dream', image: dreamGood, type: 'sweet' },
    { key: 'bad', label: 'Wild Nightmare', image: dreamBad, type: 'nightmare' },
    { key: 'lucid', label: 'Lucid Adventure', image: dreamLucid, type: 'lucid' }
  ]

  return (
    <Layout>
      <AddDreamModal onAddDream={handleAfterAdd} initialDreamType={selectedType} />
      <div className='flex flex-col items-center justify-start min-h-screen p-6'>
        <div className='w-full max-w-5xl'>
          <div className='flex items-center justify-between mb-8'>
            <div>
              <h1 className='text-4xl font-bold mb-2'>Start a New Dream</h1>
              <p className='text-base-content/60'>Pick a vibe to inspire your entry. You can change details after.</p>
            </div>
            <a href='/my-dreams' className='btn btn-ghost'>Back to My Dreams</a>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-3 gap-6'>
            {cards.map(({ key, label, image, type }) => (
              <button
                key={key}
                className={`group card relative overflow-hidden transition-transform hover:scale-[1.01] cursor-pointer border rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 text-white border-primary/40 shadow-[0_8px_24px_rgba(0,0,0,0.25)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.35)]`}
                onClick={() => {
                  setSelectedType(type)
                  openAddModal()
                }}
              >
                {/* Subtle type overlay to match My Dreams cards */}
                <div className={`absolute inset-0 z-0 bg-gradient-to-br ${
                  key === 'good' ? 'from-sky-400/15 to-blue-400/5' : key === 'bad' ? 'from-violet-400/15 to-fuchsia-400/5' : 'from-emerald-400/15 to-green-400/5'
                }`} />

                <div className='relative z-20'>
                  <div className='rounded-t-box flex items-center justify-center p-2'>
                    <img
                      src={image}
                      alt={label}
                      className={`w-full max-h-80 object-contain drop-shadow-[0_14px_28px_rgba(0,0,0,0.35)]`}
                    />
                  </div>
                  <div className='card-body p-4'>
                    <h4 className={`card-title text-base text-white`}>{label}</h4>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className='mt-8 flex items-center gap-3'>
            <button className='btn btn-primary' onClick={openAddModal}>Just start writing</button>
            <a href='/my-dreams' className='btn btn-ghost'>Cancel</a>
          </div>
        </div>
      </div>
    </Layout>
  )
}


