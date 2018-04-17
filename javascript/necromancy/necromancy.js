/*  Necromancy
    Elevator pitch:
        Incremental game where you dig up bones and use your magic to turn them into skeletons.
        Skeletons will have the job of digging up more bones, attacking travelers for gold, and doing other tasks to further the progress in the game.
        Gold will be used to purchase upgraddes from the shop to increase your efficiency and output.
        End goal is to build a skeletal army to begin sieging castles and take over the world.

    Goals:
        Use a shovel to dig up bones.
        Use bones to spawn skeletal units.
        Direct those units where to spend their efforts.
        Start gaining a steady stream of more bones from skeletons digging up bones
        Buy upgrades to shovel to increase clicking efficiency
        Buy upgrades to their dungeon increase various efficiencies
        Buy upgrades to them selves to increase their max mana and mana recharge
        Limiting schools of thought:
            Prices for spawning skeletons increase with each purchase - better exponential gameply
            Skeletons die slowly over time, requiring the purchase of more - makes more sense, different
        Unlocking additional skeletal units will involve upgrading max mana
        Game will autosave using cookies
        Allow user to copy a save file for later use

    Jacob Cloward 2018
*/

  //////////////////////
 // Helper Functions //
//////////////////////

function $(id) {return document.getElementById(id);}    // ex $('bonecount')

function floor(num) {return Math.floor(num);}           // Rounds down to nearest decimal
function floor2(num) {return Maith.floor(num*100)/100;} // Rounds down to nearest hundredth's place


  //////////////////////
 // Game Initializer //
//////////////////////

let Game = {} 

Game.Launch = function() {
    // Constants
    const Game.fps = 30;

    // Variables
    Game.eventTimer = 0;    // For longer-than-one-frame operations

    // Currencies
    var curr = {
        bones:0,
        gold:0,
        mana:0,
        maxMana:100
    }

    // Template for a unit
    class Unit {
        constructor(name, c, b=0, g=0, m=0) {    // Constructor takes all incrementors as 0 by default
            this.name = name;
            this.cost = c;
            this.bpsmod = b;
            this.gpsmod = g;
            this.mpsmod = m;
            this.pop = 0;
            this.employed = 0;
        }
    }

    // Units
    var units {
        skeleton: new Unit("skeleton", 10, b=.1, g=.1, m=0),
        skelArmy: new Unit("skelArmy", 100, b=1.0, g=1.0, m=0)
    }

    // A template for a job containing many workers
    class job {
        constructor() {
            // Number of each unit current eployed to this job
            this.skeletons = 0;
            this.skelArmies = 0;

            this.bps = 0;
            this.gps = 0;
            this.mps = 0;
        }

        tallyStats() {
            this.bps = ((this.skeletons * units.skeleton.bpsmod) +
                       (this.skelArmies * units.skelArmy.bpsmod));

            this.gps = ((this.skeletons * units.skeleton.gpsmod) +
                       (this.skelArmies * units.skelArmy.gpsmod * 1.2));

            this.mps = ((this.skeletons * units.skeleton.mpsmod) +
                       (this.skelArmies * units.skelArmy.mpsmod));
        }
    }

    var jobs = {
        boneDigger: new job(),
        travelerAttacker: new job()
    }

    // Incrementals
    var incr = {
        bps:0,      // Bones per second
        gps:0,      // Gold per second
        mps:1       // Mana recharge per second
    }

    Game.Logic = function() {

    }

    Game.Loop = function() {
        // Do some stuff
        Game.Logic();

        Game.eventTimer++;
        setTimeout(Game.Loop, 1000/Game.fps);
    }
}