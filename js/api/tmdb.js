const AUTH_HEADER =
  "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2Y2VmMjE5MDhmMTVlOGUyNGU2YTRjNjBlNGFhNGFmZCIsIm5iZiI6MTc1Nzc2NTE3NC4xMTksInN1YiI6IjY4YzU1ZTM2OTQ3OTE5MmE0MTRjYTJhNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.OpBc2X7Xrdyun73I8-uZKCA-ObLB7ORpKXipw_e2UXI";

const BASE_URL = "https://api.themoviedb.org/3";

// Base fetch function with authentication
async function fetchFromTMDb(endpoint) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${AUTH_HEADER}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API call failed:", error);
    throw error;
  }
}

// Get movie details by ID
async function getMovieDetails(movieId) {
  return await fetchFromTMDb(`/movie/${movieId}`);
}

// Get movie videos (trailers, etc.) by ID
async function getMovieVideos(movieId) {
  return await fetchFromTMDb(`/movie/${movieId}/videos`);
}

// Get movie reviews by ID
async function getMovieReviews(movieId) {
  return await fetchFromTMDb(`/movie/${movieId}/reviews`);
}

// Get similar movies by ID
async function getSimilarMovies(movieId) {
  return await fetchFromTMDb(`/movie/${movieId}/similar`);
}

// Additional endpoints from the assignment requirements
async function getNowPlayingMovies(page = 1) {
  return await fetchFromTMDb(`/movie/now_playing?page=${page}`);
}

async function getMovieGenres() {
  return await fetchFromTMDb(`/genre/movie/list`);
}

async function searchMovies(query, page = 1) {
  const encodedQuery = encodeURIComponent(query);
  return await fetchFromTMDb(
    `/search/movie?query=${encodedQuery}&page=${page}`
  );
}

// Export functions for use in other modules
window.TMDbAPI = {
  getMovieDetails,
  getMovieVideos,
  getMovieReviews,
  getSimilarMovies,
  getNowPlayingMovies,
  getMovieGenres,
  searchMovies,
};
