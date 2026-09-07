let activeUsers = {};

export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'POST') {
        let body = req.body;
        if (typeof body === 'string') {
            try { body = JSON.parse(body); } catch(e) {}
        }
        
        const { userId, username, lastMessage } = body || {};
        if (userId) {
            activeUsers[userId] = {
                username: username || 'Unknown',
                lastMessage: lastMessage || 'Сообщений нет',
                lastPing: Date.now()
            };
        }
        return res.status(200).json({ status: 'ok' });
    }

    if (req.method === 'GET') {
        const now = Date.now();
        // Фильтруем тех, кто не слал пинг больше 90 секунд
        const onlineList = Object.entries(activeUsers)
            .filter(([_, data]) => now - data.lastPing < 90000)
            .map(([id, data]) => ({ id, ...data }));

        return res.status(200).json({
            count: onlineList.length,
            users: onlineList
        });
    }
}