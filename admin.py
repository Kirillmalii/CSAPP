from typing import Dict, List
import json
import os
import aiohttp
from bs4 import BeautifulSoup

class Admin:
    def __init__(self):
        self.admin_ids = [int(id) for id in os.getenv('ADMIN_IDS', '').split(',')]
        self.users: Dict[int, dict] = {}
        self.shop_items: List[dict] = []
        self.load_data()

    def load_data(self):
        """Загрузка данных из файлов"""
        try:
            with open('users.json', 'r') as f:
                self.users = json.load(f)
        except FileNotFoundError:
            self.users = {}

        try:
            with open('shop.json', 'r') as f:
                self.shop_items = json.load(f)
        except FileNotFoundError:
            self.shop_items = []

    def save_data(self):
        """Сохранение данных в файлы"""
        with open('users.json', 'w') as f:
            json.dump(self.users, f)
        with open('shop.json', 'w') as f:
            json.dump(self.shop_items, f)

    def is_admin(self, user_id: int) -> bool:
        """Проверка является ли пользователь администратором"""
        return user_id in self.admin_ids

    async def parse_steam_item(self, url: str) -> dict:
        """Парсинг информации о предмете из Steam"""
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as response:
                if response.status == 200:
                    html = await response.text()
                    soup = BeautifulSoup(html, 'html.parser')
                    
                    # Получаем название предмета
                    name = soup.find('div', class_='market_listing_nav').text.strip()
                    
                    # Получаем изображение
                    image = soup.find('img', class_='market_listing_largeimage')
                    image_url = image['src'] if image else None
                    
                    return {
                        'name': name,
                        'image': image_url,
                        'url': url
                    }
                return None

    def add_item(self, item_data: dict, price: int):
        """Добавление нового предмета в магазин"""
        item = {
            'id': len(self.shop_items) + 1,
            'name': item_data['name'],
            'image': item_data['image'],
            'price': price,
            'url': item_data['url']
        }
        self.shop_items.append(item)
        self.save_data()
        return item

    def remove_item(self, item_id: int) -> bool:
        """Удаление предмета из магазина"""
        for i, item in enumerate(self.shop_items):
            if item['id'] == item_id:
                self.shop_items.pop(i)
                self.save_data()
                return True
        return False

    def update_user_score(self, user_id: int, score: int):
        """Обновление баллов пользователя"""
        if str(user_id) not in self.users:
            self.users[str(user_id)] = {'score': 0, 'inventory': []}
        self.users[str(user_id)]['score'] = score
        self.save_data()

    def ban_user(self, user_id: int):
        """Бан пользователя"""
        if str(user_id) in self.users:
            self.users[str(user_id)]['banned'] = True
            self.save_data()
            return True
        return False

    def unban_user(self, user_id: int):
        """Разбан пользователя"""
        if str(user_id) in self.users:
            self.users[str(user_id)]['banned'] = False
            self.save_data()
            return True
        return False

    def is_banned(self, user_id: int) -> bool:
        """Проверка забанен ли пользователь"""
        return self.users.get(str(user_id), {}).get('banned', False)

    def get_user_score(self, user_id: int) -> int:
        """Получение баллов пользователя"""
        return self.users.get(str(user_id), {}).get('score', 0)

    def get_shop_items(self) -> List[dict]:
        """Получение списка предметов магазина"""
        return self.shop_items
