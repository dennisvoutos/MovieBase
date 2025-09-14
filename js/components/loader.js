/**
 * Loading Spinner Component
 * Reusable loading spinner for different parts of the application
 */

class Loader {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.container = null;
    this.isLoading = false;

    // Configuration options
    this.options = {
      className: "loading-container",
      spinnerClass: "loading-spinner",
      message: "Loading...",
      showMessage: true,
      autoHide: true,
      ...options,
    };

    this.init();
  }

  /**
   * Initialize the loader
   */
  init() {
    this.container = this.findOrCreateContainer();
    if (this.options.autoHide) {
      this.hide();
    }
  }

  /**
   * Find existing container or create new one
   * @returns {Element} Container element
   */
  findOrCreateContainer() {
    let container = document.getElementById(this.containerId);

    if (!container) {
      container = this.createContainer();
      document.body.appendChild(container);
    }

    return container;
  }

  /**
   * Create loader container element
   * @returns {Element} Container element
   */
  createContainer() {
    const container = document.createElement("div");
    container.id = this.containerId;
    container.className = this.options.className;

    // Create spinner
    const spinner = document.createElement("div");
    spinner.className = this.options.spinnerClass;
    container.appendChild(spinner);

    // Create message element if enabled
    if (this.options.showMessage) {
      const message = document.createElement("p");
      message.className = "loading-message";
      message.textContent = this.options.message;
      container.appendChild(message);
    }

    return container;
  }

  /**
   * Show the loader
   * @param {string} message - Optional custom message
   */
  show(message) {
    if (!this.container) return;

    // Update message if provided
    if (message && this.options.showMessage) {
      this.setMessage(message);
    }

    this.container.style.display = "block";
    this.container.classList.remove("hidden");
    this.isLoading = true;

    // Add to document if not already present
    if (!this.container.parentNode) {
      document.body.appendChild(this.container);
    }
  }

  /**
   * Hide the loader
   */
  hide() {
    if (!this.container) return;

    this.container.style.display = "none";
    this.container.classList.add("hidden");
    this.isLoading = false;
  }

  /**
   * Toggle loader visibility
   * @param {string} message - Optional message when showing
   */
  toggle(message) {
    if (this.isLoading) {
      this.hide();
    } else {
      this.show(message);
    }
  }

  /**
   * Set loading message
   * @param {string} message - New message
   */
  setMessage(message) {
    if (!this.container || !this.options.showMessage) return;

    const messageElement = this.container.querySelector(".loading-message");
    if (messageElement) {
      messageElement.textContent = message || this.options.message;
    }
  }

  /**
   * Check if loader is currently visible
   * @returns {boolean} Whether loader is visible
   */
  isVisible() {
    return (
      this.isLoading &&
      this.container &&
      this.container.style.display !== "none" &&
      !this.container.classList.contains("hidden")
    );
  }

  /**
   * Update loader configuration
   * @param {Object} newOptions - New options to merge
   */
  updateOptions(newOptions) {
    this.options = { ...this.options, ...newOptions };

    // Update message if container exists
    if (this.container && newOptions.message) {
      this.setMessage(newOptions.message);
    }
  }

  /**
   * Destroy the loader and clean up
   */
  destroy() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }

    this.container = null;
    this.isLoading = false;
  }

  /**
   * Create a temporary loader for async operations
   * @param {Promise} promise - Promise to wait for
   * @param {string} message - Loading message
   * @returns {Promise} Original promise
   */
  async showDuring(promise, message) {
    this.show(message);

    try {
      const result = await promise;
      this.hide();
      return result;
    } catch (error) {
      this.hide();
      throw error;
    }
  }
}

/**
 * Global Loader Factory
 * Create and manage multiple loaders
 */
class LoaderFactory {
  constructor() {
    this.loaders = new Map();
  }

  /**
   * Create or get existing loader
   * @param {string} id - Loader ID
   * @param {Object} options - Loader options
   * @returns {Loader} Loader instance
   */
  create(id, options = {}) {
    if (!this.loaders.has(id)) {
      const loader = new Loader(id, options);
      this.loaders.set(id, loader);
    }

    return this.loaders.get(id);
  }

  /**
   * Get existing loader
   * @param {string} id - Loader ID
   * @returns {Loader|null} Loader instance or null
   */
  get(id) {
    return this.loaders.get(id) || null;
  }

  /**
   * Remove and destroy loader
   * @param {string} id - Loader ID
   */
  remove(id) {
    const loader = this.loaders.get(id);
    if (loader) {
      loader.destroy();
      this.loaders.delete(id);
    }
  }

  /**
   * Hide all loaders
   */
  hideAll() {
    this.loaders.forEach((loader) => loader.hide());
  }

  /**
   * Destroy all loaders
   */
  destroyAll() {
    this.loaders.forEach((loader) => loader.destroy());
    this.loaders.clear();
  }

  /**
   * Get all active (visible) loaders
   * @returns {Loader[]} Array of active loaders
   */
  getActive() {
    return Array.from(this.loaders.values()).filter((loader) =>
      loader.isVisible()
    );
  }
}

// Create global loader factory instance
const loaderFactory = new LoaderFactory();

// Convenience functions for common loader operations
const LoaderUtils = {
  /**
   * Show loading for API calls
   * @param {string} message - Loading message
   */
  showApiLoader(message = "Loading...") {
    const loader = loaderFactory.create("api-loader", {
      className: "loading-container api-loading",
      message,
    });
    loader.show();
    return loader;
  },

  /**
   * Show loading for search operations
   * @param {string} message - Loading message
   */
  showSearchLoader(message = "Searching...") {
    const loader = loaderFactory.create("search-loader", {
      className: "loading-container search-loading",
      message,
    });
    loader.show();
    return loader;
  },

  /**
   * Show loading for movie details
   * @param {string} message - Loading message
   */
  showDetailsLoader(message = "Loading movie details...") {
    const loader = loaderFactory.create("details-loader", {
      className: "loading-container details-loading",
      message,
    });
    loader.show();
    return loader;
  },

  /**
   * Hide all loaders
   */
  hideAll() {
    loaderFactory.hideAll();
  },

  /**
   * Create custom loader
   * @param {string} id - Loader ID
   * @param {Object} options - Loader options
   * @returns {Loader} Loader instance
   */
  create(id, options) {
    return loaderFactory.create(id, options);
  },
};

// Export for browser environment
if (typeof window !== "undefined") {
  window.Loader = Loader;
  window.LoaderFactory = LoaderFactory;
  window.LoaderUtils = LoaderUtils;
  window.loaderFactory = loaderFactory;
}

// Export for module usage
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    Loader,
    LoaderFactory,
    LoaderUtils,
    loaderFactory,
  };
}
