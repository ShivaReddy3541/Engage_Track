from fastapi import APIRouter, Depends, HTTPException, Body
from pydantic import BaseModel
import os
import google.generativeai as genai
from dependencies import get_current_user
from shared.models import User

router = APIRouter(
    prefix="/chat",
    tags=["Chatbot"]
)

# Configure Gemini
api_key = os.environ.get("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

class ChatRequest(BaseModel):
    message: str

@router.post("")
def chat_with_bot(req: ChatRequest):
    """Handles chat messages with restricted context."""
    if not api_key:
        raise HTTPException(status_code=500, detail="Gemini API Key is not configured.")
        
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        system_prompt = (
            "You are a helpful assistant for the EngageAI project, an academic LMS portal. "
            "Your main role is to answer questions about the EngageAI workflow, features, and usage. "
            "CRITICAL RULES:\n"
            "1. Do NOT under any circumstances ask for, handle, or store login credentials, passwords, or personal security data.\n"
            "2. If asked ANY question not related to the project workflow or features, politely decline to answer by saying EXACTLY: 'Please ask questions only related to the application.'\n"
            "3. When answering questions about how to find features (for example: 'where are online meetings?'), provide a clear, step-by-step navigation guide until the user can easily identify it (e.g., 'Go to the Student Portal -> Click on Online Meets')."
        )
        
        full_prompt = f"{system_prompt}\n\nUser: {req.message}\nAssistant:"
        
        response = model.generate_content(full_prompt)
        
        return {"response": response.text}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
