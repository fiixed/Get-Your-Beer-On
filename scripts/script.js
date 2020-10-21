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