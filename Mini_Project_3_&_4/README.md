# CineScope - Movie Explorer (MP3-MP4)

A responsive, API-driven movie discovery website built with HTML, CSS and vanilla JavaScript for CSE-2340 Software Development I.

## Features
- Search movies using the OMDb API
- Dynamically render movie cards using JavaScript DOM methods
- View detailed movie information
- Add/remove movies from a personal watchlist
- Save the watchlist in Local Storage
- Sort search results by year or title
- Loading, error and empty states
- Responsive layout for desktop, tablet and mobile

## Setup

1. Get a free API key from the OMDb API website: https://www.omdbapi.com/apikey.aspx
2. Open `script.js`.
3. Replace `YOUR_OMDB_API_KEY` with your personal key:
   ```js
   const API_KEY = "paste_your_key_here";
   ```
4. Save the file.
5. Open `index.html` in a browser. For the best development experience, use VS Code with the Live Server extension.

The project uses the OMDb API, so an internet connection and a valid API key are required.

## MP3-MP4 requirement mapping

| Assignment requirement | Implementation |
|---|---|
| DOM manipulation and dynamic rendering (4) | `renderMovies()`, `createElement()`, `innerHTML`, `appendChild()` |
| Event handling and JavaScript logic (3) | `addEventListener()`, event delegation, arrays, objects, `map()`, `filter()`, `forEach()`, `some()`, `sort()` |
| API integration and asynchronous operations (4) | `searchMovies()` and `showMovieDetails()` use `fetch()`, `async/await`, loading/error/empty states |
| Local Storage (3) | `loadWatchlist()`, `saveWatchlist()`, `localStorage` |

## Project structure

```text
movie_explorer_mp3_mp4/
├── index.html
├── style.css
├── script.js
└── README.md
```

## Notes
- The watchlist is stored in the current browser and device. It is not synced to other browsers.
- Keep your API key private if you later publish this project publicly. A frontend-only student project exposes the key in browser source, so do not use a sensitive or paid key.
