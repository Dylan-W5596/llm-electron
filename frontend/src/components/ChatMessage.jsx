import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import replyIcon from '../assets/icons/IM742003_reply_24dp.png'
import copyIcon from '../assets/icons/IM742002_copy_all_24dp.png'
import assistantAvatar from '../assets/icons/IM742001_account_circle_24dp.png'

function ChatMessage({ msg, onCopy, onReply, t }) {
    return (
        <div className={`message ${msg.role}`}>
            <div className="avatar">
                {msg.role === 'assistant' ? (
                    <img src={assistantAvatar} alt="AI" className="avatar-img" />
                ) : '👤'}
            </div>
            <div className="message-body">
                <div className="message-content">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                    </ReactMarkdown>
                </div>
                {msg.role === 'assistant' && (
                    <div className="message-actions">
                        <button className="action-btn" onClick={() => onReply(msg.content)} title="回覆">
                            <img src={replyIcon} alt="Reply" />
                        </button>
                        <button className="action-btn" onClick={() => onCopy(msg.content)} title="複製">
                            <img src={copyIcon} alt="Copy" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ChatMessage;
