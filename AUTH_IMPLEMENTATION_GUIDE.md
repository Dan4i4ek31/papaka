# Программа реализации JWT аутентификации

Год столу: **19 декабя 2025**

---

## 👀 Обзор пюлтов

На данный момент созданы следующие файлы:

### Психологические стройки 🌗

1. **`app/services/auth_service.py`** ✅
   - JWT токен генерация
   - Проверка паролей
   - Регистрация/Логин

2. **`app/router/user_router_new.py`** ✅
   - `/register` - регистрация
   - `/login` - получение токена
   - `/me` - данные текущего пользователя

3. **`app/schemas/auth_schema.py`** ✅
   - `UserAddRequest` - данные регистрации
   - `UserAuthRequest` - данные логина
   - `TokenResponse` - ответ с токеном

4. **`app/exceptions/auth_exceptions.py`** ✅
   - Правильные HTTP исключения

---

## ✨ Настройка (этапы)

### Этап 1: Обновить main.py

Найти строку где регистрируется router:

```python
# main.py

# Найти:
from app.router.user_router import router as user_router
app.include_router(user_router)

# Заменить на:
from app.router.user_router_new import router as user_router
app.include_router(user_router, prefix="/api/v1")  # также если нужно
```

Или если хотите алътернативные ендпоинты:

```python
# Оригинальные роуты
from app.router.user_router import router as user_router_old
app.include_router(user_router_old)

# Новые роуты с JWT
from app.router.user_router_new import router as user_router_new
app.include_router(user_router_new)
```

### Этап 2: Обновить app/schemas/user_schema.py

Добавить в конце:

```python
# app/schemas/user_schema.py

# ... естественные классы ...

# Добавить эти импорты в конце:
from app.schemas.auth_schema import (
    UserAddRequest,
    UserAuthRequest,
    TokenResponse,
    UserMe
)

# Или просто обновить router'u import
```

### Этап 3: Обновить импорты в user_router.py

Остать app/router/user_router.py для совместимости, но добавить альтернативные импорты:

```python
from app.exceptions.auth_exceptions import (
    UserNotFoundError,
    InvalidCredentialsException
)
```

### Этап 4: Обновить app/exceptions/user_exceptions.py

Найти файл и добавить альясы для совместимости:

```python
# app/exceptions/user_exceptions.py

# Надднать съ альясы

from app.exceptions.auth_exceptions import (
    UserAlreadyExistsError,
    UserNotFoundError,
    InvalidCredentialsException
)

# Альясы для совместимости
UserAlreadyExistsException = UserAlreadyExistsError
UserNotFoundException = UserNotFoundError
InvalidCredentialsException = InvalidCredentialsException
```

---

## 🗃️ тестирование endpoints'

### 1. Регистрация

```bash
curl -X POST http://localhost:8000/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "securepassword123",
    "name": "Test User",
    "role_id": 1
  }'
```

Окончание:
```json
{
  "message": "User registered successfully",
  "user_id": 1
}
```

### 2. Логин

```bash
curl -X POST http://localhost:8000/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "securepassword123"
  }'
```

Окончание:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer"
}
```

### 3. Получить информацию о себе

```bash
curl -X GET http://localhost:8000/users/me \
  -H "Authorization: Bearer <your_token_here>"
```

Окончание:
```json
{
  "id": 1,
  "email": "testuser@example.com",
  "name": "Test User",
  "role_id": 1,
  "role": "user"
}
```

---

## 🤔 Троублешутинг

### Ошибка 422: Validation Error

**Причина**: Одно из полей неверно

**Поправка**: Проверьте email и типы данных

### Ошибка 409: Conflict

**Причина**: Пользователь с таким email уже существует

**Поправка**: Остальные данные для анотражна email

### Ошибка 401: Unauthorized

**Причина**: Неверное имя или пароль

**Поправка**: Проверьте учётные данные

### Ошибка 404: Not Found

**Причина**: Пользователь не найден

**Поправка**: Основное в token, убедитесь что user_id сохранен в BD

---

## ✅ Чеклист активации

- [ ] Проверить что app/config.py имеет SECRET_KEY и ALGORITHM
- [ ] Обновить main.py для использования user_router_new
- [ ] Настроить текущее dependencies для JWT проверки
- [ ] Протестировать регистрацию
- [ ] Протестировать логин
- [ ] Протестировать protected endpoint
- [ ] Протестировать token expiration
- [ ] Не используемые endpoints исполняют что ожидают

---

## 📄 Ноты

### Токен с той тихонью

До того, как Не скрить token:

```bash
jwt decode <your_token_here> --secret <SECRET_KEY> --algorithms HS256
```

Будет показана структура:
```json
{
  "user_id": 1,
  "email": "user@example.com",
  "role": "user",
  "exp": 1700000000
}
```

### Азывные способы

Навести протектед endpoint'ы в FastAPI:

```python
from fastapi.security import HTTPBearer, HTTPAuthCredentials

security = HTTPBearer()

@router.get("/me")
async def get_me(
    credentials: HTTPAuthCredentials = Depends(security),
    auth_service: AuthService = Depends(get_auth_service)
):
    try:
        user_id = auth_service.get_current_user_id(credentials.credentials)
        return auth_service.get_me(user_id)
    except InvalidCredentialsException:
        raise HTTPException(status_code=401, detail="Invalid token")
```

---

## 🔠 Быстрые команды

### Запуск сервера

```bash
python main.py
# или
uv run main.py
```

### Проверка ошибок

```bash
grep -r "InvalidCredentialsException" app/
grep -r "UserAlreadyExistsException" app/
```

### Писание тестов

```python
# tests/test_auth.py

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_register():
    response = client.post("/users/register", json={
        "email": "test@example.com",
        "password": "test123",
        "name": "Test",
        "role_id": 1
    })
    assert response.status_code == 200

def test_login():
    response = client.post("/users/login", json={
        "email": "test@example.com",
        "password": "test123"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()
```

---

## 📘 Дополнительно

- [JWT.io](https://jwt.io) - раскодирование токенов
- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/) - документация
- [PyJWT](https://pyjwt.readthedocs.io/) - работа с JWT
- [Passlib](https://passlib.readthedocs.io/) - хеширование паролей

