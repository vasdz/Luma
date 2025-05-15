import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface RegisterFormProps {
    onRegisterSuccess: (token: string) => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onRegisterSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleRegister = async () => {
        try {
            const response = await invoke('matrix_register', { username, password });
            if (response && typeof response === 'object' && 'access_token' in response) {
                onRegisterSuccess(response.access_token);
            }
        } catch (err) {
            setError('Регистрация не выполнена. Возможно, пользователь уже существует.');
        }
    };

    return (
        <div className="flex flex-col items-center p-6 bg-white rounded shadow max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4">Регистрация</h2>
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
                className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
                onClick={handleRegister}
            >
                Зарегистрироваться
            </button>
        </div>
    );
};