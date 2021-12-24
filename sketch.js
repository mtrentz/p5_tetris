// CANVAS CONFIG
const CANVAS_HEIGHT = 1500;
const CANVAS_WIDTH = 800;

// BOARD CONFIG
const EXTRA_ROWS = 2;
const ROWS = 20 + EXTRA_ROWS;
const COLS = 10;
const RATIO = ROWS / COLS;

const BOX_SIZE = 50;
const BOARD_X1 = 150;
const BOARD_Y1 = 50;
const BOARD_WIDTH = COLS * BOX_SIZE;
const BOARD_HEIGHT = (ROWS - EXTRA_ROWS) * BOX_SIZE;

// DRAW CONFIG
const BACKGROUND_COLOR = 50;
const STROKE = 20;
const STROKE_WEIGHT = 1.5;

// GAME CONFIG
const SPEED = 5;

let controller;

function setup() {
  frameRate(5);
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  background(BACKGROUND_COLOR);

  controller = new Controller();
  controller.start();
}

function draw() {
  background(BACKGROUND_COLOR);
  controller.update();
}

function keyPressed() {
  if (keyCode === UP_ARROW) {
    controller.rotatePiece();
  }

  if (keyCode === LEFT_ARROW) {
    controller.movePieceLeft();
  }

  if (keyCode === RIGHT_ARROW) {
    controller.movePieceRight();
  }
}

function checkAccelerate() {
  if (keyIsDown(DOWN_ARROW)) {
    frameRate(15);
  } else {
    frameRate(SPEED);
  }
}
