# Beauty Studio — Сайт записи к парикмахеру

## Быстрый старт

### 1. Настрой Supabase (бесплатная база данных)

1. Зайди на [supabase.com](https://supabase.com) → Sign Up (можно через GitHub)
2. Нажми **New Project**, выбери имя и пароль
3. Дождись создания (1–2 мин)
4. Зайди в **SQL Editor** (левая панель) и выполни:

```sql
CREATE TABLE appointments (
  id BIGSERIAL PRIMARY KEY,
  client_name TEXT NOT NULL,
  telegram TEXT NOT NULL,
  service TEXT NOT NULL,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индекс для быстрого поиска по дате
CREATE INDEX idx_appointments_date ON appointments(date);

-- Разрешаем публичный доступ (для простоты)
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations" ON appointments
  FOR ALL USING (true) WITH CHECK (true);
```

5. Зайди в **Settings → API** и скопируй:
   - **Project URL** (это `NEXT_PUBLIC_SUPABASE_URL`)
   - **anon / public key** (это `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

### 2. Настрой проект

```bash
# Установи зависимости
npm install

# Создай файл переменных окружения
cp .env.local.example .env.local
```

Открой `.env.local` и вставь свои данные из Supabase:

```
NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
NEXT_PUBLIC_MASTER_PIN=1234
```

> ⚠️ Поменяй `NEXT_PUBLIC_MASTER_PIN` на свой пин-код для панели мастера!

### 3. Запусти локально

```bash
npm run dev
```

- Клиентская страница: http://localhost:3000
- Панель мастера: http://localhost:3000/master

### 4. Настрой под своего мастера

Открой `src/app/page.js` и измени блок `MASTER_INFO`:

```js
const MASTER_INFO = {
  name: 'Имя мастера',
  title: 'Мастер-парикмахер',
  telegram: '@telegram_username',
  phone: '+7 (999) 123-45-67',
  address: 'Адрес салона',
  workHours: 'Пн–Сб: 10:00 – 20:00',
}
```

Также можно изменить `SERVICES` (список услуг) и `TIME_SLOTS` (доступные слоты времени).

### 5. Деплой на Vercel

**Через GitHub + Vercel (рекомендуется):**

```bash
# Инициализируй git и залей на GitHub
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOUR_USERNAME/barber-site.git
git push -u origin main
```

1. Зайди на [vercel.com](https://vercel.com) → Sign Up через GitHub
2. Нажми **Add New Project** → выбери репозиторий `barber-site`
3. В разделе **Environment Variables** добавь:
   - `NEXT_PUBLIC_SUPABASE_URL` = твой URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = твой ключ
   - `NEXT_PUBLIC_MASTER_PIN` = пин-код мастера
4. Нажми **Deploy**

Готово! Сайт будет доступен по адресу `barber-site.vercel.app`

**Через Vercel CLI:**

```bash
npm i -g vercel
vercel login
vercel --prod
```

## Структура проекта

```
barber-site/
├── src/
│   ├── app/
│   │   ├── page.js          # Клиентская страница (запись)
│   │   ├── master/
│   │   │   └── page.js      # Панель мастера (календарь)
│   │   ├── layout.js        # Корневой layout
│   │   └── globals.css      # Стили
│   └── lib/
│       └── supabase.js      # Клиент Supabase
├── .env.local.example       # Пример переменных окружения
├── package.json
└── README.md
```

## Как это работает

- **Клиент** заходит на главную, выбирает услугу, дату и время, оставляет имя и Telegram → запись сохраняется в Supabase
- **Мастер** заходит на `/master`, вводит PIN → видит все записи в виде календаря (день/неделя)
- Занятые слоты автоматически блокируются для других клиентов
