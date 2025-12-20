from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

class Database:
    client: AsyncIOMotorClient = None

    def connect(self):
        """Establish connection to MongoDB."""
        self.client = AsyncIOMotorClient(settings.MONGO_URI)
        print(f"✅ Connected to MongoDB at {settings.MONGO_URI.split('@')[-1]}") # Log safe part of URI

    def close(self):
        """Close connection."""
        if self.client:
            self.client.close()
            print("🛑 Disconnected from MongoDB")

    def get_db(self):
        """Get the database instance."""
        return self.client[settings.DB_NAME]

db = Database()