let tg = window.Telegram.WebApp;
let score = parseInt(localStorage.getItem('score')) || 0;
const scoreElement = document.getElementById('score');
const coin = document.getElementById('coin');
const shopContainer = document.getElementById('shop');

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    updateScore();
    loadShopItems();
    initTabs();
    loadTradeUrl();
    tg.ready();
    tg.expand();
});

// Обработка вкладок
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            
            // Убираем активный класс со всех кнопок и контента
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Добавляем активный класс нужной кнопке и контенту
            button.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

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
        coin.style.transform = '';
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
    tg.sendData(JSON.stringify({
        action: 'updateScore',
        score: score
    }));
}

// Загрузка предметов магазина
function loadShopItems() {
    const testItems = [
        {
            id: 1,
            name: 'AK-47 | Красная линия',
            price: 1000,
            image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszJemkV09-5lpKKqPrxN7LEm1Rd6dd2j6eQ9N2t2wK3-ENsZ23wcIKRdQE2NwyD_FK_kLq9gJDu7p_KyyRr7nNw-z-DyIFJbNUz/360fx360f'
        }
    ];

    shopContainer.innerHTML = testItems.map(item => `
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
        tg.sendData(JSON.stringify({
            action: 'buyItem',
            itemId: itemId
        }));
    }
}

// Поиск предмета по ID
function findItemById(id) {
    return {
        id: 1,
        name: 'AK-47 | Красная линия',
        price: 1000
    };
}

// Сохранение Trade URL
function saveTradeUrl() {
    const tradeUrl = document.getElementById('tradeUrl').value;
    if (tradeUrl) {
        localStorage.setItem('tradeUrl', tradeUrl);
        showNotification('Trade URL сохранен!');
        tg.sendData(JSON.stringify({
            action: 'saveTradeUrl',
            tradeUrl: tradeUrl
        }));
    }
}

// Загрузка Trade URL
function loadTradeUrl() {
    const tradeUrl = localStorage.getItem('tradeUrl');
    if (tradeUrl) {
        document.getElementById('tradeUrl').value = tradeUrl;
    }
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
