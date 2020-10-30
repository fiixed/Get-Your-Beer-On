let beerSearchData, cardContainer;

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('search-form').addEventListener('submit', async e => {
        e.preventDefault();
        document.getElementById('card-container').innerHTML = '';
        document.getElementById('styleOfBeer').innerHTML = '';
        document.getElementById('countryOfBeer').innerHTML = '';
        styleArray = [];
        countryArray = [];
        let searchString = document.querySelector('.search-bar').value;
        let urlEncodedSearchString = encodeURIComponent(searchString);
        beerSearchData = await getBeers(urlEncodedSearchString);
        beerSearchData.forEach((beer) => {
            createBeerCard(beer);
        });
        //This for loop will get all of the styles of beers that the user searched for
        for (let i = 0; i < beerSearchData.length; i++) {
            if (beerSearchData[i].fields.style_name == undefined) {
                continue;
            };
            styleArray.push(beerSearchData[i].fields.style_name);
        };
        styleArray = styleArray.filter(unique);
        styleFilter(styleArray);

        //This for loop will get all of the countries of beer that the user searched for
        for (let i = 0; i < beerSearchData.length; i++) {
            if (beerSearchData[i].fields.country == undefined) {
                continue;
            };
            countryArray.push(beerSearchData[i].fields.country);
        };
        countryArray = countryArray.filter(unique);
        countryFilter(countryArray);

        initListOfBeers();
    });
});

async function getBeers(searchValue) {
    const response = await axios.get(`https://data.opendatasoft.com/api/records/1.0/search/?dataset=open-beer-database%40public-us&q=${searchValue}&facet=style_name&facet=cat_name&facet=name_breweries&facet=country`);
    return await response.data.records;
};

//This function will create a "card" for each beer result returned from the API
let createBeerCard = (beer) => {
    let cardContainer = document.getElementById('card-container');
    let card = document.createElement('div');
    card.className = 'card mb-3 rounded cursor-pointer';

    let cardBody = document.createElement('div');
    cardBody.className = 'card-body';

    let title = document.createElement('h5');
    title.innerText = beer.fields.name;
    title.className = 'card-title';

    let styleOfBeer = document.createElement('p');
    styleOfBeer.innerText = beer.fields.style_name;
    styleOfBeer.className = 'card-text';

    let breweryName = document.createElement('p')
    breweryName.innerText = beer.fields.name_breweries;
    breweryName.className = 'card-text';

    let cityState = document.createElement('p');
    cityState.innerText = `${beer.fields.city}, ${beer.fields.state}`;
    cityState.className = 'card-text';

    let country = document.createElement('p');
    country.innerText = beer.fields.country;
    country.className = 'card-text';

    cardBody.appendChild(title);

    cardBody.appendChild(styleOfBeer);
    if(styleOfBeer.innerText == 'undefined') {
        styleOfBeer.innerText = '';
    }

    cardBody.appendChild(breweryName);

    cardBody.appendChild(cityState);
    if(beer.fields.city == undefined) {
        cityState.innerText = beer.fields.state;
    }
    if(beer.fields.state == undefined) {
        cityState.innerText = beer.fields.city;
    }

    cardBody.appendChild(country);
    card.appendChild(cardBody);
    cardContainer.appendChild(card);

    cardBody.addEventListener('click', function() {
        sessionStorage.setItem("name", beer.fields.name_breweries);
        sessionStorage.setItem("lat", beer.fields.coordinates[0]);
        sessionStorage.setItem("lng", beer.fields.coordinates[1]);
        window.open("map.html");
    });
};

//This function will render the previously created beer cards to the screen
let initListOfBeers = () => {
    if (cardContainer) {
        document.getElementById('card-container').replaceWith(cardContainer);
        return;
    }

    cardContainer = document.getElementById('card-container');
    beerSearchData.forEach((beer) => {
        createBeerCard(beer);
    });
};

const unique = (value, index, self) => {
    return self.indexOf(value) === index;
};

//This function will set the style dropdown to the unique styles of beers the user searched for
let styleFilter = (styleArray) => {
    let styleDropdown = document.getElementById('styleOfBeer');
    styleArray.forEach((beer) => {
        let option = document.createElement('a');
        option.className = 'dropdown-item';
        option.href = '#';
        option.innerText = beer;
        option.addEventListener('click', () => {
            let styleFilteredBeer = beerSearchData.filter((i) => {
                return i.fields.style_name == beer;
            });
            document.getElementById('card-container').innerHTML = '';
            styleFilteredBeer.forEach((newBeer) => {
                createBeerCard(newBeer);
            });
            initListOfBeers();
        });
        styleDropdown.appendChild(option);
    });
};

//This function will set the country dropdown to the unique countries of beers the user searched for
let countryFilter = (countryArray) => {
    let countryDropdown = document.getElementById('countryOfBeer');
    countryArray.forEach((beer) => {
        let option = document.createElement('a');
        option.className = 'dropdown-item';
        option.href = '#';
        option.innerText = beer;
        option.addEventListener('click', () => {
            let countryFilteredBeer = beerSearchData.filter((i) => {
                return i.fields.country == beer;
            });
            document.getElementById('card-container').innerHTML = '';
            countryFilteredBeer.forEach((newBeer) => {
                createBeerCard(newBeer);
            });
            initListOfBeers();
        });
        countryDropdown.appendChild(option);
    });
};