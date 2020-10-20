(async () => {
    try {
      const response = await axios.get(`http://api.spotcrime.com/crimes.json?lat=33.812500&lon=-84.424940&radius=5&key=This-api-key-is-for-commercial-use-exclusively.Only-entities-with-a-Spotcrime-contract-May-use-this-key.Call-877.410.1607.`);
      console.log(response.data.crimes);
      document.querySelector(".movies-container").innerHTML = renderMovies(response.data.Search);
    } catch (error) {
      console.log(error.response.body);
    }
  })();