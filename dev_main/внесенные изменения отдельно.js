// Восстанавливаем количество жизней из localStorage или устанавливаем значение по умолчанию
let lives = parseInt(localStorage.getItem('lives')) || redBalls.length;


function updateLives(newLives) {
    lives = newLives;
    localStorage.setItem('lives', lives); // Сохраняем количество жизней в localStorage
    updateRedBalls(); // Обновляем отображение красных шаров
  }


  function initializeGrid() {
    let hasInitialMatches;
    do {
      grid = [];
      for (let row = 0; row < gridSize; row++) {
        grid[row] = [];
        for (let col = 0; col < gridSize; col++) {
          grid[row][col] = {
            value: Math.floor(Math.random() * 5) + 1, // Значения от 1 до 5
            selected: false,
          };
        }
      }
      renderBoard(); // Отрисовываем доску, чтобы checkForMatches работал корректно
      hasInitialMatches = checkForMatchesOnInitialization();
    } while (hasInitialMatches);
  }

  // Функция для отрисовки игрового поля в DOM
  function renderBoard() {
    boardElement.innerHTML = ''; // Очищаем игровое поле
  
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.row = row;
        cell.dataset.col = col;
  
        // Добавляем класс цвета шара
        if (grid[row][col].value) {
          cell.classList.add(`ball-${grid[row][col].value}`);
        }
  
        // Выделенный элемент (если выбран)
        if (grid[row][col].selected) {
          cell.classList.add('selected');
        }
  
        // Применяем темную тему, если она включена
        if (currentTheme === 'dark') {
          cell.classList.add('dark-theme');
        }
  
        // Если шар отмечен как взрывающийся, запускаем анимацию
        if (grid[row][col].exploding) {
          cell.classList.add('explosion');
        }
  
        cell.addEventListener('click', handleCellClick);
        boardElement.appendChild(cell);
      }
    }
  }
  

  // Функция для обработки клика по ячейке
async function handleCellClick(event) {
const row = parseInt(event.target.dataset.row);
const col = parseInt(event.target.dataset.col);

if (selectedCell === null) {
    // Первый клик
    selectedCell = { row, col };
    grid[row][col].selected = true;
    playSound('ball-select-sound');
} else {
    // Второй клик
    const firstCell = selectedCell;
    selectedCell = null;

    // Проверка на соседство
    const isAdjacent =
        (Math.abs(row - firstCell.row) === 1 && col === firstCell.col) ||
        (Math.abs(col - firstCell.col) === 1 && row === firstCell.row);

    if (isAdjacent) {
        // Меняем шарики местами
        swapCells(firstCell, { row, col });

        // Проверяем, был ли ход успешным (привел ли к удалению шаров)
        const hasMatches = await checkForMatches(); // Ожидаем завершения проверки совпадений

        // Если совпадений нет, увеличиваем счетчик неудачных ходов
        if (!hasMatches) {
          moveCount++;
          updateLives(lives - 1); // Уменьшаем количество жизней
          updateRedBalls(); // Обновляем цвет шаров
        
          // Проверяем, все ли шары стали серыми
          if (lives <= 0) {
            endGame(); // Завершаем игру
          }
        }
        // Если ход успешный, ничего не делаем с красными шарами
    } else {
        // Клик на отдаленную ячейку - просто выбираем ее
        grid[firstCell.row][firstCell.col].selected = false;
        grid[row][col].selected = true;
        selectedCell = { row, col };
        playSound('ball-select-sound');
    }
}

renderBoard();
}



function updateRedBalls() {
    redBalls.forEach((ball, index) => {
      if (index < lives) {
        ball.classList.remove('gray-ball');
        ball.classList.add('red-ball');
      } else {
        ball.classList.remove('red-ball');
        ball.classList.add('gray-ball');
      }
    });
  }

  // Функция для сброса цвета шаров
function resetRedBalls() {
    redBalls.forEach(ball => {
        ball.classList.remove('gray-ball');
        ball.classList.add('red-ball');
    });
}

// Функция для завершения игры
function endGame() {
    gameOverContainer.style.display = 'flex'; // Показываем уведомление
}

 // Функция для перезапуска игры
 function restartGame() {
  gameOverContainer.style.display = 'none'; // Скрываем уведомление
  moveCount = 0; // Сбрасываем счетчик неудачных ходов
  updateLives(redBalls.length); // Восстанавливаем количество жизней
  initializeGrid(); // Перезапускаем игровое поле
  updateScore(0); // Сбрасываем счет
}


updateRedBalls(); // Обновляем отображение красных шаров при загрузке страницы