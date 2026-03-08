from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes import user
from routes import interview

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(user.router, prefix="/users", tags=["Users"])
app.include_router(interview.router, prefix="/interview", tags=["Interview"])


@app.get("/")
def root():
    return {"message": "AI Interview System API running"}