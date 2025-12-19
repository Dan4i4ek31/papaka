from fastapi import HTTPException, status


class UserAlreadyExistsError(HTTPException):
    """Пользователь уже существует"""
    def __init__(self, email: str = None):
        detail = f"User with email {email} already exists" if email else "User already exists"
        super().__init__(status_code=status.HTTP_409_CONFLICT, detail=detail)


class UserNotFoundError(HTTPException):
    """Пользователь не найден"""
    def __init__(self, user_id: int = None, email: str = None):
        if user_id:
            detail = f"User with id {user_id} not found"
        elif email:
            detail = f"User with email {email} not found"
        else:
            detail = "User not found"
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=detail)


class InvalidPasswordError(HTTPException):
    """Неверный пароль"""
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )


class InvalidJWTTokenError(HTTPException):
    """Невалидный JWT токен"""
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"}
        )


class JWTTokenExpiredError(HTTPException):
    """JWT токен истёк"""
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"}
        )


class InvalidCredentialsException(HTTPException):
    """Невалидные учётные данные"""
    def __init__(self, detail: str = None):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail or "Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"}
        )
