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

    const handleAuthSuccess = (newTok: string, userId: string) => {
        localStorage.setItem('matrix_token', newTok);
        localStorage.setItem('matrix_user', userId);
        setToken(newTok);
    };

    const handleLogout = () => {
        localStorage.removeItem('matrix_token');
        localStorage.removeItem('matrix_user');
        setToken(null);
        setActiveChat(null);
    };

    if (!token) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
                {isRegisterMode
                    ? <RegisterForm onRegisterSuccess={(tok) => handleAuthSuccess(tok, /* получите userId */ '')}/>
                    : <LoginForm onAuthSuccess={(tok) => handleAuthSuccess(tok, /* получите userId */ '')}/>}
                <button onClick={() => setIsRegisterMode(!isRegisterMode)} className="mt-4">
                    {isRegisterMode ? 'Войти' : 'Зарегистрироваться'}
                </button>
            </div>
        );
    }

    return (
        <div className="flex h-screen">
            <div className="w-1/4 bg-gray-200 flex flex-col">
                <button
                    onClick={handleLogout}
                    className="p-2 text-red-600 hover:bg-red-100"
                >
                    Выйти
                </button>
                <ChatList onSelectChat={setActiveChat} activeChat={activeChat}/>
            </div>
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

