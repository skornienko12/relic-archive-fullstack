"""RELIC ARCHIVE educational FastAPI API: SQLite, typed Pydantic schemas, JWT."""
from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone
from hashlib import pbkdf2_hmac
from hmac import compare_digest
import os
from pathlib import Path
import secrets
import sqlite3

import jwt
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, Field

DB_PATH = Path(os.getenv("DATABASE_PATH", str(Path(__file__).with_name("relic.db"))))
SECRET = os.getenv("JWT_SECRET", "development-only-change-me-before-deployment-please")
bearer = HTTPBearer(auto_error=False)

class Product(BaseModel):
    id: int
    name: str
    category: str
    price: int
    image: str
    description: str
    size: str
    featured: bool

class LoginInput(BaseModel):
    username: str = Field(min_length=3)
    password: str = Field(min_length=6)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class User(BaseModel):
    id: int
    username: str

class OrderItemInput(BaseModel):
    product_id: int
    quantity: int = Field(ge=1, le=20)

class OrderCreate(BaseModel):
    items: list[OrderItemInput] = Field(min_length=1)

class Order(BaseModel):
    id: int
    user_id: int
    total: int
    items: list[OrderItemInput]
    created_at: str

PRODUCTS = [
    (1, "Distressed Leather Jacket", "Outerwear", 18900, "jacket", "Потёртая кожа, свободный силуэт и винтажная фурнитура.", "M–XL", 1),
    (2, "Washed Wide Denim", "Denim", 9200, "denim", "Широкий крой, выстиранный графитовый деним.", "S–XL", 1),
    (3, "Archive Stripe Longsleeve", "Tops", 5900, "stripe", "Полосатый лонгслив с необработанными краями.", "S–L", 1),
    (4, "Deconstructed Bomber", "Outerwear", 14500, "bomber", "Объёмный бомбер с контрастной подкладкой.", "M–XL", 0),
    (5, "Faded Graphic Tee", "Tops", 4200, "tee", "Винтажная футболка с выцветшим принтом.", "S–XL", 0),
    (6, "Heavy Cargo Trousers", "Bottoms", 10900, "cargo", "Карго с глубокими карманами и широкими штанинами.", "S–XL", 0),
]

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def hash_password(password: str, salt: str | None = None) -> str:
    salt = salt or secrets.token_hex(16)
    hashed = pbkdf2_hmac("sha256", password.encode(), bytes.fromhex(salt), 260000)
    return f"{salt}${hashed.hex()}"

def verify_password(password: str, stored: str) -> bool:
    salt, _ = stored.split("$", 1)
    return compare_digest(hash_password(password, salt), stored)

def init_db():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with get_db() as db:
        db.executescript("""
            CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY, name TEXT NOT NULL,
              category TEXT NOT NULL, price INTEGER NOT NULL, image TEXT NOT NULL,
              description TEXT NOT NULL, size TEXT NOT NULL, featured INTEGER NOT NULL);
            CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT NOT NULL UNIQUE,
              password_hash TEXT NOT NULL);
            CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY AUTOINCREMENT,
              user_id INTEGER NOT NULL, total INTEGER NOT NULL, created_at TEXT NOT NULL,
              FOREIGN KEY(user_id) REFERENCES users(id));
            CREATE TABLE IF NOT EXISTS order_items (order_id INTEGER NOT NULL,
              product_id INTEGER NOT NULL, quantity INTEGER NOT NULL,
              FOREIGN KEY(order_id) REFERENCES orders(id),
              FOREIGN KEY(product_id) REFERENCES products(id));
        """)
        db.executemany("INSERT OR IGNORE INTO products VALUES (?, ?, ?, ?, ?, ?, ?, ?)", PRODUCTS)
        if not db.execute("SELECT 1 FROM users WHERE username = ?", ("demo",)).fetchone():
            db.execute("INSERT INTO users (username, password_hash) VALUES (?, ?)", ("demo", hash_password("archive123")))
        db.commit()

@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    yield

app = FastAPI(title="RELIC ARCHIVE API", version="1.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://relic-archive-shop-sk.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

def current_user(credentials: HTTPAuthorizationCredentials | None = Depends(bearer)) -> User:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Требуется авторизация")
    try:
        payload = jwt.decode(credentials.credentials, SECRET, algorithms=["HS256"])
        user_id = int(payload["sub"])
    except (jwt.PyJWTError, KeyError, ValueError, TypeError):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Недействительный токен") from None
    with get_db() as db:
        row = db.execute("SELECT id, username FROM users WHERE id = ?", (user_id,)).fetchone()
    if row is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Пользователь не найден")
    return User(**dict(row))

@app.get("/api/health")
def health():
    return {"status": "ok"}

@app.get("/api/products", response_model=list[Product])
def list_products():
    with get_db() as db:
        rows = db.execute("SELECT * FROM products ORDER BY id").fetchall()
    return [Product(**dict(row)) for row in rows]

@app.get("/api/products/{product_id}", response_model=Product)
def get_product(product_id: int):
    with get_db() as db:
        row = db.execute("SELECT * FROM products WHERE id = ?", (product_id,)).fetchone()
    if row is None:
        raise HTTPException(404, "Товар не найден")
    return Product(**dict(row))

@app.post("/api/auth/login", response_model=TokenResponse)
def login(credentials: LoginInput):
    with get_db() as db:
        row = db.execute("SELECT * FROM users WHERE username = ?", (credentials.username,)).fetchone()
    if row is None or not verify_password(credentials.password, row["password_hash"]):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Неверный логин или пароль")
    token = jwt.encode({"sub": str(row["id"]),
                        "exp": datetime.now(timezone.utc) + timedelta(hours=8)}, SECRET, algorithm="HS256")
    return TokenResponse(access_token=token)

@app.get("/api/users/me", response_model=User)
def me(user: User = Depends(current_user)):
    return user

@app.get("/api/orders", response_model=list[Order])
def orders(user: User = Depends(current_user)):
    with get_db() as db:
        rows = db.execute("SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC", (user.id,)).fetchall()
        result = []
        for row in rows:
            items = db.execute("SELECT product_id, quantity FROM order_items WHERE order_id = ?", (row["id"],)).fetchall()
            result.append(Order(id=row["id"], user_id=user.id, total=row["total"],
                created_at=row["created_at"], items=[OrderItemInput(**dict(item)) for item in items]))
        return result

@app.post("/api/orders", response_model=Order, status_code=201)
def create_order(data: OrderCreate, user: User = Depends(current_user)):
    with get_db() as db:
        total = 0
        for item in data.items:
            row = db.execute("SELECT price FROM products WHERE id = ?", (item.product_id,)).fetchone()
            if row is None:
                raise HTTPException(400, f"Товар {item.product_id} не существует")
            total += row["price"] * item.quantity
        now = datetime.now(timezone.utc).isoformat()
        cursor = db.execute("INSERT INTO orders (user_id, total, created_at) VALUES (?, ?, ?)", (user.id, total, now))
        order_id = cursor.lastrowid
        db.executemany("INSERT INTO order_items (order_id, product_id, quantity) VALUES (?, ?, ?)",
                       [(order_id, item.product_id, item.quantity) for item in data.items])
        db.commit()
    return Order(id=order_id, user_id=user.id, total=total, created_at=now, items=data.items)
