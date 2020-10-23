// Note: This example requires that you consent to location sharing when
// prompted by your browser. If you see the error "The Geolocation service
// failed.", it means you probably did not give permission for the browser to
// locate you.
let map, infoWindow, myLat, myLng, zipCode, city, state, breweries;

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
          infoWindow.setContent(":)");
          infoWindow.open(map);
          map.setCenter(pos);
          myLat = pos.lat;
          myLng = pos.lng;
          zipCode = await getZipCode(myLat, myLng);
          city = await getCity(myLat, myLng);
          state = await getState(myLat, myLng);
          breweries = await getBreweries(zipCode, city, state);

          var infowindow =  new google.maps.InfoWindow({});
          var marker, count;
          for (count = 0; count < breweries.length; count++) {
            marker = new google.maps.Marker({
            position: new google.maps.LatLng(breweries[count].latitude, breweries[count].longitude),
          map: map,
          title: breweries[count].name
          });
          google.maps.event.addListener(marker, 'click', ((marker, count) => {
          return function () {
            const contentWindow = `
            <h3>${breweries[count].name}</h3>
            <h5>${breweries[count].brewery_type}</h5>
            <p>${breweries[count].street}</p>
            `
            infowindow.setContent(contentWindow);
           
            infowindow.open(map, marker);
      };
    })(marker, count));
  }
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

const getCity = async (lat, lon) => {
  try {
    const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat.toString()},${lon.toString()}&key=AIzaSyA1IUHJ6maXXRvBCQ6FPKPbQUpngPkqAoM`);
    let city = response.data.results[0].address_components.find(function (component) {
      return component.types[0] == "locality";
  });
    return city.long_name;
  } catch (error) {
    console.log(error);
  }
};

const getState = async (lat, lon) => {
  try {
    const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat.toString()},${lon.toString()}&key=AIzaSyA1IUHJ6maXXRvBCQ6FPKPbQUpngPkqAoM`);
    let state = response.data.results[0].address_components.find(function (component) {
      return component.types[0] == "administrative_area_level_1";
  });
    return state.long_name;
  } catch (error) {
    console.log(error);
  }
};

const getBreweries = async (postal, city, state) => {
  try {
    const response = await axios.get(`https://api.openbrewerydb.org/breweries?by_postal=${postal}`);
    if (response.data.length == 0) {
      const response = await axios.get(`https://api.openbrewerydb.org/breweries?by_city=${city}&per_page=50`);
      if (response.data.length == 0) {
        const response = await axios.get(`https://api.openbrewerydb.org/breweries?by_state=${state}&per_page=50`);
        return response.data;
      }
      return response.data;
    }
    
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

