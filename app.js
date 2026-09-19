const SUPABASE_URL = "https://jacxlmcwwedertcaizdj.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_LZQ6oY0ReQ5uerLsHOtYIQ_llOyeB94";

const db = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

let movies = [];

document.addEventListener("DOMContentLoaded", () => {
  loadMovies();
});

async function loadMovies() {
  const movieGrid =
    document.getElementById("movieGrid") ||
    document.getElementById("movieList");

  if (!movieGrid) {
    console.error("Movie container not found.");
    return;
  }

  movieGrid.innerHTML =
    '<div class="loading">Loading movies...</div>';

  try {
    const { data, error } = await db
      .from("movies")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);

      movieGrid.innerHTML = `
        <div class="loading">
          Unable to load movies.
        </div>
      `;

      return;
    }

    movies = data || [];

    console.log("NEX BOX Movies found:", movies.length);

    if (movies.length === 0) {
      movieGrid.innerHTML = `
        <div class="loading">
          No movies available yet.
        </div>
      `;
      return;
    }

    displayMovies(movies);

  } catch (error) {
    console.error("Movie loading error:", error);

    movieGrid.innerHTML = `
      <div class="loading">
        Something went wrong.
      </div>
    `;
  }
}

function displayMovies(movieData) {

  const movieGrid =
    document.getElementById("movieGrid") ||
    document.getElementById("movieList");

  if (!movieGrid) return;

  movieGrid.innerHTML = "";

  movieData.forEach(movie => {

    const card = document.createElement("div");

    card.className = "movie-card";

    const poster =
      movie.poster_url ||
      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba";

    const title =
      movie.title || "Untitled Movie";

    const year =
      movie.year || "";

    const genre =
      movie.genre || "";

    card.innerHTML = `
      <img
        class="movie-poster"
        src="${escapeHTML(poster)}"
        alt="${escapeHTML(title)}"
        loading="lazy"
        onerror="this.src='https://images.unsplash.com/photo-1489599849927-2ee91cede3ba'"
      >

      <div class="movie-info">

        <div class="movie-title">
          ${escapeHTML(title)}
        </div>

        <div class="movie-meta">
          ${escapeHTML(String(year))}
          ${year && genre ? " • " : ""}
          ${escapeHTML(genre)}
        </div>

      </div>
    `;

    card.addEventListener("click", () => {
      openMovie(movie.id);
    });

    movieGrid.appendChild(card);
  });
}

function openMovie(id) {

  if (!id) {
    console.error("Movie ID is missing.");
    return;
  }

  window.location.href =
    "./watch.html?movie=" +
    encodeURIComponent(id);
}

function escapeHTML(value) {

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* Search */

function searchMovies(query) {

  const text =
    String(query || "")
      .trim()
      .toLowerCase();

  if (!text) {
    displayMovies(movies);
    return;
  }

  const results = movies.filter(movie => {

    const title =
      String(movie.title || "")
        .toLowerCase();

    const genre =
      String(movie.genre || "")
        .toLowerCase();

    const description =
      String(movie.description || "")
        .toLowerCase();

    return (
      title.includes(text) ||
      genre.includes(text) ||
      description.includes(text)
    );
  });

  displayMovies(results);
}

/* Make functions available to HTML buttons */

window.loadMovies = loadMovies;
window.displayMovies = displayMovies;
window.openMovie = openMovie;
window.searchMovies = searchMovies;
