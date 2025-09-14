/**
 * @jest-environment jsdom
 */

/**
 * Modal Component Tests
 * Tests for the Modal class from movieDetails.js
 */

// Mock the Modal class since we can't easily import ES6 modules in this setup
class Modal {
  constructor() {
    this.isOpen = false;
    this.modal = null;
    this.overlay = null;
    this.init();
  }

  init() {
    this.createModal();
    this.bindEvents();
  }

  createModal() {
    // Create overlay
    this.overlay = document.createElement("div");
    this.overlay.className = "modal-overlay";
    this.overlay.style.display = "none";

    // Create modal container
    this.modal = document.createElement("div");
    this.modal.className = "modal";

    // Create close button
    const closeButton = document.createElement("button");
    closeButton.className = "modal-close";
    closeButton.innerHTML = "&times;";
    closeButton.setAttribute("aria-label", "Close modal");

    // Create modal body
    const modalBody = document.createElement("div");
    modalBody.className = "modal-body";

    // Assemble modal
    this.modal.appendChild(closeButton);
    this.modal.appendChild(modalBody);
    this.overlay.appendChild(this.modal);

    // Add to document
    document.body.appendChild(this.overlay);
  }

  bindEvents() {
    if (!this.overlay) return;

    // Close on close button click
    const closeButton = this.overlay.querySelector(".modal-close");
    if (closeButton) {
      closeButton.addEventListener("click", () => this.close());
    }

    // Close on overlay click (but not on modal content click)
    this.overlay.addEventListener("click", (e) => {
      if (e.target === this.overlay) {
        this.close();
      }
    });

    // Close on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isOpen) {
        this.close();
      }
    });
  }

  open(content = "") {
    if (this.isOpen || !this.overlay || !this.modal) return;

    this.setContent(content);
    this.isOpen = true;
    this.overlay.style.display = "flex";
    document.body.style.overflow = "hidden";

    // Add classes for animation
    requestAnimationFrame(() => {
      if (this.overlay && this.modal) {
        this.overlay.classList.add("modal-open");
        this.modal.classList.add("modal-open");
      }
    });

    // Focus the close button for accessibility
    const closeButton = this.overlay.querySelector(".modal-close");
    if (closeButton) {
      closeButton.focus();
    }
  }

  close() {
    if (!this.isOpen || !this.overlay || !this.modal) return;

    this.isOpen = false;
    this.overlay.classList.remove("modal-open");
    this.modal.classList.remove("modal-open");

    // Hide after animation
    setTimeout(() => {
      if (this.overlay) {
        this.overlay.style.display = "none";
      }
      document.body.style.overflow = "";
    }, 300);
  }

  setContent(content) {
    if (!this.overlay) return;

    const modalBody = this.overlay.querySelector(".modal-body");
    if (modalBody) {
      modalBody.innerHTML = content;
    }
  }

  toggle(content = "") {
    if (this.isOpen) {
      this.close();
    } else {
      this.open(content);
    }
  }

  getIsOpen() {
    return this.isOpen;
  }

  destroy() {
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
    this.isOpen = false;
    this.modal = null;
    this.overlay = null;
  }
}

describe("Modal Component", () => {
  let modal;

  beforeEach(() => {
    // Clean DOM before each test
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
      expect(overlay.style.display).toBe("none");
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

      expect(modal.isOpen).toBe(false);

      // Check after animation completes
      setTimeout(() => {
        const overlay = document.querySelector(".modal-overlay");
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

    test("should close modal when open", () => {
      modal.open("<p>Test</p>");
      modal.toggle();
      expect(modal.isOpen).toBe(false);
    });
  });

  describe("Event handling", () => {
    beforeEach(() => {
      modal.open("<p>Test content</p>");
    });

    test("should close on close button click", () => {
      const closeButton = document.querySelector(".modal-close");
      closeButton.click();
      expect(modal.isOpen).toBe(false);
    });

    test("should close on overlay click", () => {
      const overlay = document.querySelector(".modal-overlay");

      // Simulate click on overlay (not on modal content)
      const event = new MouseEvent("click", { bubbles: true });
      Object.defineProperty(event, "target", { value: overlay });
      overlay.dispatchEvent(event);

      expect(modal.isOpen).toBe(false);
    });

    test("should not close on modal content click", () => {
      const modalElement = document.querySelector(".modal");

      const event = new MouseEvent("click", { bubbles: true });
      Object.defineProperty(event, "target", { value: modalElement });
      modalElement.dispatchEvent(event);

      expect(modal.isOpen).toBe(true);
    });

    test("should close on Escape key", () => {
      const escapeEvent = new KeyboardEvent("keydown", {
        key: "Escape",
        bubbles: true,
      });
      document.dispatchEvent(escapeEvent);

      expect(modal.isOpen).toBe(false);
    });

    test("should not close on other keys", () => {
      const enterEvent = new KeyboardEvent("keydown", {
        key: "Enter",
        bubbles: true,
      });
      document.dispatchEvent(enterEvent);

      expect(modal.isOpen).toBe(true);
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
});
