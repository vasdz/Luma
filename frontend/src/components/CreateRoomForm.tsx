import React, { useState } from 'react';

interface Props {
    onRoomCreated: (roomId: string) => void;
}

const CreateRoomForm: React.FC<Props> = ({ onRoomCreated }) => {
    const [name, setName] = useState('');
    const [preset, setPreset] = useState('private_chat');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const token = localStorage.getItem('matrix_token');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token || !name.trim()) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/createRoom?access_token=${token}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, preset }),
            });
            if (!res.ok) {
                const text = await res.text().catch(() => null);
                throw new Error(text || 'Ошибка создания комнаты');
            }
            const { room_id } = await res.json();
            onRoomCreated(room_id);
            setName('');
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-2 mb-4 bg-white rounded shadow space-y-2">
            <input
                className="border p-2 w-full"
                placeholder="Название комнаты"
                value={name}
                onChange={e => setName(e.target.value)}
                disabled={loading}
                required
            />
            <select
                className="border p-2 w-full"
                value={preset}
                onChange={e => setPreset(e.target.value)}
                disabled={loading}
            >
                <option value="private_chat">Приватная</option>
                <option value="public_chat">Публичная</option>
            </select>
            <button
                type="submit"
                className="bg-green-500 text-white p-2 rounded"
                disabled={loading}
            >
                {loading ? 'Создание...' : 'Создать комнату'}
            </button>
            {error && <div className="text-red-600">{error}</div>}
        </form>
    );
};

export default CreateRoomForm;