import { useState } from 'react';

function ChatInput({ onSendMessage, isLoading }) {
    const [input, setInput] = useState('');

    const handleSend = () => {
        if (!input.trim() || isLoading) return;
        onSendMessage(input);
        setInput('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="input-area">
            <div className="input-container">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="輸入訊息..."
                    rows={1}
                />
                <button className="send-btn" onClick={handleSend} disabled={isLoading || !input.trim()}>
                    ➤
                </button>
            </div>
        </div>
    );
}

export default ChatInput;
