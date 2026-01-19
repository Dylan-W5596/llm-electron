import { useState, useEffect, useRef } from 'react'

const BACKEND_URL = 'http://127.0.0.1:8000';

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef(null);

  // 初始化 Session
  useEffect(() => {
    fetchSessions();
    createNewSession();
  }, []);

  // 捲動到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchSessions = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/sessions`);
      const data = await res.json();
      setSessions(data);
    } catch (e) {
      console.error("無法取得 Session", e);
    }
  }

  const createNewSession = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Chat' })
      });
      const data = await res.json();
      setSessionId(data.id);
      setMessages([]);
      fetchSessions();
    } catch (e) {
      console.error("建立 Session 失敗", e);
    }
  }

  const loadSession = async (id) => {
    try {
      setSessionId(id);
      const res = await fetch(`${BACKEND_URL}/sessions/${id}/messages`);
      const data = await res.json();
      setMessages(data);
    } catch (e) {
      console.error("載入 Session 失敗", e);
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          content: userMsg.content
        })
      });

      const data = await res.json();
      setMessages(prev => [...prev, data]);
    } catch (e) {
      console.error("聊天錯誤", e);
      setMessages(prev => [...prev, { role: 'assistant', content: "錯誤: 無法連線至 AI 後端。" }]);
    } finally {
      setIsLoading(false);
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="app-container">
      {/* 側邊欄 */}
      <div className="sidebar" style={{ width: sidebarOpen ? '260px' : '0', padding: sidebarOpen ? '1rem' : '0' }}>
        <button className="new-chat-btn" onClick={createNewSession}>
          <span>+</span> 新對話
        </button>
        <div className="history-list">
          {sessions.map(s => (
            <div
              key={s.id}
              className={`history-item ${sessionId === s.id ? 'active' : ''}`}
              onClick={() => loadSession(s.id)}
            >
              {s.title}
            </div>
          ))}
        </div>
      </div>

      {/* 主聊天區 */}
      <div className="main-chat">
        {/* 切換側邊欄按鈕 (選用，若需要可顯示) */}

        <div className="messages-container">
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', marginTop: '100px', color: 'var(--text-secondary)' }}>
              <h2>Llama 3.2 1B (本地端)</h2>
              <p>Powered by Electron + FastAPI + CUDA</p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.role}`}>
              <div className="avatar">
                {msg.role === 'assistant' ? '🤖' : '👤'}
              </div>
              <div className="message-content">
                {msg.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="message assistant">
              <div className="avatar">🤖</div>
              <div className="message-content">...</div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-area">
          <div className="input-container">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="輸入訊息..."
              rows={1}
            />
            <button className="send-btn" onClick={sendMessage} disabled={isLoading}>
              ➤
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
