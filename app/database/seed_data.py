from sqlalchemy.orm import Session
from app.database.database import engine, Base, SessionLocal
from app.models.roles import RoleModel
from app.models.users import UserModel
from passlib.context import CryptContext
from datetime import datetime

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def seed_database():
    Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()
    
    try:
        print("\n" + "="*60)
        print("\ud83d\udd27 ИНИЦИАЛИЗАЦИЯ БД: Добавление ролей")
        print("="*60)
        
        admin_role = db.query(RoleModel).filter(RoleModel.name == "admin").first()
        user_role = db.query(RoleModel).filter(RoleModel.name == "user").first()
        
        if not admin_role:
            admin_role = RoleModel(name="admin")
            db.add(admin_role)
            print("✅ Создана роль: admin")
        else:
            print("⏭️  Роль admin уже существует")
        
        if not user_role:
            user_role = RoleModel(name="user")
            db.add(user_role)
            print("✅ Создана роль: user")
        else:
            print("⏭️  Роль user уже существует")
        
        db.commit()
        
        print("\n" + "="*60)
        print("👤 ИНИЦИАЛИЗАЦИЯ БД: Добавление тестовых аккаунтов")
        print("="*60)
        
        admin_role = db.query(RoleModel).filter(RoleModel.name == "admin").first()
        user_role = db.query(RoleModel).filter(RoleModel.name == "user").first()
        
        admin_user = db.query(UserModel).filter(UserModel.email == "admin@example.com").first()
        if not admin_user:
            admin_user = UserModel(
                name="Администратор",
                email="admin@example.com",
                hashed_password=hash_password("admin123"),
                role_id=admin_role.id
            )
            db.add(admin_user)
            db.commit()
            print(f"✅ Создан админ аккаунт:")
            print(f"   Email: admin@example.com")
            print(f"   Пароль: admin123")
            print(f"   ID: {admin_user.id}")
        else:
            print(f"⏭️  Админ аккаунт уже существует (ID: {admin_user.id})")
        
        user1 = db.query(UserModel).filter(UserModel.email == "user1@example.com").first()
        if not user1:
            user1 = UserModel(
                name="Иван Петров",
                email="user1@example.com",
                hashed_password=hash_password("user123"),
                role_id=user_role.id
            )
            db.add(user1)
            db.commit()
            print(f"✅ Создан пользовательский аккаунт #1:")
            print(f"   Email: user1@example.com")
            print(f"   Пароль: user123")
            print(f"   ID: {user1.id}")
        else:
            print(f"⏭️  Пользователь user1@example.com уже существует (ID: {user1.id})")
        
        user2 = db.query(UserModel).filter(UserModel.email == "user2@example.com").first()
        if not user2:
            user2 = UserModel(
                name="Мария Сидорова",
                email="user2@example.com",
                hashed_password=hash_password("user456"),
                role_id=user_role.id
            )
            db.add(user2)
            db.commit()
            print(f"✅ Создан пользовательский аккаунт #2:")
            print(f"   Email: user2@example.com")
            print(f"   Пароль: user456")
            print(f"   ID: {user2.id}")
        else:
            print(f"⏭️  Пользователь user2@example.com уже существует (ID: {user2.id})")
        
        print("\n" + "="*60)
        print("📊 ИТОГОВАЯ ИНФОРМАЦИЯ")
        print("="*60)
        
        total_roles = db.query(RoleModel).count()
        total_users = db.query(UserModel).count()
        admin_count = db.query(UserModel).filter(UserModel.role_id == admin_role.id).count()
        user_count = db.query(UserModel).filter(UserModel.role_id == user_role.id).count()
        
        print(f"\n📍 Ролей в БД: {total_roles}")
        print(f"   • admin")
        print(f"   • user")
        
        print(f"\n👥 Пользователей в БД: {total_users}")
        print(f"   • Админов: {admin_count}")
        print(f"   • Обычных пользователей: {user_count}")
        
        print("\n" + "="*60)
        print("🔐 УЧЕТНЫЕ ДАННЫЕ ДЛЯ ТЕСТИРОВАНИЯ")
        print("="*60)
        
        print("\n🔓 АДМИН АККАУНТ:")
        print("   Email: admin@example.com")
        print("   Пароль: admin123")
        print("   Роль: admin")
        print("   ID: 1")
        print("   ➜ Доступ к: /admin.html?user_id=1")
        
        print("\n👤 ПОЛЬЗОВАТЕЛЬСКИЙ АККАУНТ #1:")
        print("   Email: user1@example.com")
        print("   Пароль: user123")
        print("   Роль: user")
        print("   ID: 2")
        
        print("\n👤 ПОЛЬЗОВАТЕЛЬСКИЙ АККАУНТ #2:")
        print("   Email: user2@example.com")
        print("   Пароль: user456")
        print("   Роль: user")
        print("   ID: 3")
        
        print("\n" + "="*60)
        print("✅ ИНИЦИАЛИЗАЦИЯ ЗАВЕРШЕНА!")
        print("="*60 + "\n")
        
    except Exception as e:
        print(f"\n❌ ОШИБКА: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()