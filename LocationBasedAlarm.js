// Initializing variables 
var appName = "Dest Distance";

// End of variables initializing 

//Set the latitude & longtitude of the penultimate bus/train stop, so you have time to get ready 
var locations = { destLat: 52.3119716, destLon: 4.9471667,name: "Bijlmer Arena"};
//var locations = { destLat: 34.665281,destLon: 33.021822,name: "Karmi Fruitmarket"};

var distance = 0,lastDistance ;
var locCheckedCounter = 0;

console.log('Started Script:' + device.currentSource);

//Create the application Shortcut
device.shortcuts.create(appName, "DestDistance", "http://a5.mzstatic.com/us/r30/Purple/v4/57/13/07/57130772-3260-086f-58c5-e598bd4b150a/icon_256.png");
device.shortcuts.on("DestDistance", function() {
	StartAppMenu();
});

var locListener = device.location.createListener('GPS', 2500);  //Check if location has changed, once every 2.5 seconds
locListener.on('changed', function(signal) {
	locations.currLat = signal.location.latitude;
	locations.currLon = signal.location.longitude;
	distance = calculateDistance(locations.destLat, locations.currLat, locations.destLon, locations.currLon);

	if (Math.floor(distance) != Math.floor(lastDistance)) {   // You have moved ~1 km since the last notification
		showNotification("Distance:" + distance.toFixed(2) + ' km ,at (' + locations.currLat  + ',' + locations.currLon  + ')');
	}
    //TEST: if ( Math.floor(distance) + Math.floor(lastDistance) === 0) { //Last two measurements are within 500 meters of destination
    if ( Math.floor(distance + lastDistance + 0.30) === 0) { //Last two measurements are within ~300 meters of destination
         showNotification("Near " + locations.name + ', just ' +  distance.toFixed(2) + ' km away');
    }
	lastDistance = distance;
    locCheckedCounter++;
});


/* Start Menu */
function StartAppMenu() {
	var messageBox = device.notifications.createMessageBox(appName + '- Main Menu');
	messageBox.content = 'You are ' + distance.toFixed(2) + ' km away, at (' + locations.currLat  + ',' + locations.currLon + '), from (' + locations.destLat + ',' + locations.destLon + ')';
	messageBox.buttons = ['Start Checking', 'Show Distance', 'Stop'];

	messageBox.on('Start Checking', function() {
		showNotification('Started looking for distance to ' + locations.name);
        locCheckedCounter = 0 ; //Counts the number of time the location was checked.
        lastDistance = lastDistance + 5; // This will force display of distance at the start of script
		locListener.start();        
	});

	messageBox.on('Show Distance', function() {
		lastDistance = lastDistance + 5; // This will force display of distance 
	});

	messageBox.on('Stop', function() {
		locListener.stop();
        showNotification('Stopped looking for distance to ' + locations.name + ' having checked distance ' + locCheckedCounter + ' times');
        console.log('Stopped looking for distance to ' + locations.name + ' having checked distance ' + locCheckedCounter + ' times');
	});

	messageBox.show();
}

/* Get Destination coordinates - latitude & longitude */
function getDestCoords(coordName) {
	showNotification('Creating InputBox for ' + coordName);

	var inputBox = device.notifications.createInputBox(appName);
	inputBox.content = 'Please give the ' + coordName;
	inputBox.type = 'number';
	inputBox.buttons = ['OK', 'Cancel'];
	inputBox.on('OK', function() {
		retval = parseInt(inputBox.value, 10);
		return retval;
	});
	inputBox.show();
}


/* Calculating distance using the haversine formula */
/* This function was copied from somewhere on the internet */
function calculateDistance(lat1, lat2, lon1, lon2) {
	var R = 6371; // earth radius in km
	var dLat = toRad(lat2 - lat1);
	var dLon = toRad(lon2 - lon1);
	var rLat1 = toRad(lat1);
	var rLat2 = toRad(lat2);

	var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(rLat1) * Math.cos(rLat2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	var d = R * c;
	return d;
}

/* Converts numeric degrees to radians */
function toRad(Value) {
	return Value * Math.PI / 180;
}

/* Display notification on mobile */
function showNotification(content) {
	var notification = device.notifications.createNotification(content);
	notification.show();
	//console.log(content);
}
