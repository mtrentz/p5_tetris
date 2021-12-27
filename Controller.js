class Controller {
  constructor() {
    let firstPieceNumber = this.generatePieceNumber();
    console.log(firstPieceNumber);
    this.pieceBoard = new PieceBoard(firstPieceNumber);
    this.gameBoard = new GameBoard();
    this.pieceLifespan = 0;
    this.score = 0;
    this.paused = false;
    let secondPieceNumber = this.generatePieceNumber();
    console.log(secondPieceNumber);
    this.nextPiece = secondPieceNumber;
  }

  start() {
    this.pieceBoard.spawnPiece();
    this.gameBoard.drawGrid();
    this.gameBoard.draw();
    this.pieceBoard.draw();
  }

  pauseGame() {
    this.paused = !this.paused;
  }

  update() {
    if (this.paused) {
      this.pieceBoard.draw();
      this.gameBoard.drawGrid();
      this.gameBoard.draw();
      let pauseColor = "rgba(100%,100%,100%,0.2)";
      fill(pauseColor);
      rect(BOARD_X1, BOARD_Y1, BOARD_WIDTH, BOARD_HEIGHT);
      fill(255);
      textSize(30);
      text(
        "Game Paused",
        BOARD_X1 + (BOARD_WIDTH / 2) * 0.4,
        BOARD_Y1 + BOARD_HEIGHT / 2
      );
      return;
    }

    if (
      this.pieceBoard.touchFloor() ||
      this.touchOtherPieceVertically(this.gameBoard, this.pieceBoard)
    ) {
      this.gameBoard.consume(this.pieceBoard);

      this.score += this.gameBoard.getScore();

      if (this.pieceLifespan == 0) {
        this.gameOver();
      }
      this.pieceBoard = new PieceBoard(this.nextPiece);
      let nextPieceNumber = this.generatePieceNumber();
      console.log(nextPieceNumber);
      this.nextPiece = nextPieceNumber;
      this.pieceBoard.spawnPiece();
      this.pieceLifespan = 0;
    } else {
      this.pieceBoard.applyGravity();
      this.pieceLifespan++;
      // console.log(this.nextPiece);
    }

    this.pieceBoard.draw();
    this.gameBoard.drawGrid();
    this.gameBoard.draw();
  }

  gameOver() {
    background(255);
    let nextPieceNumber = this.generatePieceNumber();
    console.log(nextPieceNumber);
    this.pieceBoard = new PieceBoard(nextPieceNumber);
    this.pieceBoard.spawnPiece();
    this.gameBoard = new GameBoard();
    this.pieceLifespan = 0;
    this.score = 0;
  }

  generatePieceNumber() {
    let number = Math.floor(1 + Math.random() * Object.keys(pieces).length);
    return number;
  }

  movePieceRight() {
    if (this.touchOtherPieceHorizontally(this.gameBoard, this.pieceBoard)) {
      return;
    }
    this.pieceBoard.moveRight();
  }

  movePieceLeft() {
    if (this.touchOtherPieceHorizontally(this.gameBoard, this.pieceBoard)) {
      return;
    }
    this.pieceBoard.moveLeft();
  }

  rotatePiece() {
    if (this.pieceCanRotate()) {
      this.pieceBoard.rotate();
    }
  }

  touchOtherPieceVertically(gameBoard, pieceBoard) {
    for (let i = ROWS - 1; i >= 0; i--) {
      for (let j = 0; j < COLS; j++) {
        if (pieceBoard.board[i][j] > 0) {
          if (gameBoard.board[i + 1][j] > 0) {
            return true;
          }
        }
      }
    }
    return false;
  }

  touchOtherPieceHorizontally(gameBoard, pieceBoard) {
    for (let i = 0; i < ROWS; i++) {
      for (let j = 0; j < COLS; j++) {
        if (pieceBoard.board[i][j] > 0) {
          if (j - 1 < 0 || j + 1 > COLS - 1) {
            continue;
          }
          if (gameBoard.board[i][j + 1] > 0 || gameBoard.board[i][j - 1] > 0) {
            return true;
          }
        }
      }
    }
    return false;
  }

  pieceCanRotate() {
    if (this.pieceBoard.x1 < 0) {
      return false;
    }

    // Corta a peça do seu board, na sua posição atual
    let croppedPiece = this.pieceBoard.cropBoard(
      this.pieceBoard.x1,
      this.pieceBoard.y1,
      this.pieceBoard.x2,
      this.pieceBoard.y2
    );

    // Aplica a rotação na peça atual
    let rotated = this.pieceBoard.rotateMatrix(croppedPiece);

    // Pega a mesma posição da peça porém no gameBoard
    let croppedBoard = this.gameBoard.cropBoard(
      this.pieceBoard.x1,
      this.pieceBoard.y1,
      this.pieceBoard.x2,
      this.pieceBoard.y2
    );

    for (let j = 0; j < rotated.length; j++) {
      for (let i = 0; i < rotated.length; i++) {
        if (
          (croppedBoard[i][j] > 0 && rotated[i][j] > 0) ||
          this.pieceBoard.x1 < 0 ||
          this.pieceBoard.x2 >= COLS
        ) {
          return false;
        }
      }
    }
    return true;
  }
}
