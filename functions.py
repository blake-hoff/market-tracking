import requests
import json
import re
import time
import webbrowser

USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117 Safari/537.36"

def get_roblox_item_details(item_id, roblosecurity):
    url = f"https://catalog.roblox.com/v1/catalog/items/{item_id}/details?itemType=asset"
    headers = {
        "User-Agent": USER_AGENT,
        "Accept": "application/json",
        "Referer": "https://www.roblox.com",
    }
    cookies = {
        ".ROBLOSECURITY": roblosecurity
    }

    response = requests.get(url, headers=headers, cookies=cookies)
    if response.status_code == 200:
        try:
            data = response.json()
            return data
        except json.JSONDecodeError:
            print("Error decoding JSON.")
            return None
    else:
        return response

def get_item_img_url(item_id, roblosecurity):
    img_url = ''
    pixel_size = 420
    # pixel_size = 110
    # pixel_size = 150

    url = f'https://thumbnails.roblox.com/v1/assets?assetIds={item_id}&format=png&isCircular=false&size={pixel_size}x{pixel_size}'

    # headers = {
    #           "accept": "application/json, text/plain, */*",
    #           "accept-language": "en-US,en;q=0.9",
    #           "priority": "u=1, i",
    #           "sec-ch-ua": "\"Not:A-Brand\";v=\"99\", \"Google Chrome\";v=\"145\", \"Chromium\";v=\"145\"",
    #           "sec-ch-ua-mobile": "?0",
    #           "sec-ch-ua-platform": "\"macOS\"",
    #           "sec-fetch-dest": "empty",
    #           "sec-fetch-mode": "cors",
    #           "sec-fetch-site": "same-site"
    #       }
    headers = {
        "User-Agent": USER_AGENT,
        "Accept": "application/json",
        "Referer": "https://www.roblox.com",
    }
    cookies = {
        ".ROBLOSECURITY": roblosecurity
    }

    response = requests.get(url, headers=headers, cookies=cookies)
    if response.status_code == 200:
        try:
            data = response.json()
            img_url = data.get('data')[0].get('imageUrl')
            return img_url
        except json.JSONDecodeError:
            print("Error decoding JSON.")
            return None
    else:
        return img_url

def getItemPrice(item_id, roblosecurity): # returns price, item_name, collectableID
    data = get_roblox_item_details(item_id, roblosecurity)
    # print(data)

    if data:
        if isinstance(data, dict):
            item = data
        else:
            print("Unexpected response format.")
            return data

        limited = 'LimitedUnique' in item.get('itemRestrictions') or 'Limited' in item.get('itemRestrictions')
        if limited:
            return item.get('lowestResalePrice')#, item.get('name')#, item.get('collectibleItemId')
        else:
            return item.get('price')

    else:
        # print(type(data))
        print("No item data returned.")
        return data

def load_roblosecurity(path="cookie.txt") -> str:
    with open(path, "r", encoding="utf-8") as f:
        raw = f.read().strip()

    # Handle full line or just the token
    if "_|WARNING:" in raw and "=" not in raw:
        return raw
    m = re.search(r"(?:\.?ROBLOSECURITY)\s*=\s*(_\|.+)", raw)
    if m:
        return m.group(1)

def searchCatalog(keyword, roblosecurity):
    search_result = '' # placeholder for search_result; won't be a string, but if it is we know it went wrong
    url = ''
    # salesFilter = 2 # means it will only be limited items
    salesFilter = 1 # means it will be anything

    keyword = keyword.strip()
    if keyword == '':
        url =  f"https://catalog.roblox.com/v2/search/items/details?taxonomy=wNYJso48d1XnhMyFWT3oX3&creatorName=Roblox&salesTypeFilter={salesFilter}&sortType=5&includeNotForSale=true&limit=120"
    else:
        keyword = keyword.replace(" ", "+")
        url = f"https://catalog.roblox.com/v2/search/items/details?keyword={keyword}&taxonomy=wNYJso48d1XnhMyFWT3oX3&creatorName=Roblox&salesTypeFilter={salesFilter}&sortType=5&includeNotForSale=true&limit=120"
    headers = {
        "User-Agent": USER_AGENT,
        "Accept": "application/json",
        "Referer": "https://www.roblox.com",
    }
    cookies = {
        ".ROBLOSECURITY": roblosecurity
    }

    response = requests.get(url, headers=headers, cookies=cookies)
    print(url)

    if response.status_code == 200:
        try:
            manyItemsMess = response.json().get('data')
            data = [{"id": item.get('id'), 'name': item.get('name')} for item in manyItemsMess]

            return data
        except json.JSONDecodeError:
            print("Error decoding JSON.")
            return None
    else:
        return search_result


def printItemInfo(item_id):
    data = get_roblox_item_details(item_id)
    if data:
        if isinstance(data, list) and len(data) > 0:
            item = data[0]
        elif isinstance(data, dict):
            item = data
        else:
            print("Unexpected response format.")
            return

        # print(item)
        print(f"Name: {item.get('name')}")
        print(f"Description: {item.get('description')}")
        print(f"Lowest Resale Price: {item.get('lowestResalePrice')} Robux")
        print(f'https://www.roblox.com/catalog/{item_id}')

        # print(f"Available Units: {item.get('unitsAvailableForConsumption')}")
        # print(f"Total Quantity: {item.get('totalQuantity')}")
        # print(f"Original Price: {item.get('price')} Robux")
        # print(f"Offsale: {item.get('isOffSale')}")
    else:
        print("No item data returned.")


def purchaseEnabledMessage(userID, balance):
    print(f'{100 * "-"}')
    print(f'{10 * " WARNING "}')
    print(f'{100 * "-"}')
    print(f'WARNING: YOU HAVE PURCHASES ENABLED. ANY ITEM IN YOUR ({userID}) ITEM BAG, UNDER YOUR BALANCE ({balance}) WILL BE PURCHASED!!!')
    print(f'{100 * "-"}')
    print(f'{10 * " WARNING "}')
    print(f'{100 * "-"}')

    purchaseContinue = input('ARE YOU SURE YOU WANT TO CONTINUE? (type \'yes\' if you want to continue...)')
    if purchaseContinue != "yes":
        exit()

def purchaseItem(itemID, roblosecurity, collectibleID, price, userID):
    print(f'trying to purchase {itemID} with collectID: {collectibleID}')
    #purchase it
    # some api to purchase item goes here...
    cookies = {
        ".ROBLOSECURITY": roblosecurity
    }

    r = requests.post('https://auth.roblox.com/v1/logout', cookies=cookies)
    csrf = r.headers.get('X-Csrf-Token')
    print(csrf)

    url = f'https://apis.roblox.com/marketplace-sales/v1/item/{collectibleID}/purchase-item'

    headers = {
        "User-Agent": USER_AGENT,
        "Accept": "application/json",
        "Referer": "https://www.roblox.com",
        "Content-Type": "application/json",
        "Origin": "https://www.roblox.com",
        "X-Csrf-Token": csrf,
    }
    payload = {
        "collectibleItemId": str(collectibleID),
        # "collectibleProductId": {},
        "expectedCurrency": 1,
        "expectedPrice": price,
        "expectedPurchaserId": str(userID),
        "expectedPurchaserType": "User",
        "expectedSellerId": 1,
        "expectedSellerType": "User",
        # "idempotencyKey": {},
    }

    response = requests.post(url, headers=headers, cookies=cookies, json=payload)
    if response.status_code == 200:
        try:
            data = response.json()
            return data
        except json.JSONDecodeError:
            print("Error decoding JSON.")
            return None
    else:
        print(f"Failed to fetch item data: {response.status_code}")
        print(response.text)
        return response
        # return None