import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface LoginFormProps {
    onAuthSuccess: (token: string) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onAuthSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async () => {
        try {
            const response = await invoke('matrix_login', { username, password });
            if (response && typeof response === 'object' && 'access_token' in response) {
                onAuthSuccess(response.access_token);
            }
        } catch (err) {
            setError('Вход не выполнен. Проверьте логин и пароль.');
        }
    };

    return (
        <div className="flex flex-col items-center p-6 bg-white rounded shadow max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4">Вход</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <input
                className="w-full p-2 mb-2 border rounded"
                placeholder="Логин"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <input
                className="w-full p-2 mb-4 border rounded"
                placeholder="Пароль"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                onClick={handleLogin}
            >
                Войти
            </button>
        </div>
    );
};