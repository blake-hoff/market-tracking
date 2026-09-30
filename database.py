from flask_sqlalchemy import SQLAlchemy
import datetime

from sqlalchemy import Boolean, func

db = SQLAlchemy()

# Items Table
class Item(db.Model):
    __tablename__ = "items"

    id = db.Column(db.Integer, primary_key=True)
    roblox_item_id = db.Column(db.String(50), unique=True, nullable=False)
    roblox_product_id = db.Column(db.String(50), unique=True, nullable=False)
    roblox_upload_date = db.Column(db.DateTime(timezone=True), nullable=True)


    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)

    is_limited = db.Column(Boolean, nullable=False)
    quantity = db.Column(db.String(50), nullable=True)
    original_price = db.Column(db.String(50), nullable=True)

    icon = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now(), nullable=False)

class ItemPriceHistory(db.Model):
    __tablename__ = "item_price_history"

    id = db.Column(db.Integer, primary_key=True)
    item_id = db.Column(db.Integer, db.ForeignKey("items.id"), nullable=False)
    price = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now(), nullable=False)

    item = db.relationship("Item", backref=db.backref("price_history", lazy=True, cascade="all, delete-orphan"))