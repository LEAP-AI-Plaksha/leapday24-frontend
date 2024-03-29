let ctx;
let canvas;
let maze;
let mazeHeight;
let mazeWidth;
let player;
let image;
let debug = false;
let promptsTaken = 0;
let input;
let counter;
let myToken = "nMrYlyKC.SHxH1R6j1VJ5Ohlq19PB5sZGYIm4nlHA";

const SERVER_URL = "https://leapdayapi.thepjr.com";

class Player {
  constructor() {
    this.col = 0;
    this.row = 0;
  }
}

class MazeCell {
  constructor(col, row) {
    this.col = col;
    this.row = row;

    this.eastWall = true;
    this.northWall = true;
    this.southWall = true;
    this.westWall = true;

    this.visited = false;
  }
}

class Maze {
  constructor(cols, rows, cellSize) {
    this.backgroundColor = "#000";
    this.cols = cols;
    this.endColor = "#11AC7B";
    this.mazeColor = "#99BEFF";
    this.playerColor = "#880088";
    this.rows = rows;
    this.cellSize = cellSize;
    this.lineWidth = 5;

    this.cells = [];

    this.generate();
  }

  generate() {
    mazeHeight = this.rows * this.cellSize;
    mazeWidth = this.cols * this.cellSize;

    canvas.height = mazeHeight;
    canvas.width = mazeWidth;
    canvas.style.height = mazeHeight;
    canvas.style.width = mazeWidth;

    for (let col = 0; col < this.cols; col++) {
      this.cells[col] = [];
      for (let row = 0; row < this.rows; row++) {
        this.cells[col][row] = new MazeCell(col, row);
      }
    }

    let rndCol = Math.floor(Math.random() * this.cols);
    let rndRow = Math.floor(Math.random() * this.rows);

    let stack = [];
    stack.push(this.cells[rndCol][rndRow]);

    let currCell;
    let dir;
    let foundNeighbor;
    let nextCell;

    while (this.hasUnvisited(this.cells)) {
      currCell = stack[stack.length - 1];
      currCell.visited = true;
      if (this.hasUnvisitedNeighbor(currCell)) {
        nextCell = null;
        foundNeighbor = false;
        do {
          dir = Math.floor(Math.random() * 4);
          switch (dir) {
            case 0:
              if (
                currCell.col !== this.cols - 1 &&
                !this.cells[currCell.col + 1][currCell.row].visited
              ) {
                currCell.eastWall = false;
                nextCell = this.cells[currCell.col + 1][currCell.row];
                nextCell.westWall = false;
                foundNeighbor = true;
              }
              break;
            case 1:
              if (
                currCell.row !== 0 &&
                !this.cells[currCell.col][currCell.row - 1].visited
              ) {
                currCell.northWall = false;
                nextCell = this.cells[currCell.col][currCell.row - 1];
                nextCell.southWall = false;
                foundNeighbor = true;
              }
              break;
            case 2:
              if (
                currCell.row !== this.rows - 1 &&
                !this.cells[currCell.col][currCell.row + 1].visited
              ) {
                currCell.southWall = false;
                nextCell = this.cells[currCell.col][currCell.row + 1];
                nextCell.northWall = false;
                foundNeighbor = true;
              }
              break;
            case 3:
              if (
                currCell.col !== 0 &&
                !this.cells[currCell.col - 1][currCell.row].visited
              ) {
                currCell.westWall = false;
                nextCell = this.cells[currCell.col - 1][currCell.row];
                nextCell.eastWall = false;
                foundNeighbor = true;
              }
              break;
          }
          if (foundNeighbor) {
            stack.push(nextCell);
          }
        } while (!foundNeighbor);
      } else {
        currCell = stack.pop();
      }
    }

    this.redraw();
  }

  hasUnvisited() {
    for (let col = 0; col < this.cols; col++) {
      for (let row = 0; row < this.rows; row++) {
        if (!this.cells[col][row].visited) {
          return true;
        }
      }
    }
    return false;
  }

  hasUnvisitedNeighbor(mazeCell) {
    return (
      (mazeCell.col !== 0 &&
        !this.cells[mazeCell.col - 1][mazeCell.row].visited) ||
      (mazeCell.col !== this.cols - 1 &&
        !this.cells[mazeCell.col + 1][mazeCell.row].visited) ||
      (mazeCell.row !== 0 &&
        !this.cells[mazeCell.col][mazeCell.row - 1].visited) ||
      (mazeCell.row !== this.rows - 1 &&
        !this.cells[mazeCell.col][mazeCell.row + 1].visited)
    );
  }

  redraw() {
    ctx.fillStyle = this.backgroundColor;
    ctx.fillRect(0, 0, this.cols * this.cellSize, this.rows * this.cellSize);

    ctx.fillStyle = this.endColor;
    ctx.fillRect(
      (this.cols - 1) * this.cellSize,
      (this.rows - 1) * this.cellSize,
      this.cellSize,
      this.cellSize
    );

    ctx.strokeStyle = this.mazeColor;
    ctx.lineWidth = this.lineWidth;
    ctx.strokeRect(0, 0, mazeHeight, mazeWidth);
    ctx.lineWidth = this.lineWidth / 2;

    for (let col = 0; col < this.cols; col++) {
      for (let row = 0; row < this.rows; row++) {
        if (this.cells[col][row].eastWall) {
          ctx.beginPath();
          ctx.moveTo((col + 1) * this.cellSize, row * this.cellSize);
          ctx.lineTo((col + 1) * this.cellSize, (row + 1) * this.cellSize);
          ctx.stroke();
        }
        if (this.cells[col][row].northWall) {
          ctx.beginPath();
          ctx.moveTo(col * this.cellSize, row * this.cellSize);
          ctx.lineTo((col + 1) * this.cellSize, row * this.cellSize);
          ctx.stroke();
        }
        if (this.cells[col][row].southWall) {
          ctx.beginPath();
          ctx.moveTo(col * this.cellSize, (row + 1) * this.cellSize);
          ctx.lineTo((col + 1) * this.cellSize, (row + 1) * this.cellSize);
          ctx.stroke();
        }
        if (this.cells[col][row].westWall) {
          ctx.beginPath();
          ctx.moveTo(col * this.cellSize, row * this.cellSize);
          ctx.lineTo(col * this.cellSize, (row + 1) * this.cellSize);
          ctx.stroke();
        }
      }
    }

    ctx.drawImage(
      image,
      player.col * this.cellSize + 2,
      player.row * this.cellSize + 2,
      this.cellSize - 4,
      this.cellSize - 4
    );
  }
}

function moveRight() {
	if (!maze.cells[player.col][player.row].eastWall) {
	  player.col += 1;
	}
	if (!maze.cells[player.col][player.row].eastWall) {
	  player.col += 1;
	}
	maze.redraw();
}

function submitPrompt(event) {
  if (event.key === "Enter" || event.keyCode === 13) {
    if (input.value === "") {
      return;
    }
    promptsTaken += 1;
	  if (promptsTaken % 29 == 0) {
	  	promptsTaken = 0;
	  }
    counter.textContent = promptsTaken.toString();
    getResponse(input.value);

    input.value = "";
  }
}

function getResponse(prompt) {
  // DEBUG ONLY:
  // var myModal = new bootstrap.Modal(document.getElementById("exampleModal"));
  // var innerText = document.getElementById("modalInnerText");
  // innerText.innerHTML = `Congratulations! You have completed the maze in ${promptsTaken} prompts!`;
  // myModal.toggle();

  var respWaitSpinner = document.getElementById("respWaitSpinner");
  
  if (prompt.toLowerCase() == "leap right") {
	moveRight();
	  
	  return;
  }
  respWaitSpinner.classList.remove("d-none");

  fetch(`${SERVER_URL}/api/get-movement/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Api-Key ${myToken}`,
    },
    body: JSON.stringify({ prompt: prompt }),
  })
    .then((resp) => resp.json())
    .then((data) => {
      // console.log(data);
      if (data.message && data.key) {
        // console.log(data.message);
        // console.log(data.key);

        var respElement = document.getElementById("response");
        respElement.textContent = data.message;
        var respWaitSpinner = document.getElementById("respWaitSpinner");
        respWaitSpinner.classList.add("d-none");

        if (data.key == "left") {
          if (!maze.cells[player.col][player.row].westWall) {
            player.col -= 1;
          }
        } else if (data.key == "right") {
          if (!maze.cells[player.col][player.row].eastWall) {
            player.col += 1;
          }
        } else if (data.key == "down") {
          // console.log("downing");
          if (!maze.cells[player.col][player.row].southWall) {
            // console.log("downed");
            player.row += 1;
          }
        } else if (data.key == "up") {
          if (!maze.cells[player.col][player.row].northWall) {
            player.row -= 1;
          }
        } else if (data.key == "denied") {
          console.log("Denied");
        }

        checkIfWon();
      } else {
        console.log("No response or key");
      }
    })
    .catch((err) => {
      var respWaitSpinner = document.getElementById("respWaitSpinner");
      respWaitSpinner.classList.add("d-none");
      var respElement = document.getElementById("response");
      respElement.textContent = "Network error. Please try again later!";

      promptsTaken -= 1;
      counter.textContent = promptsTaken.toString();
    })
    .finally(() => maze.redraw());
}

async function checkIfWon() {
  if (player.col === maze.cols - 1 && player.row === maze.rows - 1) {
    // show win message and modal
    var myModal = new bootstrap.Modal(document.getElementById("exampleModal"));
    var innerText = document.getElementById("modalInnerText");
    innerText.innerHTML = `Congratulations! You have completed the maze in ${promptsTaken} prompt(s)!`;
    myModal.toggle();
  }
}

function showLeaderboard() {
  document.getElementById("leaderboardSpinner").classList.remove("d-none");

  const response = fetch(`${SERVER_URL}/api/leaderboard/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Api-Key ${myToken}`,
    },
  });
  response
    .then((resp) => {
      // console.log(resp);
      document.getElementById("leaderboardSpinner").classList.add("d-none");
      document.getElementById("leaderboardNone").classList.add("d-none");
      document.getElementById("leaderboard").classList.add("d-none");
      resp.json().then((data) => {
        // console.log(data);
        if (data.length > 0) {
          // console.log(data);
          var leaderboardTable = document.getElementById("leaderboardTable");
          var tableBody = leaderboardTable.getElementsByTagName("tbody")[0];
          tableBody.innerHTML = "";
          data.forEach((element) => {
            var newRow = tableBody.insertRow(tableBody.rows.length);
            var cell1 = newRow.insertCell(0);
            var cell2 = newRow.insertCell(1);
            var cell3 = newRow.insertCell(2);
            cell1.innerHTML = element.username;
            cell2.innerHTML = element.num_tries;
            cell3.innerHTML = new Date(element.created_at)
              .toTimeString()
              .split(" ")[0];
          });

          document.getElementById("leaderboard").classList.remove("d-none");
        } else {
          console.log("No response");
          document.getElementById("leaderboardNone").classList.remove("d-none");
          document.getElementById("leaderboard").classList.add("d-none");
        }
      });
    })
    .catch(() => {
      document.getElementById("leaderboardSpinner").classList.add("d-none");
      document.getElementById("leaderboard").classList.add("d-none");

      document.getElementById("leaderboardNone").classList.remove("d-none");
    });
}

function submitScore() {
  var username = document.getElementById("recipient-name").value;
  fetch(`${SERVER_URL}/api/leaderboard/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Api-Key ${myToken}`,
    },
    body: JSON.stringify({ username: username, num_tries: promptsTaken }),
  })
    .then((resp) => {
      console.log(resp);
    })
    .catch(() => {
      alert(
        "Could not save response. Either you have no internet connection or our site broke :p. Oops!"
      );
    });
}

function onLoad() {
  canvas = document.getElementById("mainForm");
  ctx = canvas.getContext("2d");

  image = document.getElementById("source");
  input = document.getElementById("inputElement");
  counter = document.getElementById("counter");

  player = new Player();
  maze = new Maze(4, 4, 90);

  input.addEventListener("keyup", submitPrompt);

  document.addEventListener("keydown", onKeyDown);
}
