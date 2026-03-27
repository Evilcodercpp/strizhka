# CLAUDE.md — Strizhka

Инструкции для Claude Code при работе с этим проектом.

## Структура репозиториев

Проект состоит из **3 репозиториев**:

| Репо | Путь | GitHub |
|---|---|---|
| Монорепо (обёртка) | `/strizhka/` | `Evilcodercpp/strizhka` |
| Backend | `/strizhka/barber-backend/` | `Evilcodercpp/barber-backend` |
| Frontend | `/strizhka/barber-site/` | `Evilcodercpp/strizhka-salon` |

`barber-backend` и `barber-site` — **git submodules** внутри `strizhka`.

## Технологии

- **Backend**: Go (Echo v4), GORM, PostgreSQL 16, Telegram Bot API
- **Frontend**: Next.js, Tailwind CSS
- **Deploy**: Docker + docker-compose
- **Уведомления**: Telegram long-polling бот

## Запуск локально

```bash
# 1. База данных
cd barber-backend && docker compose up -d db

# 2. Backend
cd barber-backend
cp .env.example .env   # заполнить переменные
make run               # или: go run cmd/server/main.go

# 3. Frontend
cd barber-site
npm install
npm run dev
```

## Сборка backend

```bash
cd barber-backend

# Локальная сборка
make build             # → bin/server

# Сборка для Linux-сервера (если Mac)
GOOS=linux GOARCH=amd64 go build -o barber-backend-linux cmd/server/main.go
```

## Переменные окружения (.env в barber-backend)

```
DATABASE_URL=postgres://postgres:postgres@localhost:5432/barber?sslmode=disable
TELEGRAM_BOT_TOKEN=          # токен бота @BotFather
TELEGRAM_MASTER_CHAT_ID=     # chat_id мастера (получить через @userinfobot)
TELEGRAM_MASTER_USERNAME=    # username мастера без @
SITE_URL=                    # публичный URL сайта (для ссылки в напоминаниях)
PORT=8080
```

## Архитектура backend

```
cmd/server/main.go          — точка входа, cron-задачи, роутинг
internal/
  model/       — GORM-модели (Appointment, Client, Supply, Service, ...)
  repository/  — работа с БД (CRUD)
  service/     — бизнес-логика
  handler/     — HTTP-хендлеры (Echo)
  bot/         — Telegram long-polling (регистрация клиентов)
  notify/      — отправка уведомлений мастеру и клиентам
```

## Ключевые модели

- **Appointment** — запись (клиент, услуга, дата, время, статус, расходники, оплата)
- **Client** — карточка клиента (тип волос, аллергии, формула, заметки)
- **Supply** — расходник (остаток, минимальный порог, себестоимость)
- **ServiceSupply** — шаблон расходников для услуги
- **Review** — отзыв клиента о завершённой записи

## Cron-задачи (main.go)

| Задача | Расписание | Что делает |
|---|---|---|
| `sendReminders` | каждый час | Напоминания клиентам за 24ч до записи |
| `sendDailySummary` | 19:30 МСК | Сводка мастеру — записи на завтра + расходники |
| waitlist cleanup | раз в сутки | Удаление просроченных позиций в листе ожидания |

## MCP-серверы (для Claude Code)

Настроены в `.mcp.json`:
- **postgres** — прямой доступ к БД (`localhost:5432/barber`)
- **github** — работа с PR и issues (нужен `GITHUB_PERSONAL_ACCESS_TOKEN` в окружении)
- **context7** — актуальная документация библиотек

## Правила работы с кодом

- Все строки уведомлений — на **русском** языке
- Статусы записей: `active`, `rescheduled`, `completed`, `cancelled`
- Статусы оплаты: `paid`, `unpaid`, `partial`
- Методы оплаты: `cash`, `card`, `transfer`
- Единицы расходников: `gram` (граммы) или `piece` (штуки)
- Не изменять структуру БД без AutoMigrate в `main.go`
- После изменений в backend — проверять `go build ./...`

## Деплой на сервер (83.166.247.120)

Сервер управляется через **systemd**, не Docker.
Проект лежит в `/app/barber-backend/`.

### Каждый раз при обновлении backend

**1. Локально — собрать бинарник под Linux:**
```bash
cd barber-backend
GOOS=linux GOARCH=amd64 go build -o barber-backend-linux cmd/server/main.go
```

**2. Локально — запушить код и скопировать бинарник:**
```bash
git add . && git commit -m "..." && git push origin main
scp barber-backend-linux root@83.166.247.120:/app/barber-backend/
```

**3. На сервере — перезапустить:**
```bash
ssh root@83.166.247.120
cd /app/barber-backend && git pull origin main
systemctl restart barber-backend
journalctl -u barber-backend -f
```

### Полезные команды на сервере

```bash
systemctl status barber-backend     # статус
systemctl restart barber-backend    # перезапуск
journalctl -u barber-backend -f     # логи в реальном времени
journalctl -u barber-frontend -f    # логи фронтенда
```
