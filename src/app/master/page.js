'use client'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

const PIN = process.env.NEXT_PUBLIC_MASTER_PIN || '1234'
const SLOTS = ['09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30','19:00','19:30','20:00']

export default function MasterPage() {
  const [auth, setAuth] = useState(false)
  const [pin, setPin] = useState('')
  const [pinErr, setPinErr] = useState(false)
  const [tab, setTab] = useState('calendar')

  function login(e) { e.preventDefault(); if (pin===PIN){setAuth(true);setPinErr(false)} else setPinErr(true) }

  if (!auth) return (
    <div className="min-h-screen flex items-center justify-center p-5">
      <form onSubmit={login} className="w-full max-w-xs fade-up">
        <div className="glass rounded-2xl p-8 text-center">
          <div className="w-12 h-12 mx-auto mb-5 rounded-full bg-[#B8926A]/10 flex items-center justify-center">
            <svg className="w-6 h-6 text-[#B8926A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="font-[Cormorant_Garamond] text-2xl mb-1">Панель мастера</h1>
          <p className="text-white/30 text-sm mb-6">Введите PIN-код</p>
          <input type="password" value={pin} onChange={e=>{setPin(e.target.value);setPinErr(false)}} placeholder="••••" maxLength={8} autoFocus
            className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-center text-2xl tracking-[0.5em] text-white ${pinErr?'border-red-500/50':'border-white/10'}`} />
          {pinErr && <p className="text-red-400 text-xs mt-2">Неверный PIN</p>}
          <button type="submit" className="w-full mt-4 py-3 gold-gradient text-[#0E0E0E] font-semibold text-sm rounded-xl">Войти</button>
        </div>
      </form>
    </div>
  )

  const tabs=[
    {id:'calendar',l:'Календарь'},{id:'add',l:'Записать'},{id:'services',l:'Услуги'},
    {id:'dates',l:'Даты'},{id:'records',l:'Записи'},{id:'clients',l:'Клиенты'},{id:'supplies',l:'Расходники'},
  ]

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 glass">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="font-[Cormorant_Garamond] text-lg">Панель мастера</h1>
          <a href="/" className="text-white/30 text-xs hover:text-white/60">← на сайт</a>
        </div>
        <div className="max-w-3xl mx-auto px-4 flex gap-1 overflow-x-auto pb-0 scrollbar-hide">
          {tabs.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)}
              className={`px-3 py-2.5 text-sm whitespace-nowrap border-b-2 transition-all
                ${tab===t.id?'text-[#B8926A] border-[#B8926A]':'text-white/40 border-transparent hover:text-white/60'}`}>{t.l}</button>
          ))}
        </div>
      </header>
      <div className="max-w-3xl mx-auto px-4 py-6">
        {tab==='calendar'&&<CalendarTab/>}
        {tab==='add'&&<AddTab/>}
        {tab==='services'&&<ServicesTab/>}
        {tab==='dates'&&<DatesTab/>}
        {tab==='records'&&<RecordsTab/>}
        {tab==='clients'&&<ClientsTab/>}
        {tab==='supplies'&&<SuppliesTab/>}
      </div>
    </div>
  )
}

/* ==================== CALENDAR ==================== */
function CalendarTab() {
  const [mo, setMo] = useState(0)
  const [apts, setApts] = useState([])
  const [sel, setSel] = useState(null)
  const now = new Date()
  const vm = new Date(now.getFullYear(), now.getMonth()+mo, 1)
  const y=vm.getFullYear(), m=vm.getMonth()
  useEffect(()=>{
    const s=new Date(y,m,1).toISOString().split('T')[0], e=new Date(y,m+1,0).toISOString().split('T')[0]
    api.getByDateRange(s,e).then(setApts)
  },[y,m])
  const dayApts = sel ? apts.filter(a=>a.date===sel) : []
  function days(){const fd=new Date(y,m,1).getDay(),dim=new Date(y,m+1,0).getDate(),off=fd===0?6:fd-1,d=[];for(let i=0;i<off;i++)d.push(null);for(let i=1;i<=dim;i++)d.push(i);return d}
  function cnt(day){if(!day)return 0;const ds=`${y}-${String(m+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;return apts.filter(a=>a.date===ds).length}
  async function del(id){if(!confirm('Удалить?'))return;await api.deleteAppointment(id);const s=new Date(y,m,1).toISOString().split('T')[0],e=new Date(y,m+1,0).toISOString().split('T')[0];setApts(await api.getByDateRange(s,e))}
  const td=now.toISOString().split('T')[0]
  return (
    <div className="fade-up">
      <div className="flex items-center justify-between mb-5">
        <Btn onClick={()=>setMo(p=>p-1)}>‹</Btn>
        <h2 className="font-[Cormorant_Garamond] text-xl capitalize">{vm.toLocaleDateString('ru-RU',{month:'long',year:'numeric'})}</h2>
        <Btn onClick={()=>setMo(p=>p+1)}>›</Btn>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1">{['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map(d=><div key={d} className="text-center text-white/25 text-xs py-1">{d}</div>)}</div>
      <div className="grid grid-cols-7 gap-[6px] mb-6">
        {days().map((day,i)=>{if(!day)return<div key={i}/>;const ds=`${y}-${String(m+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`,c=cnt(day),isT=ds===td,isS=ds===sel
          return(<button key={i} onClick={()=>setSel(ds)} style={{minHeight:'44px'}}
            className={`relative rounded-lg flex flex-col items-center justify-center text-sm transition-all active:scale-95
              ${isS?'bg-[#B8926A] text-[#0E0E0E] font-semibold':isT?'border border-[#B8926A]/50 text-[#B8926A]':'text-white/60 hover:bg-white/5'}`}>
            {day}{c>0&&<div className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${isS?'bg-[#0E0E0E]':'bg-[#B8926A]'}`}/>}
          </button>)})}
      </div>
      {sel&&<div className="border-t border-white/5 pt-5">
        <h3 className="text-sm text-white/40 mb-3">{new Date(sel+'T12:00').toLocaleDateString('ru-RU',{weekday:'long',day:'numeric',month:'long'})} <span className="text-[#B8926A]">{dayApts.length} зап.</span></h3>
        {dayApts.length===0?<p className="text-white/20 text-sm py-6 text-center">Нет записей</p>:
        <div className="space-y-2">{dayApts.map(a=><AptCard key={a.id} a={a} onDel={()=>del(a.id)}/>)}</div>}
      </div>}
    </div>
  )
}

/* ==================== ADD CLIENT ==================== */
function AddTab() {
  const [svcs, setSvcs] = useState([])
  const [dates, setDates] = useState([])
  const [f, setF] = useState({client_name:'',telegram:'',phone:'',service:'',duration_min:60,date:'',time:''})
  const [booked, setBooked] = useState([])
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  useEffect(()=>{api.getServices().then(setSvcs);api.getAvailableDates().then(d=>setDates(d.filter(x=>!x.closed).map(x=>x.date).sort()))},[])
  useEffect(()=>{if(f.date)api.getBookedSlots(f.date).then(s=>setBooked(s||[]))},[f.date])
  function pickService(name){const s=svcs.find(x=>x.name===name);setF({...f,service:name,duration_min:s?.duration_min||60})}
  async function add(){setLoading(true);setMsg('');try{await api.createAppointment(f);setMsg('Записан!');setF({client_name:'',telegram:'',phone:'',service:'',duration_min:60,date:'',time:''})}catch(e){setMsg('Ошибка: '+e.message)}finally{setLoading(false)}}
  const td=new Date().toISOString().split('T')[0],fd=dates.filter(d=>d>=td)
  return (
    <div className="fade-up space-y-4">
      <h2 className="font-[Cormorant_Garamond] text-2xl mb-2">Записать клиента</h2>
      <Input l="Имя" v={f.client_name} set={v=>setF({...f,client_name:v})}/>
      <Input l="Телефон" v={f.phone} set={v=>setF({...f,phone:v})} type="tel" ph="+7..."/>
      <Input l="Telegram" v={f.telegram} set={v=>setF({...f,telegram:v})} ph="@username"/>
      <div><label className="text-white/40 text-xs mb-1 block">Услуга</label>
        <select value={f.service} onChange={e=>pickService(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm appearance-none">
          <option value="">Выберите</option>{svcs.map(s=><option key={s.id} value={s.name}>{s.name} — {s.price}</option>)}
        </select></div>
      <div><label className="text-white/40 text-xs mb-1 block">Дата</label>
        <select value={f.date} onChange={e=>setF({...f,date:e.target.value,time:''})} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm appearance-none">
          <option value="">Выберите</option>{fd.map(d=><option key={d} value={d}>{new Date(d+'T12:00').toLocaleDateString('ru-RU',{weekday:'short',day:'numeric',month:'long'})}</option>)}
        </select></div>
      {f.date&&<div><label className="text-white/40 text-xs mb-2 block">Время</label>
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">{SLOTS.map(t=><button key={t} disabled={booked.includes(t)} onClick={()=>setF({...f,time:t})} style={{touchAction:'manipulation',minHeight:'44px'}}
          className={`time-btn py-2 rounded-lg border text-sm text-center active:scale-95 ${f.time===t?'active':'border-white/10 text-white/60'}`}>{t}</button>)}</div></div>}
      {msg&&<p className={`text-sm ${msg.startsWith('Ошибка')?'text-red-400':'text-green-400'}`}>{msg}</p>}
      <button onClick={add} disabled={!f.client_name||(!f.telegram&&!f.phone)||!f.service||!f.date||!f.time||loading}
        className="w-full py-3 gold-gradient text-[#0E0E0E] font-semibold text-sm rounded-xl disabled:opacity-30 transition-all">{loading?'Сохраняем...':'Записать'}</button>
    </div>
  )
}

/* ==================== SERVICES ==================== */
function ServicesTab() {
  const [svcs, setSvcs] = useState([])
  const [f, setF] = useState({name:'',duration:'',duration_min:60,price:'',category:'color'})
  const [editId, setEditId] = useState(null)
  const [ef, setEf] = useState({})
  const [seeding, setSeeding] = useState(false)
  useEffect(()=>{load()},[])
  async function load(){setSvcs(await api.getServices())}
  async function add(){if(!f.name||!f.price)return;await api.createService(f);setF({name:'',duration:'',duration_min:60,price:'',category:'color'});load()}
  async function upd(){await api.updateService(editId,ef);setEditId(null);load()}
  async function del(id){if(!confirm('Удалить?'))return;await api.deleteService(id);load()}
  async function seed(){if(!confirm('Загрузить стандартные?'))return;setSeeding(true)
    const defs=[
      {name:'Окрашивание корней',duration:'~90 мин',duration_min:90,price:'4 500 ₽',category:'color'},
      {name:'Окрашивание корней + Блики',duration:'~210 мин',duration_min:210,price:'6 000 ₽',category:'color'},
      {name:'Классическое окрашивание S/M',duration:'~140 мин',duration_min:140,price:'6 000 ₽',category:'color'},
      {name:'Классическое окрашивание L',duration:'~150 мин',duration_min:150,price:'7 000 ₽',category:'color'},
      {name:'Экстра блонд S/M',duration:'~180 мин',duration_min:180,price:'7 000 ₽',category:'color'},
      {name:'Экстра блонд L',duration:'~210 мин',duration_min:210,price:'8 000 ₽',category:'color'},
      {name:'Шатуш',duration:'~120 мин',duration_min:120,price:'5 000 ₽',category:'color'},
      {name:'Трендовое окрашивание S/M',duration:'индивидуально',duration_min:180,price:'от 8 500 ₽',category:'color'},
      {name:'Трендовое окрашивание L',duration:'индивидуально',duration_min:210,price:'от 10 000 ₽',category:'color'},
      {name:'Тотальная перезагрузка цвета',duration:'индивидуально',duration_min:240,price:'от 10 500 ₽',category:'color'},
      {name:'Индивидуальное окрашивание / Air Touch',duration:'индивидуально',duration_min:240,price:'от 12 500 ₽',category:'color'},
      {name:'Стрижка с укладкой',duration:'~60 мин',duration_min:60,price:'3 000 ₽',category:'cut'},
      {name:'Мужская стрижка',duration:'~80 мин',duration_min:80,price:'2 000 ₽',category:'cut'},
      {name:'Укладка',duration:'~60 мин',duration_min:60,price:'2 300 ₽',category:'cut'},
      {name:'Окантовка к любой услуге',duration:'индивидуально',duration_min:30,price:'1 000 ₽',category:'cut'},
    ];for(const s of defs){try{await api.createService(s)}catch(e){}}
    await load();setSeeding(false)}
  return (
    <div className="fade-up">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-[Cormorant_Garamond] text-2xl">Услуги</h2>
        {svcs.length===0&&<button onClick={seed} disabled={seeding} style={{touchAction:'manipulation'}}
          className="px-4 py-2 text-xs border border-[#B8926A]/30 text-[#B8926A] rounded-lg hover:bg-[#B8926A]/10 active:bg-[#B8926A]/20">{seeding?'Загрузка...':'Загрузить стандартные'}</button>}
      </div>
      <div className="glass rounded-xl p-4 mb-6 space-y-3">
        <p className="text-white/40 text-xs">Добавить услугу</p>
        <Input v={f.name} set={v=>setF({...f,name:v})} ph="Название"/>
        <div className="grid grid-cols-3 gap-2">
          <Input v={f.duration} set={v=>setF({...f,duration:v})} ph="~60 мин"/>
          <Input v={String(f.duration_min)} set={v=>setF({...f,duration_min:parseInt(v)||0})} ph="Мин" type="number"/>
          <Input v={f.price} set={v=>setF({...f,price:v})} ph="Цена"/>
        </div>
        <select value={f.category} onChange={e=>setF({...f,category:e.target.value})} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm appearance-none">
          <option value="color">Окрашивание</option><option value="cut">Стрижка</option></select>
        <button onClick={add} className="w-full py-2.5 gold-gradient text-[#0E0E0E] font-semibold text-sm rounded-lg">Добавить</button>
      </div>
      <div className="space-y-2">{svcs.map(s=><div key={s.id} className="glass-light rounded-xl p-4">
        {editId===s.id?<div className="space-y-2">
          <Input v={ef.name} set={v=>setEf({...ef,name:v})}/>
          <div className="grid grid-cols-3 gap-2"><Input v={ef.duration} set={v=>setEf({...ef,duration:v})}/><Input v={String(ef.duration_min||0)} set={v=>setEf({...ef,duration_min:parseInt(v)||0})} type="number"/><Input v={ef.price} set={v=>setEf({...ef,price:v})}/></div>
          <div className="flex gap-2"><button onClick={upd} className="flex-1 py-2 bg-[#B8926A] text-[#0E0E0E] text-sm rounded-lg font-medium">Сохранить</button>
          <button onClick={()=>setEditId(null)} className="px-4 py-2 border border-white/10 text-white/50 text-sm rounded-lg">Отмена</button></div>
        </div>:<div className="flex items-center justify-between">
          <div><p className="text-sm">{s.name}</p><p className="text-xs text-white/30">{s.duration} · {s.duration_min}мин · {s.category==='color'?'Окрашивание':'Стрижка'}</p></div>
          <div className="flex items-center gap-2"><span className="text-[#B8926A] text-sm font-medium whitespace-nowrap">{s.price}</span>
            <SmBtn onClick={()=>{setEditId(s.id);setEf({...s})}} icon="edit"/><SmBtn onClick={()=>del(s.id)} icon="x" danger/></div>
        </div>}
      </div>)}</div>
    </div>
  )
}

/* ==================== DATES + CLOSE DAY ==================== */
function DatesTab() {
  const [dates, setDates] = useState([])
  const [mo, setMo] = useState(0)
  const [toggling, setToggling] = useState(null)
  useEffect(()=>{load()},[])
  async function load(){const d=await api.getAvailableDates();setDates(d)}
  const now=new Date(),vm=new Date(now.getFullYear(),now.getMonth()+mo,1),y=vm.getFullYear(),m=vm.getMonth()
  function days(){const fd=new Date(y,m,1).getDay(),dim=new Date(y,m+1,0).getDate(),off=fd===0?6:fd-1,d=[];for(let i=0;i<off;i++)d.push(null);for(let i=1;i<=dim;i++)d.push(i);return d}
  async function toggle(day){
    const ds=`${y}-${String(m+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;setToggling(ds)
    const existing=dates.find(d=>d.date===ds)
    if(existing){await api.removeAvailableDate(ds)}else{await api.addAvailableDate(ds)}
    await load();setToggling(null)}
  async function closeDay(ds){if(!confirm('Закрыть запись на этот день?'))return;await api.closeDate(ds);load()}
  async function openDay(ds){await api.openDate(ds);load()}
  const td=now.toISOString().split('T')[0]
  const todayDate=dates.find(d=>d.date===td)
  return (
    <div className="fade-up">
      <h2 className="font-[Cormorant_Garamond] text-2xl mb-2">Доступные даты</h2>
      <p className="text-white/30 text-sm mb-4">Нажмите на день для включения/выключения записи</p>

      {/* Close today button */}
      {todayDate&&!todayDate.closed&&(
        <button onClick={()=>closeDay(td)} style={{touchAction:'manipulation'}}
          className="w-full mb-5 py-3 rounded-xl border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/10 active:scale-[0.98] transition-all">
          Закрыть запись на сегодня
        </button>
      )}
      {todayDate&&todayDate.closed&&(
        <button onClick={()=>openDay(td)} style={{touchAction:'manipulation'}}
          className="w-full mb-5 py-3 rounded-xl border border-green-500/30 text-green-400 text-sm font-medium hover:bg-green-500/10 active:scale-[0.98] transition-all">
          Открыть запись на сегодня
        </button>
      )}

      <div className="flex items-center justify-between mb-5">
        <Btn onClick={()=>setMo(p=>p-1)}>‹</Btn>
        <h3 className="text-sm font-medium capitalize">{vm.toLocaleDateString('ru-RU',{month:'long',year:'numeric'})}</h3>
        <Btn onClick={()=>setMo(p=>p+1)}>›</Btn>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1">{['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map(d=><div key={d} className="text-center text-white/25 text-xs py-1">{d}</div>)}</div>
      <div className="grid grid-cols-7 gap-[6px]">{days().map((day,i)=>{
        if(!day)return<div key={i}/>;const ds=`${y}-${String(m+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
        const rec=dates.find(d=>d.date===ds),isAvail=rec&&!rec.closed,isClosed=rec&&rec.closed,isPast=ds<td,isLoad=toggling===ds
        return(<button key={i} onClick={()=>!isPast&&!isLoad&&toggle(day)} disabled={isPast||isLoad}
          style={{touchAction:'manipulation',minHeight:'44px'}}
          className={`rounded-lg flex items-center justify-center text-sm font-medium transition-all active:scale-95
            ${isPast?'text-white/10':isLoad?'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 animate-pulse':
            isClosed?'bg-red-500/15 text-red-400/60 border border-red-500/20 line-through':
            isAvail?'bg-green-500/20 text-green-400 border border-green-500/30':
            'text-white/40 hover:bg-white/5 active:bg-white/10 border border-white/10'}`}>{day}</button>)})}</div>
      <div className="flex items-center gap-4 mt-5 text-xs text-white/30 flex-wrap">
        <Legend color="green" label="Открыта"/><Legend color="red" label="Закрыта мастером"/><Legend color="gray" label="Не активна"/>
      </div>
    </div>
  )
}

/* ==================== ALL RECORDS ==================== */
function RecordsTab() {
  const [apts, setApts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  useEffect(()=>{api.getAllAppointments().then(d=>{setApts(d);setLoading(false)})},[])
  const filtered=filter?apts.filter(a=>(a.client_name+a.telegram+a.phone+a.service).toLowerCase().includes(filter.toLowerCase())):apts
  async function del(id){if(!confirm('Удалить?'))return;await api.deleteAppointment(id);setApts(apts.filter(a=>a.id!==id))}
  return (
    <div className="fade-up">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-[Cormorant_Garamond] text-2xl">Все записи</h2>
        <span className="text-[#B8926A] text-sm">{apts.length}</span>
      </div>
      <input type="text" value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Поиск..."
        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm mb-4 placeholder:text-white/20"/>
      {loading?<p className="text-white/30 text-sm text-center py-8">Загрузка...</p>:
      filtered.length===0?<p className="text-white/20 text-sm text-center py-8">Нет записей</p>:
      <div className="space-y-2">{filtered.map(a=><div key={a.id} className="glass-light rounded-xl p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap"><span className="font-medium text-sm">{a.client_name}</span>
              {a.telegram&&<a href={`https://t.me/${a.telegram.replace('@','')}`} target="_blank" className="text-[#B8926A] text-xs">{a.telegram}</a>}
              {a.phone&&<a href={`tel:${a.phone}`} className="text-[#B8926A] text-xs">{a.phone}</a>}</div>
            <p className="text-xs text-white/40">{a.service}{a.duration_min?` · ${a.duration_min}мин`:''}</p>
            <p className="text-xs text-white/30">{new Date(a.date+'T12:00').toLocaleDateString('ru-RU',{day:'numeric',month:'short',year:'numeric'})} · {a.time}</p>
          </div>
          <SmBtn onClick={()=>del(a.id)} icon="trash" danger/>
        </div>
      </div>)}</div>}
    </div>
  )
}

/* ==================== CLIENTS ==================== */
function ClientsTab() {
  const [clients, setClients] = useState([])
  const [f, setF] = useState({name:'',telegram:'',phone:'',comment:''})
  const [editId, setEditId] = useState(null)
  const [ef, setEf] = useState({})
  const [filter, setFilter] = useState('')
  useEffect(()=>{load()},[])
  async function load(){setClients(await api.getClients())}
  async function add(){if(!f.name)return;await api.createClient(f);setF({name:'',telegram:'',phone:'',comment:''});load()}
  async function upd(){await api.updateClient(editId,ef);setEditId(null);load()}
  async function del(id){if(!confirm('Удалить?'))return;await api.deleteClient(id);load()}
  const filtered=filter?clients.filter(c=>(c.name+c.telegram+c.phone+c.comment).toLowerCase().includes(filter.toLowerCase())):clients
  return (
    <div className="fade-up">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-[Cormorant_Garamond] text-2xl">Клиенты</h2>
        <span className="text-[#B8926A] text-sm">{clients.length}</span>
      </div>
      <div className="glass rounded-xl p-4 mb-5 space-y-3">
        <p className="text-white/40 text-xs">Добавить клиента</p>
        <Input v={f.name} set={v=>setF({...f,name:v})} ph="Имя"/>
        <div className="grid grid-cols-2 gap-2">
          <Input v={f.phone} set={v=>setF({...f,phone:v})} ph="Телефон" type="tel"/>
          <Input v={f.telegram} set={v=>setF({...f,telegram:v})} ph="@telegram"/>
        </div>
        <Input v={f.comment} set={v=>setF({...f,comment:v})} ph="Комментарий"/>
        <button onClick={add} className="w-full py-2.5 gold-gradient text-[#0E0E0E] font-semibold text-sm rounded-lg">Добавить</button>
      </div>
      <input type="text" value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Поиск..." className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm mb-4 placeholder:text-white/20"/>
      <div className="space-y-2">{filtered.map(c=><div key={c.id} className="glass-light rounded-xl p-4">
        {editId===c.id?<div className="space-y-2">
          <Input v={ef.name} set={v=>setEf({...ef,name:v})} ph="Имя"/>
          <div className="grid grid-cols-2 gap-2"><Input v={ef.phone} set={v=>setEf({...ef,phone:v})} ph="Телефон"/><Input v={ef.telegram} set={v=>setEf({...ef,telegram:v})} ph="Telegram"/></div>
          <Input v={ef.comment} set={v=>setEf({...ef,comment:v})} ph="Комментарий"/>
          <div className="flex gap-2"><button onClick={upd} className="flex-1 py-2 bg-[#B8926A] text-[#0E0E0E] text-sm rounded-lg font-medium">Сохранить</button>
          <button onClick={()=>setEditId(null)} className="px-4 py-2 border border-white/10 text-white/50 text-sm rounded-lg">Отмена</button></div>
        </div>:<div className="flex items-start justify-between">
          <div className="space-y-1"><p className="text-sm font-medium">{c.name}</p>
            <div className="flex gap-2 flex-wrap">
              {c.phone&&<a href={`tel:${c.phone}`} className="text-[#B8926A] text-xs">{c.phone}</a>}
              {c.telegram&&<a href={`https://t.me/${c.telegram.replace('@','')}`} target="_blank" className="text-[#B8926A] text-xs">{c.telegram}</a>}
            </div>
            {c.comment&&<p className="text-xs text-white/30 italic">{c.comment}</p>}
          </div>
          <div className="flex gap-1"><SmBtn onClick={()=>{setEditId(c.id);setEf({...c})}} icon="edit"/><SmBtn onClick={()=>del(c.id)} icon="x" danger/></div>
        </div>}
      </div>)}</div>
    </div>
  )
}

/* ==================== SUPPLIES ==================== */
function SuppliesTab() {
  const [sub, setSub] = useState('paint')
  const [items, setItems] = useState([])
  const [f, setF] = useState({type:'paint',brand:'',name:'',quantity:0,price:'',comment:''})
  const [editId, setEditId] = useState(null)
  const [ef, setEf] = useState({})
  useEffect(()=>{load()},[sub])
  async function load(){setItems(await api.getSuppliesByType(sub))}
  async function add(){if(!f.brand||!f.name)return;await api.createSupply({...f,type:sub});setF({...f,brand:'',name:'',quantity:0,price:'',comment:''});load()}
  async function upd(){await api.updateSupply(editId,ef);setEditId(null);load()}
  async function del(id){if(!confirm('Удалить?'))return;await api.deleteSupply(id);load()}
  const brands=[...new Set(items.map(i=>i.brand))].sort()
  return (
    <div className="fade-up">
      <h2 className="font-[Cormorant_Garamond] text-2xl mb-4">Расходники</h2>
      <div className="flex gap-2 mb-5">
        <button onClick={()=>setSub('paint')} className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${sub==='paint'?'gold-gradient text-[#0E0E0E]':'border border-white/10 text-white/50'}`}>Краски</button>
        <button onClick={()=>setSub('material')} className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${sub==='material'?'gold-gradient text-[#0E0E0E]':'border border-white/10 text-white/50'}`}>Материалы</button>
      </div>
      <div className="glass rounded-xl p-4 mb-5 space-y-3">
        <p className="text-white/40 text-xs">Добавить {sub==='paint'?'краску':'материал'}</p>
        <div className="grid grid-cols-2 gap-2"><Input v={f.brand} set={v=>setF({...f,brand:v})} ph="Бренд"/><Input v={f.name} set={v=>setF({...f,name:v})} ph="Название"/></div>
        <div className="grid grid-cols-2 gap-2"><Input v={String(f.quantity)} set={v=>setF({...f,quantity:parseInt(v)||0})} ph="Кол-во" type="number"/><Input v={f.price} set={v=>setF({...f,price:v})} ph="Стоимость"/></div>
        <Input v={f.comment} set={v=>setF({...f,comment:v})} ph="Комментарий"/>
        <button onClick={add} className="w-full py-2.5 gold-gradient text-[#0E0E0E] font-semibold text-sm rounded-lg">Добавить</button>
      </div>
      {brands.length===0?<p className="text-white/20 text-sm text-center py-8">Пусто</p>:
      brands.map(brand=><div key={brand} className="mb-6">
        <p className="text-[#B8926A] text-xs tracking-[0.15em] uppercase mb-2">{brand}</p>
        <div className="space-y-2">{items.filter(i=>i.brand===brand).map(item=><div key={item.id} className="glass-light rounded-xl p-4">
          {editId===item.id?<div className="space-y-2">
            <div className="grid grid-cols-2 gap-2"><Input v={ef.brand} set={v=>setEf({...ef,brand:v})} ph="Бренд"/><Input v={ef.name} set={v=>setEf({...ef,name:v})} ph="Название"/></div>
            <div className="grid grid-cols-2 gap-2"><Input v={String(ef.quantity)} set={v=>setEf({...ef,quantity:parseInt(v)||0})} ph="Кол-во" type="number"/><Input v={ef.price} set={v=>setEf({...ef,price:v})} ph="Цена"/></div>
            <Input v={ef.comment} set={v=>setEf({...ef,comment:v})} ph="Комментарий"/>
            <div className="flex gap-2"><button onClick={upd} className="flex-1 py-2 bg-[#B8926A] text-[#0E0E0E] text-sm rounded-lg font-medium">Сохранить</button>
            <button onClick={()=>setEditId(null)} className="px-4 py-2 border border-white/10 text-white/50 text-sm rounded-lg">Отмена</button></div>
          </div>:<div className="flex items-start justify-between">
            <div className="space-y-0.5"><p className="text-sm">{item.name}</p>
              <p className="text-xs text-white/40">Кол-во: <span className={item.quantity<3?'text-red-400':'text-white/60'}>{item.quantity}</span>{item.price&&` · ${item.price}`}</p>
              {item.comment&&<p className="text-xs text-white/25 italic">{item.comment}</p>}
            </div>
            <div className="flex gap-1"><SmBtn onClick={()=>{setEditId(item.id);setEf({...item})}} icon="edit"/><SmBtn onClick={()=>del(item.id)} icon="x" danger/></div>
          </div>}
        </div>)}</div>)}
    </div>
  )
}

/* ==================== SHARED COMPONENTS ==================== */
function AptCard({a, onDel}) {
  return (<div className="glass-light rounded-xl p-4 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="bg-[#B8926A]/10 rounded-lg px-3 py-1.5 text-[#B8926A] font-medium text-sm">{a.time}</div>
      <div><p className="text-sm font-medium">{a.client_name}</p>
        <p className="text-xs text-white/40">{a.service}{a.duration_min?` · ${a.duration_min}мин`:''}
          {a.telegram&&<> · <a href={`https://t.me/${a.telegram.replace('@','')}`} target="_blank" className="text-[#B8926A]">{a.telegram}</a></>}
          {a.phone&&<> · <a href={`tel:${a.phone}`} className="text-[#B8926A]">{a.phone}</a></>}
        </p></div>
    </div><SmBtn onClick={onDel} icon="trash" danger/>
  </div>)
}

function Input({l, v, set, ph, type='text'}) {
  return (<div>{l&&<label className="text-white/40 text-xs mb-1 block">{l}</label>}
    <input type={type} value={v} onChange={e=>set(e.target.value)} placeholder={ph}
      className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/20"/></div>)
}

function Btn({onClick, children}) {
  return <button onClick={onClick} style={{touchAction:'manipulation'}}
    className="w-10 h-10 rounded-lg border border-white/10 flex items-center justify-center text-white/40 hover:text-white/70 active:bg-white/10 transition-all">{children}</button>
}

function SmBtn({onClick, icon, danger}) {
  const paths={edit:'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z',
    x:'M6 18L18 6M6 6l12 12',trash:'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'}
  return <button onClick={onClick} style={{touchAction:'manipulation'}}
    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all flex-shrink-0
      ${danger?'text-white/20 hover:text-red-400 hover:bg-red-500/10':'text-white/20 hover:text-[#B8926A] hover:bg-[#B8926A]/10'}`}>
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={paths[icon]}/></svg></button>
}

function Legend({color, label}) {
  const cls={green:'bg-green-500/20 border-green-500/30',red:'bg-red-500/15 border-red-500/20',gray:'bg-white/5 border-white/10'}
  return <div className="flex items-center gap-1.5"><div className={`w-3 h-3 rounded border ${cls[color]}`}/>{label}</div>
}
