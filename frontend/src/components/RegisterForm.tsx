import React, { useState } from 'react';

interface Props {
    onRegisterSuccess: (tok: string) => void;
}

const RegisterForm: React.FC<Props> = ({ onRegisterSuccess }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username,
                    password,
                    auth: { type: "m.login.dummy" }, // для Synapse без капчи и email
                }),
            });

            if (!res.ok) {
                const errJson = await res.json().catch(() => null);
                if (errJson?.error) {
                    throw new Error(errJson.error);
                }
                const errText = await res.text();
                throw new Error(errText || "Ошибка при регистрации");
            }

            const json = await res.json();
            console.log("Регистрация успешна:", json);
            const { access_token } = json;
            onRegisterSuccess(access_token);
        } catch (e: any) {
            console.error("Ошибка:", e);
            setError(e.message);
        }
    };


    return (
        <form onSubmit={handleSubmit} className="p-4 bg-white rounded shadow space-y-2">
            <input
                className="border p-2 w-full"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Имя пользователя"
                required
            />
            <input
                className="border p-2 w-full"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Пароль"
                required
            />
            {error && <div className="text-red-600">{error}</div>}
            <button type="submit" className="bg-blue-500 text-white p-2 rounded">
                Зарегистрироваться
            </button>
        </form>
    );
};

export default RegisterForm;
