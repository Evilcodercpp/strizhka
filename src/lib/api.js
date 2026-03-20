const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export const api = {
  // === Appointments ===
  async createAppointment({ client_name, telegram, phone, service, date, time }) {
    const res = await fetch(`${API_URL}/api/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_name, telegram, phone, service, date, time }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Ошибка при записи')
    }
    return res.json()
  },

  async getBookedSlots(date) {
    const res = await fetch(`${API_URL}/api/appointments/slots?date=${date}`)
    if (!res.ok) return []
    return res.json()
  },

  async getByDate(date) {
    const res = await fetch(`${API_URL}/api/appointments?date=${date}`)
    if (!res.ok) return []
    return res.json()
  },

  async getByDateRange(start, end) {
    const res = await fetch(`${API_URL}/api/appointments/range?start=${start}&end=${end}`)
    if (!res.ok) return []
    return res.json()
  },

  async getAllAppointments() {
    const res = await fetch(`${API_URL}/api/appointments/all`)
    if (!res.ok) return []
    return res.json()
  },

  async deleteAppointment(id) {
    const res = await fetch(`${API_URL}/api/appointments/${id}`, { method: 'DELETE' })
    return res.ok
  },

  // === Services ===
  async getServices() {
    const res = await fetch(`${API_URL}/api/services`)
    if (!res.ok) return []
    return res.json()
  },

  async createService({ name, duration, price, category }) {
    const res = await fetch(`${API_URL}/api/services`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, duration, price, category }),
    })
    if (!res.ok) throw new Error('Ошибка создания услуги')
    return res.json()
  },

  async updateService(id, data) {
    const res = await fetch(`${API_URL}/api/services/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Ошибка обновления услуги')
    return res.json()
  },

  async deleteService(id) {
    const res = await fetch(`${API_URL}/api/services/${id}`, { method: 'DELETE' })
    return res.ok
  },

  // === Available Dates ===
  async getAvailableDates() {
    const res = await fetch(`${API_URL}/api/dates`)
    if (!res.ok) return []
    return res.json()
  },

  async getAvailableDatesByRange(start, end) {
    const res = await fetch(`${API_URL}/api/dates/range?start=${start}&end=${end}`)
    if (!res.ok) return []
    return res.json()
  },

  async checkDateAvailable(date) {
    const res = await fetch(`${API_URL}/api/dates/check?date=${date}`)
    if (!res.ok) return false
    const data = await res.json()
    return data.available
  },

  async addAvailableDate(date) {
    const res = await fetch(`${API_URL}/api/dates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date }),
    })
    return res.ok
  },

  async removeAvailableDate(date) {
    const res = await fetch(`${API_URL}/api/dates/${date}`, { method: 'DELETE' })
    return res.ok
  },
}
