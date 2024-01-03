import request from 'supertest';
import { expectListOfMovies, expectObjectToBeAMovie, url } from './common';

it('/movies GET - should return a random movie', () => {
  return request(url).get('/movies')
    .expect(200)
    .expect('Content-Type', /json/)
    .expect((res) => {
      expectObjectToBeAMovie(res.body);
    });
});

function expectRuntimesInBounds(list: any, min: number, max: number) {
  const runtimes = list.map((movie) => movie.runtime);
  const runtimesOutOfBound = runtimes.filter((runtime) => runtime < min || runtime > max);
  expect(runtimesOutOfBound).toEqual([]);
}

function expectMoviesToHaveSpecifiedGenres(movies: any[], specifiedGenres: string[]) {
  
  const invalidMovies = movies.filter(lacksSpecifiedGenre);
  const mappedInvalidMovies = invalidMovies.map((movie) => { return { title: movie.title, genres: movie.genres } });
  expect(mappedInvalidMovies).toEqual([]);

  function lacksSpecifiedGenre(movie: any) {
    return specifiedGenres.every((genre) => !movie.genres.includes(genre));
  }
}

it('/movies GET - should return a random movie with duration=100', () => {
  return request(url).get('/movies?duration=100')
    .expect(200)
    .expect('Content-Type', /json/)
    .expect((res) => {
      expectObjectToBeAMovie(res.body);
      expectRuntimesInBounds([res.body], 90, 110);
    });
});

it('/movies GET - should return a random movie with duration=115', () => {
  return request(url).get('/movies?duration=115')
    .expect(200)
    .expect('Content-Type', /json/)
    .expect((res) => {
      expectObjectToBeAMovie(res.body);
      expectRuntimesInBounds([res.body], 105, 125);
    });
});

it('/movies GET - should return movies with duration=115 and genres=Animation', () => {
  return request(url).get('/movies?duration=115&genres=Animation')
    .expect(200)
    .expect('Content-Type', /json/)
    .expect((res) => {
      expectListOfMovies(res.body);
      expectRuntimesInBounds(res.body, 105, 125);
      expectMoviesToHaveSpecifiedGenres(res.body, ['Animation']);
    });
});

it('/movies GET - should return movies with genres=Animation', () => {
  return request(url).get('/movies?genres=Animation')
    .expect(200)
    .expect('Content-Type', /json/)
    .expect((res) => {
      expectListOfMovies(res.body);
      const moviesShorterThan105 = res.body.filter((movie) => movie.runtime < 105);
      expect(moviesShorterThan105.length).toBeGreaterThan(0);
      expectMoviesToHaveSpecifiedGenres(res.body, ['Animation']);
    });
});

function expectMoviesInOrderOfNumberOfGenreMatches(movies: any[], genres: string[]) {
  const moviesWithNumberOfGenreMatches = movies.map((movie) => {
    const numberOfGenreMatches = movie.genres.filter((genre) => genres.includes(genre)).length;
    return { title: movie.title, numberOfGenreMatches };
  });
  const sortedMovies = [...moviesWithNumberOfGenreMatches].sort((a, b) => b.numberOfGenreMatches - a.numberOfGenreMatches);
  
  expect(moviesWithNumberOfGenreMatches.length).toBeGreaterThan(0);
  const lastNumberOfMatches = moviesWithNumberOfGenreMatches[moviesWithNumberOfGenreMatches.length-1].numberOfGenreMatches;
  const firstNumberOfMatches = moviesWithNumberOfGenreMatches[0].numberOfGenreMatches;
  expect(firstNumberOfMatches).toBeGreaterThan(lastNumberOfMatches);
  expect(lastNumberOfMatches).toBeGreaterThan(0);
  expect(moviesWithNumberOfGenreMatches).toEqual(sortedMovies);
}

it('/movies GET - should return movies with genres=Animation,Comedy,Thriller', () => {
  return request(url).get('/movies?genres=Animation,Comedy,Thriller')
    .expect(200)
    .expect('Content-Type', /json/)
    .expect((res) => {
      expectListOfMovies(res.body);
      const moviesShorterThan105 = res.body.filter((movie) => movie.runtime < 105);
      expect(moviesShorterThan105.length).toBeGreaterThan(0);
      const genres = ['Animation', 'Comedy', 'Thriller'];
      expectMoviesToHaveSpecifiedGenres(res.body, genres);
      expectMoviesInOrderOfNumberOfGenreMatches(res.body, genres);
    });
});

it('/movies GET - should return movies with duration=120 and genres=Animation,Comedy,Thriller', () => {
  return request(url).get('/movies?genres=Animation,Comedy,Thriller&duration=120')
    .expect(200)
    .expect('Content-Type', /json/)
    .expect((res) => {
      expectListOfMovies(res.body);
      expectRuntimesInBounds(res.body, 110, 130);
      const genres = ['Animation', 'Comedy', 'Thriller'];
      expectMoviesToHaveSpecifiedGenres(res.body, genres);
      expectMoviesInOrderOfNumberOfGenreMatches(res.body, genres);
    });
});