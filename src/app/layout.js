import './globals.css'

export const metadata = {
  title: 'Екатерина — Мастер-парикмахер · Колорист',
  description: 'Запишитесь онлайн к мастеру-парикмахеру Екатерине. Окрашивание, стрижки, укладки.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body>{children}</body>
    </html>
  )
}
