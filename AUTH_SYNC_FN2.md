# Синхронизация системы аутентификации с FN2

## 📊 Сравнение реализаций

### Основные отличия

| Аспект | FN2 | papaka | Статус |
|--------|-----|--------|---------|
| **Подход JWT** | ✅ JWT токены + async | ❌ Нет JWT, только базовая аутентификация | Нужно добавить |
| **Async/Await** | ✅ Полностью асинхронный | ❌ Синхронный | Нужно обновить |
| **Схемы (Schemes)** | Есть отдельные `SUserAdd`, `SUserAddRequest`, `SUserAuth` | Простые `UserCreate`, `UserUpdate` | Нужно расширить |
| **Сервис аутентификации** | Отдельный `AuthService` с JWT логикой | Смешано в `UserService` | Нужно отделить |
| **Логирование токенов** | Есть `create_access_token()`, `decode_token()` | Нет | Нужно добавить |
| **Проверка роли** | `user.role.name` в токене | Нет ролей в токене | Нужно добавить |
| **Обработка ошибок** | Отдельные исключения (`AuthError` - base) | Базовые исключения | Нужно расширить |

## 🔧 Что нужно исправить в papaka

### 1. **Расширить Config (app/config.py)**

Добавить JWT параметры:

```python
# Уже есть нужные поля, но нужно убедиться в наличии:
SECRET_KEY: str              # ✅ Есть
ALGORITHM: str = "HS256"     # ✅ Есть  
ACCESS_TOKEN_EXPIRE_MINUTES: int = 30  # ✅ Есть
```

**Действие:** Конфиг уже подходит!

---

### 2. **Создать AuthService (app/services/auth_service.py)**

Нужно создать файл с JWT логикой как в FN2:

```python
# Функции которые нужны:
- create_access_token(data: dict) -> str
- verify_password(plain_password, hashed_password) -> bool
- hash_password(plain_password) -> str
- decode_token(token: str) -> dict
- register_user(user_data: SUserAddRequest)
- login_user(user_data: SUserAuth)
- get_me(user_id: int)
```

---

### 3. **Обновить UserService (app/services/user_service.py)**

**Текущие проблемы:**
- Смешивает JWT логику с бизнес-логикой
- Нет отдельного метода `authenticate_user`
- Некорректно вызывает `pwd_context.verify` без проверок

**Решение:** Оставить в `UserService` только CRUD операции, в `AuthService` - аутентификацию и JWT

---

### 4. **Обновить User Router (app/router/user_router.py)**

**Текущие проблемы:**
- Два endpoint'а для аутентификации (`/authenticate`, `/authenticate/json`)
- Query params вместо JSON body
- Нет JWT токена в ответе

**Решение:**
```python
@router.post("/register")
async def register(user_data: SUserAddRequest, auth_service: AuthService = Depends()):
    await auth_service.register_user(user_data)
    return {"message": "User registered"}

@router.post("/login")
async def login(user_data: SUserAuth, auth_service: AuthService = Depends()):
    access_token = await auth_service.login_user(user_data)
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me")
async def get_me(user_id: int = Depends(get_current_user), auth_service: AuthService = Depends()):
    return await auth_service.get_me(user_id)
```

---

### 5. **Создать зависимость для JWT (app/dependencies.py)**

Нужна функция для извлечения user_id из токена:

```python
async def get_current_user(token: str = Depends(HTTPBearer())) -> int:
    # Декодировать токен
    # Вернуть user_id
```

---

### 6. **Обновить Schemas**

Создать новые схемы как в FN2:

```python
# app/schemas/user_schema.py
class SUserAddRequest(BaseModel):
    email: str
    password: str
    name: str
    role_id: int

class SUserAdd(BaseModel):
    email: str
    hashed_password: str
    name: str
    role_id: int

class SUserAuth(BaseModel):
    email: str
    password: str
```

---

### 7. **Обновить exceptions**

Добавить специализированные исключения:

```python
# app/exceptions/auth_exceptions.py
class UserAlreadyExistsError(Exception):
    pass

class UserNotFoundError(Exception):
    pass

class InvalidPasswordError(Exception):
    pass

class InvalidJWTTokenError(Exception):
    pass

class JWTTokenExpiredError(Exception):
    pass
```

---

## 📋 План миграции (шаг за шагом)

### Этап 1: Подготовка
- [ ] Создать `app/services/auth_service.py` (скопировать логику из FN2)
- [ ] Создать новые schemas (`SUserAddRequest`, `SUserAdd`, `SUserAuth`)
- [ ] Создать `app/exceptions/auth_exceptions.py`

### Этап 2: Обновление сервисов
- [ ] Обновить `UserService` - убрать JWT логику
- [ ] Обновить `AuthService` - добавить JWT функции
- [ ] Обновить `app/dependencies.py` - добавить `get_current_user`

### Этап 3: Обновление роутов
- [ ] Обновить `app/router/user_router.py`:
  - Убрать `/authenticate`
  - Добавить `/register` (POST)
  - Добавить `/login` (POST) - с JWT
  - Добавить `/me` (GET) - защищённый endpoint

### Этап 4: Тестирование
- [ ] Протестировать регистрацию
- [ ] Протестировать логин (получение токена)
- [ ] Протестировать protected endpoints
- [ ] Протестировать token expiration

---

## 🔐 Основные отличия в поведении

### FN2 (JWT approach)
```
1. POST /auth/register - регистрация
2. POST /auth/login - получение JWT токена
3. GET /users/me - доступ с Bearer token
4. Токен хранится на клиенте
5. Отправляется в Authorization header
```

### Текущий papaka (Session approach)
```
1. POST /users - создание пользователя
2. POST /users/authenticate - проверка (без токена)
3. Сессия на сервере (не реализовано)
```

---

## 🚀 Быстрый старт для исправления

### Шаг 1: Скопировать AuthService

Взять логику из FN2 `app/services/auth.py` и адаптировать для papaka.

### Шаг 2: Обновить UserModel

```python
# Проверить что поле называется hashed_password (в papaka это уже так)
hashed_password: Mapped[str] = mapped_column(String(300), nullable=False)
```

### Шаг 3: Обновить main.py

Убедиться что включены правильные роуты:
```python
from app.router.user_router import router as user_router
app.include_router(user_router)
```

### Шаг 4: Обновить .env

```
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DATABASE_URL=sqlite:///papaka.db
```

---

## ⚠️ Важные замечания

1. **Async vs Sync**: FN2 использует `async/await`, papaka - синхронный код
   - Можно оставить синхронный подход, но нужно убрать `async` из JWT методов

2. **BaseService**: FN2 использует базовый класс `BaseService`, papaka использует прямо `UserRepository`
   - Это нормально, главное правильно организовать логику

3. **Роли**: FN2 проверяет `user.role.name` из БД
   - Убедиться что при создании пользователя указывается правильный `role_id`

4. **Миграции**: Если менялась структура БД, нужно создать миграцию Alembic
   - Проверить что `users` таблица соответствует `UserModel`

---

## 📝 Контрольный список перед коммитом

- [ ] JWT токены генерируются и проверяются
- [ ] Пароли хешируются bcrypt
- [ ] `/register` возвращает успех
- [ ] `/login` возвращает access_token
- [ ] `/me` требует токена и возвращает данные пользователя
- [ ] Токен истекает через настроенное время
- [ ] Неверные пароли дают ошибку 401
- [ ] Дублирующийся email дает ошибку 409
- [ ] Нет в логах паролей или токенов

