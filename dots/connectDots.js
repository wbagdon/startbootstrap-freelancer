//global variables for storing points and the top left point
var positions = [];
var upper;
var canvasWidth;
var canvasHeight;
var firstRun = true;

function OnClickButton () {
  // get canvas and button
  var puzzle = document.getElementById('puzzleCanvas');
  var ctx = puzzle.getContext('2d');
  var solveBtn = document.getElementById('solveButton');

  if (solveBtn.value == 'Solve Me') {
    // if the button says solve me and is clicked solve the puzzle
    // there also needs to be at least 2 points
    if (positions.length > 1) {
      connectDots();
      positions = [];
      // change button to allow reset
      solveBtn.value = 'Reset';
    } else {
      alert('Pick at least 2 points');
    }
  }else {
    // clear the canvas
    ctx.clearRect(0, 0, puzzle.width, puzzle.height);
    // allow for a new puzzle to be solved
    solveBtn.value = 'Solve Me';
  }
}

function DrawDot(e) {
  // get canvas
  var puzzle = document.getElementById('puzzleCanvas');
  var ctx = puzzle.getContext('2d');
  var solveBtn = document.getElementById('solveButton');

  // get the mouse position for where the user clicked
  var position = getMousePos(puzzle, e);

  //if this is the first click on the page, clear the welcome message
  if (firstRun) {
    ctx.clearRect(0, 0, puzzle.width, puzzle.height);
    firstRun = false;
  }

  // don't record values outside the canvas
  if ((position.x <= canvasWidth && position.y <= canvasHeight) &&
    (position.x >= 0 && position.y >= 0) &&
    solveBtn.value != 'Reset') {
    // draw a circle where the user clicked
    console.log(position.toString());
    ctx.beginPath();
    ctx.arc(position.x, position.y, 2, 0, 2 * Math.PI);
    // add the positon to an array of dots
    positions.push(position);
    ctx.stroke();
  }
}
// add listener for the canvas to draw a dot upon mouse click
window.addEventListener('mousedown', DrawDot, false);

function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return new Dot(evt.clientX - rect.left, evt.clientY - rect.top);
}

function connectDots() {
  // get canvas
  var puzzle = document.getElementById('puzzleCanvas');
  var ctx = puzzle.getContext('2d');
  // sort the dots before drawing lines
  sortDots();
  ctx.beginPath();
  // move the cursor to the first dot
  ctx.moveTo(positions[0].x, positions[0].y);
  for (var i = 1; i < positions.length; i++) {
    // draw a line to the next dot in the array
    ctx.lineTo(positions[i].x, positions[i].y);
    ctx.stroke();
  }
  // draw a line back to the first point
  ctx.lineTo(positions[0].x, positions[0].y);
  ctx.stroke();
}

function sortDots() {
  // store the upper left point
  upper = upperLeft(positions);
  // begin dots sort
  positions.sort(pointSort);
}

// Sort algorithm adapted from StackOverflow article:
// http://stackoverflow.com/questions/2855189/sort-latitude-and-longitude-coordinates-into-clockwise-ordered-quadrilateral

// Dot class for various math operations and storing points
function Dot(x, y) {
  this.x = x;
  this.y = y;

  // find distance between this point and another arbitrary point
  this.distance = function(that) {
    var dX = that.x - this.x;
    var dY = that.y - this.y;
    return Math.sqrt((dX * dX) + (dY * dY));
  }

  // find slope between this point and another arbitrary point
  this.slope = function(that) {
    var dX = that.x - this.x;
    var dY = that.y - this.y;
    return dY / dX;
  }

  // allow for output in a human readable format
  this.toString = function() {
    return '(' + this.x + ',' + this.y + ')';
  }
}

// take an array of points and return the upper left most point
function upperLeft(points) {
  var top = points[0];
  for (var i = 1; i < points.length; i++) {
    var temp = points[i];
    // Top most Y coordinate (origin) will be 0
    // check each point to see if it has a lower Y value
    // store the point if it is the top most point
    // in case of a tie, store the value with the smallest X value
    if (temp.y < top.y || (temp.y == top.y && temp.x > top.x)) {
      top = temp;
    }
  }
  return top;
}

// A custom sort function that sorts p1 and p2 based on their slope
// that is formed from the upper most point from the array of points.
function pointSort(p1, p2) {
  // Exclude the 'upper' point from the sort (which should come first).
  if (p1 == upper) {
    return -1;
  }
  if (p2 == upper) {
    return 1;
  }

  // Find the slopes of 'p1' and 'p2' when a line is
  // drawn from those points through the 'upper' point.
  var m1 = upper.slope(p1);
  var m2 = upper.slope(p2);

  // 'p1' and 'p2' are on the same line towards 'upper'.
  if (m1 == m2) {
    // The point closest to 'upper' will come first.
    return p1.distance(upper) < p2.distance(upper) ? -1 : 1;
  }

  // If 'p1' is to the right of 'upper' and 'p2' is the the left.
  if (m1 <= 0 && m2 > 0) {
    return -1;
  }

  // If 'p1' is to the left of 'upper' and 'p2' is the the right.
  if (m1 > 0 && m2 <= 0) {
    return 1;
  }

  // It seems that both slopes are either positive, or negative.
  return m1 > m2 ? -1 : 1;
}

// When the page is resized, make sure that the canvas is resized too
// clear the canvas and dots so the next drawing does not register off screen
function canvasResize() {
  var puzzle = document.getElementById('puzzleCanvas');
  var ctx = puzzle.getContext('2d');
  //add bottom margin to avoid button being registered on the canvas
  var bottomMargin = 70;
  // set the canvas to the window size
  ctx.canvas.width  = window.innerWidth;
  ctx.canvas.height = window.innerHeight - bottomMargin;
  // store these variables for later use
  canvasWidth = window.innerWidth;
  canvasHeight = window.innerHeight - bottomMargin;
  // clear the dots and stored positions
  ctx.clearRect(0, 0, puzzle.width, puzzle.height);
  positions = [];
};

// only resize if the window is done resizing (100ms timeout)
// user could be dragging the window manually
var resizeTimer;
$(window).resize(function() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(canvasResize, 100);
});

// also resize the canvas upon the page being opened
$(window).ready(function() {
  canvasResize();
  //if this is the first time runnning the app, display instuctions
  if (firstRun) {
    var ctx = document.getElementById('puzzleCanvas').getContext('2d');
    ctx.font = '24px Roboto-Regular';
    ctx.textAlign = 'center';
    ctx.fillText('Welcome to Connect the Dots!', ctx.canvas.width / 2, 50);
    ctx.fillText('Click on the page to add dots', ctx.canvas.width / 2, 90);
    ctx.fillText('Click \'Solve Me\' to solve', ctx.canvas.width / 2, 130);
    ctx.fillText('Click anywhere to get started', ctx.canvas.width / 2, 170);
  }
});
