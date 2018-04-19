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
function floor2(num) {return Math.floor(num*100)/100;} // Rounds down to nearest hundredth's place


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
        bones:100,
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
        constructor(name) {
            // Number of each unit current eployed to this job
            this.name = name;
            this.skeletons = 0;
            this.skelArmies = 0;
            this.skelHorses = 0;

            this.bps = 0;
            this.gps = 0;
            this.mps = 0;
        }

        tallybps() {
            return this.bps = ((this.skeletons * Game.units.skeletons.bpsmod) +
                               (this.skelArmies * Game.units.skelArmies.bpsmod));
        }
        tallygps() {
            return this.gps = ((this.skeletons * Game.units.skeletons.gpsmod) +
                               (this.skelArmies * Game.units.skelArmies.gpsmod * 1.2));
        }
        tallymps() {
            return this.mps = ((this.skeletons * Game.units.skeletons.mpsmod) +
                               (this.skelArmies * Game.units.skelArmies.mpsmod));
        }

        tallyStats() {
            this.tallybps();
            this.tallygps();
            this.tallymps();
        }

        employ(someUnit) {
            if (someUnit.employed < someUnit.pop) {
                someUnit.employed++;
                switch(someUnit.name) {
                    case "skeleton":
                        this.skeletons++;
                        $(this.name + "-skel-amount").innerHTML = this.skeletons;
                        break;
                    case "skelArmy":
                        this.skelArmies++;
                        $(this.name + "-skelArmy-amount").innerHTML = this.skelArmies;
                        break;
                    case "skelHorse":
                        this.skelHorses++;
                        break;
                }
            } else { console.log("Noone to employ!"); }
            this.tallyStats();
        }
    }

    Game.jobs = {
        boneDiggers: new Game.job("boneDiggers"),
        delinquents: new Game.job("delinquents")  // Because only delinquents would attack random people on the street
    }


    // Job Overriding //

    // Overriding these functions to account for horses
    Game.jobs.delinquents.tallybps = function() {
        let horsebonus;
        if (this.skeletons >= this.skelHorses) {
            horsebonus = Game.units.skeletons.bpsmod * this.skelHorses;   
        } else {
            horsebonus = Game.units.skeletons.bpsmod * this.skeletons;    // The maximum bonus is only the number of skeletons that can ride horses
        }
        return this.bps = ((this.skeletons * Game.units.skeletons.bpsmod) +
                           (this.skelArmies * Game.units.skelArmies.bpsmod) +
                           horsebonus);
    }
    // Same as above bu for gold collecting
    Game.jobs.delinquents.tallygps = function() {
        let horsebonus;
        if (this.skeletons >= this.skelHorses) {
            horsebonus = Game.units.skeletons.gpsmod * this.skelHorses;   
        } else {
            horsebonus = Game.units.skeletons.gpsmod * this.skeletons;    // The maximum bonus is only the number of skeletons that can ride horses
        }
        return this.gps = ((this.skeletons * Game.units.skeletons.gpsmod) +
                           (this.skelArmies * Game.units.skelArmies.gpsmod) +
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

        let statsSectionText = "<span style='font-weight: bold;'>Bones/Sec: </span>" + floor2(Game.incr.bps) + "<br>" +
                                "<span style='font-weight: bold;'>Gold/Sec: </span>" + floor2(Game.incr.gps) + "<br>" +
                                "<span style='font-weight: bold;'>Mana Recharge: </span>" + floor2(Game.incr.mps) + "<br>";
        $('stats-section').innerHTML = statsSectionText;
    }



      //---------------------//
     // Misc Game Functions //
    //---------------------//

    Game.setAllButtonsBlank = function() {
        $('spawn-skeleton').style.backgroundColor = "inherit";
        $('spawn-skelArmy').style.backgroundColor = "inherit";
        $('spawn-skelHorse').style.backgroundColor = "inherit";        
    }

    Game.selectUnitButton = function(someUnit) {
        Game.setAllButtonsBlank();
        switch(someUnit) {
            case "skeleton":
                Game.selectedUnit = "skeleton";
                $('spawn-skeleton').style.backgroundColor = "#DEDCD8";
                break;

            case "skelArmy":
                Game.selectedUnit = "skelArmy";
                $('spawn-skelArmy').style.backgroundColor = "#DEDCD8";
                break;

            case "skelHorse":
                Game.selectedUnit = "skelHorse";
                $('spawn-skelHorse').style.backgroundColor = "#DEDCD8";
                break;

            default:
                console.error("Tried to set button that doesn't exist: " + someUnit);
        }
    }

    Game.calculateAllStats = function() {
        Game.incr.bps =  Game.jobs.boneDiggers.bps + Game.jobs.delinquents.bps;
        Game.incr.gps =  Game.jobs.boneDiggers.gps + Game.jobs.delinquents.gps;
        Game.incr.mps =  Game.jobs.boneDiggers.mps + Game.jobs.delinquents.mps + 1;
    }

    Game.findUnitByName = function(someName) {
        switch (someName) {
            case "skeleton":
                return Game.units.skeletons;
                break;
            case "skelArmy":
                return Game.units.skelArmies;
                break;
            case "skelHorse":
                return Game.units.skelHorses;
                break;
        }
    }

      //--------------------------//
     // Game Construct Functions //
    //--------------------------//

    Game.dig = function() {
        Game.curr.bones += Game.incr.digSkill;
        $('bonecount').innerHTML = floor(Game.curr.bones);
    }

    Game.spawnUnit = function(someUnit) {
        switch(someUnit) {
            case "skeleton":
                if (Game.selectedUnit == "skeleton") {
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
                } else { Game.selectUnitButton("skeleton"); }
                break;

            case "skelArmy":
                if (Game.selectedUnit == "skelArmy") {
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
                } else { Game.selectUnitButton("skelArmy"); }
                break;

            case "skelHorse":
                if (Game.selectedUnit == "skelHorse") {
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
                } else { Game.selectUnitButton("skelHorse"); }   // We're gonna highlight the button before using it to spawn anything.
                break;

            default:
                console.error("Tried to spawn a unit that doesn't exist: " + someUnit);
        }
    }


    Game.employ = function(someJob) {
        switch(someJob) {
            case "boneDiggers":
                Game.jobs.boneDiggers.employ(Game.findUnitByName(Game.selectedUnit));
                break;
            case "delinquents":
                Game.jobs.delinquents.employ(Game.findUnitByName(Game.selectedUnit));
                break;
            default:
                console.error("Tried to give unit a job that doesn't exist: " + someJob)
        }
    }

      //------------//
     // Game Logic //
    //------------//
    Game.Logic = function() {
        Game.calculateAllStats();
    }

      //--------------------//
     // The Main Game Loop //
    //--------------------//
    Game.Loop = function() {
        // Do some stuff
        if (Game.curr.mana < Game.curr.maxmana) { Game.curr.mana += Game.incr.mps/Game.fps; Game.Draw();}

        Game.Logic();
        Game.Draw();

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
        Game.selectUnitButton(Game.selectedUnit);
    })();
}

window.onload = function(){ Game.Launch(); }