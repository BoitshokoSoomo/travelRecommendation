const searchInput = document.querySelector("#searchInput");
const searchButton = document.querySelector("#searchButton");
const clearButton = document.querySelector("#clearButton");
const results = document.querySelector("#results");
const resultsTitle = document.querySelector("#resultsTitle");
const contactForm = document.querySelector("#contactForm");

let travelData = null;

const categoryAliases = {
  beach: "beaches",
  beaches: "beaches",
  temple: "temples",
  temples: "temples",
  country: "countries",
  countries: "countries"
};

async function loadTravelData() {
  const response = await fetch("travel_recommendation_api.json");
  if (!response.ok) {
    throw new Error("Travel data could not be loaded.");
  }
  travelData = await response.json();
}

function normalize(value) {
  return value.trim().toLowerCase();
}

function countryMatches(query) {
  return travelData.countries
    .filter((country) => normalize(country.name).includes(query))
    .flatMap((country) => country.cities);
}

function recommendationMatches(query) {
  const directCategory = categoryAliases[query];

  if (directCategory) {
    if (directCategory === "countries") {
      return travelData.countries.map((country) => country.cities[0]);
    }

    return travelData[directCategory].slice(0, 2);
  }

  const countryResults = countryMatches(query);
  if (countryResults.length) {
    return countryResults;
  }

  return [...travelData.beaches, ...travelData.temples, ...travelData.countries.flatMap((country) => country.cities)]
    .filter((place) => {
      const searchableText = `${place.name} ${place.description}`.toLowerCase();
      return searchableText.includes(query);
    })
    .slice(0, 6);
}

function renderCards(places) {
  results.innerHTML = "";

  if (!places.length) {
    results.innerHTML = `
      <article class="empty-state">
        <h3>No recommendations found</h3>
        <p>Try beach, temple, Japan, Australia, or Brazil.</p>
      </article>
    `;
    return;
  }

  places.forEach((place) => {
    const card = document.createElement("article");
    card.className = "recommendation-card";
    card.innerHTML = `
      <img src="${place.imageUrl}" alt="${place.name}" loading="lazy">
      <div class="recommendation-body">
        <h3>${place.name}</h3>
        <p>${place.description}</p>
        <button type="button">Visit</button>
      </div>
    `;
    results.appendChild(card);
  });
}

async function handleSearch() {
  const query = normalize(searchInput.value);

  if (!travelData) {
    await loadTravelData();
  }

  if (!query) {
    resultsTitle.textContent = "Featured Escapes";
    renderCards([...travelData.beaches.slice(0, 1), ...travelData.temples.slice(0, 1)]);
    return;
  }

  const matches = recommendationMatches(query);
  resultsTitle.textContent = `Search Results for "${searchInput.value.trim()}"`;
  renderCards(matches);
}

function clearResults() {
  searchInput.value = "";
  resultsTitle.textContent = "Featured Escapes";
  if (travelData) {
    renderCards([...travelData.beaches.slice(0, 1), ...travelData.temples.slice(0, 1)]);
  } else {
    results.innerHTML = "";
  }
  searchInput.focus();
}

searchButton.addEventListener("click", handleSearch);
clearButton.addEventListener("click", clearResults);

searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    handleSearch();
  }
});

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  contactForm.reset();
  alert("Thank you for contacting TravelBloom.");
});

loadTravelData()
  .then(() => renderCards([...travelData.beaches.slice(0, 1), ...travelData.temples.slice(0, 1)]))
  .catch(() => {
    results.innerHTML = `
      <article class="empty-state">
        <h3>Travel data is unavailable</h3>
        <p>Please run this project from a local web server and refresh the page.</p>
      </article>
    `;
  });
