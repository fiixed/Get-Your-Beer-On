let geoKey = config.GEO;

document.addEventListener('DOMContentLoaded', () => {
  (async () => {
    try {
      const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=40.714224,-73.961452&key=${geoKey}`);
      console.log(response.data);
      
    } catch (error) {
      console.log(error.response.body);
    }
  })();
});

