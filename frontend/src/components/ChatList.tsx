import React from 'react';
import CreateRoomForm from './CreateRoomForm';

interface Room {
    room_id: string;
    name?: string;
}

interface Props {
    onSelectChat: (id: string) => void;
    activeChat?: string;
}

const ChatList: React.FC<Props> = ({ onSelectChat, activeChat }) => {
    const [rooms, setRooms] = React.useState<Room[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const token = localStorage.getItem('matrix_token');

    const fetchRooms = React.useCallback(async () => {
        if (!token) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/sync?access_token=${token}`);
            if (!res.ok) throw new Error('Ошибка загрузки комнат');
            const data = await res.json();

            const joined = data.rooms?.join || {};
            const invited = data.rooms?.invite || {};

            const list: Room[] = [
                // Присоединенные
                ...Object.entries(joined).map(([roomId, roomData]: any) => ({
                    room_id: roomId,
                    name: roomData.state?.events?.find((ev: any) => ev.type === 'm.room.name')?.content?.name,
                })),
                // Приглашения
                ...Object.entries(invited).map(([roomId, roomData]: any) => ({
                    room_id: roomId,
                    name: `Приглашение: ${roomData.state?.events?.find((ev: any) => ev.type === 'm.room.name')?.content?.name || roomId}`,
                }))
            ].filter(room => room.name !== 'test');

            setRooms(list);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [token]);

    React.useEffect(() => {
        fetchRooms();
    }, [fetchRooms]);

    const handleRoomCreated = async (roomId: string) => {
        await new Promise(res => setTimeout(res, 500));
        await fetchRooms();
        onSelectChat(roomId);
    };

    const handleDeleteRoom = async (roomId: string) => {
        if (!token) return;
        try {
            await fetch(`/api/rooms/${encodeURIComponent(roomId)}/leave?access_token=${token}`, {
                method: 'POST',
            });
            await fetchRooms();
        } catch (e: any) {
            console.error('Ошибка при выходе из комнаты:', e);
        }
    };

    // В ChatList.tsx
    const handleInviteUser = async (roomId: string) => {
        const userId = prompt("Введите ID пользователя для приглашения:");
        if (!userId) return;

        try {
            await fetch(`/api/rooms/${roomId}/invite/${userId}?access_token=${token}`, {
                method: 'POST',
            });
            alert("Пользователь приглашен!");
        } catch (e) {
            console.error("Ошибка приглашения:", e);
        }
    };

    return (
        <div className="w-1/4 bg-gray-200 p-4 flex flex-col">
            <CreateRoomForm onRoomCreated={handleRoomCreated} />
            {loading && <div>Загрузка комнат...</div>}
            {error && <div className="text-red-600">{error}</div>}
            {!loading && rooms.length === 0 && <div>Нет комнат</div>}
            <div className="overflow-auto flex-1">
                {rooms.map(room => {
                    const label = room.name ? room.name : room.room_id.split(':')[0].substring(1);
                    const isActive = activeChat === room.room_id;
                    return (
                        <div
                            key={room.room_id}
                            className={`flex justify-between items-center p-2 mb-1 rounded cursor-pointer ${isActive ? 'bg-blue-300' : 'hover:bg-gray-300'}`}
                        >
                            <span onClick={() => onSelectChat(room.room_id)}>{label}</span>
                            <div className="flex gap-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleInviteUser(room.room_id);
                                    }}
                                    className="text-green-600 hover:text-green-800 font-bold"
                                    title="Пригласить пользователя"
                                >
                                    ➕
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteRoom(room.room_id);
                                    }}
                                    className="text-red-600 hover:text-red-800"
                                    title="Удалить комнату"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ChatList;