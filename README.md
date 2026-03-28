# GTA 5 RP Family Management Platform

Полноценная платформа для управления закрытым сообществом (фамой) GTA 5 RP.

## 📁 Структура проекта

```
HTMLMoroz/
├── app/                    # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/     # React компоненты
│   │   ├── contexts/       # React контексты (Auth, Socket)
│   │   ├── hooks/          # Custom hooks
│   │   ├── lib/            # Утилиты
│   │   ├── pages/          # Страницы приложения
│   │   ├── services/       # API сервисы
│   │   ├── App.jsx         # Главный компонент
│   │   └── main.tsx        # Точка входа
│   ├── .env                # Переменные окружения
│   └── package.json        # Зависимости
│
├── backend/                # Backend (Node.js + Express)
│   ├── controllers/        # Контроллеры
│   ├── middleware/         # Middleware (auth, validation)
│   ├── models/             # Mongoose модели
│   ├── routes/             # API маршруты
│   ├── sockets/            # Socket.io handlers
│   ├── utils/              # Утилиты
│   ├── .env                # Переменные окружения
│   └── server.js           # Точка входа
│
└── README.md
```

## 🚀 Быстрый старт

### Предварительные требования

- Node.js 18+
- MongoDB (локально или облачный)

### Установка

1. **Клонируйте репозиторий:**
```bash
git clone https://github.com/Onmaynec/HTMLMoroz.git
cd HTMLMoroz
```

2. **Установите зависимости backend:**
```bash
cd backend
npm install
```

3. **Установите зависимости frontend:**
```bash
cd ../app
npm install
```

### Настройка окружения

1. **Backend (.env):**
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/gta-rp-family
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
LOG_LEVEL=info
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

2. **Frontend (.env):**
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### Запуск

1. **Запустите MongoDB** (если локально):
```bash
mongod
```

2. **Запустите backend:**
```bash
cd backend
npm start
# или для разработки:
npm run dev
```

3. **Запустите frontend:**
```bash
cd app
npm run dev
```

4. **Откройте приложение:**
```
http://localhost:5173
```

## ✨ Функционал

### Публичная часть
- 🏠 Лендинг с информацией о фаме
- 📝 Форма подачи заявки
- 🔍 Проверка статуса заявки

### Авторизация
- 🔐 JWT-based аутентификация
- 📝 Регистрация после одобрения заявки
- 👥 Ролевая система (admin, member)

### Личный кабинет
- 👤 Профиль с редактированием
- 🖼️ Загрузка аватара
- 👥 Просмотр онлайн-участников
- 🔔 Уведомления

### Админ-панель
- 📊 Дашборд со статистикой
- 📋 Управление заявками
- 👥 Управление пользователями
- 💬 Чат с кандидатами
- 📝 Логи действий

### Коммуникация
- 💬 Real-time чат (WebSocket)
- 🔔 Мгновенные уведомления
- 📜 История переписки

## 🛠 Технологии

### Frontend
- React 19
- Vite
- TypeScript
- Tailwind CSS
- shadcn/ui
- Socket.io Client
- React Router
- React Hook Form + Zod

### Backend
- Node.js
- Express
- MongoDB + Mongoose
- Socket.io
- JWT
- bcryptjs
- Winston (логирование)

## 🔧 Исправленные ошибки

1. **Исправлен импорт в main.tsx:**
   - Было: `import App from './App.tsx'`
   - Стало: `import App from './App.jsx'`
   - Причина: Основной файл приложения - App.jsx, а не App.tsx

2. **Создан .env файл для frontend:**
   - Добавлены переменные `VITE_API_URL` и `VITE_SOCKET_URL`

## 📝 API Endpoints

### Auth
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `POST /api/auth/logout` - Выход
- `GET /api/auth/me` - Текущий пользователь

### Applications
- `POST /api/applications` - Создать заявку
- `GET /api/applications` - Список заявок
- `GET /api/applications/:id` - Детали заявки
- `PATCH /api/applications/:id/status` - Изменить статус

### Users
- `GET /api/users` - Список пользователей
- `GET /api/users/me` - Мой профиль
- `PATCH /api/users/me` - Обновить профиль
- `POST /api/users/me/avatar` - Загрузить аватар

### Chat
- `GET /api/chat/:applicationId/messages` - История сообщений
- `POST /api/chat/:applicationId/messages` - Отправить сообщение

### Admin
- `GET /api/admin/dashboard` - Статистика
- `GET /api/admin/logs` - Логи
- `POST /api/admin/announcements` - Объявления

## 🔒 Безопасность

- JWT аутентификация
- Хеширование паролей (bcryptjs)
- Rate limiting
- CORS защита
- Helmet headers
- Валидация входных данных

## 📄 Лицензия

MIT
