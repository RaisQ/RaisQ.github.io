# Проект: Игра “3 в ряд”

Классическая игра “3 в ряд”, реализованная с использованием чистого HTML, CSS и JavaScript (без использования фреймворков).

## Описание

Этот проект представляет собой веб-реализацию популярной головоломки “3 в ряд”, где игрок должен менять местами соседние элементы, чтобы образовать линии из трех или более одинаковых шаров. Цель игры - набрать как можно больше очков, удаляя шары с игрового поля. Игра заканчивается, когда на поле не остается возможных ходов.

## Реализованные функции

Генерация игрового поля: Динамическое создание игрового поля заданного размера.
Взаимодействие с пользователем: Обработка кликов по ячейкам для выбора и обмена шаров.
Логика игры:
Проверка на наличие совпадений (горизонтальных и вертикальных линий).
Удаление совпавших шаров.
Сдвиг шаров вниз (принцип “гравитации”).
Заполнение пустых ячеек новыми случайными шарами.
Подсчет очков (с учетом количества удаленных шаров за раз).
Проверка на наличие доступных ходов.
Завершение игры при отсутствии доступных ходов.
Визуальные эффекты:
Анимация “прыжка” для выбранного шара.
Подсветка шаров, подлежащих удалению.
Разноцветные шары (реализованы с помощью CSS).
Звуковое сопровождение:
Звуки для нажатия на кнопки, выбора шара, обмена шаров и удаления шаров.
Возможность включения/выключения звука.
Смена темы: Возможность переключения между светлой и темной темой оформления.
Сохранение состояния: Сохранение выбранной темы и состояния звука в localStorage.
## Возможные улучшения

Этот проект можно улучшить, добавив следующие функции:

Более сложная логика подсчета очков: Например, увеличение множителя очков за комбо-удары (удаление нескольких линий за один ход).
Специальные шары: Добавление шаров с особыми свойствами (например, шары-бомбы, шары, удаляющие всю линию).
Разные режимы игры: Например, режим на время, режим с ограниченным количеством ходов.
Система подсказок: Добавление подсказок для игрока, указывающих на возможные ходы (с использованием сердечек, как было предложено ранее).
Улучшенный ИИ: Добавление ИИ для игры против компьютера.
Музыкальное сопровождение: Добавление фоновой музыки.
Дополнительные темы оформления: Расширение выбора тем оформления.
Адаптивный дизайн: Улучшение адаптивности для разных размеров экранов.
Оптимизация производительности: Оптимизация кода для более плавной работы (особенно на мобильных устройствах).
## Карта проекта

```
GameProject/
├── index.html       # Основной HTML-файл
├── style.css        # Файл со стилями CSS
├── script.js        # Файл с логикой JavaScript
├── README.md        # Описание проекта
├── sounds/          # Папка со звуковыми файлами
│   ├── button-click.mp3
│   ├── ball-select.mp3
│   ├── ball-swap.mp3
│   └── ball-remove.mp3
```

Описание файлов и папок:

index.html: Содержит структуру HTML-страницы (разметка, кнопки, элементы для отображения игрового поля и счета).
style.css: Содержит стили CSS для оформления игры (цвета, шрифты, размеры, анимация).
script.js: Содержит всю логику игры на JavaScript (генерация поля, обработка кликов, проверка совпадений, удаление шаров, подсчет очков, завершение игры).
README.md: Содержит описание проекта, инструкции по установке и использованию, список реализованных функций и возможных улучшений.
sounds/: Папка, содержащая звуковые файлы для звукового сопровождения игры.
## Установка и запуск

Склонируйте репозиторий: `git clone https://github.com/RaisQ/RaisQ.github.io.git`
Откройте файл index.html в вашем браузере.
## Автор

Etl0 - https://github.com/TurboBum
Pabalo - https://github.com/Tea1Baron

## Лицензия

Краткая лицензия (Modified Source Allowed, Original Attribution Required)

Copyright (c) [2025] [Etl0]

Разрешается бесплатное скачивание и изменение данного проекта.

При распространении модифицированной версии проекта, запрещается выдавать ее за немодифицированный оригинал. Необходимо явно указать, что данная версия была изменена, и указать автора оригинального проекта (Etl0).

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

