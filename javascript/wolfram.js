/*
Rewriting Wolfram.js for an html canvas, because doing it with fonts is badly non-portable



Jacob CLoward 4/5/18
*/

// window.onload = function() {

  /////////////
 // Globals //
/////////////

// Shortcuts for html elements
let simField        = document.getElementById("sim-area");
let context         = simField.getContext("2d")
let simInput        = document.getElementById("sim-first-line");
let inContext       = simInput.getContext("2d")


// Grid width and height, this will probably become more flexible later
let field       = new Array();
let inField     = new Array();
let width       = simField.width;
let height      = simField.height;
let inWidth     = simInput.width;
let inHeight    = simInput.height;
let cellSize   = 10;

// Grid styling
const gridColor       = "#DEDCD8";
// const gridColor       = "white"
// const gridColor       = "#F7F5EF"
const cellColor      = "#333332"
const gridThickness   = 2;

// There are 8 rules for the simulation. We'll define rule 30 as an initial state just for fun
// The array elements correspond to the rules [111,110,101,100,011,010,001,000]
let rules = [0,0,0,1,1,1,1,0];

let ruleIDs = [document.getElementById("rule1"),
               document.getElementById("rule2"),
               document.getElementById("rule3"),
               document.getElementById("rule4"),
               document.getElementById("rule5"),
               document.getElementById("rule6"),
               document.getElementById("rule7"),
               document.getElementById("rule8")];

  ////////////////////
 // Rule Functions //
////////////////////

function drawRules() {
    for (var i = 0; i < rules.length; i++) {
        if ( rules[i] ) {
            ruleIDs[i].style.backgroundColor = "#333332";
        } else {
            ruleIDs[i].style.backgroundColor = "";
        }
    }
    document.getElementById("ruleNumber").innerHTML = parseInt(rules.join(''), 2);
}

function updateRule(i) {
    if (ruleIDs[i].style.backgroundColor == "") {
        rules[i] = 1;
    } else {
        rules[i] = 0;
    }


    drawRules();
}

function rule30() {
    rules = [0,0,0,1,1,1,1,0];
    clearBoard();
    drawRules();
}

function rule105() {
    rules = [0,1,1,0,1,0,0,1];
    clearBoard();
    drawRules();
}

function rule110() {
    rules = [0,0,1,1,1,0,0,1];
    clearBoard();
    drawRules();
}



  ////////////////////
 // Draw Functions //
////////////////////

function clearBoard() {
    // Frist we clear the board
    context.beginPath();
    context.clearRect(0, 0, simField.width, simField.height);

    // Now we draw the rest of the board
    for (let x = 0; x <= width; x+=cellSize) {
        context.moveTo(x,0);
        context.lineTo(x,height);
    }

    for (let y = 0; y <= height; y+=cellSize) {
        context.moveTo(0,y);
        context.lineTo(width,y)   
    }

    // And stroke the grid
    context.strokeStyle = gridColor;
    context.lineWidth = gridThickness;
    context.stroke();
}

function clearInput() {
    // Frist we clear the input board
    inContext.beginPath(); 
    inContext.clearRect(0, 0, simInput.width, simInput.height);
    
    // Draw the first line board.
    // The first line is garanteed to be one cell deep so we don't need complex vertical lines
    for (let x = 0; x <= inWidth; x+=cellSize) {
        inContext.moveTo(x,0);
        inContext.lineTo(x,inHeight);
    }

    // Draw the top and bottom lines of the first line box
    inContext.moveTo(0,0);
    inContext.lineTo(inWidth,0);

    inContext.moveTo(0,inHeight);
    inContext.lineTo(inWidth,inHeight)

    // Stroke the first line box lines
    inContext.strokeStyle = gridColor;
    inContext.lineWidth = gridThickness;
    inContext.stroke();
}

function drawCell(ctx, i, j) {
    ctx.fillRect(
        j*cellSize+1, (i)*cellSize+1, cellSize-2, cellSize-2
        );
}

function drawBoard() {
    // Clear board
    clearBoard();
    // Smol variables
    let h = height/cellSize;
    let w = width/cellSize;

    for (let i = 0; i < h; i++) {
        for (let j = 0; j < w; j++) {
            if ( field[i][j] == 1) {
                drawCell(context, i, j);
            }
        }
    }
}

function drawInput() {
    clearInput();
    let w = width/cellSize;

    for (var j = 0; j < w; j++) {
        if ( inField[j] == 1 ) {
            drawCell(inContext, 0, j);
        }
    }
}

  ///////////////////////
 // General Functions //
///////////////////////

// Allows us to really quickly generate an array of arbitrary multidimensional size
// Takes an array of dimension sizes as an input
// For example, an input of [2,3,5] with create a 3d array of size 2x3x5
function createArray(dimensions) {
    // Pulls out the first dimentional length
    let [length, ...rest] = dimensions;
    // Creates our return array
    let arr = new Array(length || 0);

    // If there are more dimentions in the input array, create a sub-array for each index in the current array
    // and run the same formula for each of those. This is what lets us generate an array of arbitrary dimensions
    if (rest.length) {
        for (let i = 0; i < length; i++) {
            arr[i] = createArray(rest);
        }
    }

    return arr;
}

// With this we can click on the cells in the input row to change the pattern
simInput.addEventListener('click', (e) => {
    // We need to get the position of the canvas in order to click it properly
    let simInputEdge = simInput.getBoundingClientRect();

    const clickPosition = e.clientX;
    const relativePosition = clickPosition - simInputEdge.left;

    // The cell we clicked on is the relative position (by pixel) size of a cell
    position = Math.ceil(relativePosition / cellSize) - 1; // Though arrays start at 0, hence -1

    // Reverse the value of the clicked cell and redraw the board
    // if x=0, 1-(x) = 1  |  if x=1, 1-(x) = 0. Neat. 
    inField[position] = 1 - inField[position] 
    drawInput();

});

// Runs the wolfram simulation depending on the rules currently defined.
function runSim() {
    // Iterate through all cells in the field
    for (let i = 0; i < field.length; i++) {
        // Row 0 of field needs to reference the input field
        let previousRow = (i == 0 ? inField : field[i-1])
        // field[0].lenth is the width of the 2d array
        for (let j = 0; j < field[0].length; j++) {
            // State will be something like "110" and will be the thing we check against the rules
            let state = ""
            // The first state value is the value up and to the left of the cell we're checking
            state += ( j == 0 ? 0 : previousRow[j-1] );

            // The second state value is the value right above the current cell
            state += previousRow[j];

            // The third state value is the value up and to the right of the cell
            state += ( j == field[0].length-1 ? 0 : previousRow[j+1] );

            switch(state) {
                case "111":
                    field[i][j] = rules[0];
                    break;
                case "110":
                    field[i][j] = rules[1];
                    break;
                case "101":
                    field[i][j] = rules[2];
                    break;
                case "100":
                    field[i][j] = rules[3];
                    break;
                case "011":
                    field[i][j] = rules[4];
                    break;
                case "010":
                    field[i][j] = rules[5];
                    break;
                case "001":
                    field[i][j] = rules[6];
                    break;
                case "000":
                    field[i][j] = rules[7];
                    break;

                default:
                    console.debug("Error during wolfram calculation. State did not resolve correctly.")       
            }

        }

    }
}

function reset() {
    runSim();
    drawBoard();
    drawInput();
    drawRules();
}

function randomizeInput() {
    for (var i = 0; i < inField.length; i++) {
        inField[i] = Math.round(Math.random())
    } 
    drawInput();
}

  //////////
 // Main //
//////////


function main() {
    // Create a 2d array that fits in the canvas and initialize every value to 0
    field = createArray([height/cellSize, width/cellSize]);

    for (let i = 0; i < field.length; i++) {
        for (let j = 0; j < field[0].length; j++) {
            field[i][j] = 0;
        }
    }

    // Create a 1d array for the input feild. It will be initialized randomly
    inField = createArray([width/cellSize]);
    randomizeInput();

    runSim();
    clearBoard();
    drawInput();
    drawRules();
}

main();


// }    // Closing the DOM loader at the top