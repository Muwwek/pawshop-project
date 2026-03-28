from app.db import db
from bson import ObjectId

def simulate_update():
    customer_id = "69a67a3173336aad8bcdccea"
    data = {
        "name": "สมชาย ใจดี", 
        "idCard": "1234567890123", 
        "phone": "0899999999", 
        "email": "customer@gmail.com", 
        "address": "ชลบุรี บ้านบึง"
    }
    
    print(f"Simulating update for ID {customer_id}...")
    existing = db.customers.find_one({"_id": ObjectId(customer_id)})
    if not existing:
        print("Customer not found!")
        return

    full_name = data.get("name", "")
    if " " in full_name:
        first_name, last_name = full_name.split(" ", 1)
    else:
        first_name = full_name
        last_name = ""

    update_fields = {
        "first_name": first_name,
        "last_name": last_name,
        "email": data.get("email"),
        "phone": data.get("phone"),
        "id_card": data.get("idCard"),
        "address": data.get("address"),
    }
    
    result = db.customers.update_one({"_id": ObjectId(customer_id)}, {"$set": update_fields})
    print(f"Match count: {result.matched_count}")
    print(f"Modified count: {result.modified_count}")
    
    updated = db.customers.find_one({"_id": ObjectId(customer_id)})
    print(f"Updated address: '{updated.get('address')}'")

if __name__ == "__main__":
    simulate_update()
