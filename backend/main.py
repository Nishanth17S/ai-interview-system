from fastapi import FastAPI
from routes.test import router as test_router
from database.connection import engine, Base
from models.user import User
from models.test_connection import test_connection
from routes.user import router as user_router

app = FastAPI()

# Include routes
app.include_router(test_router)
app.include_router(user_router)

@app.get("/")
def home():
    return {"message": "AI Interview Backend Running"}

# Run on startup
@app.on_event("startup")
def startup_event():
    test_connection()
    Base.metadata.create_all(bind=engine)
    print("✅ Tables created successfully!")