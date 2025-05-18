import React, { useState } from 'react';

interface Props { onAuthSuccess: (tok: string) => void; }

const LoginForm: React.FC<Props> = ({ onAuthSuccess }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            const res = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            if (!res.ok) {
                const err = await res.text();
                throw new Error(err || 'Ошибка при входе');
            }

            const { access_token } = await res.json();
            onAuthSuccess(access_token);
        } catch (e: any) {
            setError(e.message);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-white rounded shadow">
            <input
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Username"
                required
            />
            <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                required
            />
            {error && <div className="text-red-600">{error}</div>}
            <button type="submit">Войти</button>
        </form>
    );
};

export default LoginForm;
