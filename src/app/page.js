'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

const MASTER = {
  name: 'Екатерина',
  title: 'модельер-парикмахер · колорист',
  telegram: '@Ekaterina_Olegvna',
  instagram: 'Catrin_Kolor',
  phone: '+7 (916) 665-63-83',
  address: 'Большой Головин переулок, 3к2, 4 этаж, 13 кабинет',
}

const TIME_SLOTS = [
  '09:00','09:30','10:00','10:30','11:00','11:30',
  '12:00','12:30','13:00','13:30','14:00','14:30',
  '15:00','15:30','16:00','16:30','17:00','17:30',
  '18:00','18:30','19:00','19:30','20:00',
]

export default function HomePage() {
  const [services, setServices] = useState([])
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({ clientName: '', telegram: '', phone: '', service: null, date: '', time: '' })
  const [bookedSlots, setBookedSlots] = useState([])
  const [availableDates, setAvailableDates] = useState([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [servicesLoading, setServicesLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setServicesLoading(true)
      for (let i = 0; i < 3; i++) {
        try {
          const [svc, dates] = await Promise.all([api.getServices(), api.getAvailableDates()])
          if (svc && svc.length > 0) {
            setServices(svc)
            setAvailableDates((dates || []).map(d => d.date))
            setServicesLoading(false)
            return
          }
        } catch (e) { console.error('Load attempt', i + 1, e) }
        await new Promise(r => setTimeout(r, 2000))
      }
      try {
        const svc = await api.getServices()
        setServices(svc || [])
        const dates = await api.getAvailableDates()
        setAvailableDates((dates || []).map(d => d.date))
      } catch (e) { console.error('All attempts failed', e) }
      setServicesLoading(false)
    }
    loadData()
  }, [])

  useEffect(() => {
    if (form.date) api.getBookedSlots(form.date).then(s => setBookedSlots(s || []))
  }, [form.date])

  async function handleSubmit() {
    setLoading(true); setError('')
    try {
      const svc = services.find(s => s.id === form.service)
      await api.createAppointment({
        client_name: form.clientName,
        telegram: form.telegram,
        phone: form.phone,
        service: svc.name,
        date: form.date,
        time: form.time,
      })
      setSuccess(true)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const selectedService = services.find(s => s.id === form.service)
  const colorServices = services.filter(s => s.category === 'color')
  const cutServices = services.filter(s => s.category === 'cut')
  const today = new Date().toISOString().split('T')[0]
  const futureDates = availableDates.filter(d => d > today).sort()
  const hasContact = form.telegram.trim() || form.phone.trim()

  function formatDateLong(dateStr) {
    return new Date(dateStr + 'T12:00').toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-5">
        <div className="max-w-sm w-full text-center fade-up">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="font-[Cormorant_Garamond] text-3xl mb-2">Вы записаны</h2>
          <div className="glass rounded-2xl p-5 text-left space-y-3 mt-6 mb-6">
            <InfoRow label="Услуга" value={selectedService?.name} />
            <div className="border-t border-white/5" />
            <InfoRow label="Дата" value={formatDateLong(form.date)} />
            <div className="border-t border-white/5" />
            <InfoRow label="Время" value={form.time} />
            <div className="border-t border-white/5" />
            <InfoRow label="Адрес" value={MASTER.address} small />
          </div>
          <p className="text-white/40 text-sm mb-6">Мастер свяжется с вами для подтверждения</p>
          <button onClick={() => { setSuccess(false); setStep(0); setForm({ clientName:'', telegram:'', phone:'', service:null, date:'', time:'' }) }}
            className="text-[#B8926A] text-sm hover:underline underline-offset-4">Записать ещё</button>
        </div>
      </div>
    )
  }

  if (step === 0) {
    return (
      <div className="min-h-screen">
        <div className="relative px-5 pt-16 pb-12 md:pt-24 md:pb-16 overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'radial-gradient(circle at 30% 40%, rgba(184,146,106,0.3) 0%, transparent 60%)'
          }} />
          <div className="relative max-w-lg mx-auto">
            <p className="text-[#B8926A] tracking-[0.25em] uppercase text-[11px] font-medium mb-3 fade-up delay-1">{MASTER.title}</p>
            <h1 className="font-[Cormorant_Garamond] text-5xl md:text-6xl font-medium mb-5 fade-up delay-2">{MASTER.name}</h1>
            <p className="text-white/50 leading-relaxed text-[15px] max-w-md fade-up delay-3">
              Окрашивание, стрижки, укладки. Запишитесь онлайн — выберите удобную дату и время.
            </p>
            <button onClick={() => setStep(1)}
              className="mt-8 px-7 py-3.5 gold-gradient text-[#0E0E0E] font-semibold text-sm rounded-full
                         hover:opacity-90 active:scale-[0.98] transition-all fade-up delay-4">
              Записаться
            </button>
          </div>
        </div>

        <div className="max-w-lg mx-auto px-5 py-10">
          <h2 className="font-[Cormorant_Garamond] text-2xl mb-6">Услуги и цены</h2>
          {servicesLoading ? (
            <div className="text-center py-8">
              <div className="w-6 h-6 mx-auto mb-3 border-2 border-[#B8926A] border-t-transparent rounded-full animate-spin" />
              <p className="text-white/30 text-sm">Загрузка услуг...</p>
            </div>
          ) : services.length === 0 ? (
            <p className="text-white/30 text-sm text-center py-8">Услуги временно недоступны</p>
          ) : (
            <>
              {colorServices.length > 0 && (
                <>
                  <p className="text-[#B8926A] text-xs tracking-[0.15em] uppercase mb-3">Окрашивание</p>
                  <div className="space-y-2 mb-8">{colorServices.map(s => <ServiceCard key={s.id} s={s} />)}</div>
                </>
              )}
              {cutServices.length > 0 && (
                <>
                  <p className="text-[#B8926A] text-xs tracking-[0.15em] uppercase mb-3">Стрижка и укладка</p>
                  <div className="space-y-2 mb-8">{cutServices.map(s => <ServiceCard key={s.id} s={s} />)}</div>
                </>
              )}
            </>
          )}
        </div>

        <div className="max-w-lg mx-auto px-5 py-10 border-t border-white/5">
          <h2 className="font-[Cormorant_Garamond] text-2xl mb-6">Контакты</h2>
          <div className="space-y-4">
            <ContactRow icon="pin" label={MASTER.address} />
            <ContactRow icon="phone" label={MASTER.phone} href={`tel:${MASTER.phone.replace(/[^+\d]/g,'')}`} />
            <ContactRow icon="tg" label="Telegram" href={`https://t.me/${MASTER.telegram.replace('@','')}`} />
            <ContactRow icon="ig" label="Instagram" href={`https://instagram.com/${MASTER.instagram}`} />
          </div>
          <div className="flex gap-3 mt-8">
            <SocialBtn href={`https://t.me/${MASTER.telegram.replace('@','')}`} label="Telegram" />
            <SocialBtn href={`https://instagram.com/${MASTER.instagram}`} label="Instagram" />
            <SocialBtn href={`https://wa.me/${MASTER.phone.replace(/[^0-9]/g,'')}`} label="WhatsApp" />
          </div>
        </div>

        <footer className="text-center text-white/20 text-xs py-8 border-t border-white/5">© {new Date().getFullYear()} {MASTER.name}</footer>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-50 glass px-5 py-4 flex items-center justify-between">
        <button onClick={() => step === 1 ? setStep(0) : setStep(step - 1)}
          className="text-white/50 hover:text-white text-sm flex items-center gap-1.5 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>Назад
        </button>
        <div className="flex gap-1.5">
          {[1,2,3].map(s => <div key={s} className={`h-1 rounded-full transition-all duration-300 ${step >= s ? 'w-8 bg-[#B8926A]' : 'w-4 bg-white/10'}`} />)}
        </div>
        <span className="text-white/30 text-xs w-12 text-right">{step}/3</span>
      </div>
      <div className="max-w-lg mx-auto px-5 py-8">
        {step === 1 && (
          <div className="fade-up">
            <h2 className="font-[Cormorant_Garamond] text-3xl mb-1">Ваши данные</h2>
            <p className="text-white/40 text-sm mb-8">Чтобы мастер мог связаться с вами</p>
            <div className="space-y-4">
              <Field label="Имя" value={form.clientName} onChange={v => setForm({...form, clientName: v})} placeholder="Как к вам обращаться?" />
              <Field label="Телефон" value={form.phone} onChange={v => setForm({...form, phone: v})} placeholder="+7 (___) ___-__-__" type="tel" />
              <Field label="Telegram (необязательно)" value={form.telegram} onChange={v => setForm({...form, telegram: v})} placeholder="@username" />
            </div>
            <button onClick={() => setStep(2)} disabled={!form.clientName || !hasContact}
              className="w-full mt-8 py-3.5 gold-gradient text-[#0E0E0E] font-semibold text-sm rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 transition-all">Далее</button>
          </div>
        )}
        {step === 2 && (
          <div className="fade-up">
            <h2 className="font-[Cormorant_Garamond] text-3xl mb-1">Выбор услуги</h2>
            <p className="text-white/40 text-sm mb-8">Что вы хотите сделать?</p>
            {colorServices.length > 0 && (
              <><p className="text-[#B8926A] text-xs tracking-[0.15em] uppercase mb-3">Окрашивание</p>
              <div className="space-y-2 mb-6">{colorServices.map(s => <ServiceSelect key={s.id} s={s} selected={form.service===s.id} onClick={() => setForm({...form,service:s.id})} />)}</div></>
            )}
            {cutServices.length > 0 && (
              <><p className="text-[#B8926A] text-xs tracking-[0.15em] uppercase mb-3">Стрижка и укладка</p>
              <div className="space-y-2 mb-6">{cutServices.map(s => <ServiceSelect key={s.id} s={s} selected={form.service===s.id} onClick={() => setForm({...form,service:s.id})} />)}</div></>
            )}
            <button onClick={() => setStep(3)} disabled={!form.service}
              className="w-full mt-4 py-3.5 gold-gradient text-[#0E0E0E] font-semibold text-sm rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 transition-all">Далее</button>
          </div>
        )}
        {step === 3 && (
          <div className="fade-up">
            <h2 className="font-[Cormorant_Garamond] text-3xl mb-1">Дата и время</h2>
            <p className="text-white/40 text-sm mb-8">Выберите удобный день</p>
            {futureDates.length === 0 ? (
              <div className="text-center py-12 text-white/30"><p className="text-lg mb-2">Нет доступных дат</p><p className="text-sm">Мастер пока не открыл запись</p></div>
            ) : (
              <>
                <div className="flex gap-2 overflow-x-auto pb-3 -mx-1 px-1" style={{WebkitOverflowScrolling:'touch'}}>
                  {futureDates.slice(0,14).map(d => (
                    <button key={d} onClick={() => setForm({...form,date:d,time:''})} style={{touchAction:'manipulation',minWidth:'80px'}}
                      className={`flex-shrink-0 px-3 py-3 rounded-xl border text-center transition-all active:scale-95 ${form.date===d?'border-[#B8926A] bg-[#B8926A]/10 text-[#B8926A]':'border-white/8 text-white/60'}`}>
                      <div className="text-[11px] uppercase opacity-60">{new Date(d+'T12:00').toLocaleDateString('ru-RU',{weekday:'short'})}</div>
                      <div className="text-lg font-medium mt-0.5">{new Date(d+'T12:00').getDate()}</div>
                      <div className="text-[11px] opacity-60">{new Date(d+'T12:00').toLocaleDateString('ru-RU',{month:'short'})}</div>
                    </button>
                  ))}
                </div>
                {form.date && (
                  <div className="mt-6">
                    <p className="text-white/50 text-xs mb-3">Доступное время</p>
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                      {TIME_SLOTS.map(t => (
                        <button key={t} disabled={bookedSlots.includes(t)} onClick={() => setForm({...form,time:t})}
                          style={{touchAction:'manipulation',minHeight:'44px'}}
                          className={`time-btn py-2.5 rounded-lg border text-sm text-center active:scale-95 ${form.time===t?'active':'border-white/10 text-white/60'}`}>{t}</button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
            {error && <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
            <button onClick={handleSubmit} disabled={!form.time||loading}
              className="w-full mt-8 py-3.5 gold-gradient text-[#0E0E0E] font-semibold text-sm rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 transition-all">
              {loading?'Записываем...':'Записаться'}</button>
          </div>
        )}
      </div>
    </div>
  )
}

function ServiceCard({ s }) {
  return (
    <div className="py-3 px-4 rounded-xl bg-white/[0.02] border border-white/5">
      <div className="flex justify-between items-baseline gap-2">
        <span className="text-white/80 text-sm">{s.name}</span>
        <span className="text-[#B8926A] text-sm font-medium whitespace-nowrap">{s.price}</span>
      </div>
      <span className="text-white/25 text-xs">{s.duration}</span>
    </div>
  )
}

function ServiceSelect({ s, selected, onClick }) {
  return (
    <button onClick={onClick} style={{touchAction:'manipulation'}}
      className={`w-full text-left p-4 rounded-xl border transition-all active:scale-[0.98] text-sm
        ${selected?'border-[#B8926A] bg-[#B8926A]/10':'border-white/8 hover:border-white/15 bg-white/[0.02]'}`}>
      <div className="flex justify-between items-baseline gap-2">
        <span className="text-white/90">{s.name}</span>
        <span className="text-[#B8926A] font-medium whitespace-nowrap">{s.price}</span>
      </div>
      <span className="text-white/30 text-xs">{s.duration}</span>
    </button>
  )
}

function Field({ label, value, onChange, placeholder, type='text' }) {
  return (<div><label className="text-white/50 text-xs mb-1.5 block">{label}</label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 text-sm" /></div>)
}

function InfoRow({ label, value, small }) {
  return (<div className="flex justify-between gap-4"><span className="text-white/40 text-sm">{label}</span>
    <span className={`text-right font-medium ${small?'text-xs text-white/70 max-w-[200px]':'text-sm'}`}>{value}</span></div>)
}

function ContactRow({ icon, label, href }) {
  const icons = {
    pin:<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />,
    phone:<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />,
    tg:<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />,
    ig:<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />,
  }
  const Tag = href?'a':'div'
  const props = href?{href,target:'_blank',rel:'noopener noreferrer'}:{}
  return (<Tag {...props} className="flex items-start gap-3 group">
    <div className="w-9 h-9 rounded-lg bg-[#B8926A]/10 flex items-center justify-center flex-shrink-0">
      <svg className="w-4 h-4 text-[#B8926A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">{icons[icon]}</svg>
    </div><span className={`text-sm text-white/60 pt-2 ${href?'group-hover:text-[#B8926A] transition-colors':''}`}>{label}</span></Tag>)
}

function SocialBtn({ href, label }) {
  return (<a href={href} target="_blank" rel="noopener noreferrer" style={{touchAction:'manipulation'}}
    className="flex-1 py-2.5 text-center text-xs font-medium rounded-xl border border-white/10 text-white/50 hover:border-[#B8926A]/40 hover:text-[#B8926A] active:scale-95 transition-all">{label}</a>)
}
