/*
HELICOPTER ACE CREATED BY JORDAN MITCHELL FOR CI287. LINK TO WEBSITE WITH GAME ON HERE:
http://itsuite.it.brighton.ac.uk/jjam12/CI287-Webbasedgamedev/assignment1/index.html
*/

var GAMEHEIGHT = 600;
var GAMEWIDTH = 800;
var background_spr;
var player;
var playing_bool = false;
var missile_grp, enemy_grp;
var start_txt;
var titleScreen;
var highScore = 0;
var score = 0;
var scoreString,scoreText;
var music;
var explosion;

var game = new Phaser.Game(GAMEWIDTH, GAMEHEIGHT, Phaser.AUTO, 'Helicopter-Ace', {
    preload: preload,
    create: create,
    update: update
});

function preload(){
    //All the image and sprite assets created by myself.
    game.load.image('background','assets/background.png');
    game.load.image('titleScreen','assets/TitleScreen.png');
    game.load.spritesheet('enemySprite','assets/enemySprite.png',86,48);
    game.load.spritesheet('playerSprite','assets/PlayerSprite.png',86,48);
    game.load.spritesheet('missile','assets/missileSprite.png',48,32);
    //All credit for the music goes to furbyguy on freesounds.
    //https://freesound.org/people/furbyguy/sounds/331876/
    game.load.audio('Music','assets/GameMusic.wav');
    //Credit for the 8bit explosion sound goes to Davidsraba on freesounds.
    //https://freesound.org/people/Davidsraba/sounds/347168/
    game.load.audio('Explosion','assets/explosion.wav');
}

function create(){
    //Load in the physics
    game.physics.startSystem(Phaser.Physics.ARCADE);
    //Load in the keyboard controls
    cursors = game.input.keyboard.createCursorKeys();
    
    //Set up the background for later
     background_spr = game.add.sprite(0, 0, 'background');
    
    //Add the enemy and missile groups
    enemy_grp = game.add.group();
    enemy_grp.enableBody=true;
    
    missile_grp = game.add.group();
    missile_grp.enableBody=true;

    //Add mouse inputs
      game.input.mouse.capture = true;
    
    //The following is from the totorial examples from the "Moon Flyer" lab sessions for setting up a basic menu and score area.
    
    // Score text area. For this using the time as the score
    scoreString = 'Time : ';
    scoreText = game.add.text(10, 10, scoreString + score, {
        font: '34px Arial',
        fill: '#000000'
    });
    score = 0;
    scoreText.text = scoreString + score;
    
    // Create and display the start Text
    titleScreen = game.add.sprite(210, 10, 'titleScreen');
    start_txt = game.add.text(game.world.centerX, game.world.centerY, ' ', {
        font: '30px Arial',
        fill: '#000000'
    });
    start_txt.anchor.setTo(0.5, 0.5);
    start_txt.text = " Click to Start \n Hold down left click to go up \n Release to go down!";
    //the "click to Start" handler "attached" to the game (whole screen)
    game.input.onTap.add(startGame, this);
    
    //Sets up and plays the looping music
    music = game.add.audio('Music',1,true);
    music.play();
    
    explosion= game.add.audio('Explosion');
    
    //This sets a time loop. For the enemy and time it has a loop of 1 second while missiles have 2 seconds
    game.time.events.loop(Phaser.Timer.SECOND,enemySpawn,this);
    game.time.events.loop(Phaser.Timer.SECOND*2,missileSpawn,this);
    game.time.events.loop(Phaser.Timer.SECOND,timeSurvived,this);
}

function startGame() {
    //Everything in this function will be called when the player clicks on the menu
    game.input.onTap.remove(startGame, this);
     //Adds the player sprite into the world with physics and animations
    player = game.add.sprite(600,300,'playerSprite');
    player.anchor.setTo(0.5, 0.5);
    game.physics.arcade.enable(player);
    player.body.gravity.y = 0;
    player.body.collideWorldBounds = true;
    //The following adds a collider event to the world bounds. Using modified code from phaser tutorial: https://phaser.io/examples/v2/arcade-physics/world-bounds-event
    player.body.onWorldBounds = new Phaser.Signal();
    player.body.onWorldBounds.add(hitWorldBounds, this);
    // Add the player animations
    player.animations.add( 'click',[0,1,2,3,4,5,6,7],12,true );
    player.animations.add( 'death',[8,9,10,11,12,13,14],12,false);
    player.body.setSize(45,40,0,0);
    
    // Makes the start text invisable as well as get rid of the title screen before game start.
    start_txt.visible = false;
    titleScreen.destroy();
    playing_bool = true;
    score = 0;
    scoreText.text = scoreString + score;
} 
    
    //The function for hitting worldbounds
    function hitWorldBounds (sprite) {
        player.animations.play('death',12,false,true);
        explosion.play();
        gameOver();
    }
function update(){
    //Check the collisions
    game.physics.arcade.overlap(player,enemy_grp,hitPlayer,null,this);
    game.physics.arcade.overlap(player,missile_grp,hitPlayer,null,this);
    //Everything inside this bool will only play if the playing_bool is true
    if(playing_bool){
    //This sets the background to repeat itself
    background_spr.x += 4;
        if(background_spr.x>=0){
            background_spr.x=-GAMEWIDTH;
        }
    
    //Sets the player veloctiy. Will reset to this velocity of not going up.
    player.body.velocity.y=350;
    player.angle = -5;
    player.animations.play('click');
    //If the player clicks or presses up, then the helicopter will go up instead of down.
    if(game.input.activePointer.leftButton.isDown||cursors.up.isDown){
        player.angle = 5;
        player.body.velocity.y = -350;
    }
        
        
        enemy_grp.forEach(function(enemy_child){
            //The following will make the AI appear to go after the player.
            //They have a decreased y velocity so it is easy to avoid them.
            if(enemy_child.y<player.y){
                enemy_child.body.velocity.y=50;
            }else{
                enemy_child.body.velocity.y=-50;
            }
            //If they go past the player, they will no longer try chase the plyaer
            if(enemy_child.x>player.x){
                enemy_child.body.velocity.y=0;
            }
            //Once they leave the game screen, the enemy is deleted
            if(enemy_child.x > GAMEWIDTH){
                enemy_child.kill();
            }           
        },this);
        
        missile_grp.forEach(function(missile_child){
            //Since the missile only goes foward, this function is just to kill it off.
            if(missile_child.x > GAMEWIDTH){
                missile_child.kill();
            }           
        },this);
        
    }
}

function hitPlayer(player, enemy){
    //When the player collides with a missile or enemy, both play their death animation and an explosion sound.
    player.animations.play('death',12,false,true);
    explosion.play();
    gameOver();
}

function enemySpawn(){
    //This handles the enemy spawning. The enemy will only start creating when the game is running.
    if(playing_bool){
        var enemy = enemy_grp.create(-50,game.world.randomY,'enemySprite');
        enemy.anchor.setTo(0.5, 0.5);
        enemy.physicsBodyType=Phaser.Physics.ARCADE;
        enemy.animations.add( 'click',[0,1,2,3,4,5,6,7],12,true );
        enemy.animations.add( 'death',[8,9,10,11,12,13,14],12,false);
        enemy.body.setSize(45,40,0,0);
        
        enemy.animations.play('click');
        enemy.body.velocity.x=300;
        }
    }

function missileSpawn(){
    if(playing_bool){
        //This handles the same as enemy spawn, only the velocity for x is increased to 500.
        var missile = missile_grp.create(-50,game.world.randomY,'missile');
        missile.anchor.setTo(0.5, 0.5);
        missile.physicsBodyType=Phaser.Physics.ARCADE;
        missile.animations.add( 'active',[0,1,2,3,4,5,6,7,8],12,true );
        missile.animations.add( 'death',[9,10,11,12,13,14],12,false);
        missile.body.setSize(45,20,0,0);
        
        missile.animations.play('active');
        missile.body.velocity.x=500;
    }
}

function timeSurvived(){
    //Simple time tracking score. Adds one to the score for every second alive.
    if(playing_bool){
        score+=1;
        scoreText.text=scoreString+score;
    }
}

function gameOver(){
    playing_bool=false;
    // The following was taken from "Moon Flyer" example for killing every enemy that still exists.    
    enemy_grp.forEachExists(function (enemy_spr) {
        enemy_spr.animations.play('death',12,false,true);
    }, this);
    missile_grp.forEachExists(function (missile_spr) {
        missile_spr.animations.play('death',12,false,true);
    }, this);
    
    //Sets highscore.
    if(highScore < score){
        highScore = score;
    }
    //Modifies the start text to add the score and highscore.
    start_txt.text = "Your final time is: "+score+" seconds.\n Your highest time is: "+highScore+" Seconds. \n Click to Start Again";
    game.input.onTap.add(startGame, this);
    start_txt.visible = true;
}