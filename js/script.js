
// --------------------------
//      Global Variables
// --------------------------

var cols = 10;
var rows = 20;
var board = [];
var interval;
var shape;
var currentX, currentY; // position of current shape
var shapes = [
    [ 1, 1, 1, 1 ],
    [ 1, 1, 1, 0,
      1 ],
    [ 1, 1, 1, 0,
      0, 0, 1 ],
    [ 1, 1, 0, 0,
      1, 1 ],
    [ 1, 1, 0, 0,
      0, 1, 1 ],
    [ 0, 1, 1, 0,
      1, 1 ],
    [ 0, 1, 0, 0,
      1, 1, 1 ]
];

function tick(){
	// TODO: move an element down
}

// create new 4X4 space
// A 4X4 space allows the current shape to rotate
function newShape(){
	// default position for every new shape
  currentX = cols/2 - 2;
  currentY = 0;

  // randomly select a shape
  var id = Math.floor( Math.random() * shapes.length );
  var selected = shapes[id];

  // build the selected shape array 
  shape = [];
  for (var y=0; y < 4; y++){
    shape[y] = [];
    for (var x=0; x < 4; x++){
      var i = 4 * y + x;
      shape[y][x] = (selected[i]) ? id + 1 : 0;
    }
  }
}

// clears the board
// creating a new multi-d-array with zero values
function init() {
  for (var y=0; y < rows; y++){
    board[y] = [];
    for (var x=0; x < cols; x++){
      board[y][x] = 0;
    }
  }
}

// --------------------------
//     Starts a New Game
// --------------------------

function newGame(){
	clearInterval(interval);
	init();
	newShape();
	interval = setInterval(tick, 500);
}

window.onload = newGame;
