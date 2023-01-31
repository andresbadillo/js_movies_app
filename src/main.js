// Data

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

function likedMoviesList() {
    const item = JSON.parse(localStorage.getItem('liked_movies'));
    let movies;
    
    item ? movies = item : movies = {};

    return movies;
}

function likeMovie(movie) {
    const likedMovies = likedMoviesList();

    if (likedMovies[movie.id]) {
        likedMovies[movie.id] = undefined;
    } else {
        likedMovies[movie.id] = movie;
    }

    localStorage.setItem('liked_movies', JSON.stringify(likedMovies));
}

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
function createMovies(movies, container, {lazyLoad = false, clean = true} = {},) {
    if (clean) {
        container.innerHTML = '';  
    }
    
    movies.forEach(movie => {
        const movieContainer = document.createElement('div');
        movieContainer.classList.add('movie-container');

        const movieImg = document.createElement('img');
        movieImg.classList.add('movie-img');
        movieImg.setAttribute('alt', movie.title);
        movieImg.setAttribute(
            lazyLoad ? 'data-img' : 'src',
            'https://image.tmdb.org/t/p/w300/' + movie.poster_path
        );
        movieImg.addEventListener('click', () => {
            location.hash= 'movie=' + movie.id;
        });
        movieImg.addEventListener('error', () => {
            movieImg.setAttribute('src', 'https://via.placeholder.com/300x450/3a6aad/ffffff?text=No image');
        });

        const movieBtn = document.createElement('button');
        movieBtn.classList.add('movie-btn');
        likedMoviesList()[movie.id] && movieBtn.classList.add('movie-btn--liked');
        movieBtn.addEventListener('click', () => {
            movieBtn.classList.toggle('movie-btn--liked');
            likeMovie(movie);
            getLikedMovies();
            getTrendingMoviesPreview();
        });

        if (lazyLoad) {
            lazyLoader.observe(movieImg);
        };

        movieContainer.appendChild(movieImg);
        movieContainer.appendChild(movieBtn);
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

    createMovies(movies, trendingMoviesPreviewList, {lazyLoad: true, clean: true});
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
    maxPage = data.total_pages;

    createMovies(movies, genericSection, {lazyLoad: true, clean: true});
}

function getPaginatedMoviesByCategory(id) {
    return async function() {
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        const scrollBottom = (scrollTop + clientHeight) >= (scrollHeight -15);

        const pageIsNotMax = page < maxPage;

        if (scrollBottom && pageIsNotMax) {
            const { data } = await api('/discover/movie', {
                params: {
                    with_genres: id,
                    page: page++,
                },
            });
            const movies = data.results;
        
            createMovies(movies, genericSection, {lazyLoad: true, clean: false});    
        };
    };
}

/* Consulta API - Busqueda por palabra */
async function getMoviesBySearch(query) {
    const { data } = await api('/search/movie', {
        params: {
            query,
        },
    });
    const movies = data.results;
    maxPage = data.total_pages;

    createMovies(movies, genericSection, {lazyLoad: true, clean: true});
}

function getPaginatedMoviesBySearch(query) {
    return async function() {
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        const scrollBottom = (scrollTop + clientHeight) >= (scrollHeight -15);

        const pageIsNotMax = page < maxPage;

        if (scrollBottom && pageIsNotMax) {
            const { data } = await api('/search/movie', {
                params: {
                    query: query,
                    page: page++,
                },
            });
            const movies = data.results;
        
            createMovies(movies, genericSection, {lazyLoad: true, clean: false});    
        };
    };
}

/* Consulta API - Peliculas en tendencia */
async function getTrendingMovies() {
    const { data } = await api('trending/movie/day');
    const movies = data.results;
    maxPage = data.total_pages;

    createMovies(movies, genericSection, {lazyLoad: true, clean: true});

    // const btnLoadMore = document.createElement('button');
    // btnLoadMore.innerText = 'More...'
    // btnLoadMore.addEventListener('click', getPaginatedTrendingMovies)
    // genericSection.appendChild(btnLoadMore);
}

async function getPaginatedTrendingMovies() {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    const scrollBottom = (scrollTop + clientHeight) >= (scrollHeight -15);

    const pageIsNotMax = page < maxPage;

    if (scrollBottom && pageIsNotMax) {
        const { data } = await api('trending/movie/day', {
            params: {
                page: page++,
            },
        });
        const movies = data.results;
    
        createMovies(movies, genericSection, {lazyLoad: true, clean: false});    
    }

    // const btnLoadMore = document.createElement('button');
    // btnLoadMore.innerText = 'More...'
    // btnLoadMore.addEventListener('click', getPaginatedTrendingMovies)
    // genericSection.appendChild(btnLoadMore);
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

function getLikedMovies() {
    const likedMovies = likedMoviesList();
    const moviesArray = Object.values(likedMovies);

    createMovies(moviesArray, likedMoviesContainer, {lazyLoad: true, clean: true});

    if (moviesArray.length >= 1) {
        console.log('Hay favoritos');
        likedMoviesContainer.classList.remove('inactive');
    } else {
        console.log('No hay favoritos');
        likedMoviesContainer.classList.add('inactive');
    }

    // createMovies(moviesArray, likedMoviesContainer, {lazyLoad: true, clean: true});
}

// getTrendingMoviesPreview();
// getCategoriesPreview();