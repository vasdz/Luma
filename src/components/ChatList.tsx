import React from 'react';

interface ChatListProps {
    onSelectChat: (chatId: string) => void;
}

const ChatList: React.FC<ChatListProps> = ({ onSelectChat }) => {
    const chats = [
        { id: 'chat1', name: 'Chat with Vasdz' },
        { id: 'chat2', name: 'Chat with Dasha' },
    ];

    return (
        <div className="w-1/4 bg-gray-200 p-4">
            <h2 className="font-bold text-lg">Chats</h2>
            <ul>
                {chats.map((chat) => (
                    <li
                        key={chat.id}
                        onClick={() => onSelectChat(chat.id)}
                        className="cursor-pointer p-2 hover:bg-gray-300"
                    >
                        {chat.name}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ChatList;
