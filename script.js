// Draw speed limit zones in a star system based on planet proximity

var planetColour = 'blue';
var sunColour = 'yellow';
var orbitColour = 'green'
var spaceColour = 'black'
var speedZoneColour = [255,255,255]; // This is used to create an rgba colour with alpha based on proximity to planets

var canvas;
var displayArea;
var worldWidth;
var worldHeight;
var pixelSize = 1; // Not really used, holdover from testing

var worldHyp; // The diagonal measurement of the display area

var planetArray = []; // Holds the planet location data
var planetCount = 6;
var planetSize = 3;
var sunSize = 5;

var speedZones = 3; // How many different speed limits are there in the system?
var speedZoneSize = 20; // How far out from a planet does a speed zone extend?

var start = function() {
	
	// Setup the display
	canvas = document.getElementById('canvas');
	displayArea = canvas.getContext('2d');
	worldWidth = window.innerWidth;
	worldHeight = window.innerHeight;
	canvas.width = worldWidth;
	canvas.height = worldHeight;
	
	worldHyp = getDistance(0,0,worldWidth,worldHeight);
	
	// Create the planet location data
	for (var t = 0; t < planetCount; t++) {
		var planetX = Math.floor(Math.random() * worldWidth);
		var planetY = Math.floor(Math.random() * worldHeight);
		planetArray[t * 2] = planetX;
		planetArray[(t * 2) + 1] = planetY;
	}
	
	drawSpeedZones();
	drawOrbits();
	drawPlanets();
};

var drawSpeedZones = function(){
	// Fill in the background
	displayArea.fillStyle = spaceColour;
	displayArea.fillRect(0,0,worldWidth,worldHeight);
	
	// Iterate through each pixel to measure it's distance from the planets in the system. Use the distance to generate an alpha value between 0 and 1 to draw the pixel with.
	for (var i = 0; i < worldWidth; i++) {
		for (var j = 0; j < worldHeight; j++) {
			var pointAlpha = 0;
			// Now that we have a pixel, iterate through the planets in the system
			for (var loop = 0; loop < planetCount; loop++){
				var hypo = getDistance(i,j,planetArray[loop * 2],planetArray[(loop * 2) + 1]); // How far is this pixel from this planet?
				if (hypo == 0) hypo = 1; // Bound the distance to prevent divide by zero
				hypo = hypo / speedZoneSize; // Adjust the distance based on how big speed zones are
				var hypoAlpha = hypo / worldHyp; // Find the ratio of the distance to the largest possible distance
				hypoAlpha =  1 / hypoAlpha; // Invert the value
				hypoAlpha = hypoAlpha / worldHyp; // Find an alpha value based on what percentage of the largest possible distance this current distance is
				pointAlpha = pointAlpha + hypoAlpha; // Add the alpha value for the current planet to the total for this pixel
			}
			
			// Bound the alpha value based on how many speed zones are required
			pointAlpha = Math.floor(pointAlpha * speedZones);
			pointAlpha = pointAlpha / speedZones;
			
			// Create the fill colour based on the alpha calculated
			var fillColour = 'rgba(' + speedZoneColour[0] + ',' + speedZoneColour[1] + ',' + speedZoneColour[2] + ',' + pointAlpha + ')';
			displayArea.fillStyle = fillColour;
			
			// Draw the pixel
			displayArea.fillRect(i,j,pixelSize,pixelSize);
		}
	}
};

var drawPlanets = function() {
	// Draw the sun
	displayArea.fillStyle = sunColour;
	displayArea.beginPath();
	displayArea.arc(worldWidth / 2, worldHeight / 2, sunSize, 0, 360);
	displayArea.fill();
	
	// Draw each of the planets
	displayArea.fillStyle = planetColour;
	for (var loop = 0; loop < planetCount; loop++){
		displayArea.beginPath();
		displayArea.arc(planetArray[loop * 2], planetArray[(loop * 2) + 1], planetSize, 0 , 360)
		displayArea.fill();
	}

};

var drawOrbits = function() {
	// Calculate and draw the orbit of each planet
	displayArea.strokeStyle = orbitColour;
	for (var loop = 0; loop < planetCount; loop++){
		displayArea.beginPath();
		var hypo = getDistance(worldWidth / 2, worldHeight / 2, planetArray[loop * 2], planetArray[(loop * 2) + 1]);
		displayArea.arc(worldWidth / 2, worldHeight / 2, hypo, 0 , 360)
		displayArea.stroke();
	}
};

// Find the distance between two points on the screen using Pythagoras' theorem
var getDistance = function(myX,myY,targetX,targetY) {
	var sideA = Math.abs(targetX - myX);
	var sideB = Math.abs(targetY - myY);
	var hyp = Math.sqrt((sideA * sideA) + (sideB * sideB));
	return hyp;
}