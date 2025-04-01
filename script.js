document.addEventListener('DOMContentLoaded', () => {
  
  generateRandomName()
  .then(users => {
    console.log("Список пользователей:", users);
    // Здесь можно работать с полученным списком
  })
  .catch(error => {
    console.error("Ошибка получения списка пользователей:", error);
  });
  const boardElement = document.querySelector('.board');
  const scoreElement = document.getElementById('score');
  const leaderboardBody = document.getElementById('leaderboard-body');
  
  // Получаем элементы кнопок для десктопа
  const themeButton = document.getElementById('theme-button');
  const toggleBackgroundButton = document.getElementById('toggle-background-button');
  const soundButton = document.getElementById('sound-button');
  const restartButton = document.getElementById('restart-button');
  
  // Получаем элементы кнопок для мобильных
  const themeButtonMobile = document.getElementById('theme-button-mobile');
  const toggleBackgroundButtonMobile = document.getElementById('toggle-background-button-mobile');
  const soundButtonMobile = document.getElementById('sound-button-mobile');
  
  const gameOverContainer = document.querySelector('.game-over-container');
  const finalScoreElement = document.getElementById('final-score');
  
  // Жизни игрока
  const redBallsContainer = document.querySelector('.red-balls-container');
  const redBalls = document.querySelectorAll('.red-ball');
  
  const leaderboardButtonMobile = document.getElementById('leaderboard-button-mobile');
  const leaderboardModal = document.querySelector('.leaderboard-modal');
  const closeLeaderboard = document.querySelector('.close-leaderboard');
  const leaderboardBodyMobile = document.getElementById('leaderboard-body-mobile');
  
  let moveCount = 0;
  
  // Загружаем таблицу лидеров из localStorage при загрузке страницы
  let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
  renderLeaderboard(leaderboard);
  
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
    //Сбрасываем жизни
    moveCount = 0;
    resetRedBalls();
  
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
    // Отрисовываем таблицу лидеров при инициализации игры
    let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
  
    // Генерируем записи, только если таблица пуста
if (leaderboard.length === 0) {
  console.log('No leaderboar')
  generateRandomName()
    .then(users => {
      // Используем полученный список пользователей для генерации записей
      for (let i = 0; i < Math.min(users.length, 7); i++) {
        const name = users[i].username;
        const score = users[i].score;
        leaderboard.push({ name: name, score: score });
      }

      // Сохраняем случайные записи в localStorage
      localStorage.setItem('leaderboard', JSON.stringify(leaderboard));

      // Сортируем таблицу лидеров
      leaderboard.sort((a, b) => b.score - a.score);

      // Отрисовываем таблицу лидеров при инициализации игры
      renderLeaderboard(leaderboard);
    })
    .catch(error => {
      console.error("Ошибка получения списка пользователей:", error);
    });
} else {
  // Если таблица лидеров уже есть, просто сортируем и отображаем
  leaderboard.sort((a, b) => b.score - a.score);
  renderLeaderboard(leaderboard);
}}
// Revised code:
// Function to render the game board in the DOM
function renderBoard() {
  boardElement.innerHTML = ''; // Clear the board
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.row = row;
      cell.dataset.col = col;

      // Add class for the ball
      cell.classList.add(`ball-${grid[row][col].value}`);

      if (grid[row][col].selected) {
        cell.classList.add('selected');
      }

      if (currentTheme === 'dark') {
        cell.classList.add('dark-theme');
      }

      cell.addEventListener('click', handleCellClick);
      boardElement.appendChild(cell);
    }
  }
}

// Function to handle cell click
async function handleCellClick(event) {
  const row = parseInt(event.target.dataset.row);
  const col = parseInt(event.target.dataset.col);

  if (selectedCell === null) {
    // First click
    selectedCell = { row, col };
    grid[row][col].selected = true;
    playSound('ball-select-sound');
  } else {
    // Second click
    const firstCell = selectedCell;
    selectedCell = null;

    // Check for adjacency
    const isAdjacent =
      (Math.abs(row - firstCell.row) === 1 && col === firstCell.col) ||
      (Math.abs(col - firstCell.col) === 1 && row === firstCell.row);

    if (isAdjacent) {
      // Swap the cells
      swapCells(firstCell, { row, col });

      // Check if the move was successful (resulted in ball removal)
      const hasMatches = await checkForMatches();

      if (!hasMatches) {
        moveCount++;
        updateRedBalls();
      } else {
        // moveCount = 0;
        // resetRedBalls();
      }

      if (moveCount >= redBalls.length) {
        endGame();
      }
    } else {
      // Click on a distant cell - just select it
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
    // Change the ball color to gray
    redBalls[moveCount - 1].classList.remove('red-ball');
    redBalls[moveCount - 1].classList.add('gray-ball');
  }

  // If all balls have turned gray, reset the counter
  if (moveCount > redBalls.length) {
    moveCount = 0;
    resetRedBalls();
  }
}

// Function to swap two cells
async function swapCells(cell1, cell2) {
  const tempValue = grid[cell1.row][cell1.col].value;
  grid[cell1.row][cell1.col].value = grid[cell2.row][cell2.col].value;
  grid[cell2.row][cell2.col].value = tempValue;

  grid[cell1.row][cell1.col].selected = false;
  grid[cell2.row][cell2.col].selected = false;

  playSound('ball-swap-sound');
  renderBoard();
}

// Function to reset the ball color
function resetRedBalls() {
  redBalls.forEach(ball => {
    ball.classList.remove('gray-ball');
    ball.classList.add('red-ball');
  });
}

// Function to restart the game
function restartGame() {
  gameOverContainer.style.display = 'none'; // Hide the notification
  moveCount = 0; // Reset the unsuccessful move counter
  resetRedBalls(); // Reset all balls to red color
  initializeGrid(); // Restart the game board
  updateScore(0); // Reset the score
}

restartButton.addEventListener('click', restartGame);

async function checkForMatches() {
  let matches = [];

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
    await removeMatches(matches);
    console.log("checkForMatches: Найдено совпадение, возвращаем true");
    return true;
  } else {
    console.log("checkForMatches: Совпадений не найдено, возвращаем false");
    if (!hasPossibleMoves()) {
      endGame();
    }
    return false;
  }
}

function clearBallClass(cellElement) {
  for (let i = 1; i <= 5; i++) {
    cellElement.classList.remove(`ball-${i}`);
  }
}

async function removeMatches(matches) {
  let removedCount = matches.length;
  matches.forEach(match => {
    const cellElement = document.querySelector(`.board .cell[data-row="${match.row}"][data-col="${match.col}"]`);

    if (cellElement) {
      cellElement.classList.add('explosion');
      clearBallClass(cellElement);
      grid[match.row][match.col].value = null;
    }
  });

  playSound('ball-remove-sound');
  await new Promise(resolve => setTimeout(resolve, 500));

  matches.forEach(match => {
    const cellElement = document.querySelector(`.board .cell[data-row="${match.row}"][data-col="${match.col}"]`);
    if (cellElement) {
        cellElement.classList.remove('explosion');
    }
  });

  renderBoard();

  let newScore = calculateScore(removedCount);
  updateScore(score + newScore);

  await applyGravity();
}

async function applyGravity() {
  for (let col = 0; col < gridSize; col++) {
    let emptyRow = gridSize - 1;
    for (let row = gridSize - 1; row >= 0; row--) {
      if (grid[row][col].value !== null) {
        grid[emptyRow][col].value = grid[row][col].value;
        if (row !== emptyRow) {
          grid[row][col].value = null;
        }
        emptyRow--;
      }
    }

    for (let row = 0; row <= emptyRow; row++) {
      grid[row][col].value = Math.floor(Math.random() * 5) + 1;
    }
  }

  const cellElements = document.querySelectorAll('.board .cell');
  cellElements.forEach(cellElement => {
    const row = parseInt(cellElement.dataset.row);
    const col = parseInt(cellElement.dataset.col);
    clearBallClass(cellElement);
    cellElement.classList.add(`ball-${grid[row][col].value}`);
  });

  let newMatches = [];
  for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
          if (grid[row][col].value !== null) {
              let matchLength = 1;
              while (col + matchLength < gridSize && grid[row][col].value === grid[row][col + matchLength].value) {
                  matchLength++;
              }
              if (matchLength >= 3) {
                  for (let i = 0; i < matchLength; i++) {
                      newMatches.push({ row, col: col + i });
                  }
              }
              col += matchLength - 1;

              matchLength = 1;
              while (row + matchLength < gridSize && grid[row][col].value === grid[row + matchLength][col].value) {
                  matchLength++;
              }
              if (matchLength >= 3) {
                  for (let i = 0; i < matchLength; i++) {
                      newMatches.push({ row: row + i, col });
                  }
              }
          }
      }
  }

  if (newMatches.length > 0) {
      await removeMatches(newMatches);
  }
}

function calculateScore(removedCount) {
  let scorePerBall = 10;
  if (removedCount === 4) scorePerBall = 20;
  if (removedCount === 5) scorePerBall = 30;
  if (removedCount > 5) scorePerBall = 10 + (removedCount - 3) * 10;

  return removedCount * scorePerBall;
}
  
   // Revised code:

// Function to check if there are possible moves
function hasPossibleMoves() {
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      if (col < gridSize - 1 && grid[row][col].value) {
        [grid[row][col].value, grid[row][col + 1].value] = [grid[row][col + 1].value, grid[row][col].value];
        if (checkMoveResultedInMatch(row, col) || checkMoveResultedInMatch(row, col + 1)) {
          [grid[row][col].value, grid[row][col + 1].value] = [grid[row][col + 1].value, grid[row][col].value];
          return true;
        }
        [grid[row][col].value, grid[row][col + 1].value] = [grid[row][col + 1].value, grid[row][col].value];
      }
      if (row < gridSize - 1 && grid[row][col].value) {
        [grid[row][col].value, grid[row + 1][col].value] = [grid[row + 1][col].value, grid[row][col].value];
        if (checkMoveResultedInMatch(row, col) || checkMoveResultedInMatch(row + 1, col)) {
          [grid[row][col].value, grid[row + 1][col].value] = [grid[row + 1][col].value, grid[row][col].value];
          return true;
        }
        [grid[row][col].value, grid[row + 1][col].value] = [grid[row + 1][col].value, grid[row][col].value];
      }
    }
  }
  return false;
}

// Helper function to check if a move resulted in a match
function checkMoveResultedInMatch(row, col) {
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

// Function to end the game
function endGame() {
  finalScoreElement.textContent = score;
  gameOverContainer.style.display = 'flex';
  localStorage.setItem('score', 0);
    console.log("Функция endGame вызвана");
    console.log("Перед вызовом updateUserScore");
    updateUserScore()
      .then(response => {
        console.log("Ответ от сервера:", response);
      })
      .catch(error => {
        console.error("Ошибка при отправке данных:", error);
      });
    gameOverContainer.style.display = 'flex'; // Show the notification
}

function updateLeaderboard(leaderboard, playerName, score) {
  leaderboard.sort((a, b) => b.score - a.score);
  let playerIndex = leaderboard.findIndex(entry => entry.name === playerName);
  if (playerIndex !== -1) {
    leaderboard[playerIndex].score = score;
    while (playerIndex > 0 && leaderboard[playerIndex].score > leaderboard[playerIndex - 1].score) {
      [leaderboard[playerIndex], leaderboard[playerIndex - 1]] = [leaderboard[playerIndex - 1], leaderboard[playerIndex]];
      playerIndex--;
    }
  } else {
    if (leaderboard.length < 7) {
      leaderboard.push({ name: playerName, score: score });
    } else if (score < leaderboard[leaderboard.length - 1].score) {
      leaderboard[leaderboard.length - 1] = { name: playerName, score: score };
    }
  }
  leaderboard.sort((a, b) => b.score - a.score);
  if (leaderboard.length > 7) {
    leaderboard.length = 7;
  }
}

function renderLeaderboard(leaderboard) {
  const leaderboardBody = document.getElementById('leaderboard-body');
  leaderboardBody.innerHTML = '';
  for (let i = 0; i < leaderboard.length; i++) {
    const entry = leaderboard[i];
    const row = createLeaderboardEntry(i + 1, entry.name, entry.score);
    leaderboardBody.appendChild(row);
  }
  if (leaderboardModal.style.display === 'block') {
    renderLeaderboardMobile(leaderboard);
  }
}

function createLeaderboardEntry(rank, name, score) {
  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${rank}</td>
    <td>${name}</td>
    <td>${score}</td>
  `;
  return row;
}

function updateScore(newScore) {
  score = newScore;
  scoreElement.textContent = score;
  localStorage.setItem('score', score);

  let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
  let playerName = localStorage.getItem('playerName');

  if (!playerName) {
    playerName = prompt("Please enter your name:");
    localStorage.setItem('playerName', playerName);
  }

  // Получаем или создаем объект для хранения данных игроков
  let playerDataDict = JSON.parse(localStorage.getItem('playerDataDict')) || {};

  // Обновляем или добавляем запись для текущего игрока
  playerDataDict[playerName] = score;

  // Сохраняем обновленный словарь в localStorage
  localStorage.setItem('playerDataDict', JSON.stringify(playerDataDict));

  updateLeaderboard(leaderboard, playerName, score);
  localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
  renderLeaderboard(leaderboard);
}

function renderLeaderboardMobile(leaderboard) {
  leaderboardBodyMobile.innerHTML = '';
  for (let i = 0; i < leaderboard.length; i++) {
    const entry = leaderboard[i];
    const row = createLeaderboardEntry(i + 1, entry.name, entry.score);
    leaderboardBodyMobile.appendChild(row);
  }
}

const toggleTheme = () => {
  playSound('button-click-sound');
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

const toggleBackgroundFunc = () => {
  playSound('button-click-sound');
  container.classList.toggle('no-background');
  backgroundVisible = !container.classList.contains('no-background');
  localStorage.setItem('backgroundVisible', backgroundVisible);
  toggleBackground();
};

const toggleSound = () => {
  playSound('button-click-sound');
  soundEnabled = !soundEnabled;
  localStorage.setItem('soundEnabled', soundEnabled);
  updateSoundButtonText();
};

function playSound(soundId) {
  if (soundEnabled) {
    const sound = document.getElementById(soundId);
    sound.currentTime = 0;
    sound.play();
  }
}

const restartTheGame = () => {
  playSound('button-click-sound');
  gameOverContainer.style.display = 'none';
  initializeGrid();
  updateScore(0);
  localStorage.setItem('score', 0);
};

restartButton.addEventListener('click', restartTheGame);
themeButton.addEventListener('click', toggleTheme);
toggleBackgroundButton.addEventListener('click', toggleBackgroundFunc);
soundButton.addEventListener('click', toggleSound);
themeButtonMobile.addEventListener('click', toggleTheme);
toggleBackgroundButtonMobile.addEventListener('click', toggleBackgroundFunc);
soundButtonMobile.addEventListener('click', toggleSound);
leaderboardButtonMobile.addEventListener('click', () => {
  playSound('button-click-sound');
  leaderboardModal.style.display = 'block';
  renderLeaderboardMobile(leaderboard);
});
closeLeaderboard.addEventListener('click', () => {
  playSound('button-click-sound');
  leaderboardModal.style.display = 'none';
});

function generateRandomName() {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "http://127.0.0.1:8000/users"); // URL для получения списка пользователей
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const users = JSON.parse(xhr.responseText); // Парсим ответ в JSON
          resolve(users); // Возвращаем список пользователей
        } catch (error) {
          reject({
            status: xhr.status,
            statusText: "Ошибка парсинга JSON",
            responseText: xhr.responseText,
          });
        }
      } else {
        reject({
          status: xhr.status,
          statusText: xhr.statusText,
          responseText: xhr.responseText,
        });
      }
    };

    xhr.onerror = function () {
      reject({
        status: xhr.status,
        statusText: xhr.statusText,
        responseText: xhr.responseText,
      });
    };

    xhr.send(); // Отправляем запрос
  });
}


function updateUserScore() {
  return new Promise((resolve, reject) => {
    const playerDataDict = JSON.parse(localStorage.getItem('playerDataDict')) || {};

    if (Object.keys(playerDataDict).length === 0) {
      console.error("Нет данных для отправки на сервер.");
      reject("Нет данных для отправки на сервер.");
      return;
    }

    console.log("Отправляемые данные:", playerDataDict);

    const xhr = new XMLHttpRequest();
    xhr.open("PUT", "http://127.0.0.1:8000/users");
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        console.log("Данные успешно отправлены на сервер:", xhr.responseText);
        resolve(JSON.parse(xhr.responseText));
      } else {
        console.error("Ошибка при отправке данных на сервер:", xhr.responseText);
        reject({
          status: xhr.status,
          statusText: xhr.statusText,
          responseText: xhr.responseText,
        });
      }
    };

    xhr.onerror = function () {
      console.error("Ошибка сети при отправке данных на сервер.");
      reject({
        status: xhr.status,
        statusText: xhr.statusText,
        responseText: xhr.responseText,
      });
    };

    console.log(JSON.stringify(playerDataDict));
    xhr.send(JSON.stringify(playerDataDict));
  });
}

// Функция для получения списка пользователей (GET запрос)
function getUsers() {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "/users");  // Замените "/users" на URL вашего GET эндпоинта
    xhr.setRequestHeader("Content-Type", "application/json"); // необязательно для GET

    xhr.onload = function() {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject({
          status: xhr.status,
          statusText: xhr.statusText,
          responseText: xhr.responseText
        });
      }
    };

    xhr.onerror = function() {
      reject({
        status: xhr.status,
        statusText: xhr.statusText,
        responseText: xhr.responseText
      });
    };

    xhr.send(); // Нет тела запроса для GET
  });
}



initializeGrid();
  });