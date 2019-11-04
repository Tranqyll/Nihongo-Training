/*jslint browser:true */
/*global Papa */

GITHUB_DATA_URL = ""
    
/*
 * ----- Support section ------
 */

// From http://stackoverflow.com/a/8813472/3570066
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(obj, start) {
        for (var i = (start || 0), j = this.length; i < j; i++) {
            if (this[i] === obj) { return i; }
        }
        return -1;
    };
}

// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/Trim
if (!String.prototype.trim) {
    String.prototype.trim = function () {
        return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    };
}
    
/*
 * ----- Cookie Stuff -----
 */

// From W3Schools
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    document.cookie = cname + "=" + cvalue + "; " + "expires=" + d.toUTCString();
}

// From W3Schools
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    var i;
    for(i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function checkCookiesOnStart() {
    if(navigator.cookieEnabled === true) {
        var random = getCookie("randomButton");
        if(random == 'true') {
            document.getElementById('randomButton').checked = true;    
        }
        
        var limitBut = getCookie("limitButton");
        if(limitBut == 'true') {
            document.getElementById('limitButton').checked = true;
            document.getElementById('numberOfWords').disabled = false;
        }
        
        var limit = getCookie("numberOfWords");
        if(limit !== "") {
            document.getElementById('numberOfWords').value = parseInt(limit);    
        }
        
        var rd_jptoen = getCookie("radio_jptoen");
        if(rd_jptoen == 'true') {
            document.getElementById('radio_jptoen').checked = true;    
        }
        var rd_entojp = getCookie("radio_entojp");
        if(rd_entojp == 'true') {
            document.getElementById('radio_entojp').checked = true;    
        }
        var rd_both = getCookie("radio_both");
        if(rd_both == 'true') {
            document.getElementById('radio_both').checked = true;    
        }
    }
}
    
/*
 * ----- General functions -----
 */
    
// From http://stackoverflow.com/a/6274398/3570066
function shuffle(array) {
    var counter = array.length;

    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        var index = Math.floor(Math.random() * counter);

        // Decrease counter by 1
        counter--;

        // And swap the last element with it
        var temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }
    return array;
}

// From http://stackoverflow.com/a/1026087/3570066
String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};
    
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

// percent must be an integer in range [0,100]
function moveProgressBarTo(percent) {
    var elem = document.getElementById("resultsProgress");   
    var width = 0;
    elem.style.width = "0%";
    elem.className = "w3-progressBar w3-red";
    var id = setInterval(frame, 10);
    function frame() {
        if (width >= percent) {
             clearInterval(id);
        } else {
            width++; 
            elem.style.width = width + '%'; 
            document.getElementById("resultsProgressLabel").innerHTML = width * 1  + '%';
              
            // Update color
            if(width == 40) {
                elem.className = "w3-progressBar w3-deep-orange";
            } else if(width == 65) {
                elem.className = "w3-progressBar w3-orange";
            } else if(width == 85) {
                elem.className = "w3-progressBar w3-green";
            }
        }
    }
}
    
// Retrieve a list from a csv file using papa parse
function getCSVList(url, onFinishedFunction) {
    Papa.parse(url, {
        download: true,
        delimiter: "=",
        fastMode: true,
        complete: function(results, file) {
            // Papa parse appends an empty item at the end of the list
            // So, remove it
            while(results.data[results.data.length-1][0] === "") {
                results.data.pop();
            }
            
            onFinishedFunction(results.data);
        }
    });
}
    
// Return a concatanation of all subjects for a book
function getAllSubjects(bookId, onFinishedFunction) {
    getCSVList("data/" + bookId + ".csv", function(data) {
        var mainList = [];
        var subCount = data.length;
        var i = 0;
        var handleSubRequest = function(subData) {
            mainList = mainList.concat(subData);
            i = i+1;
            if(i >= subCount) {
                // All subjects have been retrieved
                onFinishedFunction(mainList);
            } else {
                getCSVList("data/subjects/" + data[i][0] + ".csv", handleSubRequest);
            }
        };
        
        getCSVList("data/subjects/" + data[i][0] + ".csv", handleSubRequest);
    });
}
    
/*
 * ----- Highlight the selected item -----
 */

function updateList(className, id) {
    var el = document.getElementsByClassName(className);
    var i;
    for (i = 0; i < el.length; i++) {
        el[i].className = className;
    }
    document.getElementById(id).className = className + " w3-theme";
}    
    
/*
 * ----- Books / subjects  -----
 */
    
// Return a list with: [id, text]
function selectedItem(className) {
    var id = "";
    var text = "";
    var el = document.getElementsByClassName(className);
    var i;
    for (i = 0; i < el.length; i++) {
        if (el[i].classList.contains("w3-theme")) {
            id = el[i].id;
            text = el[i].innerHTML;
            break;
        }
    }
    return [id, text];
}
    
function showBookOptions() {
    var book = selectedItem("book");
    
    // Now parse the corresponding map file
    getCSVList("data/" + book[0] + ".csv", function(data) {
        var subList = document.getElementById("modalSubjectList");
        // Remove previous entries
        while (subList.hasChildNodes()) {   
            subList.removeChild(subList.firstChild);
        }
            
        var i;
        for(i = 0; i < data.length; i++) {
            var sub = data[i];
            if(i === 0) {
                subList.innerHTML = subList.innerHTML + '<li id="' + sub[0] + '" onclick="updateList(' + "'sub','" + sub[0] + "'" + ')" class="w3-theme sub">' + sub[1] + '</li>';
            } else {
                subList.innerHTML = subList.innerHTML + '<li id="' + sub[0] + '" onclick="updateList(' + "'sub','" + sub[0] + "'" + ')" class="sub" >' + sub[1] + '</li>';
            }
        }
        
        // Add a "all" element
        subList.innerHTML = subList.innerHTML + '<li id="sub_all" onclick="updateList(' + "'sub','sub_all'" + ')"  class="sub">All subjects !</li>';
        
        // Show the modal
        document.getElementById('modalChooseSubject').style.display='block';
    });
}

//
// Both three list have the same size
var currentWordsArray = [];
// For each element, contains true or false
var successMap = [];
var userInputsHistory = [];
// For each word contains 0 or 1:
//  - 0: user enters the word in english
//  - 1: user enters the word in japanese
var translateDirection = [];

var currentId;

function startTraining() {
    // Called when the word list have been retrieved
    var handleWordsList = function(data) {
        currentWordsArray = data;
            
        successMap = [];
        userInputsHistory = [];
        currentId = 0;
            
        // Check if the array must be shuffled
        if(document.getElementById('randomButton').checked) {
            currentWordsArray = shuffle(currentWordsArray);
        }
            
        // Check if the user select a limit
        if(document.getElementById('limitButton').checked) {
            var wordsLimit = document.getElementById('numberOfWords').value;
            if(wordsLimit < currentWordsArray.length) {
                currentWordsArray = currentWordsArray.slice(0, wordsLimit);
            }
        }
            
        var i;
        // Check the translation direction
        if(document.getElementById('radio_jptoen').checked) {
            // User answers in english
            for(i = 0; i < currentWordsArray.length; i++) {
                translateDirection.push(0);
            }
        } else if(document.getElementById('radio_entojp').checked) {
            // User answers in japanase
            for(i = 0; i < currentWordsArray.length; i++) {
                translateDirection.push(1);
            }
        } else if(document.getElementById('radio_both').checked) {
            // Users answers both in japanese or english
            for(i = 0; i < currentWordsArray.length; i++) {
                translateDirection.push(Math.round(Math.random()));
            }
        }
            
        if(translateDirection[0] === 0) {
            document.getElementById("trainingTranslateLabel").innerHTML = "Translation in <b>English</b>:";
        } else {
            document.getElementById("trainingTranslateLabel").innerHTML = "Translation in <b>Japanese</b>:";
        }
            
        document.getElementById("trainingWord").innerHTML = currentWordsArray[0][translateDirection[0]].capitalizeFirstLetter().replaceAll(";", ",");
        document.getElementById("trainingButtonNext").innerHTML = "Next (" + (currentId + 1) + "/" + currentWordsArray.length + ")";
        document.getElementById('trainingUserInput').value = "";
            
        document.getElementById('onStartDiv').style.display='none';
        document.getElementById('resultsDiv').style.display='none';
            
        // Show the training part
        document.getElementById('trainingDiv').style.display='block';
            
        // Hide the modal
        document.getElementById('modalChooseSubject').style.display='none';
        document.getElementById('modalChooseTheme').style.display='none';
        document.getElementById('modalChooseBook').style.display='none';
    };
    
    var book = selectedItem("book");
    var sub = selectedItem("sub");
    
    document.getElementById("trainingTitle").innerHTML = book[1] + ": " + sub[1];
    
    if(sub[0] == "sub_all") {
        getAllSubjects(book[0], handleWordsList);
    } else {
        getCSVList("data/subjects/" + sub[0] + ".csv", handleWordsList);
    }
}

function removeUselessWords(str) {
    var s = str.replaceAll("-", " ")
    .replaceAll('"', " ")
    .replaceAll("‘", " ")
    .replaceAll("’", " ")
    .replaceAll("»", " ")
    .replaceAll("«", " ")
    .replaceAll(",", " ")
    .replaceAll("/", " ")
    .replaceAll("”", " ")
    .replaceAll("“", " ")
    .replaceAll("\\?", "")
    .replaceAll("!", "")
    .replaceAll(";", " ")
    .replaceAll(":", " ")
    .replaceAll("'", " ")
    .replaceAll("\\.", "")
    .replaceAll(" %", "%");
    
    return s.trim();
}
    
function removeParenthesis(str, inside) {
    if (inside === true) {
        // Remove everything inside parenthesis
        return str.replace(/ *\([^)]*\) */g, "").trim();
    } else {
        return str.replace("(", "").replace(")", "").trim();
    }
}

function processNextWord() {
    // First step: check current word
    var input = document.getElementById('trainingUserInput').value;
    userInputsHistory.push(input);
    
    input = input.trim();
    // Remove double spaces
    input = input.replace(/ +(?= )/g,'');
    // Remove accents
    input = input.latinise();
    input = input.toLowerCase();
    input = removeUselessWords(input);
    
    // Split translations in several ones 
    var translations = currentWordsArray[currentId][1-translateDirection[currentId]].split(";");
    var match = false;
    var i;
    for(i = 0; i < translations.length; i++) {
        var trans = translations[i];
        trans = trans.trim();
        trans = trans.replace(/ +(?= )/g,'');
        trans = trans.latinise();
        trans = trans.toLowerCase();
        trans = removeUselessWords(trans);
        
        // Check if the translation contains parenthesis
        if (trans.indexOf("(") > -1) {
            var trans2 = removeParenthesis(trans, true);
            if(trans2 == input || trans2.score(input) >= 0.8) {
                match = true;
                break;
            }
            trans = removeParenthesis(trans, false);
        }
        
        // Standard check (with words inside parenthesis)
        if(trans == input || trans.score(input) >= 0.8) {
            match = true;
            break;
        }
    }
    
    successMap.push(match);
    
    // Second step: move to the next word
    currentId += 1;
    if(currentId < currentWordsArray.length) {
        // Update information on screen
        //document.getElementById('trainingWord').classList.toggle('Sw3-animate-right');
        //document.getElementById('trainingWord').classList.toggle('w3-animate-right');
        
        if(translateDirection[currentId] === 0) {
            document.getElementById("trainingTranslateLabel").innerHTML = "Translation in <b>English</b>:";
        } else {
            document.getElementById("trainingTranslateLabel").innerHTML = "Translation in <b>Japanese</b>:";
        }
        document.getElementById("trainingWord").innerHTML = currentWordsArray[currentId][translateDirection[currentId]].capitalizeFirstLetter().replaceAll(";", ",");
        document.getElementById("trainingButtonNext").innerHTML = "Next (" + (currentId + 1) + "/" + currentWordsArray.length + ")";
        document.getElementById('trainingUserInput').value = "";
    } else {
        // The user reach the end of the words list
        document.getElementById('trainingDiv').style.display='none'; // Hide training div
        document.getElementById('resultsDiv').style.display='block'; // Show results div
        
        // Update progress bar
        var percent = 0;
        for(i = 0; i < successMap.length; i++) {
            if(successMap[i]) {
                percent += 1;
            }
        }
        percent = parseInt((percent/successMap.length)*100);
        moveProgressBarTo(percent);
        
        //Update entries list
        var results = document.getElementById("resultsHistoryTable");
        while (results.hasChildNodes()) {   
            results.removeChild(results.firstChild);
        }
        
        results.innerHTML = results.innerHTML + '<tr><th>Japanese</th><th>English</th><th>Your answer</th></tr>';
        
        for(i = 0; i < successMap.length; i++) {
            if(successMap[i]) {
                results.innerHTML = results.innerHTML + '<tr class="w3-green"><td>' + currentWordsArray[i][0].capitalizeFirstLetter().replaceAll(";", ",") + '</td><td>' + currentWordsArray[i][1].capitalizeFirstLetter().replaceAll(";", ",") + '</td><td>' + userInputsHistory[i] + '</td></tr>';
            } else {
                results.innerHTML = results.innerHTML + '<tr class="w3-red"><td>' + currentWordsArray[i][0].capitalizeFirstLetter().replaceAll(";", ",") + '</td><td>' + currentWordsArray[i][1].capitalizeFirstLetter().replaceAll(";", ",") + '</td><td>' + userInputsHistory[i] + '</td></tr>';
            }
        }
    }
    
    // Avoid refresh
    return false;
}
