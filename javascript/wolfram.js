/*
Jacob Cloward 2/2/18
Javascript for calculating Wolfram's Rules of Cellular Automation
Simulation area will consist of an array of pixels, representing alive and dead cells
Pixel values are given by "□" (&#9633;), and "■" (&#9632;)
The first line of the simulation will be initialized randomly, and the individual
    cells will be clickable to change their staties
Subsequent layers will run the simluation based on the defined rules

The Options area will allow the user define the rules, as well as select pre-defined
    rule sets from a drop down menu (Such as the famous turning complete Rule 110).

Details on simple cellular automation here: https://en.wikipedia.org/wiki/Elementary_cellular_automaton
The Gist is that there are 8 rules that define a simulation. These correspond to the state of the cells
    immediately above and to the upper corners from another pixel.
    For instance, rule 110 is defined like so:
    111 110 101 100 011 010 001 000
     0   1   1   0   1   1   1   0

    Which corresponds to the pixel pattern:
    ■■■ ■■□ ■□■ ■□□ □■■ □■□ □□■ □□□
     □   ■   ■   □   ■   ■   ■   □

*/
// window.onload = function() {

  /////////////
 // Globals //
/////////////

// Shortcuts for html elements
var simField     = document.getElementById("sim-area");
var simFirstLine = document.getElementById("sim-first-line");
var rulesDefined = document.getElementById("rules-defined");

// Grid width and height, this will probably become more flexible later
var field = new Array();
var fieldWidth   = 40;
var fieldHeight  = 40;

// There are 8 rules for the simulation. We'll define rule 30 as an initial state just for fun
// The array elements correspond to the rules [111,110,101,100,011,010,001,000]
var rules = [0,0,0,1,1,1,1,0];


  ///////////////////////
 // General Functions //
///////////////////////

// Stolen from stack overflow
// Allows us to really quickly generate an array of arbitrary multidimensional size
function createArray(length) {
    var arr = new Array(length || 0),
        i = length;

    if (arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments, 1);
        while(i--) arr[length-1 - i] = createArray.apply(this, args);
    };

    return arr;
};


// returns either a blank or filled pixel
function randomPixel() {
    // Math.round(Math.random()) will return either a 1 or a 0
    if (Math.round(Math.random())) { return "■"; }
        else { return "□"; };
};

function convertPixel(pix) {
    // pix will either be a 1 or 0
    if (pix) { return "■"; }
        else { return "□"; };
}

function convertState(state) {
    // pix will either be a "■" or "□"
    if (state == "■") { return 1; }
        else { return 0; };    
}

function updateRules() {
    rulesString = "&nbsp;&nbsp;■■■&nbsp;■■□&nbsp;■□■&nbsp;■□□&nbsp;□■■&nbsp;□■□&nbsp;□□■&nbsp;□□□<br>";
    for (var i = 0; i <= rules.length - 1; i++) {
        rulesString += "&nbsp;&nbsp;&nbsp;" + convertPixel(rules[i]);
    };
    console.log(rulesString);
    rulesDefined.innerHTML = rulesString;
};

function update() {
    simFirstLine.innerHTML = field[0].join("");
    var fieldString = ""; 

    for (var i = 1; i <= field.length - 1; i++) {
        fieldString += field[i].join("") + "<br>";
    };

    simField.innerHTML = fieldString;
};

function wolfram() {
    var state = "";

    for (var i = 1; i <= field.length - 1; i++) {
        for (var j = 0; j <= field[i].length - 1; j++) {
            // State will be something like "110" and will be the thing we check against the rules
            state = ""

            // The first state value is the value up and to the left of the cell we're checking
            if (j == 0) { state += 0; }
                else { state += convertState(field[i-1][j-1]); };

            // The second state value is the value right above the current cell
            state += convertState(field[i-1][j]);

            // The third state value is the value up and to the right of the cell
            if (j == field[i].length) { state += 1; }
                else { state += convertState(field[i-1][j+1]); };

            switch(state) {
                case "111":
                    field[i][j] = convertPixel(rules[0]);
                    break;
                case "110":
                    field[i][j] = convertPixel(rules[1]);
                    break;
                case "101":
                    field[i][j] = convertPixel(rules[2]);
                    break;
                case "100":
                    field[i][j] = convertPixel(rules[3]);
                    break;
                case "011":
                    field[i][j] = convertPixel(rules[4]);
                    break;
                case "010":
                    field[i][j] = convertPixel(rules[5]);
                    break;
                case "001":
                    field[i][j] = convertPixel(rules[6]);
                    break;
                case "000":
                    field[i][j] = convertPixel(rules[7]);
                    break;

                default:
                    console.debug("Error during wolfram calculation. State did not resolve correctly.")       
            }

        };
    };
    update(field);
};

function reset() {
    //The first line is special because it will initialize random and be clickable
    for (var i = field[0].length - 1; i >= 0; i--) {
        field[0][i] = randomPixel();
    };

    for (var i = field.length - 1; i >= 1; i--) {
        for (var j = field[i].length - 1; j >= 0; j--) {
            field[i][j] = "□";
        };
    };
    update();
    updateRules();
};

  //////////
 // Main //
//////////

// Not sure if this is Javascript general practice but I'm a Python Programmer so... main function
function main() {
    // Setting up our pixel field
    field = createArray(fieldHeight,fieldWidth);

    reset();
};

main();

// };

