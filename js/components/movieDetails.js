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

    // Create modal container
    this.modal = document.createElement("div");
    this.modal.className = "modal";

    // Create modal content
    const modalContent = document.createElement("div");
    modalContent.className = "modal-content";

    // Create close button
    const closeBtn = document.createElement("button");
    closeBtn.className = "modal-close";
    closeBtn.innerHTML = "&times;";
    closeBtn.setAttribute("aria-label", "Close modal");

    // Create content area
    const contentArea = document.createElement("div");
    contentArea.className = "modal-body";

    // Assemble modal
    modalContent.appendChild(closeBtn);
    modalContent.appendChild(contentArea);
    this.modal.appendChild(modalContent);
    this.overlay.appendChild(this.modal);

    // Add to document
    document.body.appendChild(this.overlay);
  }

  bindEvents() {
    const closeBtn = this.modal.querySelector(".modal-close");

    // Close on close button click
    closeBtn.addEventListener("click", () => this.close());

    // Close on overlay click
    this.overlay.addEventListener("click", (e) => {
      if (e.target === this.overlay) {
        this.close();
      }
    });

    // Close on escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isOpen) {
        this.close();
      }
    });
  }

  open(content = "") {
    if (this.isOpen) return;

    const modalBody = this.modal.querySelector(".modal-body");
    modalBody.innerHTML = content;

    this.overlay.style.display = "flex";
    this.isOpen = true;

    // Trigger animation
    requestAnimationFrame(() => {
      this.overlay.classList.add("modal-open");
      this.modal.classList.add("modal-open");
    });

    // Prevent body scroll
    document.body.style.overflow = "hidden";

    // Focus management for accessibility
    this.modal.querySelector(".modal-close").focus();
  }

  close() {
    if (!this.isOpen) return;

    this.overlay.classList.remove("modal-open");
    this.modal.classList.remove("modal-open");

    // Wait for animation to complete
    setTimeout(() => {
      this.overlay.style.display = "none";
      this.isOpen = false;
      document.body.style.overflow = "";
    }, 300);
  }

  setContent(content) {
    const modalBody = this.modal.querySelector(".modal-body");
    modalBody.innerHTML = content;
  }

  // Method to check if modal is open
  getIsOpen() {
    return this.isOpen;
  }

  // Method to toggle modal
  toggle(content = "") {
    if (this.isOpen) {
      this.close();
    } else {
      this.open(content);
    }
  }

  // Destroy modal
  destroy() {
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
    this.isOpen = false;
  }
}

// Create a global modal instance
window.MovieModal = new Modal();

// Export for module usage
if (typeof module !== "undefined" && module.exports) {
  module.exports = Modal;
}
