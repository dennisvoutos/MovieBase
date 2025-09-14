/**
 * Event Utility Functions
 * Helper functions for event handling and management
 */

/**
 * Add click event listener to element
 * @param {Element|string} elementOrSelector - Element or selector
 * @param {Function} callback - Event callback
 * @param {Object} options - Event options
 */
function addClickListener(elementOrSelector, callback, options = {}) {
  const element =
    typeof elementOrSelector === "string"
      ? document.querySelector(elementOrSelector)
      : elementOrSelector;

  if (element && typeof callback === "function") {
    element.addEventListener("click", callback, options);
  }
}

/**
 * Add input event listener to element
 * @param {Element|string} elementOrSelector - Element or selector
 * @param {Function} callback - Event callback
 * @param {Object} options - Event options
 */
function addInputListener(elementOrSelector, callback, options = {}) {
  const element =
    typeof elementOrSelector === "string"
      ? document.querySelector(elementOrSelector)
      : elementOrSelector;

  if (element && typeof callback === "function") {
    element.addEventListener("input", callback, options);
  }
}

/**
 * Add change event listener to element
 * @param {Element|string} elementOrSelector - Element or selector
 * @param {Function} callback - Event callback
 * @param {Object} options - Event options
 */
function addChangeListener(elementOrSelector, callback, options = {}) {
  const element =
    typeof elementOrSelector === "string"
      ? document.querySelector(elementOrSelector)
      : elementOrSelector;

  if (element && typeof callback === "function") {
    element.addEventListener("change", callback, options);
  }
}

/**
 * Add keydown event listener to element
 * @param {Element|string} elementOrSelector - Element or selector
 * @param {Function} callback - Event callback
 * @param {Object} options - Event options
 */
function addKeydownListener(elementOrSelector, callback, options = {}) {
  const element =
    typeof elementOrSelector === "string"
      ? document.querySelector(elementOrSelector)
      : elementOrSelector;

  if (element && typeof callback === "function") {
    element.addEventListener("keydown", callback, options);
  }
}

/**
 * Add scroll event listener to element or window
 * @param {Element|string} elementOrSelector - Element, selector, or window
 * @param {Function} callback - Event callback
 * @param {Object} options - Event options
 */
function addScrollListener(elementOrSelector, callback, options = {}) {
  let element;

  if (elementOrSelector === window || elementOrSelector === "window") {
    element = window;
  } else {
    element =
      typeof elementOrSelector === "string"
        ? document.querySelector(elementOrSelector)
        : elementOrSelector;
  }

  if (element && typeof callback === "function") {
    element.addEventListener("scroll", callback, options);
  }
}

/**
 * Remove event listener from element
 * @param {Element|string} elementOrSelector - Element or selector
 * @param {string} eventType - Event type
 * @param {Function} callback - Event callback
 * @param {Object} options - Event options
 */
function removeEventListener(
  elementOrSelector,
  eventType,
  callback,
  options = {}
) {
  const element =
    typeof elementOrSelector === "string"
      ? document.querySelector(elementOrSelector)
      : elementOrSelector;

  if (element && typeof callback === "function") {
    element.removeEventListener(eventType, callback, options);
  }
}

/**
 * Debounce function to limit rapid function calls
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, delay) {
  let timeoutId;

  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

/**
 * Throttle function to limit function calls to specific intervals
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
function throttle(func, limit) {
  let inThrottle;

  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Create event dispatcher for custom events
 * @returns {Object} Event dispatcher with on, off, emit methods
 */
function createEventDispatcher() {
  const listeners = {};

  return {
    /**
     * Add event listener
     * @param {string} event - Event name
     * @param {Function} callback - Event callback
     */
    on(event, callback) {
      if (!listeners[event]) {
        listeners[event] = [];
      }
      listeners[event].push(callback);
    },

    /**
     * Remove event listener
     * @param {string} event - Event name
     * @param {Function} callback - Event callback
     */
    off(event, callback) {
      if (!listeners[event]) return;

      const index = listeners[event].indexOf(callback);
      if (index > -1) {
        listeners[event].splice(index, 1);
      }
    },

    /**
     * Emit event
     * @param {string} event - Event name
     * @param {*} data - Event data
     */
    emit(event, data) {
      if (!listeners[event]) return;

      listeners[event].forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error("Event listener error:", error);
        }
      });
    },

    /**
     * Remove all listeners
     */
    clear() {
      Object.keys(listeners).forEach((event) => {
        listeners[event] = [];
      });
    },
  };
}

/**
 * Prevent default event behavior
 * @param {Event} event - Event object
 */
function preventDefault(event) {
  if (event && event.preventDefault) {
    event.preventDefault();
  }
}

/**
 * Stop event propagation
 * @param {Event} event - Event object
 */
function stopPropagation(event) {
  if (event && event.stopPropagation) {
    event.stopPropagation();
  }
}

/**
 * Stop event propagation and prevent default
 * @param {Event} event - Event object
 */
function stopEvent(event) {
  preventDefault(event);
  stopPropagation(event);
}

/**
 * Check if element is in viewport
 * @param {Element} element - Element to check
 * @param {number} threshold - Threshold percentage (0-1)
 * @returns {boolean} Whether element is in viewport
 */
function isInViewport(element, threshold = 0) {
  if (!element) return false;

  const rect = element.getBoundingClientRect();
  const windowHeight =
    window.innerHeight || document.documentElement.clientHeight;
  const windowWidth = window.innerWidth || document.documentElement.clientWidth;

  const vertInView =
    rect.top <= windowHeight * (1 - threshold) &&
    rect.bottom >= windowHeight * threshold;
  const horInView =
    rect.left <= windowWidth * (1 - threshold) &&
    rect.right >= windowWidth * threshold;

  return vertInView && horInView;
}

/**
 * Create intersection observer for lazy loading or infinite scroll
 * @param {Function} callback - Callback when elements intersect
 * @param {Object} options - Observer options
 * @returns {IntersectionObserver} Observer instance
 */
function createIntersectionObserver(callback, options = {}) {
  const defaultOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.1,
  };

  const observerOptions = { ...defaultOptions, ...options };

  if ("IntersectionObserver" in window) {
    return new IntersectionObserver(callback, observerOptions);
  } else {
    // Fallback for older browsers
    console.warn("IntersectionObserver not supported");
    return {
      observe: () => {},
      unobserve: () => {},
      disconnect: () => {},
    };
  }
}

/**
 * Wait for DOM to be ready
 * @param {Function} callback - Callback to execute when DOM is ready
 */
function onDOMReady(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
}

/**
 * Wait for window to load completely
 * @param {Function} callback - Callback to execute when window loads
 */
function onWindowLoad(callback) {
  if (document.readyState === "complete") {
    callback();
  } else {
    window.addEventListener("load", callback);
  }
}

/**
 * Simulate click event on element
 * @param {Element|string} elementOrSelector - Element or selector
 */
function simulateClick(elementOrSelector) {
  const element =
    typeof elementOrSelector === "string"
      ? document.querySelector(elementOrSelector)
      : elementOrSelector;

  if (element) {
    const event = new MouseEvent("click", {
      view: window,
      bubbles: true,
      cancelable: true,
    });
    element.dispatchEvent(event);
  }
}

/**
 * Get event target element
 * @param {Event} event - Event object
 * @returns {Element|null} Target element
 */
function getEventTarget(event) {
  return event && event.target ? event.target : null;
}

/**
 * Check if event target matches selector
 * @param {Event} event - Event object
 * @param {string} selector - CSS selector
 * @returns {boolean} Whether target matches selector
 */
function eventTargetMatches(event, selector) {
  const target = getEventTarget(event);
  return target && target.matches ? target.matches(selector) : false;
}

// Export functions for browser environment
if (typeof window !== "undefined") {
  window.EventUtils = {
    addClickListener,
    addInputListener,
    addChangeListener,
    addKeydownListener,
    addScrollListener,
    removeEventListener,
    debounce,
    throttle,
    createEventDispatcher,
    preventDefault,
    stopPropagation,
    stopEvent,
    isInViewport,
    createIntersectionObserver,
    onDOMReady,
    onWindowLoad,
    simulateClick,
    getEventTarget,
    eventTargetMatches,
  };
}

// Export for module usage
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    addClickListener,
    addInputListener,
    addChangeListener,
    addKeydownListener,
    addScrollListener,
    removeEventListener,
    debounce,
    throttle,
    createEventDispatcher,
    preventDefault,
    stopPropagation,
    stopEvent,
    isInViewport,
    createIntersectionObserver,
    onDOMReady,
    onWindowLoad,
    simulateClick,
    getEventTarget,
    eventTargetMatches,
  };
}
