$(document).ready(function() {
    // this handler also triggers when user clicks Enter in an input field
    $("#gamesButton").click(function() {
            $(".group :input").each(function() {

                    if($(this).val() >= 0 && $(this).val() <= 1337 && $(this).val().length > 0){
                            return;
                    }
 
                    alert("You have entered incorrect values in one or more of the input fields. The values must be ranging from 0 to 1337");

                    if(navigator.appName == "Microsoft Internet Explorer"){
                            event.returnValue = false;
                            return false;
                    }
                    else{
                            event.preventDefault();
                            return false;
                    }
            });
    });


        
});

function myFunction(elementID, nextStage)
{
    var id=document.getElementById(elementID);
    var prefix=id.id.split("_");

    var x=document.getElementById(getOpponentTeamID(id.id, prefix[0], getPrefix(id.id)));

    if (x == null)
        return;

    if (parseInt(id.value, 10 ) == parseInt(x.value, 10)) {
        document.getElementById(getMyElementID(id.id, prefix[0], "OT")).disabled = false;
        document.getElementById(getOpponentTeamID(id.id, prefix[0], "OT")).disabled = false;

        var nextMatchFlag = document.getElementById(getNextStage(id.id, "flaglabel", nextStage));
        var nextMatchCountry = document.getElementById(getNextStage(id.id, "countrylabel", nextStage));
        var nextMatchScoreP = document.getElementById(getNextStage(id.id, "scoreP", nextStage));
        var nextMatchScoreOT = document.getElementById(getNextStage(id.id, "scoreOT", nextStage));
        var nextMatchScoreFT = document.getElementById(getNextStage(id.id, "scoreFT", nextStage));
        
        if(nextMatchFlag.firstElementChild != null) {
            nextMatchFlag.removeChild(nextMatchFlag.firstElementChild);
            nextMatchCountry.removeChild(nextMatchCountry.firstElementChild);
            nextMatchScoreP.removeChild(nextMatchScoreP.lastChild);
            nextMatchScoreOT.removeChild(nextMatchScoreOT.lastChild);
            nextMatchScoreFT.removeChild(nextMatchScoreFT.lastChild);
        }
    }

    if (parseInt(id.value, 10) != parseInt(x.value, 10)) {
        document.getElementById(getMyElementID(id.id, prefix[0], "OT")).disabled = true;
        document.getElementById(getOpponentTeamID(id.id, prefix[0], "OT")).disabled = true;
    }
        
    if (parseInt(id.value, 10) > parseInt(x.value, 10)) {
        var countrylabel = id.parentNode.parentNode.getElementsByTagName("span")[0].innerText;
        var nextMatchFlag = document.getElementById(getNextStage(id.id, "flaglabel", nextStage));
        var nextMatchCountry = document.getElementById(getNextStage(id.id, "countrylabel", nextStage));
        var nextMatchScoreP = document.getElementById(getNextStage(id.id, "scoreP", nextStage));
        var nextMatchScoreOT = document.getElementById(getNextStage(id.id, "scoreOT", nextStage));
        var nextMatchScoreFT = document.getElementById(getNextStage(id.id, "scoreFT", nextStage));

        var res = id.name.split("_");
        var img = new Image();
        img.src = "images/" + res[0] + ".svg.png";
        img.height = 50;
        img.width = 50;
        var countrySpan = document.createElement('span');
        countrySpan.innerText = countrylabel;

        var inputP = document.createElement("input");
        inputP.type = "number";
        inputP.id = getNextStage(id.id, nextStage, "P");
        inputP.name = getNextStage(id.id, res[0], nextStage + "P");
        inputP.min = 0;
        inputP.max = 20;
        inputP.disabled = true;

        var inputOT = document.createElement("input");
        inputOT.type = "number";
        inputOT.id = getNextStage(id.id, nextStage, "OT");
        inputOT.name = getNextStage(id.id, res[0], nextStage + "OT");
        inputOT.min = 0;
        inputOT.max = 20;
        inputOT.disabled = true;

        var inputFT = document.createElement("input");
        inputFT.type = "number";
        inputFT.id = getNextStage(id.id, nextStage, "FT");
        inputFT.name = getNextStage(id.id, res[0], nextStage + "FT");
        inputFT.min = 0;
        inputFT.max = 20;
        inputFT.disabled = false;
        inputFT.onchange = function () {  
            myFunction(getNextStage(id.id, nextStage, "FT"), getNextFinalStage(nextStage));
        };

        if(nextMatchFlag.firstElementChild == null) {
            nextMatchFlag.appendChild(img);
            nextMatchCountry.appendChild(countrySpan);
            nextMatchScoreP.appendChild(inputP);
            nextMatchScoreOT.appendChild(inputOT);
            nextMatchScoreFT.appendChild(inputFT);
        }
        else {
            nextMatchFlag.replaceChild(img, nextMatchFlag.firstElementChild);
            nextMatchCountry.replaceChild(countrySpan, nextMatchCountry.firstElementChild);
            nextMatchScoreP.replaceChild(inputP, nextMatchScoreP.lastChild);
            nextMatchScoreOT.replaceChild(inputOT, nextMatchScoreOT.lastChild);
            nextMatchScoreFT.replaceChild(inputFT, nextMatchScoreFT.lastChild);
        }
            
    }

    if (parseInt(id.value, 10 ) < parseInt(x.value, 10)) {
        var countrylabel = x.parentNode.parentNode.getElementsByTagName("span")[0].innerText;
        var nextMatchFlag = document.getElementById(getNextStage(id.id, "flaglabel", nextStage));
        var nextMatchCountry = document.getElementById(getNextStage(id.id, "countrylabel", nextStage));
        var nextMatchScoreP = document.getElementById(getNextStage(id.id, "scoreP", nextStage));
        var nextMatchScoreOT = document.getElementById(getNextStage(id.id, "scoreOT", nextStage));
        var nextMatchScoreFT = document.getElementById(getNextStage(id.id, "scoreFT", nextStage));

        var res = x.name.split("_");
        var img = new Image();
        img.src = "images/" + res[0] + ".svg.png";
        img.height = 50;
        img.width = 50;
        var countrySpan = document.createElement('span');
        countrySpan.innerText = countrylabel;

        var inputP = document.createElement("input");
        inputP.type = "number";
        inputP.id = getNextStage(id.id, nextStage, "P");
        inputP.name = getNextStage(id.id, res[0], nextStage + "P");
        inputP.min = 0;
        inputP.max = 20;
        inputP.disabled = true;

        var inputOT = document.createElement("input");
        inputOT.type = "number";
        inputOT.id = getNextStage(id.id, nextStage, "OT");
        inputOT.name = getNextStage(id.id, res[0], nextStage + "OT");
        inputOT.min = 0;
        inputOT.max = 20;
        inputOT.disabled = true;

        var inputFT = document.createElement("input");
        inputFT.type = "number";
        inputFT.id = getNextStage(id.id, nextStage, "FT");
        inputFT.name = getNextStage(id.id, res[0], nextStage + "FT");
        inputFT.min = 0;
        inputFT.max = 20;
        inputFT.disabled = false;
        inputFT.onchange = function () {  
            myFunction(getNextStage(id.id, nextStage, "FT"), getNextFinalStage(nextStage));
        };

        if(nextMatchFlag.firstElementChild == null) {
            nextMatchFlag.appendChild(img);
            nextMatchCountry.appendChild(countrySpan);
            nextMatchScoreP.appendChild(inputP);
            nextMatchScoreOT.appendChild(inputOT);
            nextMatchScoreFT.appendChild(inputFT);
        }
        else {
            nextMatchFlag.replaceChild(img, nextMatchFlag.firstElementChild);
            nextMatchCountry.replaceChild(countrySpan, nextMatchCountry.firstElementChild);
            nextMatchScoreP.replaceChild(inputP, nextMatchScoreP.lastChild);
            nextMatchScoreOT.replaceChild(inputOT, nextMatchScoreOT.lastChild);
            nextMatchScoreFT.replaceChild(inputFT, nextMatchScoreFT.lastChild);
        }
            
    }
}

function getPrefix(id) {
    var str = id.split("_");
    return str[1].slice(0,2);
}

function getNextFinalStage(stage) {
    var nextStage = "";

    if (stage == "R16")
        nextStage = "QF"
    if (stage == "QF")
        nextStage = "SF"
    if (stage == "SF")
        nextStage = "FF"

    return nextStage;
}

function getNextStage(id, label, prefix) {
    var matchid = id.split("_");
    var str = matchid[1];
    var num = 0;

    if (str.length == 3) {
        num = str.slice(2,str.length);    
    }
    if (str.length == 4) {
        num = str.slice(2,str.length); 
    }

    var nextStage = 0;

    if (parseInt(num, 10) <= 2) {
        nextStage = 1;
    }
    else if (parseInt(num, 10) <= 4) {
        nextStage = 2;
    }
    else if (parseInt(num, 10) <= 6) {
        nextStage = 3;
    }
    else if (parseInt(num, 10) <= 8) {
        nextStage = 4;
    }
    else if (parseInt(num, 10) <= 10) {
        nextStage = 5;
    }
    else if (parseInt(num, 10) <= 12) {
        nextStage = 6;
    }
    else if (parseInt(num, 10) <= 14) {
        nextStage = 7;
    }
    else if (parseInt(num, 10) <= 16) {
        nextStage = 8;
    }

    return label + "_" + prefix + "" + nextStage;
}

function getMyElementID(id, label, prefix) {
    var matchid = id.split("_");
    var str = matchid[1];
    var str2 = "";
    var num = "";

    if (str.length == 3) {
        num = str.slice(2,str.length);    
    }
    if (str.length == 4) {
        num = str.slice(2,str.length); 
    }

    if (parseInt(num, 10) % 2 == 1) {
        str2 = label + "_" + prefix + "" + parseInt(num, 10) + "";
        
    }
    else {
        str2 = label + "_" + prefix + "" + parseInt(num, 10) + "";
    }

    return str2;
}

function getOpponentTeamID(id, label, prefix) {
    var matchid = id.split("_");
    var str = matchid[1];
    var str2 = "";
    var num = "";

    if (str.length == 3) {
        num = str.slice(2,str.length);    
    }
    if (str.length == 4) {
        num = str.slice(2,str.length); 
    }

    if (parseInt(num, 10) % 2 == 1) {
        str2 = label + "_" + prefix + "" + (parseInt(num, 10) + 1) + "";
        
    }
    else {
        str2 = label + "_" + prefix + "" + (parseInt(num, 10) - 1) + "";
    }

    return str2;
}

function getAllInputFields() {
    var inputs, index;

    inputs = document.getElementsByTagName('input');
    for (index = 0; index < inputs.length; ++index) {
        if(inputs[index].value.length > 0) {
            console.log("value: -" + inputs[index].value + "-" + inputs[index].value.length);
            console.log(inputs[index]);
        }
    }
}