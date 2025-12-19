from typing import List
from fastapi import APIRouter, Depends, HTTPException, Form, Query
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.schemas.user_schema import User, UserCreate, UserUpdate
from app.services.user_service import UserService
from app.repositories.user_repository import UserRepository
from app.exceptions.user_exceptions import (
    UserNotFoundException,
    UserAlreadyExistsException,
    InvalidCredentialsException
)

router = APIRouter(prefix="/users", tags=["users"])

def get_user_service(db: Session = Depends(get_db)) -> UserService:
    user_repository = UserRepository(db)
    return UserService(user_repository)

@router.get("/", response_model=List[User])
def get_users(
    skip: int = 0,
    limit: int = 100,
    user_service: UserService = Depends(get_user_service)
):
    return user_service.get_all(skip, limit)

@router.get("/{user_id}", response_model=User)
def get_user(
    user_id: int,
    user_service: UserService = Depends(get_user_service)
):
    try:
        return user_service.get(user_id)
    except UserNotFoundException as e:
        raise e

@router.get("/email/{email}", response_model=User)
def get_user_by_email(
    email: str,
    user_service: UserService = Depends(get_user_service)
):
    user = user_service.get_by_email(email)
    if not user:
        raise UserNotFoundException(email=email)
    return user

@router.post("/", response_model=User)
def create_user(
    user_data: UserCreate,
    user_service: UserService = Depends(get_user_service)
):
    try:
        return user_service.create_user(user_data)
    except UserAlreadyExistsException as e:
        raise e

@router.put("/{user_id}", response_model=User)
def update_user(
    user_id: int,
    user_data: UserUpdate,
    user_service: UserService = Depends(get_user_service)
):
    try:
        return user_service.update_user(user_id, user_data.dict(exclude_unset=True))
    except UserNotFoundException as e:
        raise e
    except UserAlreadyExistsException as e:
        raise e

@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    user_service: UserService = Depends(get_user_service)
):
    try:
        success = user_service.delete(user_id)
        return {"message": "User deleted successfully"}
    except UserNotFoundException as e:
        raise e

# 🔓 ЕдиНЫЙ АВТОПОСТ МАРШРУТ ДЛЯ АУТЕНТИФИКАЦИИ
# Принимает: query params, form data, и JSON body
@router.post("/authenticate")
def authenticate_user(
    email: str = Query(None),
    password: str = Query(None),
    user_service: UserService = Depends(get_user_service)
):
    """
    Аутентификация пользователя
    
    Поддерживает:
    - GET /users/authenticate?email=...&password=... (старая API)
    - POST /users/authenticate?email=...&password=... (query params)
    - POST /users/authenticate (JSON body)
    """
    
    if not email or not password:
        raise HTTPException(
            status_code=400,
            detail="Email and password are required"
        )
    
    try:
        user = user_service.authenticate_user(email, password)
        return {
            "message": "Authenticated successfully", 
            "user_id": user.id,
            "id": user.id,
            "name": user.name,
            "email": user.email
        }
    except InvalidCredentialsException as e:
        raise e

# АЛЬТЕРНАТИВНО: POST аутентификация с JSON телом
# Она автоматически загружается иссли в JSON body email и password
@router.post("/authenticate/json")
def authenticate_user_json(
    credentials: dict,
    user_service: UserService = Depends(get_user_service)
):
    """
    Аутентификация через JSON
    
    Пример:
    POST /users/authenticate/json
    {
        "email": "user@example.com",
        "password": "password123"
    }
    """
    email = credentials.get("email")
    password = credentials.get("password")
    
    if not email or not password:
        raise HTTPException(
            status_code=400,
            detail="Email and password are required"
        )
    
    try:
        user = user_service.authenticate_user(email, password)
        return {
            "message": "Authenticated successfully", 
            "user_id": user.id,
            "id": user.id,
            "name": user.name,
            "email": user.email
        }
    except InvalidCredentialsException as e:
        raise e