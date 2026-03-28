# GTA 5 RP Family Management Platform

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js" alt="Node.js">
  <img src="https://img.shields.io/badge/React-18+-blue?style=for-the-badge&logo=react" alt="React">
  <img src="https://img.shields.io/badge/MongoDB-6+-green?style=for-the-badge&logo=mongodb" alt="MongoDB">
  <img src="https://img.shields.io/badge/Socket.io-4+-black?style=for-the-badge&logo=socket.io" alt="Socket.io">
</p>

Полноценная платформа для управления закрытым сообществом (фамой) GTA 5 RP. Система включает публичную часть для привлечения новых участников, систему заявок, чат с администрацией, личный кабинет и админ-панель.

## ✨ Особенности

### 🎯 Публичная часть
- **Лендинг** - Привлекательная главная страница с описанием фамы
- **Форма заявки** - Подробная форма с валидацией данных
- **Проверка статуса** - Публичная страница для проверки статуса заявки

### 🔐 Авторизация
- JWT-based аутентификация
- Регистрация только после одобрения заявки
- Ролевая система (admin, member)

### 💬 Коммуникация
- **Real-time чат** - WebSocket чат между админом и кандидатом
- **Уведомления** - Мгновенные уведомления о важных событиях
- **История сообщений** - Полная история переписки

### 👤 Личный кабинет
- Профиль с редактированием данных
- Загрузка аватара
- Просмотр онлайн-участников
- Уведомления

### 🛠️ Админ-панель
- **Дашборд** - Статистика и обзор системы
- **Управление заявками** - Просмотр, одобрение, отклонение
- **Управление пользователями** - Роли, баны
- **Логи** - История всех действий
- **Настройки** - Конфигурация системы

### 🎨 Дизайн
- Темная тема (dark mode)
- Ice/Frost стиль с неоновыми акцентами
- Glassmorphism эффекты
- Полная адаптивность
- Плавные анимации

## 🚀 Быстрый старт

### Требования
- Node.js 18+
- MongoDB 6+
- npm или yarn

### Установка

1. **Клонирование репозитория**
```bash
git clone <repository-url>
cd gta-rp-family
```

2. **Настройка Backend**
```bash
cd backend
npm install
```

Создайте файл `.env`:
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/gta-rp-family
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
LOG_LEVEL=info
```

Запуск backend:
```bash
npm run dev
```

3. **Настройка Frontend**
```bash
cd ../frontend
npm install
```

Создайте файл `.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

Запуск frontend:
```bash
npm run dev
```

4. **Открытие приложения**
```
Frontend: http://localhost:5173
Backend API: http://localhost:5000/api
```

## 📁 Структура проекта

```
gta-rp-family/
├── backend/                    # Node.js + Express API
│   ├── controllers/           # Контроллеры
│   │   ├── auth.controller.js
│   │   ├── application.controller.js
│   │   ├── user.controller.js
│   │   ├── chat.controller.js
│   │   ├── admin.controller.js
│   │   ├── notification.controller.js
│   │   └── log.controller.js
│   ├── middleware/            # Middleware
│   │   ├── auth.js           # JWT аутентификация
│   │   ├── validation.js     # Валидация
│   │   └── upload.js         # Загрузка файлов
│   ├── models/               # Mongoose модели
│   │   ├── User.js
│   │   ├── Application.js
│   │   ├── Chat.js
│   │   ├── Notification.js
│   │   └── Log.js
│   ├── routes/               # API маршруты
│   │   ├── auth.routes.js
│   │   ├── application.routes.js
│   │   ├── user.routes.js
│   │   ├── chat.routes.js
│   │   ├── admin.routes.js
│   │   ├── notification.routes.js
│   │   └── log.routes.js
│   ├── services/             # Бизнес-логика
│   ├── sockets/              # Socket.io handlers
│   │   └── chat.socket.js
│   ├── utils/                # Утилиты
│   │   └── logger.js
│   ├── uploads/              # Загруженные файлы
│   ├── server.js             # Точка входа
│   └── package.json
│
├── frontend/                  # React + Vite приложение
│   ├── src/
│   │   ├── components/       # React компоненты
│   │   │   ├── layout/      # Layout компоненты
│   │   │   ├── ui/          # UI компоненты
│   │   │   └── chat/        # Chat компоненты
│   │   ├── contexts/        # React Contexts
│   │   │   ├── AuthContext.jsx
│   │   │   └── SocketContext.jsx
│   │   ├── pages/           # Страницы
│   │   │   ├── LandingPage.jsx
│   │   │   ├── ApplicationPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   └── admin/       # Admin страницы
│   │   ├── services/        # API сервисы
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── README.md
```

## 🔌 API Endpoints

### Auth
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `POST /api/auth/logout` - Выход
- `GET /api/auth/me` - Текущий пользователь
- `GET /api/auth/check-application/:id` - Проверка заявки

### Applications
- `POST /api/applications` - Создать заявку
- `GET /api/applications` - Список заявок (admin)
- `GET /api/applications/:id` - Детали заявки
- `PATCH /api/applications/:id/status` - Изменить статус
- `GET /api/applications/stats` - Статистика

### Users
- `GET /api/users` - Список пользователей
- `GET /api/users/me` - Мой профиль
- `PATCH /api/users/me` - Обновить профиль
- `POST /api/users/me/avatar` - Загрузить аватар
- `PATCH /api/users/:id/role` - Изменить роль
- `PATCH /api/users/:id/ban` - Забанить/разбанить

### Chat
- `GET /api/chat/:applicationId/messages` - История сообщений
- `POST /api/chat/:applicationId/messages` - Отправить сообщение
- `GET /api/chat/admin/unread-chats` - Чаты с непрочитанными

### Admin
- `GET /api/admin/dashboard` - Статистика дашборда
- `GET /api/admin/logs` - Логи
- `POST /api/admin/announcements` - Отправить объявление
- `POST /api/admin/cleanup` - Очистка старых данных

## 🔐 Безопасность

- **bcrypt** - Хеширование паролей
- **JWT** - Аутентификация с истечением срока
- **Role-based access** - Проверка прав доступа
- **Input validation** - Валидация всех входных данных
- **Rate limiting** - Ограничение запросов
- **Helmet** - Защита HTTP заголовков
- **File upload validation** - Проверка загружаемых файлов

## 🎨 Тема оформления

### Цветовая палитра
- **Primary**: `#0ea5e9` (Ice Blue)
- **Secondary**: `#1e293b` (Frost)
- **Background**: `#0a0f1a` (Dark)
- **Accent**: `#00f3ff` (Neon Cyan)
- **Success**: `#22c55e`
- **Warning**: `#eab308`
- **Error**: `#ef4444`

### CSS классы
```css
/* Glassmorphism карточка */
.glass-card

/* Неоновая кнопка */
.btn-neon

/* Ледяной инпут */
.frost-input

/* Свечение текста */
.text-glow-ice
```

## 📱 Адаптивность

Приложение полностью адаптивно:
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## 🛠️ Разработка

### Добавление новой страницы

1. Создайте компонент в `frontend/src/pages/`
2. Добавьте маршрут в `frontend/src/App.jsx`
3. Добавьте ссылку в навигацию (при необходимости)

### Добавление API endpoint

1. Создайте контроллер в `backend/controllers/`
2. Создайте маршруты в `backend/routes/`
3. Добавьте в `backend/server.js` (если нужен новый префикс)
4. Добавьте метод в `frontend/src/services/api.js`

## 📝 Логирование

Все важные действия логируются:
- Вход/выход пользователей
- Создание/изменение заявок
- Действия администраторов
- Ошибки системы

Логи доступны в админ-панели.

## 🚀 Деплой

### Backend (Render/Railway/Heroku)
1. Установите переменные окружения
2. Настройте MongoDB Atlas
3. Deploy с помощью git

### Frontend (Vercel/Netlify)
1. Соберите проект: `npm run build`
2. Настройте переменные окружения
3. Deploy

## 🤝 Вклад в проект

1. Fork репозитория
2. Создайте feature branch: `git checkout -b feature/amazing-feature`
3. Commit изменения: `git commit -m 'Add amazing feature'`
4. Push в branch: `git push origin feature/amazing-feature`
5. Откройте Pull Request

## 📄 Лицензия

Этот проект распространяется под лицензией MIT.

## 👥 Авторы

- **Разработчик** - [Ваше имя]
- **Дизайнер** - [Имя дизайнера]

## 📞 Поддержка

При возникновении проблем создайте Issue в репозитории.

---

<p align="center">
  Сделано с ❄️ для GTA 5 RP сообщества
</p>
