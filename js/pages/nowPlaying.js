class NowPlayingPage {
  constructor() {
    this.currentPage = 1;
    this.isLoading = false;
    this.hasMorePages = true;
    this.movies = [];
    this.genres = {};
    this.container = null;
    this.loadingElement = null;

    this.init();
  }

  async init() {
    await this.loadGenres();
    this.createContainer();
    this.setupInfiniteScroll();
    await this.loadMovies();
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

  createContainer() {
    // Create main container for movies
    this.container = document.createElement("div");
    this.container.className = "movies-container";
    this.container.innerHTML = `
            <div class="movies-header">
                <h2>Now Playing in Theaters</h2>
                <p class="movies-subtitle">Discover the latest movies currently showing</p>
            </div>
            <div class="movies-grid" id="movies-grid"></div>
            <div class="loading-container" id="loading-container">
                <div class="loading-spinner"></div>
                <p>Loading movies...</p>
            </div>
        `;

    // Find where to insert (after header)
    const header = document.querySelector(".app-header");
    header.parentNode.insertBefore(this.container, header.nextSibling);
    this.loadingElement = document.getElementById("loading-container");
  }

  async loadMovies() {
    if (this.isLoading || !this.hasMorePages) {
      return;
    }

    this.isLoading = true;
    this.showLoading();

    try {
      const data = await window.TMDbAPI.getNowPlayingMovies(this.currentPage);
      if (data.results && data.results.length > 0) {
        this.movies.push(...data.results);
        this.renderMovies(data.results);
        this.currentPage++;

        // Check if there are more pages
        this.hasMorePages = this.currentPage <= data.total_pages;
      } else {
        this.hasMorePages = false;
      }
    } catch (error) {
      console.error("Failed to load movies:", error);
      this.showError("Failed to load movies. Please try again.");
    } finally {
      this.isLoading = false;
      this.hideLoading();
    }
  }

  renderMovies(movies) {
    const grid = document.getElementById("movies-grid");

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

  setupInfiniteScroll() {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !this.isLoading && this.hasMorePages) {
          this.loadMovies();
        }
      },
      {
        threshold: 0.1,
        rootMargin: "100px",
      }
    );

    // Observe the loading element
    if (this.loadingElement) {
      observer.observe(this.loadingElement);
    } else {
      console.error("Loading element not found for infinite scroll");
    }
  }

  showLoading() {
    if (this.loadingElement) {
      this.loadingElement.style.display = "block";
      const spinner = this.loadingElement.querySelector(".loading-spinner");
      if (spinner) {
        spinner.style.display = "block";
      }
    }
  }

  hideLoading() {
    if (this.loadingElement) {
      // Only hide loading if we have no more pages to load
      if (!this.hasMorePages) {
        this.loadingElement.style.display = "none";
      } else {
        // Keep loading element visible but not spinning for next intersection
        this.loadingElement.querySelector(".loading-spinner").style.display =
          "none";
      }
    }
  }

  showError(message) {
    const grid = document.getElementById("movies-grid");
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
      window.nowPlayingPage = new NowPlayingPage();
    } else {
      console.error("TMDb API not available");
    }
  }, 100);
});
