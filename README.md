# 🌌 Luma — Matrix-мессенджер на Rust с GUI

Кроссплатформенный **графический мессенджер**, написанный на **Rust** с использованием протокола [Matrix](https://matrix.org/), собственного **Synapse-сервера** и современного веб-интерфейса (Tauri + Vite + TailwindCSS).

---

## 📋 Основные функции

✅ Примитивная авторизация по логину и паролю  
✅ Получение сообщений через `/sync`  
✅ Создание комнат  
✅ Отправка текстовых сообщений  
✅ Поддержка нескольких пользователей  
✅ Современный графический интерфейс через WebView  

---

## 🧰 Технологии

### Backend:
- **Rust** — основа проекта
- **reqwest** — HTTP-запросы к серверу Matrix
- **serde / serde_json** — сериализация/десериализация JSON
- **tokio** — асинхронность
- **uuid** — генерация ID событий
- **Matrix Synapse** — сервер сообщений

### Frontend:
- **Tauri** — оболочка для GUI-приложения на Rust
- **Vite** — сборщик для frontend-приложений
- **TailwindCSS** — утилитарный CSS-фреймворк
- **TypeScript + React (или JSX)** — компоненты интерфейса

---

## 🚀 Установка и запуск

### 1. Установи и запусти сервер Synapse

```bash
docker run -d --name synapse \
  -p 8008:8008 -p 8448:8448 \
  -v ./synapse/data:/data \
  matrixdotorg/synapse:latest
```

### 2. Зарегистрируй пользователя

```bash
docker exec -it synapse register_new_matrix_user http://localhost:8008 \
  -k '<shared_secret из homeserver.yaml>' \
  -u <username> \
  -p <password> \
  -a
```

### 3. Запусти приложение

```bash
git clone https://github.com/vasdz/Luma.git
cd Luma
npm install
cargo tauri dev
```

---

## 🖥 Интерфейс

- 🗂 Список чатов  
- 💬 Окно сообщений  
- 📝 Поле ввода и отправки  
- ⚙️ В разработке: загрузка истории, управление пользователями, настройки

---



## ❤️ Спасибо за интерес к проекту!


