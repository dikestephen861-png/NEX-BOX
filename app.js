/* =========================================================
   NEX BOX - MAIN APP
   Supabase Movie Library
========================================================= */

const SUPABASE_URL =
  "https://jacxlmcwwedertcaizdj.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_LZQ6oY0ReQ5uerLsHOtYIQ_llOyeB94";

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );


let onlineMovies = [];
let activeScreen = "home";


/* =========================================================
   START APP
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  console.log("NEX BOX starting...");

  loadMovies();

  setupNavigation();

});


/* =========================================================
   LOAD MOVIES FROM SUPABASE
========================================================= */

async function loadMovies() {

  const grid =
    document.getElementById("movieGrid");

  if (!grid) {
    console.error("movieGrid was not found.");
    return;
  }


  grid.innerHTML = `
    <div class="nex-loading">
      Loading movies...
    </div>
  `;


  try {

    const { data, error } =
      await supabaseClient
        .from("movies")
        .select("*")
        .order(
          "created_at",
          {
            ascending: false
          }
        );


    if (error) {

      console.error(
        "Supabase movie error:",
        error
      );

      grid.innerHTML = `
        <div class="nex-error">
          Unable to load movies.
          <br>
          <small>${escapeHTML(error.message)}</small>
        </div>
      `;

      return;
    }


    onlineMovies = data || [];


    console.log(
      "Movies found:",
      onlineMovies.length
    );


    if (!onlineMovies.length) {

      grid.innerHTML = `
        <div class="nex-empty">
          <div style="font-size:40px;">🎬</div>
          <h3>No movies yet</h3>
          <p>
            Movies uploaded from NEX BOX Admin
            will appear here.
          </p>
        </div>
      `;

      return;
    }


    renderMovies(
      onlineMovies
    );


  } catch (error) {

    console.error(
      "NEX BOX movie loading failed:",
      error
    );

    grid.innerHTML = `
      <div class="nex-error">
        Something went wrong while loading movies.
      </div>
    `;

  }

}


/* =========================================================
   DISPLAY MOVIES
========================================================= */

function renderMovies(movies) {

  const grid =
    document.getElementById("movieGrid");

  if (!grid) return;


  grid.innerHTML = "";


  movies.forEach(movie => {

    const card =
      document.createElement("div");

    card.className =
      "nex-movie-card";


    card.innerHTML = `

      <div class="nex-poster-wrapper">

        <img
          class="nex-poster"
          src="${escapeAttribute(
            movie.poster_url || ""
          )}"
          alt="${escapeAttribute(
            movie.title || "Movie"
          )}"
          loading="lazy"
          onerror="
            this.src='data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
              <svg xmlns="http://www.w3.org/2000/svg"
                   width="300"
                   height="450">
                <rect width="100%" height="100%"
                      fill="#181818"/>
                <text x="50%" y="50%"
                      fill="#777"
                      text-anchor="middle"
                      font-size="22">
                  NEX BOX
                </text>
              </svg>
            `)}';
          "
        >

        <div class="nex-play">
          ▶
        </div>

      </div>

      <div class="nex-movie-info">

        <div class="nex-movie-title">
          ${escapeHTML(
            movie.title || "Untitled"
          )}
        </div>

        <div class="nex-movie-meta">

          ${movie.year || ""}

          ${movie.genre ? " • " + escapeHTML(movie.genre) : ""}

        </div>

      </div>

    `;


    card.addEventListener(
      "click",
      () => {

        openMovie(movie);

      }
    );


    grid.appendChild(card);

  });


  addMovieStyles();

}


/* =========================================================
   OPEN MOVIE
========================================================= */

function openMovie(movie) {

  console.log(
    "Opening movie:",
    movie
  );


  /*
   * Store the selected movie.
   * This allows movie.html / watch.html
   * to retrieve it.
   */

  localStorage.setItem(
    "nexbox_selected_movie",
    JSON.stringify(movie)
  );


  /*
   * Try movie.html first.
   */

  window.location.href =
    "movie.html?id=" +
    encodeURIComponent(movie.id);

}


/* =========================================================
   SEARCH
========================================================= */

function searchMovies(query) {

  const value =
    String(query || "")
      .trim()
      .toLowerCase();


  if (!value) {

    renderMovies(
      onlineMovies
    );

    return;

  }


  const results =
    onlineMovies.filter(movie => {

      return (
        String(movie.title || "")
          .toLowerCase()
          .includes(value)

        ||

        String(movie.genre || "")
          .toLowerCase()
          .includes(value)

        ||

        String(movie.description || "")
          .toLowerCase()
          .includes(value)
      );

    });


  renderMovies(results);

}


/* =========================================================
   NAVIGATION
========================================================= */

function setupNavigation() {

  document.addEventListener(
    "click",
    event => {

      const home =
        event.target.closest(
          "[data-screen='home']"
        );

      const movies =
        event.target.closest(
          "[data-screen='movies']"
        );


      if (home) {

        showScreen("home");

      }


      if (movies) {

        showScreen("movies");

      }

    }
  );

}


function showScreen(screen) {

  activeScreen =
    screen;


  document
    .querySelectorAll(".app-screen")
    .forEach(section => {

      section.classList.remove(
        "active"
      );

    });


  const target =
    document.getElementById(
      screen + "Screen"
    );


  if (target) {

    target.classList.add(
      "active"
    );

  }

}


/* =========================================================
   ADD MOVIE CARD STYLES
========================================================= */

function addMovieStyles() {

  if (
    document.getElementById(
      "nexMovieStyles"
    )
  ) {
    return;
  }


  const style =
    document.createElement("style");


  style.id =
    "nexMovieStyles";


  style.textContent = `

    #movieGrid {

      display:grid;

      grid-template-columns:
        repeat(
          2,
          minmax(0, 1fr)
        );

      gap:12px;

      width:100%;

    }


    .nex-movie-card {

      background:#151515;

      border-radius:10px;

      overflow:hidden;

      cursor:pointer;

      transition:
        transform .18s ease,
        background .18s ease;

      min-width:0;

    }


    .nex-movie-card:active {

      transform:scale(.96);

    }


    .nex-poster-wrapper {

      position:relative;

      width:100%;

      aspect-ratio:2 / 3;

      background:#202020;

      overflow:hidden;

    }


    .nex-poster {

      width:100%;

      height:100%;

      object-fit:cover;

      display:block;

    }


    .nex-play {

      position:absolute;

      right:8px;

      bottom:8px;

      width:34px;

      height:34px;

      border-radius:50%;

      background:#e50914;

      display:flex;

      align-items:center;

      justify-content:center;

      font-size:14px;

      box-shadow:
        0 3px 12px
        rgba(0,0,0,.5);

    }


    .nex-movie-info {

      padding:9px;

    }


    .nex-movie-title {

      font-size:14px;

      font-weight:700;

      white-space:nowrap;

      overflow:hidden;

      text-overflow:ellipsis;

    }


    .nex-movie-meta {

      margin-top:5px;

      color:#888;

      font-size:11px;

      white-space:nowrap;

      overflow:hidden;

      text-overflow:ellipsis;

    }


    .nex-loading,
    .nex-empty,
    .nex-error {

      grid-column:1 / -1;

      text-align:center;

      padding:35px 15px;

      color:#999;

    }


    .nex-empty h3 {

      color:#fff;

      margin:10px 0 5px;

    }


    .nex-empty p {

      margin:0;

      font-size:13px;

      color:#777;

    }


    @media (min-width:600px) {

      #movieGrid {

        grid-template-columns:
          repeat(
            4,
            minmax(0,1fr)
          );

      }

    }

  `;


  document.head.appendChild(style);

}


/* =========================================================
   HTML SAFETY
========================================================= */

function escapeHTML(value) {

  return String(value || "")
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}


function escapeAttribute(value) {

  return escapeHTML(value);

}


/* =========================================================
   GLOBAL FUNCTIONS
========================================================= */

window.loadMovies =
  loadMovies;

window.searchMovies =
  searchMovies;

window.openMovie =
  openMovie;

window.showScreen =
  showScreen;
