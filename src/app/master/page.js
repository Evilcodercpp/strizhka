'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

const MASTER_PIN = process.env.NEXT_PUBLIC_MASTER_PIN || '1234'
const TIME_SLOTS = ['10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00']

export default function MasterPage() {
  const [auth, setAuth] = useState(false)
  const [pin, setPin] = useState('')
  const [pinErr, setPinErr] = useState(false)
  const [tab, setTab] = useState('calendar')

  function handleLogin(e) {
    e.preventDefault()
    if (pin === MASTER_PIN) { setAuth(true); setPinErr(false) }
    else setPinErr(true)
  }

  if (!auth) {
    return (
      <div className="min-h-screen flex items-center justify-center p-5">
        <form onSubmit={handleLogin} className="w-full max-w-xs fade-up">
          <div className="glass rounded-2xl p-8 text-center">
            <div className="w-12 h-12 mx-auto mb-5 rounded-full bg-[#B8926A]/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-[#B8926A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="font-[Cormorant_Garamond] text-2xl mb-1">Панель мастера</h1>
            <p className="text-white/30 text-sm mb-6">Введите PIN-код</p>
            <input type="password" value={pin} onChange={e => { setPin(e.target.value); setPinErr(false) }}
              placeholder="••••" maxLength={8} autoFocus
              className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-center text-2xl tracking-[0.5em] text-white
                ${pinErr ? 'border-red-500/50' : 'border-white/10'}`} />
            {pinErr && <p className="text-red-400 text-xs mt-2">Неверный PIN</p>}
            <button type="submit" className="w-full mt-4 py-3 gold-gradient text-[#0E0E0E] font-semibold text-sm rounded-xl">
              Войти
            </button>
          </div>
        </form>
      </div>
    )
  }

  const tabs = [
    { id: 'calendar', label: 'Календарь' },
    { id: 'add', label: 'Добавить' },
    { id: 'services', label: 'Услуги' },
    { id: 'dates', label: 'Даты' },
    { id: 'table', label: 'Все записи' },
  ]

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 glass">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="font-[Cormorant_Garamond] text-lg">Панель мастера</h1>
          <a href="/" className="text-white/30 text-xs hover:text-white/60 transition-colors">← на сайт</a>
        </div>
        <div className="max-w-3xl mx-auto px-4 flex gap-1 overflow-x-auto pb-0 scrollbar-hide">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-3 py-2.5 text-sm whitespace-nowrap transition-all border-b-2
                ${tab === t.id ? 'text-[#B8926A] border-[#B8926A]' : 'text-white/40 border-transparent hover:text-white/60'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {tab === 'calendar' && <CalendarTab />}
        {tab === 'add' && <AddClientTab />}
        {tab === 'services' && <ServicesTab />}
        {tab === 'dates' && <DatesTab />}
        {tab === 'table' && <TableTab />}
      </div>
    </div>
  )
}

// ==================== CALENDAR TAB ====================
function CalendarTab() {
  const [monthOffset, setMonthOffset] = useState(0)
  const [appointments, setAppointments] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const [dayAppts, setDayAppts] = useState([])

  const now = new Date()
  const viewMonth = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1)
  const year = viewMonth.getFullYear()
  const month = viewMonth.getMonth()

  useEffect(() => {
    const start = new Date(year, month, 1).toISOString().split('T')[0]
    const end = new Date(year, month + 1, 0).toISOString().split('T')[0]
    api.getByDateRange(start, end).then(setAppointments)
  }, [year, month])

  useEffect(() => {
    if (selectedDate) {
      setDayAppts(appointments.filter(a => a.date === selectedDate))
    }
  }, [selectedDate, appointments])

  function getDaysInMonth() {
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const offset = firstDay === 0 ? 6 : firstDay - 1
    const days = []
    for (let i = 0; i < offset; i++) days.push(null)
    for (let i = 1; i <= daysInMonth; i++) days.push(i)
    return days
  }

  function countForDay(day) {
    if (!day) return 0
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return appointments.filter(a => a.date === dateStr).length
  }

  const days = getDaysInMonth()
  const monthName = viewMonth.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })
  const todayStr = now.toISOString().split('T')[0]

  async function deleteApt(id) {
    if (!confirm('Удалить запись?')) return
    await api.deleteAppointment(id)
    const start = new Date(year, month, 1).toISOString().split('T')[0]
    const end = new Date(year, month + 1, 0).toISOString().split('T')[0]
    const updated = await api.getByDateRange(start, end)
    setAppointments(updated)
  }

  return (
    <div className="fade-up">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-5">
        <button onClick={() => setMonthOffset(m => m - 1)}
          className="w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center text-white/40 hover:text-white/70 hover:border-white/20 transition-all">‹</button>
        <h2 className="font-[Cormorant_Garamond] text-xl capitalize">{monthName}</h2>
        <button onClick={() => setMonthOffset(m => m + 1)}
          className="w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center text-white/40 hover:text-white/70 hover:border-white/20 transition-all">›</button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map(d => (
          <div key={d} className="text-center text-white/25 text-xs py-1">{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1 mb-6">
        {days.map((day, i) => {
          if (!day) return <div key={i} />
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const count = countForDay(day)
          const isToday = dateStr === todayStr
          const isSelected = dateStr === selectedDate
          return (
            <button key={i} onClick={() => setSelectedDate(dateStr)}
              className={`relative aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-all
                ${isSelected ? 'bg-[#B8926A] text-[#0E0E0E] font-semibold' : isToday ? 'border border-[#B8926A]/50 text-[#B8926A]' : 'text-white/60 hover:bg-white/5'}`}>
              {day}
              {count > 0 && (
                <div className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-[#0E0E0E]' : 'bg-[#B8926A]'}`} />
              )}
            </button>
          )
        })}
      </div>

      {/* Selected day appointments */}
      {selectedDate && (
        <div className="border-t border-white/5 pt-5">
          <h3 className="text-sm text-white/40 mb-3">
            {new Date(selectedDate + 'T12:00').toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}
            <span className="ml-2 text-[#B8926A]">{dayAppts.length} зап.</span>
          </h3>
          {dayAppts.length === 0 ? (
            <p className="text-white/20 text-sm py-6 text-center">Нет записей</p>
          ) : (
            <div className="space-y-2">
              {dayAppts.map(a => (
                <div key={a.id} className="glass-light rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#B8926A]/10 rounded-lg px-3 py-1.5 text-[#B8926A] font-medium text-sm">{a.time}</div>
                    <div>
                      <p className="text-sm font-medium">{a.client_name}</p>
                      <p className="text-xs text-white/40">{a.service} · <a href={`https://t.me/${a.telegram.replace('@','')}`} target="_blank" className="text-[#B8926A]">{a.telegram}</a></p>
                    </div>
                  </div>
                  <button onClick={() => deleteApt(a.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ==================== ADD CLIENT TAB ====================
function AddClientTab() {
  const [services, setServices] = useState([])
  const [availDates, setAvailDates] = useState([])
  const [form, setForm] = useState({ client_name: '', telegram: '', service: '', date: '', time: '' })
  const [bookedSlots, setBookedSlots] = useState([])
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    api.getServices().then(setServices)
    api.getAvailableDates().then(d => setAvailDates(d.map(x => x.date).sort()))
  }, [])

  useEffect(() => {
    if (form.date) api.getBookedSlots(form.date).then(s => setBookedSlots(s || []))
  }, [form.date])

  async function handleAdd() {
    setLoading(true); setMsg('')
    try {
      await api.createAppointment(form)
      setMsg('Клиент записан!')
      setForm({ client_name: '', telegram: '', service: '', date: '', time: '' })
    } catch (e) { setMsg('Ошибка: ' + e.message) }
    finally { setLoading(false) }
  }

  const today = new Date().toISOString().split('T')[0]
  const futureDates = availDates.filter(d => d >= today)

  return (
    <div className="fade-up space-y-4">
      <h2 className="font-[Cormorant_Garamond] text-2xl mb-2">Добавить клиента</h2>
      <div>
        <label className="text-white/40 text-xs mb-1 block">Имя клиента</label>
        <input type="text" value={form.client_name} onChange={e => setForm({...form, client_name: e.target.value})}
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm" />
      </div>
      <div>
        <label className="text-white/40 text-xs mb-1 block">Telegram</label>
        <input type="text" value={form.telegram} onChange={e => setForm({...form, telegram: e.target.value})}
          placeholder="@username" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm" />
      </div>
      <div>
        <label className="text-white/40 text-xs mb-1 block">Услуга</label>
        <select value={form.service} onChange={e => setForm({...form, service: e.target.value})}
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm appearance-none">
          <option value="">Выберите услугу</option>
          {services.map(s => <option key={s.id} value={s.name}>{s.name} — {s.price}</option>)}
        </select>
      </div>
      <div>
        <label className="text-white/40 text-xs mb-1 block">Дата</label>
        <select value={form.date} onChange={e => setForm({...form, date: e.target.value, time: ''})}
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm appearance-none">
          <option value="">Выберите дату</option>
          {futureDates.map(d => (
            <option key={d} value={d}>{new Date(d+'T12:00').toLocaleDateString('ru-RU',{weekday:'short',day:'numeric',month:'long'})}</option>
          ))}
        </select>
      </div>
      {form.date && (
        <div>
          <label className="text-white/40 text-xs mb-2 block">Время</label>
          <div className="grid grid-cols-5 gap-2">
            {TIME_SLOTS.map(t => (
              <button key={t} disabled={bookedSlots.includes(t)}
                onClick={() => setForm({...form, time: t})}
                className={`time-btn py-2 rounded-lg border text-sm text-center
                  ${form.time === t ? 'active' : 'border-white/10 text-white/60'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>
      )}
      {msg && <p className={`text-sm ${msg.startsWith('Ошибка') ? 'text-red-400' : 'text-green-400'}`}>{msg}</p>}
      <button onClick={handleAdd}
        disabled={!form.client_name || !form.telegram || !form.service || !form.date || !form.time || loading}
        className="w-full py-3 gold-gradient text-[#0E0E0E] font-semibold text-sm rounded-xl disabled:opacity-30 transition-all">
        {loading ? 'Сохраняем...' : 'Записать клиента'}
      </button>
    </div>
  )
}

// ==================== SERVICES TAB ====================
function ServicesTab() {
  const [services, setServices] = useState([])
  const [form, setForm] = useState({ name: '', duration: '', price: '', category: 'color' })
  const [editId, setEditId] = useState(null)
  const [editForm, setEditForm] = useState({})

  useEffect(() => { loadServices() }, [])

  async function loadServices() { setServices(await api.getServices()) }

  async function handleAdd() {
    if (!form.name || !form.price) return
    await api.createService(form)
    setForm({ name: '', duration: '', price: '', category: 'color' })
    loadServices()
  }

  async function handleUpdate() {
    await api.updateService(editId, editForm)
    setEditId(null)
    loadServices()
  }

  async function handleDelete(id) {
    if (!confirm('Удалить услугу?')) return
    await api.deleteService(id)
    loadServices()
  }

  return (
    <div className="fade-up">
      <h2 className="font-[Cormorant_Garamond] text-2xl mb-5">Управление услугами</h2>

      {/* Add form */}
      <div className="glass rounded-xl p-4 mb-6 space-y-3">
        <p className="text-white/40 text-xs">Добавить услугу</p>
        <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
          placeholder="Название" className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm" />
        <div className="grid grid-cols-2 gap-2">
          <input type="text" value={form.duration} onChange={e => setForm({...form, duration: e.target.value})}
            placeholder="Длительность" className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm" />
          <input type="text" value={form.price} onChange={e => setForm({...form, price: e.target.value})}
            placeholder="Цена" className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm" />
        </div>
        <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm appearance-none">
          <option value="color">Окрашивание</option>
          <option value="cut">Стрижка и укладка</option>
        </select>
        <button onClick={handleAdd} className="w-full py-2.5 gold-gradient text-[#0E0E0E] font-semibold text-sm rounded-lg">
          Добавить
        </button>
      </div>

      {/* List */}
      <div className="space-y-2">
        {services.map(s => (
          <div key={s.id} className="glass-light rounded-xl p-4">
            {editId === s.id ? (
              <div className="space-y-2">
                <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm" />
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" value={editForm.duration} onChange={e => setEditForm({...editForm, duration: e.target.value})}
                    className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm" />
                  <input type="text" value={editForm.price} onChange={e => setEditForm({...editForm, price: e.target.value})}
                    className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm" />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleUpdate} className="flex-1 py-2 bg-[#B8926A] text-[#0E0E0E] text-sm rounded-lg font-medium">Сохранить</button>
                  <button onClick={() => setEditId(null)} className="px-4 py-2 border border-white/10 text-white/50 text-sm rounded-lg">Отмена</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm">{s.name}</p>
                  <p className="text-xs text-white/30">{s.duration} · {s.category === 'color' ? 'Окрашивание' : 'Стрижка'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#B8926A] text-sm font-medium">{s.price}</span>
                  <button onClick={() => { setEditId(s.id); setEditForm({...s}) }}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white/20 hover:text-[#B8926A] hover:bg-[#B8926A]/10 transition-all">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button onClick={() => handleDelete(s.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ==================== DATES TAB ====================
function DatesTab() {
  const [dates, setDates] = useState([])
  const [monthOffset, setMonthOffset] = useState(0)

  useEffect(() => { loadDates() }, [])

  async function loadDates() {
    const d = await api.getAvailableDates()
    setDates(d.map(x => x.date))
  }

  const now = new Date()
  const viewMonth = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1)
  const year = viewMonth.getFullYear()
  const month = viewMonth.getMonth()

  function getDaysInMonth() {
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const offset = firstDay === 0 ? 6 : firstDay - 1
    const days = []
    for (let i = 0; i < offset; i++) days.push(null)
    for (let i = 1; i <= daysInMonth; i++) days.push(i)
    return days
  }

  async function toggleDate(day) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    if (dates.includes(dateStr)) {
      await api.removeAvailableDate(dateStr)
    } else {
      await api.addAvailableDate(dateStr)
    }
    loadDates()
  }

  const days = getDaysInMonth()
  const monthName = viewMonth.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })
  const todayStr = now.toISOString().split('T')[0]

  return (
    <div className="fade-up">
      <h2 className="font-[Cormorant_Garamond] text-2xl mb-2">Доступные даты</h2>
      <p className="text-white/30 text-sm mb-5">Нажмите на день чтобы включить/выключить запись</p>

      <div className="flex items-center justify-between mb-5">
        <button onClick={() => setMonthOffset(m => m - 1)}
          className="w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center text-white/40 hover:text-white/70 transition-all">‹</button>
        <h3 className="text-sm font-medium capitalize">{monthName}</h3>
        <button onClick={() => setMonthOffset(m => m + 1)}
          className="w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center text-white/40 hover:text-white/70 transition-all">›</button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map(d => (
          <div key={d} className="text-center text-white/25 text-xs py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          if (!day) return <div key={i} />
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const isAvailable = dates.includes(dateStr)
          const isPast = dateStr < todayStr
          return (
            <button key={i} onClick={() => !isPast && toggleDate(day)}
              disabled={isPast}
              className={`aspect-square rounded-lg flex items-center justify-center text-sm transition-all
                ${isPast ? 'text-white/10 cursor-not-allowed' :
                  isAvailable ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                  'text-white/40 hover:bg-white/5 border border-transparent'}`}>
              {day}
            </button>
          )
        })}
      </div>

      <div className="flex items-center gap-4 mt-5 text-xs text-white/30">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-green-500/20 border border-green-500/30" />
          Запись открыта
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-white/5 border border-white/10" />
          Запись закрыта
        </div>
      </div>
    </div>
  )
}

// ==================== TABLE TAB ====================
function TableTab() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    api.getAllAppointments().then(d => { setAppointments(d); setLoading(false) })
  }, [])

  const filtered = filter
    ? appointments.filter(a =>
        a.client_name.toLowerCase().includes(filter.toLowerCase()) ||
        a.telegram.toLowerCase().includes(filter.toLowerCase()) ||
        a.service.toLowerCase().includes(filter.toLowerCase())
      )
    : appointments

  async function deleteApt(id) {
    if (!confirm('Удалить запись?')) return
    await api.deleteAppointment(id)
    setAppointments(appointments.filter(a => a.id !== id))
  }

  return (
    <div className="fade-up">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-[Cormorant_Garamond] text-2xl">Все записи</h2>
        <span className="text-[#B8926A] text-sm">{appointments.length} всего</span>
      </div>

      <input type="text" value={filter} onChange={e => setFilter(e.target.value)}
        placeholder="Поиск по имени, telegram, услуге..."
        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm mb-4 placeholder:text-white/20" />

      {loading ? (
        <p className="text-white/30 text-sm text-center py-8">Загрузка...</p>
      ) : filtered.length === 0 ? (
        <p className="text-white/20 text-sm text-center py-8">Нет записей</p>
      ) : (
        <div className="space-y-2">
          {filtered.map(a => (
            <div key={a.id} className="glass-light rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{a.client_name}</span>
                    <a href={`https://t.me/${a.telegram.replace('@','')}`} target="_blank"
                      className="text-[#B8926A] text-xs">{a.telegram}</a>
                  </div>
                  <p className="text-xs text-white/40">{a.service}</p>
                  <p className="text-xs text-white/30">
                    {new Date(a.date + 'T12:00').toLocaleDateString('ru-RU', { day:'numeric', month:'short', year:'numeric' })} · {a.time}
                  </p>
                </div>
                <button onClick={() => deleteApt(a.id)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
