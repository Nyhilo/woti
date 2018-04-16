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

function $(id) {return document.getElementById(id);}


  //////////////////////
 // Game Initializer //
//////////////////////

let Game = {} 

Game.Launch = function() {
    //
}