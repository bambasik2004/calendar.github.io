import asyncio
import logging
import sys
from os import getenv
import json
from dotenv import load_dotenv
from datetime import datetime, timedelta
from aiogram import Bot, Dispatcher, html
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode
from aiogram.filters import Command, CommandStart
from aiogram.types import Message, WebAppInfo, KeyboardButton, ReplyKeyboardMarkup, InlineKeyboardMarkup, InlineKeyboardButton, CallbackQuery
from apscheduler.schedulers.asyncio import AsyncIOScheduler

load_dotenv()
TOKEN = getenv("BOT_TOKEN")

dp = Dispatcher()

web_app = WebAppInfo(url="https://bambasik2004.github.io/calendar.github.io/")

deadlines = {}
cur_data = ''
event = ''

keyboard = ReplyKeyboardMarkup(keyboard=[
    [KeyboardButton(text='Calendar', web_app=web_app)]
])

keyboard1 = InlineKeyboardMarkup(inline_keyboard=[
    [InlineKeyboardButton(text='Add event', callback_data='add_button')],
    [InlineKeyboardButton(text='Deadlines list', callback_data='list_button')]
])

@dp.message(Command('start'))
async def command_start_handler(message: Message) -> None:
    await message.answer(f'Кнопка календарь для выбора', reply_markup=keyboard)
    await message.answer(f'Впишите событие и нажмите кнопку добавить', reply_markup=keyboard1)

@dp.callback_query(lambda callback: callback.data == 'list_button')
async def get_list(callback: CallbackQuery) -> None:
    result = "Список дедлайнов:\n"
    for date, tasks in deadlines.items():
        result += f"\nДата: {date}\n"
        for task in tasks:
            result += f"  - Задача: {task}\n"
    await callback.message.answer(result)
    await callback.answer()

@dp.callback_query(lambda callback: callback.data == 'add_button')
async def set_deadline(callback: CallbackQuery) -> None:
    dt = datetime(year=cur_data['year'], month=cur_data['month'], day=cur_data['day'], hour=12)
    format_dt = dt.strftime(f"%A, %d %B %Y")
    if format_dt not in deadlines:
        deadlines[format_dt] = set()
    deadlines[format_dt].add(event)

    # Напоминалки
    # тестовая scheduler.add_job(send_reminder, 'date', run_date=datetime.now() + timedelta(seconds=5), args=[callback.message.chat.id, event, 'через неделю'])
    scheduler.add_job(send_reminder, 'date', run_date=dt - timedelta(days=7), args=[callback.message.chat.id, event, 'через неделю'])
    scheduler.add_job(send_reminder, 'date', run_date=dt - timedelta(days=3), args=[callback.message.chat.id, event, 'через 3 дня'])
    scheduler.add_job(send_reminder, 'date', run_date=dt - timedelta(days=1), args=[callback.message.chat.id, event, 'завтра'])

    await callback.message.answer(f'Событие {event} добавлено: {format_dt}')
    await callback.answer()

@dp.message()
async def set_deadline_data(message: Message) -> None:
    if message.web_app_data:
        global cur_data
        cur_data = message.web_app_data.data
        cur_data = json.loads(cur_data)
    if message.text:
        global event
        event = message.text

async def send_reminder(chat_id: int, event: str, reminder: str):
    bot = Bot(token=TOKEN, default=DefaultBotProperties(parse_mode=ParseMode.HTML))
    await bot.send_message(chat_id, f"Напоминание: {reminder} дедлайн для задачи '{event}'")

async def main() -> None:
    global scheduler
    scheduler = AsyncIOScheduler()
    scheduler.start()
    
    bot = Bot(token=TOKEN, default=DefaultBotProperties(parse_mode=ParseMode.HTML))
    await dp.start_polling(bot)

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, stream=sys.stdout)
    asyncio.run(main())
