document.addEventListener('DOMContentLoaded', () => {
    const boardElement = document.querySelector('.board');
    const scoreElement = document.getElementById('score');

    const redBallsContainer = document.querySelector('.red-balls-container');
    const redBalls = document.querySelectorAll('.red-ball');

    let moveCount = 0;
  
    // Получаем элементы кнопок для десктопа
    const themeButton = document.getElementById('theme-button');
    const toggleBackgroundButton = document.getElementById('toggle-background-button');
    const soundButton = document.getElementById('sound-button');
    const restartButton = document.getElementById('restart-button');
  
    // Получаем элементы кнопок для мобильных
    const themeButtonMobile = document.getElementById('theme-button-mobile');
    const toggleBackgroundButtonMobile = document.getElementById('toggle-background-button-mobile');
    const soundButtonMobile = document.getElementById('sound-button-mobile');
    const restartButtonMobile = document.getElementById('restart-button-mobile');
  
    const gameOverContainer = document.querySelector('.game-over-container');
    const finalScoreElement = document.getElementById('final-score');
  
    const gridSize = 8; // Размер поля (8x8)
    let grid = [];
    let selectedCell = null;
  
    // Восстанавливаем очки из localStorage или устанавливаем значение по умолчанию 0
    let score = parseInt(localStorage.getItem('score')) || 0;
    scoreElement.textContent = score;
  
    // Инициализируем состояние звука из localStorage или устанавливаем значение по умолчанию true
    let soundEnabled = localStorage.getItem('soundEnabled') !== 'false'; // true по умолчанию
    const body = document.body;
    const container = document.querySelector('.container');
  
    // Применяем тему при загрузке страницы
    let currentTheme = localStorage.getItem('theme') || 'light'; // Текущая тема (light или dark)
    if (currentTheme === 'dark') {
      body.classList.add('dark-theme');
      container.classList.add('dark-theme');
    } else {
      body.classList.remove('dark-theme');
      container.classList.remove('dark-theme');
    }
  
    let backgroundVisible = localStorage.getItem('backgroundVisible') !== 'false'; // Изначально фон виден
    const toggleBackground = () => {
      if (backgroundVisible) {
        container.classList.remove('no-background');
        toggleBackgroundButton.textContent = 'Скрыть фон';
        toggleBackgroundButtonMobile.textContent = 'Скрыть фон'; // Обновляем текст мобильной кнопки
      } else {
        container.classList.add('no-background');
        toggleBackgroundButton.textContent = 'Показать фон';
        toggleBackgroundButtonMobile.textContent = 'Показать фон'; // Обновляем текст мобильной кнопки
      }
    }
  
    // Применяем состояние видимости фона при загрузке страницы
    toggleBackground();
  
    // Обновляем текст кнопки звука при загрузке страницы
    const updateSoundButtonText = () => {
      const text = `Звук: ${soundEnabled ? 'Вкл' : 'Выкл'}`;
      soundButton.textContent = text;
      soundButtonMobile.textContent = text;
    };
    updateSoundButtonText();
  
    function checkForMatchesOnInitialization() {
      for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize - 2; col++) {
          if (
            grid[row][col].value &&
            grid[row][col].value === grid[row][col + 1].value &&
            grid[row][col].value === grid[row][col + 2].value
          ) {
            return true; // Найдено горизонтальное совпадение
          }
        }
      }
  
      for (let col = 0; col < gridSize; col++) {
        for (let row = 0; row < gridSize - 2; row++) {
          if (
            grid[row][col].value &&
            grid[row][col].value === grid[row + 1][col].value &&
            grid[row][col].value === grid[row + 2][col].value
          ) {
            return true; // Найдено вертикальное совпадение
          }
        }
      }
  
      return false; // Совпадений не найдено
    }
    // Функция для инициализации игрового поля
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
              updateRedBalls(); // Обновляем цвет шаров

              // Проверяем, все ли шары стали серыми
              if (moveCount >= redBalls.length) {
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
    if (moveCount > 0 && moveCount <= redBalls.length) {
        // Меняем цвет шара на серый
        redBalls[moveCount - 1].classList.remove('red-ball');
        redBalls[moveCount - 1].classList.add('gray-ball');
    }
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
  resetRedBalls(); // Возвращаем все шары к красному цвету
  initializeGrid(); // Перезапускаем игровое поле
  updateScore(0); // Сбрасываем счет
}

restartButton.addEventListener('click', restartGame);
  
    // Функция для обмена двух ячеек местами
    function swapCells(cell1, cell2) {
      const tempValue = grid[cell1.row][cell1.col].value;
      grid[cell1.row][cell1.col].value = grid[cell2.row][cell2.col].value;
      grid[cell2.row][cell2.col].value = tempValue;
  
      grid[cell1.row][cell1.col].selected = false;
      grid[cell2.row][cell2.col].selected = false;
  
      playSound('ball-swap-sound'); // Воспроизводим звук перетаскивания шаров
      renderBoard(); // Обновляем доску после обмена (важно для анимации)
  }
  
  
    // Функция для проверки на совпадения
    async function checkForMatches() {
      let matches = [];
  
      // Горизонтальные совпадения
      for (let row = 0; row < gridSize; row++) {
          for (let col = 0; col < gridSize - 2; col++) {
              if (
                  grid[row][col].value &&
                  grid[row][col].value === grid[row][col + 1].value &&
                  grid[row][col].value === grid[row][col + 2].value
              ) {
                  let matchLength = 3;
                  while (
                      col + matchLength < gridSize &&
                      grid[row][col].value === grid[row][col + matchLength].value
                  ) {
                      matchLength++;
                  }
                  for (let i = 0; i < matchLength; i++) {
                      matches.push({ row, col: col + i });
                  }
                  col += matchLength - 1;
              }
          }
      }
  
      // Вертикальные совпадения
      for (let col = 0; col < gridSize; col++) {
          for (let row = 0; row < gridSize - 2; row++) {
              if (
                  grid[row][col].value &&
                  grid[row][col].value === grid[row + 1][col].value &&
                  grid[row][col].value === grid[row + 2][col].value
              ) {
                  let matchLength = 3;
                  while (
                      row + matchLength < gridSize &&
                      grid[row][col].value === grid[row + matchLength][col].value
                  ) {
                      matchLength++;
                  }
                  for (let i = 0; i < matchLength; i++) {
                      matches.push({ row: row + i, col });
                  }
                  row += matchLength - 1;
              }
          }
      }
  
      if (matches.length > 0) {
          await removeMatches(matches); // Ожидаем завершения удаления совпадений
          return true; // Совпадения найдены, ход успешный
      } else {
          if (!hasPossibleMoves()) {
              endGame();
          }
          return false; // Совпадений нет, ход неудачный
      }
  }
  
    // Функция для очистки класса шара
    function clearBallClass(cellElement) {
      for (let i = 1; i <= 5; i++) {
        cellElement.classList.remove(`ball-${i}`);
      }
    }
  
    // Функция для удаления совпадений
    async function removeMatches(matches) {
      let removedCount = matches.length;
      matches.forEach(match => {
        const cellElement = document.querySelector(`.board .cell[data-row="${match.row}"][data-col="${match.col}"]`);
    
        // Добавляем класс "explosion" для анимации взрыва
        cellElement.classList.add('explosion');
    
        // Удаляем класс шара
        clearBallClass(cellElement);
    
        // Обнуляем значение в сетке
        grid[match.row][match.col].value = null;
      });
    
      // Не вызываем renderBoard здесь, чтобы не перезаписать explosion
      playSound('ball-remove-sound');
      await new Promise(resolve => setTimeout(resolve, 500)); // Ждем окончания анимации взрыва
    
      let newScore = calculateScore(removedCount);
      updateScore(score + newScore);
    
      applyGravity(); // applyGravity вызовет renderBoard после завершения анимации
    }
  
    // Функция для применения "гравитации" (сдвига шариков вниз)
    function applyGravity() {
      for (let col = 0; col < gridSize; col++) {
        let emptyRow = gridSize - 1;
        for (let row = gridSize - 1; row >= 0; row--) {
          if (grid[row][col].value !== null) {
            // Если ячейка не пустая, перемещаем ее вниз
            grid[emptyRow][col].value = grid[row][col].value;
            if (row !== emptyRow) {
              grid[row][col].value = null; // Опустошаем старую ячейку
            }
            emptyRow--;
          }
        }
  
        // Заполняем верхние ячейки новыми случайными значениями
        for (let row = 0; row <= emptyRow; row++) {
          grid[row][col].value = Math.floor(Math.random() * 5) + 1;
        }
      }
  
      // Обновляем классы шаров в DOM после перемещения
      const cellElements = document.querySelectorAll('.board .cell');
      cellElements.forEach(cellElement => {
        const row = parseInt(cellElement.dataset.row);
        const col = parseInt(cellElement.dataset.col);
        clearBallClass(cellElement);  // Сначала удаляем старый класс
        cellElement.classList.add(`ball-${grid[row][col].value}`); // Добавляем новый класс
      });
  
      checkForMatches(); // Проверяем, образовались ли новые совпадения
    }
  
    // Функция для подсчета очков
    function calculateScore(removedCount) {
      let scorePerBall = 10;
      if (removedCount === 4) scorePerBall = 20;
      if (removedCount === 5) scorePerBall = 30;
      if (removedCount > 5) scorePerBall = 10 + (removedCount - 3) * 10;
  
      return removedCount * scorePerBall;
    }
  
    // Функция для проверки, есть ли доступные ходы
    function hasPossibleMoves() {
      for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
          // Проверяем возможность хода вправо
          if (col < gridSize - 1 && grid[row][col].value) {
            // Меняем местами текущую ячейку и правую
            let temp = grid[row][col].value;
            grid[row][col].value = grid[row][col + 1].value;
            grid[row][col + 1].value = temp;
  
            // Проверяем, образовалась ли комбинация
            if (checkMoveResultedInMatch(row, col) || checkMoveResultedInMatch(row, col + 1)) {
              // Возвращаем ячейки в исходное состояние
              temp = grid[row][col].value;
              grid[row][col].value = grid[row][col + 1].value;
              grid[row][col + 1].value = temp;
              return true; // Ход возможен
            }
  
            // Возвращаем ячейки в исходное состояние
            temp = grid[row][col].value;
            grid[row][col].value = grid[row][col + 1].value;
            grid[row][col + 1].value = temp;
          }
  
          // Проверяем возможность хода вниз
          if (row < gridSize - 1 && grid[row][col].value) {
            // Меняем местами текущую ячейку и нижнюю
            let temp = grid[row][col].value;
            grid[row][col].value = grid[row + 1][col].value;
            grid[row + 1][col].value = temp;
  
            // Проверяем, образовалась ли комбинация
            if (checkMoveResultedInMatch(row, col) || checkMoveResultedInMatch(row + 1, col)) {
              // Возвращаем ячейки в исходное состояние
              temp = grid[row][col].value;
              grid[row][col].value = grid[row + 1][col].value;
              grid[row + 1][col].value = temp;
              return true; // Ход возможен
            }
  
            // Возвращаем ячейки в исходное состояние
            temp = grid[row][col].value;
            grid[row][col].value = grid[row + 1][col].value;
            grid[row + 1][col].value = temp;
          }
        }
      }
  
      return false; // Ходов нет
    }
  
    // Вспомогательная функция для проверки, образовалась ли комбинация после хода
    function checkMoveResultedInMatch(row, col) {
      // Проверяем горизонталь
      let count = 1;
      let startCol = col;
      while (startCol > 0 && grid[row][startCol].value === grid[row][startCol - 1].value) {
        count++;
        startCol--;
      }
      let endCol = col;
      while (endCol < gridSize - 1 && grid[row][endCol].value === grid[row][endCol + 1].value) {
        count++;
        endCol++;
      }
      if (count >= 3) return true;
  
      // Проверяем вертикаль
      count = 1;
      let startRow = row;
      while (startRow > 0 && grid[startRow][col].value === grid[startRow - 1][col].value) {
        count++;
        startRow--;
      }
      let endRow = row;
      while (endRow < gridSize - 1 && grid[endRow][col].value === grid[endRow + 1][col].value) {
        count++;
        endRow++;
      }
      if (count >= 3) return true;
  
      return false;
    }
  
    // Функция для завершения игры
    function endGame() {
      finalScoreElement.textContent = score;
      gameOverContainer.style.display = 'flex';
  
      // Сбрасываем очки при завершении игры
      localStorage.setItem('score', 0);
    }
  
    // Функция для обновления счета
    function updateScore(newScore) {
      score = newScore;
      scoreElement.textContent = score;
      localStorage.setItem('score', score); // Сохраняем очки в localStorage
    }
  
    // Функция для переключения темы
    const toggleTheme = () => {
      playSound('button-click-sound'); // Воспроизводим звук клика
      body.classList.toggle('dark-theme');
      container.classList.toggle('dark-theme');
      currentTheme = body.classList.contains('dark-theme') ? 'dark' : 'light';
      localStorage.setItem('theme', currentTheme);
  
      const cells = document.querySelectorAll('.cell');
      cells.forEach(cell => {
        if (currentTheme === 'dark') {
          cell.classList.add('dark-theme');
        } else {
          cell.classList.remove('dark-theme');
        }
      });
    };
  
    // Функция для переключения фона
    const toggleBackgroundFunc = () => {
      playSound('button-click-sound'); // Воспроизводим звук клика
      container.classList.toggle('no-background');
      backgroundVisible = !container.classList.contains('no-background');
      localStorage.setItem('backgroundVisible', backgroundVisible);
      toggleBackground();
    };
  
    // Функция для переключения звука
    const toggleSound = () => {
      playSound('button-click-sound'); // Воспроизводим звук клика
      soundEnabled = !soundEnabled;
      localStorage.setItem('soundEnabled', soundEnabled);
      updateSoundButtonText();
    };
  
  
    // Функция для воспроизведения звука
    function playSound(soundId) {
      if (soundEnabled) {
        const sound = document.getElementById(soundId);
        sound.currentTime = 0; // Перематываем звук в начало
        sound.play();
      }
    }
  
    // Функция для перезапуска игры
    const restartTheGame = () => {
      playSound('button-click-sound'); // Воспроизводим звук клика
      gameOverContainer.style.display = 'none';
      initializeGrid();
      updateScore(0); // Сбрасываем очки
      localStorage.setItem('score', 0);
    };
  
    // При нажатии на кнопку "Играть снова" сбрасываем очки
    restartButton.addEventListener('click', restartTheGame);
  
    // Обработчики событий для десктопа
    themeButton.addEventListener('click', toggleTheme);
    toggleBackgroundButton.addEventListener('click', toggleBackgroundFunc);
    soundButton.addEventListener('click', toggleSound);
  
    // Обработчики событий для мобильных
    themeButtonMobile.addEventListener('click', toggleTheme);
    toggleBackgroundButtonMobile.addEventListener('click', toggleBackgroundFunc);
    soundButtonMobile.addEventListener('click', toggleSound);
    restartButtonMobile.addEventListener('click', restartTheGame);
  
  
    // Инициализация игры
    initializeGrid();
  });
