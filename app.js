// Инициализация Telegram WebApp
const tg = window.Telegram.WebApp;
tg.expand();

// Инициализация переменных
let score = 0;
const scoreElement = document.getElementById('score');
const coin = document.getElementById('coin');

// Обработка кликов по монетке
coin.addEventListener('click', (event) => {
    score++;
    scoreElement.textContent = score;
    
    // Анимация клика
    coin.style.transform = 'scale(0.95)';
    setTimeout(() => {
        coin.style.transform = 'scale(1)';
    }, 100);
    
    // Сохранение счета
    localStorage.setItem('score', score);
    
    // Добавляем эффект частиц
    createParticles(event);
});

// Функция создания эффекта частиц
function createParticles(event) {
    const particles = 5;
    const coinRect = coin.getBoundingClientRect();
    
    for (let i = 0; i < particles; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.textContent = '+1';
        document.body.appendChild(particle);
        
        const angle = (Math.random() * Math.PI * 2);
        const velocity = 2 + Math.random() * 2;
        const x = coinRect.left + coinRect.width / 2;
        const y = coinRect.top + coinRect.height / 2;
        
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        
        const animation = particle.animate([
            { transform: 'translate(0, 0) scale(1)', opacity: 1 },
            { transform: `translate(${Math.cos(angle) * 100}px, ${Math.sin(angle) * 100}px) scale(0)`, opacity: 0 }
        ], {
            duration: 1000,
            easing: 'ease-out'
        });
        
        animation.onfinish = () => particle.remove();
    }
}

// Загрузка сохраненного счета
document.addEventListener('DOMContentLoaded', () => {
    const savedScore = localStorage.getItem('score');
    if (savedScore) {
        score = parseInt(savedScore);
        scoreElement.textContent = score;
    }
});

// Обработка переключения вкладок
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        button.classList.add('active');
        
        const tabId = button.getAttribute('data-tab');
        document.getElementById(tabId).classList.add('active');
    });
});

// Функция сохранения Trade URL
function saveTradeUrl() {
    const tradeUrl = document.getElementById('tradeUrl').value;
    if (tradeUrl) {
        localStorage.setItem('tradeUrl', tradeUrl);
        showNotification('Trade URL сохранен!');
    }
}

// Функция показа уведомления
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }, 100);
}

// Примеры предметов магазина
const shopItems = [
    { id: 1, name: 'AK-47 | Asiimov', price: 1000, type: 'skin' },
    { id: 2, name: 'AWP | Dragon Lore', price: 5000, type: 'skin' },
    { id: 3, name: 'Кейс Gamma', price: 500, type: 'case' },
    { id: 4, name: 'Кейс Chroma', price: 500, type: 'case' }
];

// Функция отображения предметов в магазине
function displayShopItems(category) {
    const shopItemsContainer = document.getElementById('shopItems');
    shopItemsContainer.innerHTML = '';
    
    const filteredItems = shopItems.filter(item => item.type === category);
    
    filteredItems.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'item';
        itemElement.innerHTML = `
            <div class="item-image ${item.type}"></div>
            <h3>${item.name}</h3>
            <p>${item.price} баллов</p>
            <button onclick="buyItem(${item.id})" class="buy-btn">Купить</button>
        `;
        shopItemsContainer.appendChild(itemElement);
    });
}

// Обработка переключения категорий в магазине
const categoryButtons = document.querySelectorAll('.category-btn');
categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
        categoryButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        displayShopItems(button.getAttribute('data-category'));
    });
});

// Функция покупки предмета
function buyItem(itemId) {
    const item = shopItems.find(i => i.id === itemId);
    if (item && score >= item.price) {
        score -= item.price;
        scoreElement.textContent = score;
        localStorage.setItem('score', score);
        
        // Добавление предмета в инвентарь
        const inventory = JSON.parse(localStorage.getItem('inventory') || '[]');
        inventory.push(item);
        localStorage.setItem('inventory', JSON.stringify(inventory));
        
        showNotification(`Вы успешно приобрели ${item.name}!`);
        updateInventory();
    } else {
        showNotification('Недостаточно баллов для покупки!');
    }
}

// Функция обновления инвентаря
function updateInventory() {
    const inventoryContainer = document.getElementById('inventoryItems');
    const inventory = JSON.parse(localStorage.getItem('inventory') || '[]');
    
    inventoryContainer.innerHTML = '';
    inventory.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'item';
        itemElement.innerHTML = `
            <div class="item-image ${item.type}"></div>
            <h3>${item.name}</h3>
        `;
        inventoryContainer.appendChild(itemElement);
    });
}

// Инициализация магазина и инвентаря
displayShopItems('skins');
updateInventory();
