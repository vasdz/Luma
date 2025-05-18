import React from 'react';

interface Msg { sender: string; body: string; }
interface Props { chatId: string; }

const ChatWindow: React.FC<Props> = ({ chatId }) => {
    const [messages, setMessages] = React.useState<Msg[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const token = localStorage.getItem('matrix_token');

    React.useEffect(() => {
        if (!token) return;
        setLoading(true);
        fetch(`/api/rooms/${chatId}/messages?access_token=${token}`)
            .then(res => {
                if (!res.ok) throw new Error('Ошибка загрузки сообщений');
                return res.json();
            })
            .then(data => {
                setMessages(data.messages);
                setError(null);
            })
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, [chatId, token]);

    if (loading) return <div className="flex-1 p-4">Загрузка сообщений...</div>;
    if (error)   return <div className="flex-1 p-4 text-red-600">{error}</div>;

    return (
        <div className="flex-1 p-4 overflow-auto">
            {messages.map((m, i) => (
                <div key={i}>
                    <strong>{m.sender}:</strong> {m.body}
                </div>
            ))}
        </div>
    );
};

export default ChatWindow;
