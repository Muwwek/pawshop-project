from app.db import db


def seed() -> None:
    # Seed Settings if empty
    if db.settings.count_documents({}) == 0:
        db.settings.insert_one({
            "shop_name": "PawShop @ Project-DB",
            "interest_rate": 2.5,
            "max_duration": 120,
            "min_amount": 100,
            "max_amount": 50000,
            "address": "123/45 Bangkok, Thailand",
            "phone": "081-234-5678"
        })
        print("Done: Seeded settings collection")

    if db.users.count_documents({}) == 0:
        print("Warning: No users found. Please register via the UI.")
    
    # Ensure logs collection exists
    if "logs" not in db.list_collection_names():
        db.create_collection("logs")
        print("Done: Created logs collection")

if __name__ == "__main__":
    seed()
