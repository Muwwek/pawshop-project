from app.db import db

def check_users():
    print("Checking users and their customer_id types...")
    for user in db.users.find().limit(10):
        cid = user.get("customer_id")
        print(f"User: {user.get('username')}, Role: {user.get('role')}, customer_id: {cid} (Type: {type(cid)})")

if __name__ == "__main__":
    check_users()
