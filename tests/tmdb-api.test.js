/**
 * @jest-environment jsdom
 */

/**
 * TMDb API Tests
 * Tests for the TMDb API integration functions
 */

describe("TMDb API", () => {
  const API_BASE_URL = "https://api.themoviedb.org/3";
  const API_TOKEN = "test-bearer-token";

  // Helper functions to test
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

  const getMovieDetails = async (movieId) => {
    const url = buildApiUrl(`/movie/${movieId}`);
    return makeApiRequest(url);
  };

  const getMovieVideos = async (movieId) => {
    const url = buildApiUrl(`/movie/${movieId}/videos`);
    return makeApiRequest(url);
  };

  const getMovieReviews = async (movieId, page = 1) => {
    const url = buildApiUrl(`/movie/${movieId}/reviews`, { page });
    return makeApiRequest(url);
  };

  const getSimilarMovies = async (movieId, page = 1) => {
    const url = buildApiUrl(`/movie/${movieId}/similar`, { page });
    return makeApiRequest(url);
  };

  beforeEach(() => {
    fetch.mockClear();
  });

  describe("URL Building", () => {
    test("should build basic API URL", () => {
      const url = buildApiUrl("/movie/now_playing");
      expect(url).toBe(`${API_BASE_URL}/movie/now_playing`);
    });

    test("should handle endpoint without leading slash", () => {
      const url = buildApiUrl("movie/now_playing");
      expect(url).toBe(`${API_BASE_URL}/movie/now_playing`);
    });

    test("should build URL with query parameters", () => {
      const url = buildApiUrl("/search/movie", { query: "Avengers", page: 2 });
      expect(url).toContain("query=Avengers");
      expect(url).toContain("page=2");
    });

    test("should handle special characters in query", () => {
      const url = buildApiUrl("/search/movie", { query: "Fast & Furious" });
      expect(url).toContain("Fast%20%26%20Furious");
    });

    test("should ignore null and undefined parameters", () => {
      const url = buildApiUrl("/search/movie", {
        query: "test",
        page: null,
        include_adult: undefined,
      });
      expect(url).toContain("query=test");
      expect(url).not.toContain("page=");
      expect(url).not.toContain("include_adult=");
    });
  });

  describe("API Request Helper", () => {
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

  describe("Now Playing Movies", () => {
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

    test("should fetch specific page", async () => {
      const mockResponse = { page: 3, results: [] };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await getNowPlayingMovies(3);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("page=3"),
        expect.any(Object)
      );
    });
  });

  describe("Movie Search", () => {
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

    test("should handle empty search results", async () => {
      const mockResponse = {
        page: 1,
        results: [],
        total_pages: 0,
        total_results: 0,
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await searchMovies("nonexistentmovie123");
      expect(result.results).toHaveLength(0);
    });
  });

  describe("Movie Details", () => {
    test("should fetch movie details", async () => {
      const mockResponse = {
        id: 550,
        title: "Fight Club",
        overview: "An insomniac office worker...",
        release_date: "1999-10-15",
        runtime: 139,
        vote_average: 8.8,
        genres: [{ id: 18, name: "Drama" }],
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getMovieDetails(550);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/movie/550"),
        expect.any(Object)
      );
      expect(result).toEqual(mockResponse);
    });

    test("should handle movie not found", async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: "Not Found",
      });

      await expect(getMovieDetails(999999)).rejects.toThrow();
    });
  });

  describe("Movie Videos", () => {
    test("should fetch movie videos", async () => {
      const mockResponse = {
        id: 550,
        results: [
          {
            id: "533ec654c3a36854480003eb",
            key: "SUXWAEX2jlg",
            name: "Fight Club | #TBT Trailer",
            site: "YouTube",
            type: "Trailer",
          },
        ],
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getMovieVideos(550);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/movie/550/videos"),
        expect.any(Object)
      );
      expect(result.results).toHaveLength(1);
      expect(result.results[0].type).toBe("Trailer");
    });
  });

  describe("Movie Reviews", () => {
    test("should fetch movie reviews", async () => {
      const mockResponse = {
        id: 550,
        page: 1,
        results: [
          {
            id: "5da1b9d60e0a78001e0c87b6",
            author: "John Doe",
            content: "Amazing movie...",
            created_at: "2019-10-12T17:00:50.450Z",
          },
        ],
        total_pages: 1,
        total_results: 1,
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getMovieReviews(550);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/movie/550/reviews"),
        expect.any(Object)
      );
      expect(result.results).toHaveLength(1);
      expect(result.results[0].author).toBe("John Doe");
    });
  });

  describe("Similar Movies", () => {
    test("should fetch similar movies", async () => {
      const mockResponse = {
        page: 1,
        results: [
          { id: 807, title: "Se7en", release_date: "1995-09-22" },
          { id: 155, title: "The Dark Knight", release_date: "2008-07-18" },
        ],
        total_pages: 3,
        total_results: 60,
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getSimilarMovies(550);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/movie/550/similar"),
        expect.any(Object)
      );
      expect(result.results).toHaveLength(2);
    });
  });

  describe("Error Handling", () => {
    test("should handle rate limiting", async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: "Too Many Requests",
      });

      await expect(searchMovies("test")).rejects.toThrow(
        "429 Too Many Requests"
      );
    });

    test("should handle server errors", async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      });

      await expect(getMovieDetails(1)).rejects.toThrow(
        "500 Internal Server Error"
      );
    });

    test("should handle authentication errors", async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
      });

      await expect(getNowPlayingMovies()).rejects.toThrow("401 Unauthorized");
    });
  });
});
