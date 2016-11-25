var game = new Phaser.Game(1000, 530, Phaser.CANVAS, 'gameDiv');
//var game = new Phaser.Game(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio, Phaser.AUTO, 'gameDiv');



// Creates a new 'main' state that will contain the game
var mainState = {
    
    // Function called first to load all the assets
    preload: function() { 
    	this.game.load.image('tile', 'assets/tile1.png'); 
    	this.game.load.image('tile2', 'assets/tile2.png');
    	this.game.load.image('explode', 'assets/explode.png'); 
    	this.game.load.image('green_explode', 'assets/green_tile_explode.png');
    	this.game.load.image('player', 'assets/player.png'); 
    	
    	//background music courtesy of ShadyDave
    	//https://www.freesound.org/people/ShadyDave
    	this.game.load.audio('bgm', ['assets/time-break.wav', 'assets/time-break.mp3']);
    	//courtesy of mickeyman5000
    	//http://www.freesound.org/people/mickyman5000/
    	this.game.load.audio('crash', ['assets/crash.wav']);
    	//courtesy of farbin
    	//http://www.freesound.org/people/farbin/
    	this.game.load.audio('cardboard', ['assets/cardboard.wav']);
    	//courtesy of anagar
    	//http://www.freesound.org/people/anagar
    	this.game.load.audio('whoosh', ['assets/whoosh.wav']);
    	
    	this.score = 0; 
    },
    
    createPlayer: function(){
 
    	var me = this;
 	
    	//Add the player to the game by creating a new sprite
    	me.player = me.game.add.sprite(me.game.world.centerX / 2, me.game.world.centerY, 'player');
 	
    	//Set the players anchor point to be in the middle horizontally
    	me.player.anchor.setTo(0.5, 0.5);
 	
    	//Enable physics on the player
    	me.game.physics.arcade.enable(me.player);
 	
    	//Make the player fall by applying gravity
    	me.player.body.gravity.y = 1500;
 	
    	//Make the player collide with the game boundaries 
    	me.player.body.collideWorldBounds = true;
 	
    	//This means the players velocity will be unaffected by collisions
    	me.player.body.immovable = true;
 
	},

    // Function called after 'preload' to setup the game 
    create: function() { 
		var me = this;
 	
    	//Set the speed for the platforms
    	me.tileSpeed = -450;
 	
    	//Set the initial score
    	me.score = 0;
    	me.createScore();
 	
    	//Get the dimensions of the tile we are using
    	me.tileWidth = me.game.cache.getImage('tile').width;
    	me.tileHeight = me.game.cache.getImage('tile').height;
 	
    	//Set the background colour to blue
    	me.game.stage.backgroundColor = '424242';
 	
    	//Enable the Arcade physics system
    	me.game.physics.startSystem(Phaser.Physics.ARCADE);
 	
    	//Add the player to the screen
    	me.createPlayer(); 
    	
    	//Enable cursor keys so we can create some controls
		me.cursors = me.game.input.keyboard.createCursorKeys();
		
		//Add a platforms group to hold all of our tiles, and create a bunch of them
		me.platforms = me.game.add.group();
		me.platforms.enableBody = true;
		me.platforms.createMultiple(50, 'tile');
		 
		me.breakables = me.game.add.group();
		me.breakables.enableBody = true;
		me.breakables.createMultiple(20, 'tile2');
		
		//Add an initial platform
		me.addPlatform();
 
		//Add a platform every 3 seconds
		me.timer = game.time.events.loop(1500, me.addPlatform, me);
		
		//Add particle emitter for death animation
		me.emitter = game.add.emitter(0, 0, 20);
		me.emitter.makeParticles('explode');
		me.emitter.gravity = 100;
		
		//make emitter for tile explode
		me.tileemitter = game.add.emitter(0, 0, 90);
		me.tileemitter.makeParticles('green_explode');
		me.tileemitter.gravity = 1000;
		me.tileemitter.setXSpeed(0, -1000);
		
		//make emitter for player trail
		me.movingEmitter = game.add.emitter(me.player.x + 10, me.player.y, 2000);
		me.movingEmitter.width = 10;
		me.movingEmitter.makeParticles('explode');
		//me.movingEmitter.setYSpeed(0, -10);
		me.movingEmitter.setXSpeed(0, -1000);
		me.movingEmitter.gravity = 500;
		me.movingEmitter.setRotation(90,-90)
		me.movingEmitter.setScale(0.6, 0.6, 0.5, 0.5, 2000, Phaser.Easing.Quintic.Out);
		
		me.movingEmitter.start(false, 5000, 10)
		
		this.loadSounds();
		
    },

    // This function is called 60 times per second
    update: function() {
		var me = this;
 
 		//Make the sprite collide with the ground layer
		me.game.physics.arcade.overlap(me.player, me.platforms, me.gameOver, null, me);
		me.game.physics.arcade.collide(me.player, me.breakables, me.collideTile, null, me);
		me.game.physics.arcade.collide(me.breakables, me.platforms);
 		
		this.input.onDown.add(this.onTap, this);
		
		me.player.angle += 4;
		
		me.movingEmitter.y = me.player.body.position.y + (me.player.body.height / 2);
		//me.movingParticleBurst(me.player.body.position.x + (me.player.body.width / 2), me.player.body.position.y + (me.player.body.height / 2));
	            
	},
	
loadSounds: function() {
        this.bgmSound = game.add.audio('bgm');
        this.bgmSound.volume = 0.5;
        this.bgmSound.loop = true;
        this.bgmSound.sound = 0.5;
        this.bgmSound.play();
        
        this.crash = game.add.audio('crash');
        this.crash.volume = 1;
        this.cardboard = game.add.audio('cardboard');
        this.cardboard.volume = 0.5;
        this.whoosh = game.add.audio('whoosh');
        this.whoosh.volume = 0.5;
    },

collideTile: function(player, tile){
	var me = this;
    //tile.body.gravity.y = 1500;
    me.tileparticleBurst(tile.body.position.x - (tile.body.width / 2), tile.body.position.y + (tile.body.height / 2));
    tile.kill()
    this.cardboard.play();
},

onTap: function(pointer, doubleTap){
	this.player.body.velocity.y -= 700;
	this.whoosh.play();
},
       
addTile: function(x, y, immovable){
 
    var me = this;
 
    //Get a tile that is not currently on screen
    if(immovable){
        var tile = me.platforms.getFirstDead();
    } else {
        var tile = me.breakables.getFirstDead();
    }
 
    //Reset it to the specified coordinates
    tile.body.gravity.y = 0;
    tile.reset(x, y);
    tile.body.velocity.x = me.tileSpeed; 
    tile.body.immovable = immovable;
 
    //When the tile leaves the screen, kill it
    tile.checkWorldBounds = true;
    tile.outOfBoundsKill = true;    
},
 
addPlatform: function(){
 
    var me = this;
 
    //Speed up the game to make it harder
    me.tileSpeed -= 40;
    me.incrementScore();
 
    //Work out how many tiles we need to fit across the whole screen
    var tilesNeeded = Math.ceil(me.game.world.height / me.tileHeight);
 
    //Add a hole randomly somewhere
    var hole = Math.floor(Math.random() * (tilesNeeded - 3)) + 1;
 
    //Keep creating tiles next to each other until we have an entire row
    //Don't add tiles where the random hole is
    for (var i = 0; i < tilesNeeded; i++){
        if (i != hole && i != hole + 1 && i != hole + 2 && i != hole + 3){
            me.addTile(me.game.world.width - me.tileWidth, i * me.tileHeight, true); 
        } else {
            me.addTile(me.game.world.width - me.tileWidth, i * me.tileHeight, false); 
        }         
    }
 
},

particleBurst: function(x, y){
    var me = this;
 
    me.emitter.x = x;
    me.emitter.y = y;
 
    me.emitter.start(true, 2000, null, 20);
},

tileparticleBurst: function(x, y){
    var me = this;
 
    me.tileemitter.x = x;
    me.tileemitter.y = y;
 
    me.tileemitter.start(true, 2000, null, 20);
},

gameOver: function(){
    var me = this;
 
    me.particleBurst(me.player.body.position.x + (me.player.body.width / 2), me.player.body.position.y + (me.player.body.height / 2));
    me.player.kill();
    me.movingEmitter.on = false;
    me.bgmSound.stop();
    this.crash.play();
     
    //Wait a little bit before restarting game
    me.game.time.events.add(1000, function(){
        me.game.state.start('main');
        me.bgmSound.stop();
    }, me);
 
},

createScore: function(){
 
    var me = this;
 
    var scoreFont = "100px Arial";
 
    me.scoreLabel = me.game.add.text((me.game.world.centerX), 100, "0", {font: scoreFont, fill: "#fff"}); 
    me.scoreLabel.anchor.setTo(0.5, 0.5);
    me.scoreLabel.align = 'center';
 
},
 
incrementScore: function(){
 
    var me = this;
 
    me.score += 1;   
    me.scoreLabel.text = me.score;      
 
},
   
    
};

// Add and start the 'main' state to start the game
game.state.add('main', mainState);  
game.state.start('main'); 