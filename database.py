from flask_sqlalchemy import SQLAlchemy
import datetime

from sqlalchemy import Boolean

db = SQLAlchemy()

# ----------------------
# Users Table
# ----------------------
class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.now())

    # Relationship to tracked items
    tracked_items = db.relationship(
        "UserItem",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy=True
    )


# ----------------------
# Items Table
# ----------------------
class Item(db.Model):
    __tablename__ = "items"

    id = db.Column(db.Integer, primary_key=True)
    roblox_item_id = db.Column(db.String(50), unique=True, nullable=False)
    roblox_product_id = db.Column(db.String(50), unique=True, nullable=False)


    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)

    is_limited = db.Column(Boolean, nullable=False)
    quantity = db.Column(db.String(50), nullable=True)
    original_price = db.Column(db.String(50), nullable=True)

    icon = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.datetime.now())

    # Relationship to users tracking this item
    users_tracking = db.relationship(
        "UserItem",
        back_populates="item",
        cascade="all, delete-orphan",
        lazy=True
    )


# ----------------------
# Linking Table: UserItem
# ----------------------
class UserItem(db.Model):
    __tablename__ = "user_items"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    item_id = db.Column(db.Integer, db.ForeignKey("items.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.now())

    # Relationships
    user = db.relationship("User", back_populates="tracked_items")
    item = db.relationship("Item", back_populates="users_tracking")

    # Prevent the same user from tracking the same item twice
    __table_args__ = (db.UniqueConstraint("user_id", "item_id", name="_user_item_uc"),)
