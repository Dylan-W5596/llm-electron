import { useState, useEffect, useRef } from 'react';
import { api } from './api';
import Sidebar from './components/Sidebar';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef(null);

  // 初始化
  useEffect(() => {
    const init = async () => {
      try {
        const [gs, ss] = await Promise.all([api.getGroups(), api.getSessions()]);
        setGroups(gs);
        setSessions(ss);

        if (ss.length === 0) {
          await handleNewChat();
        } else {
          handleLoadSession(ss[0].id);
        }
      } catch (e) {
        console.warn("初始化失敗 (後端可能未啟動)", e.message);
      }
    };
    init();
  }, []);

  // 捲動到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchData = async () => {
    try {
      const [gs, ss] = await Promise.all([api.getGroups(), api.getSessions()]);
      setGroups(gs);
      setSessions(ss);
    } catch (e) {
      console.error("更新數據失敗", e);
    }
  };

  const handleNewChat = async (groupId = null) => {
    try {
      const data = await api.createSession('New Chat', groupId);
      setSessionId(data.id);
      setMessages([]);
      await fetchData();
    } catch (e) {
      console.error("建立會話失敗", e);
    }
  };

  const handleLoadSession = async (id) => {
    try {
      setSessionId(id);
      const data = await api.getMessages(id);
      setMessages(data);
    } catch (e) {
      console.error("載入失敗", e);
    }
  };

  const handleDeleteSession = async (id) => {
    if (!window.confirm('確定要刪除此對話紀錄嗎？')) return;
    try {
      await api.deleteSession(id);

      // 更新列表
      const [gs, ss] = await Promise.all([api.getGroups(), api.getSessions()]);
      setGroups(gs);
      setSessions(ss);

      if (sessionId === id) {
        if (ss.length > 0) {
          // 如果還有其他會話，切換到第一個
          handleLoadSession(ss[0].id);
        } else {
          // 如果沒了，建立新的
          setMessages([]);
          handleNewChat();
        }
      }
    } catch (e) {
      console.error("刪除失敗", e);
    }
  };

  const handleRenameSession = async (id, newTitle) => {
    const targetTitle = newTitle.trim();
    if (!targetTitle || targetTitle === sessions.find(s => s.id === id)?.title) return;
    try {
      await api.updateSession(id, targetTitle);
      fetchData();
    } catch (e) {
      console.error("更名失敗", e);
    }
  };

  const handleNewGroup = async () => {
    try {
      await api.createGroup('新群組');
      fetchData();
    } catch (e) {
      console.error("建立群組失敗", e);
    }
  };

  const handleRenameGroup = async (id, newName) => {
    try {
      await api.updateGroup(id, { name: newName });
      fetchData();
    } catch (e) {
      console.error("更名群組失敗", e);
    }
  };

  const handleDeleteGroup = async (id) => {
    if (!window.confirm('確定要刪除此群組嗎？(會話會轉為未分類)')) return;
    try {
      await api.deleteGroup(id);
      fetchData();
    } catch (e) {
      console.error("刪除群組失敗", e);
    }
  };

  const handleMoveSession = async (sessionId, targetGroupId, targetSessionId, position) => {
    // 簡單排序策略：
    // 如果是移到群組頭，order = 0
    // 如果是移到某 Session 旁邊，計算該 Session 的 order 並 +/- 1
    // 注意：後端目前沒做連鎖排序，所以這裡暫時先以「移入該組且排在最前面」為簡化邏輯，或是依據 targetSession 決定
    let newOrder = 0;
    if (targetSessionId) {
      const target = sessions.find(s => s.id === targetSessionId);
      newOrder = position === 'top' ? target.order : target.order + 1;
    }

    try {
      await api.moveSession(sessionId, targetGroupId, newOrder);
      fetchData();
    } catch (e) {
      console.error("移動失敗", e);
    }
  };

  const handleSendMessage = async (content) => {
    const userMsg = { role: 'user', content };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const data = await api.sendMessage(sessionId, content);
      setMessages(prev => [...prev, data]);
    } catch (e) {
      console.error("發送失敗", e);
      setMessages(prev => [...prev, { role: 'assistant', content: "錯誤: 伺服器無回應。" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Sidebar
        groups={groups}
        sessions={sessions}
        sessionId={sessionId}
        sidebarOpen={sidebarOpen}
        onNewChat={handleNewChat}
        onLoadSession={handleLoadSession}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        onNewGroup={handleNewGroup}
        onRenameGroup={handleRenameGroup}
        onDeleteGroup={handleDeleteGroup}
        onMoveSession={handleMoveSession}
      />

      <div className="main-chat">
        <div className="messages-container">
          {messages.length === 0 && (
            <div className="empty-state">
              <h2>Llama 3.2 1B (本地端)</h2>
              <p>Powered by Electron + FastAPI + CUDA</p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <ChatMessage key={idx} msg={msg} />
          ))}

          {isLoading && (
            <div className="message assistant">
              <div className="avatar">🤖</div>
              <div className="message-content">...</div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
}

export default App;
