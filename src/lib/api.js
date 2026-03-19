const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export const api = {
  // Создать запись
  async createAppointment({ client_name, telegram, service, date, time }) {
    const res = await fetch(`${API_URL}/api/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_name, telegram, service, date, time }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Ошибка при записи')
    }
    return res.json()
  },

  // Занятые слоты за дату
  async getBookedSlots(date) {
    const res = await fetch(`${API_URL}/api/appointments/slots?date=${date}`)
    if (!res.ok) return []
    return res.json()
  },

  // Записи за день
  async getByDate(date) {
    const res = await fetch(`${API_URL}/api/appointments?date=${date}`)
    if (!res.ok) return []
    return res.json()
  },

  // Записи за период
  async getByDateRange(start, end) {
    const res = await fetch(`${API_URL}/api/appointments/range?start=${start}&end=${end}`)
    if (!res.ok) return []
    return res.json()
  },

  // Удалить запись
  async deleteAppointment(id) {
    const res = await fetch(`${API_URL}/api/appointments/${id}`, {
      method: 'DELETE',
    })
    return res.ok
  },
}
