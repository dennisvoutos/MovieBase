/**
 * Movie Card Component
 * Reusable component for displaying movie information in card format
 */

class MovieCard {
  constructor(movie, options = {}) {
    this.movie = movie;
    this.options = {
      showRating: true,
      showGenres: true,
      showOverview: true,
      overviewLength: 120,
      imageSize: "w500",
      clickHandler: null,
      className: "movie-card",
      ...options,
    };

    this.element = null;
    this.genres = window.movieGenres || {};
  }

  /**
   * Create the movie card element
   * @returns {Element} Movie card element
   */
  create() {
    this.element = document.createElement("div");
    this.element.className = this.options.className;
    this.element.setAttribute("data-movie-id", this.movie.id);

    // Build card HTML
    this.element.innerHTML = this.generateHTML();

    // Add event listeners
    this.bindEvents();

    return this.element;
  }

  /**
   * Generate HTML content for the card
   * @returns {string} HTML string
   */
  generateHTML() {
    const posterUrl = this.buildPosterUrl();
    const releaseYear = this.extractYear();
    const genres = this.mapGenres();
    const rating = this.formatRating();
    const overview = this.truncateOverview();

    return `
      <div class="movie-poster">
        <img src="${posterUrl}" 
             alt="${this.escapeHtml(this.movie.title)}" 
             loading="lazy"
             onerror="this.src='assets/no-poster.jpg'">
        ${
          this.options.showRating
            ? `<div class="movie-rating">${rating}</div>`
            : ""
        }
      </div>
      <div class="movie-info">
        <h3 class="movie-title">${this.escapeHtml(this.movie.title)}</h3>
        <p class="movie-year">${releaseYear}</p>
        ${
          this.options.showGenres ? `<p class="movie-genres">${genres}</p>` : ""
        }
        ${
          this.options.showOverview
            ? `<p class="movie-overview">${this.escapeHtml(overview)}</p>`
            : ""
        }
      </div>
    `;
  }

  /**
   * Build poster URL with fallback
   * @returns {string} Poster URL
   */
  buildPosterUrl() {
    if (!this.movie.poster_path) {
      return "assets/no-poster.jpg";
    }

    const baseUrl =
      window.API_CONFIG?.IMAGE_BASE_URL || "https://image.tmdb.org/t/p";
    return `${baseUrl}/${this.options.imageSize}${this.movie.poster_path}`;
  }

  /**
   * Extract year from release date
   * @returns {string} Year or 'N/A'
   */
  extractYear() {
    if (!this.movie.release_date) return "N/A";

    try {
      const year = new Date(this.movie.release_date).getFullYear();
      return isNaN(year) ? "N/A" : year.toString();
    } catch (error) {
      return "N/A";
    }
  }

  /**
   * Map genre IDs to names
   * @returns {string} Comma-separated genre names
   */
  mapGenres() {
    if (
      !this.movie.genre_ids ||
      !Array.isArray(this.movie.genre_ids) ||
      this.movie.genre_ids.length === 0
    ) {
      return "Unknown";
    }

    const genreNames = this.movie.genre_ids
      .map((id) => this.genres[id])
      .filter(Boolean)
      .join(", ");

    return genreNames || "Unknown";
  }

  /**
   * Format movie rating
   * @returns {string} Formatted rating or 'N/A'
   */
  formatRating() {
    if (
      this.movie.vote_average === null ||
      this.movie.vote_average === undefined ||
      isNaN(this.movie.vote_average)
    ) {
      return "N/A";
    }

    return parseFloat(this.movie.vote_average).toFixed(1);
  }

  /**
   * Truncate overview text
   * @returns {string} Truncated overview
   */
  truncateOverview() {
    if (!this.movie.overview) return "";

    const maxLength = this.options.overviewLength;
    if (this.movie.overview.length <= maxLength) {
      return this.movie.overview;
    }

    return this.movie.overview.substring(0, maxLength).trim() + "...";
  }

  /**
   * Escape HTML characters to prevent XSS
   * @param {string} unsafe - Unsafe HTML string
   * @returns {string} Escaped HTML string
   */
  escapeHtml(unsafe) {
    if (!unsafe) return "";

    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /**
   * Bind event listeners to the card
   */
  bindEvents() {
    if (!this.element) return;

    // Add click handler
    this.element.addEventListener("click", (event) => {
      event.preventDefault();

      if (
        this.options.clickHandler &&
        typeof this.options.clickHandler === "function"
      ) {
        this.options.clickHandler(this.movie, this.element);
      } else {
        this.handleDefaultClick();
      }
    });

    // Add keyboard navigation
    this.element.setAttribute("tabindex", "0");
    this.element.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        this.element.click();
      }
    });

    // Add hover effects
    this.element.addEventListener("mouseenter", () => {
      this.element.classList.add("hovered");
    });

    this.element.addEventListener("mouseleave", () => {
      this.element.classList.remove("hovered");
    });
  }

  /**
   * Default click handler - opens movie details modal
   */
  handleDefaultClick() {
    if (window.movieApp && window.movieApp.openMovieDetails) {
      window.movieApp.openMovieDetails(this.movie);
    } else if (window.MovieModal) {
      // Fallback to direct modal opening
      this.openMovieDetails();
    }
  }

  /**
   * Open movie details in modal
   */
  async openMovieDetails() {
    try {
      if (!window.MovieModal || !window.TMDbAPI) {
        console.warn("Modal or API not available");
        return;
      }

      // Show loading
      window.MovieModal.open(
        '<div class="loading-movie-details">Loading movie details...</div>'
      );

      // Fetch detailed information
      const [details, videos, reviews, similar] = await Promise.all([
        window.TMDbAPI.getMovieDetails(this.movie.id),
        window.TMDbAPI.getMovieVideos(this.movie.id),
        window.TMDbAPI.getMovieReviews(this.movie.id),
        window.TMDbAPI.getSimilarMovies(this.movie.id),
      ]);

      // Create details content
      const content = this.createDetailsContent(
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

  /**
   * Create movie details content for modal
   * @param {Object} details - Movie details
   * @param {Object} videos - Movie videos
   * @param {Object} reviews - Movie reviews
   * @param {Object} similar - Similar movies
   * @returns {string} HTML content
   */
  createDetailsContent(details, videos, reviews, similar) {
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
          <h4>Review by ${this.escapeHtml(review.author)}</h4>
          <p>${this.escapeHtml(this.truncateText(review.content, 200))}</p>
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
          <img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" 
               alt="${this.escapeHtml(movie.title)}"
               onerror="this.src='assets/no-poster.jpg'">
          <p>${this.escapeHtml(movie.title)}</p>
        </div>
      `
        )
        .join("") || "<p>No similar movies found.</p>";

    return `
      <div class="movie-details">
        <div class="movie-details-header">
          <img src="${posterUrl}" 
               alt="${this.escapeHtml(details.title)}" 
               class="details-poster">
          <div class="details-info">
            <h2>${this.escapeHtml(details.title)}</h2>
            <p class="details-meta">
              ${
                details.release_date
                  ? new Date(details.release_date).getFullYear()
                  : "N/A"
              } • 
              ${
                details.runtime ? details.runtime + " min" : "Runtime unknown"
              } • 
              ${
                details.vote_average
                  ? details.vote_average.toFixed(1) + "/10"
                  : "No rating"
              }
            </p>
            <p class="details-genres">
              ${details.genres?.map((g) => g.name).join(", ") || "Unknown"}
            </p>
            <p class="details-overview">${this.escapeHtml(
              details.overview || "No overview available."
            )}</p>
          </div>
        </div>
        
        ${
          trailer
            ? `
          <div class="trailer-section">
            <h3>Trailer</h3>
            <iframe src="https://www.youtube.com/embed/${trailer.key}" 
                    allowfullscreen></iframe>
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

  /**
   * Truncate text helper
   * @param {string} text - Text to truncate
   * @param {number} maxLength - Maximum length
   * @returns {string} Truncated text
   */
  truncateText(text, maxLength) {
    if (!text) return "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  }

  /**
   * Update movie data and refresh card
   * @param {Object} newMovie - New movie data
   */
  update(newMovie) {
    this.movie = { ...this.movie, ...newMovie };
    if (this.element) {
      this.element.innerHTML = this.generateHTML();
      this.bindEvents();
    }
  }

  /**
   * Destroy the card and clean up
   */
  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.element = null;
    this.movie = null;
  }

  /**
   * Get the card element
   * @returns {Element|null} Card element
   */
  getElement() {
    return this.element;
  }

  /**
   * Get movie data
   * @returns {Object} Movie data
   */
  getMovie() {
    return this.movie;
  }
}

/**
 * Movie Card Factory
 * Helper functions for creating movie cards
 */
const MovieCardFactory = {
  /**
   * Create a movie card
   * @param {Object} movie - Movie data
   * @param {Object} options - Card options
   * @returns {MovieCard} Movie card instance
   */
  create(movie, options = {}) {
    return new MovieCard(movie, options);
  },

  /**
   * Create and append movie card to container
   * @param {Object} movie - Movie data
   * @param {Element|string} container - Container element or selector
   * @param {Object} options - Card options
   * @returns {MovieCard} Movie card instance
   */
  createAndAppend(movie, container, options = {}) {
    const card = new MovieCard(movie, options);
    const element = card.create();

    const containerElement =
      typeof container === "string"
        ? document.querySelector(container)
        : container;

    if (containerElement) {
      containerElement.appendChild(element);
    }

    return card;
  },

  /**
   * Create multiple movie cards
   * @param {Object[]} movies - Array of movie data
   * @param {Object} options - Card options
   * @returns {MovieCard[]} Array of movie card instances
   */
  createMultiple(movies, options = {}) {
    return movies.map((movie) => new MovieCard(movie, options));
  },
};

// Export for browser environment
if (typeof window !== "undefined") {
  window.MovieCard = MovieCard;
  window.MovieCardFactory = MovieCardFactory;
}

// Export for module usage
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    MovieCard,
    MovieCardFactory,
  };
}
