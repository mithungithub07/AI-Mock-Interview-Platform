from database import SessionLocal, User
from services.auth_services import hash_password

db = SessionLocal()

# Check if admin already exists
existing_admin = db.query(User).filter(User.email == "admin@mock-interview.com").first()

if existing_admin:
    print("❌ Admin already exists")
else:
    admin = User(
        name="Admin",
        email="admin@mock-interview.com",
        password_hash=hash_password("Admin@123"),
        role="admin"
    )
    
    db.add(admin)
    db.commit()
    print("✅ Admin created successfully!")
    print("Email: admin@mock-interview.com")
    print("Password: Admin@123")

db.close()