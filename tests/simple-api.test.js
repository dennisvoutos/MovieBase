/**
 * API Tests - TMDb Integration with Jest
 * Simple test to demonstrate Jest is working properly
 */

describe("API Integration with Jest", () => {
  beforeEach(() => {
    // Reset fetch mock before each test
    fetch.mockClear();
  });

  describe("Basic Jest Setup", () => {
    test("Jest is working correctly", () => {
      expect(true).toBe(true);
    });

    test("can mock fetch globally", () => {
      expect(fetch).toBeDefined();
      expect(jest.isMockFunction(fetch)).toBe(true);
    });

    test("can create mock functions", () => {
      const mockFn = jest.fn();
      mockFn("test");
      expect(mockFn).toHaveBeenCalledWith("test");
    });
  });

  describe("API URL Building", () => {
    const API_BASE_URL = "https://api.themoviedb.org/3";

    const buildApiUrl = (endpoint, params = {}) => {
      const url = new URL(
        endpoint.startsWith("/") ? endpoint.slice(1) : endpoint,
        API_BASE_URL
      );
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value);
        }
      });
      return url.toString();
    };

    test("should build basic API URL", () => {
      const url = buildApiUrl("/movie/now_playing");
      expect(url).toBe(`${API_BASE_URL}/movie/now_playing`);
    });

    test("should handle query parameters", () => {
      const url = buildApiUrl("/search/movie", { query: "Avengers", page: 2 });
      expect(url).toContain("query=Avengers");
      expect(url).toContain("page=2");
    });

    test("should encode special characters", () => {
      const url = buildApiUrl("/search/movie", { query: "Fast & Furious" });
      expect(url).toContain("Fast%20%26%20Furious");
    });
  });

  describe("Mock API Requests", () => {
    const API_TOKEN = "test-bearer-token";

    const makeApiRequest = async (url) => {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `API request failed: ${response.status} ${response.statusText}`
        );
      }

      return response.json();
    };

    test("should make request with correct headers", async () => {
      const mockResponse = { results: [], page: 1 };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await makeApiRequest("https://api.example.com/test");

      expect(fetch).toHaveBeenCalledWith("https://api.example.com/test", {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          Accept: "application/json",
        },
      });
    });

    test("should return JSON response", async () => {
      const mockResponse = { results: [{ id: 1, title: "Test Movie" }] };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await makeApiRequest("https://api.example.com/test");
      expect(result).toEqual(mockResponse);
    });

    test("should throw error for failed requests", async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: "Not Found",
      });

      await expect(
        makeApiRequest("https://api.example.com/test")
      ).rejects.toThrow("API request failed: 404 Not Found");
    });

    test("should handle network errors", async () => {
      fetch.mockRejectedValueOnce(new Error("Network error"));

      await expect(
        makeApiRequest("https://api.example.com/test")
      ).rejects.toThrow("Network error");
    });
  });

  describe("Movie API Functions", () => {
    const API_BASE_URL = "https://api.themoviedb.org/3";
    const API_TOKEN = "test-bearer-token";

    const buildApiUrl = (endpoint, params = {}) => {
      const url = new URL(
        endpoint.startsWith("/") ? endpoint.slice(1) : endpoint,
        API_BASE_URL
      );
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value);
        }
      });
      return url.toString();
    };

    const makeApiRequest = async (url) => {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `API request failed: ${response.status} ${response.statusText}`
        );
      }

      return response.json();
    };

    const getNowPlayingMovies = async (page = 1) => {
      const url = buildApiUrl("/movie/now_playing", { page });
      return makeApiRequest(url);
    };

    const searchMovies = async (query, page = 1) => {
      const url = buildApiUrl("/search/movie", { query, page });
      return makeApiRequest(url);
    };

    test("should fetch now playing movies", async () => {
      const mockResponse = {
        page: 1,
        results: [
          { id: 1, title: "Movie 1", release_date: "2023-01-01" },
          { id: 2, title: "Movie 2", release_date: "2023-01-02" },
        ],
        total_pages: 5,
        total_results: 100,
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getNowPlayingMovies();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/movie/now_playing"),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${API_TOKEN}`,
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    test("should search for movies", async () => {
      const mockResponse = {
        page: 1,
        results: [{ id: 550, title: "Fight Club", release_date: "1999-10-15" }],
        total_pages: 1,
        total_results: 1,
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await searchMovies("Fight Club");

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/search/movie"),
        expect.any(Object)
      );
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("query=Fight%20Club"),
        expect.any(Object)
      );
      expect(result).toEqual(mockResponse);
    });

    test("should handle API errors", async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      });

      await expect(getNowPlayingMovies()).rejects.toThrow(
        "500 Internal Server Error"
      );
    });

    test("should handle authentication errors", async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
      });

      await expect(searchMovies("test")).rejects.toThrow("401 Unauthorized");
    });
  });
});
