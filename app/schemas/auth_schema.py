from pydantic import BaseModel, EmailStr
from typing import Optional


class UserAddRequest(BaseModel):
    """Класс для регистрации пользователя"""
    email: EmailStr
    password: str
    name: str
    role_id: int

    class Config:
        from_attributes = True


class UserAdd(BaseModel):
    """Класс для сохранения пользователя (без плоского пароля)"""
    email: EmailStr
    hashed_password: str
    name: str
    role_id: int

    class Config:
        from_attributes = True


class UserAuthRequest(BaseModel):
    """Класс для аутентификации"""
    email: EmailStr
    password: str

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """Ответ с JWT токеном"""
    access_token: str
    token_type: str = "bearer"

    class Config:
        from_attributes = True


class UserMe(BaseModel):
    """Класс для информации о текущем пользователе"""
    id: int
    email: str
    name: str
    role_id: int
    role: Optional[str] = None

    class Config:
        from_attributes = True
