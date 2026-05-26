"""
Le Marche - Premium Gourmet Grocery Store Backend
FastAPI-based REST API with JWT Authentication
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'le-marche-secret-key-2024')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24

# Configure logging first so lifespan can use it
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Lifespan — startup DB ping + shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        await client.admin.command('ping')
        logger.info("✅ MongoDB connection verified")
    except Exception as e:
        logger.error(f"❌ MongoDB connection FAILED: {e}")
        raise RuntimeError(f"Cannot connect to MongoDB: {e}")
    yield
    client.close()
    logger.info("MongoDB connection closed")

# Create FastAPI app and router
app = FastAPI(title="Le Marche API", description="Premium Gourmet Grocery Store API", lifespan=lifespan)
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# ============== PYDANTIC MODELS ==============

# User Models
class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    email: str
    role: str
    created_at: str

class UserProfile(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    email: str
    role: str
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    pincode: Optional[str] = None
    created_at: str

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    pincode: Optional[str] = None

# Product Models
class ProductBase(BaseModel):
    name: str
    description: str
    price: float
    category: str
    image: str
    stock: int = 100
    rating: float = 4.5
    origin: Optional[str] = None
    weight: Optional[str] = None
    tags: List[str] = []

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    image: Optional[str] = None
    stock: Optional[int] = None
    rating: Optional[float] = None
    origin: Optional[str] = None
    weight: Optional[str] = None
    tags: Optional[List[str]] = None

class ProductResponse(ProductBase):
    model_config = ConfigDict(extra="ignore")
    id: str
    created_at: str

# Cart Models
class CartItem(BaseModel):
    product_id: str
    quantity: int = 1

class CartItemResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    product_id: str
    name: str
    price: float
    image: str
    quantity: int

class CartResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    items: List[CartItemResponse]
    total: float

# Order Models
class AddressInfo(BaseModel):
    name: str
    phone: str
    address: str
    city: str
    pincode: str

class OrderCreate(BaseModel):
    address: AddressInfo

class OrderItemResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    product_id: str
    name: str
    price: float
    image: str
    quantity: int

class OrderResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    items: List[OrderItemResponse]
    total_amount: float
    status: str
    address: AddressInfo
    created_at: str

class OrderStatusUpdate(BaseModel):
    status: str


# ============== HELPER FUNCTIONS ==============

def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    """Verify password against hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, role: str) -> str:
    """Create JWT token"""
    payload = {
        'user_id': user_id,
        'role': role,
        'exp': datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> dict:
    """Decode and verify JWT token"""
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ============== AUTH MIDDLEWARE ==============

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Get current user from JWT token"""
    payload = decode_token(credentials.credentials)
    user = await db.users.find_one({"id": payload['user_id']}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

async def get_admin_user(current_user: dict = Depends(get_current_user)) -> dict:
    """Verify current user is admin"""
    if current_user.get('role') != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


# ============== AUTH ROUTES ==============

@api_router.post("/auth/register", response_model=dict)
async def register_user(user_data: UserCreate):
    """Register a new user"""
    # Check if email exists
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user document
    user_id = str(uuid.uuid4())
    user = {
        "id": user_id,
        "name": user_data.name,
        "email": user_data.email,
        "password": hash_password(user_data.password),
        "role": "user",  # Default role
        "phone": None,
        "address": None,
        "city": None,
        "pincode": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user)
    token = create_token(user_id, "user")
    
    return {
        "message": "Registration successful",
        "token": token,
        "user": {
            "id": user_id,
            "name": user["name"],
            "email": user["email"],
            "role": user["role"]
        }
    }

@api_router.post("/auth/login", response_model=dict)
async def login_user(credentials: UserLogin):
    """Login user and return JWT token"""
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user['password']):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_token(user['id'], user['role'])
    
    return {
        "message": "Login successful",
        "token": token,
        "user": {
            "id": user['id'],
            "name": user['name'],
            "email": user['email'],
            "role": user['role']
        }
    }

@api_router.get("/auth/me", response_model=UserProfile)
async def get_current_user_profile(current_user: dict = Depends(get_current_user)):
    """Get current user profile"""
    return UserProfile(
        id=current_user['id'],
        name=current_user['name'],
        email=current_user['email'],
        role=current_user['role'],
        phone=current_user.get('phone'),
        address=current_user.get('address'),
        city=current_user.get('city'),
        pincode=current_user.get('pincode'),
        created_at=current_user['created_at']
    )

@api_router.put("/auth/profile", response_model=UserProfile)
async def update_user_profile(
    update_data: UserProfileUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update user profile"""
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    
    if update_dict:
        await db.users.update_one(
            {"id": current_user['id']},
            {"$set": update_dict}
        )
    
    # Fetch updated user
    updated_user = await db.users.find_one({"id": current_user['id']}, {"_id": 0})
    return UserProfile(
        id=updated_user['id'],
        name=updated_user['name'],
        email=updated_user['email'],
        role=updated_user['role'],
        phone=updated_user.get('phone'),
        address=updated_user.get('address'),
        city=updated_user.get('city'),
        pincode=updated_user.get('pincode'),
        created_at=updated_user['created_at']
    )


# ============== PRODUCT ROUTES ==============

@api_router.get("/products", response_model=List[ProductResponse])
async def get_products(
    category: Optional[str] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort_by: Optional[str] = None
):
    """Get all products with optional filters"""
    query = {}
    
    # Apply filters
    if category:
        query["category"] = category
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"tags": {"$regex": search, "$options": "i"}}
        ]
    if min_price is not None or max_price is not None:
        query["price"] = {}
        if min_price is not None:
            query["price"]["$gte"] = min_price
        if max_price is not None:
            query["price"]["$lte"] = max_price
    
    # Get products excluding MongoDB _id
    cursor = db.products.find(query, {"_id": 0})
    
    # Apply sorting
    if sort_by == "price_asc":
        cursor = cursor.sort("price", 1)
    elif sort_by == "price_desc":
        cursor = cursor.sort("price", -1)
    elif sort_by == "rating":
        cursor = cursor.sort("rating", -1)
    elif sort_by == "name":
        cursor = cursor.sort("name", 1)
    
    products = await cursor.to_list(1000)
    return products

@api_router.get("/products/categories", response_model=List[str])
async def get_categories():
    """Get all unique product categories"""
    categories = await db.products.distinct("category")
    return categories

@api_router.get("/products/{product_id}", response_model=ProductResponse)
async def get_product(product_id: str):
    """Get single product by ID"""
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@api_router.post("/products", response_model=ProductResponse)
async def create_product(
    product_data: ProductCreate,
    admin: dict = Depends(get_admin_user)
):
    """Create new product (Admin only)"""
    product_id = str(uuid.uuid4())
    product = {
        "id": product_id,
        **product_data.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.products.insert_one(product)
    # Return without _id
    if "_id" in product:
        del product["_id"]
    return product

@api_router.put("/products/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: str,
    update_data: ProductUpdate,
    admin: dict = Depends(get_admin_user)
):
    """Update product (Admin only)"""
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    
    if not update_dict:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    result = await db.products.update_one(
        {"id": product_id},
        {"$set": update_dict}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    return product

@api_router.delete("/products/{product_id}")
async def delete_product(
    product_id: str,
    admin: dict = Depends(get_admin_user)
):
    """Delete product (Admin only)"""
    result = await db.products.delete_one({"id": product_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {"message": "Product deleted successfully"}


# ============== CART ROUTES ==============

@api_router.get("/cart", response_model=CartResponse)
async def get_cart(current_user: dict = Depends(get_current_user)):
    """Get user's cart"""
    cart = await db.carts.find_one({"user_id": current_user['id']}, {"_id": 0})
    
    if not cart:
        # Create empty cart
        cart = {
            "id": str(uuid.uuid4()),
            "user_id": current_user['id'],
            "items": []
        }
        await db.carts.insert_one(cart)
    
    # Populate product details for each item
    populated_items = []
    total = 0
    
    for item in cart.get('items', []):
        product = await db.products.find_one({"id": item['product_id']}, {"_id": 0})
        if product:
            populated_item = {
                "product_id": product['id'],
                "name": product['name'],
                "price": product['price'],
                "image": product['image'],
                "quantity": item['quantity']
            }
            populated_items.append(populated_item)
            total += product['price'] * item['quantity']
    
    return CartResponse(
        id=cart['id'],
        user_id=cart['user_id'],
        items=populated_items,
        total=round(total, 2)
    )

@api_router.post("/cart/add", response_model=CartResponse)
async def add_to_cart(
    item: CartItem,
    current_user: dict = Depends(get_current_user)
):
    """Add item to cart"""
    # Verify product exists
    product = await db.products.find_one({"id": item.product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    cart = await db.carts.find_one({"user_id": current_user['id']})
    
    if not cart:
        # Create new cart
        cart = {
            "id": str(uuid.uuid4()),
            "user_id": current_user['id'],
            "items": [{"product_id": item.product_id, "quantity": item.quantity}]
        }
        await db.carts.insert_one(cart)
    else:
        # Check if product already in cart
        existing_item = next(
            (i for i in cart['items'] if i['product_id'] == item.product_id),
            None
        )
        
        if existing_item:
            # Update quantity
            await db.carts.update_one(
                {"user_id": current_user['id'], "items.product_id": item.product_id},
                {"$inc": {"items.$.quantity": item.quantity}}
            )
        else:
            # Add new item
            await db.carts.update_one(
                {"user_id": current_user['id']},
                {"$push": {"items": {"product_id": item.product_id, "quantity": item.quantity}}}
            )
    
    return await get_cart(current_user)

@api_router.put("/cart/update", response_model=CartResponse)
async def update_cart_item(
    item: CartItem,
    current_user: dict = Depends(get_current_user)
):
    """Update cart item quantity"""
    if item.quantity <= 0:
        # Remove item if quantity is 0 or less
        await db.carts.update_one(
            {"user_id": current_user['id']},
            {"$pull": {"items": {"product_id": item.product_id}}}
        )
    else:
        await db.carts.update_one(
            {"user_id": current_user['id'], "items.product_id": item.product_id},
            {"$set": {"items.$.quantity": item.quantity}}
        )
    
    return await get_cart(current_user)

@api_router.delete("/cart/remove/{product_id}", response_model=CartResponse)
async def remove_from_cart(
    product_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Remove item from cart"""
    await db.carts.update_one(
        {"user_id": current_user['id']},
        {"$pull": {"items": {"product_id": product_id}}}
    )
    
    return await get_cart(current_user)

@api_router.delete("/cart/clear", response_model=dict)
async def clear_cart(current_user: dict = Depends(get_current_user)):
    """Clear all items from cart"""
    await db.carts.update_one(
        {"user_id": current_user['id']},
        {"$set": {"items": []}}
    )
    return {"message": "Cart cleared"}


# ============== ORDER ROUTES ==============

@api_router.post("/orders", response_model=OrderResponse)
async def create_order(
    order_data: OrderCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create order from cart"""
    cart = await db.carts.find_one({"user_id": current_user['id']}, {"_id": 0})
    
    if not cart or not cart.get('items'):
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    # Build order items with product details
    order_items = []
    total_amount = 0
    
    for item in cart['items']:
        product = await db.products.find_one({"id": item['product_id']}, {"_id": 0})
        if product:
            order_item = {
                "product_id": product['id'],
                "name": product['name'],
                "price": product['price'],
                "image": product['image'],
                "quantity": item['quantity']
            }
            order_items.append(order_item)
            total_amount += product['price'] * item['quantity']
    
    # Create order document
    order_id = str(uuid.uuid4())
    order = {
        "id": order_id,
        "user_id": current_user['id'],
        "items": order_items,
        "total_amount": round(total_amount, 2),
        "status": "pending",
        "address": order_data.address.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.orders.insert_one(order)
    
    # Clear cart after order
    await db.carts.update_one(
        {"user_id": current_user['id']},
        {"$set": {"items": []}}
    )
    
    # Return order without _id
    return OrderResponse(
        id=order['id'],
        user_id=order['user_id'],
        items=order_items,
        total_amount=order['total_amount'],
        status=order['status'],
        address=AddressInfo(**order['address']),
        created_at=order['created_at']
    )

@api_router.get("/orders", response_model=List[OrderResponse])
async def get_user_orders(current_user: dict = Depends(get_current_user)):
    """Get current user's orders"""
    orders = await db.orders.find(
        {"user_id": current_user['id']},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    return [
        OrderResponse(
            id=order['id'],
            user_id=order['user_id'],
            items=order['items'],
            total_amount=order['total_amount'],
            status=order['status'],
            address=AddressInfo(**order['address']),
            created_at=order['created_at']
        )
        for order in orders
    ]

@api_router.get("/orders/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get single order"""
    order = await db.orders.find_one(
        {"id": order_id, "user_id": current_user['id']},
        {"_id": 0}
    )
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return OrderResponse(
        id=order['id'],
        user_id=order['user_id'],
        items=order['items'],
        total_amount=order['total_amount'],
        status=order['status'],
        address=AddressInfo(**order['address']),
        created_at=order['created_at']
    )


# ============== ADMIN ROUTES ==============

@api_router.get("/admin/orders", response_model=List[OrderResponse])
async def get_all_orders(admin: dict = Depends(get_admin_user)):
    """Get all orders (Admin only)"""
    orders = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    return [
        OrderResponse(
            id=order['id'],
            user_id=order['user_id'],
            items=order['items'],
            total_amount=order['total_amount'],
            status=order['status'],
            address=AddressInfo(**order['address']),
            created_at=order['created_at']
        )
        for order in orders
    ]

@api_router.put("/admin/orders/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: str,
    status_update: OrderStatusUpdate,
    admin: dict = Depends(get_admin_user)
):
    """Update order status (Admin only)"""
    valid_statuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]
    
    if status_update.status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
        )
    
    result = await db.orders.update_one(
        {"id": order_id},
        {"$set": {"status": status_update.status}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    return OrderResponse(
        id=order['id'],
        user_id=order['user_id'],
        items=order['items'],
        total_amount=order['total_amount'],
        status=order['status'],
        address=AddressInfo(**order['address']),
        created_at=order['created_at']
    )

@api_router.get("/admin/stats", response_model=dict)
async def get_admin_stats(admin: dict = Depends(get_admin_user)):
    """Get dashboard stats (Admin only)"""
    total_products = await db.products.count_documents({})
    total_orders = await db.orders.count_documents({})
    total_users = await db.users.count_documents({})
    
    # Calculate total revenue
    pipeline = [
        {"$group": {"_id": None, "total": {"$sum": "$total_amount"}}}
    ]
    revenue_result = await db.orders.aggregate(pipeline).to_list(1)
    total_revenue = revenue_result[0]['total'] if revenue_result else 0
    
    # Get recent orders
    recent_orders = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(5)
    
    return {
        "total_products": total_products,
        "total_orders": total_orders,
        "total_users": total_users,
        "total_revenue": round(total_revenue, 2),
        "recent_orders": recent_orders
    }


# ============== SEED DATA ==============

@api_router.post("/seed", response_model=dict)
async def seed_database():
    """Seed database with sample products"""
    # Check if products already exist
    existing = await db.products.count_documents({})
    if existing > 0:
        return {"message": f"Database already has {existing} products", "seeded": False}
    
    # Sample gourmet products inspired by Le Marche
    products = [
        {
            "id": str(uuid.uuid4()),
            "name": "Aged Gruyere Cheese",
            "description": "Premium Swiss Gruyere aged 18 months. Perfect for fondue and gourmet sandwiches with a rich, nutty flavor.",
            "price": 1299,
            "category": "Cheese & Dairy",
            "image": "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=800",
            "stock": 50,
            "rating": 4.8,
            "origin": "Switzerland",
            "weight": "250g",
            "tags": ["imported", "premium", "artisanal"],
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Italian Truffle Oil",
            "description": "Extra virgin olive oil infused with black summer truffles from Umbria. A luxurious finishing oil for pasta and risotto.",
            "price": 1899,
            "category": "Oils & Vinegars",
            "image": "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800",
            "stock": 30,
            "rating": 4.9,
            "origin": "Italy",
            "weight": "250ml",
            "tags": ["imported", "truffle", "luxury"],
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Organic Sourdough Loaf",
            "description": "Artisan sourdough bread made with organic wheat and a 100-year-old starter. Crusty exterior, soft interior.",
            "price": 349,
            "category": "Bakery",
            "image": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800",
            "stock": 20,
            "rating": 4.7,
            "origin": "Local",
            "weight": "500g",
            "tags": ["organic", "fresh", "artisanal"],
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Spanish Iberico Ham",
            "description": "Premium acorn-fed Iberico ham from Spain. Aged 36 months for an intense, nutty flavor. Hand-sliced.",
            "price": 3499,
            "category": "Meat & Deli",
            "image": "https://images.unsplash.com/photo-1544025162-d76694265947?w=800",
            "stock": 15,
            "rating": 4.9,
            "origin": "Spain",
            "weight": "100g",
            "tags": ["imported", "premium", "cured"],
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Wild Norwegian Salmon",
            "description": "Fresh wild-caught Norwegian salmon. Rich in omega-3, perfect for sashimi or gourmet preparations.",
            "price": 1899,
            "category": "Seafood",
            "image": "https://images.unsplash.com/photo-1499125562588-29fb8a56b5d5?w=800",
            "stock": 25,
            "rating": 4.8,
            "origin": "Norway",
            "weight": "500g",
            "tags": ["fresh", "wild-caught", "premium"],
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Organic Mixed Greens",
            "description": "Fresh organic baby spinach, arugula, and mixed lettuce. Farm-fresh and pesticide-free.",
            "price": 199,
            "category": "Organic Produce",
            "image": "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800",
            "stock": 40,
            "rating": 4.6,
            "origin": "Local Farm",
            "weight": "200g",
            "tags": ["organic", "fresh", "local"],
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "French Croissants",
            "description": "Authentic butter croissants made with French AOC butter. Flaky, golden, and irresistible.",
            "price": 299,
            "category": "Bakery",
            "image": "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800",
            "stock": 30,
            "rating": 4.8,
            "origin": "France",
            "weight": "Pack of 4",
            "tags": ["imported", "fresh", "butter"],
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Belgian Dark Chocolate",
            "description": "72% single-origin dark chocolate from Belgian master chocolatiers. Intense and smooth.",
            "price": 599,
            "category": "Confectionery",
            "image": "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=800",
            "stock": 50,
            "rating": 4.9,
            "origin": "Belgium",
            "weight": "200g",
            "tags": ["imported", "luxury", "dark-chocolate"],
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Greek Extra Virgin Olive Oil",
            "description": "Cold-pressed Koroneiki olives from Kalamata. Peppery finish, perfect for salads and dipping.",
            "price": 1299,
            "category": "Oils & Vinegars",
            "image": "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800",
            "stock": 35,
            "rating": 4.7,
            "origin": "Greece",
            "weight": "500ml",
            "tags": ["imported", "organic", "premium"],
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Organic Avocados",
            "description": "Perfectly ripe Hass avocados from certified organic farms. Creamy and delicious.",
            "price": 399,
            "category": "Organic Produce",
            "image": "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=800",
            "stock": 60,
            "rating": 4.5,
            "origin": "Mexico",
            "weight": "Pack of 3",
            "tags": ["organic", "fresh", "imported"],
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Japanese Matcha Powder",
            "description": "Ceremonial grade matcha from Uji, Kyoto. Vibrant green with a sweet, umami-rich flavor.",
            "price": 1499,
            "category": "Beverages",
            "image": "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=800",
            "stock": 25,
            "rating": 4.8,
            "origin": "Japan",
            "weight": "30g",
            "tags": ["imported", "premium", "tea"],
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Aged Balsamic Vinegar",
            "description": "Traditional balsamic vinegar from Modena, aged 12 years. Sweet, complex, and luxurious.",
            "price": 2199,
            "category": "Oils & Vinegars",
            "image": "https://images.unsplash.com/photo-1601648156308-51e5c5a10c7f?w=800",
            "stock": 20,
            "rating": 4.9,
            "origin": "Italy",
            "weight": "250ml",
            "tags": ["imported", "aged", "luxury"],
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Organic Quinoa",
            "description": "Premium white quinoa from the Andes. High protein, gluten-free, and versatile.",
            "price": 449,
            "category": "Pantry",
            "image": "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800",
            "stock": 45,
            "rating": 4.6,
            "origin": "Peru",
            "weight": "500g",
            "tags": ["organic", "gluten-free", "healthy"],
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "French Camembert",
            "description": "Authentic Norman Camembert with a creamy interior and bloomy rind. AOC certified.",
            "price": 899,
            "category": "Cheese & Dairy",
            "image": "https://images.unsplash.com/photo-1452195100486-9cc805987862?w=800",
            "stock": 25,
            "rating": 4.7,
            "origin": "France",
            "weight": "250g",
            "tags": ["imported", "artisanal", "AOC"],
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Italian Pasta Trio",
            "description": "Handmade bronze-cut pasta set: Pappardelle, Tagliatelle, and Penne. Artisan quality from Gragnano.",
            "price": 799,
            "category": "Pantry",
            "image": "https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=800",
            "stock": 40,
            "rating": 4.8,
            "origin": "Italy",
            "weight": "500g each",
            "tags": ["imported", "artisanal", "bronze-cut"],
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Organic Honey",
            "description": "Raw, unfiltered wildflower honey from the Himalayas. Pure and naturally crystallized.",
            "price": 699,
            "category": "Pantry",
            "image": "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800",
            "stock": 35,
            "rating": 4.7,
            "origin": "India",
            "weight": "500g",
            "tags": ["organic", "raw", "local"],
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Gluten-Free Granola",
            "description": "Crunchy oat-free granola with almonds, coconut, and dark chocolate. Vegan and delicious.",
            "price": 549,
            "category": "Breakfast",
            "image": "https://images.unsplash.com/photo-1517456793572-1d8efd6dc135?w=800",
            "stock": 30,
            "rating": 4.5,
            "origin": "Local",
            "weight": "400g",
            "tags": ["gluten-free", "vegan", "healthy"],
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Artisan Butter Collection",
            "description": "French butter trio: Salted, Unsalted, and Truffle-infused. Perfect for the discerning palate.",
            "price": 999,
            "category": "Cheese & Dairy",
            "image": "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=800",
            "stock": 20,
            "rating": 4.8,
            "origin": "France",
            "weight": "250g each",
            "tags": ["imported", "artisanal", "premium"],
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    # Insert products
    await db.products.insert_many(products)
    
    # Create admin user if not exists
    admin_exists = await db.users.find_one({"email": "admin@lemarche.com"})
    if not admin_exists:
        admin_user = {
            "id": str(uuid.uuid4()),
            "name": "Admin",
            "email": "admin@lemarche.com",
            "password": hash_password("admin123"),
            "role": "admin",
            "phone": "+91 9876543210",
            "address": "UG-23, Golf Course Road",
            "city": "Gurugram",
            "pincode": "122011",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(admin_user)
    
    return {"message": f"Seeded {len(products)} products and created admin user", "seeded": True}


# ============== ROOT ROUTE ==============

@api_router.get("/")
async def root():
    return {"message": "Le Marche API - Premium Gourmet Grocery Store"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}


# Include router and add middleware
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)
