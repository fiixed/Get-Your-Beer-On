// Note: This example requires that you consent to location sharing when
// prompted by your browser. If you see the error "The Geolocation service
// failed.", it means you probably did not give permission for the browser to
// locate you.
let map, infoWindow, myLat, myLng, zipCode;

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 40.7831, lng: -73.9712 },
    zoom: 13,
  });
  infoWindow = new google.maps.InfoWindow();
  const locationButton = document.createElement("button");
  locationButton.textContent = "My Location";
  locationButton.classList.add("custom-map-control-button");
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(locationButton);
  locationButton.addEventListener("click", () => {
    // Try HTML5 geolocation.
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          infoWindow.setPosition(pos);
          infoWindow.setContent("Location found.");
          infoWindow.open(map);
          map.setCenter(pos);
          myLat = pos.lat;
          myLng = pos.lng;
          zipCode = await getZipCode(myLat, myLng);
          console.log(zipCode);
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
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(
    browserHasGeolocation ? "Error: The Geolocation service failed."
      : "Error: Your browser doesn't support geolocation."
  );
  infoWindow.open(map);
}

const getZipCode = async (lat, lon) => {
  try {
    const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat.toString()},${lon.toString()}&key=AIzaSyA1IUHJ6maXXRvBCQ6FPKPbQUpngPkqAoM`);
    let postalCode = response.data.results[0].address_components.find(function (component) {
      return component.types[0] == "postal_code";
  });
    return postalCode.long_name;
  } catch (error) {
    console.log(error);
  }
};

