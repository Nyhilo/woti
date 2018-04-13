  ///////////////////////
 // Side Menu Buttons //
///////////////////////

function openInfo() {
    let infopanel = document.getElementById("info");
    let navpanel = document.getElementById("nav");
    let infobutton = document.getElementById("infobtn");
    let hamburgbutton = document.getElementById("hamburgbtn");
    let maindiv = document.getElementById("main");
    let infowidth = infopanel.getBoundingClientRect().width 
    let burgerwidth = navpanel.getBoundingClientRect().width 

    if (infopanel.style.left == "0px") {
        infopanel.style.left = "-" + infowidth + "px";
        infobutton.style.left = "0px";
        hamburgbutton.style.left = "0px"
        maindiv.style.marginLeft = "0px"
        console.log("Closed Info Panel");
    } else {
        navpanel.style.left = "-" + infowidth + "px";
        infopanel.style.left = "0px";
        infobutton.style.left = infowidth + "px";
        hamburgbutton.style.left = infowidth + "px"
        maindiv.style.marginLeft = infowidth + "px"
        console.log("Opened Info Panel");
    }
    
}

function openHamburg() {
    let infopanel = document.getElementById("info");
    let navpanel = document.getElementById("nav");
    let infobutton = document.getElementById("infobtn");
    let hamburgbutton = document.getElementById("hamburgbtn");
    let maindiv = document.getElementById("main");
    let infowidth = infopanel.getBoundingClientRect().width 
    let burgerwidth = navpanel.getBoundingClientRect().width 

    if (navpanel.style.left == "0px") {
        navpanel.style.left = "-" + burgerwidth + "px";
        infobutton.style.left = "0px";
        hamburgbutton.style.left = "0px";
        maindiv.style.marginLeft = "0px"
        console.log("Closed Nav Panel");
    } else {
        navpanel.style.left = "0px";
        infopanel.style.left = "-" + infowidth + "px";
        infobutton.style.left = burgerwidth + "px";
        hamburgbutton.style.left = burgerwidth + "px";
        maindiv.style.marginLeft = burgerwidth + "px"
        console.log("Opened Nav Panel");
    }
    
}