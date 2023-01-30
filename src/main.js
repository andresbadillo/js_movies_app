// TODO: borrar API_KEY
const API_KEY = '679bcfaabfe4159f4f33a99d1840f452';

const api = axios.create({
    baseURL: 'https://api.themoviedb.org/3/',
    headers: {
        'Content-Type': 'application/json;charset=utf-8',
    },
    params: {
        'api_key': API_KEY,
    }
});

// Observer
const lazyLoader = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            const url = entry.target.getAttribute('data-img');
            entry.target.setAttribute('src', url);
        }
    });
});

// Helpers
function createMovies(movies, container, lazyLoad = false) {
    container.innerHTML = '';

    movies.forEach(movie => {
        const movieContainer = document.createElement('div');
        movieContainer.classList.add('movie-container');
        movieContainer.addEventListener('click', () => {
            location.hash= 'movie=' + movie.id;
        });

        const movieImg = document.createElement('img');
        movieImg.classList.add('movie-img');
        movieImg.setAttribute('alt', movie.title);
        movieImg.setAttribute(
            lazyLoad ? 'data-img' : 'src',
            'https://image.tmdb.org/t/p/w300/' + movie.poster_path
        );
        movieImg.addEventListener('error', () => {
            movieImg.setAttribute('src', 'https://via.placeholder.com/300x450/3a6aad/ffffff?text=No image');
        });

        if (lazyLoad) {
            lazyLoader.observe(movieImg);
        }

        movieContainer.appendChild(movieImg);
        container.appendChild(movieContainer);
    });
}

function createCategories(categories, container) {
    container.innerHTML = '';

    categories.forEach(category => {
        const categoryContainer = document.createElement('div');
        categoryContainer.classList.add('category-container');

        const categoryTitle = document.createElement('h3');
        categoryTitle.classList.add('category-title');
        categoryTitle.setAttribute('id', 'id' + category.id);
        categoryTitle.addEventListener('click', () => {
            location.hash = `#category=${category.id}-${category.name}`;
        });
        const categoryTitleText = document.createTextNode(category.name);

        categoryTitle.appendChild(categoryTitleText);
        categoryContainer.appendChild(categoryTitle);
        container.appendChild(categoryContainer);
    });
}

/* Consulta API - Peliculas en tendencia Preview */
async function getTrendingMoviesPreview() {
    const { data } = await api('trending/movie/day');
    const movies = data.results;
    console.log(movies);

    createMovies(movies, trendingMoviesPreviewList, true);
}

/* Consulta API - Categorias */
async function getCategoriesPreview() {
    const { data } = await api('genre/movie/list');
    const categories = data.genres;

    createCategories(categories, categoriesPreviewList);
}

/* Consulta API - Peliculas por categoria */
async function getMoviesByCategory(id) {
    const { data } = await api('/discover/movie', {
        params: {
            with_genres: id,
        },
    });
    const movies = data.results;

    createMovies(movies, genericSection, true);
}

/* Consulta API - Busqueda palabra */
async function getMoviesBySearch(query) {
    const { data } = await api('/search/movie', {
        params: {
            query: query,
        },
    });
    const movies = data.results;

    createMovies(movies, genericSection);
}

/* Consulta API - Peliculas en tendencia */
async function getTrendingMovies() {
    const { data } = await api('trending/movie/day');
    const movies = data.results;

    createMovies(movies, genericSection, true);
}

/* Consulta API - Detalle de pelicula por id */
async function getMovieById(id) {
    const { data: movie } = await api('/movie/' + id);

    const movieImgUrl = 'https://image.tmdb.org/t/p/w500/' + movie.poster_path;
    headerSection.style.background = `
        linear-gradient(180deg, rgba(0, 0, 0, 0.35) 19.27%, rgba(0, 0, 0, 0) 29.17%),
        url(${movieImgUrl})
    `;

    movieDetailTitle.textContent = movie.title;
    movieDetailDescription.textContent = movie.overview;
    movieDetailScore.textContent = movie.vote_average.toFixed(1);

    createCategories(movie.genres, movieDetailCategoriesList);

    getRelatedMoviesById(id);
}

/* Consulta API - Peliculas relacionadas por id */
async function getRelatedMoviesById(id) {
    const { data } = await api(`/movie/${id}/similar`);
    const relatedMovies = data.results;

    createMovies(relatedMovies, relatedMoviesContainer);

    relatedMoviesContainer.scrollTo(0, 0);
}

// getTrendingMoviesPreview();
// getCategoriesPreview();