
// --------------------------
//      Global Variables
// --------------------------

var $canvas;
var $nextShape;
var blockColor = 0;
var blockSize = 32;
var cols = 13;
var rows = 20;
var width  = cols * blockSize;
var height = rows * blockSize;
var ctx, ntx;
var board = [];
var interval;
var shape;
var currentX, currentY; // position of current shape
var speed = 800;
var sprite;
var gameOver = false;

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

// --------------------------
//          Graphics
// --------------------------

// Setting the canvas as the size of the screen: width/height are optional
function setCanvasSize(event, w, h){
	$canvas.width  = width  || w || window.innerWidth  || documentElement.clientWidth;
	$canvas.height = height || h || window.innerHeight || documentElement.clientHeight;
}

// draw the canvas grid
function drawGrid(){
	ctx = $canvas.getContext('2d');

	ctx.strokeStyle = 'rgb(140,140,140)';
	ctx.lineWidth = 1;

	for (var col=0; col < cols; col++){
		ctx.moveTo(col * blockSize, 0);
		ctx.lineTo(col * blockSize, $canvas.height);
		ctx.stroke();
	}
	for (var row=0; row < rows; row++){
		ctx.moveTo(0, row * blockSize);
		ctx.lineTo($canvas.width, row * blockSize);
		ctx.stroke();
	}
}

// draw the current board state
function drawBoard(){
	for (var row=0; row < rows; row++){
		for (var col=0; col < cols; col++){
			if (board[row][col])
				drawBlock(col, row, board[row][col]);
		}
	}
}

// draw each single block piece
function drawBlock(x, y, color){
	ctx.drawImage(
		sprite,
		(color - 1) * blockSize,
		0,
		blockSize,
		blockSize,
		blockSize * x,
		blockSize * y,
		blockSize,
		blockSize
	);
}

// draw the current shape
function drawShape(){
	for (var y=0; y < 4; y++){
		for (var x=0; x < 4; x++){
			if (shape[y][x]) drawBlock(currentX + x, currentY + y, blockColor);
		}
	}
}

// --------------------------
//          Game Logic
// --------------------------

// render the canvas display
function renderDisplay(){
	ctx.clearRect(0, 0, $canvas.width, $canvas.height);
	drawGrid();
	drawBoard();
	drawShape();
}

// create new 4X4 space
// A 4X4 space allows the current shape to rotate
function newShape(){

  // randomly select a shape
  var id = Math.floor( Math.random() * shapes.length );
  var selected = shapes[id];

  // randomly choose the shape color
  blockColor = Math.floor( Math.random() * 8 ) + 1;

  // default position for every new shape
  var len = 0;
  for (var i=0; i < selected.length; i += 4){
  	var times = selected.join('').substring(i,i+4).match(/1/g).length;
  	if (times > len) len = times;
  }
  currentX = 6;//Math.floor( (cols - len)/2 );
	currentY = 0;

  // build the selected shape array 
  shape = [];
  for (var y=0; y < 4; y++){
    shape[y] = [];
    for (var x=0; x < 4; x++){
      var i = (y * 4) + x;
      shape[y][x] = (selected[i]) ? blockColor : 0;
    }
  }
}

// rotate the shape (clockwise)
function rotateShape(shape){
	var newShape = [];
	
	// flipping the shape
	for (var y=0; y < 4; y++){
		newShape[y] = [];
		for (var x=0, i=4; x < 4; x++, i--){
			newShape[y][x] = shape[i-1][y] || 0;
		}
	}

	// aligning the shape to the right/middle
	var bool = true, loop = 2;

	while (bool && loop){
		for (var x=0; x < 4; x++){
			if (newShape[x][0] !== 0) bool = false;
		}
		if (bool){
			for (var i=0; i < 4; i++){
				newShape[i].push(0);
				newShape[i].shift();
			}
		}
		loop--;
	}

	return newShape;
}

// Adding the shape to the board Array
function stopShape(){
	for (var y=0; y < 4; y++){
		for (var x=0; x < 4; x++){
			if (shape[y][x])
				board[currentY + y][currentX + x] = shape[y][x];
		}
	}
}

function clearLines(){
	for (var row = rows - 1; row >= 0; row--){
		var rowFilled = true;
		for (var col=0; col < cols; col++){
			if (!board[row][col]){
				rowFilled = false;
				break;
			}
		}
		if (rowFilled){
			for (var y = rows - 1; y > 0; y--){
				board[y] = board[y-1];
			}
			row++;
		}
	}
}

// Vlidate:
// (1) The shape is in game boarders
// (2) The shape hit another shape
// (3) The game didn't over yet
// directionX / directionY are the desired moving direction
function valid(directionX, directionY, targetShape){
  var offsetX = currentX + directionX;
  var offsetY = currentY + directionY;
  var targetShape = targetShape || shape;

  for (var y=0; y < 4; y++){
    for (var x=0; x < 4; x++){
      if (targetShape[y][x]){
        if ( typeof board[offsetY + y] === 'undefined'
          || typeof board[offsetY + y][offsetX + x] === 'undefined'
          || board[offsetY + y][offsetX + x]
          || offsetX + x < 0
          || offsetX + x >= cols
          || offsetY + y >= rows ){
          
          if (offsetY === 1) gameOver = true;
          return false;
        }
      }
    }
  }

	return true;
}

// Gameplay Interval 
function tick(){
	if (valid(0,1)){
		currentY++;
	} else {
		if (gameOver){
			endGame();
			return false;
		}
		stopShape();
		clearLines();
		newShape();
	}
	renderDisplay();
}

// --------------------------
//       Keys Handlers
// --------------------------

function keyPress(key){
	switch(key){
		case 'top'  :
			var rotated = rotateShape(shape);
			if (valid(0,0,rotated)) shape = rotated;
			break;
		case 'right':
			if (valid(1,0)) currentX++;
			break;
		case 'down' :
			if (valid(0,1)) currentY++;
			break;
		case 'left' :
			if (valid(-1,0)) currentX--;
			break;
	}
}

function keyPressEvent(event){
	var keys = {
		38: 'top',
		39: 'right',
		40: 'down',
		37: 'left'
	};

	if (keys[event.keyCode]){
		keyPress( keys[event.keyCode] );
		renderDisplay();
	}
}

// --------------------------
//       Event Handlers
// --------------------------

function spriteLoader(){
	sprite = new Image();
	sprite.src = 'assets/images/blocks.png';
}

function eventHandlers(){
	document.addEventListener('keydown', keyPressEvent, false);
}

// --------------------------
//        Initializing
// --------------------------

// creating a new multi-d-array with zero values
function initBoard() {
  for (var y=0; y < rows; y++){
    board[y] = [];
    for (var x=0; x < cols; x++){
      board[y][x] = 0;
    }
  }
}

function initNextShape(){
	$nextShape = document.getElementById('next-shape');
	ntx = $nextShape.getContext('2d');
}

// Starts a new game
function newGame(){
	gameOver = false;
	$canvas = document.getElementById('canvas');
	ctx = $canvas.getContext('2d');

	setCanvasSize();
	eventHandlers();
	spriteLoader();
	initNextShape();

	sprite.onload = function(){
		clearInterval(interval);
		initBoard();
		newShape();
		renderDisplay();
		interval = setInterval(tick, speed);
	}
}

// End the game
function endGame(){
	clearInterval(interval);
}

window.onload = newGame;
