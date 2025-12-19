from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.schemas.user_schema import (
    User, 
    UserCreate, 
    UserUpdate,
    UserAddRequest,
    UserAuthRequest
)
from app.services.user_service import UserService
from app.services.auth_service import AuthService
from app.repositories.user_repository import UserRepository
from app.exceptions.user_exceptions import (
    UserNotFoundException,
    UserAlreadyExistsException,
    InvalidCredentialsException
)

router = APIRouter(prefix="/users", tags=["users"])


def get_user_service(db: Session = Depends(get_db)) -> UserService:
    """Дэпендендерий для UserService"""
    user_repository = UserRepository(db)
    return UserService(user_repository)


def get_auth_service(db: Session = Depends(get_db)) -> AuthService:
    """Дэпендендерий для AuthService"""
    return AuthService(db)


# ============================================================
# АУТЕНТИФИКАЦИЯ И АВТОРИЗАЦИЯ
# ============================================================

@router.post("/register", response_model=dict)
def register(
    user_data: UserAddRequest,
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Регистрация нового пользователя
    
    Пример:
    ```json
    {
        "email": "user@example.com",
        "password": "secure_password",
        "name": "John Doe",
        "role_id": 1
    }
    ```
    """
    try:
        result = auth_service.register_user(user_data)
        return result
    except UserAlreadyExistsException as e:
        raise HTTPException(status_code=409, detail=str(e))


@router.post("/login", response_model=dict)
def login(
    credentials: UserAuthRequest,
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Вход в систему и получение JWT токена
    
    Пример:
    ```json
    {
        "email": "user@example.com",
        "password": "secure_password"
    }
    ```
    
    Ответ:
    ```json
    {
        "access_token": "eyJ0eXAiOiJKV1QiLC...",
        "token_type": "bearer"
    }
    ```
    """
    try:
        access_token = auth_service.login_user(credentials)
        return {
            "access_token": access_token,
            "token_type": "bearer"
        }
    except (UserNotFoundException, InvalidCredentialsException) as e:
        raise HTTPException(status_code=401, detail="Invalid email or password")


@router.get("/me", response_model=dict)
def get_me(
    token: str = Depends(lambda: None),  # В реальности используем HTTPBearer
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Получить информацию о текущем пользователе
    
    Требует JWT токена в заголовке:
    Authorization: Bearer <token>
    """
    if not token:
        raise HTTPException(status_code=401, detail="Missing token")
    
    try:
        user_id = auth_service.get_current_user_id(token)
        return auth_service.get_me(user_id)
    except InvalidCredentialsException:
        raise HTTPException(status_code=401, detail="Invalid token")
    except UserNotFoundException:
        raise HTTPException(status_code=404, detail="User not found")


# ============================================================
# CRUD ОПЕРАЦИИ С ПОЛЬЗОВАТЕЛЯМИ
# ============================================================

@router.get("/", response_model=List[User])
def get_users(
    skip: int = 0,
    limit: int = 100,
    user_service: UserService = Depends(get_user_service)
):
    """
    Получить список всех пользователей
    """
    return user_service.get_all(skip, limit)


@router.get("/{user_id}", response_model=User)
def get_user(
    user_id: int,
    user_service: UserService = Depends(get_user_service)
):
    """
    Получить пользователя по ID
    """
    try:
        return user_service.get(user_id)
    except UserNotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/email/{email}", response_model=User)
def get_user_by_email(
    email: str,
    user_service: UserService = Depends(get_user_service)
):
    """
    Получить пользователя по email
    """
    user = user_service.get_by_email(email)
    if not user:
        raise HTTPException(status_code=404, detail=f"User with email {email} not found")
    return user


@router.post("/", response_model=User)
def create_user(
    user_data: UserCreate,
    user_service: UserService = Depends(get_user_service)
):
    """
    Создать нового пользователя (без хеширования пароля)
    
    Примечание: это endpoint для admin, используйте /register для обычной регистрации
    """
    try:
        return user_service.create_user(user_data)
    except UserAlreadyExistsException as e:
        raise HTTPException(status_code=409, detail=str(e))


@router.put("/{user_id}", response_model=User)
def update_user(
    user_id: int,
    user_data: UserUpdate,
    user_service: UserService = Depends(get_user_service)
):
    """
    Обновить данные пользователя
    """
    try:
        return user_service.update_user(user_id, user_data.dict(exclude_unset=True))
    except UserNotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except UserAlreadyExistsException as e:
        raise HTTPException(status_code=409, detail=str(e))


@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    user_service: UserService = Depends(get_user_service)
):
    """
    Удалить пользователя
    """
    try:
        success = user_service.delete(user_id)
        return {"message": "User deleted successfully", "deleted": success}
    except UserNotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
