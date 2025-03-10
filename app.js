const API_KEY = "b68785d95238357b12cec2eca99ee64f";
const API_URL = "https://api.themoviedb.org/3";
const POSTER_BASE_URL = "https://image.tmdb.org/t/p/w500";
const LOGO_BASE_URL = "https://image.tmdb.org/t/p/w45";

let movies = [];
let watchlist = [];
let watchedMovies = [];
let currentMovieIndex = 0;

// Fetch high-rated movies
async function fetchMovies() {
    try {
        const page = Math.floor(Math.random() * 500) + 1;
        const response = await fetch(
            `${API_URL}/discover/movie?api_key=${API_KEY}&vote_average.gte=6&page=${page}`
        );
        const data = await response.json();
        if (data.results) {
            movies = data.results;
            showMovie();
        }
    } catch (err) {
        console.error("Error fetching movies:", err);
    }
}

// Display the current movie
function showMovie() {
    const movie = movies[currentMovieIndex];
    const container = document.getElementById("current-movie");

    if (!container || !movie || !movie.poster_path) {
        container.innerHTML = "<p>No movie available.</p>";
        return;
    }

    container.innerHTML = `
        <img src="${POSTER_BASE_URL + movie.poster_path}" alt="${movie.title || "Untitled"}" />
        <h3>${movie.title || "Untitled"}</h3>
        <p>Rating: ${movie.vote_average || "N/A"}</p>
        <p>Release Date: ${movie.release_date || "N/A"}</p>
    `;
}

// Move to the next movie
function nextMovie() {
    if (movies.length === 0) return;
    currentMovieIndex++;
    if (currentMovieIndex >= movies.length) currentMovieIndex = 0;
    showMovie();
}

// Add the current movie to the watchlist
function addToWatchlist() {
    const movie = movies[currentMovieIndex];
    if (movie) {
        watchlist.push(movie);
        saveWatchlist();
        showWatchlist();
        nextMovie();
    }
}

// Remove a movie from the watchlist
function removeFromWatchlist(index) {
    if (index < 0 || index >= watchlist.length) return;
    watchlist.splice(index, 1);
    saveWatchlist();
    showWatchlist();
}

// Mark the current movie as watched
function markAsWatched() {
    const movie = movies[currentMovieIndex];
    if (movie) {
        watchedMovies.push(movie);
        saveWatchedMovies();
        showWatchedMovies();
        nextMovie();
    }
}

// Fetch streaming providers for a movie
async function fetchStreamingServices(movieId) {
    try {
        const response = await fetch(
            `${API_URL}/movie/${movieId}/watch/providers?api_key=${API_KEY}`
        );
        const data = await response.json();
        const providersAU = data.results?.AU?.flatrate || [];
        return providersAU.map((provider) => ({
            name: provider.provider_name,
            logo: `${LOGO_BASE_URL}${provider.logo_path}`,
        }));
    } catch (err) {
        console.error("Error fetching streaming services:", err);
        return [];
    }
}

// Display the current watchlist
async function showWatchlist() {
    const container = document.getElementById("watchlist-container");
    if (!container) return;

    container.innerHTML = "";

    if (watchlist.length === 0) {
        container.innerHTML = "<p>Your watchlist is empty!</p>";
        return;
    }

    for (const [index, movie] of watchlist.entries()) {
        const providers = await fetchStreamingServices(movie.id);
        const providerLogos = providers
            .map(
                (provider) =>
                    `<div class="provider-logo">
                        <img src="${provider.logo}" alt="${provider.name}" title="${provider.name}">
                    </div>`
            )
            .join("");

        container.innerHTML += `
          <div class="movie">
            <img src="${POSTER_BASE_URL + movie.poster_path}" alt="${movie.title || "Untitled"}">
            <h3>${movie.title || "Untitled"}</h3>
            <div class="providers">
              ${providers.length > 0 ? providerLogos : "<p>No providers available</p>"}
            </div>
            <button onclick="removeFromWatchlist(${index})">Remove</button>
          </div>
        `;
    }
}

// Display the watched movies
function showWatchedMovies() {
    const container = document.getElementById("watched-movies-container");
    if (!container) return;

    container.innerHTML = "";

    if (watchedMovies.length === 0) {
        container.innerHTML = "<p>Watched list is empty!</p>";
        return;
    }

    for (const movie of watchedMovies) {
        container.innerHTML += `
            <div class="movie">
                <img src="${POSTER_BASE_URL + movie.poster_path}" alt="${movie.title || "Untitled"}">
                <h3>${movie.title || "Untitled"}</h3>
            </div>`;
    }
}

// Toggle the watchlist sidebar
function toggleWatchlist() {
    const sidebar = document.getElementById("watchlist-sidebar");
    sidebar.classList.toggle("collapsed");
}

// Save watchlist to localStorage
function saveWatchlist() {
    localStorage.setItem("watchlist", JSON.stringify(watchlist));
}

// Load watchlist from localStorage
function loadWatchlist() {
    try {
        watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
        showWatchlist();
    } catch (err) {
        console.error("Error loading watchlist:", err);
        watchlist = [];
    }
}

// Save watched movies to localStorage
function saveWatchedMovies() {
    localStorage.setItem("watchedMovies", JSON.stringify(watchedMovies));
}

// Load watched movies from localStorage
function loadWatchedMovies() {
    try {
        watchedMovies = JSON.parse(localStorage.getItem("watchedMovies")) || [];
        showWatchedMovies();
    } catch (err) {
        console.error("Error loading watched movies:", err);
        watchedMovies = [];
    }
}

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
    loadWatchlist();
    loadWatchedMovies();
    fetchMovies();

    document.getElementById("toggle-watchlist")
        ?.addEventListener("click", toggleWatchlist);
    document.getElementById("watchlist-button")
        ?.addEventListener("click", addToWatchlist);
    document.getElementById("watched-button")
        ?.addEventListener("click", markAsWatched);
    document.getElementById("skip-button")
        ?.addEventListener("click", nextMovie);
});