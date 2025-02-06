let tg = window.Telegram.WebApp;
let score = parseInt(localStorage.getItem('score')) || 0;
const scoreElement = document.getElementById('score');
const coin = document.getElementById('coin');
const shop = document.getElementById('shop');

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    updateScore();
    loadShopItems();
    tg.ready();
    tg.expand();
});

// Обработка клика по монете
coin.addEventListener('click', (event) => {
    score++;
    updateScore();
    createParticles(event);
    playClickAnimation();
    saveScore();
});

// Создание частиц при клике
function createParticles(event) {
    const rect = coin.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.innerHTML = '+1';
        
        const angle = (i * Math.PI * 2) / 8;
        const velocity = 5;
        const particleX = Math.cos(angle) * 50;
        const particleY = Math.sin(angle) * 50;

        particle.style.setProperty('--x', `${particleX}px`);
        particle.style.setProperty('--y', `${particleY}px`);
        
        coin.appendChild(particle);
        
        setTimeout(() => particle.remove(), 1000);
    }
}

// Анимация клика по монете
function playClickAnimation() {
    coin.style.transform = 'scale(0.95)';
    setTimeout(() => {
        coin.style.transform = 'scale(1)';
    }, 100);
}

// Обновление счета
function updateScore() {
    scoreElement.textContent = score;
    saveScore();
}

// Сохранение счета
function saveScore() {
    localStorage.setItem('score', score);
    // Отправляем данные в бота
    tg.sendData(JSON.stringify({
        action: 'updateScore',
        score: score
    }));
}

// Загрузка предметов магазина
function loadShopItems() {
    // Здесь будет загрузка предметов из API бота
    // Пока используем тестовые данные
    const testItems = [
        {
            id: 1,
            name: 'AK-47 | Asiimov',
            price: 1000,
            image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszJemkV09-5lpKKqPrxN7LEmyVQ7MEpiLuSrYmnjQO3-UdsZGHyd4_Bd1RvNQ7T_FDrw-_ng5Pu75iY1zI97bhLsvQz/360fx360f'
        },
        // Добавьте больше предметов по необходимости
    ];

    shop.innerHTML = testItems.map(item => `
        <div class="shop-item">
            <img src="${item.image}" alt="${item.name}">
            <h3>${item.name}</h3>
            <div class="price">${item.price} баллов</div>
            <button class="buy-btn" onclick="buyItem(${item.id})" ${score < item.price ? 'disabled' : ''}>
                Купить
            </button>
        </div>
    `).join('');
}

// Покупка предмета
function buyItem(itemId) {
    const item = findItemById(itemId);
    if (score >= item.price) {
        score -= item.price;
        updateScore();
        showNotification(`Вы купили ${item.name}!`);
        // Отправляем данные о покупке в бота
        tg.sendData(JSON.stringify({
            action: 'buyItem',
            itemId: itemId
        }));
    }
}

// Поиск предмета по ID
function findItemById(id) {
    // Здесь будет поиск в реальных данных
    return {
        id: 1,
        name: 'AK-47 | Asiimov',
        price: 1000
    };
}

// Показ уведомления
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}
