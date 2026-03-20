const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

async function request(url, opts = {}) {
  const res = await fetch(url, opts)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Ошибка сервера' }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}

export const api = {
  // Appointments
  createAppointment: (data) => request(`${API_URL}/api/appointments`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
  }),
  getBookedSlots: (date) => request(`${API_URL}/api/appointments/slots?date=${date}`).catch(() => []),
  getByDate: (date) => request(`${API_URL}/api/appointments?date=${date}`).catch(() => []),
  getByDateRange: (s, e) => request(`${API_URL}/api/appointments/range?start=${s}&end=${e}`).catch(() => []),
  getAllAppointments: () => request(`${API_URL}/api/appointments/all`).catch(() => []),
  deleteAppointment: (id) => fetch(`${API_URL}/api/appointments/${id}`, { method: 'DELETE' }).then(r => r.ok),

  // Services
  getServices: () => request(`${API_URL}/api/services`).catch(() => []),
  createService: (data) => request(`${API_URL}/api/services`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
  }),
  updateService: (id, data) => request(`${API_URL}/api/services/${id}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
  }),
  deleteService: (id) => fetch(`${API_URL}/api/services/${id}`, { method: 'DELETE' }).then(r => r.ok),

  // Dates
  getAvailableDates: () => request(`${API_URL}/api/dates`).catch(() => []),
  getAvailableDatesByRange: (s, e) => request(`${API_URL}/api/dates/range?start=${s}&end=${e}`).catch(() => []),
  checkDateAvailable: (d) => request(`${API_URL}/api/dates/check?date=${d}`).then(r => r.available).catch(() => false),
  addAvailableDate: (d) => fetch(`${API_URL}/api/dates`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ date: d }),
  }).then(r => r.ok),
  removeAvailableDate: (d) => fetch(`${API_URL}/api/dates/${d}`, { method: 'DELETE' }).then(r => r.ok),
  closeDate: (d) => request(`${API_URL}/api/dates/close`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ date: d }),
  }),
  openDate: (d) => request(`${API_URL}/api/dates/open`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ date: d }),
  }),

  // Clients
  getClients: () => request(`${API_URL}/api/clients`).catch(() => []),
  createClient: (data) => request(`${API_URL}/api/clients`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
  }),
  updateClient: (id, data) => request(`${API_URL}/api/clients/${id}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
  }),
  deleteClient: (id) => fetch(`${API_URL}/api/clients/${id}`, { method: 'DELETE' }).then(r => r.ok),

  // Supplies
  getSupplies: () => request(`${API_URL}/api/supplies`).catch(() => []),
  getSuppliesByType: (t) => request(`${API_URL}/api/supplies/${t}`).catch(() => []),
  createSupply: (data) => request(`${API_URL}/api/supplies`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
  }),
  updateSupply: (id, data) => request(`${API_URL}/api/supplies/${id}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
  }),
  deleteSupply: (id) => fetch(`${API_URL}/api/supplies/${id}`, { method: 'DELETE' }).then(r => r.ok),
}
