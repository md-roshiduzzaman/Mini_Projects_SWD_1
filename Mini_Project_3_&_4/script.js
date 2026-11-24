
const API_KEY = "e77e8698";
const API_URL = "https://www.omdbapi.com/";
const STORAGE_KEY = "cinescope_watchlist";

const searchForm = document.querySelector("#searchForm");
const searchInput = document.querySelector("#searchInput");
const movieGrid = document.querySelector("#movieGrid");
const statusMessage = document.querySelector("#statusMessage");
const emptyState = document.querySelector("#emptyState");
const resultsTitle = document.querySelector("#resultsTitle");
const sortSelect = document.querySelector("#sortSelect");
const favoritesNav = document.querySelector("#favoritesNav");
const watchlistCount = document.querySelector("#watchlistCount");
const watchlistSection = document.querySelector("#watchlistSection");
const discoverSection = document.querySelector(".content-section");
const watchlistGrid = document.querySelector("#watchlistGrid");
const watchlistEmpty = document.querySelector("#watchlistEmpty");
const backToDiscover = document.querySelector("#backToDiscover");
const modal = document.querySelector("#movieModal");
const modalContent = document.querySelector("#modalContent");
const closeModal = document.querySelector("#closeModal");

let currentMovies = [];
let currentView = "discover";
let watchlist = loadWatchlist();


function loadWatchlist() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch (error) {
    console.error("Could not read the watchlist:", error);
    return [];
  }
}


function saveWatchlist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist));
  updateWatchlistCount();
}

function updateWatchlistCount() {
  watchlistCount.textContent = watchlist.length;
}

function setStatus(message, type = "loading") {
  statusMessage.classList.remove("hidden", "error");
  statusMessage.classList.toggle("error", type === "error");
  statusMessage.innerHTML = type === "loading"
    ? `<span class="loader"></span><span>${message}</span>`
    : `<span>${message}</span>`;
  movieGrid.innerHTML = "";
  emptyState.classList.add("hidden");
}


async function searchMovies(query) {
  currentView = "discover";
  resultsTitle.textContent = `Results for "${query}"`;
  setStatus("Searching the movie database...");
  try {
    const response = await fetch(`${API_URL}?apikey=${API_KEY}&s=${encodeURIComponent(query)}&type=movie`);
    if (!response.ok) throw new Error("Network response was not successful.");
    const data = await response.json();

    if (data.Response === "False") {
      currentMovies = [];
      statusMessage.classList.add("hidden");
      emptyState.classList.remove("hidden");
      emptyState.querySelector("h3").textContent = "No movies found";
      emptyState.querySelector("p").textContent = data.Error || "Try another title or check your spelling.";
      return;
    }


    currentMovies = data.Search.map(movie => ({
      imdbID: movie.imdbID,
      title: movie.Title,
      year: movie.Year,
      poster: movie.Poster,
      type: movie.Type
    }));
    renderMovies(currentMovies, movieGrid);
  } catch (error) {
    console.error("Movie search failed:", error);
    setStatus("Could not load movies. Check your internet connection and API key, then try again.", "error");
  }
}


function renderMovies(movies, container) {
  statusMessage.classList.add("hidden");
  container.innerHTML = "";

  if (movies.length === 0) {
    if (container === watchlistGrid) watchlistEmpty.classList.remove("hidden");
    else emptyState.classList.remove("hidden");
    return;
  }
  if (container === watchlistGrid) watchlistEmpty.classList.add("hidden");
  else emptyState.classList.add("hidden");

  movies.forEach(movie => {
    const isSaved = watchlist.some(saved => saved.imdbID === movie.imdbID);
    const card = document.createElement("article");
    card.className = "movie-card";
    const posterMarkup = movie.poster && movie.poster !== "N/A"
      ? `<img src="${movie.poster}" alt="${escapeHTML(movie.title)} poster" loading="lazy">`
      : `<div class="poster-placeholder">▧</div>`;

    card.innerHTML = `
      <div class="poster-wrap" data-details="${movie.imdbID}">
        ${posterMarkup}
        <button class="heart-button ${isSaved ? "saved" : ""}" type="button"
          data-favorite="${movie.imdbID}" aria-label="${isSaved ? "Remove from" : "Add to"} watchlist">
          ${isSaved ? "♥" : "♡"}
        </button>
      </div>
      <div class="movie-meta"><span>${escapeHTML(movie.year || "Year unknown")}</span><span class="rating">MOVIE</span></div>
      <h3 class="movie-title" data-details="${movie.imdbID}" title="${escapeHTML(movie.title)}">${escapeHTML(movie.title)}</h3>
      <p class="movie-type">Film · ${escapeHTML(movie.type || "movie")}</p>`;
    container.appendChild(card);
  });
}


function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

function toggleFavorite(movie) {
  const exists = watchlist.some(saved => saved.imdbID === movie.imdbID);
  if (exists) {
    watchlist = watchlist.filter(saved => saved.imdbID !== movie.imdbID);
  } else {
    watchlist.push(movie);
  }
  saveWatchlist();
  if (currentView === "watchlist") renderMovies(watchlist, watchlistGrid);
  else renderMovies(currentMovies, movieGrid);
}


async function showMovieDetails(imdbID) {
  modal.classList.remove("hidden");
  modalContent.innerHTML = `<div class="status-message"><span class="loader"></span><span>Loading movie details...</span></div>`;
  try {
    const response = await fetch(`${API_URL}?apikey=${API_KEY}&i=${encodeURIComponent(imdbID)}&plot=full`);
    if (!response.ok) throw new Error("Could not retrieve movie details.");
    const movie = await response.json();
    if (movie.Response === "False") throw new Error(movie.Error);

    const saved = watchlist.some(item => item.imdbID === movie.imdbID);
    modalContent.innerHTML = `
      <div class="modal-layout">
        <img class="modal-poster" src="${movie.Poster !== "N/A" ? movie.Poster : ""}" alt="${escapeHTML(movie.Title)} poster">
        <div class="modal-copy">
          <p class="eyebrow dark-eyebrow">MOVIE DETAILS</p>
          <h2 id="modalTitle">${escapeHTML(movie.Title)}</h2>
          <div class="modal-sub">${escapeHTML(movie.Year)} · ${escapeHTML(movie.Runtime)} · ${escapeHTML(movie.Rated)}</div>
          <div class="detail-row">
            <span class="detail-chip">★ ${escapeHTML(movie.imdbRating || "N/A")}</span>
            <span class="detail-chip">${escapeHTML(movie.Genre || "Genre unavailable")}</span>
          </div>
          <p>${escapeHTML(movie.Plot || "No plot summary available.")}</p>
          <p><strong>Director:</strong> ${escapeHTML(movie.Director || "N/A")}<br>
          <strong>Cast:</strong> ${escapeHTML(movie.Actors || "N/A")}</p>
          <button class="primary-small" id="modalFavorite" type="button">${saved ? "♥ Remove from watchlist" : "♡ Add to watchlist"}</button>
        </div>
      </div>`;
    document.querySelector("#modalFavorite").addEventListener("click", () => {
      const compactMovie = { imdbID: movie.imdbID, title: movie.Title, year: movie.Year, poster: movie.Poster, type: "movie" };
      toggleFavorite(compactMovie);
      showMovieDetails(imdbID);
    });
  } catch (error) {
    modalContent.innerHTML = `<div class="empty-state"><h3>Details unavailable</h3><p>${escapeHTML(error.message)}</p></div>`;
  }
}


document.addEventListener("click", event => {
  const favoriteButton = event.target.closest("[data-favorite]");
  const detailsTarget = event.target.closest("[data-details]");
  if (favoriteButton) {
    event.stopPropagation();
    const movie = [...currentMovies, ...watchlist].find(item => item.imdbID === favoriteButton.dataset.favorite);
    if (movie) toggleFavorite(movie);
  } else if (detailsTarget) {
    showMovieDetails(detailsTarget.dataset.details);
  }
});

searchForm.addEventListener("submit", event => {
  event.preventDefault();
  const query = searchInput.value.trim();
  if (query) {
    watchlistSection.classList.add("hidden");
    discoverSection.classList.remove("hidden");
    searchMovies(query);
  }
});

document.querySelectorAll(".suggestion").forEach(button => {
  button.addEventListener("click", () => {
    searchInput.value = button.dataset.query;
    searchForm.requestSubmit();
  });
});

sortSelect.addEventListener("change", () => {
  const sorted = [...currentMovies];
  if (sortSelect.value === "year") sorted.sort((a, b) => parseInt(b.year) - parseInt(a.year));
  if (sortSelect.value === "title") sorted.sort((a, b) => a.title.localeCompare(b.title));
  renderMovies(sorted, movieGrid);
});

favoritesNav.addEventListener("click", () => {
  currentView = "watchlist";
  discoverSection.classList.add("hidden");
  watchlistSection.classList.remove("hidden");
  renderMovies(watchlist, watchlistGrid);
  window.scrollTo({ top: watchlistSection.offsetTop - 20, behavior: "smooth" });
});

backToDiscover.addEventListener("click", () => {
  currentView = "discover";
  watchlistSection.classList.add("hidden");
  discoverSection.classList.remove("hidden");
});

function hideModal() { modal.classList.add("hidden"); }
closeModal.addEventListener("click", hideModal);
modal.addEventListener("click", event => {
  if (event.target.dataset.close === "true") hideModal();
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape") hideModal();
});


updateWatchlistCount();
if (API_KEY === "YOUR_OMDB_API_KEY") {
  setStatus("Add your OMDb API key in script.js to start discovering movies.", "error");
} else {
  searchMovies("Batman");
}
