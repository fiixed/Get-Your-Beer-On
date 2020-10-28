let beerSearchData, cardContainer;

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('search-form').addEventListener('submit', async e => {
        e.preventDefault();
        document.getElementById('card-container').innerHTML = '';
        let searchString = document.querySelector('.search-bar').value;
        let urlEncodedSearchString = encodeURIComponent(searchString);
        beerSearchData = await getBeers(urlEncodedSearchString);
        beerSearchData.forEach((beer) => {
            createBeerCard(beer);
        });
        initListOfBeers();
    });
});

async function getBeers(searchValue) {
    const response = await axios.get(`https://data.opendatasoft.com/api/records/1.0/search/?dataset=open-beer-database%40public-us&q=${searchValue}&facet=style_name&facet=cat_name&facet=name_breweries&facet=country`)
    return await response.data.records;
};

//This function will create a "card" for each beer result returned from the API
let createBeerCard = (beer) => {
    let cardContainer = document.getElementById('card-container');
    let card = document.createElement('div');
    card.className = 'card shadow cursor-pointer';

    let cardBody = document.createElement('div');
    cardBody.className = 'card-body';

    let title = document.createElement('h5');
    title.innerText = beer.fields.name;
    title.className = 'card-title';

    let styleOfBeer = document.createElement('p');
    styleOfBeer.innerText = beer.fields.style_name;
    styleOfBeer.className = 'card-text';

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
}

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

function styleFilter() {
    let styleDropdown = document.getElementById('styleOfBeer');
    let firstOption = document.createElement('a');
    firstOption.className = 'dropdown-item';
    firstOption.href = '#';
    firstOption.innerText = 'test'
    styleDropdown.appendChild(firstOption);
}