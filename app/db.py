import os

from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.database import Database

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
DB_NAME = os.getenv("DB_NAME", "pawshop")

client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
db: Database = client[DB_NAME]


def ping_database() -> bool:
	client.admin.command("ping")
	return True
