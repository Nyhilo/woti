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

  //------------------//
 // Helper Functions //
//------------------//

function $(id) {return document.getElementById(id);}    // ex $('bonecount')

function floor(num) {return Math.floor(num);}           // Rounds down to nearest decimal
function floor2(num) {return Maith.floor(num*100)/100;} // Rounds down to nearest hundredth's place


  //-------------//
 // Game Object //
//-------------//

let Game = {} 

Game.Launch = function() {
      //-------------------//
     // General Variables //
    //-------------------//
    // Constants
    Game.fps = 30;

    // Variables
    Game.eventTimer = 0;    // For longer-than-one-frame operations
    Game.selectedUnit = "skeleton";


    // Currencies
    Game.curr = {
        bones:0,
        gold:0,
        maxmana:100,
        mana:100
    }

    // Incrementals
    Game.incr = {
        bps:0,      // Bones per second
        gps:0,      // Gold per second
        mps:1,      // Mana recharge per second
        digSkill:1  // Modifier for clicking on the shovel
    }

      //---------------------------------//
     // Definitions for different units //
    //---------------------------------//
    // Template for a unit
    Game.Unit = class {
        constructor(name, bonecost, goldcost, manacost, b=0, g=0, m=0) {    // Constructor takes all incrementors as 0 by default
            this.name = name;
            this.bonecost = bonecost;
            this.goldcost = goldcost;
            this.manacost = manacost;
            this.bpsmod = b;
            this.gpsmod = g;
            this.mpsmod = m;
            this.pop = 0;
            this.employed = 0;
        }
    }

    // Units
    Game.units = {
        skeletons: new Game.Unit(
            "skeleton", bonecost=10,  goldcost=0, manacost=1, b=.1, g=.1, m=0),
        skelArmies: new Game.Unit(
            "skelArmy", bonecost=100, goldcost=0, manacost=15, b=1.0, g=1.0, m=0),
        // Skel Horses can't do anything on their own, but make skeletons more efficient
        skelHorses: new Game.Unit(  
            "skelHorse", bonecost=250, goldcost=0, manacost=50, b=.5, g=0, m=0)    
    }

      //----------------------//
     // Definitions for Jobs //
    //----------------------//
    // A template for a job containing many workers
    Game.job = class {
        constructor() {
            // Number of each unit current eployed to this job
            this.skeletons = 0;
            this.skelArmies = 0;
            this.skelHorses = 0;

            this.bps = 0;
            this.gps = 0;
            this.mps = 0;
        }

        tallybps() {
            return this.bps = ((this.skeletons * units.skeletons.bpsmod) +
                               (this.skelArmies * units.skelArmies.bpsmod));
        }
        tallygps() {
            return this.gps = ((this.skeletons * units.skeletons.gpsmod) +
                               (this.skelArmies * units.skelArmies.gpsmod * 1.2));
        }
        tallymps() {
            return this.mps = ((this.skeletons * units.skeletons.mpsmod) +
                               (this.skelArmies * units.skelArmies.mpsmod));
        }

        tallyStats() {
            tallybps();
            tallygps();
            tallymps();
        }
    }


    Game.jobs = {
        boneDigger: new Game.job(),
        delinquent: new Game.job()
    }

    // Overriding these functions to account for horses
    Game.jobs.delinquent.tallybps = function() {
        let horsebonus;
        if (this.skeletons >= this.skelHorses) {
            horsebonus = units.skeletons.bpsmod * this.skelHorses;   
        } else {
            horsebonus = units.skeletons.bpsmod * this.skeletons;    // The maximum bonus is only the number of skeletons that can ride horses
        }
        return this.bps = ((this.skeletons * units.skeletons.bpsmod) +
                           (this.skelArmies * units.skelArmies.bpsmod) +
                           horsebonus);
    }

    Game.jobs.delinquent.tallymps = function() {
        let horsebonus;
        if (this.skeletons >= this.skelHorses) {
            horsebonus = units.skeletons.mpsmod * this.skelHorses;   
        } else {
            horsebonus = units.skeletons.mpsmod * this.skeletons;    // The maximum bonus is only the number of skeletons that can ride horses
        }
        return this.mps = ((this.skeletons * units.skeletons.mpsmod) +
                           (this.skelArmies * units.skelArmies.mpsmod) +
                           horsebonus);
    }

      //----------------------//
     // Dealing with Cookies //
    //----------------------//
    Game.Load = function() {
        // Ortiel
    }


      //---------------//
     // Draw Function //
    //---------------//
    // Not really a draw function, just fills all the DOM fields
    Game.Draw = function() {
        $('bonecount').innerHTML = floor(Game.curr.bones);
        $('goldcount').innerHTML = floor(Game.curr.gold);
        $('manacount').innerHTML = floor(Game.curr.mana);
        $('maxmana').innerHTML = floor(Game.curr.maxmana);

        $('skel-bone-cost').innerHTML = floor(Game.units.skeletons.bonecost);
        $('skel-mana-cost').innerHTML = floor(Game.units.skeletons.manacost);
        $('skeleton-amount').innerHTML = Game.units.skeletons.pop;

        $('skelArmy-bone-cost').innerHTML = floor(Game.units.skelArmies.bonecost);
        $('skelArmy-mana-cost').innerHTML = floor(Game.units.skelArmies.manacost);
        $('skelArmy-amount').innerHTML = Game.units.skelArmies.pop;

        $('skelHorse-bone-cost').innerHTML = floor(Game.units.skelHorses.bonecost);
        $('skelHorse-mana-cost').innerHTML = floor(Game.units.skelHorses.manacost);
        $('skelHorse-amount').innerHTML = Game.units.skelHorses.pop;

    }


      //----------------------//
     // Other Game Functions //
    //----------------------//

    Game.dig = function() {
        Game.curr.bones += Game.incr.digSkill;
        $('bonecount').innerHTML = floor(Game.curr.bones);
    }

    Game.spawnUnit = function(someUnit) {
        switch(someUnit) {
            case "skeleton":
                if (Game.curr.bones >= Game.units.skeletons.bonecost &&
                        Game.curr.gold >= Game.units.skeletons.goldcost &&
                        Game.curr.mana >= Game.units.skeletons.manacost)
                {
                    ++Game.units.skeletons.pop;
                    Game.curr.bones -= Game.units.skeletons.bonecost;
                    Game.curr.gold -= Game.units.skeletons.goldcost;
                    Game.curr.mana -= Game.units.skeletons.manacost;
                    Game.Draw();
                } else { console.log("Not enough resources for skeleton") }
                break;

            case "skelArmy":
                if (Game.curr.bones >= Game.units.skelArmies.bonecost &&
                        Game.curr.gold >= Game.units.skelArmies.goldcost &&
                        Game.curr.mana >= Game.units.skelArmies.manacost)
                {
                    ++Game.units.skelArmies.pop;
                    Game.curr.bones -= Game.units.skelArmies.bonecost;
                    Game.curr.gold -= Game.units.skelArmies.goldcost;
                    Game.curr.mana -= Game.units.skelArmies.manacost;
                    Game.Draw();
                } else { console.log("Not enough resources for skelArmy") }
                break;

            case "skelHorse":
                if (Game.curr.bones >= Game.units.skelHorses.bonecost &&
                        Game.curr.gold >= Game.units.skelHorses.goldcost &&
                        Game.curr.mana >= Game.units.skelHorses.manacost)
                {
                    ++Game.units.skelHorses.pop;
                    Game.curr.bones -= Game.units.skelHorses.bonecost;
                    Game.curr.gold -= Game.units.skelHorses.goldcost;
                    Game.curr.mana -= Game.units.skelHorses.manacost;
                    Game.Draw();
                } else { console.log("Not enough resources for skelHorse") }
                break;

            default:
                console.error("Tried to spawn a unit that doesn't exist: " + someUnit);
        }
    }


      //------------//
     // Game Logic //
    //------------//
    Game.Logic = function() {

    }

      //--------------------//
     // The Main Game Loop //
    //--------------------//
    Game.Loop = function() {
        // Do some stuff
        if (Game.curr.mana < Game.curr.maxmana) { Game.curr.mana += Game.incr.mps/Game.fps; Game.Draw();}
        
        Game.Logic();

        // Game.eventTimer++;

        setTimeout(Game.Loop, 1000/Game.fps);
    }

      //-------------//
     // Initializer //
    //-------------//    
    Game.init = (function() {
        Game.Load();
        Game.Draw();
        Game.Loop();
    })();
}

window.onload = function(){ Game.Launch(); }