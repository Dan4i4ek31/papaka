from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from app.database.database import engine, Base, create_tables
from app.router import (
    role_router,
    user_router,
    product_router,
    listing_router,
    author_listing_router,
    order_router,
    cart_router,
    favorite_router,
    review_router,
    chat_message_router,
    admin_router  # НОВЫЙ ИМПОРТ
)
from app.exceptions.handler import setup_exception_handlers
import logging
import os
from dotenv import load_dotenv
from contextlib import asynccontextmanager
from pathlib import Path

load_dotenv()

# Определите пути
BASE_DIR = Path(__file__).resolve().parent
TEMPLATES_DIR = os.path.join(BASE_DIR, "app", "templates")
STATIC_DIR = os.path.join(BASE_DIR, "app", "static")

# СОЗДАЕМ ПАПКИ, ЕСЛИ ОНИ НЕ СУЩЕСТВУЮТ
os.makedirs(TEMPLATES_DIR, exist_ok=True)
os.makedirs(STATIC_DIR, exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan менеджер для управления событиями запуска и остановки приложения.
    """
    logger.info("🚀 Starting E-Commerce API...")
    
    try:
        create_tables()
        logger.info("✅ Database tables created successfully")
    except Exception as e:
        logger.error(f"❌ Failed to create database tables: {e}")
        raise
    
    logger.info(f"📊 Database URL: {os.getenv('DATABASE_URL', 'sqlite:///./app.db')}")
    logger.info("✅ Application started successfully")
    
    yield 
    
    logger.info("🛑 Shutting down E-Commerce API...")
    logger.info("👋 Application stopped successfully")


app = FastAPI(
    title="E-Commerce API",
    description="API для интернет-магазина с системой авторов и листингов",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Подключите статические файлы (CSS, JS, изображения)
app.mount("/app/static", StaticFiles(directory=STATIC_DIR), name="static")

# Настройте шаблоны
templates = Jinja2Templates(directory=TEMPLATES_DIR)

# 🔧 УЛУЧШЕННАЯ CORS КОНФИГУРАЦИЯ
# Поддерживает мобильные устройства и удаленный доступ
app.add_middleware(
    CORSMiddleware,
    # Разрешаем ВСЕ origins (можно сузить по надобности)
    # Например: ["http://localhost:8000", "http://192.168.1.100:8000", "https://yourdomain.com"]
    allow_origins=[
        "http://localhost:8000",
        "http://localhost:3000",
        "http://127.0.0.1:8000",
        "*"  # Временно разрешаем все origins - можно удалить в production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=[
        "*",
        "Accept",
        "Accept-Language",
        "Content-Type",
        "Authorization",
        "X-CSRF-Token",
        "X-Requested-With",
    ],
    expose_headers=[
        "Content-Type",
        "X-Total-Count",
        "X-Page",
        "X-Page-Count",
    ],
    max_age=600,  # Кэшируем CORS preflight запросы на 10 минут
)

setup_exception_handlers(app)
app.include_router(role_router.router)
app.include_router(user_router.router)
app.include_router(product_router.router)
app.include_router(listing_router.router)
app.include_router(author_listing_router.router)
app.include_router(order_router.router)
app.include_router(cart_router.router)
app.include_router(favorite_router.router)
app.include_router(review_router.router)
app.include_router(chat_message_router.router)
app.include_router(admin_router.router)  # ПОДКЛЮЧЕНИЕ АДМИН-МАРШРУТОВ


@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/cart.html", response_class=HTMLResponse)
async def read_page1(request: Request):
    return templates.TemplateResponse("cart.html", {"request": request})

@app.get("/auth.html", response_class=HTMLResponse)
async def read_page2(request: Request):
    return templates.TemplateResponse("auth.html", {"request": request})

@app.get("/account.html", response_class=HTMLResponse)
async def read_page3(request: Request):
    return templates.TemplateResponse("account.html", {"request": request})

@app.get("/chat.html", response_class=HTMLResponse)
async def read_page4(request: Request):
    return templates.TemplateResponse("chat.html", {"request": request})

@app.get("/favorite.html", response_class=HTMLResponse)
async def read_page5(request: Request):
    return templates.TemplateResponse("favorite.html", {"request": request})

@app.get("/admin.html", response_class=HTMLResponse)  # НОВЫЙ МАРШРУТ ДЛЯ АДМИН-ПАНЕЛИ
async def read_admin_page(request: Request):
    return templates.TemplateResponse("admin.html", {"request": request})

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected"
    }


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run("main:app", host="0.0.0.0", port=8000)