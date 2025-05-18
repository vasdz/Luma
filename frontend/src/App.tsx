import React, { useState } from 'react';
import ChatList from './components/ChatList';
import ChatWindow from './components/ChatWindow';
import MessageInput from './components/MessageInput';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';

const App = () => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('matrix_token'));
    const [activeChat, setActiveChat] = useState<string | null>(null);
    const [isRegisterMode, setIsRegisterMode] = useState(false);

    const handleAuthSuccess = (newTok: string) => {
        localStorage.setItem('matrix_token', newTok);
        setToken(newTok);
    };

    if (!token) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
                {isRegisterMode ? <RegisterForm onRegisterSuccess={handleAuthSuccess}/> : <LoginForm onAuthSuccess={handleAuthSuccess}/>}
                <button onClick={() => setIsRegisterMode(!isRegisterMode)} className="mt-4">
                    {isRegisterMode ? 'Войти' : 'Зарегистрироваться'}
                </button>
            </div>
        );
    }

    return (
        <div className="flex h-screen">
            <ChatList onSelectChat={setActiveChat} />
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