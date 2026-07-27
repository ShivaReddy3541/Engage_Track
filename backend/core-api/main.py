import sys, os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, admin, classroom, academic, assignments, chat, export, notifications, wall

app = FastAPI(title="EngageAI Core API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(classroom.router, prefix="/api")
app.include_router(academic.router, prefix="/api/academic")
app.include_router(assignments.router, prefix="/api")
app.include_router(export.router, prefix="/api")
app.include_router(notifications.router, prefix="/api")
app.include_router(wall.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
from routers import meet_ws
app.include_router(meet_ws.router, prefix="/api/meet")

@app.get("/")
def root():
    return {"message": "Welcome to EngageAI Core API"}
