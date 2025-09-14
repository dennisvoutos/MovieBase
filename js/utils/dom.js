/**
 * DOM Utility Functions
 * Helper functions for DOM manipulation and element management
 */

/**
 * Select single element by CSS selector
 * @param {string} selector - CSS selector
 * @param {Element} parent - Parent element (optional)
 * @returns {Element|null} Found element or null
 */
function selectElement(selector, parent = document) {
  try {
    return parent.querySelector(selector);
  } catch (error) {
    console.warn("Invalid selector:", selector);
    return null;
  }
}

/**
 * Select multiple elements by CSS selector
 * @param {string} selector - CSS selector
 * @param {Element} parent - Parent element (optional)
 * @returns {Element[]} Array of found elements
 */
function selectElements(selector, parent = document) {
  try {
    return Array.from(parent.querySelectorAll(selector));
  } catch (error) {
    console.warn("Invalid selector:", selector);
    return [];
  }
}

/**
 * Create element with classes and attributes
 * @param {string} tag - HTML tag name
 * @param {string[]} classes - Array of CSS classes
 * @param {Object} attributes - Object of attributes
 * @returns {Element} Created element
 */
function createElement(tag, classes = [], attributes = {}) {
  const element = document.createElement(tag);

  // Add classes
  if (classes.length > 0) {
    element.classList.add(...classes);
  }

  // Set attributes
  Object.entries(attributes).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      element.setAttribute(key, value);
    }
  });

  return element;
}

/**
 * Remove element from DOM
 * @param {Element|string} elementOrSelector - Element or selector
 */
function removeElement(elementOrSelector) {
  const element =
    typeof elementOrSelector === "string"
      ? selectElement(elementOrSelector)
      : elementOrSelector;

  if (element && element.parentNode) {
    element.parentNode.removeChild(element);
  }
}

/**
 * Clear all children from element
 * @param {Element|string} elementOrSelector - Element or selector
 */
function clearElement(elementOrSelector) {
  const element =
    typeof elementOrSelector === "string"
      ? selectElement(elementOrSelector)
      : elementOrSelector;

  if (element) {
    element.innerHTML = "";
  }
}

/**
 * Show element (remove hidden class or set display)
 * @param {Element|string} elementOrSelector - Element or selector
 * @param {string} displayType - Display type (default: block)
 */
function showElement(elementOrSelector, displayType = "block") {
  const element =
    typeof elementOrSelector === "string"
      ? selectElement(elementOrSelector)
      : elementOrSelector;

  if (element) {
    element.classList.remove("hidden");
    element.style.display = displayType;
  }
}

/**
 * Hide element (add hidden class and set display none)
 * @param {Element|string} elementOrSelector - Element or selector
 */
function hideElement(elementOrSelector) {
  const element =
    typeof elementOrSelector === "string"
      ? selectElement(elementOrSelector)
      : elementOrSelector;

  if (element) {
    element.classList.add("hidden");
    element.style.display = "none";
  }
}

/**
 * Toggle element visibility
 * @param {Element|string} elementOrSelector - Element or selector
 * @param {string} displayType - Display type when showing
 */
function toggleElement(elementOrSelector, displayType = "block") {
  const element =
    typeof elementOrSelector === "string"
      ? selectElement(elementOrSelector)
      : elementOrSelector;

  if (element) {
    if (
      element.style.display === "none" ||
      element.classList.contains("hidden")
    ) {
      showElement(element, displayType);
    } else {
      hideElement(element);
    }
  }
}

/**
 * Check if element is visible
 * @param {Element|string} elementOrSelector - Element or selector
 * @returns {boolean} Whether element is visible
 */
function isElementVisible(elementOrSelector) {
  const element =
    typeof elementOrSelector === "string"
      ? selectElement(elementOrSelector)
      : elementOrSelector;

  if (!element) return false;

  const style = window.getComputedStyle(element);
  return (
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    style.opacity !== "0" &&
    !element.classList.contains("hidden")
  );
}

/**
 * Add CSS class to element
 * @param {Element|string} elementOrSelector - Element or selector
 * @param {string|string[]} classes - Class or array of classes
 */
function addClass(elementOrSelector, classes) {
  const element =
    typeof elementOrSelector === "string"
      ? selectElement(elementOrSelector)
      : elementOrSelector;

  if (element) {
    const classArray = Array.isArray(classes) ? classes : [classes];
    element.classList.add(...classArray);
  }
}

/**
 * Remove CSS class from element
 * @param {Element|string} elementOrSelector - Element or selector
 * @param {string|string[]} classes - Class or array of classes
 */
function removeClass(elementOrSelector, classes) {
  const element =
    typeof elementOrSelector === "string"
      ? selectElement(elementOrSelector)
      : elementOrSelector;

  if (element) {
    const classArray = Array.isArray(classes) ? classes : [classes];
    element.classList.remove(...classArray);
  }
}

/**
 * Toggle CSS class on element
 * @param {Element|string} elementOrSelector - Element or selector
 * @param {string} className - Class name to toggle
 * @returns {boolean} Whether class is now present
 */
function toggleClass(elementOrSelector, className) {
  const element =
    typeof elementOrSelector === "string"
      ? selectElement(elementOrSelector)
      : elementOrSelector;

  if (element) {
    return element.classList.toggle(className);
  }
  return false;
}

/**
 * Check if element has CSS class
 * @param {Element|string} elementOrSelector - Element or selector
 * @param {string} className - Class name to check
 * @returns {boolean} Whether element has the class
 */
function hasClass(elementOrSelector, className) {
  const element =
    typeof elementOrSelector === "string"
      ? selectElement(elementOrSelector)
      : elementOrSelector;

  return element ? element.classList.contains(className) : false;
}

/**
 * Set element text content safely
 * @param {Element|string} elementOrSelector - Element or selector
 * @param {string} text - Text content
 */
function setText(elementOrSelector, text) {
  const element =
    typeof elementOrSelector === "string"
      ? selectElement(elementOrSelector)
      : elementOrSelector;

  if (element) {
    element.textContent = text || "";
  }
}

/**
 * Set element HTML content safely
 * @param {Element|string} elementOrSelector - Element or selector
 * @param {string} html - HTML content
 */
function setHTML(elementOrSelector, html) {
  const element =
    typeof elementOrSelector === "string"
      ? selectElement(elementOrSelector)
      : elementOrSelector;

  if (element) {
    element.innerHTML = html || "";
  }
}

/**
 * Get element attribute value
 * @param {Element|string} elementOrSelector - Element or selector
 * @param {string} attributeName - Attribute name
 * @returns {string|null} Attribute value
 */
function getAttribute(elementOrSelector, attributeName) {
  const element =
    typeof elementOrSelector === "string"
      ? selectElement(elementOrSelector)
      : elementOrSelector;

  return element ? element.getAttribute(attributeName) : null;
}

/**
 * Set element attribute
 * @param {Element|string} elementOrSelector - Element or selector
 * @param {string} attributeName - Attribute name
 * @param {string} value - Attribute value
 */
function setAttribute(elementOrSelector, attributeName, value) {
  const element =
    typeof elementOrSelector === "string"
      ? selectElement(elementOrSelector)
      : elementOrSelector;

  if (element) {
    element.setAttribute(attributeName, value);
  }
}

/**
 * Remove element attribute
 * @param {Element|string} elementOrSelector - Element or selector
 * @param {string} attributeName - Attribute name
 */
function removeAttribute(elementOrSelector, attributeName) {
  const element =
    typeof elementOrSelector === "string"
      ? selectElement(elementOrSelector)
      : elementOrSelector;

  if (element) {
    element.removeAttribute(attributeName);
  }
}

/**
 * Append child element
 * @param {Element|string} parentOrSelector - Parent element or selector
 * @param {Element} child - Child element to append
 */
function appendChild(parentOrSelector, child) {
  const parent =
    typeof parentOrSelector === "string"
      ? selectElement(parentOrSelector)
      : parentOrSelector;

  if (parent && child) {
    parent.appendChild(child);
  }
}

/**
 * Insert element before another element
 * @param {Element|string} parentOrSelector - Parent element or selector
 * @param {Element} newElement - Element to insert
 * @param {Element} referenceElement - Reference element
 */
function insertBefore(parentOrSelector, newElement, referenceElement) {
  const parent =
    typeof parentOrSelector === "string"
      ? selectElement(parentOrSelector)
      : parentOrSelector;

  if (parent && newElement && referenceElement) {
    parent.insertBefore(newElement, referenceElement);
  }
}

/**
 * Get element dimensions and position
 * @param {Element|string} elementOrSelector - Element or selector
 * @returns {Object} Dimensions and position
 */
function getElementBounds(elementOrSelector) {
  const element =
    typeof elementOrSelector === "string"
      ? selectElement(elementOrSelector)
      : elementOrSelector;

  if (!element) return null;

  const rect = element.getBoundingClientRect();
  return {
    width: rect.width,
    height: rect.height,
    top: rect.top,
    left: rect.left,
    bottom: rect.bottom,
    right: rect.right,
  };
}

// Export functions for browser environment
if (typeof window !== "undefined") {
  window.DOMUtils = {
    selectElement,
    selectElements,
    createElement,
    removeElement,
    clearElement,
    showElement,
    hideElement,
    toggleElement,
    isElementVisible,
    addClass,
    removeClass,
    toggleClass,
    hasClass,
    setText,
    setHTML,
    getAttribute,
    setAttribute,
    removeAttribute,
    appendChild,
    insertBefore,
    getElementBounds,
  };
}

// Export for module usage
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    selectElement,
    selectElements,
    createElement,
    removeElement,
    clearElement,
    showElement,
    hideElement,
    toggleElement,
    isElementVisible,
    addClass,
    removeClass,
    toggleClass,
    hasClass,
    setText,
    setHTML,
    getAttribute,
    setAttribute,
    removeAttribute,
    appendChild,
    insertBefore,
    getElementBounds,
  };
}
