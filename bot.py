import os
from telegram import Update, WebAppInfo, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, ContextTypes
from dotenv import load_dotenv
import json

# Загрузка переменных окружения
load_dotenv()

# Получение токена бота из переменных окружения
TOKEN = os.getenv('BOT_TOKEN')

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обработчик команды /start"""
    keyboard = [
        [InlineKeyboardButton(
            "Открыть игру", 
            web_app=WebAppInfo(url="https://your-webapp-url.com")  # Замените на URL вашего веб-приложения
        )]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(
        "Привет! Нажми кнопку ниже, чтобы начать игру:",
        reply_markup=reply_markup
    )

def main():
    """Запуск бота"""
    application = Application.builder().token(TOKEN).build()

    # Добавление обработчиков команд
    application.add_handler(CommandHandler("start", start))

    # Запуск бота
    application.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == '__main__':
    main()
