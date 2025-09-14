/**
 * @jest-environment jsdom
 */

/**
 * Loader Component Tests
 * Tests for loading spinner functionality across the application
 */

describe("Loader Component", () => {
  // Mock loading functionality found in pages
  class LoaderUtility {
    constructor(containerId, loaderClass = "loading-container") {
      this.loadingElement = null;
      this.containerId = containerId;
      this.loaderClass = loaderClass;
      this.isLoading = false;
    }

    createLoader() {
      const container = document.createElement("div");
      container.className = this.loaderClass;
      container.id = this.containerId;
      container.innerHTML = `
        <div class="loading-spinner"></div>
        <p>Loading...</p>
      `;
      return container;
    }

    showLoading() {
      if (this.loadingElement) {
        this.loadingElement.style.display = "block";
        this.isLoading = true;
      }
    }

    hideLoading() {
      if (this.loadingElement) {
        this.loadingElement.style.display = "none";
        this.isLoading = false;
      }
    }

    toggleLoading() {
      if (this.isLoading) {
        this.hideLoading();
      } else {
        this.showLoading();
      }
    }

    isVisible() {
      return (
        this.loadingElement &&
        this.loadingElement.style.display !== "none" &&
        this.isLoading
      );
    }

    setMessage(message) {
      if (this.loadingElement) {
        const messageElement = this.loadingElement.querySelector("p");
        if (messageElement) {
          messageElement.textContent = message;
        }
      }
    }

    init() {
      this.loadingElement = document.getElementById(this.containerId);
      if (!this.loadingElement) {
        this.loadingElement = this.createLoader();
        document.body.appendChild(this.loadingElement);
      }
      this.hideLoading(); // Initially hidden
    }

    destroy() {
      if (this.loadingElement && this.loadingElement.parentNode) {
        this.loadingElement.parentNode.removeChild(this.loadingElement);
        this.loadingElement = null;
        this.isLoading = false;
      }
    }
  }

  let loader;
  let testContainer;

  beforeEach(() => {
    document.body.innerHTML = "";
    testContainer = document.createElement("div");
    testContainer.id = "test-container";
    document.body.appendChild(testContainer);
  });

  afterEach(() => {
    if (loader) {
      loader.destroy();
    }
    document.body.innerHTML = "";
  });

  describe("Loader Creation", () => {
    test("should create loader with correct structure", () => {
      loader = new LoaderUtility("test-loader");
      const loaderElement = loader.createLoader();

      expect(loaderElement).toBeTruthy();
      expect(loaderElement.classList.contains("loading-container")).toBe(true);
      expect(loaderElement.id).toBe("test-loader");

      const spinner = loaderElement.querySelector(".loading-spinner");
      const message = loaderElement.querySelector("p");

      expect(spinner).toBeTruthy();
      expect(message).toBeTruthy();
      expect(message.textContent).toBe("Loading...");
    });

    test("should create loader with custom class", () => {
      loader = new LoaderUtility("custom-loader", "custom-loading-class");
      const loaderElement = loader.createLoader();

      expect(loaderElement.classList.contains("custom-loading-class")).toBe(
        true
      );
    });

    test("should initialize loader and hide it by default", () => {
      document.body.innerHTML = `
        <div id="existing-loader" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      `;

      loader = new LoaderUtility("existing-loader");
      loader.init();

      expect(loader.loadingElement).toBeTruthy();
      expect(loader.isLoading).toBe(false);
      expect(loader.loadingElement.style.display).toBe("none");
    });

    test("should create loader if it does not exist on init", () => {
      loader = new LoaderUtility("non-existing-loader");
      loader.init();

      expect(loader.loadingElement).toBeTruthy();
      expect(document.getElementById("non-existing-loader")).toBeTruthy();
      expect(loader.isLoading).toBe(false);
    });
  });

  describe("Show/Hide Functionality", () => {
    beforeEach(() => {
      loader = new LoaderUtility("test-loader");
      loader.init();
    });

    test("should show loading spinner", () => {
      loader.showLoading();

      expect(loader.isLoading).toBe(true);
      expect(loader.loadingElement.style.display).toBe("block");
      expect(loader.isVisible()).toBe(true);
    });

    test("should hide loading spinner", () => {
      loader.showLoading();
      expect(loader.isLoading).toBe(true);

      loader.hideLoading();

      expect(loader.isLoading).toBe(false);
      expect(loader.loadingElement.style.display).toBe("none");
      expect(loader.isVisible()).toBe(false);
    });

    test("should toggle loading state", () => {
      expect(loader.isLoading).toBe(false);

      loader.toggleLoading();
      expect(loader.isLoading).toBe(true);
      expect(loader.isVisible()).toBe(true);

      loader.toggleLoading();
      expect(loader.isLoading).toBe(false);
      expect(loader.isVisible()).toBe(false);
    });

    test("should handle multiple show/hide calls gracefully", () => {
      loader.showLoading();
      loader.showLoading();
      expect(loader.isLoading).toBe(true);

      loader.hideLoading();
      loader.hideLoading();
      expect(loader.isLoading).toBe(false);
    });
  });

  describe("Message Management", () => {
    beforeEach(() => {
      loader = new LoaderUtility("test-loader");
      loader.init();
    });

    test("should set custom loading message", () => {
      loader.setMessage("Loading movies...");

      const messageElement = loader.loadingElement.querySelector("p");
      expect(messageElement.textContent).toBe("Loading movies...");
    });

    test("should update message while loading", () => {
      loader.showLoading();
      loader.setMessage("Searching for movies...");

      const messageElement = loader.loadingElement.querySelector("p");
      expect(messageElement.textContent).toBe("Searching for movies...");
      expect(loader.isLoading).toBe(true);
    });

    test("should handle empty message", () => {
      loader.setMessage("");

      const messageElement = loader.loadingElement.querySelector("p");
      expect(messageElement.textContent).toBe("");
    });

    test("should handle null message", () => {
      loader.setMessage(null);

      const messageElement = loader.loadingElement.querySelector("p");
      expect(messageElement.textContent).toBe("null");
    });
  });

  describe("State Management", () => {
    beforeEach(() => {
      loader = new LoaderUtility("test-loader");
      loader.init();
    });

    test("should track loading state correctly", () => {
      expect(loader.isLoading).toBe(false);
      expect(loader.isVisible()).toBe(false);

      loader.showLoading();
      expect(loader.isLoading).toBe(true);
      expect(loader.isVisible()).toBe(true);

      loader.hideLoading();
      expect(loader.isLoading).toBe(false);
      expect(loader.isVisible()).toBe(false);
    });

    test("should return false for visibility when element is hidden", () => {
      loader.loadingElement.style.display = "none";
      loader.isLoading = true;

      expect(loader.isVisible()).toBe(false);
    });

    test("should return false for visibility when not loading", () => {
      loader.loadingElement.style.display = "block";
      loader.isLoading = false;

      expect(loader.isVisible()).toBe(false);
    });
  });

  describe("Error Handling", () => {
    test("should handle missing loading element gracefully", () => {
      loader = new LoaderUtility("non-existent");
      // Don't call init()

      expect(() => loader.showLoading()).not.toThrow();
      expect(() => loader.hideLoading()).not.toThrow();
      expect(() => loader.setMessage("test")).not.toThrow();
      expect(loader.isVisible()).toBe(false);
    });

    test("should handle destroyed loader gracefully", () => {
      loader = new LoaderUtility("test-loader");
      loader.init();
      loader.destroy();

      expect(() => loader.showLoading()).not.toThrow();
      expect(() => loader.hideLoading()).not.toThrow();
      expect(() => loader.setMessage("test")).not.toThrow();
      expect(loader.isVisible()).toBe(false);
    });

    test("should handle loader without message element", () => {
      loader = new LoaderUtility("test-loader");
      loader.init();

      // Remove the message element
      const messageElement = loader.loadingElement.querySelector("p");
      if (messageElement) {
        messageElement.remove();
      }

      expect(() => loader.setMessage("test")).not.toThrow();
    });
  });

  describe("Cleanup and Destruction", () => {
    test("should properly destroy loader", () => {
      loader = new LoaderUtility("test-loader");
      loader.init();
      loader.showLoading();

      expect(document.getElementById("test-loader")).toBeTruthy();
      expect(loader.isLoading).toBe(true);

      loader.destroy();

      expect(document.getElementById("test-loader")).toBeNull();
      expect(loader.loadingElement).toBeNull();
      expect(loader.isLoading).toBe(false);
    });

    test("should handle destroy when element does not exist", () => {
      loader = new LoaderUtility("test-loader");
      loader.loadingElement = null;

      expect(() => loader.destroy()).not.toThrow();
    });

    test("should handle destroy when element has no parent", () => {
      loader = new LoaderUtility("test-loader");
      loader.loadingElement = document.createElement("div");
      // Element is not attached to DOM

      expect(() => loader.destroy()).not.toThrow();
    });
  });

  describe("CSS Animation Integration", () => {
    beforeEach(() => {
      loader = new LoaderUtility("test-loader");
      loader.init();
    });

    test("should have spinner element for CSS animations", () => {
      const spinner = loader.loadingElement.querySelector(".loading-spinner");

      expect(spinner).toBeTruthy();
      expect(spinner.classList.contains("loading-spinner")).toBe(true);
    });

    test("should maintain spinner structure after show/hide", () => {
      loader.showLoading();
      loader.hideLoading();
      loader.showLoading();

      const spinner = loader.loadingElement.querySelector(".loading-spinner");
      expect(spinner).toBeTruthy();
    });
  });

  describe("Multiple Loaders", () => {
    let loader1, loader2;

    afterEach(() => {
      if (loader1) loader1.destroy();
      if (loader2) loader2.destroy();
    });

    test("should support multiple independent loaders", () => {
      loader1 = new LoaderUtility("loader-1");
      loader2 = new LoaderUtility("loader-2");

      loader1.init();
      loader2.init();

      loader1.showLoading();
      expect(loader1.isVisible()).toBe(true);
      expect(loader2.isVisible()).toBe(false);

      loader2.showLoading();
      expect(loader1.isVisible()).toBe(true);
      expect(loader2.isVisible()).toBe(true);

      loader1.hideLoading();
      expect(loader1.isVisible()).toBe(false);
      expect(loader2.isVisible()).toBe(true);
    });

    test("should set different messages for different loaders", () => {
      loader1 = new LoaderUtility("loader-1");
      loader2 = new LoaderUtility("loader-2");

      loader1.init();
      loader2.init();

      loader1.setMessage("Loading movies...");
      loader2.setMessage("Searching...");

      const message1 = loader1.loadingElement.querySelector("p");
      const message2 = loader2.loadingElement.querySelector("p");

      expect(message1.textContent).toBe("Loading movies...");
      expect(message2.textContent).toBe("Searching...");
    });
  });

  describe("Real-world Usage Patterns", () => {
    beforeEach(() => {
      loader = new LoaderUtility("api-loader");
      loader.init();
    });

    test("should simulate API loading pattern", async () => {
      // Start loading
      loader.showLoading();
      loader.setMessage("Fetching data...");

      expect(loader.isVisible()).toBe(true);

      // Simulate async operation
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Still loading
      expect(loader.isVisible()).toBe(true);

      // Complete loading
      loader.hideLoading();
      expect(loader.isVisible()).toBe(false);
    });

    test("should simulate search with loading states", () => {
      // Initial state
      expect(loader.isVisible()).toBe(false);

      // Start search
      loader.showLoading();
      loader.setMessage("Searching movies...");
      expect(loader.isVisible()).toBe(true);

      // Update search progress
      loader.setMessage("Processing results...");
      expect(loader.isVisible()).toBe(true);

      // Complete search
      loader.hideLoading();
      expect(loader.isVisible()).toBe(false);
    });

    test("should handle rapid show/hide cycles", () => {
      for (let i = 0; i < 5; i++) {
        loader.showLoading();
        loader.hideLoading();
      }

      expect(loader.isVisible()).toBe(false);
      expect(loader.isLoading).toBe(false);
    });
  });
});
