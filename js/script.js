
var Tetris = (function(){
	var COLS = 13;
	var ROWS = 20;
	var BLOCK_SIZE = 32;
	var MIN_SPEED = 800;
	var MAX_SPEED = 300;
	var MAX_LEVEL = 100;
	var TIME_LEVEL_INCREMENT = 600; // New level every 10 minutes

	// Tetris Constructor
	function Tetris(){
		this.interval;
		this.board = new Board();
		this.timer = new Timer();
		this.score = new Score();
		this.level = new Level();
		this.topScore = new TopScore();
		this.nextShape = new NextShape();
		this.speed = MIN_SPEED;
		this.state = 'INIT'; // 'INIT', 'RUNNING', 'PAUSED', 'OVER'
		Keyboard.call(this);
		this.init();
	}
	Tetris.prototype = {
		init: function(){
			this.eventHandlers();
			this.board.drawGrid();
		},
		newGame: function(){
			var sprite = this.board.shape.block.sprite.image;
			this.state = 'INIT';
			this.speed = MIN_SPEED;
			this.level.init();
			this.timer.init();
			this.score.init();
			this.board.init();
			sprite.onload = this.startGame();
		},
		startGame: function(isResumed){
			if (!isResumed) this.timer.start();
			this.state = 'RUNNING';
			document.getElementById('play-button-container').style.display = 'none';
			document.getElementById('pause-button-container').style.display = 'none';
			this.board.startTicking();
		},
		pauseGame: function(){
			clearInterval(this.interval);
			this.timer.pause();
			this.state = 'PAUSED';
			document.getElementById('pause-button-container').style.display = 'block';
		},
		resumeGame: function(){
			this.timer.resume();
			this.state = 'RUNNING';
			this.startGame(true);
		},
		endGame: function(){
			clearInterval(this.interval);
			this.timer.stop();
			this.state = 'OVER';
			this.topScore.setScore(this.score.getScore());
			document.getElementById('play-button').textContent = 'Play Again!';
			document.getElementById('play-button-container').style.display = 'block';
		}
	};

	// Sprite Constructor - Loading the sprite image
	function SpriteLoader(src){
		var path = 'assets/images/';
		this.image = new Image();
		this.image.src = path + ((src) ? src : 'blocks.png');
		this.imageSize = BLOCK_SIZE;
		this.total = 7;
	}

	// Canvas Constructor
	function Canvas(id, width, height){
		this.id = id;
		this.el = document.getElementById(this.id);
		this.ctx = this.el.getContext('2d');
		this.width  = width  || window.innerWidth  || documentElement.clientWidth;
		this.height = height || window.innerHeight || documentElement.clientHeight;
		this.setSize();
	}
	Canvas.prototype = {
		setSize: function(){
			this.el.width  = this.width;
			this.el.height = this.height;
		},
		clear: function(fromX, fromY, toX, toY){
			var fromX = fromX || 0;
			var fromY = fromY || 0;
			var toX = toX || this.width;
			var toY = toY || this.height;
			this.ctx.clearRect(fromX, fromY, toX, toY);
		},
		drawHeader: function(text, color){
			this.ctx.fillStyle = color;
			this.ctx.fillRect(0, 0, this.width, 50);
			this.ctx.font = "25px Arial";
			this.ctx.fillStyle = 'black';
			this.ctx.textAlign = 'center';
			this.ctx.fillText(text, this.width/2, 34);
		},
		drawText: function(text){
			this.clear(0, 50);
			this.ctx.font = "25px Arial";
			this.ctx.fillStyle = 'white';
			this.ctx.textAlign = 'center';
			this.ctx.fillText(text, this.width/2, 84);
		}
	};

	// Single Tetris Block
	function Block(){
		this.sprite = new SpriteLoader();
		this.image = this.sprite.image;
		this.size  = this.sprite.imageSize;
		this.total = this.sprite.total;
	}
	Block.prototype = {
		random: function(){
			return Math.floor( Math.random() * this.total ) + 1;
		},
		draw: function(context, x, y, blockType){
			var blockType = blockType || this.random();
			var s = this.size;
			context.drawImage(this.image, (blockType-1)*s, 0, s, s, s*x, s*y, s, s);
		}
	};

	// Shape Constructor
	function Shape(){
		this.block = new Block();
		this.layout;
		this.blockType;
		this.currentX = 0;
		this.currentY = 0;
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
		defaultXY: function(){
			this.currentX = Math.floor((COLS - this.layout[0].length)/2);
			this.currentY = 0;
		},
		new: function(){
			this.random();
			this.defaultXY();
			return this;
		},
		fixCurrentXY: function(){
			if (this.currentX < 0) this.currentX = 0;
			if (this.currentY < 0) this.currentY = 0;
			if (this.currentX + this.layout[0].length > COLS) this.currentX = COLS - this.layout[0].length;
			if (this.currentY + this.layout.length    > ROWS) this.currentY = ROWS - this.layout.length;
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
		draw: function(context){
			try {
				for (var y=0; y < this.layout.length; y++){
					for (var x=0; x < this.layout[y].length; x++){
						if (this.layout[y][x]) this.block.draw(context, x + this.currentX, y + this.currentY, this.blockType);
					}
				}
			} catch(e){
				console.log("Error: can't draw the shape.");
			}
		}
	};

	// Board Constructor
	function Board(){
		this.grid;
		this.canvas = new Canvas('board', COLS*BLOCK_SIZE, ROWS*BLOCK_SIZE);
		this.shape  = new Shape();
		this.nextShape = new Shape();
		this.ctx  = this.canvas.ctx;
		this.list = [];
	}
	Board.prototype = {
		init: function(){
			this.initGrid();
			this.shape.new();
			this.nextShape.new();
			this.grid ? this.refresh() : this.drawGrid();
			this.shape.draw(this.ctx);
			window.Tetris.nextShape.render(this.nextShape);
		},
		startTicking: function(){
			var self = this;
			window.Tetris.interval = setInterval(() => {
				self.tick();
			}, window.Tetris.speed);
		},
		initGrid: function(){
			for (var y=0; y < ROWS; y++){
		    	this.list[y] = [];
		    	for (var x=0; x < COLS; x++){
		      		this.list[y][x] = 0;
		    	}
		  	}
		},
		drawGrid: function(){
			this.ctx.strokeStyle = 'rgba(40,40,40,.8)';
			this.ctx.lineWidth = 1;

			for (var i=0; i < ROWS; i++){
				this.ctx.moveTo(0, i * BLOCK_SIZE);
				this.ctx.lineTo(this.canvas.width, i * BLOCK_SIZE);
				this.ctx.stroke();
			}
			for (var i=0; i < COLS; i++){
				this.ctx.moveTo(i * BLOCK_SIZE, 0);
				this.ctx.lineTo(i * BLOCK_SIZE, this.canvas.height);
				this.ctx.stroke();
			}
			this.grid = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
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
						|| offsetX + x >= COLS
						|| offsetY + y >= ROWS){
							return false;
						}
					}
				}
			}
			return true;
		},
		addShapeToBoard: function(){
			loop1:
				for (var y=0; y < this.shape.layout.length; y++){
				loop2:
					for (var x=0; x < this.shape.layout[0].length; x++){
						if (this.shape.layout[y][x]){
							var boardX = this.shape.currentX + x;
							var boardY = this.shape.currentY + y;
							if (!boardY){
								window.Tetris.state = 'OVER';
								break loop1;
							} else {
								this.list[boardY][boardX] = this.shape.layout[y][x];
							}
						}
					}
				}
		},
		clearRows: function(){
			var rowsCleared = 0;
			for (var y=ROWS-1; y >= 0; y--){
        		var filled = true;
        		for (var x=0; x < COLS; x++){
          			if (!this.list[y][x]){
            			filled = false;
            			break;
          			}
        		}
        		if (filled && y){
          			for (var yy=y; yy > 0; yy--){
            			for (var x=0; x < COLS; x++){
              				this.list[yy][x] = this.list[yy - 1][x];
            			}
          			}
          			rowsCleared++;
          			y++;
        		}
    		}
    		if (rowsCleared) {
				window.Tetris.score.updateScore(rowsCleared);
			}
		},
		drawBlocks: function(){
			for (var y=0; y < ROWS; y++){
				for (var x=0; x < COLS; x++){
					if (this.list[y][x]) this.shape.block.draw(this.ctx, x, y, this.list[y][x]);
				}
			}
		},
		refresh: function(){
			var self = this;
			this.canvas.clear();
			this.ctx.putImageData(self.grid, 0, 0);
			this.drawBlocks();
		},
		tick: function(){
			if (this.validMove(0,1)){
				this.shape.currentY++;
			} else {
				this.addShapeToBoard();
				this.clearRows();

				if (window.Tetris.state === 'OVER'){
					window.Tetris.endGame();
					return false;
				}
				var tempShape = this.shape.new();
				this.shape = this.nextShape;
				this.shape.defaultXY();

				this.nextShape = tempShape;
				window.Tetris.nextShape.render(this.nextShape); // Update next shape
			}
			this.refresh();
			this.shape.draw(this.ctx);
		}
	};

	// Keypress Constructor
	function Keyboard(){
		var self = this;
		var keys = {
			32: 'space',
			38: 'top',
			39: 'right',
			40: 'down',
			37: 'left'
		};
		this.eventHandlers = function(){
			document.getElementById('play-button').addEventListener('mouseup', self.newGame.bind(self), false);
			document.getElementById('pause-button').addEventListener('mouseup', self.resumeGame.bind(self), false);
			document.addEventListener('keydown', this.keyPressEvent, true);
		};
		this.keyPressEvent = function(event){
			if (keys[event.keyCode])
				self.keyPress(keys[event.keyCode]);
		};
		this.keyPress = function(key){
			var refresh = false;

			if (window.Tetris.state === 'PAUSED' && key !== 'space'){
				return false;
			}

			switch(key){
				case 'space':
					if (window.Tetris.state === 'RUNNING'){
						this.pauseGame();
					} else if (window.Tetris.state === 'PAUSED'){
						this.resumeGame();
					}
					break;
				case 'top':
					this.board.shape.rotate();
					if (this.board.validMove(0,0))
						refresh = true;
					break;
				case 'right':
					if (this.board.validMove(1,0)){
						this.board.shape.currentX++;
						refresh = true;
					}
					break;
				case 'down':
					if (this.board.validMove(0,1)){
						clearInterval(window.Tetris.interval);
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
				this.board.shape.draw(this.board.ctx);

				if (key === 'down'){
					this.board.startTicking();
				}
			}
		};
	}

	// Timer Constructor
	function Timer(){
		this.canvas = new Canvas('timer', 200, 100);
		this.ctx = this.canvas.ctx;
		this.timerId;
		this.time = 0;
		this.init();
	}
	Timer.prototype = {
		init: function(){
			clearInterval(this.timerId);
			this.time = 0;
			this.canvas.drawHeader('Timer', 'rgb(147,255,36)');
			this.render();
		},
		start: function(){
			var self = this;
			var second = 1000;
			self.timerId = setInterval(function(){
				// Increase level and speed
				if (self.time && (self.time % TIME_LEVEL_INCREMENT === 0)) {
					window.Tetris.level.increase();
				}
				self.time += 1;
				self.render();
			}, second);
		},
		pause: function() {
			clearInterval(this.timerId);
		},
		resume: function() {
			this.start();
		},
		stop: function() {
			clearInterval(this.timerId);
		},
		toTimeFormat: function(sec){
			var sec     = parseInt(sec, 10);
			var hours   = Math.floor(sec / 3600);
			var minutes = Math.floor((sec - (hours * 3600)) / 60);
			var seconds = sec - (hours * 3600) - (minutes * 60);

			if (hours   < 10) hours   = '0' + hours;
			if (minutes < 10) minutes = '0' + minutes;
			if (seconds < 10) seconds = '0' + seconds;

			return hours + ':' + minutes + ':' + seconds;
		},
		render: function(){
			this.canvas.drawText(this.toTimeFormat(this.time));
		}
	};

	// Score Constructor
	function Score(){
		this.canvas = new Canvas('score', 200, 100);
		this.ctx = this.canvas.ctx;
		this.total = 0;
		this.blocks = COLS;
		this.scoring = [100, 300, 500, 800];
		this.init();
	}
	Score.prototype = {
		init: function(){
			this.total = 0;
			this.canvas.drawHeader('My Score', 'rgb(0,204,255)');
			this.render();
		},
		numberWithCommas: function(){
    		return this.total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		},
		calcReward: function(rowsCleared = 0){
			return this.scoring[rowsCleared - 1] || 0;
		},
		getScore: function(){
			return this.total;
		},
		updateScore: function(rowsCleared){
			this.total += this.calcReward(rowsCleared);
			this.render();
		},
		render: function(){
			this.canvas.drawText(this.numberWithCommas());
		}
	};

	// Top Score Constructor
	function TopScore(){
		this.canvas = new Canvas('top-score', 200, 100);
		this.ctx = this.canvas.ctx;
		this.score = this.getScore();
		this.init();
	};
	TopScore.prototype = {
		init: function(){
			this.canvas.drawHeader('Top Score', 'rgb(147,255,36)');
			this.render();
		},
		getScore: function(){
			return Number(window.localStorage.getItem('top-score')) || 0;
		},
		setScore: function(score = 0){
			if (score > this.score) {
				window.localStorage.setItem('top-score', score);
				this.score = score;
				this.render();
			}
		},
		numberWithCommas: function(){
    		return this.score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		},
		render: function(){
			this.canvas.drawText(this.numberWithCommas());
		}
	};

	// Next Shape Constructor
	function NextShape(){
		this.canvas = new Canvas('next-shape', 200, 150);
		this.ctx = this.canvas.ctx;
		this.init();
	};
	NextShape.prototype = {
		init: function(){
			this.canvas.drawHeader('Next', 'rgb(147,255,36)');
		},
		render: function(nextShape){
			var width = nextShape.layout[0].length;
			var height = nextShape.layout.length;
			var offset = 50;
			this.canvas.clear(0, offset);
			nextShape.currentX = (this.canvas.width - (BLOCK_SIZE * width)) / BLOCK_SIZE / 2;
			nextShape.currentY = ((this.canvas.height + offset) - (BLOCK_SIZE * height)) / BLOCK_SIZE / 2;
			nextShape.draw(this.ctx);
		}
	};

	// Game Level Constructor
	function Level(){
		this.canvas = new Canvas('level', 200, 100);
		this.ctx = this.canvas.ctx;
		this.init();
	};
	Level.prototype = {
		init: function(){
			this.currentLevel = 1;
			this.canvas.drawHeader('Level', 'rgb(0,204,255)');
			this.render();
		},
		increase: function(){
			window.Tetris.speed = Math.max(MAX_SPEED, window.Tetris.speed - 50);
			this.currentLevel++;
			if (this.currentLevel > MAX_LEVEL) this.currentLevel = MAX_LEVEL;
			this.render();
		},
		render: function(nextShape){
			this.canvas.drawText(this.currentLevel);
		}
	};

	return new Tetris();
})();
