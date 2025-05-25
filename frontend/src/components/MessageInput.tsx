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
        setError(null);
        try {
            console.log('Отправка сообщения в комнату', chatId, 'с токеном', token);
            const res = await fetch(
                `/api/rooms/${chatId}/send?access_token=${token}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        msgtype: 'm.text',
                        body: text,
                    }),
                }
            );
            if (!res.ok) {
                const errText = await res.text().catch(() => null);
                throw new Error(errText || `Ошибка отправки: ${res.status}`);
            }
            setText('');
        } catch (e: any) {
            console.error('Ошибка при отправке сообщения:', e);
            setError(e.message);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="p-4 flex bg-white">
            <input
                className="flex-1 border p-2 mr-2 rounded"
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
            <button
                onClick={send}
                disabled={sending || !text.trim()}
                className="bg-blue-500 text-white p-2 rounded"
            >
                {sending ? 'Отправка...' : 'Отправить'}
            </button>
            {error && <div className="text-red-600 ml-4">{error}</div>}
        </div>
    );
};

export default MessageInput;