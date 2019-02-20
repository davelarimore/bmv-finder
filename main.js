////////////////////////////
// Utilities
////////////////////////////

// Title case utility
const titleCase = (str) => {
    return str.toLowerCase().split(' ').map((word) => {
        return (word.charAt(0).toUpperCase() + word.slice(1));
    }).join(' ');
}

// Map links utility
const mapsSelector = () => {
    // If we're on iOS, open in Apple Maps 
    if ((navigator.platform.indexOf('iPhone') != -1) ||
        (navigator.platform.indexOf('iPod') != -1) ||
        (navigator.platform.indexOf('iPad') != -1))
        return 'maps://www.google.com/maps/dir/?api=1&travelmode=driving';
    // Else use Google
    else
        return 'https://www.google.com/maps/dir/?api=1&travelmode=driving';
}

// Parse location opening hours string and convert it to 24hr
// so we can compare them to the current time and date
const convertMilitary = (time) => {
    let timeArray = time.split(/[\s:\/]+/);
    if (timeArray.length <= 7) {
        let openHour = parseInt(timeArray[0]);
        let closeHour = parseInt(timeArray[4])
        if (timeArray[2] === 'PM') {
            openHour = openHour + 12;
        }
        if (timeArray[6] === 'PM') {
            closeHour = closeHour + 12;
        }
        timeObject = {
            openTime: openHour.toString() + timeArray[1],
            closeTime: closeHour.toString() + timeArray[5]
        }
        return timeObject
    } else if (timeArray.length === 13) {
        //Mt Vernon style hours - lunch break
        let morningOpenHour = parseInt(timeArray[0]);
        let morningCloseHour = parseInt(timeArray[3])
        let eveningOpenHour = parseInt(timeArray[6]);
        let eveningCloseHour = parseInt(timeArray[10])
        if (timeArray[1] === 'PM') {
            morningOpenHour = morningOpenHour + 12;
        }
        if (timeArray[6] === 'PM' && timeArray[3] < 12) {
            morningCloseHour = morningCloseHour + 12;
        }
        if (timeArray[8] === 'PM') {
            eveningOpenHour = eveningOpenHour + 12;
        }
        if (timeArray[12] === 'PM' && timeArray[10] < 12) {
            eveningCloseHour = eveningCloseHour + 12;
        }
        timeObject = {
            morningOpenTime: morningOpenHour.toString() + '00',
            morningCloseTime: morningCloseHour.toString() + timeArray[4],
            eveningOpenTime: eveningOpenHour.toString() + timeArray[7],
            eveningCloseTime: eveningCloseHour.toString() + timeArray[11]
        }
        return timeObject
    } else if (timeArray.length === 14) {
        //Alt style hours - lunch break
        let morningOpenHour = parseInt(timeArray[0]);
        let morningCloseHour = parseInt(timeArray[4])
        let eveningOpenHour = parseInt(timeArray[7]);
        let eveningCloseHour = parseInt(timeArray[11])
        if (timeArray[2] === 'PM') {
            morningOpenHour = morningOpenHour + 12;
        }
        if (timeArray[7] === 'PM' && timeArray[4] < 12) {
            morningCloseHour = morningCloseHour + 12;
        }
        if (timeArray[9] === 'PM') {
            eveningOpenHour = eveningOpenHour + 12;
        }
        if (timeArray[13] === 'PM' && timeArray[11] < 12) {
            eveningCloseHour = eveningCloseHour + 12;
        }
        timeObject = {
            morningOpenTime: morningOpenHour.toString() + timeArray[1],
            morningCloseTime: morningCloseHour.toString() + timeArray[5],
            eveningOpenTime: eveningOpenHour.toString() + timeArray[8],
            eveningCloseTime: eveningCloseHour.toString() + timeArray[12]
        }
        return timeObject
    }
}

// Get current time utility
const getCurrentDateObject = () => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let currentDate = new Date();
    let currentDay = currentDate.getDay();
    let currentHour = currentDate.getHours().toString();
    let currentMinutes = currentDate.getMinutes()
    if (currentMinutes < 10) {
        // Pad with zero
        currentMinutes = '0' + currentMinutes.toString()
    } else {
        currentMinutes = currentMinutes.toString()
    }
    let currentDateObject = {
        currentTime: currentHour.toString() + currentMinutes,
        currentDay: dayNames[currentDay],
    }
    return currentDateObject;
}

////////////////////////////
// End Utilities
////////////////////////////


////////////////////////////
// Map and Info Windows
////////////////////////////

// Get JSON and initialize map
$(document).ready(function () {
    let json = $.getJSON('https://api.myjson.com/bins/qwo1e', (json) => {
        initialize(json);
        // initialize(json.slice(0,1));
    });
    // About button
    $("#js-about").on("click", function () {
        console.log('clicked');
        $(".popupOverlay, .popupContent").addClass("active");
    });

    $("#js-close, #js-popup-pverlay").on("click", function () {
        $(".popupOverlay, .popupContent").removeClass("active");
    });
});

const initialize = (json) => {
    // Giving the map some options
    let mapOptions = {
        zoom: 8,
        center: new google.maps.LatLng(39.7684, -86.1581),
        disableDefaultUI: true,
        zoomControl: true,
        gestureHandling: 'greedy',
        styles: [{ 'featureType': 'water', 'elementType': 'geometry', 'stylers': [{ 'color': '#e9e9e9' }, { 'lightness': 17 }] }, { 'featureType': 'landscape', 'elementType': 'geometry', 'stylers': [{ 'color': '#f5f5f5' }, { 'lightness': 20 }] }, { 'featureType': 'road.highway', 'elementType': 'geometry.fill', 'stylers': [{ 'color': '#ffffff' }, { 'lightness': 17 }] }, { 'featureType': 'road.highway', 'elementType': 'geometry.stroke', 'stylers': [{ 'color': '#ffffff' }, { 'lightness': 29 }, { 'weight': 0.2 }] }, { 'featureType': 'road.arterial', 'elementType': 'geometry', 'stylers': [{ 'color': '#ffffff' }, { 'lightness': 18 }] }, { 'featureType': 'road.local', 'elementType': 'geometry', 'stylers': [{ 'color': '#ffffff' }, { 'lightness': 16 }] }, { 'featureType': 'poi', 'elementType': 'geometry', 'stylers': [{ 'color': '#f5f5f5' }, { 'lightness': 21 }] }, { 'featureType': 'poi.park', 'elementType': 'geometry', 'stylers': [{ 'color': '#dedede' }, { 'lightness': 21 }] }, { 'elementType': 'labels.text.stroke', 'stylers': [{ 'visibility': 'on' }, { 'color': '#ffffff' }, { 'lightness': 16 }] }, { 'elementType': 'labels.text.fill', 'stylers': [{ 'saturation': 36 }, { 'color': '#333333' }, { 'lightness': 40 }] }, { 'elementType': 'labels.icon', 'stylers': [{ 'visibility': 'off' }] }, { 'featureType': 'transit', 'elementType': 'geometry', 'stylers': [{ 'color': '#f2f2f2' }, { 'lightness': 19 }] }, { 'featureType': 'administrative', 'elementType': 'geometry.fill', 'stylers': [{ 'color': '#fefefe' }, { 'lightness': 20 }] }, { 'featureType': 'administrative', 'elementType': 'geometry.stroke', 'stylers': [{ 'color': '#fefefe' }, { 'lightness': 17 }, { 'weight': 1.2 }] }]
    };

    let infowindow = new google.maps.InfoWindow();

    // Creating the map
    let map = new google.maps.Map(document.getElementById('js-map-canvas'), mapOptions);

    // Adding a styled polygon for state shape using GeoJSON.
    let stateLayer = new google.maps.Data();

    stateLayer.loadGeoJson('https://api.myjson.com/bins/zxg62');

    stateLayer.setStyle({
        fillColor: 'hsl(217, 50%, 35%)',
        fillOpacity: 0.3,
        strokeWeight: 0,
    });

    stateLayer.setMap(map);

    // Loop through all the entries from the JSON data to create markers
    for (let i = 0; i < json.length; i++) {
        addMarkerWithTimeout(json[i], i * 10);
    }

    function addMarkerWithTimeout(json, timeout) {
        window.setTimeout(function () {
            const loc = json;

            // Determine icon to use for marker  
            const iconPath = loc.type === 'BMV Branch'
                ? `car.svg`
                : `cycle.svg`;

            // Adding a new marker for the location
            const locationLatLng = new google.maps.LatLng(loc.latitude, loc.longitude);
            const marker = new google.maps.Marker({
                position: locationLatLng,
                map: map,
                title: loc.display_name, // giving the marker a title
                icon: iconPath,
                animation: google.maps.Animation.DROP
            });

            // Begin creating content for the location's info window
            // Generate details content
            const addressLineOne = loc.address_line_1
                ? `<p class='subHead'>Address</p><p>${titleCase(loc.address_line_1)}</p>`
                : '';
            const addressLineTwo = loc.address_line_2 !== 'NULL'
                ? `<p class='subHead'>Address</p><p>${titleCase(loc.address_line_2)}</p>`
                : '';
            const city = loc.city
                ? `<p>${titleCase(loc.city)}, IN</p>`
                : '';

            let postalCode;
            if (loc.postal_code.toString().length > 5) {
                // Insert hyphen into full postal codes
                postalCode = `<p>${loc.postal_code.toString().substr(0, 5) + '-' + loc.postal_code.toString().substr(5)}</p>`
            }
            else if (loc.postal_code.toString().length <= 5) {
                postalCode = `<p>${loc.postal_code.toString()}</p>`
            }

            const webUrl = loc.Website
                ? `<p class='subHead'>Website</p><p><a href='${loc.Website}' subHead='Visit Site' target='_blank'>${loc.Website}</a></p>`
                : '';
            const phoneNumber = loc.phone
                ? `<p class='subHead'>Phone</p><p>${loc.phone}</p>`
                : '';
            const kiosk = loc.has_kiosk === 'Yes'
                ? `<div class='kiosk'><p>24 Hour BMV Connect Kiosk Available</p></div>`
                : '';

            // Generate the get directions link
            let openMapURL = mapsSelector();
            const trimmedPostalCode = loc.postal_code.toString().slice(0, 5);
            openMapURL = openMapURL + `&destination=${loc.address_line_1 + ' ' + loc.city + ' IN ' + trimmedPostalCode}`
            const getDirectionsButton = `<a class='getDirections' href='${openMapURL}' title='Get Directions' target='_blank'>Get Directions</a>`

            // Determine if location is open
            const determineOpen = () => {
                const currentDateObject = getCurrentDateObject();
                currentTime = parseInt(currentDateObject.currentTime);
                const todaysLocationHours = loc[getCurrentDateObject().currentDay];
                const todaysLocationHoursObject = convertMilitary(todaysLocationHours)
                if (loc[currentDateObject.currentDay] === 'Closed') {
                    return false; // closed all day
                } else if (Object.keys(todaysLocationHoursObject).length === 2 && currentTime >= parseInt(todaysLocationHoursObject.openTime) &&
                    currentTime <= parseInt(todaysLocationHoursObject.closeTime)) {
                    return true; // standard location hours
                } else if ((Object.keys(todaysLocationHoursObject).length === 4 && currentTime >= parseInt(todaysLocationHoursObject.morningOpenTime) &&
                    currentTime <= parseInt(todaysLocationHoursObject.morningCloseTime)) ||
                    (Object.keys(todaysLocationHoursObject).length === 4 && currentTime >= parseInt(todaysLocationHoursObject.eveningOpenTime) &&
                        currentTime <= parseInt(todaysLocationHoursObject.eveningCloseTime))) {
                    return true; // locations with lunch break hours
                } else {
                    return false;
                }
            }

            // Generate open/closed message
            const open = determineOpen()
                ? `<div class='open'><p>OPEN NOW!</p></div>`
                : `<div class='closed'><p>CLOSED NOW</p></div>`;

            // Generate hours content
            let hours = '';
            if (loc.type !== 'RSI Training') {
                hours = `
                <div class='rightCol'>
                    <p class='subHead'>Hours</p>
                    <p class='dayLabel'><span>SUN: </span>${loc.Sunday}</p>
                    <p class='dayLabel'><span>MON: </span>${loc.Monday}</p>
                    <p class='dayLabel'><span>TUE: </span>${loc.Tuesday}</p>
                    <p class='dayLabel'><span>WED: </span>${loc.Wednesday}</p>
                    <p class='dayLabel'><span>THU: </span>${loc.Thursday}</p>
                    <p class='dayLabel'><span>FRI: </span>${loc.Friday}</p>
                    <p class='dayLabel'><span>SAT: </span>${loc.Saturday}</p>
                    ${open}
                </div>`
            };

            // Assemble the info window content
            const content = `
            <div class='infoWindow'>
                <div class='title'><span class='locationName'>${loc.display_name}</span> - ${loc.type}</div>
                <div ${loc.type !== 'RSI Training' ? "class='leftCol'" : ''}>
                    ${addressLineOne}
                    ${addressLineTwo}
                    ${city}
                    ${postalCode}
                    ${webUrl}
                    ${phoneNumber}
                </div>
                ${hours}
                ${kiosk}
                ${getDirectionsButton}
            </div>`

            let clicker = addClicker(marker, content);

        }, timeout);
    }

    // Adding a new click event listener for the location(s)
    function addClicker(marker, content) {
        google.maps.event.addListener(marker, 'click', () => {
            if (infowindow) { infowindow.close(); }
            infowindow = new google.maps.InfoWindow({ content: content });
            infowindow.open(map, marker);
        });
    }
}

////////////////////////////
// End Map and Info Windows
////////////////////////////


