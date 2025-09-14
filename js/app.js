/**
 * MovieRama Application Main Controller
 * Orchestrates the entire application lifecycle and coordinates between components
 */

class MovieRamaApp {
  constructor() {
    this.currentPage = "now-playing";
    this.nowPlayingPage = null;
    this.searchPage = null;
    this.isInitialized = false;
  }

  /**
   * Initialize the application
   */
  async init() {
    try {
      // Wait for DOM to be ready
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () =>
          this.initializeApp()
        );
      } else {
        this.initializeApp();
      }
    } catch (error) {
      console.error("Failed to initialize app:", error);
      this.showError("Failed to initialize application");
    }
  }

  /**
   * Main initialization method
   */
  async initializeApp() {
    try {
      // Check if required APIs are available
      if (!window.TMDbAPI) {
        throw new Error("TMDb API not available");
      }

      // Initialize pages
      await this.initializePages();

      // Set up global event listeners
      this.setupGlobalEvents();

      // Initialize default page
      await this.showNowPlaying();

      this.isInitialized = true;
    } catch (error) {
      console.error("App initialization failed:", error);
      this.showError("Failed to load application");
    }
  }

  /**
   * Initialize page components
   */
  async initializePages() {
    // Initialize Now Playing page
    if (window.NowPlayingPage) {
      this.nowPlayingPage = new window.NowPlayingPage();
    }

    // Initialize Search page
    if (window.SearchPage) {
      this.searchPage = new window.SearchPage();
    }
  }

  /**
   * Set up global application event listeners
   */
  setupGlobalEvents() {
    // Global error handler
    window.addEventListener("error", (event) => {
      console.error("Global error:", event.error);
      this.showError("An unexpected error occurred");
    });

    // Handle unhandled promise rejections
    window.addEventListener("unhandledrejection", (event) => {
      console.error("Unhandled promise rejection:", event.reason);
      this.showError("An unexpected error occurred");
    });

    // Keyboard shortcuts
    document.addEventListener("keydown", (event) => {
      // Escape key to close modals
      if (event.key === "Escape") {
        if (window.MovieModal && window.MovieModal.getIsOpen()) {
          window.MovieModal.close();
        }
      }
    });

    // Setup search functionality
    this.setupSearchEvents();
  }

  /**
   * Setup search input events
   */
  setupSearchEvents() {
    const searchInput = document.getElementById("movie-search");
    if (!searchInput) return;

    let searchTimeout;

    searchInput.addEventListener("input", (event) => {
      const query = event.target.value.trim();

      // Clear previous timeout
      clearTimeout(searchTimeout);

      if (query.length === 0) {
        this.showNowPlaying();
        return;
      }

      if (query.length < 2) return;

      // Debounce search
      searchTimeout = setTimeout(() => {
        this.performSearch(query);
      }, 300);
    });

    // Handle search on Enter key
    searchInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        const query = event.target.value.trim();
        if (query.length >= 2) {
          clearTimeout(searchTimeout);
          this.performSearch(query);
        }
      }
    });
  }

  /**
   * Perform movie search
   */
  async performSearch(query) {
    try {
      if (!this.searchPage) {
        console.warn("Search page not available");
        return;
      }

      this.currentPage = "search";
      await this.searchPage.performSearch(query);
    } catch (error) {
      console.error("Search failed:", error);
      this.showError("Search failed. Please try again.");
    }
  }

  /**
   * Show Now Playing page
   */
  async showNowPlaying() {
    try {
      if (!this.nowPlayingPage) {
        console.warn("Now Playing page not available");
        return;
      }

      this.currentPage = "now-playing";

      // Clear search input
      const searchInput = document.getElementById("movie-search");
      if (searchInput) {
        searchInput.value = "";
      }

      // Load now playing movies if not already loaded
      if (
        this.nowPlayingPage.currentPage === 1 &&
        this.nowPlayingPage.movies.length === 0
      ) {
        await this.nowPlayingPage.loadMovies();
      }
    } catch (error) {
      console.error("Failed to show now playing:", error);
      this.showError("Failed to load movies");
    }
  }

  /**
   * Show error message to user
   */
  showError(message) {
    console.error("App Error:", message);

    // Try to show error in modal if available
    if (window.MovieModal) {
      window.MovieModal.open(`
        <div class="error-message">
          <h3>Something went wrong</h3>
          <p>${message}</p>
          <button onclick="window.movieApp.retry()" class="retry-btn">Try Again</button>
        </div>
      `);
    } else {
      // Fallback to alert
      alert(`Error: ${message}`);
    }
  }

  /**
   * Retry last operation
   */
  async retry() {
    try {
      if (window.MovieModal) {
        window.MovieModal.close();
      }

      if (this.currentPage === "search") {
        const searchInput = document.getElementById("movie-search");
        if (searchInput && searchInput.value.trim()) {
          await this.performSearch(searchInput.value.trim());
        }
      } else {
        await this.showNowPlaying();
      }
    } catch (error) {
      console.error("Retry failed:", error);
      this.showError("Retry failed. Please refresh the page.");
    }
  }

  /**
   * Get application status
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      currentPage: this.currentPage,
      nowPlayingLoaded: this.nowPlayingPage?.movies?.length > 0,
      searchAvailable: !!this.searchPage,
    };
  }

  /**
   * Clean up application resources
   */
  destroy() {
    // Clean up pages
    if (this.nowPlayingPage?.destroy) {
      this.nowPlayingPage.destroy();
    }

    if (this.searchPage?.destroy) {
      this.searchPage.destroy();
    }

    // Clean up modal
    if (window.MovieModal?.destroy) {
      window.MovieModal.destroy();
    }

    this.isInitialized = false;
  }
}

// Create global app instance
window.movieApp = new MovieRamaApp();

// Auto-initialize when script loads
window.movieApp.init();

// Export for module usage
if (typeof module !== "undefined" && module.exports) {
  module.exports = MovieRamaApp;
}
