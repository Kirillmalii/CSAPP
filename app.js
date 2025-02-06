// Инициализация Telegram WebApp
const tg = window.Telegram.WebApp;
tg.expand();

// Инициализация переменных
let score = 0;
const scoreElement = document.getElementById('score');
const coin = document.getElementById('coin');

// Обработка кликов по монетке
coin.addEventListener('click', () => {
    score++;
    scoreElement.textContent = score;
    // Анимация клика
    coin.style.transform = 'scale(0.95)';
    setTimeout(() => {
        coin.style.transform = 'scale(1)';
    }, 100);
    
    // Сохранение счета
    localStorage.setItem('score', score);
});

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
        // Удаляем активный класс у всех кнопок и контента
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Добавляем активный класс нажатой кнопке
        button.classList.add('active');
        
        // Показываем соответствующий контент
        const tabId = button.getAttribute('data-tab');
        document.getElementById(tabId).classList.add('active');
    });
});

// Функция сохранения Trade URL
function saveTradeUrl() {
    const tradeUrl = document.getElementById('tradeUrl').value;
    if (tradeUrl) {
        localStorage.setItem('tradeUrl', tradeUrl);
        alert('Trade URL сохранен!');
    }
}

// Загрузка сохраненного Trade URL
document.addEventListener('DOMContentLoaded', () => {
    const savedTradeUrl = localStorage.getItem('tradeUrl');
    if (savedTradeUrl) {
        document.getElementById('tradeUrl').value = savedTradeUrl;
    }
});

// Примеры предметов магазина
const shopItems = [
    { id: 1, name: 'AK-47 | Asiimov', price: 1000, type: 'skin', image: 'ak47-asiimov.png' },
    { id: 2, name: 'Кейс Gamma', price: 500, type: 'case', image: 'gamma-case.png' },
    // Добавьте больше предметов по необходимости
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
            <img src="${item.image}" alt="${item.name}">
            <h3>${item.name}</h3>
            <p>${item.price} баллов</p>
            <button onclick="buyItem(${item.id})">Купить</button>
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
        
        alert(`Вы успешно приобрели ${item.name}!`);
        updateInventory();
    } else {
        alert('Недостаточно баллов для покупки!');
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
            <img src="${item.image}" alt="${item.name}">
            <h3>${item.name}</h3>
        `;
        inventoryContainer.appendChild(itemElement);
    });
}

// Инициализация магазина и инвентаря
displayShopItems('skins');
updateInventory();
