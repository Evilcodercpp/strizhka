'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const MASTER_PIN = process.env.NEXT_PUBLIC_MASTER_PIN || '1234'

export default function MasterPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState(false)
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0]
  })
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState('day') // 'day' | 'week'
  const [weekOffset, setWeekOffset] = useState(0)

  useEffect(() => {
    if (authenticated) {
      if (viewMode === 'day') {
        fetchDayAppointments(selectedDate)
      } else {
        fetchWeekAppointments()
      }
    }
  }, [authenticated, selectedDate, viewMode, weekOffset])

  async function fetchDayAppointments(date) {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('appointments')
        .select('*')
        .eq('date', date)
        .order('time', { ascending: true })

      setAppointments(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function fetchWeekAppointments() {
    setLoading(true)
    try {
      const start = getWeekStart(weekOffset)
      const end = new Date(start)
      end.setDate(end.getDate() + 6)

      const { data } = await supabase
        .from('appointments')
        .select('*')
        .gte('date', start.toISOString().split('T')[0])
        .lte('date', end.toISOString().split('T')[0])
        .order('date', { ascending: true })
        .order('time', { ascending: true })

      setAppointments(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function deleteAppointment(id) {
    if (!confirm('Удалить запись?')) return
    await supabase.from('appointments').delete().eq('id', id)
    // Refresh
    if (viewMode === 'day') {
      fetchDayAppointments(selectedDate)
    } else {
      fetchWeekAppointments()
    }
  }

  function handlePinSubmit(e) {
    e.preventDefault()
    if (pin === MASTER_PIN) {
      setAuthenticated(true)
      setPinError(false)
    } else {
      setPinError(true)
    }
  }

  function getWeekStart(offset = 0) {
    const now = new Date()
    const day = now.getDay()
    const diff = now.getDate() - day + (day === 0 ? -6 : 1) + offset * 7
    const monday = new Date(now.setDate(diff))
    monday.setHours(0, 0, 0, 0)
    return monday
  }

  function getWeekDays(offset = 0) {
    const start = getWeekStart(offset)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start)
      d.setDate(d.getDate() + i)
      return d
    })
  }

  function formatDate(dateStr) {
    return new Date(dateStr + 'T12:00').toLocaleDateString('ru-RU', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    })
  }

  function formatDateFull(dateStr) {
    return new Date(dateStr + 'T12:00').toLocaleDateString('ru-RU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  // PIN Screen
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-4">
        <form onSubmit={handlePinSubmit} className="max-w-sm w-full animate-fade-in-up">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-warm-100">
            <div className="w-14 h-14 mx-auto mb-6 rounded-full bg-salon-gold/10 flex items-center justify-center">
              <svg className="w-7 h-7 text-salon-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="font-display text-2xl text-center text-salon-dark mb-2">Панель мастера</h1>
            <p className="text-center text-warm-400 text-sm mb-6">Введите PIN-код для входа</p>
            <input
              type="password"
              value={pin}
              onChange={(e) => { setPin(e.target.value); setPinError(false) }}
              placeholder="••••"
              maxLength={8}
              className={`w-full px-4 py-3 rounded-xl border text-center text-2xl tracking-[0.5em]
                        bg-cream/50 text-salon-dark transition-all duration-200
                        ${pinError ? 'border-red-300 bg-red-50/50' : 'border-warm-200'}`}
              autoFocus
            />
            {pinError && (
              <p className="text-red-500 text-sm text-center mt-2">Неверный PIN</p>
            )}
            <button
              type="submit"
              className="w-full mt-4 py-3 bg-salon-gold text-white font-semibold rounded-xl
                       hover:bg-warm-500 transition-all duration-300"
            >
              Войти
            </button>
          </div>
        </form>
      </div>
    )
  }

  // Dashboard
  const today = new Date().toISOString().split('T')[0]
  const weekDays = getWeekDays(weekOffset)

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-salon-dark text-white">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl">Панель мастера</h1>
            <p className="text-warm-300 text-sm">Управление записями</p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="px-4 py-2 text-sm text-warm-300 hover:text-white border border-warm-700
                       rounded-lg hover:border-warm-500 transition-all duration-200"
            >
              ← На сайт
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* View Toggle */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex bg-white rounded-xl p-1 border border-warm-100">
            <button
              onClick={() => setViewMode('day')}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${viewMode === 'day'
                  ? 'bg-salon-gold text-white shadow-sm'
                  : 'text-warm-400 hover:text-salon-dark'
                }`}
            >
              День
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${viewMode === 'week'
                  ? 'bg-salon-gold text-white shadow-sm'
                  : 'text-warm-400 hover:text-salon-dark'
                }`}
            >
              Неделя
            </button>
          </div>

          {viewMode === 'day' ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const d = new Date(selectedDate)
                  d.setDate(d.getDate() - 1)
                  setSelectedDate(d.toISOString().split('T')[0])
                }}
                className="w-9 h-9 rounded-lg border border-warm-200 flex items-center justify-center
                         text-warm-400 hover:border-salon-gold hover:text-salon-gold transition-all"
              >
                ‹
              </button>
              <div className="text-center">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-4 py-2 rounded-xl border border-warm-200 bg-white text-salon-dark text-sm"
                />
              </div>
              <button
                onClick={() => {
                  const d = new Date(selectedDate)
                  d.setDate(d.getDate() + 1)
                  setSelectedDate(d.toISOString().split('T')[0])
                }}
                className="w-9 h-9 rounded-lg border border-warm-200 flex items-center justify-center
                         text-warm-400 hover:border-salon-gold hover:text-salon-gold transition-all"
              >
                ›
              </button>
              {selectedDate !== today && (
                <button
                  onClick={() => setSelectedDate(today)}
                  className="text-xs text-salon-gold hover:text-salon-brown underline underline-offset-2"
                >
                  Сегодня
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setWeekOffset(w => w - 1)}
                className="w-9 h-9 rounded-lg border border-warm-200 flex items-center justify-center
                         text-warm-400 hover:border-salon-gold hover:text-salon-gold transition-all"
              >
                ‹
              </button>
              <span className="text-sm text-salon-dark font-medium">
                {weekDays[0].toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                {' – '}
                {weekDays[6].toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
              </span>
              <button
                onClick={() => setWeekOffset(w => w + 1)}
                className="w-9 h-9 rounded-lg border border-warm-200 flex items-center justify-center
                         text-warm-400 hover:border-salon-gold hover:text-salon-gold transition-all"
              >
                ›
              </button>
              {weekOffset !== 0 && (
                <button
                  onClick={() => setWeekOffset(0)}
                  className="text-xs text-salon-gold hover:text-salon-brown underline underline-offset-2"
                >
                  Эта неделя
                </button>
              )}
            </div>
          )}
        </div>

        {/* Day View */}
        {viewMode === 'day' && (
          <div>
            <h2 className="font-display text-lg text-salon-dark mb-4 capitalize">
              {formatDateFull(selectedDate)}
            </h2>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <svg className="animate-spin w-8 h-8 text-salon-gold" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-16 text-warm-400">
                <svg className="w-16 h-16 mx-auto mb-4 text-warm-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="font-display text-xl text-warm-300 mb-1">Нет записей</p>
                <p className="text-sm">На этот день пока никто не записан</p>
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.map((apt) => (
                  <AppointmentCard key={apt.id} apt={apt} onDelete={deleteAppointment} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Week View */}
        {viewMode === 'week' && (
          <div className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <svg className="animate-spin w-8 h-8 text-salon-gold" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
            ) : (
              weekDays.map((day) => {
                const dateStr = day.toISOString().split('T')[0]
                const dayAppts = appointments.filter(a => a.date === dateStr)
                const isToday = dateStr === today

                return (
                  <div key={dateStr}>
                    <div className={`flex items-center gap-3 mb-3 ${isToday ? '' : ''}`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold
                        ${isToday
                          ? 'bg-salon-gold text-white'
                          : 'bg-warm-100 text-warm-500'
                        }`}
                      >
                        {day.getDate()}
                      </div>
                      <div>
                        <p className={`text-sm font-medium capitalize
                          ${isToday ? 'text-salon-gold' : 'text-salon-dark'}`}
                        >
                          {day.toLocaleDateString('ru-RU', { weekday: 'long' })}
                          {isToday && <span className="ml-2 text-xs bg-salon-gold/10 text-salon-gold px-2 py-0.5 rounded-full">сегодня</span>}
                        </p>
                        <p className="text-xs text-warm-400">
                          {dayAppts.length > 0
                            ? `${dayAppts.length} ${dayAppts.length === 1 ? 'запись' : dayAppts.length < 5 ? 'записи' : 'записей'}`
                            : 'нет записей'
                          }
                        </p>
                      </div>
                    </div>
                    {dayAppts.length > 0 ? (
                      <div className="space-y-2 ml-[52px]">
                        {dayAppts.map((apt) => (
                          <AppointmentCard key={apt.id} apt={apt} onDelete={deleteAppointment} compact />
                        ))}
                      </div>
                    ) : (
                      <div className="ml-[52px] py-2 text-warm-300 text-sm">—</div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* Stats */}
        {!loading && appointments.length > 0 && (
          <div className="mt-8 pt-6 border-t border-warm-100">
            <p className="text-sm text-warm-400">
              Всего записей: <span className="font-semibold text-salon-dark">{appointments.length}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function AppointmentCard({ apt, onDelete, compact = false }) {
  return (
    <div className={`bg-white rounded-xl border border-warm-100 hover:border-salon-gold/30
                    transition-all duration-200 hover:shadow-sm
                    ${compact ? 'p-3' : 'p-5'}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {/* Time badge */}
          <div className={`bg-salon-gold/10 rounded-lg flex items-center justify-center flex-shrink-0
            ${compact ? 'w-14 h-10 text-xs' : 'w-16 h-12 text-sm'}`}>
            <span className="font-semibold text-salon-gold">{apt.time}</span>
          </div>

          {/* Info */}
          <div className={compact ? 'space-y-0.5' : 'space-y-1'}>
            <h3 className={`font-medium text-salon-dark ${compact ? 'text-sm' : ''}`}>
              {apt.client_name}
            </h3>
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`text-warm-400 ${compact ? 'text-xs' : 'text-sm'}`}>
                {apt.service}
              </span>
              <a
                href={`https://t.me/${apt.telegram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-salon-gold hover:text-salon-brown transition-colors ${compact ? 'text-xs' : 'text-sm'}`}
              >
                {apt.telegram}
              </a>
            </div>
          </div>
        </div>

        {/* Delete button */}
        <button
          onClick={() => onDelete(apt.id)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-warm-300
                   hover:bg-red-50 hover:text-red-400 transition-all flex-shrink-0"
          title="Удалить запись"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  )
}
