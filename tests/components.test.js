/**
 * Component Tests
 * Tests for Modal and other UI components
 */

// Import the Modal class from movieDetails component
const Modal = require("../js/components/movieDetails.js");

describe("Modal Component", () => {
  let modal;
  let originalBody;

  beforeEach(() => {
    // Create a clean DOM environment for each test
    document.body.innerHTML = "";

    // Create new modal instance
    modal = new Modal();
  });

  afterEach(() => {
    // Clean up modal
    if (modal) {
      modal.destroy();
    }
    // Clean up DOM
    document.body.innerHTML = "";
    // Reset body overflow
    document.body.style.overflow = "";
  });

  describe("Initialization", () => {
    test("should create modal instance", () => {
      expect(modal).toBeTruthy();
      expect(modal.isOpen).toBe(false);
    });

    test("should create modal DOM elements", () => {
      const overlay = document.querySelector(".modal-overlay");
      const modalElement = document.querySelector(".modal");
      const closeButton = document.querySelector(".modal-close");
      const modalBody = document.querySelector(".modal-body");

      expect(overlay).toBeTruthy();
      expect(modalElement).toBeTruthy();
      expect(closeButton).toBeTruthy();
      expect(modalBody).toBeTruthy();
    });

    test("should initially be hidden", () => {
      const overlay = document.querySelector(".modal-overlay");
      // Modal doesn't set display: none initially, it relies on CSS and modal-open class
      expect(overlay.style.display).toBe("");
      expect(overlay.classList.contains("modal-open")).toBe(false);
    });

    test("should append modal to document body", () => {
      const overlay = document.querySelector(".modal-overlay");
      expect(overlay.parentNode).toBe(document.body);
    });
  });

  describe("Opening modal", () => {
    test("should open modal with content", () => {
      const testContent = "<h1>Test Content</h1>";
      modal.open(testContent);

      expect(modal.isOpen).toBe(true);
      expect(modal.getIsOpen()).toBe(true);

      const overlay = document.querySelector(".modal-overlay");
      const modalBody = document.querySelector(".modal-body");

      expect(overlay.style.display).toBe("flex");
      expect(modalBody.innerHTML).toBe(testContent);
    });

    test("should add modal-open class", (done) => {
      modal.open("<p>Test</p>");

      // Check after animation frame
      requestAnimationFrame(() => {
        const overlay = document.querySelector(".modal-overlay");
        const modalElement = document.querySelector(".modal");

        expect(overlay.classList.contains("modal-open")).toBe(true);
        expect(modalElement.classList.contains("modal-open")).toBe(true);
        done();
      });
    });

    test("should prevent body scroll when opened", () => {
      modal.open("<p>Test</p>");
      expect(document.body.style.overflow).toBe("hidden");
    });

    test("should focus close button when opened", (done) => {
      modal.open("<p>Test</p>");

      requestAnimationFrame(() => {
        const closeButton = document.querySelector(".modal-close");
        expect(document.activeElement).toBe(closeButton);
        done();
      });
    });

    test("should not open if already open", () => {
      modal.open("<p>First</p>");
      modal.open("<p>Second</p>");

      const modalBody = document.querySelector(".modal-body");
      expect(modalBody.innerHTML).toBe("<p>First</p>");
    });
  });

  describe("Closing modal", () => {
    beforeEach(() => {
      modal.open("<p>Test content</p>");
    });

    test("should close modal", (done) => {
      modal.close();

      // isOpen is set to false inside setTimeout, so check immediately that classes are removed
      const overlay = document.querySelector(".modal-overlay");
      const modalElement = document.querySelector(".modal");
      expect(overlay.classList.contains("modal-open")).toBe(false);
      expect(modalElement.classList.contains("modal-open")).toBe(false);

      // Check after animation completes
      setTimeout(() => {
        expect(modal.isOpen).toBe(false);
        expect(overlay.style.display).toBe("none");
        expect(document.body.style.overflow).toBe("");
        done();
      }, 350);
    });

    test("should remove modal-open classes when closing", () => {
      modal.close();

      const overlay = document.querySelector(".modal-overlay");
      const modalElement = document.querySelector(".modal");

      expect(overlay.classList.contains("modal-open")).toBe(false);
      expect(modalElement.classList.contains("modal-open")).toBe(false);
    });

    test("should not close if already closed", () => {
      modal.close();
      const wasOpen = modal.isOpen;
      modal.close();
      expect(modal.isOpen).toBe(wasOpen);
    });
  });

  describe("Content management", () => {
    test("should set content with setContent method", () => {
      const testContent = "<div>New content</div>";
      modal.setContent(testContent);

      const modalBody = document.querySelector(".modal-body");
      expect(modalBody.innerHTML).toBe(testContent);
    });

    test("should update content when modal is open", () => {
      modal.open("<p>Initial</p>");
      modal.setContent("<p>Updated</p>");

      const modalBody = document.querySelector(".modal-body");
      expect(modalBody.innerHTML).toBe("<p>Updated</p>");
    });
  });

  describe("Toggle functionality", () => {
    test("should open modal when closed", () => {
      modal.toggle("<p>Toggle content</p>");
      expect(modal.isOpen).toBe(true);
    });

    test("should close modal when open", (done) => {
      modal.open("<p>Test</p>");
      modal.toggle();

      // Check after animation completes since toggle uses close() method
      setTimeout(() => {
        expect(modal.isOpen).toBe(false);
        done();
      }, 350);
    });
  });

  describe("Event handling", () => {
    beforeEach(() => {
      modal.open("<p>Test content</p>");
    });

    test("should close on close button click", (done) => {
      const closeButton = document.querySelector(".modal-close");
      closeButton.click();

      // Check after animation completes
      setTimeout(() => {
        expect(modal.isOpen).toBe(false);
        done();
      }, 350);
    });

    test("should close on overlay click", (done) => {
      const overlay = document.querySelector(".modal-overlay");

      // Simulate click on overlay (not on modal content)
      const event = new MouseEvent("click", { bubbles: true });
      Object.defineProperty(event, "target", { value: overlay });
      overlay.dispatchEvent(event);

      // Check after animation completes
      setTimeout(() => {
        expect(modal.isOpen).toBe(false);
        done();
      }, 350);
    });

    test("should not close on modal content click", () => {
      const modalElement = document.querySelector(".modal");

      const event = new MouseEvent("click", { bubbles: true });
      Object.defineProperty(event, "target", { value: modalElement });
      modalElement.dispatchEvent(event);

      expect(modal.isOpen).toBe(true);
    });

    test("should close on Escape key", (done) => {
      const escapeEvent = new KeyboardEvent("keydown", {
        key: "Escape",
        bubbles: true,
      });
      document.dispatchEvent(escapeEvent);

      // Check after animation completes
      setTimeout(() => {
        expect(modal.isOpen).toBe(false);
        done();
      }, 350);
    });

    test("should not close on other keys", () => {
      const enterEvent = new KeyboardEvent("keydown", {
        key: "Enter",
        bubbles: true,
      });
      document.dispatchEvent(enterEvent);

      expect(modal.isOpen).toBe(true);
    });

    test("should only respond to Escape when modal is open", () => {
      modal.close();

      // Wait for close animation to complete first
      setTimeout(() => {
        const escapeEvent = new KeyboardEvent("keydown", {
          key: "Escape",
          bubbles: true,
        });
        document.dispatchEvent(escapeEvent);

        // Should not throw error or cause issues, modal should remain closed
        expect(modal.isOpen).toBe(false);
      }, 350);
    });
  });

  describe("Accessibility", () => {
    test("should have proper ARIA label on close button", () => {
      const closeButton = document.querySelector(".modal-close");
      expect(closeButton.getAttribute("aria-label")).toBe("Close modal");
    });

    test("should manage focus properly", () => {
      modal.open("<button>Test button</button>");

      const closeButton = document.querySelector(".modal-close");
      expect(document.activeElement).toBe(closeButton);
    });
  });

  describe("Multiple modals", () => {
    test("should handle multiple modal instances", () => {
      const modal2 = new Modal();

      modal.open("<p>Modal 1</p>");
      modal2.open("<p>Modal 2</p>");

      expect(modal.isOpen).toBe(true);
      expect(modal2.isOpen).toBe(true);

      // Clean up
      modal2.destroy();
    });
  });

  describe("Destroy functionality", () => {
    test("should remove modal from DOM when destroyed", () => {
      const overlay = document.querySelector(".modal-overlay");
      expect(overlay).toBeTruthy();

      modal.destroy();

      const overlayAfterDestroy = document.querySelector(".modal-overlay");
      expect(overlayAfterDestroy).toBeFalsy();
    });

    test("should set isOpen to false when destroyed", () => {
      modal.open("<p>Test</p>");
      modal.destroy();
      expect(modal.isOpen).toBe(false);
    });

    test("should handle destroy when modal not in DOM", () => {
      modal.destroy(); // First destroy
      expect(() => modal.destroy()).not.toThrow(); // Second destroy should not throw
    });
  });

  describe("Animation handling", () => {
    test("should use requestAnimationFrame for opening", (done) => {
      const originalRAF = window.requestAnimationFrame;
      let rafCalled = false;

      window.requestAnimationFrame = (callback) => {
        rafCalled = true;
        return originalRAF(callback);
      };

      modal.open("<p>Test</p>");

      setTimeout(() => {
        expect(rafCalled).toBe(true);
        window.requestAnimationFrame = originalRAF;
        done();
      }, 0);
    });

    test("should use setTimeout for closing animation", (done) => {
      modal.open("<p>Test</p>");

      const originalSetTimeout = window.setTimeout;
      let timeoutCalled = false;
      let capturedDelay = null;
      let callCount = 0;

      window.setTimeout = (callback, delay) => {
        callCount++;
        // The first setTimeout call should be from modal.close() with 300ms
        if (callCount === 1) {
          timeoutCalled = true;
          capturedDelay = delay;
        }
        return originalSetTimeout(callback, delay);
      };

      modal.close();

      // Use originalSetTimeout to avoid interfering with our mock
      originalSetTimeout(() => {
        expect(timeoutCalled).toBe(true);
        expect(capturedDelay).toBe(300); // Animation duration
        window.setTimeout = originalSetTimeout;
        done();
      }, 10);
    });
  });
});
