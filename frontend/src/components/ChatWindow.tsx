import React, { useRef, useEffect } from 'react';

interface Msg { sender: string; body: string; }
interface Props { chatId: string; }

const ChatWindow: React.FC<Props> = ({ chatId }) => {
    const [messages, setMessages] = React.useState<Msg[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const token = localStorage.getItem('matrix_token');
    const windowRef = useRef<HTMLDivElement>(null);
    const myUser = localStorage.getItem('matrix_user'); // локальный сохранённый user ID

    const loadMessages = React.useCallback(async () => {
        if (!token) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(
                `/api/rooms/${chatId}/messages?access_token=${token}`
            );
            if (!res.ok) throw new Error(`Status ${res.status}`);
            const data = await res.json();
            const chunk = data.messages || data.chunk || [];
            const parsed = chunk.map((ev: any) => ({
                sender: ev.sender,
                body: ev.content?.body || ''
            }));
            setMessages(parsed);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [chatId, token]);

    // initial load & polling
    useEffect(() => {
        loadMessages();
        const interval = setInterval(loadMessages, 3000);
        return () => clearInterval(interval);
    }, [loadMessages]);

    // auto-scroll to bottom
    useEffect(() => {
        if (windowRef.current) {
            windowRef.current.scrollTop = windowRef.current.scrollHeight;
        }
    }, [messages]);

    if (loading) return <div className="flex-1 p-4">Загрузка сообщений...</div>;
    if (error) return <div className="flex-1 p-4 text-red-600">{error}</div>;

    return (
        <div ref={windowRef} className="flex-1 p-4 overflow-auto bg-gray-50">
            {messages.map((m, i) => {
                const isMine = myUser && m.sender === myUser;
                const name = m.sender.split(':')[0].substring(1);
                return (
                    <div
                        key={i}
                        className={`mb-2 flex ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-xs p-2 rounded-lg break-words
                ${isMine ? 'bg-blue-500 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none'}`}
                        >
                            {!isMine && <div className="text-sm font-semibold mb-1">{name}</div>}
                            <div>{m.body}</div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ChatWindow;

