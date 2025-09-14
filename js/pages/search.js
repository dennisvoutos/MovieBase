class SearchPage {
  constructor() {
    this.currentPage = 1;
    this.isLoading = false;
    this.hasMorePages = true;
    this.searchQuery = "";
    this.searchResults = [];
    this.genres = {};
    this.searchInput = null;
    this.searchContainer = null;
    this.searchTimeout = null;
    this.loadingElement = null;

    this.init();
  }

  async init() {
    await this.loadGenres();
    this.setupSearchInput();
  }

  async loadGenres() {
    try {
      const genreData = await window.TMDbAPI.getMovieGenres();
      this.genres = genreData.genres.reduce((acc, genre) => {
        acc[genre.id] = genre.name;
        return acc;
      }, {});
    } catch (error) {
      console.error("Failed to load genres:", error);
    }
  }

  setupSearchInput() {
    this.searchInput = document.getElementById("movie-search");
    this.clearButton = document.getElementById("search-clear");

    if (!this.searchInput) {
      console.error("Search input not found");
      return;
    }

    // Add event listeners
    this.searchInput.addEventListener("input", (e) =>
      this.handleSearchInput(e)
    );
    this.searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.clearSearch();
      }
    });

    // Clear button event listener
    if (this.clearButton) {
      this.clearButton.addEventListener("click", () => this.clearSearch());
    }
  }
  handleSearchInput(event) {
    const query = event.target.value.trim();

    // Clear existing timeout
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    // If query is empty, show now playing movies
    if (query === "") {
      this.clearSearch();
      return;
    }

    // Debounce search to avoid too many API calls
    this.searchTimeout = setTimeout(() => {
      this.performSearch(query);
    }, 300);
  }

  async performSearch(query) {
    if (query === this.searchQuery) return; // Same query, no need to search again

    this.searchQuery = query;
    this.currentPage = 1;
    this.hasMorePages = true;
    this.searchResults = [];

    // Hide now playing and show search results
    this.toggleSearchMode(true);
    this.createSearchContainer();
    await this.loadSearchResults();
  }

  createSearchContainer() {
    // Remove existing search container if any
    if (this.searchContainer) {
      this.searchContainer.remove();
    }

    // Hide now playing container
    const nowPlayingContainer = document.querySelector(".movies-container");
    if (nowPlayingContainer) {
      nowPlayingContainer.style.display = "none";
    }

    // Create search results container
    this.searchContainer = document.createElement("div");
    this.searchContainer.className = "search-results-container";
    this.searchContainer.innerHTML = `
            <div class="search-results-header">
                <h2>Search Results for "<span class="search-query">${this.searchQuery}</span>"</h2>
                <button class="clear-search" onclick="window.searchPage.clearSearch()">
                    Show Now Playing
                </button>
            </div>
            <div class="movies-grid" id="search-results-grid"></div>
            <div class="loading-container" id="search-loading-container">
                <div class="loading-spinner"></div>
                <p>Searching movies...</p>
            </div>
        `;

    // Insert after header
    const header = document.querySelector(".app-header");
    header.parentNode.insertBefore(this.searchContainer, header.nextSibling);

    this.loadingElement = document.getElementById("search-loading-container");
    this.setupSearchInfiniteScroll();
  }

  async loadSearchResults() {
    if (this.isLoading || !this.hasMorePages || !this.searchQuery) return;

    this.isLoading = true;
    this.showLoading();

    try {
      const data = await window.TMDbAPI.searchMovies(
        this.searchQuery,
        this.currentPage
      );

      if (data.results && data.results.length > 0) {
        this.searchResults.push(...data.results);
        this.renderSearchResults(data.results);
        this.currentPage++;

        // Check if there are more pages
        this.hasMorePages = this.currentPage <= data.total_pages;
      } else {
        this.hasMorePages = false;
        if (this.currentPage === 1) {
          this.showNoResults();
        }
      }
    } catch (error) {
      console.error("Failed to search movies:", error);
      this.showError("Failed to search movies. Please try again.");
    } finally {
      this.isLoading = false;
      this.hideLoading();
    }
  }

  renderSearchResults(movies) {
    const grid = document.getElementById("search-results-grid");

    movies.forEach((movie) => {
      const movieCard = this.createMovieCard(movie);
      grid.appendChild(movieCard);
    });
  }

  createMovieCard(movie) {
    const card = document.createElement("div");
    card.className = "movie-card";
    card.setAttribute("data-movie-id", movie.id);

    const posterUrl = movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : "assets/no-poster.jpg";

    const releaseYear = movie.release_date
      ? new Date(movie.release_date).getFullYear()
      : "N/A";
    const genres =
      movie.genre_ids
        ?.map((id) => this.genres[id])
        .filter(Boolean)
        .join(", ") || "Unknown";
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A";

    card.innerHTML = `
            <div class="movie-poster">
                <img src="${posterUrl}" alt="${movie.title}" loading="lazy">
                <div class="movie-rating">${rating}</div>
            </div>
            <div class="movie-info">
                <h3 class="movie-title">${movie.title}</h3>
                <p class="movie-year">${releaseYear}</p>
                <p class="movie-genres">${genres}</p>
                <p class="movie-overview">${this.truncateText(
                  movie.overview,
                  120
                )}</p>
            </div>
        `;

    // Add click event to open movie details
    card.addEventListener("click", () => this.openMovieDetails(movie));

    return card;
  }

  async openMovieDetails(movie) {
    try {
      // Show loading in modal
      window.MovieModal.open(
        '<div class="loading-movie-details">Loading movie details...</div>'
      );

      // Fetch detailed movie information
      const [details, videos, reviews, similar] = await Promise.all([
        window.TMDbAPI.getMovieDetails(movie.id),
        window.TMDbAPI.getMovieVideos(movie.id),
        window.TMDbAPI.getMovieReviews(movie.id),
        window.TMDbAPI.getSimilarMovies(movie.id),
      ]);

      const content = this.createMovieDetailsContent(
        details,
        videos,
        reviews,
        similar
      );
      window.MovieModal.setContent(content);
    } catch (error) {
      console.error("Failed to load movie details:", error);
      window.MovieModal.setContent(
        '<div class="error">Failed to load movie details. Please try again.</div>'
      );
    }
  }

  createMovieDetailsContent(details, videos, reviews, similar) {
    const posterUrl = details.poster_path
      ? `https://image.tmdb.org/t/p/w500${details.poster_path}`
      : "assets/no-poster.jpg";

    const trailer = videos.results?.find(
      (video) => video.type === "Trailer" && video.site === "YouTube"
    );

    const reviewsHtml =
      reviews.results
        ?.slice(0, 2)
        .map(
          (review) => `
            <div class="review">
                <h4>Review by ${review.author}</h4>
                <p>${this.truncateText(review.content, 200)}</p>
            </div>
        `
        )
        .join("") || "<p>No reviews available.</p>";

    const similarHtml =
      similar.results
        ?.slice(0, 6)
        .map(
          (movie) => `
            <div class="similar-movie" data-movie-id="${movie.id}">
                <img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" alt="${movie.title}">
                <p>${movie.title}</p>
            </div>
        `
        )
        .join("") || "<p>No similar movies found.</p>";

    return `
            <div class="movie-details">
                <div class="movie-details-header">
                    <img src="${posterUrl}" alt="${
      details.title
    }" class="details-poster">
                    <div class="details-info">
                        <h2>${details.title}</h2>
                        <p class="details-meta">
                            ${
                              details.release_date
                                ? new Date(details.release_date).getFullYear()
                                : "N/A"
                            } • 
                            ${
                              details.runtime
                                ? details.runtime + " min"
                                : "Runtime unknown"
                            } • 
                            ${
                              details.vote_average
                                ? details.vote_average.toFixed(1) + "/10"
                                : "Not rated"
                            }
                        </p>
                        <p class="details-genres">${
                          details.genres?.map((g) => g.name).join(", ") ||
                          "Unknown"
                        }</p>
                        <p class="details-overview">${
                          details.overview || "No overview available."
                        }</p>
                    </div>
                </div>
                
                ${
                  trailer
                    ? `
                    <div class="trailer-section">
                        <h3>Trailer</h3>
                        <iframe 
                            src="https://www.youtube.com/embed/${trailer.key}" 
                            frameborder="0" 
                            allowfullscreen>
                        </iframe>
                    </div>
                `
                    : ""
                }
                
                <div class="reviews-section">
                    <h3>Reviews</h3>
                    ${reviewsHtml}
                </div>
                
                <div class="similar-section">
                    <h3>Similar Movies</h3>
                    <div class="similar-movies-grid">
                        ${similarHtml}
                    </div>
                </div>
            </div>
        `;
  }

  setupSearchInfiniteScroll() {
    if (this.searchObserver) {
      this.searchObserver.disconnect();
    }

    this.searchObserver = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (
          entry.isIntersecting &&
          !this.isLoading &&
          this.hasMorePages &&
          this.searchQuery
        ) {
          this.loadSearchResults();
        }
      },
      {
        threshold: 0.1,
        rootMargin: "100px",
      }
    );

    this.searchObserver.observe(this.loadingElement);
  }

  clearSearch() {
    this.searchQuery = "";
    this.searchInput.value = "";
    this.toggleSearchMode(false);

    // Remove search container
    if (this.searchContainer) {
      this.searchContainer.remove();
      this.searchContainer = null;
    }

    // Show now playing container
    const nowPlayingContainer = document.querySelector(".movies-container");
    if (nowPlayingContainer) {
      nowPlayingContainer.style.display = "block";
    }

    // Disconnect search observer
    if (this.searchObserver) {
      this.searchObserver.disconnect();
    }
  }

  toggleSearchMode(isSearchMode) {
    // Add visual indication that we're in search mode
    const header = document.querySelector(".app-header");
    if (isSearchMode) {
      header.classList.add("search-active");
    } else {
      header.classList.remove("search-active");
    }
  }

  showLoading() {
    if (this.loadingElement) {
      this.loadingElement.style.display = "block";
    }
  }

  hideLoading() {
    if (this.loadingElement && this.currentPage > 1) {
      this.loadingElement.style.display = "none";
    }
  }

  showNoResults() {
    const grid = document.getElementById("search-results-grid");
    const noResultsDiv = document.createElement("div");
    noResultsDiv.className = "no-results";
    noResultsDiv.innerHTML = `
            <h3>No movies found</h3>
            <p>Try searching with different keywords</p>
        `;
    grid.appendChild(noResultsDiv);
  }

  showError(message) {
    const grid = document.getElementById("search-results-grid");
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.textContent = message;
    grid.appendChild(errorDiv);
  }

  truncateText(text, maxLength) {
    if (!text) return "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Wait a bit for other scripts to load
  setTimeout(() => {
    if (window.TMDbAPI) {
      window.searchPage = new SearchPage();
    } else {
      console.error("TMDb API not available");
    }
  }, 150);
});
