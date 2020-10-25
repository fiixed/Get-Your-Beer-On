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

getBeers('dog').then(result => console.log(result)) //remove this later, this is just so we can see where the data is

let createBeerCard = (beer) => {
    let cardContainer = document.getElementById('card-container');
    let card = document.createElement('div');
    card.className = 'card shadow cursor-pointer';

    let cardBody = document.createElement('div');
    cardBody.className = 'card-body';

    let title = document.createElement('h5');
    title.innerText = beer.fields.name;
    title.className = 'card-title';

    let style = document.createElement('p'); //some are coming back as undefined. fix (ex blue moon)
    style.innerText = beer.fields.style_name;
    style.className = ''; //update this, research bootstrap classes

    let cityState = document.createElement('p');
    cityState.innerText = `${beer.fields.city}, ${beer.fields.state}`;
    cityState.className = ''; //update this, research bootstrap classes

    let country = document.createElement('p');
    country.innerText = beer.fields.country;
    country.className = ''; //update this, research bootstrap classes


    cardBody.appendChild(title);
    cardBody.appendChild(style);
    cardBody.appendChild(cityState);
    cardBody.appendChild(country);
    card.appendChild(cardBody);
    cardContainer.appendChild(card);

}

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