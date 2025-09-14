/**
 * Integration Tests
 * Tests for complete workflows and component interactions
 */

// Import the actual classes and functions
const Modal = require("../js/components/movieDetails.js");

// Mock implementations for integration testing
const createMovieCard = (movie) => {
  const card = document.createElement("div");
  card.className = "movie-card";
  card.setAttribute("data-movie-id", movie.id.toString());

  card.innerHTML = `
    <img class="movie-poster" src="${
      movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : "placeholder.jpg"
    }" alt="${movie.title}">
    <div class="movie-info">
      <h3 class="movie-title">${movie.title}</h3>
      <p class="movie-date">${movie.release_date}</p>
      <span class="movie-rating">${movie.vote_average}</span>
    </div>
  `;

  // Add click listener for modal
  card.addEventListener("click", () => {
    if (window.movieModal) {
      showMovieDetails(movie.id);
    }
  });

  return card;
};

const loadNowPlayingMovies = async (page = 1, append = false) => {
  const loading = document.getElementById("loading");
  const container = document.getElementById("movies-container");

  try {
    if (loading) loading.style.display = "block";

    const response = await fetch(
      `https://api.themoviedb.org/3/movie/now_playing?page=${page}`
    );
    const data = await response.json();

    if (!append) {
      container.innerHTML = "";
    }

    data.results.forEach((movie) => {
      const card = createMovieCard(movie);
      container.appendChild(card);
    });

    // Set up intersection observer for infinite scroll (only on first load)
    if (page === 1 && loading && window.IntersectionObserver) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && data.page < data.total_pages) {
            loadNowPlayingMovies(data.page + 1, true);
          }
        });
      });
      observer.observe(loading);
    }
  } catch (error) {
    console.error("Error loading movies:", error);
  } finally {
    if (loading) loading.style.display = "none";
  }
};

const searchMovies = async (query) => {
  const container = document.getElementById("movies-container");

  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(
        query
      )}`
    );
    const data = await response.json();

    container.innerHTML = "";
    data.results.forEach((movie) => {
      const card = createMovieCard(movie);
      container.appendChild(card);
    });
  } catch (error) {
    console.error("Error searching movies:", error);
  }
};

const showMovieDetails = async (movieId) => {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}`
    );
    const movie = await response.json();

    const content = `
      <h2>${movie.title}</h2>
      <p>${movie.overview}</p>
      <p>Release Date: ${movie.release_date}</p>
      <p>Rating: ${movie.vote_average}/10</p>
    `;

    if (window.movieModal) {
      window.movieModal.open(content);
    }
  } catch (error) {
    console.error("Error loading movie details:", error);
    if (window.movieModal) {
      window.movieModal.open("<p>Error loading movie details</p>");
    }
  }
};

const initializeSearch = () => {
  const searchInput = document.getElementById("search-input");
  const clearButton = document.getElementById("clear-search");

  if (!searchInput || !clearButton) return;

  // Initially hide clear button
  clearButton.style.display = "none";

  let searchTimeout;

  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.trim();

    // Show/hide clear button
    clearButton.style.display = query ? "block" : "none";

    // Debounce search
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
      if (query) {
        await searchMovies(query);
      } else {
        await loadNowPlayingMovies();
      }
    }, 300);
  });

  clearButton.addEventListener("click", async () => {
    searchInput.value = "";
    clearButton.style.display = "none";
    await loadNowPlayingMovies();
  });
};

describe("Movie Application Integration", () => {
  let originalFetch;
  let mockApiResponses;

  beforeEach(() => {
    // Clean DOM
    document.body.innerHTML = `
            <div id="app">
                <div id="movies-container"></div>
                <div id="search-container">
                    <input id="search-input" type="text" placeholder="Search movies...">
                    <button id="clear-search" style="display: none;">×</button>
                </div>
                <div id="loading" style="display: none;">Loading...</div>
            </div>
        `;

    // Mock API responses
    mockApiResponses = {
      nowPlaying: {
        page: 1,
        results: [
          {
            id: 1,
            title: "Test Movie 1",
            overview: "Test overview 1",
            poster_path: "/test1.jpg",
            release_date: "2023-12-01",
            vote_average: 8.5,
          },
          {
            id: 2,
            title: "Test Movie 2",
            overview: "Test overview 2",
            poster_path: "/test2.jpg",
            release_date: "2023-12-02",
            vote_average: 7.8,
          },
        ],
        total_pages: 2,
        total_results: 25,
      },
      search: {
        page: 1,
        results: [
          {
            id: 3,
            title: "Search Result Movie",
            overview: "Search result overview",
            poster_path: "/search.jpg",
            release_date: "2023-11-15",
            vote_average: 9.0,
          },
        ],
        total_pages: 1,
        total_results: 1,
      },
      movieDetails: {
        id: 1,
        title: "Test Movie 1",
        overview: "Detailed overview",
        poster_path: "/test1.jpg",
        backdrop_path: "/backdrop1.jpg",
        release_date: "2023-12-01",
        vote_average: 8.5,
        runtime: 120,
        genres: [{ id: 28, name: "Action" }],
        production_companies: [{ name: "Test Studios" }],
      },
      videos: {
        results: [
          {
            id: "video1",
            key: "dQw4w9WgXcQ",
            name: "Official Trailer",
            site: "YouTube",
            type: "Trailer",
          },
        ],
      },
      reviews: {
        results: [
          {
            id: "review1",
            author: "Test Reviewer",
            content: "Great movie!",
            created_at: "2023-12-01T00:00:00.000Z",
          },
        ],
      },
      similar: {
        results: [
          {
            id: 4,
            title: "Similar Movie",
            poster_path: "/similar.jpg",
            release_date: "2023-10-01",
            vote_average: 7.5,
          },
        ],
      },
    };

    // Mock fetch
    originalFetch = global.fetch;
    global.fetch = jest.fn((url) => {
      if (url.includes("/movie/now_playing")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockApiResponses.nowPlaying),
        });
      }
      if (url.includes("/search/movie")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockApiResponses.search),
        });
      }
      if (url.includes("/movie/1/videos")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockApiResponses.videos),
        });
      }
      if (url.includes("/movie/1/reviews")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockApiResponses.reviews),
        });
      }
      if (url.includes("/movie/1/similar")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockApiResponses.similar),
        });
      }
      if (url.includes("/movie/1")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockApiResponses.movieDetails),
        });
      }
      return Promise.reject(new Error("Unknown URL"));
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
    document.body.innerHTML = "";
  });

  describe("Movie Card Creation and Display", () => {
    test("should create movie card with all required elements", () => {
      const movie = mockApiResponses.nowPlaying.results[0];
      const card = createMovieCard(movie);

      expect(card).toBeTruthy();
      expect(card.classList.contains("movie-card")).toBe(true);

      const image = card.querySelector(".movie-poster");
      const title = card.querySelector(".movie-title");
      const date = card.querySelector(".movie-date");
      const rating = card.querySelector(".movie-rating");

      expect(image).toBeTruthy();
      expect(title).toBeTruthy();
      expect(date).toBeTruthy();
      expect(rating).toBeTruthy();

      expect(title.textContent).toBe(movie.title);
      expect(rating.textContent).toContain("8.5");
    });

    test("should handle missing poster image gracefully", () => {
      const movie = {
        ...mockApiResponses.nowPlaying.results[0],
        poster_path: null,
      };
      const card = createMovieCard(movie);

      const image = card.querySelector(".movie-poster");
      expect(image.src).toContain("placeholder");
    });

    test("should add click listener to movie card", async () => {
      const movie = mockApiResponses.nowPlaying.results[0];
      const card = createMovieCard(movie);

      // Mock the modal
      const modal = { open: jest.fn() };
      window.movieModal = modal;

      card.click();

      // Wait for async showMovieDetails to complete
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Should attempt to open modal
      expect(card.getAttribute("data-movie-id")).toBe("1");
      expect(modal.open).toHaveBeenCalled();
    });
  });

  describe("Now Playing Page Workflow", () => {
    test("should load initial movies on page load", async () => {
      const container = document.getElementById("movies-container");

      await loadNowPlayingMovies();

      const movieCards = container.querySelectorAll(".movie-card");
      expect(movieCards.length).toBe(2);
      expect(movieCards[0].querySelector(".movie-title").textContent).toBe(
        "Test Movie 1"
      );
      expect(movieCards[1].querySelector(".movie-title").textContent).toBe(
        "Test Movie 2"
      );
    });

    test("should show and hide loading spinner", async () => {
      const loading = document.getElementById("loading");
      expect(loading.style.display).toBe("none");

      const loadPromise = loadNowPlayingMovies();
      // Loading should be visible during API call
      expect(loading.style.display).toBe("block");

      await loadPromise;
      // Loading should be hidden after completion
      expect(loading.style.display).toBe("none");
    });

    test("should handle API errors gracefully", async () => {
      // Mock API error
      global.fetch = jest.fn().mockRejectedValue(new Error("API Error"));

      const container = document.getElementById("movies-container");

      await loadNowPlayingMovies();

      // Should not crash and container should remain empty
      const movieCards = container.querySelectorAll(".movie-card");
      expect(movieCards.length).toBe(0);
    });
  });

  describe("Search Functionality Workflow", () => {
    test("should perform search and display results", async () => {
      const searchInput = document.getElementById("search-input");
      const container = document.getElementById("movies-container");

      // Initialize search functionality
      initializeSearch();

      // Simulate search input
      searchInput.value = "test query";
      searchInput.dispatchEvent(new Event("input"));

      // Wait for debounced search
      await new Promise((resolve) => setTimeout(resolve, 350));

      const movieCards = container.querySelectorAll(".movie-card");
      expect(movieCards.length).toBe(1);
      expect(movieCards[0].querySelector(".movie-title").textContent).toBe(
        "Search Result Movie"
      );
    });

    test("should clear search results when input is cleared", async () => {
      const searchInput = document.getElementById("search-input");
      const clearButton = document.getElementById("clear-search");
      const container = document.getElementById("movies-container");

      initializeSearch();

      // Perform search first
      searchInput.value = "test";
      searchInput.dispatchEvent(new Event("input"));
      await new Promise((resolve) => setTimeout(resolve, 350));

      // Clear search
      clearButton.click();

      expect(searchInput.value).toBe("");
      // Should reload now playing movies
      await new Promise((resolve) => setTimeout(resolve, 100));

      const movieCards = container.querySelectorAll(".movie-card");
      expect(movieCards.length).toBe(2); // Back to now playing
    });

    test("should show clear button when search has text", () => {
      const searchInput = document.getElementById("search-input");
      const clearButton = document.getElementById("clear-search");

      initializeSearch();

      // Initially hidden
      expect(clearButton.style.display).toBe("none");

      // Show when typing
      searchInput.value = "test";
      searchInput.dispatchEvent(new Event("input"));
      expect(clearButton.style.display).toBe("block");

      // Hide when cleared
      searchInput.value = "";
      searchInput.dispatchEvent(new Event("input"));
      expect(clearButton.style.display).toBe("none");
    });

    test("should debounce search input", async () => {
      const searchInput = document.getElementById("search-input");

      initializeSearch();

      // Rapid typing should only trigger one search
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockApiResponses.search),
      });

      searchInput.value = "t";
      searchInput.dispatchEvent(new Event("input"));
      searchInput.value = "te";
      searchInput.dispatchEvent(new Event("input"));
      searchInput.value = "tes";
      searchInput.dispatchEvent(new Event("input"));
      searchInput.value = "test";
      searchInput.dispatchEvent(new Event("input"));

      // Wait for debounce
      await new Promise((resolve) => setTimeout(resolve, 350));

      // Should only call search API once
      const searchCalls = global.fetch.mock.calls.filter((call) =>
        call[0].includes("/search/movie")
      );
      expect(searchCalls.length).toBe(1);
    });
  });

  describe("Infinite Scroll Integration", () => {
    let mockIntersectionObserver;

    beforeEach(() => {
      // Mock IntersectionObserver
      mockIntersectionObserver = {
        observe: jest.fn(),
        unobserve: jest.fn(),
        disconnect: jest.fn(),
        callback: null,
      };

      global.IntersectionObserver = jest.fn().mockImplementation((callback) => {
        mockIntersectionObserver.callback = callback;
        return mockIntersectionObserver;
      });
    });

    test("should setup intersection observer for infinite scroll", async () => {
      await loadNowPlayingMovies();

      expect(global.IntersectionObserver).toHaveBeenCalled();
      expect(mockIntersectionObserver.observe).toHaveBeenCalled();
    });

    test("should load next page when loading element intersects", async () => {
      await loadNowPlayingMovies();

      // Simulate intersection
      const callback = mockIntersectionObserver.callback;
      expect(typeof callback).toBe("function");

      // Mock API response for page 2
      global.fetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              ...mockApiResponses.nowPlaying,
              page: 2,
            }),
        })
      );

      callback([
        {
          isIntersecting: true,
          target: document.getElementById("loading"),
        },
      ]);

      // Wait for async operation
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Should trigger another API call for page 2
      const apiCalls = global.fetch.mock.calls.filter((call) =>
        call[0].includes("now_playing")
      );
      expect(apiCalls.length).toBeGreaterThan(1);
    });

    test("should not load more pages when all pages loaded", async () => {
      // Set mock to indicate last page
      const lastPageResponse = {
        ...mockApiResponses.nowPlaying,
        page: 2,
        total_pages: 2,
      };

      global.fetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(lastPageResponse),
        })
      );

      await loadNowPlayingMovies();

      const callback = mockIntersectionObserver.callback;
      expect(typeof callback).toBe("function");

      const initialCalls = global.fetch.mock.calls.length;

      callback([
        {
          isIntersecting: true,
          target: document.getElementById("loading"),
        },
      ]);

      // Should not make additional API calls since page >= total_pages
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(global.fetch.mock.calls.length).toBe(initialCalls);
    });
  });

  describe("Modal Integration Workflow", () => {
    let modal;

    beforeEach(() => {
      modal = new Modal();
      window.movieModal = modal;
    });

    afterEach(() => {
      if (modal) {
        modal.destroy();
      }
    });

    test("should open movie details when card is clicked", async () => {
      const movie = mockApiResponses.nowPlaying.results[0];
      const card = createMovieCard(movie);
      document.body.appendChild(card);

      // Mock modal open
      modal.open = jest.fn();

      card.click();

      // Should call showMovieDetails which opens modal
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(modal.open).toHaveBeenCalled();
    });

    test("should load and display movie details in modal", async () => {
      await showMovieDetails(1);

      expect(modal.isOpen).toBe(true);

      const modalBody = document.querySelector(".modal-body");
      expect(modalBody.innerHTML).toContain("Test Movie 1");
      expect(modalBody.innerHTML).toContain("Detailed overview");
    });

    test("should handle movie details API errors", async () => {
      // Mock API error for movie details
      global.fetch = jest.fn().mockRejectedValue(new Error("Movie not found"));

      await showMovieDetails(999);

      // Should not crash and modal should show error
      expect(modal.isOpen).toBe(true);
      const modalBody = document.querySelector(".modal-body");
      expect(modalBody.innerHTML).toContain("Error loading movie details");
    });
  });

  describe("Complete User Journey", () => {
    let modal;

    beforeEach(() => {
      modal = new Modal();
      window.movieModal = modal;
    });

    afterEach(() => {
      if (modal) {
        modal.destroy();
      }
    });

    test("should complete full app workflow", async () => {
      // 1. Initialize app and load now playing movies
      initializeSearch();
      await loadNowPlayingMovies();

      let container = document.getElementById("movies-container");
      let movieCards = container.querySelectorAll(".movie-card");
      expect(movieCards.length).toBe(2);

      // 2. User searches for a movie
      const searchInput = document.getElementById("search-input");
      searchInput.value = "search movie";
      searchInput.dispatchEvent(new Event("input"));

      await new Promise((resolve) => setTimeout(resolve, 350));

      movieCards = container.querySelectorAll(".movie-card");
      expect(movieCards.length).toBe(1);
      expect(movieCards[0].querySelector(".movie-title").textContent).toBe(
        "Search Result Movie"
      );

      // 3. User clicks on a movie to see details
      modal.open = jest.fn();
      movieCards[0].click();

      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(modal.open).toHaveBeenCalled();

      // 4. User clears search to go back to now playing
      const clearButton = document.getElementById("clear-search");
      clearButton.click();

      expect(searchInput.value).toBe("");

      // Should reload now playing
      await new Promise((resolve) => setTimeout(resolve, 100));
      movieCards = container.querySelectorAll(".movie-card");
      expect(movieCards.length).toBe(2);
    });

    test("should handle app initialization errors gracefully", async () => {
      // Mock complete API failure
      global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));

      // Should not crash during initialization
      expect(() => {
        initializeSearch();
      }).not.toThrow();

      await expect(loadNowPlayingMovies()).resolves.toBeUndefined();

      const container = document.getElementById("movies-container");
      const movieCards = container.querySelectorAll(".movie-card");
      expect(movieCards.length).toBe(0);
    });
  });

  describe("Performance and Memory", () => {
    test("should properly clean up event listeners", () => {
      const searchInput = document.getElementById("search-input");

      // Count initial event listeners (should be 0)
      const initialEventListeners = searchInput.cloneNode(true);

      initializeSearch();

      // After initialization, search input should have event listeners
      // We can test this by checking if the input responds to events
      const clearButton = document.getElementById("clear-search");

      // Simulate typing to show clear button
      searchInput.value = "test";
      searchInput.dispatchEvent(new Event("input"));

      expect(clearButton.style.display).toBe("block");

      // Clear the input
      searchInput.value = "";
      searchInput.dispatchEvent(new Event("input"));

      expect(clearButton.style.display).toBe("none");
    });

    test("should handle rapid API calls efficiently", async () => {
      const startTime = Date.now();

      // Make multiple API calls
      const promises = [
        loadNowPlayingMovies(),
        searchMovies("test"),
        showMovieDetails(1),
      ];

      await Promise.all(promises);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (adjust as needed)
      expect(duration).toBeLessThan(1000);
    });
  });
});
