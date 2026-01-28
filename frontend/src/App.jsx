import { useState, useEffect, useRef } from 'react';
import { api } from './api';
import Sidebar from './components/Sidebar';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import Settings from './components/Settings';
import { playSound } from './utils/soundUtils';
import { languages } from './translations/languages';
import assistantAvatar from './assets/icons/IM742001_account_circle_24dp.png';

const { ipcRenderer } = (window.require && window.require('electron')) || { ipcRenderer: null };

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [view, setView] = useState('chat'); // 'chat' or 'settings'
  const [replyingTo, setReplyingTo] = useState(null);
  const abortControllerRef = useRef(null);
  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem('llama_config');
    return saved ? JSON.parse(saved) : {
      theme: 'dark',
      temperature: 0.7,
      maxTokens: 512,
      soundEnabled: true,
      language: 'zh',
    };
  });
  const messagesEndRef = useRef(null);

  // 持久化設定
  useEffect(() => {
    localStorage.setItem('llama_config', JSON.stringify(config));
    document.body.dataset.theme = config.theme;
  }, [config]);

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
    playSound('click', config.soundEnabled);
    try {
      const data = await api.createSession('New Chat', groupId);
      setSessionId(data.id);
      setMessages([]);
      await fetchData();
    } catch (e) {
      playSound('error', config.soundEnabled);
      console.error("建立會話失敗", e);
    }
  };

  const handleLoadSession = async (id) => {
    playSound('click', config.soundEnabled);
    try {
      setSessionId(id);
      const data = await api.getMessages(id);
      setMessages(data);
    } catch (e) {
      playSound('error', config.soundEnabled);
      console.error("載入失敗", e);
    }
  };

  const handleDeleteSession = async (id) => {
    if (!window.confirm('確定要刪除此對話紀錄嗎？')) return;
    playSound('click', config.soundEnabled);
    try {
      await api.deleteSession(id);
      playSound('success', config.soundEnabled);

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
      playSound('error', config.soundEnabled);
      console.error("刪除失敗", e);
    }
  };

  const handleRenameSession = async (id, newTitle) => {
    const targetTitle = newTitle.trim();
    if (!targetTitle || targetTitle === sessions.find(s => s.id === id)?.title) return;
    try {
      await api.updateSession(id, targetTitle);
      playSound('success', config.soundEnabled);
      fetchData();
    } catch (e) {
      playSound('error', config.soundEnabled);
      console.error("更名失敗", e);
    }
  };

  const handleNewGroup = async () => {
    playSound('click', config.soundEnabled);
    try {
      await api.createGroup('新群組');
      playSound('success', config.soundEnabled);
      fetchData();
    } catch (e) {
      playSound('error', config.soundEnabled);
      console.error("建立群組失敗", e);
    }
  };

  const handleRenameGroup = async (id, newName) => {
    try {
      await api.updateGroup(id, { name: newName });
      playSound('success', config.soundEnabled);
      fetchData();
    } catch (e) {
      playSound('error', config.soundEnabled);
      console.error("更名群組失敗", e);
    }
  };

  const handleDeleteGroup = async (id) => {
    if (!window.confirm('確定要刪除此群組嗎？(會話會轉為未分類)')) return;
    playSound('click', config.soundEnabled);
    try {
      await api.deleteGroup(id);
      playSound('success', config.soundEnabled);
      fetchData();
    } catch (e) {
      playSound('error', config.soundEnabled);
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
    let finalContent = content;
    if (replyingTo) {
      finalContent = `[回覆內容: ${replyingTo}]\n\n${content}`;
      setReplyingTo(null);
    }

    const userMsg = { role: 'user', content: finalContent };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    abortControllerRef.current = new AbortController();

    try {
      const data = await api.sendMessage(sessionId, content, abortControllerRef.current.signal);
      setMessages(prev => [...prev, data]);
    } catch (e) {
      if (e.name === 'AbortError') {
        console.log("生成已停止");
      } else {
        console.error("發送失敗", e);
        setMessages(prev => [...prev, { role: 'assistant', content: "錯誤: 伺服器無回應。" }]);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      // 將最後一則使用者訊息填回輸入框
      const userMessages = messages.filter(m => m.role === 'user');
      if (userMessages.length > 0) {
        setInput(userMessages[userMessages.length - 1].content);
      }
    }
  };

  const handleCopyMessage = (content) => {
    navigator.clipboard.writeText(content).then(() => {
      // 可以在這裡添加一個簡單的提示或音效
      playSound('success', config.soundEnabled);
    });
  };

  const handleReplyMessage = (content) => {
    setReplyingTo(content);
  };

  const t = languages[config.language] || languages.zh;

  const handleOpenMonitor = () => {
    if (ipcRenderer) {
      ipcRenderer.send('open-monitor');
    } else {
      alert("僅在 Electron 環境支援此功能");
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
        onLoadSession={(id) => { setView('chat'); handleLoadSession(id); }}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        onNewGroup={handleNewGroup}
        onRenameGroup={handleRenameGroup}
        onDeleteGroup={handleDeleteGroup}
        onMoveSession={handleMoveSession}
        onOpenSettings={() => { playSound('click', config.soundEnabled); setView('settings'); }}
        activeView={view}
        onPlayClick={(force = false) => playSound('click', force || config.soundEnabled)}
        t={t}
      />

      <div className="main-chat">
        {view === 'chat' ? (
          <>
            <div className="messages-container">
              {messages.length === 0 && (
                <div className="empty-state">
                  <h2>Llama 3.2 1B (本地端)</h2>
                  <p>Powered by Electron + FastAPI + CUDA</p>
                </div>
              )}

              {messages.map((msg, idx) => (
                <ChatMessage
                  key={idx}
                  msg={msg}
                  onCopy={handleCopyMessage}
                  onReply={handleReplyMessage}
                  t={t}
                />
              ))}

              {isLoading && (
                <div className="message assistant">
                  <div className="avatar">
                    <img src={assistantAvatar} alt="AI" className="avatar-img" />
                  </div>
                  <div className="message-content">...</div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <ChatInput
              input={input}
              setInput={setInput}
              replyingTo={replyingTo}
              onCancelReply={() => setReplyingTo(null)}
              onSendMessage={handleSendMessage}
              onStopGeneration={handleStopGeneration}
              isLoading={isLoading}
              t={t}
            />
          </>
        ) : (
          <Settings
            config={config}
            onUpdateConfig={setConfig}
            onBack={() => { playSound('click', config.soundEnabled); setView('chat'); }}
            onPlayClick={(force = false) => playSound('click', force || config.soundEnabled)}
            onOpenMonitor={() => { playSound('click', config.soundEnabled); handleOpenMonitor(); }}
            t={t}
          />
        )}
      </div>
    </div>
  );
}

export default App;
