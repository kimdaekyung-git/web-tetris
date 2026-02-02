from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routes import score

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Classic Tetris API",
    description="Score API for Classic Tetris game",
    version="1.0.0",
)

# CORS settings
origins = [
    "http://localhost:5173",  # Vite dev server
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(score.router, prefix="/api/v1")


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "classic-tetris-api"}


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Classic Tetris API",
        "docs": "/docs",
        "health": "/health",
    }
