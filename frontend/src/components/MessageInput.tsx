import React, { useState } from 'react';
interface Props { chatId: string; }

const MessageInput: React.FC<Props> = ({ chatId }) => {
    const [text, setText] = useState("");
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const token = localStorage.getItem('matrix_token');

    const send = async () => {
        if (!token || !text.trim()) return;
        setSending(true);
        try {
            const res = await fetch(`/api/rooms/${chatId}/send`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: text }),
            });
            if (!res.ok) throw new Error(await res.text());
            setText("");
            setError(null);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="p-4 flex">
            <input
                className="flex-1"
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Сообщение..."
                onKeyDown={e => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        send();
                    }
                }}
                disabled={sending}
            />
            <button onClick={send} disabled={sending || !text.trim()}>
                Отправить
            </button>
            {error && <div className="text-red-600 ml-4">{error}</div>}
        </div>
    );
};

export default MessageInput;