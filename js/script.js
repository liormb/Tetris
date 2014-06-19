
// --------------------------
//      Global Variables
// --------------------------

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

var colors = [
	'red','green','blue','yellow','orange','purple','cyan'
];

// --------------------------
//          Graphics
// --------------------------

function drawBlock(x, y){
	ctx.fillRect(blockSize * x, blockSize * y, blockSize - 0.5, blockSize - 0.5);
	ctx.strokeRect(blockSize * x, blockSize * y, blockSize - 0.5, blockSize - 0.5);
}

function render(){
	ctx.clearRect(0, 0, $canvas.width, $canvas.height);

	ctx.strokeStyle = 'black';
	for (var y=0; x < rows; y++){
		for (var x=0; x < cols; x++){
			ctx.fillStyle = colors[ board[y][x] - 1 ];
			drawBlock(x, y);
		}
	}

	ctx.fillStyle = 'red';
	ctx.strokeStyle = 'rgb(60,60,60)';
	for (var y=0; y < 4; y++){
		for (var x=0; x < 4; x++){
			if (shape[y][x]){
				ctx.fillStyle = colors[ shape[y][x] - 1 ];
				drawBlock(currentX + x, currentY + y);
			}
		}
	}
}

function rotate(shape){
	var bool = true;
	var newShape = [];
	
	for (var y=0; y < 4; y++){
		newShape[y] = [];
		for (var x=0, i=4; x < 4; x++, i--){
			newShape[y][x] = shape[i-1][y] || 0;
		}
	}

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
	// TODO: move an element down
}

// create new 4X4 space
// A 4X4 space allows the current shape to rotate
function newShape(){

  // randomly select a shape
  var id = Math.floor( Math.random() * shapes.length );
  var selected = shapes[id];

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
      var i = 4 * y + x;
      shape[y][x] = (selected[i]) ? id + 1 : 0;
    }
  }
}

// Setting the canvas as the size of the screen: width/height are optional
function setCanvasSize(event, w, h){
	$canvas.width  = width  || w || window.innerWidth  || documentElement.clientWidth;
	$canvas.height = height || h || window.innerHeight || documentElement.clientHeight;
}

// --------------------------
//       Keys Handlers
// --------------------------

function keyPress(key){
	switch(key){
		case 'top':
			shape = rotate(shape);
			break;
		case 'right':
			currentX++;
			break;
		case 'down':
			currentY++;
			break;
		case 'left':
			currentX--;
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
		render();
	}
}


// --------------------------
//       Event Handlers
// --------------------------

function eventHandlers(){
	document.addEventListener('keydown', keyPressEvent, false);
}

// --------------------------
//     Starts a New Game
// --------------------------

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

function newGame(){
	$canvas = document.getElementById('canvas');
	ctx = $canvas.getContext('2d');
	setCanvasSize();

	clearInterval(interval);
	init();
	newShape();
	render();
	eventHandlers();
	//interval = setInterval(tick, 500);
	//return setInterval(render, 30);
}

window.onload = newGame;
