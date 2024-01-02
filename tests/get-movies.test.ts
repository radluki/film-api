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
      expectListOfMovies(res.body);
      expectRuntimesInBounds(res.body, 90, 110);
    });
});

function expectAtLeastOneMovieWithoutGenre(movies: any[], genreX: string) {
  const moviesWithoutGenreX = movies.filter((movie) => !movie.genres.includes(genreX));
  expect(moviesWithoutGenreX.length).toBeGreaterThan(0);
}

it('/movies GET - should return a random movie with duration=115', () => {
  return request(url).get('/movies?duration=115')
    .expect(200)
    .expect('Content-Type', /json/)
    .expect((res) => {
      expectListOfMovies(res.body);
      expectRuntimesInBounds(res.body, 105, 125);
      expectAtLeastOneMovieWithoutGenre(res.body, 'Animation');
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

it('/movies GET - should return movies with genres=Animation,Comedy', () => {
  return request(url).get('/movies?genres=Animation,Comedy')
    .expect(200)
    .expect('Content-Type', /json/)
    .expect((res) => {
      expectListOfMovies(res.body);
      const moviesShorterThan105 = res.body.filter((movie) => movie.runtime < 105);
      expect(moviesShorterThan105.length).toBeGreaterThan(0);
      expectMoviesToHaveSpecifiedGenres(res.body, ['Animation', 'Comedy']);
    });
});