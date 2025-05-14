import React, { useState } from 'react';
import ChatList from './components/ChatList';
import ChatWindow from './components/ChatWindow';
import MessageInput from './components/MessageInput';

const App = () => {
    const [activeChat, setActiveChat] = useState<string | null>(null);

    const handleSelectChat = (chatId: string) => {
        setActiveChat(chatId);
    };

    return (
        <div className="flex h-screen">
            <ChatList onSelectChat={handleSelectChat} />
            {activeChat && (
                <div className="flex-1 flex flex-col">
                    <ChatWindow chatId={activeChat} />
                    <MessageInput chatId={activeChat} />
                </div>
            )}
        </div>
    );
};

export default App;
