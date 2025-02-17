document.addEventListener('DOMContentLoaded', () => {
    const boardElement = document.querySelector('.board');
    const scoreElement = document.getElementById('score');
    const themeButton = document.getElementById('theme-button');
    const soundButton = document.getElementById('sound-button');
    const gameOverContainer = document.querySelector('.game-over-container');
    const finalScoreElement = document.getElementById('final-score');
    const restartButton = document.getElementById('restart-button');
  
    const gridSize = 8; // Размер поля (8x8)
    let grid = [];
    let selectedCell = null;
    let score = 0;
    let soundEnabled = true;
  
    // Функция для инициализации игрового поля
    function initializeGrid() {
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
      renderBoard();
    }
  
    // Функция для отрисовки игрового поля в DOM
    function renderBoard() {
      boardElement.innerHTML = ''; // Очищаем поле
      for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
          const cell = document.createElement('div');
          cell.classList.add('cell');
          cell.textContent = grid[row][col].value; // Отображаем значение шарика (можно заменить на картинки)
          cell.dataset.row = row;
          cell.dataset.col = col;
  
          if (grid[row][col].selected) {
            cell.classList.add('selected');
          }
  
          cell.addEventListener('click', handleCellClick);
          boardElement.appendChild(cell);
        }
      }
    }
  
    // Функция для обработки клика по ячейке
    function handleCellClick(event) {
      const row = parseInt(event.target.dataset.row);
      const col = parseInt(event.target.dataset.col);
  
      if (selectedCell === null) {
        // Первый клик
        selectedCell = { row, col };
        grid[row][col].selected = true;
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
        } else {
          // Клик на отдаленную ячейку - просто выбираем ее
          grid[firstCell.row][firstCell.col].selected = false;
          grid[row][col].selected = true;
          selectedCell = { row, col };
        }
      }
  
      renderBoard();
    }
  
    // Функция для обмена двух ячеек местами
    function swapCells(cell1, cell2) {
      const tempValue = grid[cell1.row][cell1.col].value;
      grid[cell1.row][cell1.col].value = grid[cell2.row][cell2.col].value;
      grid[cell2.row][cell2.col].value = tempValue;
  
      grid[cell1.row][cell1.col].selected = false;
      grid[cell2.row][cell2.col].selected = false;
  
      renderBoard(); // Обновляем доску после обмена (важно для анимации)
      checkForMatches();
    }
  
    // Функция для проверки на совпадения
    function checkForMatches() {
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
        removeMatches(matches);
      } else {
        if (!hasPossibleMoves()) {
          endGame();
        }
      }
    }
  
    // Функция для удаления совпадений
    async function removeMatches(matches) {
      let removedCount = matches.length;
      matches.forEach(match => {
        grid[match.row][match.col].value = null;
        const cellElement = document.querySelector(`.board .cell[data-row="${match.row}"][data-col="${match.col}"]`);
        cellElement.classList.add('to-remove');
      });
  
      renderBoard(); // Обновляем доску, чтобы применить класс to-remove
  
      await new Promise(resolve => setTimeout(resolve, 300)); // Ждем окончания анимации
  
      let newScore = calculateScore(removedCount);
      updateScore(score + newScore);
  
      applyGravity();
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
  
      renderBoard();
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
    }
  
    // Функция для обновления счета
    function updateScore(newScore) {
      score = newScore;
      scoreElement.textContent = score;
    }
  
    // Обработчик кнопки смены темы (TODO)
    themeButton.addEventListener('click', () => {
      // TODO: Реализовать смену темы
    });
  
    // Обработчик кнопки включения/выключения звука (TODO)
    soundButton.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      soundButton.textContent = `Звук: ${soundEnabled ? 'Вкл' : 'Выкл'}`;
      // TODO: Сохранять состояние звука в localStorage
    });
  
    // Обработчик кнопки "Играть снова"
    restartButton.addEventListener('click', () => {
      gameOverContainer.style.display = 'none';
      initializeGrid();
      updateScore(0);
    });
  
    // Инициализация игры
    initializeGrid();
  });