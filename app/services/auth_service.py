from datetime import datetime, timezone, timedelta
from typing import Optional

from app.config import settings
from app.exceptions.user_exceptions import (
    UserAlreadyExistsException,
    UserNotFoundException,
    InvalidCredentialsException
)
from app.schemas.user_schema import (
    UserCreate,
    UserAddRequest,
    UserAuthRequest
)
from app.services.user_service import UserService
from app.repositories.user_repository import UserRepository
import jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session


class AuthService:
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

    def __init__(self, db: Session):
        self.db = db
        self.user_repository = UserRepository(db)
        self.user_service = UserService(user_repository=self.user_repository)

    @classmethod
    def create_access_token(cls, data: dict) -> str:
        """
        На создает JWT токен
        """
        to_encode = data.copy()
        expire: datetime = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
        to_encode |= {"exp": expire}
        encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, settings.ALGORITHM)
        return encoded_jwt

    @classmethod
    def verify_password(cls, plain_password: str, hashed_password: str) -> bool:
        """
        Проверяет соответствие плоского пароля и хеша
        """
        return cls.pwd_context.verify(plain_password, hashed_password)

    @classmethod
    def hash_password(cls, plain_password: str) -> str:
        """
        Хеширует пароль
        """
        return cls.pwd_context.hash(plain_password)

    @classmethod
    def decode_token(cls, token: str) -> dict:
        """
        Декодирует JWT токен и возвращает пайлоад
        """
        try:
            return jwt.decode(token, settings.SECRET_KEY, [settings.ALGORITHM])
        except jwt.exceptions.DecodeError as ex:
            raise InvalidCredentialsException() from ex
        except jwt.exceptions.ExpiredSignatureError as ex:
            raise InvalidCredentialsException() from ex

    def register_user(self, user_data: UserAddRequest) -> dict:
        """
        Регистрация нового пользователя
        """
        # Проверяем не существует ли уже такого email
        existing_user = self.user_service.get_by_email(user_data.email)
        if existing_user:
            raise UserAlreadyExistsException(email=user_data.email)
        
        # Хешируем пароль
        hashed_password = self.hash_password(user_data.password)
        
        # Нартовано user_data для сохранения
        user_dict = {
            "email": user_data.email,
            "hashed_password": hashed_password,
            "name": user_data.name,
            "role_id": user_data.role_id
        }
        
        created_user = self.user_repository.create(user_dict)
        return {"message": "User registered successfully", "user_id": created_user.id}

    def login_user(self, user_data: UserAuthRequest) -> str:
        """
        Авторизация и выдача JWT токена
        """
        user = self.user_service.get_by_email(user_data.email)
        if not user:
            raise UserNotFoundException(email=user_data.email)
        
        if not self.verify_password(user_data.password, user.hashed_password):
            raise InvalidCredentialsException()
        
        # Генерируем токен с информацией пользователя
        access_token = self.create_access_token(
            {
                "user_id": user.id,
                "email": user.email,
                "role": user.role.name if user.role else "user"
            }
        )
        return access_token

    def get_current_user_id(self, token: str) -> int:
        """
        Извлекает user_id из JWT токена
        """
        payload = self.decode_token(token)
        user_id: int = payload.get("user_id")
        if user_id is None:
            raise InvalidCredentialsException()
        return user_id

    def get_me(self, user_id: int) -> dict:
        """
        Получить данные текущего пользователя
        """
        user = self.user_service.get(user_id)
        if not user:
            raise UserNotFoundException(user_id=user_id)
        
        return {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "role_id": user.role_id,
            "role": user.role.name if user.role else None
        }
