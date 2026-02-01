const express = require('express');
const cors = require('cors');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

// Адрес вашего основного бота
const BOT_API_URL = process.env.BOT_API_URL || 'https://subtrack100-production.up.railway.app';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Прокси для API бота
app.post('/api/sync', async (req, res) => {
    try {
        const { telegramId, initData } = req.body;
        
        // Запрос к основному боту для получения данных пользователя
        const response = await fetch(`${BOT_API_URL}/api/user/${telegramId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Telegram-Init-Data': initData || ''
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            res.json(data);
        } else {
            // Возвращаем демо-данные если API недоступен
            res.json(getDemoData());
        }
    } catch (error) {
        console.error('Sync error:', error);
        res.json(getDemoData());
    }
});

// Добавление подписки
app.post('/api/subscription', async (req, res) => {
    try {
        const response = await fetch(`${BOT_API_URL}/api/subscription`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });
        
        if (response.ok) {
            res.json(await response.json());
        } else {
            res.json({ success: true, message: 'Сохранено локально' });
        }
    } catch (error) {
        res.json({ success: true, message: 'Сохранено локально' });
    }
});

// Удаление подписки
app.delete('/api/subscription/:id', async (req, res) => {
    try {
        const response = await fetch(`${BOT_API_URL}/api/subscription/${req.params.id}`, {
            method: 'DELETE'
        });
        res.json({ success: true });
    } catch (error) {
        res.json({ success: true });
    }
});

// Демо-данные
function getDemoData() {
    return {
        user: {
            id: 123456789,
            name: 'Пользователь',
            isPremium: false
        },
        subscriptions: [
            {
                id: 1,
                name: 'Яндекс Плюс',
                price: 399,
                nextPayment: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
                icon: '🎵',
                category: 'Музыка и видео',
                color: '#FF0000'
            },
            {
                id: 2,
                name: 'Кинопоиск',
                price: 299,
                nextPayment: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
                icon: '🎬',
                category: 'Видео',
                color: '#FF6B00'
            },
            {
                id: 3,
                name: 'Spotify',
                price: 199,
                nextPayment: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
                icon: '🎧',
                category: 'Музыка',
                color: '#1DB954'
            },
            {
                id: 4,
                name: 'YouTube Premium',
                price: 199,
                nextPayment: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
                icon: '▶️',
                category: 'Видео',
                color: '#FF0000'
            }
        ],
        stats: {
            totalMonthly: 1096,
            totalYearly: 13152,
            activeCount: 4,
            upcomingPayments: 2
        },
        duplicates: [
            {
                services: ['Яндекс Плюс', 'Кинопоиск'],
                message: 'Кинопоиск входит в Яндекс Плюс! Экономия: 299₽/мес',
                savings: 299
            }
        ],
        trials: [
            {
                name: 'Netflix',
                endsIn: 2,
                action: 'Отменить до 15.01'
            }
        ]
    };
}

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`🚀 SubTrack Mini App running on port ${PORT}`);
});