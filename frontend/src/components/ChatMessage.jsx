import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

function ChatMessage({ msg }) {
    return (
        <div className={`message ${msg.role}`}>
            <div className="avatar">
                {msg.role === 'assistant' ? '🤖' : '👤'}
            </div>
            <div className="message-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                </ReactMarkdown>
            </div>
        </div>
    );
}

export default ChatMessage;
