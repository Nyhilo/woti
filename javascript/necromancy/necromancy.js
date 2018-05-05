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
    Game.currentShovel = "Broken Shovel";

    // Currencies
    Game.curr = {
        bones:100,
        gold:0,
        maxmana:1000,
        mana:1000
    }

    // Incrementals
    Game.incr = {
        bps:0,      // Bones per second
        bpsmult:1,   // Multiplier for bps
        gps:0,      // Gold per second
        gpsmult:1,   // Multiplier for gps
        mps:1,      // Mana recharge per second
        mpsmult:1,   // Multiplier for mps
        digSkill:1  // Modifier for clicking on the shovel
    }

    // Items, These line up with the categories in the sidebar
    Game.item = {
        // Shovels
        "repairedShovel": {
            owned:0,
            price:250,
            disp:"inline-block",
            mod: 5
        },
        "handledShovel": {
            owned:0,
            price:1300,
            disp:"inline-block",
            mod: 25
        },
        "doubleShovel": {
            owned:0,
            price:4000,
            disp:"inline-block",
            mod: 64
        },
        // Items (as in, actual items)
        "labEquipment": {
            owned:0,
            price:2000,
            disp:"inline-block"
        },
        "archeologyTools": {
            owned:0,
            price:4600,
            disp:"inline-block"
        },
        "petCat": {
            owned:0,
            price:50000,
            disp:"inline-block"
        },
        // Upgrades
        "sharpSpears": {
            owned:0,
            price:600,
            disp:"inline-block"
        },
        "skeletonArmor": {
            owned:0,
            price:1200,
            disp:"inline-block"
        },
        "magicCarrots": {
            owned:0,
            price:23000,
            disp:"inline-block"
        }
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
            "skeleton", bonecost=10,  goldcost=0, manacost=1, b=.1, g=.05, m=0),
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
            this.horseMult = 1;

            this.bps = 0;
            this.bpsmult = 1;
            this.gps = 0;
            this.gpsmult = 1;
            this.mps = 0;
            this.mpsmult = 1;
        }

        tallybps() {
            return this.bps = ((this.skeletons * Game.units.skeletons.bpsmod) +
                               (this.skelArmies * Game.units.skelArmies.bpsmod)) * this.bpsmult ;
        }
        tallygps() {
            return this.gps = ((this.skeletons * Game.units.skeletons.gpsmod) +
                               (this.skelArmies * Game.units.skelArmies.gpsmod * 1.2)) * this.gpsmult ;
        }
        tallymps() {
            return this.mps = ((this.skeletons * Game.units.skeletons.mpsmod) +
                               (this.skelArmies * Game.units.skelArmies.mpsmod)) * this.mpsmult ;
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

    // No gold made from diggin bones
    Game.jobs.boneDiggers.tallygps = function() {};

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
                           horsebonus) * this.bpsmult;
    }
    // Same as above bu for gold collecting
    Game.jobs.delinquents.tallygps = function() {
        let horsebonus;
        if (this.skeletons >= this.skelHorses) {
            horsebonus = Game.units.skeletons.gpsmod * this.skelHorses;   
        } else {
            horsebonus = Game.units.skeletons.gpsmod * this.skeletons;    // The maximum bonus is only the number of skeletons that can ride horses
        }
        horsebonus *= this.horseMult;
        return this.gps = ((this.skeletons * Game.units.skeletons.gpsmod) +
                           (this.skelArmies * Game.units.skelArmies.gpsmod) +
                           horsebonus);
    }



      //----------------------//
     // Dealing with Cookies //
    //----------------------//
    Game.Save = function() {
        let save = "save=";
        save += "" + Game.eventTimer;
        save += "|" + Game.selectedUnit;
        save += "|" + JSON.stringify(Game.curr);
        save += "|" + JSON.stringify(Game.incr);
        save += "|" + JSON.stringify(Game.units);
        save += "|" + Game.jobs.boneDiggers.name;
        save += "|" + Game.jobs.boneDiggers.skeletons;
        save += "|" + Game.jobs.boneDiggers.skelArmies;
        save += "|" + Game.jobs.boneDiggers.skelHorses;
        save += "|" + Game.jobs.boneDiggers.bps;
        save += "|" + Game.jobs.boneDiggers.gps;
        save += "|" + Game.jobs.boneDiggers.mps;
        save += "|" + Game.jobs.delinquents.name;
        save += "|" + Game.jobs.delinquents.skeletons;
        save += "|" + Game.jobs.delinquents.skelArmies;
        save += "|" + Game.jobs.delinquents.skelHorses;
        save += "|" + Game.jobs.delinquents.bps;
        save += "|" + Game.jobs.delinquents.gps;
        save += "|" + Game.jobs.delinquents.mps;
        let now = new Date();
        now.setFullYear(now.getFullYear()+5)    // Cookie expiry date set for 5 years
        save += "; expires="+now.toUTCString();
        document.cookie = save; //Saved
        console.log("Game Saved!");
    }


    Game.Load = function() {
        let save = document.cookie;
        if (document.cookie != "") {
            save = save.substr(0, save.length-1);   // Trims off the ] at the end
            save = save.substr(6);   // Trims off the 'save=' at the begining
            let savearr = save.split('|');

            Game.eventTimer = parseInt(savearr[0]);
            Game.selectedUnit = savearr[1];
            Game.curr = JSON.parse(savearr[2]);
            Game.incr = JSON.parse(savearr[3]);
            Game.units = JSON.parse(savearr[4]);
            Game.jobs.boneDiggers.name = savearr[5];
            Game.jobs.boneDiggers.skeletons = parseInt(savearr[6]);
            Game.jobs.boneDiggers.skelArmies = parseInt(savearr[7]);
            Game.jobs.boneDiggers.skelHorses = parseInt(savearr[8]);
            Game.jobs.boneDiggers.bps = parseFloat(savearr[9]);
            Game.jobs.boneDiggers.gps = parseFloat(savearr[10]);
            Game.jobs.boneDiggers.mps = parseFloat(savearr[11]);
            Game.jobs.delinquents.name = savearr[12];
            Game.jobs.delinquents.skeletons = parseInt(savearr[13]);
            Game.jobs.delinquents.skelArmies = parseInt(savearr[14]);
            Game.jobs.delinquents.skelHorses = parseInt(savearr[15]);
            Game.jobs.delinquents.bps = parseFloat(savearr[16]);
            Game.jobs.delinquents.gps = parseFloat(savearr[17]);
            Game.jobs.delinquents.mps = parseFloat(savearr[18]);
        }
    }

      //---------------//
     // Draw Function //
    //---------------//

    // What is displayed in the sidebar depends on the most recent button pushed, stats section by default
    // Also writing HTML purely with javascript is bad apparently. Doing it anyway >:D
    Game.DrawSidebar = function(page = "") {
        var statsSectionText
        switch (page) {
            case "store":
                statsSectionText =  "<h2>Shop</h2>" +
                                    "<h3>Shovels</h3>" +
                                    "<button class='button shop' style='display:"+Game.item["repairedShovel"].disp+";' id='buy-repaired-shovel' onclick='Game.purchase(\"repairedShovel\")'>" + 
                                        "<h4>Repaired Shovel</h4>"+
                                        "<img class='shovel' src='graphics/necromancy/repairedShovel.png' alt='Repaired Shovel'>" +
                                        "<span class='subtitle'>Better than your broken one!</span><br>" +
                                        "<div class='price'>-"+ Game.item["repairedShovel"].price +"<img class='icon' src='graphics/necromancy/coin-icon.png' alt='coin' /></div></button>" +

                                    "<button class='button shop' style='display:"+Game.item["handledShovel"].disp+";' id='buy-handled-shovel' onclick='Game.purchase(\"handledShovel\")'>" + 
                                        "<h4>Handy Shovel</h4>"+
                                        "<img class='shovel' src='graphics/necromancy/handledShovel.png' alt='Shovel with Handle'>" +
                                        "<span class='subtitle'>It's got a good grip!</span>" +   
                                        "<div class='price'>-"+ Game.item["handledShovel"].price +"<img class='icon' src='graphics/necromancy/coin-icon.png' alt='coin' /></div></button>" +                       

                                    "<button class='button shop' style='display:"+Game.item["doubleShovel"].disp+";' id='buy-double-shovel' onclick='Game.purchase(\"doubleShovel\")'>" + 
                                        "<h4>Double Shovel</h4>"+
                                        "<img class='shovel' src='graphics/necromancy/doubleShovel.png' alt='Double Sided Shovel'>" +
                                        "<span class='subtitle'>Double the Shovel, Double the Fun!</span>" +   
                                        "<div class='price'>-"+ Game.item["doubleShovel"].price +"<img class='icon' src='graphics/necromancy/coin-icon.png' alt='coin' /></div></button>" +

                                    "<br><br><h3>Items</h3>" +
                                    "<button class='button shop' style='display:"+Game.item["labEquipment"].disp+";' id='buy-lab-equipment' onclick='Game.purchase(\"labEquipment\")'>" + 
                                        "<h4>Lab Equipment</h4>"+
                                        "<img class='shovel' src='graphics/necromancy/coin-icon.png' alt='Lab Equipment'>" +
                                        "<span class='subtitle'>Vials and beakers, that kind of thing.</span><br>" +
                                        "<div class='price'>-"+ Game.item["labEquipment"].price +"<img class='icon' src='graphics/necromancy/coin-icon.png' alt='coin' /></div></button>" +

                                    "<button class='button shop' style='display:"+Game.item["archeologyTools"].disp+";' id='buy-archeology-tools' onclick='Game.purchase(\"archeologyTools\")'>" + 
                                        "<h4>Archeology Tools</h4>"+
                                        "<img class='shovel' src='graphics/necromancy/coin-icon.png' alt='Archeology Tools'>" +
                                        "<span class='subtitle'>Be more careful while digging up bones.</span>" +   
                                        "<div class='price'>-"+ Game.item["archeologyTools"].price +"<img class='icon' src='graphics/necromancy/coin-icon.png' alt='coin' /></div></button>" +                       

                                    "<button class='button shop' style='display:"+Game.item["petCat"].disp+";' id='buy-pet-cat' onclick='Game.purchase(\"petCat\")'>" + 
                                        "<h4>Pet Cat</h4>"+
                                        "<img class='shovel' src='graphics/necromancy/coin-icon.png' alt='Pet Cat Ms. Whiskers'>" +
                                        "<span class='subtitle'>Her name is Ms. Whiskers and she's very special</span>" +   
                                        "<div class='price'>-"+ Game.item["petCat"].price +"<img class='icon' src='graphics/necromancy/coin-icon.png' alt='coin' /></div></button>" +

                                    "<br><br><h3>Upgrades</h3>" +
                                    "<button class='button shop' style='display:"+Game.item["sharpSpears"].disp+";' id='buy-sharper-spears' onclick='Game.purchase(\"sharpSpears\")'>" + 
                                        "<h4>Sharper Spears</h4>"+
                                        "<img class='shovel' src='graphics/necromancy/coin-icon.png' alt='Sharper Spears'>" +
                                        "<span class='subtitle'>So your Skeletons can stab better.</span><br>" +
                                        "<div class='price'>-"+ Game.item["sharpSpears"].price +"<img class='icon' src='graphics/necromancy/coin-icon.png' alt='coin' /></div></button>" +

                                    "<button class='button shop' style='display:"+Game.item["skeletonArmor"].disp+";' id='buy-skeleton-armor' onclick='Game.purchase(\"skeletonArmor\")'>" + 
                                        "<h4>Skeleton Armor</h4>"+
                                        "<img class='shovel' src='graphics/necromancy/coin-icon.png' alt='Skeleton Armor'>" +
                                        "<span class='subtitle'>Harder. Better.</span>" +   
                                        "<div class='price'>-"+ Game.item["skeletonArmor"].price +"<img class='icon' src='graphics/necromancy/coin-icon.png' alt='coin' /></div></button>" +                       

                                    "<button class='button shop' style='display:"+Game.item["magicCarrots"].disp+";' id='buy-magic-carrots' onclick='Game.purchase(\"magicCarrots\")'>" + 
                                        "<h4>Magic Carrots</h4>"+
                                        "<img class='shovel' src='graphics/necromancy/coin-icon.png' alt='Magic Carrots'>" +
                                        "<span class='subtitle'>Horses Love 'Em!</span>" +   
                                        "<div class='price'>-"+ Game.item["magicCarrots"].price +"<img class='icon' src='graphics/necromancy/coin-icon.png' alt='coin' /></div></button>";
                break;

            default:   // Default is the stats page
                statsSectionText =  "<h2>Game Stats</h2>" +
                                    "<span style='font-weight: bold;'>Current Shovel: </span>" + Game.currentShovel + "<br>" +
                                    "<span style='font-weight: bold;'>Digging Skill: </span>" + Game.incr.digSkill + "<br>" +
                                    "<span style='font-weight: bold;'>Bones/Sec: </span>" + floor2(Game.incr.bps) + "<br>" +
                                    "<span style='font-weight: bold;'>Gold/Sec: </span>" + floor2(Game.incr.gps) + "<br>" +
                                    "<span style='font-weight: bold;'>Mana Recharge: </span>" + floor2(Game.incr.mps) + "<br>" +
                                    "<span style='font-weight: bold;'>Bones/Sec Multiplier: </span>" + floor2(Game.incr.bpsmult) + "<br>" +
                                    "<span style='font-weight: bold;'>Gold/Sec Multiplier: </span>" + floor2(Game.incr.gpsmult) + "<br>" +
                                    "<span style='font-weight: bold;'>Mana Recharge Multiplier: </span>" + floor2(Game.incr.mpsmult) + "<br>";
                                    ;
                break;
        }
        $('info-section').innerHTML = statsSectionText;
    }

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
        // After the bps gets high enough, we want to stop live updating the bonecount when digging
        // Otherwise it actually lags the game!
        if (Game.bps < 15) { $('bonecount').innerHTML = Game.bones; }

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
        Game.DrawSidebar();
    }


    Game.purchase = function(item) {
        console.log("Purchase item: " + item);

        switch (item) {
            case "repairedShovel":
                if (Game.curr.gold >= Game.item["repairedShovel"].price) {
                    Game.item["repairedShovel"].owned++;
                    Game.item["repairedShovel"].disp = "none";
                    $('buy-repaired-shovel').style.display="none";
                    Game.curr.gold -= Game.item["repairedShovel"].price;
                    
                    Game.incr.digSkill = Game.item["repairedShovel"].mod;
                    Game.currentShovel = "Repaired Shovel";

                } else { console.log("Not enough money!"); }
                break;

            case "handledShovel":
                if (Game.curr.gold >= Game.item["handledShovel"].price) {
                    Game.item["handledShovel"].owned++;
                    Game.item["handledShovel"].disp = "none";
                    $('buy-handled-shovel').style.display="none";
                    Game.curr.gold -= Game.item["handledShovel"].price;

                    Game.incr.digSkill = Game.item["handledShovel"].mod;
                    Game.currentShovel = "Repaired Shovel";

                } else { console.log("Not enough money!"); }
                break;

            case "doubleShovel":
                if (Game.curr.gold >= Game.item["doubleShovel"].price) {
                    Game.item["doubleShovel"].owned++;
                    Game.item["doubleShovel"].disp = "none";
                    $('buy-double-shovel').style.display="none";
                    Game.curr.gold -= Game.item["doubleShovel"].price;

                    Game.incr.digSkill = Game.item["doubleShovel"].mod;
                    Game.currentShovel = "Repaired Shovel";

                } else { console.log("Not enough money!"); }
                break;

            // Items (as in, actual items)
            case "labEquipment":
                if (Game.curr.gold >= Game.item["labEquipment"].price) {
                    Game.item["labEquipment"].owned++;
                    Game.item["labEquipment"].disp = "none";
                    $('buy-lab-equipment').style.display="none";
                    Game.curr.gold -= Game.item["labEquipment"].price;

                    Game.units.skeletons.manacost *= .8;
                    Game.units.skelArmies.manacost *= .8;
                    Game.units.skelHorses.manacost *= .8;

                    Game.curr.maxmana *= 2;

                } else { console.log("Not enough money!"); }
                break;

            case "archeologyTools":
                if (Game.curr.gold >= Game.item["archeologyTools"].price) {
                    Game.item["archeologyTools"].owned++;
                    Game.item["archeologyTools"].disp = "none";
                    $('buy-archeology-tools').style.display="none";
                    Game.curr.gold -= Game.item["archeologyTools"].price;

                    Game.units.skeletons.bonecost *= .8;
                    Game.units.skelArmies.bonecost *= .8;
                    Game.units.skelHorses.bonecost *= .8;

                } else { console.log("Not enough money!"); }
                break;

            case "petCat":
                if (Game.curr.gold >= Game.item["petCat"].price) {
                    Game.item["petCat"].owned++;
                    Game.item["petCat"].disp = "none";
                    $('buy-pet-cat').style.display="none";
                    Game.curr.gold -= Game.item["petCat"].price;

                    Game.curr.maxmana *= 10;
                    Game.incr.mpsmult += 4;

                } else { console.log("Not enough money!"); }
                break;

            // Upgrades
            case "sharpSpears":
                if (Game.curr.gold >= Game.item["sharpSpears"].price) {
                    Game.item["sharpSpears"].owned++;
                    Game.item["sharpSpears"].disp = "none";
                    $('buy-sharper-spears').style.display = "none";
                    Game.curr.gold -= Game.item["sharpSpears"].price;

                    Game.jobs.delinquents.bpsmult += 2;
                    Game.jobs.delinquents.gpsmult += 2;

                } else { console.log("Not enough money!"); }
                break;

            case "skeletonArmor":
                if (Game.curr.gold >= Game.item["skeletonArmor"].price) {
                    Game.item["skeletonArmor"].owned++;
                    Game.item["skeletonArmor"].disp = "none";
                    $('buy-skeleton-armor').style.display = "none";
                    Game.curr.gold -= Game.item["skeletonArmor"].price;

                    Game.jobs.delinquents.bpsmult += 4;
                    Game.jobs.delinquents.gpsmult += 4;

                } else { console.log("Not enough money!"); }
                break;

            case "magicCarrots":        
                if (Game.curr.gold >= Game.item["magicCarrots"].price) {
                    Game.item["magicCarrots"].owned++;
                    Game.item["magicCarrots"].disp = "none";
                    $('buy-magic-carrots').style.display = "none";
                    Game.curr.gold -= Game.item["magicCarrots"].price;

                    Game.jobs.delinquents.horseMult += 20;

                } else { console.log("Not enough money!"); }
                break;

            default:

        }
    }

      //------------//
     // Game Logic //
    //------------//
    Game.Logic = function() {
        Game.incr.bps =  (Game.jobs.boneDiggers.bps + Game.jobs.delinquents.bps) * Game.incr.bpsmult;
        Game.incr.gps =  (Game.jobs.boneDiggers.gps + Game.jobs.delinquents.gps) * Game.incr.gpsmult;
        Game.incr.mps =  (Game.jobs.boneDiggers.mps + Game.jobs.delinquents.mps + 1) * Game.incr.mpsmult;

        Game.curr.bones += Game.incr.bps/Game.fps;
        Game.curr.gold += Game.incr.gps/Game.fps;

        // We have a maximum mana, this handle that.
        if (Game.curr.mana < Game.curr.maxmana) {       // Increment if under max
            Game.curr.mana += Game.incr.mps/Game.fps;
        } else { Game.curr.mana = Game.curr.maxmana; }  // If over max, set to max

    }

      //--------------------//
     // The Main Game Loop //
    //--------------------//
    Game.Loop = function() {
        Game.Logic();
        Game.Draw();

        if (++Game.eventTimer > 1000*60) { Game.Save(); Game.evenTimer = 0; }   // Save the game to a cookie every 10 seconds
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
        Game.DrawSidebar();
    })();
}

window.onload = function(){ Game.Launch(); }
