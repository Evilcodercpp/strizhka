'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

// ============================================================
// НАСТРОЙКИ — МЕНЯЙ ПОД СВОЕГО МАСТЕРА
// ============================================================
const MASTER_INFO = {
  name: 'Анна Иванова',
  title: 'Мастер-парикмахер',
  telegram: '@anna_hair',
  phone: '+7 (999) 123-45-67',
  address: 'г. Москва, ул. Примерная, д. 10, салон "Beauty"',
  workHours: 'Пн–Сб: 10:00 – 20:00',
  photo: null, // можно добавить URL фото
}

const SERVICES = [
  { id: 1, name: 'Женская стрижка', duration: '60 мин', price: '2 500 ₽' },
  { id: 2, name: 'Мужская стрижка', duration: '40 мин', price: '1 500 ₽' },
  { id: 3, name: 'Окрашивание', duration: '120 мин', price: '5 000 ₽' },
  { id: 4, name: 'Укладка', duration: '40 мин', price: '1 800 ₽' },
  { id: 5, name: 'Мелирование', duration: '150 мин', price: '6 000 ₽' },
  { id: 6, name: 'Стрижка чёлки', duration: '15 мин', price: '500 ₽' },
]

const TIME_SLOTS = [
  '10:00', '11:00', '12:00', '13:00',
  '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00',
]
// ============================================================

export default function HomePage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    clientName: '',
    telegram: '',
    service: null,
    date: '',
    time: '',
  })
  const [bookedSlots, setBookedSlots] = useState([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  // Получаем занятые слоты для выбранной даты
  useEffect(() => {
    if (formData.date) {
      fetchBookedSlots(formData.date)
    }
  }, [formData.date])

  async function fetchBookedSlots(date) {
    try {
      const { data } = await supabase
        .from('appointments')
        .select('time')
        .eq('date', date)

      setBookedSlots(data?.map(a => a.time) || [])
    } catch (err) {
      console.error('Error fetching slots:', err)
    }
  }

  async function handleSubmit() {
    setLoading(true)
    setError('')

    try {
      const service = SERVICES.find(s => s.id === formData.service)
      const { error: insertError } = await supabase
        .from('appointments')
        .insert({
          client_name: formData.clientName,
          telegram: formData.telegram,
          service: service.name,
          date: formData.date,
          time: formData.time,
        })

      if (insertError) throw insertError
      setSuccess(true)
    } catch (err) {
      setError('Ошибка при записи. Попробуйте ещё раз.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Минимальная дата — завтра
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  // Максимальная дата — 30 дней вперед
  const maxDate = new Date()
  maxDate.setDate(maxDate.getDate() + 30)
  const maxDateStr = maxDate.toISOString().split('T')[0]

  const selectedService = SERVICES.find(s => s.id === formData.service)

  if (success) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center animate-fade-in-up">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="font-display text-3xl text-salon-dark mb-3">Вы записаны!</h2>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-warm-100 text-left space-y-3 mb-6">
            <div className="flex justify-between">
              <span className="text-warm-500 text-sm">Услуга</span>
              <span className="font-medium">{selectedService?.name}</span>
            </div>
            <div className="gold-line" />
            <div className="flex justify-between">
              <span className="text-warm-500 text-sm">Дата</span>
              <span className="font-medium">
                {new Date(formData.date + 'T12:00').toLocaleDateString('ru-RU', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </span>
            </div>
            <div className="gold-line" />
            <div className="flex justify-between">
              <span className="text-warm-500 text-sm">Время</span>
              <span className="font-medium">{formData.time}</span>
            </div>
            <div className="gold-line" />
            <div className="flex justify-between">
              <span className="text-warm-500 text-sm">Адрес</span>
              <span className="font-medium text-right text-sm">{MASTER_INFO.address}</span>
            </div>
          </div>
          <p className="text-warm-500 text-sm mb-6">
            Мастер свяжется с вами в Telegram для подтверждения
          </p>
          <button
            onClick={() => {
              setSuccess(false)
              setStep(1)
              setFormData({ clientName: '', telegram: '', service: null, date: '', time: '' })
            }}
            className="text-salon-gold hover:text-salon-brown transition-colors underline underline-offset-4"
          >
            Записать ещё
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Section */}
      <header className="relative overflow-hidden bg-salon-dark text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(201,169,110,0.3) 0%, transparent 50%),
                              radial-gradient(circle at 80% 20%, rgba(196,144,138,0.2) 0%, transparent 50%)`,
          }} />
        </div>
        <div className="relative max-w-4xl mx-auto px-6 py-16 md:py-24">
          <div className="animate-fade-in-up">
            <p className="text-salon-gold tracking-[0.3em] uppercase text-xs mb-4 font-medium stagger-1 animate-fade-in-up">
              {MASTER_INFO.title}
            </p>
            <h1 className="font-display text-4xl md:text-6xl mb-4 stagger-2 animate-fade-in-up">
              {MASTER_INFO.name}
            </h1>
            <div className="w-16 h-[2px] bg-salon-gold mb-6 stagger-3 animate-fade-in-up" />
            <p className="text-warm-200 max-w-lg leading-relaxed stagger-4 animate-fade-in-up">
              Запишитесь онлайн — выберите удобную дату, время и услугу.
              Без звонков и ожидания.
            </p>
          </div>
          <a
            href="#booking"
            className="inline-block mt-8 px-8 py-3 bg-salon-gold text-salon-dark font-semibold rounded-full
                       hover:bg-warm-300 transition-all duration-300 hover:shadow-lg hover:shadow-salon-gold/20
                       stagger-5 animate-fade-in-up"
          >
            Записаться →
          </a>
        </div>
      </header>

      {/* Services */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="font-display text-2xl md:text-3xl text-salon-dark mb-2">Услуги</h2>
        <div className="w-12 h-[2px] bg-salon-gold mb-8" />
        <div className="grid md:grid-cols-2 gap-4">
          {SERVICES.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-xl p-5 border border-warm-100 hover:border-salon-gold/40
                         transition-all duration-300 hover:shadow-md group"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-display text-lg text-salon-dark group-hover:text-salon-brown transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-warm-400 text-sm mt-1">{service.duration}</p>
                </div>
                <span className="text-salon-gold font-semibold text-lg">{service.price}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Booking Form */}
      <section id="booking" className="bg-white border-y border-warm-100">
        <div className="max-w-2xl mx-auto px-6 py-16">
          <h2 className="font-display text-2xl md:text-3xl text-salon-dark mb-2">Онлайн-запись</h2>
          <div className="w-12 h-[2px] bg-salon-gold mb-8" />

          {/* Progress */}
          <div className="flex items-center gap-2 mb-10">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300
                  ${step >= s
                    ? 'bg-salon-gold text-white'
                    : 'bg-warm-100 text-warm-400'
                  }`}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div className={`w-12 h-[2px] transition-all duration-300
                    ${step > s ? 'bg-salon-gold' : 'bg-warm-100'}`}
                  />
                )}
              </div>
            ))}
            <span className="ml-3 text-sm text-warm-400">
              {step === 1 && 'Ваши данные'}
              {step === 2 && 'Выбор услуги'}
              {step === 3 && 'Дата и время'}
            </span>
          </div>

          {/* Step 1: Contact Info */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <label className="block text-sm font-medium text-salon-brown mb-2">Ваше имя</label>
                <input
                  type="text"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  placeholder="Как к вам обращаться?"
                  className="w-full px-4 py-3 rounded-xl border border-warm-200 bg-cream/50
                           text-salon-dark placeholder:text-warm-300 transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-salon-brown mb-2">Telegram</label>
                <input
                  type="text"
                  value={formData.telegram}
                  onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
                  placeholder="@username или номер телефона"
                  className="w-full px-4 py-3 rounded-xl border border-warm-200 bg-cream/50
                           text-salon-dark placeholder:text-warm-300 transition-all duration-200"
                />
              </div>
              <button
                onClick={() => setStep(2)}
                disabled={!formData.clientName || !formData.telegram}
                className="w-full py-3 bg-salon-gold text-white font-semibold rounded-xl
                         hover:bg-warm-500 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Далее →
              </button>
            </div>
          )}

          {/* Step 2: Service Selection */}
          {step === 2 && (
            <div className="space-y-3 animate-fade-in">
              {SERVICES.map((service) => (
                <button
                  key={service.id}
                  onClick={() => setFormData({ ...formData, service: service.id })}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200
                    ${formData.service === service.id
                      ? 'border-salon-gold bg-salon-gold/5 shadow-sm'
                      : 'border-warm-100 hover:border-warm-200 bg-white'
                    }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium text-salon-dark">{service.name}</span>
                      <span className="text-warm-400 text-sm ml-2">· {service.duration}</span>
                    </div>
                    <span className="text-salon-gold font-semibold">{service.price}</span>
                  </div>
                </button>
              ))}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 border border-warm-200 text-warm-500 rounded-xl
                           hover:bg-warm-50 transition-all duration-200"
                >
                  ← Назад
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!formData.service}
                  className="flex-1 py-3 bg-salon-gold text-white font-semibold rounded-xl
                           hover:bg-warm-500 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Далее →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Date & Time */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <label className="block text-sm font-medium text-salon-brown mb-2">Выберите дату</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value, time: '' })}
                  min={minDate}
                  max={maxDateStr}
                  className="w-full px-4 py-3 rounded-xl border border-warm-200 bg-cream/50
                           text-salon-dark transition-all duration-200"
                />
              </div>

              {formData.date && (
                <div>
                  <label className="block text-sm font-medium text-salon-brown mb-3">Выберите время</label>
                  <div className="grid grid-cols-5 gap-2">
                    {TIME_SLOTS.map((time) => {
                      const isBooked = bookedSlots.includes(time)
                      const isSelected = formData.time === time
                      return (
                        <button
                          key={time}
                          onClick={() => !isBooked && setFormData({ ...formData, time })}
                          disabled={isBooked}
                          className={`time-slot py-3 rounded-xl border text-center text-sm font-medium
                            ${isBooked
                              ? 'booked border-warm-100 bg-warm-50 text-warm-300'
                              : isSelected
                                ? 'selected border-salon-gold'
                                : 'border-warm-200 hover:border-salon-gold/50 text-salon-dark'
                            }`}
                        >
                          {time}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 border border-warm-200 text-warm-500 rounded-xl
                           hover:bg-warm-50 transition-all duration-200"
                >
                  ← Назад
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!formData.time || loading}
                  className="flex-1 py-3 bg-salon-gold text-white font-semibold rounded-xl
                           hover:bg-warm-500 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Записываем...
                    </span>
                  ) : (
                    'Записаться ✓'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Contact Info */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="font-display text-2xl md:text-3xl text-salon-dark mb-2">Контакты</h2>
        <div className="w-12 h-[2px] bg-salon-gold mb-8" />
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-warm-100">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-salon-gold/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-salon-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-warm-400 mb-1">Адрес</p>
                  <p className="font-medium text-salon-dark">{MASTER_INFO.address}</p>
                </div>
              </div>

              <div className="gold-line" />

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-salon-gold/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-salon-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-warm-400 mb-1">Часы работы</p>
                  <p className="font-medium text-salon-dark">{MASTER_INFO.workHours}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-warm-100">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-salon-gold/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-salon-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-warm-400 mb-1">Телефон</p>
                  <p className="font-medium text-salon-dark">{MASTER_INFO.phone}</p>
                </div>
              </div>

              <div className="gold-line" />

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-salon-gold/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-salon-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-warm-400 mb-1">Telegram</p>
                  <a
                    href={`https://t.me/${MASTER_INFO.telegram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-salon-gold hover:text-salon-brown transition-colors"
                  >
                    {MASTER_INFO.telegram}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-warm-100 py-8 text-center text-warm-400 text-sm">
        <p>© {new Date().getFullYear()} {MASTER_INFO.name} · Все права защищены</p>
      </footer>
    </div>
  )
}
