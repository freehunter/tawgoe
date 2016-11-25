var Preload = function(game){};

Preload.prototype = {

	preload: function(){ 
		this.game.load.image('tile', 'assets/tile1.png'); 
    	this.game.load.image('tile2', 'assets/tile2.png');
    	this.game.load.image('explode', 'assets/explode.png'); 
    	this.game.load.image('player', 'assets/player.png');
	},

	create: function(){
		this.game.state.start("Main");
	}
}