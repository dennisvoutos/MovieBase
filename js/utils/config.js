/**
 * MovieRama Application Configuration
 * Central configuration file for all application constants and settings
 */

// API Configuration
const API_CONFIG = {
  BASE_URL: "https://api.themoviedb.org/3",
  IMAGE_BASE_URL: "https://image.tmdb.org/t/p",

  // Image sizes available from TMDb
  IMAGE_SIZES: {
    POSTER: {
      SMALL: "w185",
      MEDIUM: "w342",
      LARGE: "w500",
      XLARGE: "w780",
      ORIGINAL: "original",
    },
    BACKDROP: {
      SMALL: "w300",
      MEDIUM: "w780",
      LARGE: "w1280",
      ORIGINAL: "original",
    },
  },

  // Default pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGES: 1000,
};

// Application Settings
const APP_CONFIG = {
  NAME: "MovieRama",
  VERSION: "1.0.0",

  // Feature flags
  FEATURES: {
    INFINITE_SCROLL: true,
    MOVIE_DETAILS_MODAL: true,
    SEARCH_DEBOUNCE: true,
    LAZY_LOADING: true,
  },

  // UI Configuration
  UI: {
    SEARCH_DEBOUNCE_DELAY: 300,
    SCROLL_THRESHOLD: 100,
    ANIMATION_DURATION: 300,
    MODAL_ANIMATION_DURATION: 300,
  },

  // Text limits
  TEXT_LIMITS: {
    MOVIE_OVERVIEW: 120,
    REVIEW_CONTENT: 200,
    MOVIE_TITLE_TRUNCATE: 50,
  },
};

// Error Messages
const ERROR_MESSAGES = {
  API: {
    NETWORK_ERROR: "Network error. Please check your connection.",
    RATE_LIMIT: "Too many requests. Please wait a moment.",
    NOT_FOUND: "Content not found.",
    SERVER_ERROR: "Server error. Please try again later.",
    UNAUTHORIZED: "Access denied. Please check your API key.",
    GENERIC: "An error occurred while fetching data.",
  },

  APP: {
    INIT_FAILED: "Failed to initialize application",
    SEARCH_FAILED: "Search failed. Please try again.",
    LOAD_FAILED: "Failed to load content",
    FEATURE_UNAVAILABLE: "This feature is currently unavailable",
  },
};

// Success Messages
const SUCCESS_MESSAGES = {
  SEARCH: "Search completed successfully",
  LOAD: "Content loaded successfully",
  INIT: "Application initialized successfully",
};

// CSS Classes for consistent styling
const CSS_CLASSES = {
  LOADING: {
    CONTAINER: "loading-container",
    SPINNER: "loading-spinner",
    HIDDEN: "hidden",
  },

  MOVIE: {
    CARD: "movie-card",
    POSTER: "movie-poster",
    INFO: "movie-info",
    TITLE: "movie-title",
    YEAR: "movie-year",
    RATING: "movie-rating",
    GENRES: "movie-genres",
    OVERVIEW: "movie-overview",
  },

  MODAL: {
    OVERLAY: "modal-overlay",
    CONTAINER: "modal",
    CONTENT: "modal-content",
    BODY: "modal-body",
    CLOSE: "modal-close",
    OPEN: "modal-open",
  },

  GRID: {
    MOVIES: "movies-grid",
    SEARCH_RESULTS: "search-results-grid",
  },

  ERROR: {
    MESSAGE: "error-message",
    CONTAINER: "error-container",
  },
};

// Local Storage Keys
const STORAGE_KEYS = {
  FAVORITES: "movierama_favorites",
  RECENT_SEARCHES: "movierama_recent_searches",
  USER_PREFERENCES: "movierama_preferences",
  CACHE_TIMESTAMP: "movierama_cache_timestamp",
};

// Cache Configuration
const CACHE_CONFIG = {
  DURATION: {
    GENRES: 24 * 60 * 60 * 1000, // 24 hours
    MOVIE_DETAILS: 60 * 60 * 1000, // 1 hour
    SEARCH_RESULTS: 10 * 60 * 1000, // 10 minutes
  },

  MAX_SIZE: {
    SEARCH_HISTORY: 50,
    CACHED_MOVIES: 100,
  },
};

// Breakpoints for responsive design
const BREAKPOINTS = {
  MOBILE: 480,
  TABLET: 768,
  DESKTOP: 1024,
  LARGE_DESKTOP: 1440,
};

// Export configuration objects
if (typeof window !== "undefined") {
  // Browser environment
  window.APP_CONFIG = APP_CONFIG;
  window.API_CONFIG = API_CONFIG;
  window.ERROR_MESSAGES = ERROR_MESSAGES;
  window.SUCCESS_MESSAGES = SUCCESS_MESSAGES;
  window.CSS_CLASSES = CSS_CLASSES;
  window.STORAGE_KEYS = STORAGE_KEYS;
  window.CACHE_CONFIG = CACHE_CONFIG;
  window.BREAKPOINTS = BREAKPOINTS;
}

// Export for module usage
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    APP_CONFIG,
    API_CONFIG,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    CSS_CLASSES,
    STORAGE_KEYS,
    CACHE_CONFIG,
    BREAKPOINTS,
  };
}
