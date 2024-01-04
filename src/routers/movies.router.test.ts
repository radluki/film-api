import express from 'express';
import { createMoviesRouter } from './movies.router';
import { IMovieService } from '../services/movie.service';
import request from 'supertest';

const movieServiceMock = {
  getMovies: jest.fn(),
  createMovie: jest.fn(),
  getGenres: jest.fn(),
};

jest.mock('../config', () => ({
  GENRES: ['genre1', 'genre2'],
  DBPATH: 'dbpath',
}));
  
const app = express();
app.use(express.json());
app.use('/', createMoviesRouter(<IMovieService>movieServiceMock));

const serviceResult = ['xd'];

beforeEach(() => {
  jest.clearAllMocks();
  movieServiceMock.getMovies.mockReturnValueOnce(serviceResult);
});

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
  const query = { genres: ['genre1'] };
  return request(app).get('/').query(query).expect(200).expect((res) => {
    expect(res.body).toEqual(serviceResult);
    expect(movieServiceMock.getMovies).toHaveBeenCalledWith(NaN, query.genres);
  });
});