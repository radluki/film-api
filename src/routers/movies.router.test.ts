import express from 'express';
import { createMoviesRouter } from './movies.router';
import { IMovieService, MovieCreationResult } from '../services/movie.service';
import request from 'supertest';
import { Movie } from '../models/db.types';

const movieServiceMock = {
  getMovies: jest.fn(),
  createMovie: jest.fn(),
  getGenres: jest.fn(),
};

const GENRE1 = 'genre1';
const GENRE2 = 'genre2';
const GENRE3 = 'genre3';
const GENRE4 = 'genre4';
const GENRE_INVALID = 'genre_invalid';

const movie: Movie = {
  title: "Fake Title",
  year: 1988,
  runtime: 1000,
  genres: [
    GENRE1,
    GENRE2
  ],
  director: "Tim Burton",
  posterUrl: "https://dummy.jpg",
};

jest.mock('../config', () => ({
  GENRES: ['genre1', 'genre2', 'genre3', 'genre4'],
  DBPATH: 'dbpath',
}));

const app = express();
app.use('/', createMoviesRouter(<IMovieService>movieServiceMock));

const serviceResult = ['xd'];

beforeEach(() => {
  jest.clearAllMocks();
  movieServiceMock.getMovies.mockReturnValueOnce(serviceResult);
});

describe('movies router GET /', () => {
  it('should respond with service result', () => {
    return request(app).get('/').expect(200).expect(serviceResult);
  });

  it('should call service with query params', () => {
    const query = { duration: 10, genres: ['genre1'] };
    return request(app).get('/').query(query).expect(200).expect((res) => {
      expect(res.body).toEqual(serviceResult);
      expect(movieServiceMock.getMovies).toHaveBeenCalledWith(query.duration, query.genres);
    });
  });

  it('should call service with duration', () => {
    const query = { duration: 10 };
    return request(app).get('/').query(query).expect(200).expect((res) => {
      expect(res.body).toEqual(serviceResult);
      expect(movieServiceMock.getMovies).toHaveBeenCalledWith(query.duration, undefined);
    });
  });

  it('should call service with genres', () => {
    const query = { genres: [GENRE1, GENRE2] };
    return request(app).get('/').query(query).expect(200).expect((res) => {
      expect(res.body).toEqual(serviceResult);
      expect(movieServiceMock.getMovies).toHaveBeenCalledWith(NaN, query.genres);
    });
  });

  it('should accept genres as comma separated string', () => {
    const genres = [GENRE1, GENRE2];
    return request(app).get(`/?genres=${GENRE1},${GENRE2}`).expect(200).expect((res) => {
      expect(res.body).toEqual(serviceResult);
      expect(movieServiceMock.getMovies).toHaveBeenCalledWith(NaN, genres);
    });
  });

  it('should accept genres as repeated genres=...', () => {
    const genres = [GENRE1, GENRE2];
    return request(app).get(`/?genres=${GENRE1}&genres=${GENRE2}`).expect(200).expect((res) => {
      expect(res.body).toEqual(serviceResult);
      expect(movieServiceMock.getMovies).toHaveBeenCalledWith(NaN, genres);
    });
  });

  it('should accept genres when both formats used in a query', () => {
    const genres = [GENRE1, GENRE2, GENRE3];
    return request(app).get(`/?genres=${GENRE1},${GENRE2}&genres=${GENRE3}`).expect(200).expect((res) => {
      expect(res.body).toEqual(serviceResult);
      expect(movieServiceMock.getMovies).toHaveBeenCalledWith(NaN, genres);
    });
  });

  it('invalid genre should cause bad request', () => {
    const query = { genres: [GENRE1, GENRE_INVALID, GENRE2] };
    return request(app).get('/').query(query).expect(400).expect((res) => {
      expect(res.body.errors).toEqual([`Invalid genres: ${GENRE_INVALID}`]);
      expect(movieServiceMock.getMovies).not.toHaveBeenCalled();
    });
  });

  it('nonnumeric duration should cause bad request', () => {
    const query = { duration: '10x' };
    return request(app).get('/').query(query).expect(400).expect((res) => {
      expect(res.body.errors).toEqual(['Duration must be a number']);
      expect(movieServiceMock.getMovies).not.toHaveBeenCalled();
    });
  });
});


describe('movies router POST /', () => {
  it('should call service with body', () => {
    const id = 44;
    const message = 'Movie created - fake';
    const msg = { id, message };
    const status = 201;
    const successCreateResult = new MovieCreationResult(status, msg);
    movieServiceMock.createMovie.mockReturnValueOnce(successCreateResult);
    return request(app).post('/').send(movie).expect(status).expect((res) => {
      expect(res.body).toEqual(msg);
      expect(movieServiceMock.createMovie).toHaveBeenCalledWith(movie);
    });
  });

  it('should forward errors from service', () => {
    const error = 'error - fake';
    const msg = { error };
    const status = 409;
    const successCreateResult = new MovieCreationResult(status, msg);
    movieServiceMock.createMovie.mockReturnValueOnce(successCreateResult);
    return request(app).post('/').send(movie).expect(status).expect((res) => {
      expect(res.body).toEqual(msg);
      expect(movieServiceMock.createMovie).toHaveBeenCalledWith(movie);
    });
  });

  it('should block movie with an invalid field', () => {
    const invalidMovie = { ...movie, invalidField: 'invalid' };
    const errors = ['Unknown fields: invalidField'];
    return request(app).post('/').send(invalidMovie).expect(400).expect((res) => {
      expect(res.body).toEqual({ errors });
      expect(movieServiceMock.createMovie).not.toHaveBeenCalled();
    });
  });
});