let mapKey = config.GEO;

let map;
const center = { lat: 33.812500, lng: -84.424942 };
const zoom = 14;
const url = "https://maps.googleapis.com/maps/api/staticmap";
const loader = new google.maps.plugins.loader.Loader({
  apiKey: mapKey,
  version: "weekly",
});
document.addEventListener("DOMContentLoaded", () => {
  const wrapper = document.getElementById("wrapper");
  wrapper.style.backgroundImage = `url(${url}?center=${center.lat},${center.lng}&zoom=${zoom}&scale=2&size=${wrapper.clientWidth}x${wrapper.clientHeight}&key=YOUR_API_KEY)`;
  wrapper.addEventListener("click", () => {
    wrapper.remove();
    loader.load().then(() => {
      map = new google.maps.Map(document.getElementById("map"), {
        center,
        zoom,
      });
    });
  });
});

