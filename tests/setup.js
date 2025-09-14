// Global test setup
import "jest-environment-jsdom";

// Mock fetch globally
global.fetch = jest.fn();

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation((callback) => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
  callback,
}));

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 0));
global.cancelAnimationFrame = jest.fn((id) => clearTimeout(id));

// Clean up after each test
afterEach(() => {
  // Reset all mocks
  jest.clearAllMocks();

  // Clean up DOM
  document.body.innerHTML = "";

  // Reset document head
  document.head.innerHTML = "";

  // Reset any global state
  if (window.movieModal) {
    window.movieModal = null;
  }
});
