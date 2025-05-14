import React, { useState } from 'react';

interface MessageInputProps {
    chatId: string;
}

const MessageInput: React.FC<MessageInputProps> = ({ chatId }) => {
    const [message, setMessage] = useState('');

    const sendMessage = () => {
        console.log('Sending message:', message);
        setMessage('');
    };

    return (
        <div className="p-4 bg-gray-100">
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Type a message..."
            />
            <button
                onClick={sendMessage}
                className="mt-2 w-full bg-blue-500 text-white p-2 rounded"
            >
                Send
            </button>
        </div>
    );
};

export default MessageInput;
