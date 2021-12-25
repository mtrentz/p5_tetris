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

class PieceBoard extends Board {
  constructor() {
    super();

    // Posição da caixa da piece no piece board
    this.x1 = 0;
    this.y1 = 0;
    this.x2 = 0;
    this.y2 = 0;

    this.pieceNumber = this.generatePieceNumber();
    this.piece = pieces[this.pieceNumber];
  }

  generatePieceNumber() {
    let number = Math.floor(1 + Math.random() * Object.keys(pieces).length);
    return number;
  }

  spawnPiece() {
    // TODO: Ver se da pra fazer a peça spawnr um pouco mais pra baixo?
    // Ou isso vai depender da matriz da peça?

    let middleCol = Math.floor(COLS / 2);

    // Gravando o ponto inicial (topo-esquerdo) da matriz do piece
    // Começa sempre na primeira linha da matriz do board
    this.x1 = middleCol - 1;
    this.y1 = 0;

    this.piece.matrix.map((row, i) =>
      row.map((elem, j) => {
        this.board[i][j + middleCol - 1] = this.pieceNumber * elem;

        // Aqui eu seto o x2 e y2, que vai ser o ponto mais em baixo-direita da matriz
        // como esses for vão do topo-esquerda pro baixo-direita, se eu setar toda vez eu garanto
        // que to pegando o ponto mais em baixo na direita possivel
        this.x2 = j + middleCol - 1;
        // Menos 1 pq quero que seja o index do board
        this.y2 = i;
      })
    );
  }

  applyGravity() {
    for (let i = ROWS - 1; i >= 0; i--) {
      for (let j = 0; j < COLS; j++) {
        if (this.board[i][j] > 0) {
          if (i + 1 >= ROWS) {
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
    for (let j = 0; j < COLS; j++) {
      if (this.board[ROWS - 1][j] > 0) {
        return true;
      }
    }
    return false;
  }

  rotateMatrix(matrix) {
    let rotated = matrix[0].map((line, index) =>
      matrix.map((row) => row[index]).reverse()
    );
    return rotated;
  }

  moveLeft() {
    for (let j = 0; j < COLS; j++) {
      for (let i = 0; i < ROWS; i++) {
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
    for (let j = COLS - 1; j >= 0; j--) {
      for (let i = 0; i < ROWS; i++) {
        if (this.board[i][j] > 0) {
          if (j + 1 >= COLS) {
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

  rotate() {
    let croppedPiece = this.cropBoard(this.x1, this.y1, this.x2, this.y2);
    let rotated = this.rotateMatrix(croppedPiece);

    // Limpa o board pra sobreescrever com a versão rotacionada
    this.cleanBoard();

    let pieceSize = croppedPiece.length;
    for (let i = 0; i < pieceSize; i++) {
      for (let j = 0; j < pieceSize; j++) {
        this.board[i + this.y1][j + this.x1] = rotated[i][j];
      }
    }
  }
}