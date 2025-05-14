import React from 'react';
import ReactDOM from 'react-dom/client';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    <React.StrictMode>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>✅ Luma Messenger</h1>
            <p style={{ marginTop: '1rem', color: '#1e40af' }}>React + Vite + Tauri — работает!</p>
        </div>
    </React.StrictMode>
);