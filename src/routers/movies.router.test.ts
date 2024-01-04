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

it('dummy', () => {
  expect(1).toBe(1);
});