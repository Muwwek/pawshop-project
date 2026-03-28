from app.db import db, ping_database

EXPECTED_COLLECTIONS = {"contracts", "items", "logs", "users", "customers", "payments", "settings"}


def main() -> int:
    try:
        ping_database()
    except Exception as exc:
        print(f"❌ MongoDB connection failed: {exc}")
        return 2

    existing_collections = set(db.list_collection_names())
    missing_collections = sorted(EXPECTED_COLLECTIONS - existing_collections)
    found_collections = sorted(EXPECTED_COLLECTIONS & existing_collections)

    print(f"DB: {db.name}")
    print(f"Expected: {sorted(EXPECTED_COLLECTIONS)}")
    print(f"Found: {found_collections}")

    if missing_collections:
        print(f"Error: Missing collections: {missing_collections}")
        return 1

    print("Success: All required collections exist")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
