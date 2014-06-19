
// --------------------------
//      Global Variables
// --------------------------

var blockColor = 0;
var blockSize = 32;
var cols = 12;
var rows = 16;
var width  = cols * blockSize;
var height = rows * blockSize;
var ctx;
var $canvas;
var board = [];
var interval;
var shape;
var currentX, currentY; // position of current shape
var speed = 1000;
var sprite;

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

function renderDisplay(){
	ctx.clearRect(0, 0, $canvas.width, $canvas.height);
	drawGrid();

	for (var y=0; y < 4; y++){
		for (var x=0; x < 4; x++){
			if (shape[y][x]) drawBlock(currentX + x, currentY + y, blockColor);
		}
	}
}

function rotate(shape){
	var newShape = [];
	var bool = true;
	
	// flipping the shape
	for (var y=0; y < 4; y++){
		newShape[y] = [];
		for (var x=0, i=4; x < 4; x++, i--){
			newShape[y][x] = shape[i-1][y] || 0;
		}
	}

	// aligning the shape to the left
	while (bool){
		for (var x=0; x < 4; x++){
			if (newShape[x][0] !== 0) bool = false;
		}
		if (bool){
			for (var i=0; i < 4; i++){
				newShape[i].push(0);
				newShape[i].shift();
			}
		}
	}

	return newShape;
}


function tick(){
	if ( valid() ){
		currentY++;
	} else {
		// stopShape();
		newShape();
	}
}

function valid(offsetX, offsetY, shape){
	// TODO: set the game borders
	return true;
}

function stopShape(){
	// TODO: stop the shape when touching other shapes
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
  currentX = Math.floor( (cols - len)/2 );
	currentY = 0;

  // build the selected shape array 
  shape = [];
  for (var y=0; y < 4; y++){
    shape[y] = [];
    for (var x=0; x < 4; x++){
      var i = (y * 4) + x;
      shape[y][x] = (selected[i]) ? id + 1 : 0;
    }
  }
}

// --------------------------
//       Keys Handlers
// --------------------------

function keyPress(key){
	switch(key){
		case 'top'  : shape = rotate(shape); break;
		case 'right': currentX++; break;
		case 'down' : currentY++; break;
		case 'left' : currentX--; break;
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
//     Starts a New Game
// --------------------------

// creating a new multi-d-array with zero values
function init() {
  for (var y=0; y < rows; y++){
    board[y] = [];
    for (var x=0; x < cols; x++){
      board[y][x] = 0;
    }
  }
}

function newGame(){
	$canvas = document.getElementById('canvas');
	ctx = $canvas.getContext('2d');

	setCanvasSize();
	eventHandlers();
	spriteLoader();

	sprite.onload = function(){
		clearInterval(interval);
		init();
		newShape();
		renderDisplay();
		interval = setInterval(tick, speed);
		return setInterval(renderDisplay, speed);
	}
}

window.onload = newGame;
