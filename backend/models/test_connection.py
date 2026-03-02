from database.connection import engine

def test_connection():
    try:
        connection = engine.connect()
        print("✅ Database connected successfully!")
        connection.close()
    except Exception as e:
        print("❌ Connection failed:", e)