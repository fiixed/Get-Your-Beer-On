let geoKey = config.GEO;
let lat = '33.812500';
let lon = '-84.424942';

document.addEventListener('DOMContentLoaded', () => {
  (async () => {
    try {
      const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${geoKey}`);
      console.log(response.data);
      
    } catch (error) {
      console.log(error.response.body);
    }
  })();
});

