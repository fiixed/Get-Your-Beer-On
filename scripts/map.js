// Note: This example requires that you consent to location sharing when
// prompted by your browser. If you see the error "The Geolocation service
// failed.", it means you probably did not give permission for the browser to
// locate you.
var map, infoWindow, myLat, myLng, zipCode, city, state, breweries, marker, newLat, newLng;
var markers = [];
let firstTime = true;

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 4,
    minZoom: 1,
  });
  light();

  let name = sessionStorage.getItem('name');
  let beerLat = sessionStorage.getItem('lat');
  let beerLng = sessionStorage.getItem('lng');
  if (name && beerLat && beerLng) {
    getBreweryByName(name, beerLat, beerLng);
  } else {
    usMap();
  }

  const locationButton = document.getElementById("location");
  locationButton.classList.add("custom-map-control-button");
  locationButton.addEventListener("click", () => {
    // Try HTML5 geolocation.
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          var iconBase = "http://maps.google.com/mapfiles/kml/pal2/";
          var you = new google.maps.Marker({
            position: pos,
            map: map,
            icon: iconBase + "icon10.png",
          });
          map.setCenter(pos);
          map.setZoom(12);
          myLat = pos.lat;
          myLng = pos.lng;
          zipCode = await getZipCode(myLat, myLng);
          city = await getCity(myLat, myLng);
          state = await getState(myLat, myLng);
          breweries = await getBreweries(zipCode, city, state);
          drop(breweries);
        },
        () => {
          handleLocationError(true, infoWindow, map.getCenter());
        }
      );
    } else {
      // Browser doesn't support Geolocation
      handleLocationError(false, infoWindow, map.getCenter());
    }
  });
  filter();
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(
    browserHasGeolocation
      ? "Error: The Geolocation service failed."
      : "Error: Your browser doesn't support geolocation."
  );
  infoWindow.open(map);
}

const getZipCode = async (lat, lon) => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat.toString()},${lon.toString()}&key=AIzaSyA1IUHJ6maXXRvBCQ6FPKPbQUpngPkqAoM`
    );
    let postalCode = response.data.results[0].address_components.find(function (
      component
    ) {
      return component.types[0] == "postal_code";
    });
    return postalCode.long_name;
  } catch (error) {
    console.log(error);
  }
};

const getCity = async (lat, lon) => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat.toString()},${lon.toString()}&key=AIzaSyA1IUHJ6maXXRvBCQ6FPKPbQUpngPkqAoM`
    );
    let city = response.data.results[0].address_components.find(function (
      component
    ) {
      return component.types[0] == "locality";
    });
    return city.long_name;
  } catch (error) {
    console.log(error);
  }
};

const getState = async (lat, lon) => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat.toString()},${lon.toString()}&key=AIzaSyA1IUHJ6maXXRvBCQ6FPKPbQUpngPkqAoM`
    );
    let state = response.data.results[0].address_components.find(function (
      component
    ) {
      return component.types[0] == "administrative_area_level_1";
    });
    return state.long_name;
  } catch (error) {
    console.log(error);
  }
};

const getBreweries = async (postal, city, state) => {
  try {
    const response = await axios.get(
      `https://api.openbrewerydb.org/breweries?by_postal=${postal}`
    );
    if (response.data.length == 0) {
      const response = await axios.get(
        `https://api.openbrewerydb.org/breweries?by_city=${city}&per_page=50`
      );
      if (response.data.length == 0) {
        const response = await axios.get(
          `https://api.openbrewerydb.org/breweries?by_state=${state}&per_page=50`
        );
        return response.data;
      }
      return response.data;
    }

    return response.data;
  } catch (error) {
    console.log(error);
  }
};

const getBreweriesByZip = async () => {
  var postal_code = document.getElementById("zip").value.toLowerCase();
  document.getElementById("zip").value = "";

  var geocoder = new google.maps.Geocoder();
  geocoder.geocode({ address: postal_code }, function (results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      map.setCenter(results[0].geometry.location);
      map.setZoom(13);
    } else {
      swal("Could not find location: " + location);
    }
  });
  let postal = postal_code;
  try {
    const response = await axios.get(
      `https://api.openbrewerydb.org/breweries?by_postal=${postal}`
    );
    breweries = response.data;
    if (breweries.length == 0) {
      swal(`No results in ${postal}, please widen your search`);
      return;
    } else if (breweries.length == 1 && breweries[0].latitude == null) {
      swal(`Sorry! No co-ordinates given for the only brewery in this zipcode: ${postal}, the breweries name is: ${breweries[0].name}`);
      return;
    }
    drop(breweries);
  } catch (error) {
    console.log(error);
  }
};

const getBreweriesByCity = async () => {
  var city = document.getElementById("city").value.toLowerCase();
  document.getElementById("city").value = "";
  var geocoder = new google.maps.Geocoder();
  geocoder.geocode({ address: city }, function (results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      map.setCenter(results[0].geometry.location);
      map.setZoom(11);
    } else {
      swal("Could not find location: " + location);
    }
  });
  try {
    const response = await axios.get(
      `https://api.openbrewerydb.org/breweries?by_city=${city}&per_page=50`
    );
    breweries = response.data;
    if (breweries.length == 0) {
      swal(`No results in ${titleCase(city)}, please widen your search`);
      return;
    }
    drop(breweries);
  } catch (error) {
    console.log(error);
  }
};

const getBreweriesByState = async () => {
  var e = document.getElementById("dropdown");
  var state = e.options[e.selectedIndex].value;
  let googleState;
  let zoom;
  state == "district%20of%20columbia" ? (googleState = "DC"): (googleState = state);
  state == "district%20of%20columbia" ? (zoom = 12) : (zoom = 6);
  var geocoder = new google.maps.Geocoder();
  geocoder.geocode({ address: googleState }, function (results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      map.setCenter(results[0].geometry.location);
      map.setZoom(zoom);
    } else {
      swal("Could not find location: " + location);
    }
  });
  try {
    const response = await axios.get(
      `https://api.openbrewerydb.org/breweries?by_state=${state}&per_page=50`
    );
    breweries = response.data;
    if (breweries.length == 0) {
      swal(`No results in ${titleCase(state)}, please widen your search`);
      return;
    }
    drop(breweries);
  } catch (error) {
    console.log(error);
  }
};

const getBreweryByName = async (name, latitude, longitude) => {
  sessionStorage.clear();
  newLat = parseFloat(latitude);
  newLng = parseFloat(longitude);
  
  try {
      const response = await axios.get(`https://api.openbrewerydb.org/breweries?by_name=${name.toLowerCase()}`);
      breweries = response.data;
      if (breweries.length == 0) {
        swal(`No brewery found?`);
        usMap();
        return;
      } else if (breweries.length > 1) {
        usMap();
        map.setZoom(4);
      } else {
        map.setCenter(new google.maps.LatLng(newLat, newLng));
        map.setZoom(12);
      }
      drop(breweries);
    
  } catch (error) {
    console.log(error);
  }
};

const drop = (breweries) => {
  deleteMarkers();
  
  for (let i = 0; i < breweries.length; i++) {
    addMarkerWithTimeout(breweries[i], i * 80);
  }
};

const addMarkerWithTimeout = (brewary, timeout) => {
  
  window.setTimeout(() => {
    var iconBase = "http://maps.google.com/mapfiles/kml/paddle/";
    (marker = new google.maps.Marker({
      position: new google.maps.LatLng(brewary.latitude, brewary.longitude),
      map: map,
      animation: google.maps.Animation.DROP,
      title: brewary.name,
      icon: iconBase + setIcon(brewary.brewery_type),
    })),
    
      (infowindow = new google.maps.InfoWindow({}));
    google.maps.event.addListener(
      marker,
      "click",
      ((marker) => {
        return function () {
          var audio = new Audio("sounds/canopen.wav");
          audio.play();
          const contentWindow = `
                <h3>${brewary.name}</h3>
                <h5>${
                  brewary.brewery_type.charAt(0).toUpperCase() +
                  brewary.brewery_type.slice(1)
                }</h5>
                <p>${brewary.street}</p>
                <p>${brewary.city}  ${brewary.postal_code}</p>
                <p>${formatPhoneNumber(brewary.phone)}</p>
                <a href=${brewary.website_url} target="_blank">${
            brewary.website_url
          }</a>
                `;
          infowindow.setContent(contentWindow);

          infowindow.open(map, marker);
        };
      })(marker)
    ),
      markers.push(marker);
  }, timeout);

};

// Sets the map on all markers in the array.
function setMapOnAll(map) {
  for (let i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}

// Removes the markers from the map, but keeps them in the array.
function clearMarkers() {
  setMapOnAll(null);
}

// Shows any markers currently in the array.
function showMarkers() {
  setMapOnAll(map);
}

// Deletes all markers in the array by removing references to them.
function deleteMarkers() {
  clearMarkers();
  markers = [];
}

const setIcon = (type) => {
  let image = "";
  switch (type) {
    case "micro":
      image = "red-circle.png";
      break;
    case "regional":
      image = "blu-circle.png";
      break;
    case "brewpub":
      image = "ltblu-circle.png";
      break;
    case "large":
      image = "ylw-circle.png";
      break;
    case "planning":
      image = "pink-circle.png";
      break;
    case "bar":
      image = "grn-circle.png";
      break;
    case "contract":
      image = "purple-circle.png";
      break;
    case "proprietor":
      image = "wht-circle.png";
      break;
    default:
      image = "orange-circle.png";
      break;
  }
  return image;
};

const formatPhoneNumber = (str) => {
  //Filter only numbers from the input
  let cleaned = ("" + str).replace(/\D/g, "");

  //Check if the input is of correct length
  let match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);

  if (match) {
    return "(" + match[1] + ") " + match[2] + "-" + match[3];
  }

  return null;
};

let filter = () => {
  // Filter for Checkbox
  $(".tags").on("change", 'input[type="checkbox"]', function () {
    filter = $(this);
    filterValue = filter.val();
    for (i = 0; i < breweries.length; i++) {
      if (filter.is(":checked")) {
        if (breweries[i].brewery_type == filterValue) {
          markers[i].setVisible(true);
        }
      } else {
        if (breweries[i].brewery_type == filterValue) {
          markers[i].setVisible(false);
        }
      }
    }
  });
};

const titleCase = (str) => {
  var splitStr = str.toLowerCase().split(" ");
  for (var i = 0; i < splitStr.length; i++) {
    // You do not need to check if i is larger than splitStr length, as your for does that for you
    // Assign it back to the array
    splitStr[i] =
      splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
  }
  // Directly return the joined string
  return splitStr.join(" ");
};

// map dark mode
document.getElementById('darkMode1').addEventListener('change', function(event){

  (event.target.checked) ? dark() : light();

});

function dark() {
  
  let myStyle = {

    styles: [
      { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
      { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
      { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
      {
        featureType: "administrative.locality",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
      },
      {
        featureType: "poi",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
      },
      {
        featureType: "poi.park",
        elementType: "geometry",
        stylers: [{ color: "#263c3f" }],
      },
      {
        featureType: "poi.park",
        elementType: "labels.text.fill",
        stylers: [{ color: "#6b9a76" }],
      },
      {
        featureType: "road",
        elementType: "geometry",
        stylers: [{ color: "#38414e" }],
      },
      {
        featureType: "road",
        elementType: "geometry.stroke",
        stylers: [{ color: "#212a37" }],
      },
      {
        featureType: "road",
        elementType: "labels.text.fill",
        stylers: [{ color: "#9ca5b3" }],
      },
      {
        featureType: "road.highway",
        elementType: "geometry",
        stylers: [{ color: "#746855" }],
      },
      {
        featureType: "road.highway",
        elementType: "geometry.stroke",
        stylers: [{ color: "#1f2835" }],
      },
      {
        featureType: "road.highway",
        elementType: "labels.text.fill",
        stylers: [{ color: "#f3d19c" }],
      },
      {
        featureType: "transit",
        elementType: "geometry",
        stylers: [{ color: "#2f3948" }],
      },
      {
        featureType: "transit.station",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
      },
      {
        featureType: "water",
        elementType: "geometry",
        stylers: [{ color: "#17263c" }],
      },
      {
        featureType: "water",
        elementType: "labels.text.fill",
        stylers: [{ color: "#515c6d" }],
      },
      {
        featureType: "water",
        elementType: "labels.text.stroke",
        stylers: [{ color: "#17263c" }],
      },
    ],
  };

  map.setOptions(myStyle);

}
// end map dark mode

function light() {
  
  let myStyle = {

    styles: [
      {
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#ebe3cd"
          }
        ]
      },
      {
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#523735"
          }
        ]
      },
      {
        "elementType": "labels.text.stroke",
        "stylers": [
          {
            "color": "#f5f1e6"
          }
        ]
      },
      {
        "featureType": "administrative",
        "elementType": "geometry.stroke",
        "stylers": [
          {
            "color": "#c9b2a6"
          }
        ]
      },
      {
        "featureType": "administrative.land_parcel",
        "elementType": "geometry.stroke",
        "stylers": [
          {
            "color": "#dcd2be"
          }
        ]
      },
      {
        "featureType": "administrative.land_parcel",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#ae9e90"
          }
        ]
      },
      {
        "featureType": "landscape.natural",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#dfd2ae"
          }
        ]
      },
      {
        "featureType": "poi",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#dfd2ae"
          }
        ]
      },
      {
        "featureType": "poi",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#93817c"
          }
        ]
      },
      {
        "featureType": "poi.park",
        "elementType": "geometry.fill",
        "stylers": [
          {
            "color": "#a5b076"
          }
        ]
      },
      {
        "featureType": "poi.park",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#447530"
          }
        ]
      },
      {
        "featureType": "road",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#f5f1e6"
          }
        ]
      },
      {
        "featureType": "road.arterial",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#fdfcf8"
          }
        ]
      },
      {
        "featureType": "road.highway",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#f8c967"
          }
        ]
      },
      {
        "featureType": "road.highway",
        "elementType": "geometry.stroke",
        "stylers": [
          {
            "color": "#e9bc62"
          }
        ]
      },
      {
        "featureType": "road.highway.controlled_access",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#e98d58"
          }
        ]
      },
      {
        "featureType": "road.highway.controlled_access",
        "elementType": "geometry.stroke",
        "stylers": [
          {
            "color": "#db8555"
          }
        ]
      },
      {
        "featureType": "road.local",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#806b63"
          }
        ]
      },
      {
        "featureType": "transit.line",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#dfd2ae"
          }
        ]
      },
      {
        "featureType": "transit.line",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#8f7d77"
          }
        ]
      },
      {
        "featureType": "transit.line",
        "elementType": "labels.text.stroke",
        "stylers": [
          {
            "color": "#ebe3cd"
          }
        ]
      },
      {
        "featureType": "transit.station",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#dfd2ae"
          }
        ]
      },
      {
        "featureType": "water",
        "elementType": "geometry.fill",
        "stylers": [
          {
            "color": "#b9d3c2"
          }
        ]
      },
      {
        "featureType": "water",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#92998d"
          }
        ]
      }
    ]
  };

  map.setOptions(myStyle);

}

let usMap = () => {
  let country = "United States";
  var geocoder = new google.maps.Geocoder();
  geocoder.geocode({ address: country }, function (results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      map.setCenter(results[0].geometry.location);
    } else {
      swal("Could not find location: " + location);
    }
  });
};

let zipField = document.getElementById("zip");
zipField.addEventListener("keyup", (e) => {
    if (e.code === 'Enter') {  //checks whether the pressed key is "Enter"
    getBreweriesByZip();
    }
});

let cityField = document.getElementById("city");
cityField.addEventListener("keyup", (e) => {
    if (e.code === 'Enter') {  //checks whether the pressed key is "Enter"
    getBreweriesByCity();
    }
});
