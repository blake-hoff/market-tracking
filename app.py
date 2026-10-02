import datetime

from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_migrate import Migrate

from database import db, Item, ItemPriceHistory
from functions import load_roblosecurity, get_roblox_item_details, get_item_img_url, getItemPrice, searchCatalog
import requests
from sqlalchemy import asc

app = Flask(__name__)
CORS(app, supports_credentials=True)  # Enables CORS to allow requests from the React frontend

# Configure SQLAlchemy
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

migrate = Migrate(app, db)

cookie_key = load_roblosecurity() # need this to not get timed out

# Class Routes
#base page
@app.route('/')
def base_page():
    return jsonify({
        'success': True,
    }), 200

#get all items
@app.route('/api/item/', methods=['GET'])
def get_server_items():
    """Get all items in database"""
    items = Item.query.order_by(Item.roblox_upload_date.desc()).all()
    # items.reverse()

    return jsonify({
        'success': True,
        'items': [{'id': item.roblox_item_id, 'name': item.name, 'date': item.created_at, 'upload_date': item.roblox_upload_date, 'limited': item.is_limited, 'icon': item.icon, 'description': item.description, 'quantity': item.quantity} for item in items]
    }), 200

#Create or return an itemID to the database
@app.route('/api/item/<int:item_id>', methods=['GET'])
def get_item_details(item_id):

    # call to the function in functions.py, to make the online request to the roblox API
    itemDetails = get_roblox_item_details(item_id, cookie_key)
    if not itemDetails: # if the itemDetails fails due to not a 404
        return jsonify({
            'success': False,
            'message': "Could not find item, or the request server did not respond.",
            'errors-roblox': itemDetails.json().get('errors'),
            'item': {"id": item_id, "Name": "Null", "Description": "Null"},
            'status-code': itemDetails.status_code
        }), 500

    
    # print(itemDetails)
    productID = itemDetails.get('productId')
    uploadDate = datetime.datetime.fromisoformat(itemDetails.get('itemCreatedUtc').replace("Z", "+00:00"))
    itemName = itemDetails.get('name')
    itemDesc = itemDetails.get('description')
    itemQuantity = itemDetails.get('totalQuantity')
    originalPrice = itemDetails.get('price')
    isLimited = 'LimitedUnique' in itemDetails.get('itemRestrictions') or 'Limited' in itemDetails.get('itemRestrictions')
    iconUrl = get_item_img_url(item_id, cookie_key) # images sizes: 110, 150, 420

    item = Item.query.filter_by(roblox_item_id=item_id).first()
    # determine if it needs to be updated or added to the db
    if item: # updated
        print(f"updating {item_id}")
        item.roblox_item_id = item_id
        item.roblox_product_id = productID if productID else item.roblox_product_id
        item.roblox_upload_date = uploadDate if uploadDate else item.roblox_upload_date
        item.name = itemName if itemName else item.name
        item.description = itemDesc if itemDesc else item.description
        item.is_limited = isLimited if isLimited else item.is_limited
        item.quantity = itemQuantity if itemQuantity else item.quantity
        item.original_price = originalPrice if originalPrice else item.original_price
        item.icon = iconUrl if iconUrl else item.icon

        db.session.commit()

    else: # added
        print(f"creating {item_id}")

        # create item row object
        item = Item(roblox_item_id=item_id,
                    roblox_product_id=productID,
                    name=itemName,
                    description=itemDesc,
                    is_limited=isLimited,
                    quantity=itemQuantity,
                    original_price=originalPrice,
                    icon=iconUrl,
                    roblox_upload_date=uploadDate
                    )
            
        db.session.add(item)
        db.session.commit()

    item_data = {
        "id": item.roblox_item_id,
        "name": item.name,
        "description": item.description,
        "quantity": item.quantity,
        "time-created": item.created_at,
        "icon": item.icon,
        "upload-date": item.roblox_upload_date
    }

    return jsonify({
        'success': True,
        'item': item_data
    }), 200


@app.route('/api/item/<int:item_id>', methods=['DELETE'])
def delete_item(item_id):
    # see if it is in the backends database already.
    item = Item.query.filter_by(roblox_item_id=item_id).first()

    # if it is in the database we need to delete it.
    if item:
        # call to the function in functions.py, to make the online request to the roblox API
        db.session.delete(item)
        db.session.commit()

        return jsonify({
            'success': True,
        }), 200
    else:
        return jsonify({
            'success': False,
        }), 200


@app.route('/api/item-price/<int:item_id>', methods=['GET'])
def get_item_price(item_id):
    # call to the function in functions.py, to make the online request to the roblox API
    itemDetails = getItemPrice(item_id, cookie_key)
    # responsetemp = searchCatalog("dominus", cookie_key)
    # print(type(itemDetails))
    # print(itemDetails)
    if type(itemDetails) is int: # make sure the itemDetails are an integer (what a price should be)
        item_data = {
            "id": item_id,
            "price": itemDetails
        }

        # for adding it to the history table.
        item = ItemPriceHistory(item_id=item_id, price=itemDetails)
        db.session.add(item)
        db.session.commit()

        return jsonify({
            'success': True,
            'item': item_data
        }), 200


    return jsonify({
        'success': False,
        'message': "Could not get item price.",
        'errors-roblox': itemDetails.json(),
        "id": item_id
        # 'status-code': itemDetails
    }), 500

@app.route('/api/search-roblox-catalog', methods=['GET'])
def search_roblox_catalog(): # taxonomy does the accessories.
    # call to the function in functions.py, to make the online request to the roblox API
    keyword = request.args.get('keyword', '').strip()
    # print(keyword)
    itemDetails = searchCatalog(keyword, cookie_key)
    # print(type(itemDetails))
    print(itemDetails)
    if type(itemDetails) is list: # make sure the itemDetails are a list
        return jsonify({
            'success': True,
            'item': itemDetails
        }), 200


    return jsonify({
        'success': False,
        'message': "Could not get item price.",
        # 'errors-roblox': itemDetails.json(),
        # "id": itemDetails
        # 'status-code': itemDetails
    }), 500

#get the item price history from the database
@app.route('/api/item-price-history/<int:item_id>', methods=['GET'])
def get_item_price_history(item_id):
    # get the price history of the current item id selected.
    price_entries = (
        ItemPriceHistory.query
        .filter_by(item_id=item_id)
        .order_by(ItemPriceHistory.created_at.asc())
        .all()
    )
    createdAt = []
    prices = []
    for entry in price_entries:
        createdAt.append(entry.created_at.isoformat())
        prices.append(entry.price)

    data = {"prices": prices, "created_at": createdAt}

    # print(data)

    return jsonify({
        'success': True,
        "item_id": item_id,
        "history": data
    }), 200

# For direct execution
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)