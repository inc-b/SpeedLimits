// Draw speed limit zones in a star system based on planet proximity

var planetColour = 'blue';
var sunColour = 'yellow';
var orbitColour = 'grey'
var spaceColour = 'white'
var speedZoneColour = [200,200,200]; // This is used to create an rgba colour with alpha based on proximity to planets

var canvas;
var displayArea;
var worldWidth;
var worldHeight;
var pixelSize = 1; // Not really used, holdover from testing
var zoomModifier = 80; // 1 AU equals this many pixels
var screenSize = 1; // Display area size as a ratio of the screen area
var planetSize = 2; // Earth is this many pixels across

var displayHyp; // The diagonal measurement of the display area

var planetArray = []; // Holds the planet location data
var planetData = 4; // How many pieces of data there are on each planet
var planetCount;
var sunSize = 5;
var realPlanets = true;

// Time values used to calculate positions of planets. The year 2000 is used as 0
var currentYear = 1; 
var currentMonth = 1;
var currentTime;

var speedZones = 3; // How many different speed limits are there in the system?
var speedZoneSize = .11; // How far out from a planet does a speed zone extend in AU?

var start = function() {
	// Setup the display
	canvas = document.getElementById('canvas');
	displayArea = canvas.getContext('2d');
	worldWidth = Math.floor(window.innerWidth * screenSize);
	worldHeight = Math.floor(window.innerHeight * screenSize);
	canvas.width = worldWidth;
	canvas.height = worldHeight;
	
	// Set the max distance (ie, the diagonal of the display area)
	displayHyp = getDistance(0,0,worldWidth,worldHeight);
	
	// Set the zoom level
	speedZoneSize = zoomModifier * speedZoneSize;

	// Set the current time
		currentTime = currentYear + (currentMonth / 12);
		
		// Create the planet location data
		fillPlanetArray();
		planetCount = planetArray.length / planetData;
		
		// Draw everything
		clearScreen();
		drawSpeedZones();
		drawOrbits();
		drawPlanets();
};

var clearScreen = function() {
	displayArea.fillStyle = spaceColour;
	displayArea.fillRect(0,0,worldWidth,worldHeight);
};

var fillPlanetArray = function() {
	if (realPlanets) {
		// Orbits are in AU and are added to the array using addPlanet(orbit size, location in orbit at year 0, orbital speed in Earth years, colour, size compared to Earth)
		// Mercury
		addPlanet(0.4,0,0.25, 'silver',0.38);
		// Venus
		addPlanet(0.7,45,0.58, 'ivory',0.95);
		// Earth
		addPlanet(1,0,1,'turquoise',1);
		// Mars
		addPlanet(1.5,110,1.92,'chocolate',0.53);
		// Ceres
		addPlanet(4.2,110,4.6,'silver',0.001);
		// Vesta
		addPlanet(3.65,4,3.63,'silver',0.001);
		// Jupiter
		addPlanet(5.2,0,11.83,'peru',11.2);
		// Saturn
		addPlanet(9.6,0,29.5,'wheat',9.45);
		// Uranus
		addPlanet(19.2,0,84.08,'powderblue',4);
		// Neptune
		addPlanet(30,0,164.92,'blue',3.88);
	} else {
		for (var t = 0; t < planetCount; t++) {
			var planetX = Math.floor(Math.random() * worldWidth);
			var planetY = Math.floor(Math.random() * worldHeight);
			planetArray[t * planetData] = planetX;
			planetArray[(t * planetData) + 1] = planetY;
			planetArray[(t * planetData) + 2] = planetColour;
		}
	}
};

var addPlanet = function(orbitSize, initialPosition, orbitSpeed, planetColour, planetRadius) {
	var planetNumber = planetArray.length; // Which planet are we adding?
	var orbitsCompleted = currentTime / orbitSpeed;
	var currentPosition = (orbitsCompleted % 1);
	currentPosition = Math.floor((currentPosition * 360) + initialPosition);
	if(currentPosition == 0) currentPosition++;
	orbitSize = orbitSize * zoomModifier;
	
	// Planets can have relative sizes turned on, but it means the gas giants are larger than their own speed zones
	//planetRadius = planetRadius * planetSize;
	planetRadius = planetSize;
	
	// Convert angle into radians
	currentPosition = currentPosition * Math.PI / 180;
	
	// Find the x, y position using the current quadrant, position in that quadrant, orbit size and middle of the display
	var xPos = (worldWidth / 2) + (orbitSize * Math.cos(currentPosition));
	var yPos = (worldHeight  / 2) + (orbitSize * Math.sin(currentPosition));
	
	// Add the planet to the array of planets
	planetArray[planetNumber] = xPos;
	planetArray[planetNumber + 1] = yPos;
	planetArray[planetNumber + 2] = planetColour;
	planetArray[planetNumber + 3] = planetRadius;
};

var drawSpeedZones = function(){
	
	// Iterate through each pixel to measure it's distance from the planets in the system. Use the distance to generate an alpha value between 0 and 1 to draw the pixel with.
	for (var i = 0; i < worldWidth; i++) {
		for (var j = 0; j < worldHeight; j++) {
			var pointAlpha = 0;

			// Now that we have a pixel, iterate through the planets in the system
			for (var loop = 0; loop < planetCount; loop++){
				var hypo = getDistance(i,j,planetArray[loop * planetData],planetArray[(loop * planetData) + 1]); // How far is this pixel from this planet?
				if (hypo == 0) hypo = 1; // Bound the distance to prevent divide by zero
				hypo = hypo / speedZoneSize; // Adjust the distance based on how big speed zones are
				var hypoAlpha = hypo / displayHyp; // Find the ratio of the distance to the largest possible distance
				hypoAlpha =  1 / hypoAlpha; // Invert the value
				hypoAlpha = hypoAlpha / displayHyp; // Find an alpha value based on what percentage of the largest possible distance this current distance is
				if (hypoAlpha > 0) pointAlpha = pointAlpha + hypoAlpha; // Add the alpha value for the current planet to the total for this pixel
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
	for (var loop = 0; loop < planetCount; loop++){
		displayArea.fillStyle = planetArray[(loop * planetData) + 2];
		displayArea.beginPath();
		displayArea.arc(planetArray[loop * planetData], planetArray[(loop * planetData) + 1], planetArray[(loop * planetData) + 3], 0 , 360)
		displayArea.fill();
	}

};

var drawOrbits = function() {
	// Calculate and draw the orbit of each planet
	displayArea.strokeStyle = orbitColour;
	for (var loop = 0; loop < planetCount; loop++){
		displayArea.beginPath();
		var hypo = getDistance(worldWidth / 2, worldHeight / 2, planetArray[loop * planetData], planetArray[(loop * planetData) + 1]);
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