import './globals.css'

export const metadata = {
  title: 'Beauty Studio — Запись к мастеру',
  description: 'Запишитесь на стрижку, окрашивание и укладку к мастеру-парикмахеру',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  )
}
