//constants
const rows = 20;
const cols = 10;
const ratio = rows / cols;
const canvasWidth = 300;
const canvasHeight = ratio * canvasWidth;
const backgroundColor = 50;
const speed = 5;
const STROKE = 20;
const STROKEWEIGHT = 1.5;

const pieces = {
  1: {
    name: "L",
    color: "#ff8d00",
    matrix: [
      [1, 1, 1],
      [1, 0, 0],
      [0, 0, 0],
    ],
  },
  2: {
    name: "T",
    color: "#9f0096",
    matrix: [
      [1, 1, 1],
      [0, 1, 0],
      [0, 0, 0],
    ],
  },
  3: {
    name: "J",
    color: "#ff51bc",
    matrix: [
      [1, 1, 1],
      [0, 0, 1],
      [0, 0, 0],
    ],
  },
  4: {
    name: "S",
    color: "#f60000",
    matrix: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
  },
  5: {
    name: "Z",
    color: "#69b625",
    matrix: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
  },
  6: {
    name: "O",
    color: "#faff00",
    matrix: [
      [1, 1],
      [1, 1],
    ],
  },
  7: {
    name: "I",
    color: "#00e4ff",
    matrix: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
  },
};

const timer = 800;
let board;
let piece;
let game;

function setup() {
  frameRate(5);
  createCanvas(canvasWidth, canvasHeight);

  game = new Game();
  background(backgroundColor);
  game.start();
}

function draw() {
  background(backgroundColor);
  game.update();
  checkAccelerate();
}

function keyPressed() {
  if (keyCode === UP_ARROW) {
    game.piece.applyRotation(game.board.board);
  }

  if (keyCode === LEFT_ARROW) {
    game.movePieceLeft();
  }

  if (keyCode === RIGHT_ARROW) {
    game.movePieceRight();
  }
}

function checkAccelerate() {
  if (keyIsDown(DOWN_ARROW)) {
    frameRate(15);
  } else {
    frameRate(speed);
  }
}

class Game {
  constructor() {
    this.piece = new Piece();
    this.board = new Board();
    this.pieceLifespan = 0;
    this.score = 0;
  }

  start() {
    this.board.drawGrid();
    this.board.draw();
    this.piece.draw();
  }

  update() {
    if (
      this.piece.touchFloor() ||
      this.touchOtherPieceVertically(this.board, this.piece)
    ) {
      console.log("TESTANDO ERRO");
      this.board.consume(this.piece);

      this.score += this.board.getScore();

      if (this.pieceLifespan == 0) {
        this.gameOver();
      }
      this.piece = new Piece();
      this.pieceLifespan = 0;
    } else {
      this.piece.applyGravity();
      this.pieceLifespan++;
    }

    this.piece.draw();
    this.board.drawGrid();
    this.board.draw();
  }

  gameOver() {
    background(255);
    this.piece = new Piece();
    this.board = new Board();
    this.pieceLifespan = 0;
    this.score = 0;
  }

  movePieceRight() {
    if (this.touchOtherPieceHorizontally(this.board, this.piece)) {
      return;
    }
    this.piece.moveRight();
    //
  }

  movePieceLeft() {
    if (this.touchOtherPieceHorizontally(this.board, this.piece)) {
      return;
    }
    this.piece.moveLeft();
  }

  touchOtherPieceVertically(b, p) {
    for (let i = rows - 1; i >= 0; i--) {
      for (let j = 0; j < cols; j++) {
        if (p.board[i][j] > 0) {
          if (b.board[i + 1][j] > 0) {
            return true;
          }
        }
      }
    }
    return false;
  }

  touchOtherPieceHorizontally(b, p) {
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (p.board[i][j] > 0) {
          if (j - 1 < 0 || j + 1 > cols - 1) {
            continue;
          }
          if (b.board[i][j + 1] > 0 || b.board[i][j - 1] > 0) {
            return true;
          }
        }
      }
    }
    return false;
  }
}

class Piece {
  constructor() {
    // Posição da caixa da piece
    this.x1 = 0;
    this.y1 = 0;
    this.x2 = 0;
    this.y2 = 0;

    this.pieceNumber = this.generatePieceNumber();
    this.piece = pieces[this.pieceNumber];
    this.board = this.startBoard();
    this.boxHeight = canvasHeight / rows;
    this.boxWidth = canvasWidth / cols;
    this.boxSize = Math.floor(this.boxHeight, this.boxWidth);
  }

  generateBoard() {
    let b = [];
    let lineArray = [];
    for (var i = 0; i < rows; i++) {
      for (var j = 0; j < cols; j++) {
        lineArray.push(0);
      }
      b.push(lineArray);
      lineArray = [];
    }
    return b;
  }

  startBoard() {
    let b = this.generateBoard();
    let pieceNumber = this.pieceNumber;
    let p = pieces[pieceNumber];

    let halfCols = Math.floor(cols / 2);

    // Gravando o ponto inicial (topo-esquerdo) da matriz do piece
    // Começa sempre na primeira linha da matriz do board
    this.x1 = halfCols - 1;
    this.y1 = 0;

    for (var i in p.matrix) {
      for (var j in p.matrix[i]) {
        i = int(i);
        j = int(j);
        // let val = pieceNumber * p.matrix[i][j];
        b[i][j + halfCols - 1] = pieceNumber * p.matrix[i][j];

        // Aqui eu seto o x2 e y2, que vai ser o ponto mais em baixo-direita da matriz
        // como esses for vão do topo-esquerda pro baixo-direita, se eu setar toda vez eu garanto
        // que to pegando o ponto mais em baixo na direita possivel
        this.x2 = j + halfCols - 1;
        // Menos 1 pq quero que seja o index do board
        this.y2 = i;
      }
    }
    return b;
  }

  applyGravity() {
    for (let i = rows - 1; i >= 0; i--) {
      for (let j = 0; j < cols; j++) {
        if (this.board[i][j] > 0) {
          if (i + 1 >= rows) {
            return;
          }
          this.board[i + 1][j] = this.board[i][j];
          this.board[i][j] = 0;
        }
      }
    }
    // Como a peça ta caindo 1 espaço toda vez que aplico gravidade, atualizo o y1 e y2 da posição da matriz da peça
    this.y1 += 1;
    this.y2 += 1;
  }

  touchFloor() {
    for (let j = 0; j < cols; j++) {
      if (this.board[rows - 1][j] > 0) {
        return true;
      }
    }
    return false;
  }

  cropPiece() {
    let croppedLines;
    let cropped = [];

    croppedLines = this.board.slice(this.y1, this.y2 + 1);

    //o cropped está retornando vazio caso x1<0
    if (this.x1 >= 0) {
      for (let i in croppedLines) {
        cropped.push(croppedLines[i].slice(this.x1, this.x2 + 1));
      }
      console.log(cropped);
      return cropped;
    } else {
      return null;
    }
  }

  moveLeft() {
    for (let j = 0; j < cols; j++) {
      for (let i = 0; i < rows; i++) {
        if (this.board[i][j] > 0) {
          if (j - 1 < 0) {
            return;
          }
          this.board[i][j - 1] = this.board[i][j];
          this.board[i][j] = 0;
        }
      }
    }

    this.x1 -= 1;
    this.x2 -= 1;
  }

  moveRight() {
    for (let j = cols - 1; j >= 0; j--) {
      for (let i = 0; i < rows; i++) {
        if (this.board[i][j] > 0) {
          if (j + 1 >= cols) {
            return;
          }
          this.board[i][j + 1] = this.board[i][j];
          this.board[i][j] = 0;
        }
      }
    }
    this.x1 += 1;
    this.x2 += 1;
  }

  rotatePiece(matrix) {
    let rotated = matrix[0].map((line, index) =>
      matrix.map((row) => row[index]).reverse()
    );
    return rotated;
  }

  applyRotation(gameBoard) {
    let croppedPiece = this.cropPiece();
    if (croppedPiece === null) {
      return;
    }
    this.board = this.generateBoard();
    let rotated = this.rotatePiece(croppedPiece);

    //Cria uma matriz pequena de onde a peça estaria no Board
    let croppedLines;
    let croppedBoard = [];
    croppedLines = gameBoard.slice(this.y1, this.y2 + 1);
    for (let i in croppedLines) {
      croppedBoard.push(croppedLines[i].slice(this.x1, this.x2 + 1));
    }

    let canRotate = true;

    for (let j = 0; j < rotated.length; j++) {
      for (let i = 0; i < rotated.length; i++) {
        if (
          (croppedBoard[i][j] > 0 && rotated[i][j] > 0) ||
          this.x1 < 0 ||
          this.x2 >= cols
        ) {
          canRotate = false;
        }
      }
    }

    console.log("CAN ROTATE =", canRotate);

    let pieceSize = croppedPiece.length;
    if (canRotate) {
      for (let i = 0; i < pieceSize; i++) {
        for (let j = 0; j < pieceSize; j++) {
          this.board[i + this.y1][j + this.x1] = rotated[i][j];
        }
      }
    } else {
      for (let i = 0; i < pieceSize; i++) {
        for (let j = 0; j < pieceSize; j++) {
          this.board[i + this.y1][j + this.x1] = croppedPiece[i][j];
        }
      }
    }
  }

  draw() {
    for (var i in this.board) {
      for (var j in this.board[i]) {
        if (this.board[i][j] > 0) {
          fill(this.piece.color);
          rect(j * this.boxSize, i * this.boxSize, this.boxSize, this.boxSize);
        }
      }
    }
  }

  generatePieceNumber() {
    let number = Math.floor(1 + Math.random() * Object.keys(pieces).length);
    return number;
  }
}

class Board {
  constructor() {
    this.board = this.createBoard();
    this.boxHeight = canvasHeight / rows;
    this.boxWidth = canvasWidth / cols;
    this.boxSize = Math.floor(this.boxHeight, this.boxWidth);
  }

  createBoard() {
    let boxes = [];
    let lineArray = [];

    for (var i = 0; i < rows; i++) {
      for (var j = 0; j < cols; j++) {
        lineArray.push(0);
      }
      boxes.push(lineArray);
      lineArray = [];
    }
    return boxes;
  }

  consume(piece) {
    for (var i = 0; i < rows; i++) {
      for (var j = 0; j < cols; j++) {
        if (piece.board[i][j] > 0) {
          this.board[i][j] = piece.board[i][j];
        }
      }
    }
  }

  deleteLine(i) {
    let newTopLine = new Array(cols).fill(0);
    let aboveLines = this.board.slice(0, i);
    let updatedBoard;
    if (i + 1 < rows) {
      let belowLines = this.board.slice(i + 1, rows);
      updatedBoard = [newTopLine, ...aboveLines, ...belowLines];
    } else {
      updatedBoard = [newTopLine, ...aboveLines];
    }

    this.board = updatedBoard;
  }

  getScore() {
    let score = 0;
    for (var i = 0; i < rows; i++) {
      if (this.board[i].every((element) => element > 0)) {
        this.deleteLine(i);
        score++;
      }
    }
    return score;
  }

  drawGrid() {
    //desenha linhas horizontais
    for (var i = 0; i <= rows; i++) {
      stroke(STROKE);
      strokeWeight(STROKEWEIGHT);
      line(0, i * this.boxSize, canvasWidth, i * this.boxSize);
    }
    //desenha linhas verticais
    for (var j = 0; j <= cols; j++) {
      stroke(STROKE);
      strokeWeight(STROKEWEIGHT);
      line(j * this.boxSize, 0, j * this.boxSize, canvasHeight);
    }
  }

  draw() {
    for (var i = 0; i < rows; i++) {
      for (var j = 0; j < cols; j++) {
        if (this.board[i][j] > 0) {
          let pieceNumber = this.board[i][j];
          let color = pieces[pieceNumber].color + "CC";
          //let color = pieces[pieceNumber].color
          fill(color);
          rect(j * this.boxSize, i * this.boxSize, this.boxSize, this.boxSize);
        }
      }
    }
  }
}