let brewerieSearchData;


document.addEventListener('DOMContentLoaded', () => {
    function renderBreweries(brewerieArray) {
        let brewerieHTML = brewerieArray.map(currentBrewerie => {
            return `
                <div class="brewerieCard">
                    <a href="${currentBrewerie.website_url}">${currentBrewerie.name}</a><br>
                    <p>${currentBrewerie.city}, ${currentBrewerie.state} ${currentBrewerie.postal_code}</p><br>
                </div>
            `;
        });
        return brewerieHTML.join('');
    }
    document.getElementById('search-form').addEventListener('submit', e => {
        e.preventDefault();
        let searchString = document.querySelector('.search-bar').value;
        let urlEncodedSearchString = encodeURIComponent(searchString);
        axios.get(`https://api.openbrewerydb.org/breweries/search?query=${urlEncodedSearchString}`).then(response => {
            brewerieSearchData = response.data;
            document.querySelector(".breweries-container").innerHTML = renderBreweries(brewerieSearchData);
        });
    });
});



// animation

const animateCSS = (element, animation, prefix = 'animate__') =>
// We create a Promise and return it
new Promise((resolve, reject) => {
  const animationName = `${prefix}${animation}`;
  const node = document.querySelector(element);

  node.classList.add(`${prefix}animated`, animationName);

  // When the animation ends, we clean the classes and resolve the Promise
  function handleAnimationEnd() {
    node.classList.remove(`${prefix}animated`, animationName);
    resolve('Animation ended');
  }

  node.addEventListener('animationend', handleAnimationEnd, {once: true});
});

    // delayed elements
        const element = document.getElementById('lead');
        element.style.setProperty('--animate-duration', '1.5s');
    // end delayed elements

// end animation