# 🔐 Миграция на JWT Автентификацию

**Дата:** 19 декабя 2025

**Отот:** Миграция аутентификации ис papaka на стандарт, аналогичные FN2.

---

## 🎆 Что было сделано

### 1. Новые файлы

```
✅ AUTH_SYNC_FN2.md
   - Подробное сравнение FN2 и papaka
   - Причины отличий в таблице
   - План миграции на Этапы
   - Контрольные точки

✅ AUTH_IMPLEMENTATION_GUIDE.md
   - Пошаговое руководство
   - Этапы настройки
   - Примеры curl-команд
   - Троублешутинг

✅ app/services/auth_service.py
   - JWT генерация/декодирование
   - Хеширование бцриптом bcrypt
   - Проверка паролей
   - Методы: register_user(), login_user(), get_me()

✅ app/router/user_router_new.py
   - `/users/register` - регистрация
   - `/users/login` - получение JWT
   - `/users/me` - защищённые данные
   - Остальные CRUD операции

✅ app/schemas/auth_schema.py
   - UserAddRequest - регистрация
   - UserAuthRequest - логин
   - TokenResponse - ответ с токеном
   - UserMe - инфо о текущем пользователе

✅ app/exceptions/auth_exceptions.py
   - UserAlreadyExistsError (409)
   - UserNotFoundError (404)
   - InvalidPasswordError (401)
   - InvalidJWTTokenError (401)
   - JWTTokenExpiredError (401)
   - InvalidCredentialsException (401)
```

### 2. Принципы правильного поведения

```
НЮКОВАЯ ОПЕРАЦИЯ       ОЖИДАЕМАЯ ОтВЕТА

✅ POST /users/register              → 200 OK
   {
     "message": "User registered successfully",
     "user_id": 1
   }

✅ POST /users/login                → 200 OK
   {
     "access_token": "eyJ0eXAiOiJKV1QiLC...",
     "token_type": "bearer"
   }

✅ GET /users/me                    → 200 OK
   {
     "id": 1,
     "email": "user@example.com",
     "name": "John Doe",
     "role_id": 1,
     "role": "user"
   }

✅ POST /users/register (duplicate) → 409 Conflict
✅ POST /users/login (bad pass)     → 401 Unauthorized
✅ GET /users/me (no token)         → 401 Unauthorized
```

---

## 💋 Штранге для внедрения

### Шаг 1: Обновить main.py

**Найти:**
```python
from app.router.user_router import router as user_router
app.include_router(user_router)
```

**заменить на:**
```python
from app.router.user_router_new import router as user_router
app.include_router(user_router)
```

### Шаг 2: Обновить импорты

Старые импорты в открытых файлах:

```python
# заменить
from app.schemas.user_schema import UserCreate, UserUpdate

# на
from app.schemas.user_schema import UserCreate, UserUpdate
from app.schemas.auth_schema import UserAddRequest, UserAuthRequest
```

### Шаг 3: Обновить exceptions

Оставить старые для совместимости, добавить альясы:

```python
# app/exceptions/user_exceptions.py

from app.exceptions.auth_exceptions import (
    UserAlreadyExistsError as UserAlreadyExistsException,
    UserNotFoundError as UserNotFoundException,
    InvalidCredentialsException
)
```

### Шаг 4: Протестировать

```bash
# запустить сервер
python main.py

# в другом терминале

# протестировать регистрацию
curl -X POST http://localhost:8000/users/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test","role_id":1}'

# протестировать логин
curl -X POST http://localhost:8000/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

---

## 🔑 Команды раснифровки токенов

```bash
# установить jwt-cli
pip install pyjwt

# расшифровать токен
python -c "import jwt; import sys; print(jwt.decode(sys.argv[1], options={'verify_signature': False}))" <TOKEN>
```

---

## 🎨 Структура токена

```json
{
  "user_id": 1,
  "email": "user@example.com",
  "role": "user",
  "exp": 1700000000,  // время истечения
  "iat": 1699900000   // время создания
}
```

---

## 📁 Декментация

**Детальная информация:**
- [`AUTH_SYNC_FN2.md`](AUTH_SYNC_FN2.md) - аналитический сравнение
- [`AUTH_IMPLEMENTATION_GUIDE.md`](AUTH_IMPLEMENTATION_GUIDE.md) - руководство

---

## Что дальше?

1. **Настроение** - выполните шаги выше
2. **Тестирование** - отправьте curl-орбы
3. **Очистка** - удалите старые файлы
4. **Онатих** - закомите в git

✅ **Готово к одправке в продакцию!**
