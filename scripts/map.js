// Note: This example requires that you consent to location sharing when
// prompted by your browser. If you see the error "The Geolocation service
// failed.", it means you probably did not give permission for the browser to
// locate you.
let map, infoWindow, myLat, myLng, zipCode, city, state, breweries, marker;
let markers = [];
let firstTime = true;

function initMap() {
  
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 0, lng: 0 },
    zoom: 1,
    minZoom: 1
  });
  //infoWindow = new google.maps.InfoWindow();
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
          var iconBase = 'http://maps.google.com/mapfiles/kml/pal4/';
          var you = new google.maps.Marker({
          position: pos,
          map: map,
          icon: iconBase + 'icon50.png'
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

const drop = (breweries) => {
  clearMarkers();
  for (let i = 0; i < breweries.length; i++) {
    addMarkerWithTimeout(breweries[i], i * 200);
  }
};

const addMarkerWithTimeout = (brewary, timeout) => {
  window.setTimeout(() => {
    markers.push(
      marker = new google.maps.Marker({
        position: new google.maps.LatLng(brewary.latitude, brewary.longitude),
        map: map,
        animation: google.maps.Animation.DROP,
        title: brewary.name
      }),
      
      google.maps.event.addListener(marker, 'click', ((marker) => {
              return function () {
                let infowindow =  new google.maps.InfoWindow({});
                const contentWindow = `
                <h3>${brewary.name}</h3>
                <h5>${brewary.brewery_type.charAt(0).toUpperCase() + brewary.brewery_type.slice(1)}</h5>
                <p>${brewary.street}</p>
                <p>${brewary.phone}</p>
                <a href=${brewary.website_url} target="_blank">${brewary.website_url}</a>
                `;
                infowindow.setContent(contentWindow);
               
                infowindow.open(map, marker);
          };
        })(marker)),
    );
  }, timeout);
};

const clearMarkers = () => {
  for (let i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
  markers = [];
};

