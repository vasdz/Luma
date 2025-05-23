import React from 'react';

interface Room {
    room_id: string;
    name?: string;
}

interface Props {
    onSelectChat: (id: string) => void;
}

const ChatList: React.FC<Props> = ({ onSelectChat }) => {
    const [rooms, setRooms] = React.useState<Room[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const token = localStorage.getItem('matrix_token');

    React.useEffect(() => {
        if (!token) return;
        setLoading(true);
        fetch(`/api/rooms?access_token=${token}`)
            .then(res => {
                if (!res.ok) throw new Error('Ошибка загрузки комнат');
                return res.json();
            })
            .then(data => {
                // Предполагается, что сервер возвращает { rooms: Room[] }
                setRooms(data.rooms || []);
                setError(null);
            })
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, [token]);

    if (loading) return <div className="w-1/4 p-4">Загрузка комнат...</div>;
    if (error) return <div className="w-1/4 p-4 text-red-600">{error}</div>;
    if (rooms.length === 0) return <div className="w-1/4 p-4">Нет комнат</div>;

    return (
        <div className="w-1/4 bg-gray-200 p-4">
            {rooms.map(room => (
                <div
                    key={room.room_id}
                    onClick={() => onSelectChat(room.room_id)}
                    className="cursor-pointer p-2 hover:bg-gray-300"
                >
                    {room.name || room.room_id}
                </div>
            ))}
        </div>
    );
};

export default ChatList;

