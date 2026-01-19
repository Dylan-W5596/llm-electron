from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import os
import sys

# 將當前目錄加入路徑
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import init_db, get_db, ChatSession, Message
from model_engine import ModelEngine

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("啟動中... 如有需要將載入模型。")
    # 如果需要，我們可以在這裡預先載入模型，或是讓它在第一次請求時載入
    # model_engine.load_model()
    yield
    print("應用程式關閉中...")

app = FastAPI(title="Llama Electron API", lifespan=lifespan)

# 啟用 Electron 的 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 初始化資料庫
init_db()

# 初始化 AI 引擎 (延遲載入)
model_engine = ModelEngine()

# Pydantic 模型
class CreateSession(BaseModel):
    title: str = "New Chat"

class CreateMessage(BaseModel):
    session_id: int
    content: str
    role: str = "user"

class ChatResponse(BaseModel):
    role: str
    content: str 

@app.get("/status")
def get_status():
    return {
        "status": "running",
        "model_loaded": model_engine.is_loaded(),
        "device": "cuda" if model_engine.has_gpu else "cpu"
    }

@app.post("/sessions")
def create_session(session_data: CreateSession, db: Session = Depends(get_db)):
    new_session = ChatSession(title=session_data.title)
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    return new_session

@app.get("/sessions")
def list_sessions(db: Session = Depends(get_db)):
    return db.query(ChatSession).order_by(ChatSession.created_at.desc()).all()

@app.get("/sessions/{session_id}/messages")
def get_history(session_id: int, db: Session = Depends(get_db)):
    return db.query(Message).filter(Message.session_id == session_id).order_by(Message.timestamp.asc()).all()

@app.post("/chat")
def chat(message: CreateMessage, db: Session = Depends(get_db)):
    # 1. 儲存使用者訊息
    user_msg = Message(session_id=message.session_id, role="user", content=message.content)
    db.add(user_msg)
    db.commit()
    
    # 2. 生成回應
    # 取得上下文 (為求簡化，取最後 10 則訊息)
    history = db.query(Message).filter(Message.session_id == message.session_id).order_by(Message.timestamp.asc()).all()
    context = [{"role": m.role, "content": m.content} for m in history]
    
    response_text = model_engine.generate(context)
    
    # 3. 儲存助手訊息
    ai_msg = Message(session_id=message.session_id, role="assistant", content=response_text)
    db.add(ai_msg)
    db.commit()
    
    return {"role": "assistant", "content": response_text}

@app.post("/chat/stream")
def chat_stream():
    # 串流實作的預留位置 (需要 SSE)
    return {"error": "串流功能在此最小版本中尚未實作"}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
