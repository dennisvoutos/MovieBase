# MovieRama 🎬

A modern, client-side movie catalog application that allows users to discover movies, search through an extensive database, and explore detailed information about their favorite films.

## Overview

MovieRama is a single-page application built with vanilla JavaScript that provides an intuitive interface for browsing movies. The application leverages The Movie Database (TMDb) API to deliver real-time movie data including current theater releases, search capabilities, and comprehensive movie details.

## Features

### 🎭 In Theaters
- Browse movies currently playing in theaters
- Infinite scrolling for seamless browsing experience
- Display essential movie information:
  - Movie poster
  - Title and release year
  - Genre classification
  - User ratings (vote average)
  - Plot overview

### 🔍 Movie Search
- Real-time search functionality
- Search across extensive movie database including past and upcoming releases
- Infinite scrolling through search results
- Instant results as you type

### 📖 Movie Details
- Expandable movie cards with smooth animations
- Detailed movie information including:
  - Video trailers (when available)
  - User reviews (up to 2 featured reviews)
  - Similar movie recommendations
- In-place expansion to maintain user context

## Technical Implementation

### Core Technologies
- **HTML5** - Semantic markup and modern web standards
- **CSS3** - Modern styling with animations and responsive design
- **JavaScript (ES6+)** - Modern JavaScript features and APIs
- **TMDb API** - The Movie Database REST API for movie data

### Performance Features
- Infinite scrolling for optimal loading performance
- Lazy loading of movie posters
- Efficient API request management
- Smooth animations and transitions

### API Endpoints Used
- `/movie/now_playing` - Current theater releases
- `/genre/movie/list` - Movie genre classifications
- `/search/movie` - Movie search functionality
- `/movie/{movie_id}` - Detailed movie information
- `/movie/{movie_id}/videos` - Movie trailers and videos
- `/movie/{movie_id}/reviews` - User reviews
- `/movie/{movie_id}/similar` - Similar movie recommendations

## Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection for API requests

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/dennisvoutos/MovieBase.git
   cd MovieBase
   ```

2. Open `index.html` in your preferred web browser or serve through a local development server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```

3. Navigate to `http://localhost:8000` in your browser

### Configuration
The application uses The Movie Database (TMDb) API. The API key is included in the application for demonstration purposes. For production use, consider implementing proper API key management.

## Project Structure

```
MovieRama/
├── index.html          # Main HTML file
├── css/
│   ├── styles.css      # Main stylesheet
│   └── animations.css  # Animation definitions
├── js/
│   ├── app.js          # Main application logic
│   ├── api.js          # API integration
│   ├── components/     # Reusable components
│   └── utils/          # Utility functions
├── assets/
│   └── images/         # Static images and icons
└── README.md
```

## Usage

### Browsing Movies
- The homepage displays current theater releases
- Scroll down to automatically load more movies
- Each movie card shows essential information at a glance

### Searching for Movies
- Use the search box at the top of the page
- Start typing to see real-time results
- Scroll through search results to discover more movies

### Viewing Movie Details
- Click on any movie card to expand and view detailed information
- Watch trailers, read reviews, and discover similar movies
- Click again to collapse the expanded view

## Development

### Code Standards
- ES6+ JavaScript features
- Semantic HTML5 elements
- Modern CSS with Flexbox/Grid layouts
- Responsive design principles
- Clean, maintainable code structure

### Testing
The application includes comprehensive testing coverage:
- Unit tests for utility functions
- Integration tests for API interactions
- End-to-end tests for user workflows

To run tests:
```bash
npm test
```

## Browser Support
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [The Movie Database (TMDb)](https://www.themoviedb.org/) for providing the comprehensive movie API
- Movie poster images and data are provided by TMDb
- Icons and additional assets credited in respective files

## Contact

Dennis Voutos - [@dennisvoutos](https://github.com/dennisvoutos)

Project Link: [https://github.com/dennisvoutos/MovieBase](https://github.com/dennisvoutos/MovieBase)

---
