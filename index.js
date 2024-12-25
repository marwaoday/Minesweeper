// Define the game grid and variables
let grid = []; // Represents the board of cells
const boardSize = 10; // Number of rows and columns
const totalBombs = 20; // Total bombs on the board
let flagged = 0; // Number of flagged cells
let timer = 0; // Timer in seconds
let gameInterval; // Holds the timer interval
let gameStarted = false; // Tracks if the game has started
let gameOver = false; // Tracks if the game is over

// Elements
const gameBoard = document.getElementById("game-board");
const flagCountElement = document.getElementById("flag-count");
const timerElement = document.getElementById("timer");
const resetButton = document.getElementById("reset-button");
const instructionsButton = document.getElementById("instructions-button");
const instructionsModal = document.getElementById("instructions-modal");
const closeModal = document.getElementById("close-modal");

// Open the instructions modal when the "Instructions" button is clicked
instructionsButton.addEventListener("click", () => {
  instructionsModal.style.display = "block";
});

// Close the modal when the "x" is clicked
closeModal.addEventListener("click", () => {
  instructionsModal.style.display = "none";
});

// Close the modal if the user clicks anywhere outside of the modal
window.addEventListener("click", (event) => {
  if (event.target === instructionsModal) {
    instructionsModal.style.display = "none";
  }
});

// Start a new game
function startNewGame() {
  clearInterval(gameInterval); // Stop the timer
  gameOver = false; // Reset game state
  gameStarted = false; // Reset start state
  flagged = 0; // Reset flagged count
  timer = 0; // Reset timer
  timerElement.textContent = "00:00"; // Reset timer display
  flagCountElement.textContent = flagged; // Reset flag count display
  winnerMessage.style.display = "none"; // Hide winner message
  createBoard(); // Create a new game board
}

// Create the new game board
function createBoard() {
  grid = []; // Clear the grid
  gameBoard.innerHTML = ""; // Clear the board container

  for (let row = 0; row < boardSize; row++) {
    const rowArray = [];
    for (let column = 0; column < boardSize; column++) {
      const box = document.createElement("div"); // Create a cell
      box.classList.add("box"); // Add CSS class for styling
      box.dataset.row = row; // Store row in data attribute
      // console.log("row", row);, 10 x 10
      box.dataset.column = column; // Store column in data attribute
      // console.log("column", column); 10 x 10

      // Add left-click and right-click event listeners
      box.addEventListener("click", handleLeftClick);
      box.addEventListener("contextmenu", handleRightClick); // distinct event in JavaScript for the right mouse button

      gameBoard.appendChild(box); // Add the cell to the board

      rowArray.push({
        element: box, //storing box reference in the DOM element property of the object, class="box", makes it easier to access that cell later.
        bomb: false, // Tracks if the cell has a bomb
        revealed: false, // Tracks if the cell is revealed
        flagged: false, // Tracks if the cell is flagged
        adjacentBombs: 0, // Tracks number of adjacent bombs
      });
    }
    grid.push(rowArray); // Add row to grid
  }
  placeBombs(); // Place bombs randomly on the board
  calculateAdjacentBombs(); // Calculate adjacent bomb counts for each cell
}

// Place bombs randomly on the board
function placeBombs() {
  let bombsPlaced = 0; // Counter for bombs placed
  while (bombsPlaced < totalBombs) {
    //use while to loop continuously repeat placing bombs until totalBombs number of bombs are placed
    // totalBombs set to 20
    const row = Math.floor(Math.random() * boardSize); // Random row
    const column = Math.floor(Math.random() * boardSize); // Random column

    if (!grid[row][column].bomb) {
      //cghecking if the box cell doesn't already have a bomb
      grid[row][column].bomb = true; // Place bomb
      bombsPlaced++; // Increment bomb counter
    }
  }
}

// Calculate the number of adjacent bombs for each cell
function calculateAdjacentBombs() {
  for (let row = 0; row < boardSize; row++) {
    for (let column = 0; column < boardSize; column++) {
      if (grid[row][column].bomb) continue; // Skip cells with bombs

      let adjacentBombs = 0; // Counter for adjacent bombs

      // Loop through surrounding cells
      for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
        for (let columnOffset = -1; columnOffset <= 1; columnOffset++) {
          const newRow = row + rowOffset; // row can be +1 row above, 0 current row or -1 row below
          const newColumn = column + columnOffset; //column can be +1 column to the riught, 0 current column, -1 column to the left
          if (
            newRow >= 0 && // checking for VALID rows,
            newRow < boardSize && // checks if row is between 0 and 10, stop from trying row numbers below 0 and above 10
            // boardSize is 10, so it will test up to 9
            newColumn >= 0 && //checking for VALID columns,
            newColumn < boardSize && // checks if column is between 0 and 10, dont want negative column number or column number above 10
            //then if the cell is a valid row number and valid cell number, we can check if it has a bomb in it
            grid[newRow][newColumn].bomb // check if the bomb cell accessed with the bomb property is set to true
          ) {
            adjacentBombs++;
            //so after checking all 8 cells around the current cell we checking, except the edge cells where it will only check 5,
            //and the corner cells where it will only check 3
            //then it will increment the number of bombs located near that specific cell
          }
        }
      }
      grid[row][column].adjacentBombs = adjacentBombs;
      // then it will add the number of bombs located around that cell to the adjacentBombs property
    }
  }
}

// Handle left-click to reveal a box cell
function handleLeftClick(event) {
  if (gameOver) return; // so if the game is oiver, cell is a bomb, the user can't click the cells anymore.

  const box = event.target; // box will now represent the clicked cell
  const row = parseInt(box.dataset.row); //all attribute values in HTML are treated as strings, including data-* attributes,
  const column = parseInt(box.dataset.column); //so thats why we have to parse it back to a number/integer

  // Don't reveal flagged cells
  if (grid[row][column].flagged) return; // Skip flagged cells

  if (!gameStarted) {
    gameStarted = true; // Mark the game as started
    startGameTimer(); // Start the timer when the first box cell is clicked
  }

  if (grid[row][column].bomb) {
    // If cell contains a bomb
    box.classList.add("bomb", "fizzling");
    setTimeout(() => {
      // After fizzling confetti, explode the bomb
      box.classList.remove("fizzling");
      box.classList.add("exploded");
      triggerConfetti(box);
    }, 2000); // Fizzling for 2 seconds before exploding
    gameOver = true;
    clearInterval(gameInterval); // Stop the timer
    revealAllBombs(); // Reveal all bombs
  } else {
    revealCell(row, column);
  }
  checkForWinner(); // Check if the player has won
}
// Trigger confetti effect
function triggerConfetti(box) {
  for (let i = 0; i < 20; i++) {
    // Create 20 confetti pieces
    const confettiPiece = document.createElement("div");
    confettiPiece.classList.add("confetti");
    box.appendChild(confettiPiece);
    // Randomly position each confetti piece
    confettiPiece.style.left = `${Math.random() * 50}px`; // Randomize position
    confettiPiece.style.top = `${Math.random() * 50}px`; // Randomize position
  }
}

// Reveal all bombs and apply fizzling/explosion effects one by one (Domino Effect)
function revealAllBombs() {
  let delay = 0; // Initial delay for animation

  for (let row = 0; row < boardSize; row++) {
    for (let column = 0; column < boardSize; column++) {
      if (grid[row][column].bomb && !grid[row][column].revealed) {
        const box = grid[row][column].element;
        setTimeout(() => {
          box.classList.add("bomb", "fizzling"); // Start fizzing

          setTimeout(() => {
            box.classList.remove("fizzling");
            box.classList.add("exploded"); // After fizzling, explode css styles
            triggerConfetti(box); // Add confetti to the relevant exploded bombs
          }, 1000); // 2 seconds for fizzling before explosion
        }, delay);
        delay += 250; // Delay the explosion of each bomb by 0.5 seconds for the domino down effect
      }
    }
  }
}

// Reveal the cell and adjacent cells if no bombs are around
function revealCell(row, column) {
  if (grid[row][column].revealed) return; // Skip if already revealed
  const box = grid[row][column].element;
  grid[row][column].revealed = true;
  box.classList.add("revealed");

  if (grid[row][column].adjacentBombs > 0) {
    // Display adjacent bomb count
    box.textContent = grid[row][column].adjacentBombs;
    box.classList.add(`number-${grid[row][column].adjacentBombs}`);
  } else {
    // Reveal surrounding cells if no adjacent bombs
    for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
      for (let columnOffset = -1; columnOffset <= 1; columnOffset++) {
        const newRow = row + rowOffset;
        const newColumn = column + columnOffset;
        if (
          newRow >= 0 &&
          newRow < boardSize &&
          newColumn >= 0 &&
          newColumn < boardSize &&
          !grid[newRow][newColumn].revealed
        ) {
          revealCell(newRow, newColumn);
        }
      }
    }
  }
}

// Handle right-click to flag a cell
function handleRightClick(event) {
  event.preventDefault(); // Prevent default context menu
  //so in the grid the default right click behaviour of the browser's
  //context menu doesn't show and we can reassign it to the flag
  if (gameOver) return;

  const box = event.target;
  const row = parseInt(box.dataset.row);
  const column = parseInt(box.dataset.column);

  if (grid[row][column].revealed) return; // Skip revealed cells

  if (grid[row][column].flagged) {
    // Unflag the cell
    grid[row][column].flagged = false;
    box.classList.remove("flagged");
    flagged--;
  } else {
    // Flag the cell if flags are available
    if (flagged < totalBombs) {
      grid[row][column].flagged = true;
      box.classList.add("flagged");
      flagged++;
    } else if (flagged === 20) {
      // Check if all 20 flags have been used
      flagCountElement.textContent = "All 20 flags have been used!";
      return;
    }
  }
  flagCountElement.textContent = flagged; // Update flagged count
}

// Check for win condition (all bombs flagged or all non-bombs revealed)
function checkForWinner() {
  let allBombsFlagged = true;
  let allNonBombsRevealed = true; // Revealed all non-bombs

  for (let row = 0; row < boardSize; row++) {
    for (let column = 0; column < boardSize; column++) {
      if (grid[row][column].bomb && !grid[row][column].flagged) {
        allBombsFlagged = false;
      }
      if (!grid[row][column].bomb && !grid[row][column].revealed) {
        allNonBombsRevealed = false;
      }
    }
  }

  // If all bombs are flagged or all non-bombs are revealed, player wins
  if (allBombsFlagged || allNonBombsRevealed) {
    displayWinner(); // Player wins
  }
}

// Display the winner message
function displayWinner() {
  winnerMessage.style.display = "block"; // Show winner message
  clearInterval(gameInterval); // Stops the current game timer
}

// Update the timer display
function updateTimer() {
  timer++; // Increment the timer by 1 second every time
  const minutes = Math.floor(timer / 60); // Calculating the minutes
  const remainingSeconds = timer % 60; // Calculating seconds
  timerElement.textContent = `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`; // Update the timer display
}
function startGameTimer() {
  gameInterval = setInterval(updateTimer, 1000); // Update the timer every second
}

// Reset the game when the reset button is clicked
resetButton.addEventListener("click", startNewGame);

// Initialize the game BOOYAH!
startNewGame();
