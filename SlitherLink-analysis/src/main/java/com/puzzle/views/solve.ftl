<!doctype html>
<html lang="en">
   <head>
      <title>SlitherLink Online</title>
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
       
<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.7.0/css/all.css" integrity="sha384-lZN37f5QGtY3VHgisS14W3ExzMWZxybE1SJSEsQp9S+oqd12jhcu+A56Ebc1zFSJ" crossorigin="anonymous">
<link href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,400;0,600;0,800;1,800&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&display=swap" rel="stylesheet"> 

<link href="https://fonts.googleapis.com/css2?family=Russo+One&family=Zilla+Slab+Highlight:wght@700&display=swap" rel="stylesheet">
<link href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet">
    <style>
          

/*NAVBAR*/

.bd-placeholder-img {
  font-size: 1.125rem;
  text-anchor: middle;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.navbar-brand {
  font-family: 'Roboto', sans-serif;
  font-size: 20px;
}


/*BODY*/

body {
  padding-top: 70px;
  font-family: 'Roboto', sans-serif;
  font-size: 16px;
  font-weight: 500;
  background-color: #fafafa;
}


/*BUTTONS*/

#help_button {
  color: black;
  background-color: #fafafa;
  border: none;
}

#showStatsButton {
  color: black;
  background-color: fafafa;
  border-color: black;
  border-top: 5px solid;
  border-right: 3px solid;
  border-left: 3px solid;
  border-radius: 0;
  border-bottom: none;
}


/*INPUTS*/

#dim_input {
  display: block;
  width: 30%;
  padding: .375rem .75rem;
  font-size: 1.1rem;
  font-weight: 600;
  line-height: 1.5;
  color: #495057;
  background-color: #fff;
  border: 1.5px solid #ced4da;
  border-radius: 0.1rem;
}


/*INSTRUCTIONS*/

#solve-instructions {
  margin-left: -10px;
}

#redraw-text {
  color: #007bff;
  cursor: pointer;
}

#new-options-div {
  display: none;
}

#solve_div {
  display: none;
}

#statsDisplay {
  margin-top: 20px;
  display: none;
}

#redraw-text {
  color: #007bff;
  cursor: pointer;
}


/*GAMEBOARD*/

canvas {
  display: none;
  background-color: white;
  -webkit-box-shadow: 3px 7px 3px 1px rgba(0, 0, 0, 0.3);
  -moz-box-shadow: 3px 7px 3px 1px rgba(0, 0, 0, 0.3);
  box-shadow: 3px 7px 3px 1px rgba(0, 0, 0, 0.3);
  border: 5px solid #333B38;
}


/*MEDIA QUERIES*/

@media (min-width: 768px) {
  .bd-placeholder-img-lg {
    font-size: 3.5rem;
  }
}


</style>     
   </head>
    <body>
      

<nav class="navbar navbar-expand-md navbar-dark fixed-top bg-dark">
   <a class="navbar-brand" href="/sl">SlitherLink Online</a>
   <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarsExampleDefault" aria-controls="navbarsExampleDefault" aria-expanded="false" aria-label="Toggle navigation">
   <span class="navbar-toggler-icon"></span>
   </button>
   <div class="collapse navbar-collapse" id="navbarsExampleDefault">
      <ul class="navbar-nav mr-auto">
         <li class="nav-item active">
            <a class="nav-link" href="/sl">Home <span class="sr-only"></span></a>
         </li>
         <li class="nav-item">
            <a class="nav-link" href="/sl/solve">Solve</a>
         </li>
         <li class="nav-item">
            <a class="nav-link" href="/sl/game">Play</a>
         </li>
      </ul>
   </div>
</nav>
<main role="main">
   <div class="container">
      <div class ="row">
         <div  id=dim_div>
            <div class = "col-sm-12">
               <p id="solve-instructions">Enter the dimension of the puzzle you want to solve <a class="btn btn-secondary disabled" onclick="draw()"; role="button" id="draw-button">Go&raquo;</a></p>
            </div>
            <div class="col-xs-2s">
               <input type="text" class="form-control mb-2 mx-2 " id="dim_input">
            </div>
         </div>
         <div class = "col-sm-12" id="solve_div">
            <p><a onclick="show_dim()" href="">Enter new dimension</a></p>
            <div class="form-check">
               <input type="checkbox" class="form-check-input" id="genStats">
               <label class="form-check-label" for="exampleCheck1">Generate puzzle stats  <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#exampleModal" id="help_button">
               <i class="fa fa-question-circle" aria-hidden="true"></i>
               </button></label>
               <div class="modal fade" id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                  <div class="modal-dialog">
                     <div class="modal-content">
                        <div class="modal-header">
                           <h5 class="modal-title" id="exampleModalLabel">About Puzzle Stats</h5>
                           <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                           <span aria-hidden="true">&times;</span>
                           </button>
                        </div>
                        <div class="modal-body">
                           If you enable puzzle stats, you will be able to see if your puzzle has a unique solution and how long it took to solve
                        </div>
                        <div class="modal-footer">
                           <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
            <p>Enter your puzzle on the grid then click solve <a class="btn btn-secondary " onclick="solve()"; role="button" id="solve-button">Solve&raquo;</a></p>
         </div>
      </div>
      <div class = "row" id="new-options-div">
         <div class = "col-sm-12">
            <p id="redraw-text"><a onclick="reDraw()";>Edit current puzzle</a></p>
         </div>
         <div class = "col-sm-12">
            <p><a onclick="show_dim()"; href="">Enter new puzzle</a></p>
         </div>
      </div>
      <div class="row">
         <div class ="col-sm-12 ">
            <canvas id="gameboard">
               <p>Canvas not supported on your browser</p>
            </canvas>
         </div>
      </div>
      <div id="statsDisplay">
         <button class="btn" type="button" data-toggle="collapse" data-target="#collapseExample" aria-expanded="true" aria-controls="collapseExample" id=showStatsButton>
         TOGGLE STATS
         </button>
         <div class="collapse show" id="collapseExample">
            <div class="card card-body">
               <p id="dispNumSol"></p>
               <p id="dispTimeSol"></p>
            </div>
         </div>
      </div>
      <hr>
   </div>
</main>
     <script src="https://code.jquery.com/jquery-3.4.1.slim.min.js" integrity="sha384-J6qa4849blE2+poT4WnyKhv5vZF5SrPo0iEjwBvKU7imGFAV0wwj1yYfoRSJoZ+n" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js" integrity="sha384-Q6E9RHvbIyZFJoft+2mJbHaEWldlvI9IOYy5n3zV9zzTtmI3UksdQRVvoxMfooAo" crossorigin="anonymous"></script>
<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.min.js" integrity="sha384-wfSDF2E50Y2D1uUdj0O3uMBJnjuUD4Ih7YwaYd1iqfktj0Uod8GCExl3Og8ifwB6" crossorigin="anonymous"></script>
<script>
//Constants
var SPACE = 50;
var PAD = 50;
var POINT_RAD = 5;


//Attributes
var size;
var N = 0;
var points = [];
var pointsRot = [];
var listeners = [];
var countsquares = [];
var countvals = [];
var solutionArray;
var numSolutions;
var solveTime;
var flatPoints;
var ctx;
var isChecked;
var canvas;
//Functions
/**
 * show dimension div
 **/
function show_dim() {
    document.getElementById('dim_div').style.display = "block";
    document.getElementById('solve_div').style.display = "none";
}
/**
 *  draw and hold point data
 **/

function point(x, y, rad, sa, ea, clock, ctx) {
    this.x = x;
    this.y = y;
    this.rad = rad;
    this.sa = sa;
    this.ea = ea;
    this.ctx = ctx;
    this.draw = function() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.rad, this.sa, this.ea, this.clock);
        ctx.closePath();
        ctx.fill();
    }

}


/**function to define a
 * square between points on the board
 **/
function countNumSquare(x1, y1, x2, y2, canvas, val, ctx, i, j, active) {
    this.x1 = x1;
    this.x2 = x2;
    this.y1 = y1;
    this.y2 = y2;
    this.val = val;
    this.ctx = ctx;
    let squareVal = -1;
    this.i = i;
    this.j = j;

    this.toggleActive = function() {
        active = !active;
        console.log("ACTIVE IS " + active);
    };


    //add an event listener to listen in defined space 
    let listFunc = function(e) {
        var rect = canvas.getBoundingClientRect();
        var xCoord = e.x - rect.left;
        var yCoord = e.y - rect.top;
        if (active) {
            if (xCoord > x1 && xCoord < x2 && yCoord > y1 && yCoord < y2) {

                ctx.clearRect(x1 + 10, y1 + 10, 40, 30);

                squareVal = squareVal + 1;
                if (squareVal < 4) {
                    ctx.fillText(squareVal, (((x1 + x2) / 2) - 5), ((y1 + y2) / 2) + 5);
                    countvals[j][i] = squareVal;
                }


                if (squareVal == 4) {
                    squareVal = -1;
                    ctx.fillText(" ", ((x1 + x2) / 2), ((y1 + y2) / 2));
                    countvals[j][i] = squareVal;
                }


                console.log(i);
                console.log(j);
                console.log(countvals);

                console.log(xCoord + " " + yCoord + " " + val);
            }
        }
    };
    listeners.push(listFunc);

    window.addEventListener('click', listFunc);


}
/**Redraw the board **/

function reDraw() {
    for (var i = 0; i < (N - 1); i++) {

        for (var j = 0; j < (N - 1); j++) {

            countsquares[i][j].toggleActive();
        }
    }
    document.getElementById('solve_div').style.display = "block";
    document.getElementById('new-options-div').style.display = "none";

    points = [];
    pointsRot = [];

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "800 20px Arial";

    //create the gameboard
    for (var i = 0; i < N; i++) {
        var boardRow = [];
        for (var j = 0; j < N; j++) {
            var curPoint = new point((i * SPACE) + PAD, (j * SPACE) + PAD, 5, 0, Math.PI * 2, false, ctx)
            boardRow.push(curPoint);
            curPoint.draw();
        }
        points.push(boardRow);
    }
    console.log("Points Array");
    console.log(points);

    for (var i = 0; i < N; i++) {
        pointsRot.push([]);
    }
    for (var i = 0; i < N; i++) {
        for (var j = 0; j < N; j++) {
            pointsRot[j].push(points[i][j]);
        }
    }

    console.log("Rot Points");
    console.log(pointsRot);
    console.log("Flattened Points Rot");
    flatPoints = pointsRot.flat();
    console.log(flatPoints);
    //create the count squares
    for (var i = 0; i < (N - 1); i++) {

        for (var j = 0; j < (N - 1); j++) {
            if (countvals[j][i] == -1) {
                ctx.fillText(" ", (((countsquares[i][j].x1 + countsquares[i][j].x2) / 2) - 5), ((countsquares[i][j].y1 + countsquares[i][j].y2) / 2) + 5);

            }
            if (countvals[j][i] != -1) {
                ctx.fillText(countvals[j][i], (((countsquares[i][j].x1 + countsquares[i][j].x2) / 2) - 5), ((countsquares[i][j].y1 + countsquares[i][j].y2) / 2) + 5);

            }
        }

    }

}
/**draw the board and initialise the solver **/
function draw() {

    for (var i = 0; i < listeners.length; i++) {
        window.removeEventListener('click', listeners[i]);
    }

    //hide the dimension selector
    document.getElementById('dim_div').style.display = "none";
    document.getElementById('solve_div').style.display = "block";
    document.getElementById('gameboard').style.display = "block";
    //create the canvas
    N = document.getElementById('dim_input').value;
    canvas = document.getElementById('gameboard');

    if (N > 7) {
        size = 55 * N;
    }
    if (N <= 7) {
        size = 60 * N;
    }
    canvas.width = size;
    canvas.height = size;

    if (canvas.getContext) {
        ctx = canvas.getContext('2d');
        points = [];
        pointsRot = [];
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = "800 20px Arial";

        //create the gameboard
        for (var i = 0; i < N; i++) {
            var boardRow = [];
            for (var j = 0; j < N; j++) {
                var curPoint = new point((i * SPACE) + PAD, (j * SPACE) + PAD, 5, 0, Math.PI * 2, false, ctx)
                boardRow.push(curPoint);
                curPoint.draw();
            }
            points.push(boardRow);
        }
        console.log("Points Array");
        console.log(points);

        for (var i = 0; i < N; i++) {
            pointsRot.push([]);
        }
        for (var i = 0; i < N; i++) {
            for (var j = 0; j < N; j++) {
                pointsRot[j].push(points[i][j]);
            }
        }

        console.log("Rot Points");
        console.log(pointsRot);
        console.log("Flattened Points Rot");
        flatPoints = pointsRot.flat();
        console.log(flatPoints);
        //create the count squares
        for (var i = 0; i < (N - 1); i++) {
            var countRow = [];
            var valRow = [];
            for (var j = 0; j < (N - 1); j++) {
                var squarestring = "square " + i + j;
                var curSquare = new countNumSquare(points[i][j].x, points[i][j].y, points[i + 1][j].x, points[i][j + 1].y, canvas, squarestring, ctx, i, j, true);

                console.log(curSquare);
                countRow.push(curSquare);
                valRow.push(-1);
            }
            countsquares.push(countRow);
            countvals.push(valRow);
        }

        console.log(countsquares);
        console.log(countvals);


    }


}

document.getElementById('dim_input').oninput = () => {
    var inputValue = parseInt(document.getElementById("dim_input").value);
    console.log("VALUE INPUT " + inputValue);
    if (!isNaN(inputValue)) {

        document.getElementById('draw-button').classList.remove("disabled");

    } else {
        document.getElementById('draw-button').classList.add("disabled");

    }


}
/**Make the API call to the solver
 **/
function solve() {


    var countArrayString = "";
    for (var i = 0; i < N - 1; i++) {
        for (var j = 0; j < N - 1; j++) {
            countArrayString += countvals[i][j] + " ";
            console.log(countvals[i][j]);

        }

    }
    console.log(countArrayString);

    isChecked = document.getElementById("genStats").checked;
    console.log(isChecked);
    if (!isChecked) {
        var xhr = createCORSRequest('GET', "http://localhost:8080/sl/solve/?puzzledim=" + N + "&countvals=" + countArrayString + "&stats=" + false);
    }

    if (isChecked) {
        var xhr = createCORSRequest('GET', "http://localhost:8080/sl/solve/?puzzledim=" + N + "&countvals=" + countArrayString + "&stats=" + true);

    }


    if (!xhr) {
        alert("CORS not supported");
    }

    xhr.onload = function(e) {
        var responseText = xhr.response;
        console.log("The response Text is");
        console.log(responseText);
        console.log(typeof responseText);
        if (responseText != "Failure") {
            console.log("is checked status " + isChecked);
            if (isChecked) {
                console.log("IS CHECKED!!!!!!!!!!!!!!!");
                var obj = JSON.parse(responseText);
                solutionArray = JSON.parse(obj.pairs);
                numSolutions = obj.numSolutions;
                solveTime = obj.solveTime;
                document.getElementById("statsDisplay").style.display = "block";
                document.getElementById("dispNumSol").innerHTML = "Number Solutions: " + numSolutions;
                document.getElementById("dispTimeSol").innerHTML = "Time to Solve: " + solveTime + " s";


                console.log(solutionArray);
                console.log(numSolutions);
                console.log(typeof solveTime);
                console.log(solveTime);

            }
            if (!isChecked) {
                console.log("--NOT CHECKED--");
                solutionArray = JSON.parse(responseText);
                console.log(solutionArray);
                console.log(typeof solutionArray);
            }

            displaySolution();
        }
        if (responseText == "Failure") {

            console.log("Request Failed");

        }

    };
    xhr.send();
}
/**Create CORS requests for API calls**/
function createCORSRequest(method, url) {
    var xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr) {

        xhr.open(method, url, true);

    } else if (typeof XDomainRequest != "undefined") {
        xhr = new XDomainRequest();
        xhr.open(method, url);
    } else {
        xhr = null;

    }
    return xhr;
}
/**Display the solution on the board **/
function displaySolution() {

    for (var i = 0; i < N * N; i++) {
        document.getElementById("new-options-div").style.display = "inline-block";
        document.getElementById("solve_div").style.display = "none";
        ctx.beginPath();
        ctx.lineWidth = 5;
        ctx.moveTo(flatPoints[solutionArray[i][0]].x, flatPoints[solutionArray[i][0]].y);
        ctx.lineTo(flatPoints[solutionArray[i][1]].x, flatPoints[solutionArray[i][1]].y);
        ctx.stroke();


    }
    for (var i = 0; i < (N - 1); i++) {

        for (var j = 0; j < (N - 1); j++) {

            countsquares[i][j].toggleActive();
        }
    }

}
</script>
   </body>
</html>