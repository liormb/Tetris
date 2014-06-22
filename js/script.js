
var Tetris = (function(){

	var sprite;
	var canvas;
	var ctx;
	var interval;
	var speed = 800;
	var cols = 13;
	var rows = 16;
	var blockSize = 32;
	var gameOver = false;

	// Initialize the game
	function Tetris(){
		this.board = new Board(cols, rows);
		Keyboard.call(this);
		this.init();
	}
	Tetris.prototype = {
		canvas: function(){
			sprite = new SpriteLoader();
			var obj = new Canvas(cols*blockSize, rows*blockSize);
			canvas = obj.el;
			ctx = obj.ctx;
		},
		newGame: function(){
			var self = this;
			sprite.image.onload = function(){
				clearInterval(interval);
				self.board.drawGrid();
				self.board.shape.new().draw();

				interval = setInterval(function(){
					self.board.tick();
				}, speed);
			};
		},
		endGame: function(){
			clearInterval(interval);
			alert("Game Over");
		},
		init: function(){
			this.canvas();
			this.eventHandlers();
			this.newGame();
		}
	};

	// Loading the sprite image
	function SpriteLoader(src){
		var path = 'assets/images/';
		this.image = new Image();
		this.image.src = path + ((src) ? src : 'blocks.png');
		this.imageSize = blockSize;
		this.total = 8;
	}

	// Game canvas
	function Canvas(width, height){
		this.id = 'canvas';
		this.el = document.getElementById(this.id);
		this.ctx = this.el.getContext('2d');
		this.width  = width  || 416 || window.innerWidth  || documentElement.clientWidth;
		this.height = height || 640 || window.innerHeight || documentElement.clientHeight;
		this.setSize();
	}
	Canvas.prototype = {
		setSize: function(){
			this.el.width  = this.width;
			this.el.height = this.height;
		}
	};

	// Single Tetris block
	function Block(){
		this.sprite = new SpriteLoader();
		this.image = this.sprite.image;
		this.size = this.sprite.imageSize;
		this.total = this.sprite.total;
		sprite = null;
	}
	Block.prototype = {
		random: function(){
			return Math.floor( Math.random() * this.total ) + 1;
		},
		draw: function(x, y, blockType){
			var blockType = blockType || this.random();
			var s = this.size;
			ctx.drawImage(this.image, (blockType-1)*s, 0, s, s, s*x, s*y, s, s);
		}
	};

	// Game shapes (GameState)
	function Shape(){
		this.layout;
		this.blockType;
		this.currentX = 0;
		this.currentY = 0;
		this.block = new Block();
		this.layouts = [
			[
		  	[ 0, 1, 0 ],
		  	[ 1, 1, 1 ]
		  ],[
		  	[ 0, 0, 1 ],
		  	[ 1, 1, 1 ]
		  ],[
		  	[ 1, 0, 0 ],
		  	[ 1, 1, 1 ]
		  ],[
		  	[ 1, 1, 0 ],
		  	[ 0, 1, 1 ]
		  ],[
		  	[ 0, 1, 1 ],
		  	[ 1, 1, 0 ]
		  ],[
		  	[ 1, 1, 1, 1 ]
		  ],[
		  	[ 1, 1 ],
		  	[ 1, 1 ]
		  ]
		];
	}
	Shape.prototype = {
		random: function(){
			var layout = this.layouts[ Math.floor(Math.random() * this.layouts.length) ];
			this.blockType = this.block.random();

			for (var y=0; y < layout.length; y++){
				for (var x=0; x < layout[0].length; x++){
					if (layout[y][x]) layout[y][x] = this.blockType;
				}
			}
			this.layout = layout;
		},
		new: function(){
			this.random();
			this.currentX = Math.floor((cols - this.layout[0].length)/2);
			this.currentY = 0;
			return this;
		},
		fixCurrentXY: function(){
			if (this.currentX < 0) this.currentX = 0;
			if (this.currentY < 0) this.currentY = 0;
			if (this.currentX + this.layout[0].length > cols) this.currentX = cols - this.layout[0].length;
			if (this.currentY + this.layout.length    > rows) this.currentY = rows - this.layout.length;
		},
		rotate: function(){
			var newLayout = [];
			for (var y=0; y < this.layout[0].length; y++){
				newLayout[y] = [];
				for (var x=0; x < this.layout.length; x++){
					newLayout[y][x] = this.layout[this.layout.length - 1 - x][y];
				}
			}
			this.layout = newLayout;
			this.fixCurrentXY();
		},
		draw: function(){
			try {
				for (var y=0; y < this.layout.length; y++){
					for (var x=0; x < this.layout[y].length; x++){
						if (this.layout[y][x]) this.block.draw(x + this.currentX, y + this.currentY, this.blockType);
					}
				}
			} catch(e){
				console.log("Something went wrong.");
			}
		}
	};

	// Game board (GameField)
	function Board(cols, rows){
		var grid;
		this.cols = cols || 13;
		this.rows = rows || 16;
		this.shape = new Shape();
		this.blockSize = blockSize;
		this.list = [];
		this.init();
		Score.call(this);
	}
	Board.prototype = {
		init: function(){
			for (var y=0; y < this.rows; y++){
		    this.list[y] = [];
		    for (var x=0; x < this.cols; x++){
		      this.list[y][x] = 0;
		    }
		  }
		},
		validMove: function(incX, incY, shape){
			var shape = shape || this.shape;
			var offsetX = shape.currentX + incX;
		  var offsetY = shape.currentY + incY;

		  for (var y=0; y < shape.layout.length; y++){
		    for (var x=0; x < shape.layout[0].length; x++){
		      if (shape.layout[y][x]){
		        if ( typeof this.list[offsetY + y] === 'undefined'
		          || typeof this.list[offsetY + y][offsetX + x] === 'undefined'
		          || this.list[offsetY + y][offsetX + x]
		          || offsetX + x < 0
		          || offsetX + x >= this.cols
		          || offsetY + y >= this.rows ){
		          return false;
		        }
		      }
		    }
		  }

			return true;
		},
		clearDisplay: function(){
			ctx.clearRect(0, 0, canvas.width, canvas.height);
		},
		drawGrid: function(){
			ctx.strokeStyle = 'rgb(140,140,140)';
			ctx.lineWidth = 1;

			for (var i=0; i < this.rows; i++){
				ctx.moveTo(0, i * this.blockSize);
				ctx.lineTo(canvas.width, i * this.blockSize);
				ctx.stroke();
			}
			for (var i=0; i < this.cols; i++){
				ctx.moveTo(i * this.blockSize, 0);
				ctx.lineTo(i * this.blockSize, canvas.height);
				ctx.stroke();
			}
			grid = ctx.getImageData(0, 0, canvas.width, canvas.height);
		},
		addShapeToBoard: function(){
			loop1:
				for (var y=0; y < this.shape.layout.length; y++){
			loop2:
					for (var x=0; x < this.shape.layout[0].length; x++){
						if (this.shape.layout[y][x]){
							var boardX = this.shape.currentX + x;
							var boardY = this.shape.currentY + y;
							if (this.list[boardY][boardX]){
								gameOver = true;
								break loop1;
							} else this.list[boardY][boardX] = this.shape.layout[y][x];
						}
					}
				}
		},
		clearLines: function(){
			for (var y=this.rows-1; y >= 0; y--){
        var filled = true;
        for (var x=0; x < this.cols; x++){
          if (!this.list[y][x]){
            filled = false;
            break;
          }
        }
        if (filled && y){
          for (var yy=y; yy > 0; yy--){
            for (var x=0; x < this.cols; x++){
              this.list[yy][x] = this.list[yy - 1][x];
            }
          }
          y++;
        }
    	}
		},
		drawBlocks: function(){
			for (var y=0; y < this.rows; y++){
				for (var x=0; x < this.cols; x++){
					if (this.list[y][x]) this.shape.block.draw(x, y, this.list[y][x]);
				}
			}
		},
		refresh: function(){
			this.clearDisplay();
			ctx.putImageData(grid, 0, 0);
			this.drawBlocks();
		},
		tick: function(){
			if (this.validMove(0,1)){
				this.shape.currentY++;
			} else {
				this.addShapeToBoard();
				if (gameOver){
					window.Tetris.endGame();
					return false;
				}
				this.clearLines();
				this.shape = this.shape.new();
			}
			this.refresh();
			this.shape.draw();
		}
	};

	// Keypress callbacks
	function Keyboard(){
		var self = this;
		var keys = {
			38: 'top',
			39: 'right',
			40: 'down',
			37: 'left'
		};
		this.eventHandlers = function(){
			document.addEventListener('keydown', this.keyPressEvent, true);
		};
		this.keyPressEvent = function(event){
			if (keys[event.keyCode])
				self.keyPress( keys[event.keyCode] );
		};
		this.keyPress = function(key){
			var refresh = false;

			switch(key){
				case 'top':
					var shapeNewWidth  = this.board.list.length;
					var shapeNewHeight = this.board.list[0].length;
					 
					this.board.shape.rotate();
					if (this.board.validMove(0,0)){
						refresh = true;
					}
					break;
				case 'right':
					if (this.board.validMove(1,0)){
						this.board.shape.currentX++;
						refresh = true;
					}
					break;
				case 'down':
					if (this.board.validMove(0,1)){
						clearInterval(interval);
						this.board.shape.currentY++;
						refresh = true;
					}
					break;
				case 'left':
					if (this.board.validMove(-1,0)){
						this.board.shape.currentX--;
						refresh = true;
					}
					break;
			}
			
			if (refresh){
				this.board.refresh();
				this.board.shape.draw();

				if (key === 'down'){
					var self = this;
					interval = setInterval(function(){
						self.board.tick();
					}, speed);
				}
			}
		};
	}

	// Game score
	function Score(){
		var line = this.cols;
		var bonus = 3;
	}

	return new Tetris();
})();
