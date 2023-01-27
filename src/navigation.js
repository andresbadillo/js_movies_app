window.addEventListener('DOMContentLoaded', navigator, false);
window.addEventListener('hashchange', navigator, false);

function navigator() {
    console.log({location});

    if (location.hash.startsWith('#trends')) {
        trendsPage()
    } else if (location.hash.startsWith('#search=')) {
        searchPage();
    } else if (location.hash.startsWith('#movie=')) {
        movieDetailsPage();
    } else if (location.hash.startsWith('#category=')) {
        categoriesPage();
    } else {
        homePage();
    }
}

function homePage() {
    console.log('HOME');
}

function categoriesPage() {
    console.log('CATEGORIES');
}

function movieDetailsPage() {
    console.log('MOVIE_DETAILS');
}

function searchPage() {
    console.log('SEARCH');
}

function trendsPage() {
    console.log('TRENDS');
}

