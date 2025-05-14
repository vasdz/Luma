import React, { useEffect, useState } from 'react';

interface ChatWindowProps {
    chatId: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ chatId }) => {
    const [messages, setMessages] = useState<string[]>([]);

    useEffect(() => {
        // Имитация получения сообщений
        const fakeMessages = [
            'Hello, how are you?',
            'I am fine, thanks!',
        ];
        setMessages(fakeMessages);
    }, [chatId]);

    return (
        <div className="flex-1 bg-white p-4 overflow-y-auto">
            <div className="flex flex-col">
                {messages.map((message, idx) => (
                    <div key={idx} className="p-2 border-b">
                        {message}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ChatWindow;
