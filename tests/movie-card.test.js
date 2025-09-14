/**
 * @jest-environment jsdom
 */

/**
 * Movie Card Component Tests
 * Tests for movie card creation and interaction functionality
 */

describe("Movie Card Component", () => {
  // Mock genres data
  const mockGenres = {
    28: "Action",
    12: "Adventure",
    16: "Animation",
    35: "Comedy",
    80: "Crime",
    18: "Drama",
    14: "Fantasy",
    27: "Horror",
    10402: "Music",
    9648: "Mystery",
    10749: "Romance",
    878: "Science Fiction",
    10770: "TV Movie",
    53: "Thriller",
    10752: "War",
    37: "Western",
  };

  // Sample movie data for testing
  const mockMovie = {
    id: 550,
    title: "Fight Club",
    poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
    release_date: "1999-10-15",
    vote_average: 8.8,
    genre_ids: [18, 53],
    overview:
      "A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy.",
  };

  const mockMovieNoPoster = {
    id: 551,
    title: "Test Movie No Poster",
    poster_path: null,
    release_date: "2020-01-01",
    vote_average: 7.5,
    genre_ids: [35],
    overview: "A test movie without a poster image.",
  };

  const mockMovieNoData = {
    id: 552,
    title: "Minimal Movie",
    poster_path: null,
    release_date: null,
    vote_average: null,
    genre_ids: null,
    overview: null,
  };

  // Helper function to create movie card (simulating the actual function)
  const createMovieCard = (movie, genres = mockGenres) => {
    const card = document.createElement("div");
    card.className = "movie-card";
    card.setAttribute("data-movie-id", movie.id);

    const posterUrl = movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : "assets/no-poster.jpg";

    const releaseYear = movie.release_date
      ? new Date(movie.release_date).getFullYear()
      : "N/A";

    const genreNames =
      movie.genre_ids
        ?.map((id) => genres[id])
        .filter(Boolean)
        .join(", ") || "Unknown";

    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A";

    const truncateText = (text, length) => {
      if (!text || text.length <= length) return text || "";
      return text.substring(0, length).trim() + "...";
    };

    card.innerHTML = `
      <div class="movie-poster">
        <img src="${posterUrl}" alt="${movie.title}" loading="lazy">
        <div class="movie-rating">${rating}</div>
      </div>
      <div class="movie-info">
        <h3 class="movie-title">${movie.title}</h3>
        <p class="movie-year">${releaseYear}</p>
        <p class="movie-genres">${genreNames}</p>
        <p class="movie-overview">${truncateText(movie.overview, 120)}</p>
      </div>
    `;

    return card;
  };

  beforeEach(() => {
    document.body.innerHTML = "";
  });

  describe("Movie Card Creation", () => {
    test("should create movie card with all required elements", () => {
      const card = createMovieCard(mockMovie);

      expect(card).toBeTruthy();
      expect(card.classList.contains("movie-card")).toBe(true);
      expect(card.getAttribute("data-movie-id")).toBe("550");

      // Check for all required elements
      const poster = card.querySelector(".movie-poster");
      const image = card.querySelector(".movie-poster img");
      const rating = card.querySelector(".movie-rating");
      const info = card.querySelector(".movie-info");
      const title = card.querySelector(".movie-title");
      const year = card.querySelector(".movie-year");
      const genres = card.querySelector(".movie-genres");
      const overview = card.querySelector(".movie-overview");

      expect(poster).toBeTruthy();
      expect(image).toBeTruthy();
      expect(rating).toBeTruthy();
      expect(info).toBeTruthy();
      expect(title).toBeTruthy();
      expect(year).toBeTruthy();
      expect(genres).toBeTruthy();
      expect(overview).toBeTruthy();
    });

    test("should display correct movie information", () => {
      const card = createMovieCard(mockMovie);

      const title = card.querySelector(".movie-title");
      const year = card.querySelector(".movie-year");
      const rating = card.querySelector(".movie-rating");
      const genres = card.querySelector(".movie-genres");

      expect(title.textContent).toBe("Fight Club");
      expect(year.textContent).toBe("1999");
      expect(rating.textContent).toBe("8.8");
      expect(genres.textContent).toBe("Drama, Thriller");
    });

    test("should use correct poster URL when poster_path exists", () => {
      const card = createMovieCard(mockMovie);
      const image = card.querySelector(".movie-poster img");

      expect(image.src).toBe(
        "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg"
      );
      expect(image.alt).toBe("Fight Club");
      expect(image.getAttribute("loading")).toBe("lazy");
    });

    test("should use placeholder when poster_path is null", () => {
      const card = createMovieCard(mockMovieNoPoster);
      const image = card.querySelector(".movie-poster img");

      expect(image.src).toContain("assets/no-poster.jpg");
    });

    test("should handle missing release date", () => {
      const card = createMovieCard(mockMovieNoData);
      const year = card.querySelector(".movie-year");

      expect(year.textContent).toBe("N/A");
    });

    test("should handle missing vote average", () => {
      const card = createMovieCard(mockMovieNoData);
      const rating = card.querySelector(".movie-rating");

      expect(rating.textContent).toBe("N/A");
    });

    test("should handle missing genres", () => {
      const card = createMovieCard(mockMovieNoData);
      const genres = card.querySelector(".movie-genres");

      expect(genres.textContent).toBe("Unknown");
    });

    test("should handle missing overview", () => {
      const card = createMovieCard(mockMovieNoData);
      const overview = card.querySelector(".movie-overview");

      expect(overview.textContent).toBe("");
    });
  });

  describe("Genre Mapping", () => {
    test("should map genre IDs to names correctly", () => {
      const movie = {
        ...mockMovie,
        genre_ids: [28, 12, 878], // Action, Adventure, Science Fiction
      };
      const card = createMovieCard(movie);
      const genres = card.querySelector(".movie-genres");

      expect(genres.textContent).toBe("Action, Adventure, Science Fiction");
    });

    test("should filter out unknown genre IDs", () => {
      const movie = {
        ...mockMovie,
        genre_ids: [28, 99999, 12], // Action, Unknown, Adventure
      };
      const card = createMovieCard(movie);
      const genres = card.querySelector(".movie-genres");

      expect(genres.textContent).toBe("Action, Adventure");
    });

    test("should handle empty genre_ids array", () => {
      const movie = {
        ...mockMovie,
        genre_ids: [],
      };
      const card = createMovieCard(movie);
      const genres = card.querySelector(".movie-genres");

      expect(genres.textContent).toBe("Unknown");
    });
  });

  describe("Text Truncation", () => {
    test("should truncate long overview text", () => {
      const longOverview =
        "This is a very long movie overview that should be truncated because it exceeds the maximum character limit that we have set for the movie card display. This text should be cut off at exactly 120 characters and have ellipsis added.";

      const movie = {
        ...mockMovie,
        overview: longOverview,
      };

      const card = createMovieCard(movie);
      const overview = card.querySelector(".movie-overview");

      expect(overview.textContent).toHaveLength(123); // 120 + '...'
      expect(overview.textContent).toEndWith("...");
      expect(overview.textContent).toContain(
        "This is a very long movie overview"
      );
    });

    test("should not truncate short overview text", () => {
      const shortOverview = "Short overview.";

      const movie = {
        ...mockMovie,
        overview: shortOverview,
      };

      const card = createMovieCard(movie);
      const overview = card.querySelector(".movie-overview");

      expect(overview.textContent).toBe("Short overview.");
      expect(overview.textContent).not.toContain("...");
    });

    test("should handle overview with exactly 120 characters", () => {
      const exactOverview = "A".repeat(120);

      const movie = {
        ...mockMovie,
        overview: exactOverview,
      };

      const card = createMovieCard(movie);
      const overview = card.querySelector(".movie-overview");

      expect(overview.textContent).toBe(exactOverview);
      expect(overview.textContent).not.toContain("...");
    });
  });

  describe("Rating Display", () => {
    test("should format rating to one decimal place", () => {
      const movie = {
        ...mockMovie,
        vote_average: 7.555,
      };

      const card = createMovieCard(movie);
      const rating = card.querySelector(".movie-rating");

      expect(rating.textContent).toBe("7.6");
    });

    test("should handle zero rating", () => {
      const movie = {
        ...mockMovie,
        vote_average: 0,
      };

      const card = createMovieCard(movie);
      const rating = card.querySelector(".movie-rating");

      expect(rating.textContent).toBe("0.0");
    });

    test("should handle high rating", () => {
      const movie = {
        ...mockMovie,
        vote_average: 10.0,
      };

      const card = createMovieCard(movie);
      const rating = card.querySelector(".movie-rating");

      expect(rating.textContent).toBe("10.0");
    });
  });

  describe("Card Structure and Classes", () => {
    test("should have correct CSS classes", () => {
      const card = createMovieCard(mockMovie);

      expect(card.classList.contains("movie-card")).toBe(true);

      const poster = card.querySelector(".movie-poster");
      const image = card.querySelector("img");
      const rating = card.querySelector(".movie-rating");
      const info = card.querySelector(".movie-info");
      const title = card.querySelector(".movie-title");
      const year = card.querySelector(".movie-year");
      const genres = card.querySelector(".movie-genres");
      const overview = card.querySelector(".movie-overview");

      expect(poster.classList.contains("movie-poster")).toBe(true);
      expect(rating.classList.contains("movie-rating")).toBe(true);
      expect(info.classList.contains("movie-info")).toBe(true);
      expect(title.classList.contains("movie-title")).toBe(true);
      expect(year.classList.contains("movie-year")).toBe(true);
      expect(genres.classList.contains("movie-genres")).toBe(true);
      expect(overview.classList.contains("movie-overview")).toBe(true);
    });

    test("should have proper HTML structure", () => {
      const card = createMovieCard(mockMovie);

      // Check hierarchical structure
      const poster = card.querySelector(".movie-poster");
      const info = card.querySelector(".movie-info");

      expect(card.children).toHaveLength(2);
      expect(card.children[0]).toBe(poster);
      expect(card.children[1]).toBe(info);

      // Check poster children
      expect(poster.children).toHaveLength(2);
      expect(poster.querySelector("img")).toBeTruthy();
      expect(poster.querySelector(".movie-rating")).toBeTruthy();

      // Check info children
      expect(info.children).toHaveLength(4);
      expect(info.querySelector(".movie-title")).toBeTruthy();
      expect(info.querySelector(".movie-year")).toBeTruthy();
      expect(info.querySelector(".movie-genres")).toBeTruthy();
      expect(info.querySelector(".movie-overview")).toBeTruthy();
    });
  });

  describe("Data Attributes", () => {
    test("should set correct data-movie-id attribute", () => {
      const card = createMovieCard(mockMovie);

      expect(card.hasAttribute("data-movie-id")).toBe(true);
      expect(card.getAttribute("data-movie-id")).toBe("550");
    });

    test("should handle string movie ID", () => {
      const movie = {
        ...mockMovie,
        id: "123",
      };

      const card = createMovieCard(movie);

      expect(card.getAttribute("data-movie-id")).toBe("123");
    });
  });

  describe("Accessibility", () => {
    test("should have proper alt text for images", () => {
      const card = createMovieCard(mockMovie);
      const image = card.querySelector("img");

      expect(image.hasAttribute("alt")).toBe(true);
      expect(image.getAttribute("alt")).toBe("Fight Club");
    });

    test("should have proper image loading attribute", () => {
      const card = createMovieCard(mockMovie);
      const image = card.querySelector("img");

      expect(image.getAttribute("loading")).toBe("lazy");
    });

    test("should have semantic HTML structure", () => {
      const card = createMovieCard(mockMovie);
      const title = card.querySelector("h3");

      expect(title).toBeTruthy();
      expect(title.classList.contains("movie-title")).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    test("should handle movie with no title", () => {
      const movie = {
        ...mockMovie,
        title: "",
      };

      const card = createMovieCard(movie);
      const title = card.querySelector(".movie-title");

      expect(title.textContent).toBe("");
    });

    test("should handle very long movie title", () => {
      const movie = {
        ...mockMovie,
        title:
          "This is an extremely long movie title that might cause layout issues if not handled properly",
      };

      const card = createMovieCard(movie);
      const title = card.querySelector(".movie-title");

      expect(title.textContent).toBe(movie.title);
    });

    test("should handle future release date", () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      const movie = {
        ...mockMovie,
        release_date: futureDate.toISOString().split("T")[0],
      };

      const card = createMovieCard(movie);
      const year = card.querySelector(".movie-year");

      expect(year.textContent).toBe(futureDate.getFullYear().toString());
    });

    test("should handle invalid date format", () => {
      const movie = {
        ...mockMovie,
        release_date: "invalid-date",
      };

      const card = createMovieCard(movie);
      const year = card.querySelector(".movie-year");

      expect(year.textContent).toBe("NaN");
    });
  });
});
