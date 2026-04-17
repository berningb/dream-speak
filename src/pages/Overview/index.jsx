import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext'
import { getMyDreams } from '../../services/firebaseService'
import AddDreamWorkflow from '../../components/AddDreamWorkflow'
import { formatDreamDate, getDreamCalendarDayKey } from '../../utils'

dayjs.extend(customParseFormat)

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function dreamDateForDisplay(dream) {
  const raw = dream?.date ?? dream?.createdAt
  if (!raw) return 'No date'
  if (typeof raw === 'string') return formatDreamDate(raw)
  if (typeof raw === 'object' && raw.seconds != null) {
    return formatDreamDate(new Date(raw.seconds * 1000).toISOString())
  }
  return formatDreamDate(String(raw))
}

function buildMonthGrid(year, monthZeroIndexed) {
  const first = dayjs(new Date(year, monthZeroIndexed, 1))
  const daysInMonth = first.daysInMonth()
  const startWeekday = first.day()
  const cells = []
  for (let i = 0; i < startWeekday; i += 1) {
    cells.push({ type: 'pad' })
  }
  for (let d = 1; d <= daysInMonth; d += 1) {
    cells.push({ type: 'day', day: d })
  }
  return cells
}

export default function Overview() {
  const { isAuthenticated, loginWithGoogle } = useFirebaseAuth()
  const [cursor, setCursor] = useState(() => dayjs().startOf('month'))
  const [dreams, setDreams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pickDayModal, setPickDayModal] = useState(null)
  const [dreamPreview, setDreamPreview] = useState(null)
  const [addDreamDateKey, setAddDreamDateKey] = useState(null)

  const year = cursor.year()
  const month = cursor.month()

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false)
      setDreams([])
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        const list = await getMyDreams()
        if (!cancelled) setDreams(list || [])
      } catch (e) {
        console.error(e)
        if (!cancelled) setError('Could not load your dreams.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [isAuthenticated])

  const refreshDreams = async () => {
    try {
      const list = await getMyDreams()
      setDreams(list || [])
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    if (!addDreamDateKey) return
    const id = requestAnimationFrame(() => {
      document.getElementById('overview_add_dream_modal')?.showModal()
    })
    return () => cancelAnimationFrame(id)
  }, [addDreamDateKey])

  const dreamsByDay = useMemo(() => {
    const map = new Map()
    for (const dream of dreams) {
      const key = getDreamCalendarDayKey(dream)
      if (!key) continue
      if (!dayjs(key, 'YYYY-MM-DD', true).isSame(cursor, 'month')) continue
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(dream)
    }
    return map
  }, [dreams, cursor])

  const monthLabel = cursor.format('MMMM YYYY')
  const grid = useMemo(() => buildMonthGrid(year, month), [year, month])

  const stats = useMemo(() => {
    const todayStart = dayjs().startOf('day')
    const lastDay = cursor.endOf('month').date()
    let loggedDays = 0
    let missedDays = 0
    for (let d = 1; d <= lastDay; d += 1) {
      const m = dayjs(new Date(year, month, d)).startOf('day')
      if (m.isAfter(todayStart, 'day')) continue
      const key = m.format('YYYY-MM-DD')
      const list = dreamsByDay.get(key)
      if (list?.length) {
        loggedDays += 1
        continue
      }
      if (m.isSame(todayStart, 'day')) continue
      missedDays += 1
    }
    return { loggedDays, missedDays }
  }, [year, month, dreamsByDay, cursor])

  const goPrev = () => setCursor((c) => c.subtract(1, 'month'))
  const goNext = () => setCursor((c) => c.add(1, 'month'))
  const goThisMonth = () => setCursor(dayjs().startOf('month'))

  const getDayState = (dayNum) => {
    const todayStart = dayjs().startOf('day')
    const m = dayjs(new Date(year, month, dayNum)).startOf('day')
    const key = m.format('YYYY-MM-DD')
    const list = dreamsByDay.get(key) || []
    const isFuture = m.isAfter(todayStart, 'day')
    const isToday = m.isSame(todayStart, 'day')
    const hasDreams = list.length > 0
    return { key, list, isFuture, isToday, hasDreams, m }
  }

  const handleDayClick = (dayNum) => {
    const { list, isFuture, m } = getDayState(dayNum)
    if (isFuture) return
    if (list.length === 0) {
      setAddDreamDateKey(m.format('YYYY-MM-DD'))
      return
    }
    if (list.length === 1) {
      setDreamPreview(list[0])
      return
    }
    setPickDayModal({ dateLabel: m.format('MMMM D, YYYY'), dreams: list })
  }

  const openDreamFromPick = (d) => {
    setPickDayModal(null)
    setDreamPreview(d)
  }

  if (loading && isAuthenticated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <span className="loading loading-spinner loading-lg" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-6 px-4 py-12 text-center">
        <h1 className="text-2xl font-bold">Monthly overview</h1>
        <p className="text-base-content/75">Sign in to see which days you logged dreams and which days you missed.</p>
        <button type="button" className="btn btn-primary" onClick={loginWithGoogle}>
          Sign in with Google
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-8 pt-2 sm:px-6">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Monthly overview</h1>
        <p className="mt-1 text-sm text-base-content/65">Each day uses your dream date (or when you saved it if no date is set).</p>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <button type="button" className="btn btn-ghost btn-sm btn-square" onClick={goPrev} aria-label="Previous month">
            ‹
          </button>
          <h2 className="min-w-[10rem] text-center text-lg font-semibold">{monthLabel}</h2>
          <button type="button" className="btn btn-ghost btn-sm btn-square" onClick={goNext} aria-label="Next month">
            ›
          </button>
        </div>
        <button type="button" className="btn btn-outline btn-sm" onClick={goThisMonth}>
          This month
        </button>
      </div>

      {error && (
        <div className="alert alert-error mb-4 text-sm">{error}</div>
      )}

      <div className="mb-6 grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
        <div className="rounded-xl border border-base-300 bg-base-200/80 px-3 py-3">
          <p className="text-2xl font-bold text-primary">{stats.loggedDays}</p>
          <p className="text-xs text-base-content/60">Days with dreams</p>
        </div>
        <div className="rounded-xl border border-base-300 bg-base-200/80 px-3 py-3">
          <p className="text-2xl font-bold text-error/90">{stats.missedDays}</p>
          <p className="text-xs text-base-content/60">Days missed</p>
        </div>
        <div className="rounded-xl border border-base-300 bg-base-200/80 px-3 py-3 sm:col-span-2">
          <p className="text-xs text-base-content/60">
            Missed counts past days in this month with no dream. Today is highlighted until you log one.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-base-300 bg-base-200/50 p-3 sm:p-4">
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-wide text-base-content/50 sm:text-xs">
          {WEEKDAYS.map((w) => (
            <div key={w} className="py-1">
              {w}
            </div>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {grid.map((cell, idx) => {
            if (cell.type === 'pad') {
              return <div key={`pad-${idx}`} className="aspect-square min-h-[2.5rem]" />
            }
            const { day } = cell
            const { list, isFuture, isToday, hasDreams } = getDayState(day)
            const missed = !isFuture && !hasDreams && !isToday

            let cellClass =
              'flex aspect-square min-h-[2.5rem] flex-col items-center justify-center rounded-lg border text-sm font-medium transition-colors '
            if (isFuture) {
              cellClass += 'cursor-default border-transparent bg-base-300/20 text-base-content/35'
            } else if (hasDreams) {
              cellClass +=
                'cursor-pointer border-primary/40 bg-primary/20 text-primary hover:bg-primary/30'
            } else if (isToday) {
              cellClass +=
                'cursor-pointer border-warning/50 bg-warning/10 text-base-content ring-1 ring-warning/40 hover:bg-warning/15'
            } else if (missed) {
              cellClass +=
                'cursor-pointer border-error/25 bg-error/10 text-error/80 hover:bg-error/15'
            } else {
              cellClass += 'cursor-pointer border-base-content/10 bg-base-300/30 text-base-content/70'
            }

            return (
              <button
                key={`day-${day}`}
                type="button"
                className={cellClass}
                onClick={() => handleDayClick(day)}
                disabled={isFuture}
                aria-label={`${dayjs(new Date(year, month, day)).format('MMMM D')}${
                  hasDreams ? `, ${list.length} dream${list.length > 1 ? 's' : ''}` : isFuture ? ', upcoming' : missed ? ', no dream logged' : ''
                }`}
              >
                <span>{day}</span>
                {hasDreams && (
                  <span className="mt-0.5 text-[10px] font-normal opacity-90">{list.length > 1 ? list.length : '●'}</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-base-content/60">
        <span className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded bg-primary/25 ring-1 ring-primary/40" /> Dream logged
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded bg-error/15 ring-1 ring-error/25" /> Missed
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded bg-base-300/40" /> Upcoming
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded bg-warning/10 ring-1 ring-warning/30" /> Today
        </span>
      </div>

      {pickDayModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md rounded-2xl border border-base-300">
            <h3 className="font-semibold text-lg">{pickDayModal.dateLabel}</h3>
            <p className="mb-3 text-sm text-base-content/65">Choose a dream to view</p>
            <ul className="menu rounded-box bg-base-300/40 p-2">
              {pickDayModal.dreams.map((d) => (
                <li key={d.id}>
                  <button type="button" className="w-full text-left" onClick={() => openDreamFromPick(d)}>
                    {d.title || 'Untitled dream'}
                  </button>
                </li>
              ))}
            </ul>
            <div className="modal-action mt-4">
              <button type="button" className="btn" onClick={() => setPickDayModal(null)}>
                Close
              </button>
            </div>
          </div>
          <button type="button" className="modal-backdrop" onClick={() => setPickDayModal(null)} aria-label="Close dialog" />
        </div>
      )}

      {dreamPreview && (
        <div className="modal modal-open">
          <div className="modal-box max-h-[min(90vh,640px)] max-w-lg overflow-y-auto rounded-2xl border border-base-300">
            <h3 className="font-semibold text-lg leading-snug">{dreamPreview.title || 'Untitled dream'}</h3>
            <p className="mt-1 text-sm text-base-content/60">{dreamDateForDisplay(dreamPreview)}</p>
            <div className="mt-4 whitespace-pre-wrap text-sm text-base-content/90">
              {dreamPreview.content || dreamPreview.description || 'No description.'}
            </div>
            <div className="modal-action mt-6 flex flex-wrap gap-2">
              <Link
                to={`/dream/${dreamPreview.id}`}
                className="btn btn-primary btn-sm"
                onClick={() => setDreamPreview(null)}
              >
                Open full page
              </Link>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setDreamPreview(null)}>
                Close
              </button>
            </div>
          </div>
          <button type="button" className="modal-backdrop" onClick={() => setDreamPreview(null)} aria-label="Close dialog" />
        </div>
      )}

      {addDreamDateKey && (
        <AddDreamWorkflow
          key={addDreamDateKey}
          dialogId="overview_add_dream_modal"
          initialDate={addDreamDateKey}
          onClose={() => setAddDreamDateKey(null)}
          onAddDream={() => {
            setAddDreamDateKey(null)
            refreshDreams()
          }}
        />
      )}
    </div>
  )
}
