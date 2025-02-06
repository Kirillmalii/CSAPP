import os
from telegram import Update, WebAppInfo, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, MessageHandler, CallbackQueryHandler, ContextTypes, filters
from dotenv import load_dotenv
import json
from admin import Admin

# Загрузка переменных окружения
load_dotenv()

# Получение токена бота из переменных окружения
TOKEN = os.getenv('BOT_TOKEN')

# Инициализация админ-панели
admin = Admin()

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обработчик команды /start"""
    if admin.is_banned(update.effective_user.id):
        await update.message.reply_text("Вы забанены!")
        return

    keyboard = [
        [InlineKeyboardButton(
            "Открыть игру", 
            web_app=WebAppInfo(url="https://kirillmalii.github.io/CSAPP")
        )]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(
        "Привет! Нажми кнопку ниже, чтобы начать игру:",
        reply_markup=reply_markup
    )

async def admin_help(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Показать список админ-команд"""
    if not admin.is_admin(update.effective_user.id):
        return

    help_text = """
Доступные команды:
/add_item <steam_url> <цена> - Добавить предмет в магазин
/remove_item <id> - Удалить предмет из магазина
/ban <user_id> - Забанить пользователя
/unban <user_id> - Разбанить пользователя
/give_score <user_id> <amount> - Выдать баллы пользователю
/take_score <user_id> <amount> - Забрать баллы у пользователя
/list_items - Показать все предметы в магазине
/user_info <user_id> - Информация о пользователе
    """
    await update.message.reply_text(help_text)

async def add_item(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Добавить предмет в магазин"""
    if not admin.is_admin(update.effective_user.id):
        return

    try:
        url = context.args[0]
        price = int(context.args[1])
        
        item_data = await admin.parse_steam_item(url)
        if item_data:
            item = admin.add_item(item_data, price)
            await update.message.reply_text(f"Предмет {item['name']} добавлен в магазин!")
        else:
            await update.message.reply_text("Не удалось получить информацию о предмете")
    except (IndexError, ValueError):
        await update.message.reply_text("Использование: /add_item <steam_url> <цена>")

async def remove_item(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Удалить предмет из магазина"""
    if not admin.is_admin(update.effective_user.id):
        return

    try:
        item_id = int(context.args[0])
        if admin.remove_item(item_id):
            await update.message.reply_text("Предмет удален из магазина!")
        else:
            await update.message.reply_text("Предмет не найден")
    except (IndexError, ValueError):
        await update.message.reply_text("Использование: /remove_item <id>")

async def ban_user(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Забанить пользователя"""
    if not admin.is_admin(update.effective_user.id):
        return

    try:
        user_id = int(context.args[0])
        if admin.ban_user(user_id):
            await update.message.reply_text(f"Пользователь {user_id} забанен!")
        else:
            await update.message.reply_text("Пользователь не найден")
    except (IndexError, ValueError):
        await update.message.reply_text("Использование: /ban <user_id>")

async def unban_user(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Разбанить пользователя"""
    if not admin.is_admin(update.effective_user.id):
        return

    try:
        user_id = int(context.args[0])
        if admin.unban_user(user_id):
            await update.message.reply_text(f"Пользователь {user_id} разбанен!")
        else:
            await update.message.reply_text("Пользователь не найден")
    except (IndexError, ValueError):
        await update.message.reply_text("Использование: /unban <user_id>")

async def give_score(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Выдать баллы пользователю"""
    if not admin.is_admin(update.effective_user.id):
        return

    try:
        user_id = int(context.args[0])
        amount = int(context.args[1])
        current_score = admin.get_user_score(user_id)
        admin.update_user_score(user_id, current_score + amount)
        await update.message.reply_text(f"Пользователю {user_id} выдано {amount} баллов!")
    except (IndexError, ValueError):
        await update.message.reply_text("Использование: /give_score <user_id> <amount>")

async def take_score(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Забрать баллы у пользователя"""
    if not admin.is_admin(update.effective_user.id):
        return

    try:
        user_id = int(context.args[0])
        amount = int(context.args[1])
        current_score = admin.get_user_score(user_id)
        new_score = max(0, current_score - amount)
        admin.update_user_score(user_id, new_score)
        await update.message.reply_text(f"У пользователя {user_id} забрано {amount} баллов!")
    except (IndexError, ValueError):
        await update.message.reply_text("Использование: /take_score <user_id> <amount>")

async def list_items(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Показать все предметы в магазине"""
    if not admin.is_admin(update.effective_user.id):
        return

    items = admin.get_shop_items()
    if items:
        items_text = "Предметы в магазине:\n\n"
        for item in items:
            items_text += f"ID: {item['id']}\nНазвание: {item['name']}\nЦена: {item['price']}\n\n"
        await update.message.reply_text(items_text)
    else:
        await update.message.reply_text("Магазин пуст")

async def user_info(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Информация о пользователе"""
    if not admin.is_admin(update.effective_user.id):
        return

    try:
        user_id = int(context.args[0])
        user_data = admin.users.get(str(user_id))
        if user_data:
            info = f"""
Информация о пользователе {user_id}:
Баллы: {user_data.get('score', 0)}
Забанен: {user_data.get('banned', False)}
Предметы: {len(user_data.get('inventory', []))}
            """
            await update.message.reply_text(info)
        else:
            await update.message.reply_text("Пользователь не найден")
    except (IndexError, ValueError):
        await update.message.reply_text("Использование: /user_info <user_id>")

async def handle_web_app_data(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обработка данных от веб-приложения"""
    try:
        data = json.loads(update.message.web_app_data.data)
        if data['action'] == 'updateScore':
            admin.update_user_score(update.effective_user.id, data['score'])
        elif data['action'] == 'buyItem':
            # Обработка покупки предмета
            pass
    except Exception as e:
        print(f"Error handling web app data: {e}")

def main():
    """Запуск бота"""
    application = Application.builder().token(TOKEN).build()

    # Добавление обработчиков команд
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("admin", admin_help))
    application.add_handler(CommandHandler("add_item", add_item))
    application.add_handler(CommandHandler("remove_item", remove_item))
    application.add_handler(CommandHandler("ban", ban_user))
    application.add_handler(CommandHandler("unban", unban_user))
    application.add_handler(CommandHandler("give_score", give_score))
    application.add_handler(CommandHandler("take_score", take_score))
    application.add_handler(CommandHandler("list_items", list_items))
    application.add_handler(CommandHandler("user_info", user_info))
    
    # Обработчик данных от веб-приложения
    application.add_handler(MessageHandler(filters.StatusUpdate.WEB_APP_DATA, handle_web_app_data))

    # Запуск бота
    application.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == '__main__':
    main()
